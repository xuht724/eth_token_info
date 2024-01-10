import { WETH } from "./constants/tokenAddress";
export function checkIfWETH(address: string) {
    return address.toLocaleLowerCase() == WETH.toLowerCase();
}

export function delay(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
