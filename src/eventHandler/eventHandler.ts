import { ChainStateHelper } from "../chainStateHelper"
import {Log} from 'viem'
import { decodeEvent } from "../utils"
import { PoolCreatedEventABIMap } from "../constants/EventMap"
export class EventHandler{
    chainStateHelper: ChainStateHelper
    constructor(node_url: string) {
        this.chainStateHelper = new ChainStateHelper(node_url)
    }

    public handleV2Event(log: Log) {
        let event = decodeEvent(log, PoolCreatedEventABIMap.V2PoolCreated);
        console.log(event);
    }

    

}