// import { ethers } from "ethers";
// import Web3, { HttpProvider, eth } from "web3";
// import { Provider, Contract, Call } from "ethcall";
// //@ts-ignore
// import univ3Pool_abi_json from './abi/json/univ3pool.json' assert { type: "json" };
// //@ts-ignore
// import univ2Pool_abi_json from './abi/json/univ2pool.json'assert { type: "json" };
// //@ts-ignore
// import erc20_abi_json from './abi/json/erc20.json'assert { type: "json" };

// export interface IEdgeBlockTimestamp {
//     edge: string,
//     blockTimestampLast: number,
// }

// export class MulticallHelper {
//     ethcallProvider: Provider;

//     constructor(node_url: string) {
//         const provider = new ethers.JsonRpcProvider(node_url)
//         this.ethcallProvider = new Provider(1, provider);
//     }

//     public async batchGetTokenDecimals(tokenList: string[]): Promise<Map<string, number>> {
//         const batchSize = 2000;
//         const resultMap: Map<string, number> = new Map();
//         for (let i = 0; i < tokenList.length; i += batchSize){
//             const batch = tokenList.slice(i, i + batchSize);
//             let ContractCalllist: Call[] = [];
//             for (const tokenAddress of batch) {
//                 let tokenContract = new Contract(tokenAddress, erc20_abi_json);
//                 ContractCalllist.push(tokenContract.decimals());
//             }
//             try {
//                 const data = await this.ethcallProvider.tryAll(ContractCalllist);

//                 // Process the results and update the resultMap
//                 data.forEach((result: any, index) => {
//                     const tokenAddress = batch[index];
//                     // Check if the result is not null
//                     if (result !== null && result !== undefined) {
//                         const decimal = Number(result); // Adjust this based on actual return data
//                         resultMap.set(tokenAddress, decimal);
//                     }
//                 });
//             }catch (error) {
//                 console.error(`Error in batchGetV2EdgeBlockTimestamp for batch starting`);
//                 throw error;
//             }
//         }
//         let end = performance.now();
//         // console.log(end - begin);

//         return resultMap;
//     }

//     public async batchGetV2EdgeBlockTimestamp(v2EdgeList: string[]): Promise<Map<string, number>> {
//         const batchSize = 2000;
//         let begin = performance.now();

//         // Initialize the map to store results
//         const resultMap: Map<string, number> = new Map();

//         for (let i = 0; i < v2EdgeList.length; i += batchSize) {
//             const batch = v2EdgeList.slice(i, i + batchSize);

//             let ContractCalllist: Call[] = [];
//             for (const v2Edge of batch) {
//                 let v2EdgeContract = new Contract(v2Edge, univ2Pool_abi_json);
//                 ContractCalllist.push(v2EdgeContract.getReserves());
//             }

//             try {
//                 const data = await this.ethcallProvider.tryAll(ContractCalllist);

//                 // Process the results and update the resultMap
//                 data.forEach((result: any, index) => {
//                     const v2Edge = batch[index];
//                     // Check if the result is not null
//                     if (result !== null && result !== undefined) {
//                         const blockTimestampLast = Number(result['_blockTimestampLast']); // Adjust this based on actual return data
//                         resultMap.set(v2Edge, blockTimestampLast);
//                     }
//                 });
//             } catch (error) {
//                 console.error(`Error in batchGetV2EdgeBlockTimestamp for batch starting`);
//                 throw error;
//             }
//         }

//         let end = performance.now();
//         // console.log(end - begin);

//         return resultMap;
//     }

//     public async batchGetV3EdgeBlockTimestamp(v3EdgeList: string[]): Promise<Map<string, number>> {
//         const batchSize = 2000;
//         let begin = performance.now();

//         // Initialize the map to store results
//         const resultMap: Map<string, number> = new Map();

//         for (let i = 0; i < v3EdgeList.length; i += batchSize) {
//             const batch = v3EdgeList.slice(i, i + batchSize);

//             let ContractCalllist: Call[] = [];
//             for (const v3Edge of batch) {
//                 let v3EdgeContract = new Contract(v3Edge, univ3Pool_abi_json);
//                 ContractCalllist.push(v3EdgeContract.slot0());
//             }

//             try {
//                 const slot0Results = await this.ethcallProvider.tryAll(ContractCalllist);
//                 // console.log(slot0Results);

//                 let v3EdgeList: string[] = []
//                 let observationCallList: Call[] = []
//                 slot0Results.forEach((result: any, index) => {
//                     const v3Edge = batch[index];
//                     // Check if the result is not null
//                     if (result !== null && result !== undefined) {
//                         v3EdgeList.push(v3Edge);
//                         const observationIndex = Number(result['observationIndex']); // Adjust this based on actual return data
//                         // Now, make a call to observations with the obtained observationIndex
//                         const v3EdgeContract = new Contract(v3Edge, univ3Pool_abi_json);
//                         observationCallList.push(v3EdgeContract.observations(observationIndex))
//                     }
//                 })
//                 const observationResults = await this.ethcallProvider.tryAll(observationCallList);
//                 observationResults.forEach((result: any, index) => {
//                     const v3Edge = v3EdgeList[index];

//                     // Check if the result is not null
//                     if (result !== null && result !== undefined) {
//                         const blockTimestamp = Number(result['blockTimestamp']); // Adjust this based on actual return data
//                         resultMap.set(v3Edge, blockTimestamp);
//                     }
//                 })
//             } catch (error) {
//                 // console.error('Error in batchGetV3EdgeBlockTimestamp:',message);
//                 throw error;
//             }
//         }

//         let end = performance.now();
//         // console.log(end - begin);

//         return resultMap;
//     }

// }
