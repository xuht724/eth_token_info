import { Log, PublicClient, createPublicClient, webSocket } from "viem";
import { mainnet } from "viem/chains";
import { PoolCreatedABIMap, logTopicsMap } from "../constants/eventHash";
import { FactoryAddressMap } from "../constants/factory";
import { WS_GETH_URL } from "../config";
import { Web3Utils } from "../toolHelpers/web3utils";
import { SqliteHelper } from "../toolHelpers/sqliteHelper";
import { MulticallHelper } from "../toolHelpers/multicallHelper";
import { V2Pool_CreatedEvent, V3Pool_CreatedEvent } from "./types";
import { PoolType, ProtocolName, v2Edge, v3Edge } from "../types";
import { unknownLogger } from "../logger";


export class ViemListener {
    wsClient: PublicClient;
    web3Utils: Web3Utils;
    sqliteHelper: SqliteHelper;
    multicallHelper: MulticallHelper;
    constructor(
        wsNodeUrl: string,
        web3Utils: Web3Utils,
        sqliteHelper: SqliteHelper,
        multicallHelper: MulticallHelper
    ) {
        this.wsClient = createPublicClient({
            chain: mainnet,
            transport: webSocket(wsNodeUrl)
        })
        this.multicallHelper = multicallHelper;
        this.web3Utils = web3Utils;
        this.sqliteHelper = sqliteHelper;


    }

    public init() {
        this.watchEvents();
        console.log('Begin to new pool created events');
    }

    private watchEvents() {
        this.wsClient.watchBlockNumber({
            onBlockNumber: async (blockNumber) => {
                console.log('Receive BlockNumber', blockNumber);
                const logs = await this.wsClient.getLogs({
                    events: [
                        PoolCreatedABIMap.UniV2Pool_PoolCreated,
                        PoolCreatedABIMap.UniV3Pool_PoolCreated
                    ],
                    fromBlock: blockNumber,
                    toBlock: blockNumber
                })
                if (logs.length > 0) {
                    await this.handlePoolCreatedLogs(logs);
                }
            }
        })
    }

    private async handlePoolCreatedLogs(logs: Log[]) {
        for (const log of logs) {
            let topic = log.topics[0];
            switch (topic) {
                case logTopicsMap.UniV3Pool_PoolCreated:
                    await this.handleV3Log(log)
                    break
                case logTopicsMap.UniV2Pool_PoolCreated:
                    await this.handleV2Log(log);
                    break
                default:
                    break
            }
        }
    }

    private async handleV3Log(log: Log) {
        let args = (log as any).args as V3Pool_CreatedEvent;
        const token0 = await this.web3Utils.getTokenInfo(args.token0);
        if (token0) {
            await this.sqliteHelper.addToken(token0);
        }
        const token1 = await this.web3Utils.getTokenInfo(args.token1);
        if (token1) {
            await this.sqliteHelper.addToken(token1);
        }
        let protocol = this.getLogProtocolName(log.address);
        if (protocol == ProtocolName.Unknonwn) {
            unknownLogger.info({
                poolType: PoolType.UNISWAP_V3_LIKE_POOL,
                factory: log.address
            })
            return
        }

        let v3Edge: v3Edge = {
            protocolName: protocol,
            pairAddress: args.pool,
            token0: args.token0,
            token1: args.token1,
            fee: args.fee,
            tickSpacing: args.tickSpacing,
        }
        await this.sqliteHelper.addV3Edge(v3Edge);
        console.log(
            `New ${protocol} PairCreated , Pair address ${args.pool}:`
        );
    }

    private async handleV2Log(log: Log) {
        let args = (log as any).args as V2Pool_CreatedEvent;
        const token0 = await this.web3Utils.getTokenInfo(args.token0);
        if (token0) {
            await this.sqliteHelper.addToken(token0);
        }
        const token1 = await this.web3Utils.getTokenInfo(args.token1);
        if (token1) {
            await this.sqliteHelper.addToken(token1);
        }
        let protocol = this.getLogProtocolName(log.address);

        if (protocol == ProtocolName.Unknonwn) {
            unknownLogger.info({
                poolType: PoolType.UNISWAP_V2_LIKE_POOL,
                factory: log.address
            })
            return
        }

        let v2Edge: v2Edge = {
            protocolName: protocol,
            pairAddress: args.pair,
            token0: args.token0,
            token1: args.token1,
        }
        await this.sqliteHelper.addV2Edge(v2Edge);
        console.log(
            `New ${protocol} PairCreated , Pair address ${args.pair}:`
        );
    }

    private getLogProtocolName(address: string): ProtocolName {
        switch (address.toLowerCase()) {
            case FactoryAddressMap.UniswapV2.toLowerCase():
                return ProtocolName.UniswapV2
            case FactoryAddressMap.SushiswapV2.toLowerCase():
                return ProtocolName.SushiswapV2
            case FactoryAddressMap.PancakeswapV2.toLowerCase():
                return ProtocolName.PancakeswapV2
            case FactoryAddressMap.Shibaswap.toLowerCase():
                return ProtocolName.Shibaswap
            case FactoryAddressMap.SushiV3.toLowerCase():
                return ProtocolName.SushiswapV3
            case FactoryAddressMap.UniswapV3.toLowerCase():
                return ProtocolName.UniswapV3
            case FactoryAddressMap.PancakeV3.toLowerCase():
                return ProtocolName.PancakeswapV3
            default:
                return ProtocolName.Unknonwn
        }
    }

}

// async function test() {
//     let listener = new ViemListener(WS_GETH_URL);
//     await listener.filterLogs();
// }

// test()