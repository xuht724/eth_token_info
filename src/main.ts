import {
    HTTP_ALCHEMY_URL,
    HTTP_NODE_URL,
    WEBSOCKET_NODE_URL,
    WS_ALCHEMY_URL,
    checkPoint,
    sqlite_database,
} from "./config";
import { Syncer } from "./syncer";

async function main() {
    let syncer = new Syncer(
        HTTP_NODE_URL,
        WEBSOCKET_NODE_URL,
        sqlite_database,
        checkPoint
    );
    // 在进程关闭前执行 cleanup 操作
    process.on("SIGINT", async () => {
        console.log("Received SIGINT. Closing syncer...");
        await syncer.close();
        process.exit();
    });

    await syncer.startSync();
}

main();
