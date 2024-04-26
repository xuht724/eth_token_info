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
    // let tokenList = await sqliteHelper.getTokenWithZeroBuyTaxRate();
    // tokenList = [
    //     "0x91be752d438d5f804345b5acb18de0c431ad470f",
    //     "0xe92344b4edf545f3209094b192e46600a19e7c2d",
    //     "0xf819d9cb1c2a819fd991781a822de3ca8607c3c9",
    //     // "0x1a7981d87e3b6a95c1516eb820e223fe979896b3",
    // ];
    let tokenList = [
        "0xb167C5F1E3506D81886Ed1b99d5302d9Efb0117A"
    ]
    let res = new Map();

    console.log(tokenList.length);

    for (let [index, tokenAddress] of tokenList.entries()) {
        console.log(`${index}/${tokenList.length}`);
        let buyTax = await web3Utils.calculateTokenBuyTax(tokenAddress, currentBlock);
        console.log(tokenAddress, buyTax);

        res.set(tokenAddress, [0, buyTax]);
        if (res.size >= 1 || res.size == tokenList.length) {
            await sqliteHelper.batchUpdateTokenTaxRate(res);
            res.clear();
        }
    }
    // await sqliteHelper.batchUpdateTokenTaxRate(res);
}

main();