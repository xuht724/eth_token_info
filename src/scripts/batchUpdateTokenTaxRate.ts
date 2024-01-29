import { Web3Utils } from "../toolHelpers/web3utils";
import { SqliteHelper } from "../toolHelpers/sqliteHelper";
import { MulticallHelper } from "../toolHelpers/multicallHelper";
import { erc20_abi } from "../abi/erc20";
import { HTTP_NODE_URL, sqlite_database } from "../config";
import { v2SwapHash, transferHash } from "../constants/eventHash";
import { DecodedParams } from "web3";

async function main() {
    const multicallHelper = new MulticallHelper(HTTP_NODE_URL);
    const web3Utils = new Web3Utils(HTTP_NODE_URL);
    const sqliteHelper = new SqliteHelper(sqlite_database);
    const currentBlock = Number(await web3Utils.myWeb3.eth.getBlockNumber());
    let tokenList = await sqliteHelper.getTokenWithNoTaxRate();
    //tokenList = ["0x91be752d438d5f804345b5acb18de0c431ad470f"];
    let res = new Map();
    let batchSize = 2000;
    
    for(let tokenAddress of tokenList){
        const tokenContract = new web3Utils.myWeb3.eth.Contract(erc20_abi, tokenAddress);
        let sellTax = 0, buyTax = 0;
        let transfer_from, transfer_to, transfer_value;
        let buyflag = false, sellflag = false;

        for(let blockNumber = currentBlock; blockNumber > 0; blockNumber -= batchSize){
            const TransferLogs: any[] = await tokenContract.getPastEvents(
                "Transfer",{
                    filter: {},
                    fromBlock: blockNumber - batchSize,
                    toBlock: blockNumber,
                }
            );
            for(let i = 0; i < TransferLogs.length; i++){
                transfer_from = '0x' + TransferLogs[i].topics[1].substring(26);
                transfer_to = '0x' + TransferLogs[i].topics[2].substring(26);
                transfer_value = BigInt(TransferLogs[i].data);
                const txReceipt = await web3Utils.myWeb3.eth.getTransactionReceipt(TransferLogs[i].transactionHash);
                if(txReceipt.logs.length == 1){
                    buyflag = true;
                    sellflag = true;
                    break;
                }
                let log_addresses = [];
                for(let log of txReceipt.logs){
                    if(log.topics != undefined && log.topics[0]== v2SwapHash){
                        const swapinfo : DecodedParams = web3Utils.myWeb3.eth.abi.decodeLog(
                            [
                                {
                                    "indexed": false,
                                    "internalType": "uint256",
                                    "name": "amount0In",
                                    "type": "uint256"
                                },
                                {
                                    "indexed": false,
                                    "internalType": "uint256",
                                    "name": "amount1In",
                                    "type": "uint256"
                                },
                                {
                                    "indexed": false,
                                    "internalType": "uint256",
                                    "name": "amount0Out",
                                    "type": "uint256"
                                },
                                {
                                    "indexed": false,
                                    "internalType": "uint256",
                                    "name": "amount1Out",
                                    "type": "uint256"
                                }
                            ],
                            String(log.data),
                            log.topics[0]
                        );
                        // buy tax
                        if(log.address == transfer_from && buyTax == 0){
                            const swap_to = '0x' + String(log.topics[2]).substring(26);
                            if(BigInt(String(swapinfo.amount0Out)) > 0){
                                if(swapinfo.amount0Out == transfer_value){
                                    buyflag = true;
                                    break;
                                }else{
                                    if(swap_to == transfer_to){
                                        buyTax = Number(BigInt(String(swapinfo.amount0Out)) - transfer_value) / Number(swapinfo.amount0Out);
                                        buyflag = true;
                                        break;
                                    }
                                }
                            }else{
                                if(swapinfo.amount1Out == transfer_value){
                                    buyflag = true;
                                    break;
                                }else{
                                    if(swap_to == transfer_to){
                                        buyTax = Number(BigInt(String(swapinfo.amount1Out)) - transfer_value) / Number(swapinfo.amount1Out);
                                        buyflag = true;
                                        break;
                                    }
                                }
                            }
                        }
                        // sell tax
                        else if(log.address == transfer_to && sellTax == 0){
                            const swap_from = '0x' + String(log.topics[1]).substring(26);
                            if((swapinfo.amount0In == transfer_value || swapinfo.amount1In == transfer_value) && swap_from != transfer_from){
                                for(let findlog of txReceipt.logs){
                                    if(log == findlog) break;
                                    if(findlog.topics != undefined && findlog.topics[0] == transferHash && findlog.address == tokenAddress){
                                        const transfer_from_2 = '0x' + String(findlog.topics[1]).substring(26);
                                        const transfer_to_2 = '0x' + String(findlog.topics[2]).substring(26);
                                        if(transfer_from_2 == transfer_from && transfer_to_2 != transfer_to && !log_addresses.includes(transfer_to_2)){
                                            const transfer_value_2 = BigInt(String(findlog.data));
                                            sellTax = Number(transfer_value_2) / Number(transfer_value + transfer_value_2);
                                            break;
                                        }
                                    }
                                }
                            }
                            sellflag = true;
                            break;
                        }
                    }
                    log_addresses.push(log.address);
                }
                if(sellflag && buyflag) break;
            }
            if(sellflag && buyflag) break;
        }
        res.set(tokenAddress, [sellTax, buyTax]);
        if(res.size >= 10){
            await sqliteHelper.batchUpdateTokenTaxRate(res);
            res.clear();
        }
    }
    await sqliteHelper.batchUpdateTokenTaxRate(res);
}

main();