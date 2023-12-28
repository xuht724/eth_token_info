import { ProtocolName, BalancerPool } from "./protocol";

export interface v2Edge {
    protocolName: ProtocolName,
    pairAddress: string,
    token0: string,
    token1: string,
    blockTimestampLast?: number,
}

export interface v3Edge {
    protocolName: ProtocolName,
    pairAddress: string,
    token0: string,
    token1: string
    fee: number,
    tickSpacing: number
    blockTimestampLast?: number
}

export interface balancerEdge {
    protocolName: ProtocolName,
    poolType: BalancerPool,
    pairAddress: string,
    pairId: string,
    tokens: string[],
    blockTimestampLast?: number
}