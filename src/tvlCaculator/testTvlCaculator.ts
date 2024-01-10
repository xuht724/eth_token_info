import { ETHTVLCaculator } from "./tvlCaculator";
import { MulticallHelper } from "../multicallHelper";
import { HTTP_NODE_URL } from "../config";
import { Basic2AssetEdge } from "../types/edgs";
import { ProtocolName } from "../types";
import { formatEther } from "viem";

async function main() {
    let multicallHelper = new MulticallHelper(HTTP_NODE_URL);
    let ethTVLCaculator = new ETHTVLCaculator(multicallHelper);
    let poolInfo1: Basic2AssetEdge = {
        protocolName: ProtocolName.UniswapV2,
        pairAddress: "0x37825e5bbe01c69369934967336edf41a559f1ce",
        token0: "0xa283d8ab7439ad553e4496c32f102da94ad59db1",
        token1: "0xb3317914d93a75bfb4d482442bc34b1809a9c9ab",
    };
    let poolInfo2: Basic2AssetEdge = {
        protocolName: ProtocolName.UniswapV2,
        pairAddress: "0x9bd82673c50acb4a3b883d61e070a3c8d9b08e10",
        token0: "0x6b175474e89094c44da98b954eedeac495271d0f",
        token1: "0xeef9f339514298c6a857efcfc1a762af84438dee",
    };
    let poolInfo3: Basic2AssetEdge = {
        protocolName: ProtocolName.UniswapV2,
        pairAddress: "0x8178a0781ee79cccf0dbf9682351ac087cd9c40d",
        token0: "0x610706baeb3bfa512627fc68b01aedf0e7113545",
        token1: "0xdb25f211ab05b1c97d595516f45794528a807ad8",
    };

    let poolInfo4: Basic2AssetEdge = {
        protocolName: ProtocolName.UniswapV2,
        pairAddress: "0x453c53544e5f3961f2187beca2983612767e1f95",
        token0: "0x0af882690ac8c159ad7cc471018fb3f53817bafb",
        token1: "0xa3d070051e8ef3d52a0711d91f8886011dee2908",
    };

    let poolInfo = poolInfo4;

    let tvl = await ethTVLCaculator.calculateTwoTokenPoolTVLWithCache(
        poolInfo.pairAddress,
        poolInfo.token0,
        poolInfo.token1
    );

    if (tvl) {
        console.log(formatEther(tvl, "wei"));
    }
}

main();
