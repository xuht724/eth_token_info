import { readFileSync, writeFileSync } from "fs"
import { SqliteHelper } from "./sqliteHelper/sqliteHelper";
import { GETH_URL, WS_GETH_URL, balancer_factory_deployedBlock_map, balancer_vault_address, balancer_vault_deployedBlock, sqlite_database } from "./config";
import { createV2ListenrContract, createV3ListenrContract, createBalancerListenrContract } from "./listener";
import { v2_factory_deployedBlock_map, v3_factory_deployedBlock_map } from "./config";
import Web3, { HttpProvider, WebSocketProvider } from "web3";
import { add, createLogger, format, transports } from "winston";

import { Web3Utils } from "./web3utils";
import { ws } from "web3/lib/commonjs/providers.exports";
import { syncHistoricalV2Pool, syncHistoricalV3Pool, syncHistoricalBalancerPool } from "./historySync";
import { ProtocolName } from "./types";

function saveBlockNumber(latestBlockNumber: number, beginNumbers: number[], edgeTypeList: string[]): void {
    let latestBlockNumbers = []
    if(edgeTypeList.includes('v2')){
        latestBlockNumbers.push(Number(latestBlockNumber))
    } else {
        latestBlockNumbers.push(beginNumbers[0])
    }
    if(edgeTypeList.includes('v3')){
        latestBlockNumbers.push(Number(latestBlockNumber))
    } else {
        latestBlockNumbers.push(beginNumbers[1])
    }
    if(edgeTypeList.includes('balancer')){
        latestBlockNumbers.push(Number(latestBlockNumber))
    } else {
        latestBlockNumbers.push(beginNumbers[2])
    }
    const data = JSON.stringify({ 
        latestV2BlockNumber: latestBlockNumbers[0], 
        latestV3BlockNumber: latestBlockNumbers[1], 
        latestBalancerBlockNumber: latestBlockNumbers[2] });
    writeFileSync(BLOCK_NUMBER_FILE_PATH, data);
}

function loadBlockNumber(): number[] {
    let blockNumbers = []
    try {
        const data = readFileSync(BLOCK_NUMBER_FILE_PATH, 'utf-8');
        const { latestV2BlockNumber} = JSON.parse(data);
        blockNumbers.push(latestV2BlockNumber);
    } catch (error) {
        blockNumbers.push(undefined);
    }
    try {
        const data = readFileSync(BLOCK_NUMBER_FILE_PATH, 'utf-8');
        const { latestV3BlockNumber} = JSON.parse(data);
        blockNumbers.push(latestV3BlockNumber);
    } catch (error) {
        blockNumbers.push(undefined);
    }
    try {
        const data = readFileSync(BLOCK_NUMBER_FILE_PATH, 'utf-8');
        const { latestBalancerBlockNumber} = JSON.parse(data);
        blockNumbers.push(latestBalancerBlockNumber);
    } catch (error) {
        blockNumbers.push(undefined);
    }
    return blockNumbers
}

const sqlLogFile = './log/sqlite.log'
const BLOCK_NUMBER_FILE_PATH = './SQLITE_latestBlockNumber.txt';

// Create a Winston logger for block-level data
const web3Logger = createLogger({
    level: 'info',
    format: format.combine(
        // format.timestamp(),
        format.json()
    ),
    transports: [
        // new transports.Console(),
        new transports.File({ filename: './log/web3.log' }) // Log to a plain text file for block data
    ]
});

async function main() {
    const args = process.argv.slice(2);
    if(args.length == 0){
        console.error("Usage: node script.js <edgeTypeList>");
        process.exit(1);
    } 

    const edgeTypeList = args[0].toLowerCase().split(",")
    let sqliteHelper = new SqliteHelper(sqlite_database, sqlLogFile);
    let wsWeb3 = new Web3(new WebSocketProvider(WS_GETH_URL));
    let web3utils = new Web3Utils(GETH_URL, web3Logger)
    let beginNumbers = loadBlockNumber();

    if(edgeTypeList.includes('v2')){
        for (const address in v2_factory_deployedBlock_map) {
            createV2ListenrContract(address, wsWeb3, web3utils, sqliteHelper);
        }
    }
    if(edgeTypeList.includes('v3')){
        for (const address in v3_factory_deployedBlock_map) {
            createV3ListenrContract(address, wsWeb3, web3utils, sqliteHelper)
        }
    }
    if(edgeTypeList.includes('balancer')){
        createBalancerListenrContract(balancer_vault_address, wsWeb3, web3utils, sqliteHelper)
    }
    const t = await wsWeb3.eth.getBlockNumber();
    saveBlockNumber(Number(t), beginNumbers, edgeTypeList);
    // Add a listener for 'SIGINT' signal
    process.on('SIGINT', async () => {
        console.log('Exiting program. Fetching latest block number...');
        const latestBlockNumber = await wsWeb3.eth.getBlockNumber();
        saveBlockNumber(Number(latestBlockNumber), beginNumbers, edgeTypeList);
        console.log(`Latest block number saved: ${latestBlockNumber}`);
        process.exit();
    });

    // Add an exit event listener
    process.on('exit', async (code) => {
        console.log(`Exiting program with code ${code}. Fetching latest block number...`);
        const latestBlockNumber = await wsWeb3.eth.getBlockNumber();
        saveBlockNumber(Number(latestBlockNumber), beginNumbers, edgeTypeList);
        console.log(`Latest block number saved: ${latestBlockNumber}`);
    });

    let latestBlockNumber = await wsWeb3.eth.getBlockNumber();
    console.log('latest BlockNumber', latestBlockNumber);
    let endBlock = Number(latestBlockNumber);
    const startTime = performance.now();
    if(edgeTypeList.includes('v2')) {
        console.log("Sync V2 Pair")
        if(beginNumbers[0]){
            for (const address in v2_factory_deployedBlock_map) {
                await syncHistoricalV2Pool(address, web3utils, sqliteHelper, beginNumbers[0], endBlock);
            }
        } else {
            for (const address in v2_factory_deployedBlock_map) {
                let { beginBlockNumber } = v2_factory_deployedBlock_map[address];
                await syncHistoricalV2Pool(address, web3utils, sqliteHelper, beginBlockNumber, endBlock);
            }
        }
    }
    if(edgeTypeList.includes('v3')){
        console.info("Sync V3 Pair")
        if(beginNumbers[1]){
            for (const address in v3_factory_deployedBlock_map) {
                await syncHistoricalV3Pool(address, web3utils, sqliteHelper, beginNumbers[1], endBlock);
            }
        } else {
            for (const address in v3_factory_deployedBlock_map) {
                const { beginBlockNumber } = v3_factory_deployedBlock_map[address];
                await syncHistoricalV3Pool(address, web3utils, sqliteHelper, beginBlockNumber, endBlock);
            }
        }
    }
    if(edgeTypeList.includes('balancer')){
        console.log("Sync Balancer Pool")
        if(beginNumbers[2]){
            await syncHistoricalBalancerPool(balancer_vault_address, web3utils, sqliteHelper, beginNumbers[2], endBlock)
        } else {
            await syncHistoricalBalancerPool(balancer_vault_address, web3utils, sqliteHelper, balancer_vault_deployedBlock, endBlock)
        }
    }  
    const endTime = performance.now();
    const totalTime = endTime - startTime;
    console.log(`Total synchronization time: ${totalTime} milliseconds`);
    console.log('Graph Historyical Sync Finished');
}

main()