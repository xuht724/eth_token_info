import { ProtocolName } from "./types";

export const ERIGON_URL = "http://127.0.0.1:8547";
export const GETH_URL = "http://127.0.0.1:8545";
export const WS_GETH_URL = "ws://127.0.0.1:8546";


export const sqlite_database = '/home/haotianxu/sqlite/eth_token_graph/data.db'

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
        protocol: ProtocolName.UniswapV2,
        beginBlockNumber: 10000835
    },
    "0xC0AEe478e3658e2610c5F7A4A2E1777cE9e4f2Ac": {
        protocol: ProtocolName.SushiswapV2,
        beginBlockNumber: 10794229
    },
    "0x1097053Fd2ea711dad45caCcc45EfF7548fCB362": {
        protocol: ProtocolName.PancakeswapV2,
        beginBlockNumber: 15614590
    },
    "0x115934131916C8b277DD010Ee02de363c09d037c": {
        protocol: ProtocolName.Shibaswap,
        beginBlockNumber: 12771526
    }
}
export const v3_factory_deployedBlock_map: { [key: string]: any } = {
    "0x1F98431c8aD98523631AE4a59f267346ea31F984": {
        protocol: ProtocolName.UniswapV3,
        beginBlockNumber: 12369621
    },
    "0xbACEB8eC6b9355Dfc0269C18bac9d6E2Bdc29C4F": {
        protocol: ProtocolName.SushiswapV3,
        beginBlockNumber: 16955547
    },
    "0x0BFbCF9fa4f9C56B0F40a671Ad40E0805A091865": {
        protocol: ProtocolName.PancakeswapV3,
        beginBlockNumber: 16950687
    },

}


const initialToken = [
    "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
    "0xdAC17F958D2ee523a2206206994597C13D831ec7",
    "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48"
]