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
npx ts-node ./src/main.ts
```
初次同步大约需要1-2个小时

## 纠错
几个脚本文件是用来纠错与更新的。

- `./src/batchUpdate.ts` 用来更新 Edge 数据，arg[0] = 'v2' or 'v3', arg[1] = tagLevel
- `./src/batchUpdateToken.ts` 用来纠正 Token 数据，即重新获取 `decimal = null` 的Token数据