import Web3, { WebSocketProvider } from "web3";
import { v2FactoryInfoMap, v3FactoryInfoMap } from "../constants/factory";
import { v2_factory_abi } from "../abi/factory/univ2Factory";
import { v3_factory_abi } from "../abi/factory/univ3Factory";
import { EventLog } from "web3";
import { Web3Utils } from "../web3utils";
import { SqliteHelper } from "../sqliteHelper";
import { EventHandler } from "../eventHandler/eventHandler";

export class Listener {
    wsWeb3: Web3;
    web3Utils: Web3Utils;
    sqliteHelper: SqliteHelper;

    constructor(
        WS_NODE_URL: string,
        web3Utils: Web3Utils,
        sqliteHelper: SqliteHelper
    ) {
        this.wsWeb3 = new Web3(new WebSocketProvider(WS_NODE_URL));

        this.web3Utils = web3Utils;
        this.sqliteHelper = sqliteHelper;
    }

    public createListeners() {
        //Create listeners listen to v2 factory
        for (const factoryAddress of Object.keys(v2FactoryInfoMap)) {
            this.createV2Listener(factoryAddress);
        }
        //Create listeners listen to v3 factory
        for (const factoryAddress of Object.keys(v3FactoryInfoMap)) {
            this.createV3Listener(factoryAddress);
        }
        // Create listeners listen to balancer factory

        //

        console.log("启动监听线程");
    }

    private createV2Listener(factoryAddress: string) {
        const { protocol } = v2FactoryInfoMap[factoryAddress];
        const v2FactoryContract = new this.wsWeb3.eth.Contract(
            v2_factory_abi,
            factoryAddress
        );

        // Listen to PairCreated events from the latest block
        v2FactoryContract.events
            .PairCreated({ fromBlock: "latest" })
            .on("data", async (event: EventLog) => {
                console.log(
                    `New ${protocol} V2 PairCreated event in ${factoryAddress}:`
                );
                await EventHandler.handleV2CreatedEvent(
                    event,
                    protocol,
                    this.web3Utils,
                    this.sqliteHelper
                );
            });
    }
    private createV3Listener(factoryAddress: string) {
        const { protocol } = v3FactoryInfoMap[factoryAddress];
        const v3FactoryContract = new this.wsWeb3.eth.Contract(
            v3_factory_abi,
            factoryAddress
        );

        // Listen to PairCreated events from the latest block
        v3FactoryContract.events
            .PoolCreated({ fromBlock: "latest" })
            .on("data", async (event: EventLog) => {
                console.log(
                    `New ${protocol} V3 PairCreated event in ${factoryAddress}:`
                );
                await EventHandler.handleV3CreatedEvent(
                    event,
                    protocol,
                    this.web3Utils,
                    this.sqliteHelper
                );
            });
    }
}
