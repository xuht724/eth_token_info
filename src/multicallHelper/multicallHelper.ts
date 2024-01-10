import {
    PublicClient,
    http,
    createPublicClient,
    getContract,
    getAddress,
} from "viem";
import { mainnet } from "viem/chains";
import { v2_factory_abi } from "../abi/factory/univ2Factory";
import { erc20_abi } from "../abi/erc20";
import { univ2Pool_abi } from "../abi/pool/univ2pool";
import { ProtocolName, v2Edge } from "../types";

export class MulticallHelper {
    publicClient: PublicClient;

    constructor(HTTP_NODE_URL: string) {
        this.publicClient = createPublicClient({
            chain: mainnet,
            transport: http(HTTP_NODE_URL),
        });
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
}
