import {
    PublicClient,
    http,
    createPublicClient,
    getContract,
    getAddress,
} from "viem";
import { mainnet } from "viem/chains";
import { v2_factory_abi } from "../../abi/factory/univ2Factory";
import { erc20_abi } from "../../abi/erc20";
import { univ2Pool_abi } from "../../abi/pool/univ2pool";
import { uniV3Pool_abi } from "../../abi/pool/univ3pool";
import { PoolType, ProtocolName, v2Edge } from "../../types";
import { balancerWeightedPoolABI } from "../../abi/pool/balancerWeightedPool";
import { balancerWeightedPool } from "../../types/sqliteEdges";
import { balancerVaultAddress } from "../../constants/factory";
import { balancerVault_abi } from "../../abi/pool/balancervault";
import {
    CurveCryptoSwapPoolDocument,
    CurveStableSwapPoolDocument,
} from "../../types/mongoPools";
import { curveStableSwapPoolABI } from "../../abi/pool/curve/curveStableSwapPool";
import { Token } from "../../types";

export class MulticallHelper {
    publicClient: PublicClient;

    constructor(HTTP_NODE_URL: string) {
        this.publicClient = createPublicClient({
            chain: mainnet,
            transport: http(HTTP_NODE_URL),
        });
    }

    public async callToken(address: string): Promise<Token | undefined> {
        try {
            let tokenContract = {
                address: address,
                abi: erc20_abi,
            } as const;
            let callList = [
                {
                    ...tokenContract,
                    functionName: "decimals",
                },
                {
                    ...tokenContract,
                    functionName: "name",
                },
                {
                    ...tokenContract,
                    functionName: "symbol",
                },
            ] as any[];
            let tokenInfoRes = await this.publicClient.multicall({
                contracts: callList,
            });
            if (tokenInfoRes[0].status == "failure") {
                throw new Error("Error to get token ");
            }
            let decimals = tokenInfoRes[0].result as number;
            let name =
                tokenInfoRes[1].status == "success"
                    ? (tokenInfoRes[1].result! as string)
                    : undefined;
            let symbol =
                tokenInfoRes[1].status == "success"
                    ? (tokenInfoRes[1].result! as string)
                    : undefined;
            return {
                address: address.toLowerCase(),
                decimals,
                name,
                symbol,
            } as Token;
        } catch (error) {}
    }

    public async callTokensInfo(
        addressList: string[]
    ): Promise<Token[] | undefined> {
        let tokens: Token[] = [];
        try {
            let callList: any[] = [];
            for (const [index, address] of addressList.entries()) {
                let tokenContract = {
                    address: address,
                    abi: erc20_abi,
                } as const;
                callList.push(
                    ...[
                        {
                            ...tokenContract,
                            functionName: "decimals",
                        },
                        {
                            ...tokenContract,
                            functionName: "name",
                        },
                        {
                            ...tokenContract,
                            functionName: "symbol",
                        },
                    ]
                );
            }
            let res = await this.publicClient.multicall({
                contracts: callList,
            });
            for (let i = 0; i < addressList.length; i++) {
                let address = addressList[i];
                let tokenInfoRes = res.slice(3 * i, 3 * i + 3);

                if (tokenInfoRes[0].status == "failure") {
                    throw new Error("Error to get token ");
                }
                let decimals = tokenInfoRes[0].result as number;
                let name =
                    tokenInfoRes[1].status == "success"
                        ? (tokenInfoRes[1].result! as string)
                        : undefined;
                let symbol =
                    tokenInfoRes[1].status == "success"
                        ? (tokenInfoRes[1].result! as string)
                        : undefined;
                tokens.push({
                    address: address.toLowerCase(),
                    decimals,
                    name,
                    symbol,
                } as Token);
            }
            return tokens;
        } catch (error) {
            return undefined;
        }
    }

    public async getTokenReserve(address: string, token: string) {
        try {
            let contract = getContract({
                address: getAddress(token),
                abi: erc20_abi,
                publicClient: this.publicClient,
            });
            let balance = await contract.read.balanceOf([getAddress(address)]);
            return balance;
        } catch (error) {
            console.log("Get Token Price Error");
            return BigInt(0);
        }
    }

    public async multicallV2PoolAddress(
        v2Factory: string,
        startIndex: number,
        endIndex: number
    ): Promise<Map<number, string>> {
        let callList: any[] = [];
        const v2FactoryContract = {
            address: v2Factory,
            abi: v2_factory_abi,
        } as const;
        for (let i = startIndex; i < endIndex; i++) {
            callList.push({
                ...v2FactoryContract,
                functionName: "allPairs",
                args: [i],
            });
        }
        let results = await this.publicClient.multicall({
            contracts: callList,
        });
        let res = new Map<number, string>();
        for (const [index, result] of results.entries()) {
            if (result.status) {
                res.set(index, result.result! as string);
            }
        }
        return res;
    }

    public async multicallV2PoolInfo(
        callIndex: number,
        protocol: ProtocolName,
        v2Pool: string
    ): Promise<v2Edge | undefined> {
        const v2PoolContract = {
            address: v2Pool,
            abi: univ2Pool_abi,
        } as const;
        let contracts: any[] = [
            {
                ...v2PoolContract,
                functionName: "token0",
            },
            {
                ...v2PoolContract,
                functionName: "token1",
            },
        ];
        let result = await this.publicClient.multicall({
            contracts: contracts,
        });
        if (result[0].status && result[1].status) {
            let token0Address = result[0].result;
            let token1Address = result[1].result;
            if (token0Address && token1Address) {
                let edge: v2Edge = {
                    protocolName: protocol,
                    pairAddress: v2Pool,
                    token0: result[0].result as string,
                    token1: result[1].result as string,
                    index: callIndex + 1,
                };
                return edge;
            }
        } else {
            return undefined;
        }
    }

    public async batchGetV2EdgeBlockTimestamp(v2Pools: any[]): Promise<Map<string, number>> {
        let res = new Map<string, number>();
        const batchSize = 2000;

        for (let i = 0; i < v2Pools.length; i += batchSize) {
            const batch = v2Pools.slice(i, i + batchSize);
            let contracts: any[] = [];

            for (const v2Pool of batch) {
                const v2PoolContract = {
                    address: v2Pool.address,
                    abi: univ2Pool_abi,
                } as const;
                contracts.push({
                    ...v2PoolContract,
                    functionName: "getReserves"
                });
            }

            try {
                const data = await this.publicClient.multicall({
                    contracts: contracts,
                });
                data.forEach((result: any, index) => {
                    const v2Edge = batch[index].address;
                    if (result !== null && result !== undefined && result.status) {
                        const blockTimestampLast = result.result[2];
                        res.set(v2Edge, blockTimestampLast);
                    }
                });
            } catch (error) {
                throw error;
            }
        }
        return res;
    }

    public async batchGetV3EdgeBlockTimestamp(v3Pools: string[]): Promise<Map<string, number>> {
        let res = new Map<string, number>();
        const batchSize = 2000;

        let slotdatas = [];
        for (let i = 0; i < v3Pools.length; i += batchSize) {
            const batch = v3Pools.slice(i, i + batchSize);
            let contracts: any[] = [];

            for (const v3PoolAddress of batch) {
                const v3PoolContract = {
                    address: v3PoolAddress,
                    abi: uniV3Pool_abi,
                } as const;
                contracts.push({
                    ...v3PoolContract,
                    functionName: "slot0"
                });
            }

            try {
                const slotdata = await this.publicClient.multicall({
                    contracts: contracts,
                });
                slotdatas.push(slotdata.values());
            } catch (error) {
                throw error;
            }
        }
        for (let i = 0; i < v3Pools.length; i += batchSize) {
            const slotdata = slotdatas.slice(i, i + batchSize);
            const batch = v3Pools.slice(i, i + batchSize);
            let observations: any[] = [];

            let v3EdgeList: string[] = []
            slotdata.forEach((result: any, index) => {
                const v3Edge = batch[index];
                if (result !== null && result !== undefined && result.status) {
                    v3EdgeList.push(v3Edge);
                    const observationIndex = result.result[2];
                    const v3PoolContract = {
                        address: v3Edge,
                        abi: uniV3Pool_abi,
                    } as const;
                    observations.push({
                        ...v3PoolContract,
                        functionName: "observations",
                        args: [observationIndex]
                    });
                }
            });
            try{
                const observationData = await this.publicClient.multicall({
                    contracts: observations,
                });

                observationData.forEach((result: any, index) => {
                    const v3Edge = v3EdgeList[index];
                    if (result !== null && result !== undefined && result.status) {
                        const blockTimestamp = result.result[0];
                        res.set(v3Edge, blockTimestamp);
                    }
                })
            } catch (error) {
                throw error;
            }
        }
        return res;
    }

    public async MulticallCurveStablSwapDocument(
        poolAddress: string
    ): Promise<CurveStableSwapPoolDocument | undefined> {
        // 首先确定 poolAddress 的tokens num
        try {
            let coinsAddressList: string[] = [];
            const poolContract = {
                address: poolAddress,
                abi: curveStableSwapPoolABI,
            } as const;
            let coinsNum = 0;
            while (true) {
                let res = await this.publicClient.multicall({
                    contracts: [
                        {
                            ...poolContract,
                            functionName: "coins",
                            args: [coinsNum],
                        },
                    ] as any,
                });
                if (res[0].status == "success") {
                    coinsNum += 1;
                    let address = res[0].result as string;
                    coinsAddressList.push(address);
                    console.log(address);
                } else {
                    break;
                }
            }
            let tokens = await Promise.all(
                coinsAddressList.map(async (address) => {
                    if (
                        address == "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE"
                    ) {
                        return {
                            address:
                                "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
                            decimals: 18,
                            name: "ETH",
                            symbol: "ETH",
                        };
                    } else {
                        let token = await this.callToken(address);
                        if (token) {
                            return token;
                        }
                    }
                })
            );

            let finalTokens = tokens
                .filter((info): info is Token => info !== undefined)
                .map((info) => info as Token);

            if (tokens) {
                let res = await this.publicClient.multicall({
                    contracts: [
                        {
                            ...poolContract,
                            functionName: "A",
                            args: [],
                        },
                    ] as any,
                });
                if (res[0].status == "success") {
                    let curveStableSwapPoolDocument: CurveStableSwapPoolDocument =
                        {
                            protocolName: ProtocolName.Curve,
                            poolAddress: poolAddress.toLowerCase(),
                            poolType: PoolType.CURVE_STABLE_SWAP_POOL,
                            coins: finalTokens,
                            A: res[0].result as bigint,
                            rates: [],
                            swapFee: 0n,
                            swapFeeMultiplier: null,
                            adminFee: 0n,
                        };
                    return curveStableSwapPoolDocument;
                }
            }
        } catch (error) {
            return undefined;
        }
    }

    public async MulticallCurveCryptoSwapDocument(
        poolAddress: string
    ): Promise<CurveCryptoSwapPoolDocument | undefined> {
        return undefined;
    }

    public async MulticallBalancerInitialInfo(
        poolAddress: string
    ): Promise<balancerWeightedPool | undefined> {
        const poolContract = {
            address: poolAddress,
            abi: balancerWeightedPoolABI,
        } as const;
        const vaultContract = {
            address: balancerVaultAddress,
            abi: balancerVault_abi,
        } as const;
        const contracts: any[] = [
            {
                ...poolContract,
                functionName: "getPoolId",
            },
            {
                ...poolContract,
                functionName: "getNormalizedWeights",
            },
            {
                ...poolContract,
                functionName: "getSwapFeePercentage",
            },
        ];
        let [poolIdInfo, weightsInfo, swapFeeInfo] =
            await this.publicClient.multicall({
                contracts: contracts,
            });
        let poolId = "";
        let weights: bigint[] = [];
        let tokens: string[] = [];
        let swapFee = 0n;
        try {
            if (poolIdInfo.status && weightsInfo.status && swapFeeInfo.status) {
                poolId = poolIdInfo.result as string;
                weights = weightsInfo.result as bigint[];
                swapFee = swapFeeInfo.result as bigint;
            } else {
                throw new Error("fail to get balancer info");
            }
            let [tokensInfo] = await this.publicClient.multicall({
                contracts: [
                    {
                        ...vaultContract,
                        functionName: "getPoolTokens",
                        args: [poolId],
                    },
                ] as any[],
            });
            if (tokensInfo.status) {
                tokens = (tokensInfo.result as any)[0] as string[];
            } else {
                throw new Error("fail to get balancer info");
            }

            let res: balancerWeightedPool = {
                protocolName: ProtocolName.Balancer,
                poolAddress: poolAddress.toLowerCase(),
                poolId: poolId,
                tokens,
                weights,
                swapFee: swapFee,
            };
            return res;
        } catch (error) {
            console.log("get balancer info failed");
            return undefined;
        }
    }
}
