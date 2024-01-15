import { Web3, HttpProvider, TransactionReceipt } from "web3";
import axios from "axios";
import { erc20_abi } from "../../abi/erc20";
import { ProtocolName, Token, protocol, v2Edge } from "../../types";
import { LRUCache } from "lru-cache";
import { univ2Pool_abi } from "../../abi/pool/univ2pool";
import winston from "winston";

import { web3Logger } from "../../logger";

export class Web3Utils {
    myWeb3: Web3;
    node_url: string;
    Logger: winston.Logger;
    private tokenInfoCache = new LRUCache<string, Token>({ max: 1000 });

    constructor(node_url: string) {
        this.node_url = node_url;
        this.myWeb3 = new Web3(new HttpProvider(node_url));
        this.Logger = web3Logger;
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
        return {
            address,
            name,
            symbol,
            decimals,
        } as Token;
    }
}
