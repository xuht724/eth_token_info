import { SqliteHelper } from "../toolHelpers/sqliteHelper";
import { MulticallHelper } from "../toolHelpers/multicallHelper";
import {
    HTTP_NODE_URL,
    sqlite_database
} from "../config";

async function main() {
    const multicallHelper = new MulticallHelper(HTTP_NODE_URL);
    const sqliteHelper = new SqliteHelper(sqlite_database);

    let v2Pools = await sqliteHelper.getV2EdgeAddresses();
    let v2res = await multicallHelper.batchGetV2EdgeBlockTimestamp(v2Pools);
    await sqliteHelper.batchUpdateV2EdgeBlockTimestamp(v2res);
    
    let v3Pools = await sqliteHelper.getV3EdgeAddresses();
    let v3res = await multicallHelper.batchGetV3EdgeBlockTimestamp(v3Pools);
    await sqliteHelper.batchUpdateV3EdgeBlockTimestamp(v3res);

}

main();