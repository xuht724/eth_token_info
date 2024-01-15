import { ETHTVLCaculator } from "./tvlCaculator";
import { HTTP_NODE_URL, sqlite_database } from "../config";
import { MulticallHelper } from "../toolHelpers/multicallHelper";
import { SqliteHelper, TableName } from "../toolHelpers/sqliteHelper";
import { WETH } from "../constants/tokenAddress";

const MINTAG = 0;

async function main() {
    let multicallHelper = new MulticallHelper(HTTP_NODE_URL);
    let ethTVLCaculator = new ETHTVLCaculator(multicallHelper);
    let sqliteHelper = new SqliteHelper(sqlite_database);

    {
        let v2WETHPools = await sqliteHelper.getEdgesByToken(
            TableName.V2Edge,
            WETH
        );
        let res = await ethTVLCaculator.calculateWETHPoolTVL(v2WETHPools);
        await sqliteHelper.batchUpdateEdgeTVL(TableName.V2Edge, res);
    }

    {
        let v3WETHPools = await sqliteHelper.getEdgesByToken(
            TableName.V3Edge,
            WETH
        );
        let res = await ethTVLCaculator.calculateWETHPoolTVL(v3WETHPools);
        await sqliteHelper.batchUpdateEdgeTVL(TableName.V3Edge, res);
    }
}

main();
