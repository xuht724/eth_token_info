// Create a Winston logger for block-level data
import { add, createLogger, format, transports } from "winston";

export const web3Logger = createLogger({
    level: "info",
    format: format.combine(
        // format.timestamp(),
        format.json()
    ),
    transports: [
        // new transports.Console(),
        new transports.File({ filename: "./log/web3.log" }), // Log to a plain text file for block data
    ],
});

export const sqliteLogger = createLogger({
    transports: [new transports.File({ filename: "./log/sqlite.log" })],
});

// Create a Winston logger for arbPath data
export const historicalLogger = createLogger({
    level: "info",
    format: format.combine(
        // format.timestamp(),
        format.json()
    ),
    transports: [
        // new transports.Console(),
        new transports.File({ filename: "./log/historical.log" }), // Log to a JSON file for arbPath data
    ],
});
