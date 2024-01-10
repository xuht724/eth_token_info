import { EventLog } from "web3";
import { ProtocolName, v2Edge, v3Edge } from "../types";
import { Web3Utils } from "../web3utils";
import { SqliteHelper } from "../sqliteHelper";
import { univ2Pool_abi } from "../abi/pool/univ2pool";

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
        const token0Info = web3utils.getTokenInfo(
            event.returnValues.token0 as string
        );
        const token1Info = web3utils.getTokenInfo(
            event.returnValues.token1 as string
        );

        // Wait for both promises to resolve
        try {
            const [token0, token1] = await Promise.all([
                token0Info,
                token1Info,
            ]);

            if (token0 && token1) {
                sqliteHelper.addToken(token0);
                sqliteHelper.addToken(token1);

                let edge = this.decodeV2PoolCreatedEvent(protocol, event);
                await sqliteHelper.addV2Edge(edge);
            }
        } catch (error) {
            throw new Error("Get Token Info Error");
        }
    }

    static async handleV3CreatedEvent(
        event: EventLog,
        protocol: ProtocolName,
        web3utils: Web3Utils,
        sqliteHelper: SqliteHelper
    ) {
        const token0Info = web3utils.getTokenInfo(
            event.returnValues.token0 as string
        );
        const token1Info = web3utils.getTokenInfo(
            event.returnValues.token1 as string
        );

        //Wait for both promises to resolve
        try {
            const [token0, token1] = await Promise.all([
                token0Info,
                token1Info,
            ]);
            if (token0 && token1) {
                sqliteHelper.addToken(token0);
                sqliteHelper.addToken(token1);

                let edge = this.decodeV3PoolCreatedEvent(protocol, event);
                await sqliteHelper.addV3Edge(edge);
            }
        } catch (error) {
            throw new Error("Get Token Info Error");
        }
    }
}
