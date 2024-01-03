import { DEX_EXCHANGE } from "../types/documents"

export const v2_factory_address_map: { [key: string]: string } = {
    'uni_factory': "0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f",
    "sushi_factory": "0xC0AEe478e3658e2610c5F7A4A2E1777cE9e4f2Ac",
    "pancake_factory": "0x1097053Fd2ea711dad45caCcc45EfF7548fCB362",
    "shiba_factory": "0x115934131916C8b277DD010Ee02de363c09d037c"
}

export const v3_factory_address_map: { [key: string]: string } = {
    "uni_factory": "0x1F98431c8aD98523631AE4a59f267346ea31F984",
    "pancake_factory": "0x0BFbCF9fa4f9C56B0F40a671Ad40E0805A091865",
    'sushi_factory': "0xbACEB8eC6b9355Dfc0269C18bac9d6E2Bdc29C4F"
}

export const v2_factory_deployedBlock_map: { [key: string]: any } = {
    "0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f": {
        protocol: DEX_EXCHANGE.UNISWAP,
        beginBlockNumber: 10000835
    },
    "0xC0AEe478e3658e2610c5F7A4A2E1777cE9e4f2Ac": {
        protocol: DEX_EXCHANGE.SUSHISWAP,
        beginBlockNumber: 10794229
    },
    "0x1097053Fd2ea711dad45caCcc45EfF7548fCB362": {
        protocol: DEX_EXCHANGE.PANCAKESWAP,
        beginBlockNumber: 15614590
    },
    "0x115934131916C8b277DD010Ee02de363c09d037c": {
        protocol: DEX_EXCHANGE.SHIBASWAP,
        beginBlockNumber: 12771526
    }
}
export const v3_factory_deployedBlock_map: { [key: string]: any } = {
    "0x1F98431c8aD98523631AE4a59f267346ea31F984": {
        protocol: DEX_EXCHANGE.UNISWAP,
        beginBlockNumber: 12369621
    },
    "0xbACEB8eC6b9355Dfc0269C18bac9d6E2Bdc29C4F": {
        protocol: DEX_EXCHANGE.SUSHISWAP,
        beginBlockNumber: 16955547
    },
    "0x0BFbCF9fa4f9C56B0F40a671Ad40E0805A091865": {
        protocol: DEX_EXCHANGE.PANCAKESWAP,
        beginBlockNumber: 16950687
    }
}