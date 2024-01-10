// import { readFileSync, writeFileSync } from "fs"
// import { SqliteHelper } from "./sqliteHelper/sqliteHelper";
// import { GETH_URL, WS_GETH_URL, sqlite_database } from "./config";
// import { createV2ListenrContract, createV3ListenrContract } from "./listener";
// import { v2_factory_deployedBlock_map, v3_factory_deployedBlock_map } from "./config";
// import Web3, { WebSocketProvider } from "web3";
// import { add, createLogger, format, transports } from "winston";

// import { Web3Utils } from "./web3utils";
// import { ws } from "web3/lib/commonjs/providers.exports";
// import { syncHistoricalV2Pool, syncHistoricalV3Pool } from "./historySync";
// import { ProtocolName } from "./types";

// function saveBlockNumber(blockNumber: number): void {
//     const data = JSON.stringify({ latestBlockNumber: blockNumber });
//     writeFileSync(BLOCK_NUMBER_FILE_PATH, data);
// }

// function loadBlockNumber(): number | undefined {
//     try {
//         const data = readFileSync(BLOCK_NUMBER_FILE_PATH, 'utf-8');
//         const { latestBlockNumber } = JSON.parse(data);
//         return latestBlockNumber;
//     } catch (error) {
//         return undefined;
//     }
// }

// const sqlLogFile = './log/sqlite.log'
// const BLOCK_NUMBER_FILE_PATH = './SQLITE_latestBlockNumber.txt';

// async function main() {
//     let sqliteHelper = new SqliteHelper(sqlite_database);
//     let wsWeb3 = new Web3(new WebSocketProvider(WS_GETH_URL));
//     let web3utils = new Web3Utils(GETH_URL)
//     let beginNumber = loadBlockNumber();

//     for (const address in v2_factory_deployedBlock_map) {
//         createV2ListenrContract(address, wsWeb3, web3utils, sqliteHelper);
//     }
//     for (const address in v3_factory_deployedBlock_map) {
//         createV3ListenrContract(address, wsWeb3, web3utils, sqliteHelper)
//     }
//     // Add a listener for 'SIGINT' signal
//     process.on('SIGINT', async () => {
//         console.log('Exiting program. Fetching latest block number...');
//         const latestBlockNumber = await wsWeb3.eth.getBlockNumber();
//         saveBlockNumber(Number(latestBlockNumber));
//         console.log(`Latest block number saved: ${latestBlockNumber}`);
//         process.exit();
//     });

//     // Add an exit event listener
//     process.on('exit', async (code) => {
//         console.log(`Exiting program with code ${code}. Fetching latest block number...`);
//         const latestBlockNumber = await wsWeb3.eth.getBlockNumber();
//         saveBlockNumber(Number(latestBlockNumber));
//         console.log(`Latest block number saved: ${latestBlockNumber}`);
//     });

//     if (beginNumber) {
//         let latestBlockNumber = await wsWeb3.eth.getBlockNumber();
//         console.log('latest BlockNumber', latestBlockNumber);
//         let endBlock = Number(latestBlockNumber);
//         const startTime = performance.now();

//         // sync history pairCreated
//         console.log("Sync V2 Pair")
//         for (const address in v2_factory_deployedBlock_map) {
//             let { beginBlockNumber } = v2_factory_deployedBlock_map[address];
//             await syncHistoricalV2Pool(address, web3utils, sqliteHelper, beginNumber, endBlock);
//         }
//         console.info("Sync V3 Pair")
//         for (const address in v3_factory_deployedBlock_map) {
//             const { beginBlockNumber } = v3_factory_deployedBlock_map[address];
//             await syncHistoricalV3Pool(address, web3utils, sqliteHelper, beginNumber, endBlock);
//         }
//         const endTime = performance.now();
//         const totalTime = endTime - startTime;
//         console.log(`Total synchronization time: ${totalTime} milliseconds`);
//         console.log('Graph Historyical Sync Finished');
//     } else {
//         let latestBlockNumber = await wsWeb3.eth.getBlockNumber();
//         console.log('latest BlockNumber', latestBlockNumber);
//         let endBlock = Number(latestBlockNumber);
//         const startTime = performance.now();

//         // sync history pairCreated
//         console.log("Sync V2 Pair")
//         for (const address in v2_factory_deployedBlock_map) {
//             let { protocol, beginBlockNumber } = v2_factory_deployedBlock_map[address];
//             await syncHistoricalV2Pool(address, web3utils, sqliteHelper, beginBlockNumber, endBlock);
//         }
//         console.info("Sync V3 Pair")
//         for (const address in v3_factory_deployedBlock_map) {
//             const { protocol, beginBlockNumber } = v3_factory_deployedBlock_map[address];
//             // if (protocol != ProtocolName.PancakeswapV3) {
//             //     continue
//             // }
//             await syncHistoricalV3Pool(address, web3utils, sqliteHelper, beginBlockNumber, endBlock);
//         }
//         const endTime = performance.now();
//         const totalTime = endTime - startTime;
//         console.log(`Total synchronization time: ${totalTime} milliseconds`);
//         console.log('Graph Historyical Sync Finished');
//     }

// }

// main()
