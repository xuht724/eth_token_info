import { readFileSync, writeFileSync } from "fs";
import { SqliteHelper } from "./sqliteHelper/sqliteHelper";
import { GETH_URL, sqlite_database } from "./config";
import { MulticallHelper } from "./multicaller";
import Web3, { HttpProvider } from "web3";

const sqlLogFile = './log/sqlite.log';

async function main(){
    const sqliteHelper = new SqliteHelper(sqlite_database, sqlLogFile)
    const res = await sqliteHelper.getBalancerPoolType()
    for (let [key, value] of res) {
        console.log(key, value);            
    }
    return
}

main()