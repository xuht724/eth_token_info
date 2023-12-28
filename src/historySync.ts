import { SqliteHelper } from "./sqliteHelper/sqliteHelper";
// import {
//     Multicall,
//     ContractCallResults,
//     ContractCallContext,
// } from 'ethereum-multicall';
import Web3 from 'web3';
import { balancer_vault_address, v2_factory_deployedBlock_map, v3_factory_deployedBlock_map } from "./config";
import { v2_factory_abi } from "./abi/factory/univ2Factory";
import { EventLog } from "web3";
import { handleV2CreatedEvent, handleV3CreatedEvent, handleBalancerCreatedEvent } from "./listener";
import { Web3Utils } from "./web3utils";
import { add, createLogger, format, transports } from "winston";
import { v3_factory_abi } from "./abi/factory/univ3Factory";
import { ProtocolName } from "./types";
import { panckaev3_factory_abi } from "./abi/factory/pancakev3Factory";
import { balancerVault_abi } from "./abi/pool/balancervault";

// Create a Winston logger for arbPath data
const historicalLogger = createLogger({
    level: 'info',
    format: format.combine(
        // format.timestamp(),
        format.json()
    ),
    transports: [
        // new transports.Console(),
        new transports.File({ filename: './log/historical.log' }) // Log to a JSON file for arbPath data
    ]
});

export async function syncHistoricalV2Pool(
    factoryAddress: string,
    web3Utils: Web3Utils,
    sqliteHelper: SqliteHelper,
    startBlock: number,
    endBlock: number
) {
    const { protocol } = v2_factory_deployedBlock_map[factoryAddress];
    const v2FactoryContract = new web3Utils.myWeb3.eth.Contract(v2_factory_abi, factoryAddress);
    const blockInterval = 50000;
    let currentBlock = startBlock;

    while (currentBlock < endBlock) {
        try {
            const toBlock = Math.min(currentBlock + blockInterval, endBlock);
            historicalLogger.info(`Syncing ${protocol} data from block ${currentBlock} to ${toBlock}`);
            const events = await v2FactoryContract.getPastEvents('PairCreated', {
                filter: {}, // Using an array means OR: e.g. 20 or 23
                fromBlock: currentBlock,
                toBlock
            });

            let eventLogs = events.map(value => {
                return value as EventLog;
            });

            // Use Promise.all to fetch token information concurrently
            await Promise.all(eventLogs.map(async (event: EventLog) => {
                await handleV2CreatedEvent(event, protocol, web3Utils, sqliteHelper);
            }));

            currentBlock = toBlock + 1;
            // Add a delay to avoid overloading the node and API
            await sleep(1000); // 1 second delay
        } catch (error) {
            await sleep(5000); // 5 seconds delay before retrying
        }
    }
}

export async function syncHistoricalV3Pool(
    factoryAddress: string,
    web3Utils: Web3Utils,
    sqliteHelper: SqliteHelper,
    startBlock: number,
    endBlock: number
) {
    const { protocol } = v3_factory_deployedBlock_map[factoryAddress];
    let FactoryContract = new web3Utils.myWeb3.eth.Contract(v3_factory_abi, factoryAddress);

    const blockInterval = 10000;
    let currentBlock = startBlock;
    while (currentBlock < endBlock) {
        try {
            const toBlock = Math.min(currentBlock + blockInterval, endBlock);

            historicalLogger.info(`Syncing ${protocol} data from block ${currentBlock} to ${toBlock}`);

            const events = await FactoryContract.getPastEvents('PoolCreated', {
                filter: {},
                fromBlock: currentBlock,
                toBlock
            });

            let eventLogs = events.map(value => {
                return value as EventLog;
            });
            // mainLogger.info(eventLogs[0]);

            // Use Promise.all to fetch token information concurrently
            await Promise.all(eventLogs.map(async (event: EventLog) => {
                await handleV3CreatedEvent(event, protocol, web3Utils, sqliteHelper)
            }));

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

export async function syncHistoricalBalancerPool(
    factoryAddress: string,
    web3Utils: Web3Utils,
    sqliteHelper: SqliteHelper,
    startBlock: number,
    endBlock: number
) {
    let VaultContract = new web3Utils.myWeb3.eth.Contract(balancerVault_abi, balancer_vault_address);

    const blockInterval = 2000;
    let currentBlock = startBlock;
    while (currentBlock < endBlock) {
        try {
            const toBlock = Math.min(currentBlock + blockInterval, endBlock)
            historicalLogger.info(`Syncing balancer data from block ${currentBlock} to ${toBlock}`)

            const events = await VaultContract.getPastEvents('PoolRegistered', {
                filter: {},
                fromBlock: currentBlock,
                toBlock
            });
            let eventLogs = events.map(value => {
                return value as EventLog
            });
            // mainLogger.info(eventLogs[0]);

            // Use Promise.all to fetch token information concurrently
            await Promise.all(eventLogs.map(async (event: EventLog) => {
                await handleBalancerCreatedEvent(event, balancer_vault_address, web3Utils, sqliteHelper)
            }));

            currentBlock = toBlock + 1;

            // Add a delay to avoid overloading the node and API
            await sleep(5000); // 1 second delay
        } catch (error) {
            console.log(error);
            console.log(`Sync balancer fail`);
            await sleep(10000); // 5 seconds delay before retrying
        }
    }
}
async function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}