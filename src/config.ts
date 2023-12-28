import { ProtocolName, BalancerPool } from "./types";
// https://eth-mainnet.g.alchemy.com/v2/AmGhouGifK4fNQtvtdZI_wQX1pdgHxQo
// https://mainnet.infura.io/v3/d562ab8be7824445a11dc8c7575552cd
// https://eth-mainnet.nodereal.io/v1/abf58db7a57847518733df4dd817bbbc
// wss://mainnet.infura.io/ws/v3/d562ab8be7824445a11dc8c7575552cd
// wss://eth-mainnet.g.alchemy.com/v2/AmGhouGifK4fNQtvtdZI_wQX1pdgHxQo
// wss://eth-mainnet.nodereal.io/ws/v1/abf58db7a57847518733df4dd817bbbc
//export const ERIGON_URL = "http://127.0.0.1:8547";
//export const GETH_URL = "http://127.0.0.1:8545";
//export const WS_GETH_URL = "ws://127.0.0.1:8546";
export const ERIGON_URL = "wss://mainnet.infura.io/ws/v3/d562ab8be7824445a11dc8c7575552cd";
export const GETH_URL = "https://eth-mainnet.g.alchemy.com/v2/AmGhouGifK4fNQtvtdZI_wQX1pdgHxQo";
export const WS_GETH_URL = "wss://eth-mainnet.g.alchemy.com/v2/AmGhouGifK4fNQtvtdZI_wQX1pdgHxQo";


export const sqlite_database = 'D:\\Program\\sqlite\\eth_token_graph\\data.db'

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

export const balancer_vault_address = "0xBA12222222228d8Ba445958a75a0704d566BF2C8"
export const balancer_vault_deployedBlock = 12272146

export const balancer_factory_address_map: { [key: string]: string } = {
    "aave_linear_v5_factory": "0x0b576c1245F479506e7C8bbc4dB4db07C1CD31F9",
    "aave_linear_v1_factory": "0xD7FAD3bd59D6477cbe1BE7f646F7f1BA25b230f8",
    "unbutton_aave_linear_factory": "0x9588c26142e345f1A0d005CfC0C6DF29A8Fa010C",
    "aave_rebalanced_linear_v1_factory": "0x6A0AC04f5C2A10297D5FA79FA6358837a8770041",
    "aave_rebalanced_linear_v3_factory": "0x7d833FEF5BB92ddb578DA85fc0c35cD5Cc00Fb3e",
    "aave_rebalanced_linear_v4_factory": "0xb9F8AB3ED3F3aCBa64Bc6cd2DcA74B7F38fD7B88",

    "erc4626_linear_v4_factory": "0x813EE7a840CE909E7Fea2117A44a90b8063bd4fd",
    "erc4626_linear_v3_factory": "0x67A25ca2350Ebf4a0C475cA74C257C94a373b828",
    "erc4626_linear_v2_factory": "0xE061bF85648e9FA7b59394668CfEef980aEc4c66",

    "euler_linear_factory": "0x5F43FBa61f63Fa6bFF101a0A0458cEA917f6B347",

    "gearbox_linear_v2_factory": "0x39A79EB449Fc05C92c39aA6f0e9BfaC03BE8dE5B",
    "gearbox_linear_v1_factory": "0x2EbE41E1aa44D61c206A94474932dADC7D3FD9E3",

    "silo_linear_v2_factory": "0x4E11AEec21baF1660b1a46472963cB3DA7811C89",
    "silo_linear_v1_factory": "0xfd1c0e6f02f71842b6ffF7CdC7A017eE1Fd3CdAC",

    "yearn_linear_v2_factory": "0x5F5222Ffa40F2AEd6380D022184D6ea67C776eE0",
    "yearn_linear_v1_factory": "0x8b7854708c0C54f9D7d1FF351D4F84E6dE0E134C",

    "no_protocol_fee_liquidity_boostrapping_factory": "0x0F3e0c4218b7b0108a3643cFe9D3ec0d4F57c54e",
    "liquidity_boostrapping_factory": "0x751A0bC0e3f75b38e01Cf25bFCE7fF36DE1C87DE",

    "composable_stable_v5_factory": "0xDB8d758BCb971e482B2C45f7F8a7740283A1bd3A",
    "composable_stable_v4_factory": "0xfADa0f4547AB2de89D1304A668C39B3E09Aa7c76",
    "composable_stable_v3_factory": "0xdba127fBc23fb20F5929C546af220A991b5C6e01",
    "composable_stable_v2_factory": "0x85a80afee867aDf27B50BdB7b76DA70f1E853062",
    "composable_stable_v1_factory": "0xf9ac7B9dF2b3454E841110CcE5550bD5AC6f875F",

    "stable_v2_factory": "0x8df6EfEc5547e31B0eb7d1291B511FF8a2bf987c",
    "stable_v1_factory": "0xc66Ba2B6595D3613CCab350C886aCE23866EDe24",

    "meta_stable_factory": "0x67d27634E44793fE63c467035E31ea8635117cd4",

    "stable_phantom_factory": "0xb08E16cFc07C684dAA2f93C70323BAdb2A6CBFd2",

    "managed_v2_factory": "0xBF904F9F340745B4f0c4702c7B6Ab1e808eA6b93",
    "managed_v1_factory": "0x9Ac3E70dB606659Bf32D4BdFbb687AD193FD1F5B",

    "weighted_v4_factory": "0x897888115Ada5773E02aA29F775430BFB5F34c51",
    "weighted_v3_factory": "0x5Dd94Da3644DDD055fcf6B3E1aa310Bb7801EB8b",
    "weighted_v2_factory": "0xcC508a455F5b0073973107Db6a878DdBDab957bC",
    "weighted_v1_factory": "0x8E9aa87E45e92bad84D5F8DD1bff34Fb92637dE9",
    "weighted_2Tokens_factory": "0xA5bf2ddF098bb0Ef6d120C98217dD6B141c74EE0",

    "investment_factory": "0x48767F9F868a4A7b86A90736632F6E44C2df7fa9",
}

export const balancer_factory_deployedBlock_map: { [key: string]: any } = {
    "0x0b576c1245F479506e7C8bbc4dB4db07C1CD31F9": {
        type: BalancerPool.LinearPool,
        beginBlockNumber: 17045353
    },
    "0xD7FAD3bd59D6477cbe1BE7f646F7f1BA25b230f8": {
        type: BalancerPool.LinearPool,
        beginBlockNumber: 13766443
    },
    "0x9588c26142e345f1A0d005CfC0C6DF29A8Fa010C": {
        type: BalancerPool.LinearPool,
        beginBlockNumber: 14655449
    },
    "0x6A0AC04f5C2A10297D5FA79FA6358837a8770041": {
        type: BalancerPool.LinearPool,
        beginBlockNumber: 15359085
    },
    "0x7d833FEF5BB92ddb578DA85fc0c35cD5Cc00Fb3e": {
        type: BalancerPool.LinearPool,
        beginBlockNumber: 16136501
    },
    "0xb9F8AB3ED3F3aCBa64Bc6cd2DcA74B7F38fD7B88": {
        type: BalancerPool.LinearPool,
        beginBlockNumber: 16600026
    },

    "0x813EE7a840CE909E7Fea2117A44a90b8063bd4fd": {
        type: BalancerPool.LinearPool,
        beginBlockNumber: 17045391
    },
    "0x67A25ca2350Ebf4a0C475cA74C257C94a373b828": {
        type: BalancerPool.LinearPool,
        beginBlockNumber: 16586540
    },
    "0xE061bF85648e9FA7b59394668CfEef980aEc4c66": {
        type: BalancerPool.LinearPool,
        beginBlockNumber: 14521506
    },

    "0x5F43FBa61f63Fa6bFF101a0A0458cEA917f6B347": {
        type: BalancerPool.LinearPool,
        beginBlockNumber: 16588077
    },

    "0x39A79EB449Fc05C92c39aA6f0e9BfaC03BE8dE5B": {
        type: BalancerPool.LinearPool,
        beginBlockNumber: 17052583
    },
    "0x2EbE41E1aa44D61c206A94474932dADC7D3FD9E3": {
        type: BalancerPool.LinearPool,
        beginBlockNumber: 16637919
    },

    "0x4E11AEec21baF1660b1a46472963cB3DA7811C89": {
        type: BalancerPool.LinearPool,
        beginBlockNumber: 17052627
    },
    "0xfd1c0e6f02f71842b6ffF7CdC7A017eE1Fd3CdAC": {
        type: BalancerPool.LinearPool,
        beginBlockNumber: 16869467
    },

    "0x5F5222Ffa40F2AEd6380D022184D6ea67C776eE0": {
        type: BalancerPool.LinearPool,
        beginBlockNumber: 17052602
    },
    "0x8b7854708c0C54f9D7d1FF351D4F84E6dE0E134C": {
        type: BalancerPool.LinearPool,
        beginBlockNumber: 16638024
    },

    "0x0F3e0c4218b7b0108a3643cFe9D3ec0d4F57c54e": {
        type: BalancerPool.LiquidityBootstrappingPool,
        beginBlockNumber: 13730248
    },
    "0x751A0bC0e3f75b38e01Cf25bFCE7fF36DE1C87DE": {
        type: BalancerPool.LiquidityBootstrappingPool,
        beginBlockNumber: 12871780
    },

    "0xDB8d758BCb971e482B2C45f7F8a7740283A1bd3A": {
        type: BalancerPool.ComposableStablePool,
        beginBlockNumber: 17672478
    },
    "0xfADa0f4547AB2de89D1304A668C39B3E09Aa7c76": {
        type: BalancerPool.ComposableStablePool,
        beginBlockNumber: 16878679
    },
    "0xdba127fBc23fb20F5929C546af220A991b5C6e01": {
        type: BalancerPool.ComposableStablePool,
        beginBlockNumber: 16580899
    },
    "0x85a80afee867aDf27B50BdB7b76DA70f1E853062": {
        type: BalancerPool.ComposableStablePool,
        beginBlockNumber: 16083775
    },
    "0xf9ac7B9dF2b3454E841110CcE5550bD5AC6f875F": {
        type: BalancerPool.ComposableStablePool,
        beginBlockNumber: 15485885
    },

    "0x8df6EfEc5547e31B0eb7d1291B511FF8a2bf987c": {
        type: BalancerPool.StablePool,
        beginBlockNumber: 14934936
    },
    "0xc66Ba2B6595D3613CCab350C886aCE23866EDe24": {
        type: BalancerPool.StablePool,
        beginBlockNumber: 12703127
    },
    "0x67d27634E44793fE63c467035E31ea8635117cd4": {
        type: BalancerPool.StablePool,
        beginBlockNumber: 13011941
    },
    "0xb08E16cFc07C684dAA2f93C70323BAdb2A6CBFd2": {
        type: BalancerPool.StablePool,
        beginBlockNumber: 13766527
    },

    "0xBF904F9F340745B4f0c4702c7B6Ab1e808eA6b93": {
        type: BalancerPool.ManagedPool,
        beginBlockNumber: 17046230
    },
    "0x9Ac3E70dB606659Bf32D4BdFbb687AD193FD1F5B": {
        type: BalancerPool.ManagedPool,
        beginBlockNumber: 15820459
    },

    "0x897888115Ada5773E02aA29F775430BFB5F34c51": {
        type: BalancerPool.WeightedPool,
        beginBlockNumber: 16878323
    },
    "0x5Dd94Da3644DDD055fcf6B3E1aa310Bb7801EB8b": {
        type: BalancerPool.WeightedPool,
        beginBlockNumber: 16580891
    },
    "0xcC508a455F5b0073973107Db6a878DdBDab957bC": {
        type: BalancerPool.WeightedPool,
        beginBlockNumber: 15497271
    },
    "0x8E9aa87E45e92bad84D5F8DD1bff34Fb92637dE9": {
        type: BalancerPool.WeightedPool,
        beginBlockNumber: 12272147
    },
    "0xA5bf2ddF098bb0Ef6d120C98217dD6B141c74EE0": {
        type: BalancerPool.WeightedPool,
        beginBlockNumber: 12349891
    },

    "0x48767F9F868a4A7b86A90736632F6E44C2df7fa9": {
        type: BalancerPool.InvestmentPool,
        beginBlockNumber: 13279079
    },
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