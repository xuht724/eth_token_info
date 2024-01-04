import {
    DEX_EXCHANGE,
    ProtocolName,
    PoolType
} from './types'
import {Log,decodeEventLog} from 'viem'
import {AbiEvent} from 'abitype'

export function getExchangeAndPoolType(protocolName: ProtocolName): { exchange: DEX_EXCHANGE, poolType: PoolType } {
    switch (protocolName) {
        case ProtocolName.UniswapV2:
            return { exchange: DEX_EXCHANGE.UNISWAP, poolType: PoolType.UNISWAP_V2_LIKE_POOL };
        case ProtocolName.UniswapV3:
            return { exchange: DEX_EXCHANGE.UNISWAP, poolType: PoolType.UNISWAP_V3_LIKE_POOL };
        case ProtocolName.SushiswapV2:
            return { exchange: DEX_EXCHANGE.SUSHISWAP, poolType: PoolType.UNISWAP_V2_LIKE_POOL };
        case ProtocolName.SushiswapV3:
            return { exchange: DEX_EXCHANGE.SUSHISWAP, poolType: PoolType.UNISWAP_V3_LIKE_POOL };
        case ProtocolName.PancakeswapV2:
            return { exchange: DEX_EXCHANGE.PANCAKESWAP, poolType: PoolType.UNISWAP_V2_LIKE_POOL };
        case ProtocolName.PancakeswapV3:
            return { exchange: DEX_EXCHANGE.PANCAKESWAP, poolType: PoolType.UNISWAP_V3_LIKE_POOL };
        case ProtocolName.Shibaswap:
            return { exchange: DEX_EXCHANGE.SHIBASWAP, poolType: PoolType.UNISWAP_V2_LIKE_POOL };
        case ProtocolName.Curve:
            return { exchange: DEX_EXCHANGE.CURVE, poolType: PoolType.CURVE_POOL };
        case ProtocolName.BalancerV2:
            return { exchange: DEX_EXCHANGE.BALANCER, poolType: PoolType.BALANCER_WEIGHTED_POOL };
        default:
            return { exchange: DEX_EXCHANGE.UNISWAP, poolType: PoolType.UNISWAP_V2_LIKE_POOL };
    }
}


export function decodeEvent(log: Log, abiEvent: AbiEvent) {
    let event = decodeEventLog({
        abi: [abiEvent],
        data: log.data,
        topics: log.topics
    })
    return event
}