export const balancerWeightedFactoryABI = [
    {
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
    },
] as const;
