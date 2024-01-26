import { getContract, getAddress, formatEther, parseEther } from "viem";
import { univ2Pool_abi } from "../../abi/pool/univ2pool";
import { MulticallHelper } from "../../toolHelpers/multicallHelper";
import { v2FactoryAddressMap } from "../../constants/factory";
import { v2_factory_abi } from "../../abi/factory/univ2Factory";
import { WETH } from "../../constants/tokenAddress";
import { _2_POW_96, customMaxInteger } from "./constants";
import { checkIfWETH } from "../../utils";
import { Basic2AssetEdge } from "../../types/sqliteEdges";
import { erc20_abi } from "../../abi/erc20";

// The class is to calculate the TVL of a pool, quoted in ETH
export class ETHTVLCaculator {
    tokenPriceX96Map: Map<string, bigint> = new Map<string, bigint>();
    chainStateHelper: MulticallHelper;

    constructor(multicallHelper: MulticallHelper) {
        this.chainStateHelper = multicallHelper;
    }

    private retrieveTokenPriceFromLocal(tokenAddress: string) {
        return this.tokenPriceX96Map.get(tokenAddress);
    }

    public async getTokenPrice(
        tokenAddress: string
    ): Promise<bigint | undefined> {
        if (this.tokenPriceX96Map.has(tokenAddress)) {
            let price = this.tokenPriceX96Map.get(tokenAddress)!;
            return price;
        } else {
            // Calculate Price from Uniswap V2
            try {
                let factoryContract = getContract({
                    address: getAddress(v2FactoryAddressMap.UniswapV2),
                    abi: v2_factory_abi,
                    publicClient: this.chainStateHelper.publicClient,
                });
                // find the pool string·
                let address = await factoryContract.read.getPair([
                    getAddress(tokenAddress),
                    getAddress(WETH),
                ]);

                if (address == "0x0000000000000000000000000000000000000000") {
                    return undefined;
                }
                // console.log("poolAddress", address);

                let wethPosition = 1;
                // console.log(tokenAddress, WETH);
                if (tokenAddress > WETH.toLowerCase()) {
                    wethPosition = 0;
                }

                // console.log("wethPosition", wethPosition);

                //get Reserves
                let poolContract = getContract({
                    address: address,
                    abi: univ2Pool_abi,
                    publicClient: this.chainStateHelper.publicClient,
                });

                let reserves = await poolContract.read.getReserves();

                let reserveIn = reserves[0];
                let reserveOut = reserves[1];
                if (wethPosition == 0) {
                    reserveIn = reserves[1];
                    reserveOut = reserves[0];
                }

                let priceX96 = this.getTokenPriceGivenAmountOut(
                    parseEther("10", "wei"),
                    reserveIn,
                    reserveOut
                );
                this.tokenPriceX96Map.set(tokenAddress, priceX96);
                return priceX96;
            } catch (error) {
                return undefined;
            }
        }
    }

    private getTokenPriceGivenAmountOut(
        amountOut: bigint,
        reserveIn: bigint,
        reserveOut: bigint
    ): bigint {
        // console.log("amountOUt", amountOut);
        // console.log("reserveOut", reserveOut);

        if (amountOut > reserveOut) {
            // If amountOut is greater than reserveOut, consider the price as very large
            return _2_POW_96 * customMaxInteger; // You can use a larger value if needed
        } else {
            // Calculate price using amountIn / amountOut
            let amountIn =
                (reserveIn * reserveOut) / (reserveOut - amountOut) - reserveIn;
            return (_2_POW_96 * amountIn) / amountOut;
        }
    }

    // require token0 == WETH || token1 == WETH
    public async calculateWETHPoolTVL(edges: Basic2AssetEdge[]) {
        let batch = 1000;
        let tvlMap: Map<string, bigint> = new Map<string, bigint>();
        for (let i = 0; i < edges.length; i += batch) {
            console.log(`${i}/${edges.length}`);
            let end = edges.length > i + batch ? i + batch : edges.length;
            let callList: any[] = [];
            let subedges = edges.slice(i, end);
            const WETHContract = {
                address: getAddress(WETH),
                abi: erc20_abi,
            } as const;
            subedges.forEach((edge) => {
                callList.push({
                    ...WETHContract,
                    functionName: "balanceOf",
                    args: [edge.pairAddress],
                });
            });
            let res = await this.chainStateHelper.publicClient.multicall({
                contracts: callList,
            });

            for (let [index, value] of res.entries()) {
                if (value.status) {
                    let pairAddress = subedges[index].pairAddress;
                    let TVL = BigInt(value.result as bigint);
                    tvlMap.set(pairAddress, TVL);
                }
            }
        }
        return tvlMap;
    }

    public async calculateTwoTokenPoolTVLNoCache(
        pool: string,
        token0: string,
        token1: string
    ) {
        let token0Flag = checkIfWETH(token0);
        let token1Flag = checkIfWETH(token1);

        if (token0Flag || token1Flag) {
            if (token0Flag) {
                let balance = await this.chainStateHelper.getTokenReserve(
                    pool,
                    token0
                );
                let TVL = BigInt(2) * balance;
                return TVL;
            } else if (token1Flag) {
                let balance = await this.chainStateHelper.getTokenReserve(
                    pool,
                    token1
                );
                let TVL = BigInt(2) * balance;
                return TVL;
            }
        } else {
            //考虑 token0
            let price0 = await this.getTokenPrice(token0);
            if (price0) {
                let balance = await this.chainStateHelper.getTokenReserve(
                    pool,
                    token0
                );
                let TVL = (BigInt(2) * _2_POW_96 * balance) / price0;
                return TVL;
            } else {
                return undefined;
            }
        }
    }

    public async calculateTwoTokenPoolTVLWithCache(
        pool: string,
        token0: string,
        token1: string
    ) {
        let token0Flag = checkIfWETH(token0);
        let token1Flag = checkIfWETH(token1);

        if (token0Flag || token1Flag) {
            if (token0Flag) {
                let balance = await this.chainStateHelper.getTokenReserve(
                    pool,
                    token0
                );
                let TVL = BigInt(2) * balance;
                return TVL;
            } else if (token1Flag) {
                let balance = await this.chainStateHelper.getTokenReserve(
                    pool,
                    token1
                );
                let TVL = BigInt(2) * balance;
                return TVL;
            }
        } else {
            // 优先考虑有价格缓存的
            let price0Cache = this.retrieveTokenPriceFromLocal(token0);
            if (price0Cache) {
                let balance = await this.chainStateHelper.getTokenReserve(
                    pool,
                    token0
                );
                let TVL = (BigInt(2) * _2_POW_96 * balance) / price0Cache;
                return TVL;
            }
            let price1Cache = this.retrieveTokenPriceFromLocal(token1);
            if (price1Cache) {
                let balance = await this.chainStateHelper.getTokenReserve(
                    pool,
                    token1
                );
                let TVL = (BigInt(2) * _2_POW_96 * balance) / price1Cache;
                return TVL;
            }

            //考虑 token0
            let price0 = await this.getTokenPrice(token0);
            // console.log("price", price0);
            if (price0) {
                let balance = await this.chainStateHelper.getTokenReserve(
                    pool,
                    token0
                );
                let TVL = (BigInt(2) * _2_POW_96 * balance) / price0;
                return TVL;
            }

            //考虑 token0
            let price1 = await this.getTokenPrice(token1);
            // console.log("price", price1);

            if (price1) {
                let balance = await this.chainStateHelper.getTokenReserve(
                    pool,
                    token0
                );
                let TVL = (BigInt(2) * _2_POW_96 * balance) / price1;

                return TVL;
            }
            return undefined;
        }
    }
}
