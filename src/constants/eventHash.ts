export const transferHash = "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef";
export const v2SwapHash = "0xd78ad95fa46c994b6551d0da85fc275fe613ce37657fb8d5e3d130840159d822";


export const logTopicsMap = {
    UniV2Pool_PoolCreated: "0x0d3648bd0f6ba80134a33ba9275ac585d9d315f0ad8355cddefde31afa28d0e9",
    UniV3Pool_PoolCreated: "0x783cca1c0412dd0d695e784568c96da2e9c22ff989357a2e8b1d9b2b4e6b7118"
} as const


export const PoolCreatedABIMap = {
    UniV2Pool_PoolCreated: {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "address",
                "name": "token0",
                "type": "address"
            },
            {
                "indexed": true,
                "internalType": "address",
                "name": "token1",
                "type": "address"
            },
            {
                "indexed": false,
                "internalType": "address",
                "name": "pair",
                "type": "address"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "id",
                "type": "uint256"
            }
        ],
        "name": "PairCreated",
        "type": "event"
    },
    UniV3Pool_PoolCreated: {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "address",
                "name": "token0",
                "type": "address"
            },
            {
                "indexed": true,
                "internalType": "address",
                "name": "token1",
                "type": "address"
            },
            {
                "indexed": true,
                "internalType": "uint24",
                "name": "fee",
                "type": "uint24"
            },
            {
                "indexed": false,
                "internalType": "int24",
                "name": "tickSpacing",
                "type": "int24"
            },
            {
                "indexed": false,
                "internalType": "address",
                "name": "pool",
                "type": "address"
            }
        ],
        "name": "PoolCreated",
        "type": "event"
    },
    BalancerWeighted_PoolCreated: {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "address",
                name: "pool",
                type: "address",
            },
        ],
        name: "PoolCreated",
        type: "event",
    }
} as const 
