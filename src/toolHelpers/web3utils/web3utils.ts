import { Web3, HttpProvider, TransactionReceipt, DecodedParams, Contract, EventLog } from "web3";
import axios from "axios";
import { ProtocolName, Token, protocol, v2Edge } from "../../types";
import { LRUCache } from "lru-cache";
import { univ2Pool_abi } from "../../abi/pool/univ2pool";
import winston from "winston";

import { web3Logger } from "../../logger";
import { v2SwapHash } from "../../constants/eventHash";
import { decodeEventLog, toHex } from "viem";
import { erc20_abi } from "../../abi/erc20";
import { pack, keccak256 } from '@ethersproject/solidity'
import { getCreate2Address } from '@ethersproject/address'


const V2FACTORY = '0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f';
const INIT_CODE_HASH = '0x96e8ac4277198ff8b6f785478aa9a39f403cb768dd02cbee326c3e7da348845f';

export class Web3Utils {
    myWeb3: Web3;
    node_url: string;
    Logger: winston.Logger;
    private tokenInfoCache = new LRUCache<string, Token>({ max: 1000 });
    private tokenTaxMap: Map<string, number> = new Map<string, number>();

    // 确保数据库中存储的tax是整数
    private taxFactor = 1000
    constructor(node_url: string) {
        this.node_url = node_url;
        this.myWeb3 = new Web3(new HttpProvider(node_url));
        this.Logger = web3Logger;
    }

    public async calculateBuyTax_by_V2Pool(
        tokenAddress: string,
        currentBlock?: number
    ) {
        const V2FACTORY = '0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f';
        const INIT_CODE_HASH = '0x96e8ac4277198ff8b6f785478aa9a39f403cb768dd02cbee326c3e7da348845f';
        const WETH = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2';
        const TransferSignature = "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef";

        let token0 = tokenAddress;
        let token1 = WETH;
        if (WETH < tokenAddress) {
            token0 = WETH;
            token1 = tokenAddress;
        }

        if (!currentBlock) {
            try {
                currentBlock = Number(await this.myWeb3.eth.getBlockNumber())
            } catch (error) {
                currentBlock = 0
            }
        }

        let pair = getCreate2Address(
            V2FACTORY,
            keccak256(['bytes'], [pack(['address', 'address'], [token0, token1])]),
            INIT_CODE_HASH
        )

        let buyTax = 0;

        let batchSize = 1000;
        let traceUpper = 10000;

        let contract = new this.myWeb3.eth.Contract(univ2Pool_abi, pair);

        for (let blockNumber = currentBlock; blockNumber > currentBlock - traceUpper; blockNumber -= batchSize) {
            let events = await contract.getPastEvents(
                'Swap',
                {
                    fromBlock: blockNumber - batchSize,
                    toBlock: blockNumber
                }
            )
            if (events.length > 0) {
                let event = events[0] as EventLog;

                let trxHash = event.transactionHash;

                let swapRes = (event as any).returnValues
                let swap_to = swapRes.to;
                let swap_amount = swapRes.amount0Out
                let isZeroForOne = (swapRes.amount0Out - swapRes.amount0In) > 0n ? false : true
                if (isZeroForOne) {
                    swap_amount = swapRes.amount1Out
                }

                if (trxHash) {
                    let receipt = await this.myWeb3.eth.getTransactionReceipt(trxHash);
                    for (const log of receipt.logs) {
                        if (log.topics![0] == TransferSignature) {
                            let res = decodeEventLog({
                                abi: [
                                    {
                                        "anonymous": false,
                                        "inputs": [
                                            {
                                                "indexed": true,
                                                "name": "src",
                                                "type": "address"
                                            },
                                            {
                                                "indexed": true,
                                                "name": "dst",
                                                "type": "address"
                                            },
                                            {
                                                "indexed": false,
                                                "name": "wad",
                                                "type": "uint256"
                                            }
                                        ],
                                        "name": "Transfer",
                                        "type": "event"
                                    }
                                ],
                                data: (log as any).data,
                                topics: (log as any).topics,
                                strict: false
                            })
                            let transfer_from = res.args.src!;
                            let transfer_to = res.args.dst;
                            let transfer_value = res.args.wad!;
                            if (transfer_from == pair && transfer_to == swap_to) {
                                if (transfer_value == swap_amount) {
                                    buyTax = 0;
                                    this.tokenTaxMap.set(tokenAddress, buyTax);
                                    return buyTax
                                } else {
                                    buyTax = Number(BigInt(String(swap_amount)) - transfer_value) / Number(swap_amount);
                                    let buy_tax = Math.ceil(this.taxFactor * buyTax)
                                    this.tokenTaxMap.set(tokenAddress, buy_tax);
                                    return buy_tax;
                                }
                            }
                        }
                    }
                }
            }
        }
        return buyTax
    }


    public async calculateTokenBuyTax(
        tokenAddress: string,
        currentBlock?: number
    ) {
        if (this.tokenTaxMap.get(tokenAddress)) {
            return this.tokenTaxMap.get(tokenAddress);
        }

        const tokenContract = new this.myWeb3.eth.Contract(erc20_abi, tokenAddress);
        const traceUpper = 4000;
        const batchSize = 2000;
        let buyTax = 0;
        let transfer_from, transfer_to, transfer_value;
        let buyflag = false;
        if (!currentBlock) {
            try {
                currentBlock = Number(await this.myWeb3.eth.getBlockNumber())
            } catch (error) {
                currentBlock = 0
            }
        }
        for (let blockNumber = currentBlock; blockNumber > currentBlock - traceUpper; blockNumber -= batchSize) {
            const TransferLogs: any[] = await tokenContract.getPastEvents(
                "Transfer", {
                filter: {},
                fromBlock: blockNumber - batchSize,
                toBlock: blockNumber,
            }
            )
            console.log('TrxLogs Length', TransferLogs.length)

            for (let i = 0; i < TransferLogs.length; i++) {
                let log = decodeEventLog({
                    abi: [
                        {
                            "anonymous": false,
                            "inputs": [
                                {
                                    "indexed": true,
                                    "name": "src",
                                    "type": "address"
                                },
                                {
                                    "indexed": true,
                                    "name": "dst",
                                    "type": "address"
                                },
                                {
                                    "indexed": false,
                                    "name": "wad",
                                    "type": "uint256"
                                }
                            ],
                            "name": "Transfer",
                            "type": "event"
                        }
                    ],
                    data: TransferLogs[i].data,
                    topics: TransferLogs[i].topics,
                    strict: false
                })
                transfer_from = log.args.src?.toLowerCase();
                transfer_to = log.args.dst?.toLowerCase();
                transfer_value = log.args.wad ? log.args.wad : 0n;
                // console.log('1', transfer_value)

                // transfer_from = '0x' + TransferLogs[i].topics[1].substring(26);
                // transfer_to = '0x' + TransferLogs[i].topics[2].substring(26);
                // transfer_value = BigInt(TransferLogs[i].data);
                // console.log('2', transfer_value)

                const txReceipt = await this.myWeb3.eth.getTransactionReceipt(TransferLogs[i].transactionHash);
                if (txReceipt.logs.length == 1) {
                    console.log('true');
                    buyflag = true;
                    // console.log(txReceipt);
                    break;
                }

                let log_addresses = [];

                console.log(txReceipt);

                for (let log of txReceipt.logs) {
                    if (log.topics != undefined && log.topics[0] == v2SwapHash) {
                        const swapinfo: DecodedParams = this.myWeb3.eth.abi.decodeLog(
                            [
                                {
                                    "indexed": false,
                                    "internalType": "uint256",
                                    "name": "amount0In",
                                    "type": "uint256"
                                },
                                {
                                    "indexed": false,
                                    "internalType": "uint256",
                                    "name": "amount1In",
                                    "type": "uint256"
                                },
                                {
                                    "indexed": false,
                                    "internalType": "uint256",
                                    "name": "amount0Out",
                                    "type": "uint256"
                                },
                                {
                                    "indexed": false,
                                    "internalType": "uint256",
                                    "name": "amount1Out",
                                    "type": "uint256"
                                }
                            ],
                            String(log.data),
                            log.topics[0]
                        );
                        // buy tax
                        if (log.address == transfer_from && buyTax == 0) {
                            const swap_to = '0x' + String(log.topics[2]).substring(26);
                            if (BigInt(String(swapinfo.amount0Out)) > 0) {
                                if (swapinfo.amount0Out == transfer_value) {
                                    buyflag = true;
                                    break;
                                } else {
                                    if (swap_to == transfer_to) {
                                        buyTax = Number(BigInt(String(swapinfo.amount0Out)) - transfer_value) / Number(swapinfo.amount0Out);
                                        buyflag = true;
                                        break;
                                    }
                                }
                            } else {
                                if (swapinfo.amount1Out == transfer_value) {
                                    buyflag = true;
                                    break;
                                } else {
                                    if (swap_to == transfer_to) {
                                        buyTax = Number(BigInt(String(swapinfo.amount1Out)) - transfer_value) / Number(swapinfo.amount1Out);

                                        buyflag = true;
                                        break;
                                    }
                                }
                            }
                        }
                    }
                    log_addresses.push(log.address);
                }
                if (buyflag) break;
            }
            if (buyflag) break;
        }

        if (buyTax == 0) {
            let taxByV2Pool = await this.calculateBuyTax_by_V2Pool(tokenAddress, currentBlock);
            return taxByV2Pool;
        }
        let buy_tax = Math.ceil(this.taxFactor * buyTax)
        this.tokenTaxMap.set(tokenAddress, buy_tax);
        return buy_tax;
    }

    public async downloadReceipt(trx_hash: string) {
        let receipt = await this.myWeb3.eth.getTransactionReceipt(trx_hash);
        return receipt;
    }
    public async downloadLightBlock(blockNumber: number) {
        let lightBlock = await this.myWeb3.eth.getBlock(blockNumber);
        return lightBlock;
    }

    public async downloadBlockReceipts(blockNumber: number) {
        let light_block = await this.myWeb3.eth.getBlock(blockNumber);
        let reqs = [];
        if (!light_block.transactions) {
            return [];
        }
        for (const [index, trx_hash] of light_block.transactions.entries()) {
            reqs.push({
                method: "eth_getTransactionReceipt",
                params: [trx_hash],
                id: index,
                jsonrpc: "2.0",
            });
        }
        try {
            const response = await axios.post(this.node_url, reqs, {
                headers: { "Content-Type": "application/json" },
            });

            // Handle the response data here
            const data = response.data.map((value: any) => {
                return value.result;
            });
            return data;
        } catch (error) {
            this.Logger.error(error);
            return null;
        }
    }

    public async getV2EdgeInfo(
        protocol: ProtocolName,
        address: string
    ): Promise<v2Edge> {
        const v2poolContract = new this.myWeb3.eth.Contract(
            univ2Pool_abi,
            address
        );
        const pairAddress = address;

        try {
            // Use Promise.all to make both calls concurrently
            const [token0, token1] = await Promise.all([
                v2poolContract.methods.token0().call(),
                v2poolContract.methods.token1().call(),
            ]);
            return {
                protocolName: protocol,
                pairAddress,
                token0,
                token1,
            } as v2Edge;
        } catch (error) {
            this.Logger.error("Error getting v2 Edge:", error);
            // Handle the error or return a default value as needed
            throw error;
        }
    }

    public async getTokenInfo(address: string): Promise<Token | null> {
        // check if in cache
        const cachedTokenInfo = this.tokenInfoCache.get(address);
        if (cachedTokenInfo) {
            return cachedTokenInfo;
        }
        const tokenInfo = await this.fetchTokenInfo(address);
        if (tokenInfo) {
            this.tokenInfoCache.set(address, tokenInfo);
            return tokenInfo;
        }
        return null;
    }

    private async fetchTokenInfo(address: string): Promise<Token | null> {
        let tokenContract = new this.myWeb3.eth.Contract(erc20_abi, address);
        let name = "";
        let symbol = "";
        let decimals = 0;
        let buyTax;
        try {
            name = await tokenContract.methods.name().call();
        } catch (error: any) {
            // console.log("error get ");
            this.Logger.info(`error get token name ${address}`);
        }
        try {
            decimals = Number(await tokenContract.methods.decimals().call());
        } catch (error: any) {
            this.Logger.info(`error get token decimals ${address}`);
            return null;
        }
        try {
            symbol = await tokenContract.methods.symbol().call();
        } catch (error: any) {
            this.Logger.info(`error get token symbol ${address}`);
        }
        try {
            buyTax = await this.calculateTokenBuyTax(address);
        } catch (error) {
            this.Logger.info(`error get token buyTax ${address}`);
        }

        return {
            address,
            name,
            symbol,
            decimals,
            buyTax
        } as Token;
    }
}
