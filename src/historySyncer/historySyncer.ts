import { SqliteHelper } from "../toolHelpers/sqliteHelper/sqliteHelper";
import { Web3Utils } from "../toolHelpers/web3utils";
import {
    balancerFactoryInfoMap,
    v2FactoryInfoMap,
    v3FactoryInfoMap,
} from "../constants/factory";
import { v2_factory_abi } from "../abi/factory/univ2Factory";
import { historicalLogger } from "../logger";
import winston from "winston";
import { EventLog } from "web3";
import { EventHandler } from "../eventHandler";
import { v3_factory_abi } from "../abi/factory/univ3Factory";
import { MulticallHelper } from "../toolHelpers/multicallHelper/multicallHelper";
import { CheckPointData } from "../types";
import { balancerWeightedFactoryABI } from "../abi/factory/balancerWeightedFactory";

const largeInterval = 50000;
const middleInterval = 10000;
const smallInterval = 5000;

export class HistorySyncer {
    web3Utils: Web3Utils;
    sqliteHelper: SqliteHelper;
    multicallHelper: MulticallHelper;

    logger: winston.Logger = historicalLogger;

    constructor(
        web3Utils: Web3Utils,
        sqliteHelper: SqliteHelper,
        multicallHelper: MulticallHelper
    ) {
        this.web3Utils = web3Utils;
        this.sqliteHelper = sqliteHelper;
        this.multicallHelper = multicallHelper;
    }

    public async SyncFromCold(currentBlockNumber: number) {
        // Sync V2 Pool
        for (const factory in v2FactoryInfoMap) {
            await this.syncHistoricalV2PoolFromCold(
                factory,
                currentBlockNumber
            );
        }
        // Sync V3 Pool
        for (const factor in v3FactoryInfoMap) {
            await this.syncHistoricalV3PoolFromCold(factor, currentBlockNumber);
        }
    }

    public async SyncFromWarm(
        currenBlockNumber: number,
        checkPointData: CheckPointData
    ) {
        for (const factory in checkPointData.v2_Historical_BlockNumber_Map) {
            let { protocol } = v2FactoryInfoMap[factory];
            console.log(protocol);

            let beginBlockNumber =
                checkPointData.v2_Historical_BlockNumber_Map[factory];
            await this.syncHistoricalV2Pool(
                factory,
                beginBlockNumber,
                currenBlockNumber
            );
        }
        for (const factory in checkPointData.v3_Historical_BlockNumber_Map) {
            let { protocol } = v3FactoryInfoMap[factory];
            console.log(protocol);
            let beginBlockNumber =
                checkPointData.v3_Historical_BlockNumber_Map[factory];
            await this.syncHistoricalV3Pool(
                factory,
                beginBlockNumber,
                currenBlockNumber
            );
        }

        for (const factory in checkPointData.balancer_Weighted_Historical_BlockNumber_Map) {
            let { protocol } = balancerFactoryInfoMap[factory];
            console.log(protocol);

            let beginBlockNumber =
                checkPointData.balancer_Weighted_Historical_BlockNumber_Map[
                factory
                ];
            await this.syncHistoricalBalancerWeightedPool(
                factory,
                beginBlockNumber,
                currenBlockNumber
            );
        }
    }

    //这个函数通过 call v2Factory 来获取状态
    public async syncHistoricalV2PoolByCall(
        factoryAddress: string,
        currentBlockNumber: number
    ) {
        const { protocol } = v2FactoryInfoMap[factoryAddress];
        const v2FactoryContract = new this.web3Utils.myWeb3.eth.Contract(
            v2_factory_abi,
            factoryAddress
        );
        const allPairLength = await v2FactoryContract.methods
            .allPairsLength()
            .call();
        console.log("AllPairLength", allPairLength);
        if (allPairLength) {
            let pairsLength = Number(allPairLength);
            let batch = 10000;
            for (let i = 0; i < pairsLength; i += batch) {
                let endIndex =
                    i + batch > pairsLength ? pairsLength : i + batch;

                let addressMap =
                    await this.multicallHelper.multicallV2PoolAddress(
                        factoryAddress,
                        i,
                        endIndex
                    );

                let callList: any[] = [];
                for (const [callIndex, address] of addressMap) {
                    let v2EdgeCall = this.multicallHelper.multicallV2PoolInfo(
                        callIndex,
                        protocol,
                        address
                    );
                    callList.push(v2EdgeCall);
                }
                let res = await Promise.all(callList);
                for (const edge of res) {
                    console.log(edge);
                    if (edge) {
                        await this.sqliteHelper.addV2Edge(edge);
                    }
                }
                console.log(
                    `Insert ${protocol} Pool:Index from ${i} to ${endIndex} `
                );
            }
        }
    }

    public async syncHistoricalV2Pool(
        factoryAddress: string,
        startBlock: number,
        endBlock: number
    ) {
        const { protocol } = v2FactoryInfoMap[factoryAddress];
        const v2FactoryContract = new this.web3Utils.myWeb3.eth.Contract(
            v2_factory_abi,
            factoryAddress
        );
        let currentBlock = startBlock;
        console.log(currentBlock, endBlock);
        while (currentBlock < endBlock) {
            try {
                const toBlock = Math.min(
                    currentBlock + smallInterval,
                    endBlock
                );

                this.logger.info(
                    `Syncing ${protocol} data from block ${currentBlock} to ${toBlock}`
                );
                // console.log(toBlock);
                const events = await v2FactoryContract.getPastEvents(
                    "PairCreated",
                    {
                        filter: {}, // Using an array means OR: e.g. 20 or 23
                        fromBlock: currentBlock,
                        toBlock,
                    }
                );

                // console.log(events);
                let eventLogs = events.map((value) => {
                    return value as EventLog;
                });

                // Use Promise.all to fetch token information concurrently
                await Promise.all(
                    eventLogs.map(async (event: EventLog) => {
                        await EventHandler.handleV2CreatedEvent(
                            event,
                            protocol,
                            this.web3Utils,
                            this.sqliteHelper
                        );
                    })
                );

                currentBlock = toBlock + 1;
                // Add a delay to avoid overloading the node and API
                await sleep(1000); // 1 second delay
            } catch (error) {
                await sleep(5000); // 5 seconds delay before retrying
            }
        }
    }

    public async syncHistoricalV3PoolFromCold(
        factoryAddress: string,
        endBlock: number
    ) {
        const { protocol, beginBlockNumber } = v3FactoryInfoMap[factoryAddress];
        await this.syncHistoricalV3Pool(
            factoryAddress,
            beginBlockNumber,
            endBlock
        );
    }

    public async syncHistoricalV2PoolFromCold(
        factoryAddress: string,
        endBlock: number
    ) {
        const { protocol, beginBlockNumber } = v2FactoryInfoMap[factoryAddress];

        await this.syncHistoricalV2Pool(
            factoryAddress,
            beginBlockNumber,
            endBlock
        );
    }

    public async syncHistoricalBalancerWeightedPool(
        factoryAddress: string,
        startBlock: number,
        endBlock: number
    ) {
        let factoryContract = new this.web3Utils.myWeb3.eth.Contract(
            balancerWeightedFactoryABI,
            factoryAddress
        );
        let currentBlock = startBlock;
        while (currentBlock < endBlock) {
            try {
                const toBlock = Math.min(
                    currentBlock + largeInterval,
                    endBlock
                );
                historicalLogger.info(
                    `Syncing balancer data from block ${currentBlock} to ${toBlock}`
                );
                const events = await factoryContract.getPastEvents(
                    "PoolCreated",
                    {
                        filter: {},
                        fromBlock: currentBlock,
                        toBlock,
                    }
                );

                let eventLogs = events.map((value) => {
                    return value as EventLog;
                });

                // Use Promise.all to fetch token information concurrently
                await Promise.all(
                    eventLogs.map(async (event: EventLog) => {
                        await EventHandler.handleBalancerWeightedCreatedEvent(
                            event,
                            this.web3Utils,
                            this.sqliteHelper,
                            this.multicallHelper
                        );
                    })
                );
                currentBlock = toBlock + 1;
                // Add a delay to avoid overloading the node and API
                await sleep(1000); // 1 second delay
            } catch (error) {
                await sleep(5000); // 5 seconds delay before retrying
            }
        }
    }

    public async syncHistoricalV3Pool(
        factoryAddress: string,
        startBlock: number,
        endBlock: number
    ) {
        const { protocol } = v3FactoryInfoMap[factoryAddress];
        let FactoryContract = new this.web3Utils.myWeb3.eth.Contract(
            v3_factory_abi,
            factoryAddress
        );

        let currentBlock = startBlock;
        while (currentBlock < endBlock) {
            try {
                const toBlock = Math.min(
                    currentBlock + largeInterval,
                    endBlock
                );

                historicalLogger.info(
                    `Syncing ${protocol} data from block ${currentBlock} to ${toBlock}`
                );

                const events = await FactoryContract.getPastEvents(
                    "PoolCreated",
                    {
                        filter: {},
                        fromBlock: currentBlock,
                        toBlock,
                    }
                );

                let eventLogs = events.map((value) => {
                    return value as EventLog;
                });
                // mainLogger.info(eventLogs[0]);

                // Use Promise.all to fetch token information concurrently
                await Promise.all(
                    eventLogs.map(async (event: EventLog) => {
                        await EventHandler.handleV3CreatedEvent(
                            event,
                            protocol,
                            this.web3Utils,
                            this.sqliteHelper
                        );
                    })
                );

                currentBlock = toBlock + 1;

                // Add a delay to avoid overloading the node and API
                await sleep(1000); // 1 second delay
            } catch (error) {
                console.log(error);
                console.log(`Sync ${protocol} fail`);
                await sleep(5000); // 5 seconds delay before retrying
            }
        }
    }
}

async function sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
