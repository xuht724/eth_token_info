import { Listener } from "../listener";
import { Web3Utils } from "../toolHelpers/web3utils";
import { SqliteHelper } from "../toolHelpers/sqliteHelper";
import * as fs from "fs";
import { MulticallHelper } from "../toolHelpers/multicallHelper";
import { HistorySyncer } from "../historySyncer";
import { CheckPointData } from "../types";

enum SyncMode {
    COLD = "cold",
    WARM = "warm",
}

export class Syncer {
    syncMode: SyncMode;

    //这个 Flag 用来标志启动是否完成
    InitialFlag: boolean = false;

    // this.checkPointData
    checkPointPath: string = "";
    checkPointData: CheckPointData | null;

    listener: Listener;
    web3Utils: Web3Utils;
    sqliteHelper: SqliteHelper;
    multicallHelper: MulticallHelper;
    historySyncer: HistorySyncer;

    constructor(
        nodeUrl: string,
        wsUrl: string,
        sqliteDBPath: string,
        checkPointPath: string
    ) {
        this.web3Utils = new Web3Utils(nodeUrl);
        this.sqliteHelper = new SqliteHelper(sqliteDBPath);
        this.multicallHelper = new MulticallHelper(nodeUrl);
        this.listener = new Listener(
            wsUrl,
            this.web3Utils,
            this.sqliteHelper,
            this.multicallHelper
        );

        this.historySyncer = new HistorySyncer(
            this.web3Utils,
            this.sqliteHelper,
            this.multicallHelper
        );

        // Check if ./data/checkPoint.json exists
        if (fs.existsSync(checkPointPath)) {
            this.checkPointPath = checkPointPath;
            // If it exists, set syncMode to 'warm'
            this.syncMode = SyncMode.WARM;

            // Read the contents of checkPoint.json
            const checkPointContent = fs.readFileSync(checkPointPath, "utf-8");

            // Parse JSON content
            this.checkPointData = JSON.parse(
                checkPointContent
            ) as CheckPointData;
        } else {
            // If it doesn't exist, set syncMode to 'cold'
            this.syncMode = SyncMode.COLD;
            this.checkPointData = null;
        }
    }

    public async startSync() {
        let blockNumber = Number(
            await this.web3Utils.myWeb3.eth.getBlockNumber()
        );
        switch (this.syncMode) {
            case SyncMode.COLD:
                this.listener.createListeners();
                this.historySyncer.SyncFromCold(blockNumber).then(() => {
                    this.InitialFlag = true;
                    console.log("冷启动完成");
                });
            case SyncMode.WARM:
                console.log(this.checkPointData);
                this.listener.createListeners();
                this.historySyncer
                    .SyncFromWarm(blockNumber, this.checkPointData!)
                    .then(() => {
                        this.InitialFlag = true;
                        console.log("热启动完成");
                    });
            default:
                return;
        }
    }

    public async close() {
        if (this.InitialFlag && this.checkPointData) {
            // update checkPointData
            const currentBlockNumber = Number(
                await this.web3Utils.myWeb3.eth.getBlockNumber()
            );
            // Update v2_Historical_BlockNumber_Map
            Object.keys(
                this.checkPointData.v2_Historical_BlockNumber_Map
            ).forEach((key) => {
                this.checkPointData!.v2_Historical_BlockNumber_Map[key] =
                    currentBlockNumber;
            });

            // Update v3_Historical_BlockNumber_Map
            Object.keys(
                this.checkPointData.v3_Historical_BlockNumber_Map
            ).forEach((key) => {
                this.checkPointData!.v3_Historical_BlockNumber_Map[key] =
                    currentBlockNumber;
            });

            // Update balancer_Historical_BlockNumber_Map
            Object.keys(
                this.checkPointData.balancer_Weighted_Historical_BlockNumber_Map
            ).forEach((key) => {
                this.checkPointData!.balancer_Weighted_Historical_BlockNumber_Map[
                    key
                ] = currentBlockNumber;
            });

            const checkPointContent = JSON.stringify(this.checkPointData);
            fs.writeFileSync(this.checkPointPath, checkPointContent, "utf-8");
            console.log("checkPointData saved to", this.checkPointPath);
        }
    }
}
