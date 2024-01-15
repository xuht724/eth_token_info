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

    // Function to print progress
    const printProgress = (
        current: number,
        total: number,
        tableName: TableName
    ) => {
        const progress = (current / total) * 100;
        console.log(`Progress (${tableName}): ${progress.toFixed(2)}%`);
    };

    {
        let v2WETHPools = await sqliteHelper.getEdgesNotMatchingToken(
            TableName.V2Edge,
            WETH
        );
        console.log(`Total V2 WETH Pools: ${v2WETHPools.length}`);

        for (let i = 0; i < v2WETHPools.length; i++) {
            let pool = v2WETHPools[i];
            let tvl = await ethTVLCaculator.calculateTwoTokenPoolTVLWithCache(
                pool.pairAddress,
                pool.token0,
                pool.token1
            );
            if (tvl) {
                sqliteHelper.updateEdgeTVL(
                    TableName.V2Edge,
                    pool.pairAddress,
                    tvl
                );
            }

            // Print progress
            printProgress(i + 1, v2WETHPools.length, TableName.V2Edge);
        }
    }

    {
        let v3WETHPools = await sqliteHelper.getEdgesNotMatchingToken(
            TableName.V3Edge,
            WETH
        );
        console.log(`Total V3 WETH Pools: ${v3WETHPools.length}`);

        for (let i = 0; i < v3WETHPools.length; i++) {
            let pool = v3WETHPools[i];
            let tvl = await ethTVLCaculator.calculateTwoTokenPoolTVLWithCache(
                pool.pairAddress,
                pool.token0,
                pool.token1
            );
            if (tvl) {
                sqliteHelper.updateEdgeTVL(
                    TableName.V3Edge,
                    pool.pairAddress,
                    tvl
                );
            }

            // Print progress
            printProgress(i + 1, v3WETHPools.length, TableName.V3Edge);
        }
    }
}

main();
