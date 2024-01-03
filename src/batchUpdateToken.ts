// import { SqliteHelper } from "./sqliteHelper/sqliteHelper";
// import { GETH_URL, sqlite_database } from "./config";
// import { MulticallHelper } from "./multicaller";
// const sqlLogFile = './log/sqlite.log';

// async function main(){
//     const sqliteHelper = new SqliteHelper(sqlite_database, sqlLogFile);
//     const multicallHelper = new MulticallHelper(GETH_URL);
//     let tokenList = await sqliteHelper.getTokenWithNoDecimals();
//     console.log(tokenList.length);
//     let tokenDecimalsMap = await multicallHelper.batchGetTokenDecimals(tokenList);
//     console.log(tokenDecimalsMap);
//     await sqliteHelper.batchUpdateTokenDecimal(tokenDecimalsMap);
// }

// main();