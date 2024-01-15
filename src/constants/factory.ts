import { ProtocolName, PoolType } from "../types";

export const balancerVaultAddress =
    "0xBA12222222228d8Ba445958a75a0704d566BF2C8";

export const v2FactoryAddressMap: { [key: string]: string } = {
    UniswapV2: "0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f",
};

type FactoryInfo = {
    protocol: ProtocolName;
    beginBlockNumber: number;
    poolType: PoolType;
};

export const v2FactoryInfoMap: { [key: string]: FactoryInfo } = {
    "0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f": {
        protocol: ProtocolName.UniswapV2,
        beginBlockNumber: 10000835,
        poolType: PoolType.UNISWAP_V2_LIKE_POOL,
    },
    "0xC0AEe478e3658e2610c5F7A4A2E1777cE9e4f2Ac": {
        protocol: ProtocolName.SushiswapV2,
        beginBlockNumber: 10794229,
        poolType: PoolType.UNISWAP_V2_LIKE_POOL,
    },
    "0x1097053Fd2ea711dad45caCcc45EfF7548fCB362": {
        protocol: ProtocolName.PancakeswapV2,
        beginBlockNumber: 15614590,
        poolType: PoolType.UNISWAP_V2_LIKE_POOL,
    },
    "0x115934131916C8b277DD010Ee02de363c09d037c": {
        protocol: ProtocolName.Shibaswap,
        beginBlockNumber: 12771526,
        poolType: PoolType.UNISWAP_V2_LIKE_POOL,
    },
};

export const v3FactoryInfoMap: { [key: string]: any } = {
    "0x1F98431c8aD98523631AE4a59f267346ea31F984": {
        protocol: ProtocolName.UniswapV3,
        beginBlockNumber: 12369621,
        poolType: PoolType.UNISWAP_V3_LIKE_POOL,
    },
    "0xbACEB8eC6b9355Dfc0269C18bac9d6E2Bdc29C4F": {
        protocol: ProtocolName.SushiswapV3,
        beginBlockNumber: 16955547,
        poolType: PoolType.UNISWAP_V3_LIKE_POOL,
    },
    "0x0BFbCF9fa4f9C56B0F40a671Ad40E0805A091865": {
        protocol: ProtocolName.PancakeswapV3,
        beginBlockNumber: 16950687,
        poolType: PoolType.UNISWAP_V3_LIKE_POOL,
    },
};

export const balancerFactoryInfoMap: {
    [key: string]: FactoryInfo;
} = {
    "0x897888115Ada5773E02aA29F775430BFB5F34c51": {
        protocol: ProtocolName.Balancer,
        beginBlockNumber: 16878323,
        poolType: PoolType.BALANCER_WEIGHTED_POOL,
    },
    "0x5Dd94Da3644DDD055fcf6B3E1aa310Bb7801EB8b": {
        protocol: ProtocolName.Balancer,
        beginBlockNumber: 16580891,
        poolType: PoolType.BALANCER_WEIGHTED_POOL,
    },
    "0xcC508a455F5b0073973107Db6a878DdBDab957bC": {
        protocol: ProtocolName.Balancer,
        beginBlockNumber: 15497271,
        poolType: PoolType.BALANCER_WEIGHTED_POOL,
    },
    "0x8E9aa87E45e92bad84D5F8DD1bff34Fb92637dE9": {
        protocol: ProtocolName.Balancer,
        beginBlockNumber: 12272147,
        poolType: PoolType.BALANCER_WEIGHTED_POOL,
    },
    "0xA5bf2ddF098bb0Ef6d120C98217dD6B141c74EE0": {
        protocol: ProtocolName.Balancer,
        beginBlockNumber: 12349891,
        poolType: PoolType.BALANCER_WEIGHTED_POOL,
    },
};
