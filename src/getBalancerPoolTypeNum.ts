import { readFileSync, writeFileSync } from "fs";
import { SqliteHelper } from "./sqliteHelper/sqliteHelper";
import { GETH_URL, sqlite_database } from "./config";
import { MulticallHelper } from "./multicaller";
import Web3, { HttpProvider } from "web3";

const sqlLogFile = './log/sqlite.log';

async function main(){
    const sqliteHelper = new SqliteHelper(sqlite_database, sqlLogFile)
    const res = await sqliteHelper.getBalancerPoolType()
    console.log("Balancer edge type:")
    let sum = Array.from(res.values()).reduce((a, b) => a + b, 0);
    console.log(sum)
    for(let [key, value] of res){
        console.log(key, value, (value / sum * 100));            
    }
    /*const unknownEdgeAddress = await sqliteHelper.getBalancerUnknownEdgeAddresses()
    console.log("Unknown balancer edge address:")
    for(let i = 0; i < unknownEdgeAddress.length; i++){
        console.log(unknownEdgeAddress[i])
    }*/
}

main()