# Eth Token Info

## 配置
这个脚本用来同步以太坊上ERC20代币信息，并将其存储到SQLite数据库中。
脚本的配置在 `src/config.ts` 中
```typescript
export const GETH_URL = YOUR_NODE_URL_HTTP_PROTOCOL
export const WS_GETH_URL = YOUR_NODE_URL_WEBSOCKET_PROTOCOL
export const sqlite_database = YOUR_SQLITE_FILE_PATH
```

## 运行
```shell
npx ts-node ./src/main.ts <edgeTypeList>
```
其中，edgeTypeList 为需要更新的 Edge 类型列表，类型之间用逗号隔开，例如：npx ts-node ./src/main.ts v2,v3,balancer

- 当前支持的 Edge 类型包括：v2, v3, balancer
- edgeTypeList 需包含 1 个及以上 Edge 类型
- 初次同步大约需要 1 - 2 个小时

## 附加功能

- `./src/batchUpdate.ts` 用于更新 Edge 数据，arg[0] = 'v2' or 'v3', arg[1] = tagLevel
- `./src/batchUpdateToken.ts` 用于纠正 Token 数据，即重新获取 `decimal = null` 的Token数据
- `./src/getBalancerPoolTypeNum.ts` 用于获取 Balancer Edge 每个种类的数量和百分比（保留两位小数）