import { EventLog } from "web3";
import { ProtocolName, v2Edge, v3Edge } from "../types";
import { Web3Utils } from "../toolHelpers/web3utils";
import { SqliteHelper } from "../toolHelpers/sqliteHelper";
import { MulticallHelper } from "../toolHelpers/multicallHelper";

export class EventHandler {
    static decodeV2PoolCreatedEvent(
        protocol: ProtocolName,
        event: EventLog
    ): v2Edge {
        let pairAddress = (event.returnValues.pair as string).toLowerCase();
        const edge: v2Edge = {
            protocolName: protocol,
            pairAddress,
            token0: (event.returnValues.token0 as string).toLowerCase(),
            token1: (event.returnValues.token1 as string).toLowerCase(),
        };
        return edge;
    }

    static decodeV3PoolCreatedEvent(
        protocol: ProtocolName,
        event: EventLog
    ): v3Edge {
        const edge: v3Edge = {
            protocolName: protocol,
            pairAddress: event.returnValues.pool as string,
            token0: event.returnValues.token0 as string,
            token1: event.returnValues.token1 as string,
            fee: Number(event.returnValues.fee),
            tickSpacing: Number(event.returnValues.tickSpacing),
        };
        return edge;
    }

    static async handleV2CreatedEvent(
        event: EventLog,
        protocol: ProtocolName,
        web3utils: Web3Utils,
        sqliteHelper: SqliteHelper
    ) {
        let t0Addr = event.returnValues.token0 as string;
        let t1Addr = event.returnValues.token1 as string;

        let v0Flag = await sqliteHelper.checkTokenExists(t0Addr.toLowerCase());
        let v1Flag = await sqliteHelper.checkTokenExists(t1Addr.toLowerCase());


        
        if(!v0Flag){
            const token0 = await web3utils.getTokenInfo(
                event.returnValues.token0 as string
            );
            if(token0){
                await sqliteHelper.addToken(token0);
            }
        }
        if(!v1Flag){
            const token1 = await web3utils.getTokenInfo(
                event.returnValues.token1 as string
            );
            if(token1){
                await sqliteHelper.addToken(token1);
            }
        }
        let edge = this.decodeV2PoolCreatedEvent(protocol, event);
        let edgeFlag = await sqliteHelper.checkV2EdgeExits(edge.pairAddress.toLowerCase());
        if(!edgeFlag){
            await sqliteHelper.addV2Edge(edge);
        }

    }

    static async handleV3CreatedEvent(
        event: EventLog,
        protocol: ProtocolName,
        web3utils: Web3Utils,
        sqliteHelper: SqliteHelper
    ) {

        let t0Addr = event.returnValues.token0 as string;
        let t1Addr = event.returnValues.token1 as string;

        let v0Flag = await sqliteHelper.checkTokenExists(t0Addr.toLowerCase());
        let v1Flag = await sqliteHelper.checkTokenExists(t1Addr.toLowerCase());

        if(!v0Flag){
            const token0 = await web3utils.getTokenInfo(
                event.returnValues.token0 as string
            );
            if(token0){
                await sqliteHelper.addToken(token0);
            }
        }
        if(!v1Flag){
            const token1 = await web3utils.getTokenInfo(
                event.returnValues.token1 as string
            );
            if(token1){
                await sqliteHelper.addToken(token1);
            }
        }
        let edge = this.decodeV3PoolCreatedEvent(protocol, event);
        let edgeFlag = await sqliteHelper.checkV3EdgeExits(edge.pairAddress.toLowerCase());
        if(!edgeFlag){
            await sqliteHelper.addV3Edge(edge);
        }
    }

    static async handleBalancerWeightedCreatedEvent(
        event: EventLog,
        web3utils: Web3Utils,
        sqliteHelper: SqliteHelper,
        multicallHelper: MulticallHelper
    ) {
        let poolAddress = event.returnValues.pool as string;
        let pool = await multicallHelper.MulticallBalancerInitialInfo(
            poolAddress
        );
        if (pool) {
            try {
                let callInfo = pool.tokens.map((token) => {
                    return web3utils.getTokenInfo(token);
                });
                let tokenInfos = (await Promise.all(callInfo)).filter(
                    (value) => value != null
                );
                for (const info of tokenInfos) {
                    await sqliteHelper.addToken(info!);
                }
                await sqliteHelper.addBalancerWeightedPool(pool);
            } catch (error) {
                console.log("Get Token Error");
                throw error;
            }
        }
    }
}
