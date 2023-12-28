export const balancerPool_abi = [
    {
        "inputs":[
            {
                "internalType":"address",
                "name":"pool",
                "type":"address"
            }
        ],
        "name":"isPoolFromFactory",
        "outputs":[
            {
                "internalType":"bool",
                "name":"","type":"bool"
            }
        ],
        "stateMutability":"view",
        "type":"function"
    }
] as const 