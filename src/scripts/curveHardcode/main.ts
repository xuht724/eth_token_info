import { HTTP_ALCHEMY_URL } from "../../config";
import { MulticallHelper } from "../../toolHelpers/multicallHelper";
import { stableSwapAddressMap } from "./stableSwapPools";
import * as fs from "fs";

async function main() {
    let multicallHelper = new MulticallHelper(HTTP_ALCHEMY_URL);
    let results: { [key: string]: any } = {}; // 创建一个对象用于存储结果

    for (const poolName in stableSwapAddressMap) {
        let poolAddress = stableSwapAddressMap[poolName];
        let res = await multicallHelper.MulticallCurveStablSwapDocument(
            poolAddress
        );
        console.log(poolAddress);
        console.log(res);

        // 将 BigInt 转换为字符串
        const resStringified = JSON.stringify(
            res,
            (key, value) => {
                if (typeof value === "bigint") {
                    return value.toString();
                }
                return value;
            },
            2
        );

        // 将结果存储到对象中
        results[poolAddress] = JSON.parse(resStringified);
    }

    // 将对象写入 JSON 文件
    fs.writeFileSync("output.json", JSON.stringify(results, null, 2));
}

main();
