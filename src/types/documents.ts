import { Token } from "./token";

export enum PoolType {
    BALANCER_WEIGHTED_POOL = 'balancer_weighted_pool',
    UNISWAP_V2_LIKE_POOL = 'uniswap_v2_like_pool',
    UNISWAP_V3_LIKE_POOL = 'uniswap_v3_like_pool',
    CURVE_POOL = 'curve_pool'
}

export const enum DEX_EXCHANGE {
    BALANCER = 'balancer',
    CURVE = 'curve',
    UNISWAP = 'uniswap',
    SUSHISWAP = 'sushiswap',
    SHIBASWAP = 'shibaswap',
    PANCAKESWAP = 'pancakeswap',
}

export enum ProtocolName {
    Unknown = "unknown",
    UniswapV2 = 'uniswapV2',
    UniswapV3 = 'uniswapV3',
    SushiswapV2 = 'sushiswapV2',
    SushiswapV3 = 'sushiswapV3',
    PancakeswapV2 = 'pancakeswapV2',
    PancakeswapV3 = 'pancakeswapV3',
    Shibaswap = 'shibaswap',
    Curve = 'curve',
    BalancerV2 = 'balancerV2'
}


export enum DocumentType {
    CHECKPOINT = 'checkPoint',
    POOL = 'pool'
}

export enum CreatedMethod {
    FACTORY = 'factor',
    DIRECT = 'direct'
}


export type BaseDocument = {
    documentType: DocumentType
}

export type CheckPointDocument = {
    [ProtocolName.UniswapV2]: bigint;
    [ProtocolName.UniswapV3]: bigint;
    [ProtocolName.SushiswapV2]: bigint;
    [ProtocolName.SushiswapV3]: bigint;
    [ProtocolName.PancakeswapV2]: bigint;
    [ProtocolName.PancakeswapV3]: bigint;
    [ProtocolName.Shibaswap]: bigint;
    [ProtocolName.Curve]: bigint;
    [ProtocolName.BalancerV2]: bigint;
} & BaseDocument;

export type UniswapV3LikePoolDocument = {
    poolAddress: string
    token0: Token
    token1: Token
    tickSpacing: bigint
    swapFee: bigint
    createdMethod: CreatedMethod.FACTORY
    dexExchange: DEX_EXCHANGE
    poolType: PoolType
    protocolName: ProtocolName
} & BaseDocument

export type UniswapV2LikePoolDocument = {
    poolAddress: string
    token0: Token
    token1: Token
    createdMethod: CreatedMethod.FACTORY
    dexExchange: DEX_EXCHANGE
    poolType: PoolType
    protocolName: ProtocolName
} & BaseDocument

export type BalancerWeightedPoolDocument = {
    poolAddress: string
    poolId: string
    createdMethod: CreatedMethod.FACTORY
    dexExchange: DEX_EXCHANGE
    protocolName: ProtocolName
} & BaseDocument

export type CurvePoolDocument = {
    poolAddress: string
    dexExchange: DEX_EXCHANGE
    ProtocolName: ProtocolName
} & BaseDocument
