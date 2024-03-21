import { Web3Utils } from "../toolHelpers/web3utils";
import { SqliteHelper } from "../toolHelpers/sqliteHelper";
import { MulticallHelper } from "../toolHelpers/multicallHelper";
import { erc20_abi } from "../abi/erc20";
import { GETH_URL, HTTP_NODE_URL, sqlite_database } from "../config";
import { v2SwapHash, transferHash } from "../constants/eventHash";
import { DecodedParams } from "web3";
import { Token } from "../types";

async function testCalculateTokenTax(tokenAddress: string) {
    const web3Utils = new Web3Utils(GETH_URL);
    let buyTax = await web3Utils.calculateBuyTax_by_V2Pool(tokenAddress);
    console.log(tokenAddress, buyTax);
}
// const token = "0x91be752d438d5f804345b5acb18de0c431ad470f"
// testCalculateTokenTax(token);

async function main() {
    const multicallHelper = new MulticallHelper(GETH_URL);
    const web3Utils = new Web3Utils(GETH_URL);
    const sqliteHelper = new SqliteHelper(sqlite_database);
    const currentBlock = Number(await web3Utils.myWeb3.eth.getBlockNumber());
    let tokenList = await sqliteHelper.getTokenWithZeroBuyTaxRate();
    // tokenList = [
    //     "0x91be752d438d5f804345b5acb18de0c431ad470f",
    //     "0xe92344b4edf545f3209094b192e46600a19e7c2d",
    //     "0xf819d9cb1c2a819fd991781a822de3ca8607c3c9",
    //     // "0x1a7981d87e3b6a95c1516eb820e223fe979896b3",
    // ];
    let res = new Map();

    console.log(tokenList.length);

    for (let [index, tokenAddress] of tokenList.entries()) {
        console.log(`${index}/${tokenList.length}`);
        let buyTax = await web3Utils.calculateTokenBuyTax(tokenAddress, currentBlock);
        console.log(tokenAddress, buyTax);
        // const tokenContract = new web3Utils.myWeb3.eth.Contract(erc20_abi, tokenAddress);
        // let sellTax = 0, buyTax = 0;
        // let transfer_from, transfer_to, transfer_value;
        // let buyflag = false, sellflag = false;

        // for (let blockNumber = currentBlock; blockNumber > 0; blockNumber -= batchSize) {
        //     const TransferLogs: any[] = await tokenContract.getPastEvents(
        //         "Transfer", {
        //         filter: {},
        //         fromBlock: blockNumber - batchSize,
        //         toBlock: blockNumber,
        //     }
        //     );
        //     for (let i = 0; i < TransferLogs.length; i++) {
        //         transfer_from = '0x' + TransferLogs[i].topics[1].substring(26);
        //         transfer_to = '0x' + TransferLogs[i].topics[2].substring(26);
        //         transfer_value = BigInt(TransferLogs[i].data);
        //         const txReceipt = await web3Utils.myWeb3.eth.getTransactionReceipt(TransferLogs[i].transactionHash);
        //         if (txReceipt.logs.length == 1) {
        //             buyflag = true;
        //             sellflag = true;
        //             break;
        //         }
        //         let log_addresses = [];
        //         for (let log of txReceipt.logs) {
        //             if (log.topics != undefined && log.topics[0] == v2SwapHash) {
        //                 const swapinfo: DecodedParams = web3Utils.myWeb3.eth.abi.decodeLog(
        //                     [
        //                         {
        //                             "indexed": false,
        //                             "internalType": "uint256",
        //                             "name": "amount0In",
        //                             "type": "uint256"
        //                         },
        //                         {
        //                             "indexed": false,
        //                             "internalType": "uint256",
        //                             "name": "amount1In",
        //                             "type": "uint256"
        //                         },
        //                         {
        //                             "indexed": false,
        //                             "internalType": "uint256",
        //                             "name": "amount0Out",
        //                             "type": "uint256"
        //                         },
        //                         {
        //                             "indexed": false,
        //                             "internalType": "uint256",
        //                             "name": "amount1Out",
        //                             "type": "uint256"
        //                         }
        //                     ],
        //                     String(log.data),
        //                     log.topics[0]
        //                 );
        //                 // buy tax
        //                 if (log.address == transfer_from && buyTax == 0) {
        //                     const swap_to = '0x' + String(log.topics[2]).substring(26);
        //                     if (BigInt(String(swapinfo.amount0Out)) > 0) {
        //                         if (swapinfo.amount0Out == transfer_value) {
        //                             buyflag = true;
        //                             break;
        //                         } else {
        //                             if (swap_to == transfer_to) {
        //                                 buyTax = Number(BigInt(String(swapinfo.amount0Out)) - transfer_value) / Number(swapinfo.amount0Out);
        //                                 buyflag = true;
        //                                 break;
        //                             }
        //                         }
        //                     } else {
        //                         if (swapinfo.amount1Out == transfer_value) {
        //                             buyflag = true;
        //                             break;
        //                         } else {
        //                             if (swap_to == transfer_to) {
        //                                 buyTax = Number(BigInt(String(swapinfo.amount1Out)) - transfer_value) / Number(swapinfo.amount1Out);
        //                                 buyflag = true;
        //                                 break;
        //                             }
        //                         }
        //                     }
        //                 }
        //                 // sell tax
        //                 else if (log.address == transfer_to && sellTax == 0) {
        //                     const swap_from = '0x' + String(log.topics[1]).substring(26);
        //                     if ((swapinfo.amount0In == transfer_value || swapinfo.amount1In == transfer_value) && swap_from != transfer_from) {
        //                         for (let findlog of txReceipt.logs) {
        //                             if (log == findlog) break;
        //                             if (findlog.topics != undefined && findlog.topics[0] == transferHash && findlog.address == tokenAddress) {
        //                                 const transfer_from_2 = '0x' + String(findlog.topics[1]).substring(26);
        //                                 const transfer_to_2 = '0x' + String(findlog.topics[2]).substring(26);
        //                                 if (transfer_from_2 == transfer_from && transfer_to_2 != transfer_to && !log_addresses.includes(transfer_to_2)) {
        //                                     const transfer_value_2 = BigInt(String(findlog.data));
        //                                     sellTax = Number(transfer_value_2) / Number(transfer_value + transfer_value_2);
        //                                     break;
        //                                 }
        //                             }
        //                         }
        //                     }
        //                     sellflag = true;
        //                     break;
        //                 }
        //             }
        //             log_addresses.push(log.address);
        //         }
        //         if (sellflag && buyflag) break;
        //     }
        //     if (sellflag && buyflag) break;
        // }
        // console.log(tokenAddress, sellTax, buyTax);

        res.set(tokenAddress, [0, buyTax]);
        if (res.size >= 50 || res.size == tokenList.length) {
            await sqliteHelper.batchUpdateTokenTaxRate(res);
            res.clear();
        }
    }
    // await sqliteHelper.batchUpdateTokenTaxRate(res);
}

main();