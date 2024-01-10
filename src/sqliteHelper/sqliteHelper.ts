import sqlite3 from "sqlite3";
import winston, { add } from "winston";
import { TokenInfo, v2Edge, v3Edge, ProtocolName } from "../types"; // Update the path to match your project structure
import { sqliteLogger } from "../logger";
import { TableName } from "./enum";
import { Basic2AssetEdge } from "../types/edgs";

export class SqliteHelper {
    db: sqlite3.Database;
    logger: winston.Logger;

    constructor(databasePath: string) {
        this.db = new sqlite3.Database(databasePath, (err) => {
            if (err) {
                console.error("Error opening SQLite database:", err.message);
            } else {
                console.log("Connected to the SQLite database.");
                this.createTablesIfNotExist();
            }
        });

        this.logger = sqliteLogger;
    }

    private createTablesIfNotExist(): void {
        this.createTokenTable();
        this.createV2EdgeTable();
        this.createV3EdgeTable();
    }

    private createTokenTable(): void {
        this.db.run(`
            CREATE TABLE IF NOT EXISTS Token (
                address TEXT PRIMARY KEY,
                decimals INTEGER,
                name TEXT,
                symbol TEXT
            )
        `);
    }

    private createV2EdgeTable(): void {
        this.db.run(`
            CREATE TABLE IF NOT EXISTS V2Edge (
                address TEXT PRIMARY KEY,
                protocolName TEXT,
                token0 TEXT,
                token1 TEXT,
                blockTimeLast INTEGER,
                tag INTEGER,
                FOREIGN KEY (token0) REFERENCES Token(address),
                FOREIGN KEY (token1) REFERENCES Token(address)
            )
        `);
    }

    private createV3EdgeTable(): void {
        this.db.run(`
            CREATE TABLE IF NOT EXISTS V3Edge (
                address TEXT PRIMARY KEY,
                protocolName TEXT,
                token0 TEXT,
                token1 TEXT,
                fee INTEGER,
                tickSpacing INTEGER,
                blockTimeLast INTEGER,
                tag INTEGER,
                FOREIGN KEY (token0) REFERENCES Token(address),
                FOREIGN KEY (token1) REFERENCES Token(address)
            )
        `);
    }

    public addToken(token: TokenInfo): void {
        // Check if decimals is greater than 0
        if (token.decimals <= 0) {
            this.logger.error(
                "Error adding Token: Decimals must be greater than 0."
            );
            return;
        }

        const query =
            "INSERT INTO Token (address, decimals, name, symbol) VALUES (?, ?, ?, ?)";
        const params = [
            token.address.toLowerCase(),
            token.decimals,
            token.name,
            token.symbol,
        ];

        this.db.run(query, params, (err) => {
            if (err) {
                // this.logger.error('Error adding Token:', err.message);
            } else {
                this.logger.info(`Token with address ${token.address} added.`);
            }
        });
    }

    public async updateEdgeTVL(
        table: TableName,
        address: string,
        tvl: bigint
    ): Promise<void> {
        const query = `UPDATE ${table} SET tvl = ? WHERE address = ?`;
        const params = [tvl.toString(), address];

        try {
            await this.runQuery(query, params);
            // console.log(`TVL for ${table} with address ${address} updated.`);
        } catch (error) {
            console.log(error);
            console.error(
                `Error updating TVL for ${table} with address ${address}:`
            );
        }
    }

    public async batchUpdateEdgeTVL(
        table: TableName,
        tvlMap: Map<string, bigint>
    ) {
        tvlMap.forEach(async (tvl, address) => {
            await this.updateEdgeTVL(table, address, tvl);
        });
    }

    public updateV2EdgeTime(address: string, newBlockTimeStamp: number) {
        const tag = this.calculateTag(newBlockTimeStamp);
        const query =
            "UPDATE V2Edge SET blockTimeLast = ?, tag = ? WHERE address = ?";
        const params = [newBlockTimeStamp, tag, address];

        this.db.run(query, params, (err) => {
            if (err) {
                this.logger.error("Error updating V2Edge:", err.message);
            } else {
                this.logger.info(`V2Edge with address ${address} updated.`);
            }
        });
    }

    public updateV3EdgeTime(address: string, newBlockTimeStamp: number): void {
        const tag = this.calculateTag(newBlockTimeStamp);
        const query =
            "UPDATE V3Edge SET blockTimeLast = ?, tag = ? WHERE address = ?";
        const params = [newBlockTimeStamp, tag, address];

        this.db.run(query, params, (err) => {
            if (err) {
                this.logger.error("Error updating V3Edge:", err.message);
            } else {
                this.logger.info(`V3Edge with address ${address} updated.`);
            }
        });
    }

    public async addV2Edge(edge: v2Edge): Promise<void> {
        const query =
            "INSERT INTO V2Edge (address, protocolName, token0, token1) VALUES (?, ?, ?, ?)";
        const params = [
            edge.pairAddress.toLowerCase(),
            edge.protocolName,
            edge.token0.toLowerCase(),
            edge.token1.toLowerCase(),
        ];

        try {
            await this.runQuery(query, params);
            this.logger.info(
                `V2Edge with address ${edge.pairAddress.toLowerCase()} added.`
            );
        } catch (error) {
            this.logger.error(
                `Error adding V2Edge: ${edge.pairAddress.toLowerCase()}, Edge has existed`
            );
        }
    }

    public async addV3Edge(edge: v3Edge): Promise<void> {
        const query =
            "INSERT INTO V3Edge (address, protocolName, token0, token1, fee, tickSpacing) VALUES (?, ?, ?, ?, ?, ?)";
        const params = [
            edge.pairAddress.toLowerCase(),
            edge.protocolName,
            edge.token0.toLowerCase(),
            edge.token1.toLowerCase(),
            edge.fee,
            edge.tickSpacing,
        ];

        try {
            await this.runQuery(query, params);
            this.logger.info(
                `V3Edge with address ${edge.pairAddress.toLowerCase()} added.`
            );
        } catch (error) {
            this.logger.error(
                `Error adding V3Edge: ${edge.pairAddress.toLowerCase()} Edge has existed`
            );
            // throw error; // Propagate the error
        }
    }

    // V2 Function
    public async getV2AddressesWithExceptions(): Promise<string[]> {
        const query =
            "SELECT address FROM V2Edge WHERE tag IS NULL OR (tag > 5)";
        try {
            const rows = await this.runQuery(query, []);

            const addresses: string[] = rows.map((row: any) => row.address);

            return addresses;
        } catch (error) {
            // this.logger.error('Error fetching V2 addresses with exceptions:', error.message);
            throw error;
        }
    }

    // V3 Function
    public async getV3AddressesWithExceptions(): Promise<string[]> {
        const query =
            "SELECT address FROM V3Edge WHERE tag IS NULL OR (tag > 5)";
        try {
            const rows = await this.runQuery(query, []);

            const addresses: string[] = rows.map((row: any) => row.address);

            return addresses;
        } catch (error) {
            // this.logger.error('Error fetching V3 addresses with exceptions:', error.message);
            throw error;
        }
    }

    public async getTokenWithNoDecimals(): Promise<string[]> {
        const query = "SELECT address FROM Token WHERE decimals IS NULL ";
        try {
            const rows = await this.runQuery(query, []);

            const addresses: string[] = rows.map((row: any) => row.address);

            return addresses;
        } catch (error) {
            // this.logger.error('Error fetching V3 addresses with exceptions:', error.message);
            throw error;
        }
    }

    public async getV2Edges(minTag: number = 0): Promise<v2Edge[]> {
        const query = "SELECT * FROM V2Edge WHERE tag >= ?";
        try {
            const rows = await this.runQuery(query, [minTag]);

            const v2Edges: v2Edge[] = rows.map((row: any) => ({
                pairAddress: row.address,
                protocolName: row.protocolName,
                token0: row.token0,
                token1: row.token1,
                blockTimeLast: row.blockTimeLast,
                tag: row.tag,
            }));

            return v2Edges;
        } catch (error) {
            // this.logger.error('Error fetching V2Edges:', error.message);
            throw error;
        }
    }

    public async getEdgesByToken(
        tableName: TableName,
        token: string
    ): Promise<Basic2AssetEdge[]> {
        let tokenLowercase = token.toLowerCase();
        const query = `SELECT * FROM ${tableName} WHERE token0 = ? OR token1 = ?`;
        try {
            const rows = await this.runQuery(query, [
                tokenLowercase,
                tokenLowercase,
            ]);

            const edges: Basic2AssetEdge[] = rows.map((row: any) => ({
                pairAddress: row.address,
                protocolName: row.protocolName,
                token0: row.token0,
                token1: row.token1,
            }));

            return edges;
        } catch (error) {
            // this.logger.error('Error fetching V2Edges:', error.message);
            throw error;
        }
    }

    public async getEdgesNotMatchingToken(
        tableName: TableName,
        token: string
    ): Promise<Basic2AssetEdge[]> {
        let tokenLowercase = token.toLowerCase();
        const query = `SELECT * FROM ${tableName} WHERE token0 != ? AND token1 != ?`;
        try {
            const rows = await this.runQuery(query, [
                tokenLowercase,
                tokenLowercase,
            ]);

            const edges: Basic2AssetEdge[] = rows.map((row: any) => ({
                pairAddress: row.address,
                protocolName: row.protocolName,
                token0: row.token0,
                token1: row.token1,
            }));

            return edges;
        } catch (error) {
            // this.logger.error('Error fetching edges:', error.message);
            throw error;
        }
    }

    public async getV2EdgeAddresses(minTag: number = 0): Promise<any[]> {
        const query = "SELECT address,token0,token1 FROM V2Edge WHERE tag >= ?";
        try {
            const rows = await this.runQuery(query, [minTag]);
            console.log(rows);

            return rows;
        } catch (error) {
            // this.logger.error('Error fetching V2Edge addresses:', error.message);
            throw error;
        }
    }

    public async getV3Edges(minTag: number = 0): Promise<v3Edge[]> {
        const query = "SELECT * FROM V3Edge WHERE tag >= ?";
        try {
            const rows = await this.runQuery(query, [minTag]);

            const v3Edges: v3Edge[] = rows.map((row: any) => ({
                pairAddress: row.address,
                protocolName: row.protocolName,
                token0: row.token0,
                token1: row.token1,
                fee: row.fee,
                tickSpacing: row.tickSpacing,
                blockTimeLast: row.blockTimeLast,
                tag: row.tag,
            }));

            return v3Edges;
        } catch (error) {
            // this.logger.error('Error fetching V3Edges:', error.message);
            throw error;
        }
    }

    public async getV3EdgeAddresses(minTag: number = 0): Promise<string[]> {
        const query = "SELECT address FROM V3Edge WHERE tag >= ?";
        try {
            const rows = await this.runQuery(query, [minTag]);
            // console.log(rows);

            return rows.map((row: any) => row.address);
        } catch (error) {
            // this.logger.error('Error fetching V3Edge addresses:', error.message);
            throw error;
        }
    }

    public async batchUpdateTokenDecimal(
        dataMap: Map<string, number>
    ): Promise<void> {
        const promises: Promise<void>[] = [];

        for (const [address, decimals] of dataMap.entries()) {
            const updateQuery =
                "UPDATE Token SET decimals = ? WHERE address = ?";
            const queryParams = [decimals, address];

            const promise = new Promise<void>((resolve, reject) => {
                this.db.run(updateQuery, queryParams, (err) => {
                    if (err) {
                        this.logger.error(
                            `Error updating Token ${address} decimals: ${err.message}`
                        );
                        reject(err);
                    } else {
                        this.logger.info(
                            `Token ${address} decimals updated successfully.`
                        );
                        resolve();
                    }
                });
            });

            promises.push(promise);
        }

        // Return a Promise that resolves when all updates are complete
        return Promise.all(promises).then(() => {});
    }

    public async batchUpdateV2EdgeBlockTimestamp(
        dataMap: Map<string, number>
    ): Promise<void> {
        const promises: Promise<void>[] = [];

        for (const [address, blockTimestampLast] of dataMap.entries()) {
            const tag = this.calculateTag(blockTimestampLast);

            const updateQuery =
                "UPDATE V2Edge SET blockTimeLast = ?, tag = ? WHERE address = ?";

            const queryParams = [blockTimestampLast, tag, address];

            const promise = new Promise<void>((resolve, reject) => {
                this.db.run(updateQuery, queryParams, (err) => {
                    if (err) {
                        this.logger.error(
                            `Error updating V2Edge for address ${address}:`,
                            err.message
                        );
                        reject(err);
                    } else {
                        this.logger.info(
                            `V2Edge update complete for address ${address}.`
                        );
                        resolve();
                    }
                });
            });

            promises.push(promise);
        }

        // Return a Promise that resolves when all updates are complete
        return Promise.all(promises).then(() => {});
    }

    public async batchUpdateV3EdgeBlockTimestamp(
        dataMap: Map<string, number>
    ): Promise<void> {
        const promises: Promise<void>[] = [];

        for (const [address, blockTimestampLast] of dataMap.entries()) {
            const tag = this.calculateTag(blockTimestampLast);

            const updateQuery =
                "UPDATE V3Edge SET blockTimeLast = ?, tag = ? WHERE address = ?";

            const queryParams = [blockTimestampLast, tag, address];
            console.log(queryParams);

            const promise = new Promise<void>((resolve, reject) => {
                this.db.run(updateQuery, queryParams, (err) => {
                    if (err) {
                        this.logger.error(
                            `Error updating V3Edge for address ${address}:`,
                            err.message
                        );
                        reject(err);
                    } else {
                        this.logger.info(
                            `V3Edge update complete for address ${address}.`
                        );
                        resolve();
                    }
                });
            });

            promises.push(promise);
        }

        // Return a Promise that resolves when all updates are complete
        return Promise.all(promises).then(() => {});
    }

    private runQuery(query: string, params: any[]): Promise<any[]> {
        return new Promise((resolve, reject) => {
            this.db.all(query, params, (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });
    }

    private calculateTag(blockTimeLast: number | undefined): number {
        if (!blockTimeLast) {
            return 0;
        } else {
            const currentTime = Math.floor(Date.now() / 1000); // Convert milliseconds to seconds
            const timeDifference = currentTime - blockTimeLast;
            if (timeDifference >= 31536000) {
                return 0; // Difference one year or more
            } else if (timeDifference >= 15552000) {
                return 1; // Difference between six months and one year
            } else if (timeDifference >= 7776000) {
                return 2; // Difference between three months and six months
            } else if (timeDifference >= 2592000) {
                return 3; // Difference between one month and three months
            } else if (timeDifference >= 86400) {
                return 4; // Difference within one month
            } else {
                return 5; // Difference within one week
            }
        }
    }
}
