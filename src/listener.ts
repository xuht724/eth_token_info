import { Web3, EventLog } from "web3";
import { v2_factory_deployedBlock_map, v3_factory_deployedBlock_map, balancer_factory_address_map, balancer_factory_deployedBlock_map } from "./config";
import { v2_factory_abi } from "./abi/factory/univ2Factory";
import { SqliteHelper } from "./sqliteHelper/sqliteHelper";
import { ProtocolName, v2Edge, v3Edge, balancerEdge, TokenInfo, BalancerPool } from "./types";
import { Web3Utils } from "./web3utils";
import { univ2Pool_abi } from "./abi/pool/univ2pool";
import { uniV3Pool_abi } from "./abi/pool/univ3pool";
import { balancerVault_abi } from "./abi/pool/balancervault";
import { balancerPool_abi } from "./abi/pool/balancerpool";
import { v3_factory_abi } from "./abi/factory/univ3Factory";
import { Token } from "typescript";
import { add } from "winston";

export function createV2ListenrContract(factoryAddress: string, wsWeb3: Web3, web3utils: Web3Utils, sqliteHelper: SqliteHelper) {
    const { protocol } = v2_factory_deployedBlock_map[factoryAddress];
    const v2FactoryContract = new wsWeb3.eth.Contract(v2_factory_abi, factoryAddress);

    // Listen to PairCreated events from the latest block
    v2FactoryContract.events.PairCreated({ fromBlock: 'latest' })
        .on('data', async (event: EventLog) => {
            console.log(`New ${protocol} V2 PairCreated event in ${factoryAddress}:`);
            // console.log(event);
            await handleV2CreatedEvent(event, protocol, web3utils, sqliteHelper);
        }
        )
}

export function createV3ListenrContract(factoryAddress: string, wsWeb3: Web3, web3utils: Web3Utils, sqliteHelper: SqliteHelper) {
    const { protocol } = v3_factory_deployedBlock_map[factoryAddress];
    const v3FactoryContract = new wsWeb3.eth.Contract(v3_factory_abi, factoryAddress);

    // Listen to PairCreated events from the latest block
    v3FactoryContract.events.PoolCreated({ fromBlock: 'latest' })
        .on('data', async (event: EventLog) => {
            console.log(`New ${protocol} V3 PairCreated event in ${factoryAddress}`);
            // console.log(event);
            await handleV3CreatedEvent(event, protocol, web3utils, sqliteHelper)
        }
        )
}

export function createBalancerListenrContract(factoryAddress: string, wsWeb3: Web3, web3utils: Web3Utils, sqliteHelper: SqliteHelper) {
    const BalancerVaultContract = new wsWeb3.eth.Contract(balancerVault_abi, factoryAddress);

    // Listen to PairCreated events from the latest block
    BalancerVaultContract.events.PoolRegistered({ fromBlock: 'latest' })
        .on('data', async (event: EventLog) => {
            console.log(`New Balancer PoolRegistered event in ${factoryAddress}`)
            await handleBalancerCreatedEvent(event, factoryAddress, web3utils, sqliteHelper)
        }
        )
}

export async function handleV2CreatedEvent(event: EventLog, protocol: ProtocolName, web3utils: Web3Utils, sqliteHelper: SqliteHelper) {
    const token0Info = web3utils.getTokenInfo(event.returnValues.token0 as string);
    const token1Info = web3utils.getTokenInfo(event.returnValues.token1 as string);

    // Wait for both promises to resolve
    const [token0, token1] = await Promise.all([token0Info, token1Info]);

    if (token0 && token1) {
        sqliteHelper.addToken(token0);
        sqliteHelper.addToken(token1)

        let blockTimestampLast = 0;
        let pairAddress = (event.returnValues.pair as string).toLowerCase();
        // Get V2 Edge Block Price State
        let v2Contract = new web3utils.myWeb3.eth.Contract(univ2Pool_abi, pairAddress)
        let reservesInfo = await v2Contract.methods.getReserves().call();
        blockTimestampLast = Number(reservesInfo._blockTimestampLast)
        // Create the edge object
        const edge: v2Edge = {
            protocolName: protocol,
            pairAddress,
            token0: (event.returnValues.token0 as string).toLowerCase(),
            token1: (event.returnValues.token1 as string).toLowerCase(),
            blockTimestampLast,
        };
        // Store the edge information in Neo4j
        sqliteHelper.addV2Edge(edge);
    }
}

export async function handleV3CreatedEvent(event: EventLog, protocol: ProtocolName, web3utils: Web3Utils, sqliteHelper: SqliteHelper) {
    const token0Info = web3utils.getTokenInfo(event.returnValues.token0 as string);
    const token1Info = web3utils.getTokenInfo(event.returnValues.token1 as string);

    // Wait for both promises to resolve
    const [token0, token1] = await Promise.all([token0Info, token1Info]);

    // Store token information in Neo4j concurrently
    if (token0 && token1) {
        sqliteHelper.addToken(token0)
        sqliteHelper.addToken(token1)

        // Create the edge object
        let blockTimestampLast = 0;
        let pairAddress = event.returnValues.pool as string;
        // Get V2 Edge Block Price State
        try {
            // console.log(pairAddress);
            let v3Contract = new web3utils.myWeb3.eth.Contract(uniV3Pool_abi, pairAddress);
            let slot0 = await v3Contract.methods.slot0().call();
            let obeservationIndex = Number(slot0.observationIndex);
            let observations = await v3Contract.methods.observations(obeservationIndex).call();
            blockTimestampLast = Number(observations.blockTimestamp)
            const edge: v3Edge = {
                protocolName: protocol,
                pairAddress: event.returnValues.pool as string,
                token0: event.returnValues.token0 as string,
                token1: event.returnValues.token1 as string,
                fee: Number(event.returnValues.fee),
                tickSpacing: Number(event.returnValues.tickSpacing),
                blockTimestampLast
            };
            // Store the edge information in Neo4j
            sqliteHelper.addV3Edge(edge);
        } catch (error) {
            console.log('Error in getting slot0');
            const edge: v3Edge = {
                protocolName: protocol,
                pairAddress: event.returnValues.pool as string,
                token0: event.returnValues.token0 as string,
                token1: event.returnValues.token1 as string,
                fee: Number(event.returnValues.fee),
                tickSpacing: Number(event.returnValues.tickSpacing),
                blockTimestampLast
            };
            // Store the edge information in Neo4j
            sqliteHelper.addV3Edge(edge);
        }
    }
}

export async function handleBalancerCreatedEvent(event: EventLog, factoryAddress: string, web3utils: Web3Utils, sqliteHelper: SqliteHelper) {
    const BalancerVaultContract = new web3utils.myWeb3.eth.Contract(balancerVault_abi, factoryAddress);
    const poolId = event.returnValues.poolId as string
    const poolAddress = event.returnValues.poolAddress as string
    const poolToken = await BalancerVaultContract.methods.getPoolTokens(poolId).call()
    if(poolToken.tokens.length > 0){
        let infoList = []
        for(let i = 0; i < poolToken.tokens.length; i++){
            const info = web3utils.getTokenInfo(poolToken.tokens[i] as string)
            infoList.push(info)
            poolToken.tokens[i] = (poolToken.tokens[i] as string).toLowerCase()
        }

        // Wait for both promises to resolve
        const res = await Promise.all(infoList);
        let temp = true
        for(let i = 0; i < res.length; i++){
            if(res[i] == null){
                temp = false
                break
            }
        }

        if (temp) {
            for(let i = 0; i < res.length; i++){
                sqliteHelper.addToken(res[i] as TokenInfo)
            }

            let blockinfo = await web3utils.myWeb3.eth.getBlock(poolToken.lastChangeBlock)
            let blockTimestampLast = Number(blockinfo.timestamp)
            // Set pool type
            let pooltype = BalancerPool.Unknown;
            let isPoolTypeList = []
            let addressList = []
            for (const address in balancer_factory_address_map) {
                let { type, beginBlockNumber } = balancer_factory_deployedBlock_map[balancer_factory_address_map[address]];
                if(beginBlockNumber <= Number(event.blockNumber)){
                    addressList.push(balancer_factory_address_map[address])
                }
            }
            for (let i = 0; i < addressList.length; i++) {
                const poolContract = new web3utils.myWeb3.eth.Contract(balancerPool_abi, addressList[i]);
                isPoolTypeList.push(poolContract.methods.isPoolFromFactory(poolAddress).call())
            }
            const isPoolTypeRes: boolean[] = await Promise.all(isPoolTypeList)
            for(let i = 0; i < isPoolTypeRes.length; i++){
                if(isPoolTypeRes[i] === true){
                    const { type } = balancer_factory_deployedBlock_map[addressList[i]];
                    pooltype = type
                    break
                }
            }
            // Create the edge object
            const edge: balancerEdge = {
                protocolName: ProtocolName.Balancer,
                poolType: pooltype,
                pairAddress: event.returnValues.poolAddress as string,
                pairId: event.returnValues.poolId as string,
                tokens: poolToken.tokens,
                blockTimestampLast
            };
            // Store the edge information in Neo4j
            sqliteHelper.addBalancerEdge(edge);
        }
    }
}
