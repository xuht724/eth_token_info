export type V2Pool_CreatedEvent = {
    token0: string,
    token1: string,
    pair: string,
    id: bigint
}

export type V3Pool_CreatedEvent = {
    token0: string,
    token1: string,
    fee: number,
    tickSpacing: number,
    pool: string
}