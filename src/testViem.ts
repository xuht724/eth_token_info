import { EventHandler } from "./eventHandler";

import { ALCHEMY_URL } from "./config";
import { PoolCreatedEventABIMap } from "./constants/EventMap";

async function main() {
    let eventHandler = new EventHandler(ALCHEMY_URL);
    const logs = await eventHandler.chainStateHelper.publicClient.getLogs({
        address: '0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f',
        event: PoolCreatedEventABIMap.V2PoolCreated,
        fromBlock: BigInt(10000835),
        toBlock: BigInt(10100835)
    })
    for (const log of logs) {
        eventHandler.handleV2Event(log)

    }
    
}

main()