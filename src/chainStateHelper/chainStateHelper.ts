import { PublicClient, createPublicClient, getContract, http, Address, getAddress } from "viem"
import { mainnet } from 'viem/chains'
import {
    DocumentType,
    ProtocolName,
    PoolType,
    Token,
    DEX_EXCHANGE,
    CreatedMethod,
    UniswapV2LikePoolDocument
} from "../types"
import { uniV2PoolABI, uniV3PoolABI, balancerVaultABI, erc20ABI } from "../abi"
import { getExchangeAndPoolType } from "../utils";


export class ChainStateHelper {
    publicClient: PublicClient;

    // 缓存一些Token的数据，不用每次都到链上获取了
    tokenInfoMap: Map<Address, Token> = new Map<Address, Token>

    constructor(nodeURL: string) {
        this.publicClient = createPublicClient({
            chain: mainnet,
            transport: http(nodeURL)
        })
    }

    public addTokenInfo(address: Address, token: Token) {
        if (this.tokenInfoMap.has(address)) {
            return 
        } else {
            this.tokenInfoMap.set(address, token)
        }
    }

    //address: V2 Pool Address
    public async getV2PoolInfo(address: Address, protocol: ProtocolName): Promise<UniswapV2LikePoolDocument | undefined> {
        try {
            const v2PoolContract = getContract({
                address: address,
                abi: uniV2PoolABI,
            })
            let contracts: any[] = [
                {
                    ...v2PoolContract,
                    functionName: 'token0',
                },
                {
                    ...v2PoolContract,
                    functionName: 'token1',
                },
            ]
            let infoList = await this.publicClient.multicall({
                contracts: contracts
            });
            if ((!infoList[0].status) || (!infoList[1].status)) {
                throw new Error('Fail to get pool token address');
            }
            let token0Address = getAddress(infoList[0].result as string);
            let token1Address = getAddress(infoList[1].result as string);
            let token0 = await this.getToken(token0Address);
            let token1 = await this.getToken(token1Address);
            if (!token0 || !token1) {
                throw new Error('Fail to get pool info');
            }

            let { exchange, poolType } = getExchangeAndPoolType(protocol);

            let document: UniswapV2LikePoolDocument = {
                poolAddress: address,
                token0: token0,
                token1: token1,
                createdMethod: CreatedMethod.FACTORY,
                dexExchange: exchange,
                poolType: poolType,
                protocolName: protocol,
                documentType: DocumentType.POOL
            }
        } catch (error) {

            return undefined
        }
    }

    public async getToken(address: Address): Promise<Token | undefined> {
        let token = this.tokenInfoMap.get(address)
        if (token) {
            return token
        } else {
            let tokenFromChain = await this.getTokenFromChain(address);
            if (tokenFromChain) {
                this.tokenInfoMap.set(address, tokenFromChain)
                return tokenFromChain
            }
        }
        return undefined
    }

    public async getTokenFromChain(address: Address): Promise<Token | undefined> {
        try {
            const tokenContract = getContract({
                address: address,
                abi: erc20ABI,
            })
            let contracts: any[] = [
                {
                    ...tokenContract,
                    functionName: 'decimals',
                },
                {
                    ...tokenContract,
                    functionName: 'name',
                },
                {
                    ...tokenContract,
                    functionName: 'symbol'
                }
            ]
            let infoList = await this.publicClient.multicall({
                contracts: contracts
            });
            let decimals = 0;
            let name = "";
            let symbol = "";
            for (let i = 0; i < infoList.length; i++) {
                let res = infoList[i];
                if (i == 0 && !res.status) {
                    throw new Error('Fail to get token decimals');
                } else if (i != 0 && res.status) {
                    decimals = Number(res.result as bigint)
                } else if (i == 1) {
                    if (res.status) {
                        name = res.result as string
                    }
                } else if (i == 2) {
                    symbol = res.result as string
                }
            }
            return {
                address,
                name,
                decimals,
                symbol
            } as Token

        } catch (error) {
            return undefined
        }
    }

}