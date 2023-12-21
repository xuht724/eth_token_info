import { readFileSync, writeFileSync } from "fs";
import { SqliteHelper } from "./sqliteHelper/sqliteHelper";
import { GETH_URL, sqlite_database } from "./config";
import { MulticallHelper } from "./multicaller";
import Web3, { HttpProvider } from "web3";

const sqlLogFile = './log/sqlite.log';

async function main() {
    const args = process.argv.slice(2);

    if (args.length < 2) {
        console.error("Usage: node script.js <edgeType> <level>");
        process.exit(1);
    }

    const edgeType = args[0].toLowerCase();
    const level = parseInt(args[1], 10);

    if (isNaN(level) || (level !== -1 && (level < 0 || level > 5))) {
        console.error("Invalid level. Level must be an integer between 0 and 5, or -1 to fetch exceptional addresses.");
        process.exit(1);
    }


    const sqliteHelper = new SqliteHelper(sqlite_database, sqlLogFile);
    const multicallHelper = new MulticallHelper(GETH_URL);

    let addressList, getTimestampFunction, updateTimestampFunction;

    if (edgeType === 'v2') {
        if (level === -1) {
            // Fetch exceptional addresses for V2
            addressList = await sqliteHelper.getV2AddressesWithExceptions();
        } else {
            // Fetch regular addresses for V2
            addressList = await sqliteHelper.getV2EdgeAddresses(level);
        }
        getTimestampFunction = multicallHelper.batchGetV2EdgeBlockTimestamp.bind(multicallHelper);
        updateTimestampFunction = sqliteHelper.batchUpdateV2EdgeBlockTimestamp.bind(sqliteHelper);
    } else if (edgeType === 'v3') {
        if (level === -1) {
            // Fetch exceptional addresses for V3
            addressList = await sqliteHelper.getV3AddressesWithExceptions();
        } else {
            // Fetch regular addresses for V3
            addressList = await sqliteHelper.getV3EdgeAddresses(level);
        }
        getTimestampFunction = multicallHelper.batchGetV3EdgeBlockTimestamp.bind(multicallHelper);
        updateTimestampFunction = sqliteHelper.batchUpdateV3EdgeBlockTimestamp.bind(sqliteHelper);
    }  else {
        console.error("Invalid edge type. Supported values are 'v2' or 'v3'.");
        process.exit(1);
    }

    console.log(`Total addresses: ${addressList.length}`);

    const begin = performance.now();
    const result = await getTimestampFunction(addressList);
    console.log(result.size)

    await updateTimestampFunction(result);
    const end = performance.now();

    console.log(`Update Time Cost: ${(end - begin) / 1000}s`);
    console.log('Update Finished');
}

main();
