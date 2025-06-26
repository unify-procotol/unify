# API 测试指南

## 问题解决方案

您遇到的 `"Cannot read properties of undefined (reading 'handleFindOne')"` 错误的主要原因是：

1. **请求格式不正确**: 需要在 URL 中包含正确的 `source` 参数
2. **路由参数错误**: Next.js App Router 的动态路由参数格式需要正确

## 正确的 API 请求格式

### 查询 Solana 钱包余额

```bash
curl "http://localhost:3000/api/wallet/find_one?source=solana&where=%7B%22address%22:%2211111111111111111111111111111112%22%7D"
```

或者使用更易读的格式（需要 URL 编码）：
```
GET /api/wallet/find_one?source=solana&where={"address":"11111111111111111111111111111112"}
```

### 查询 EVM 钱包余额

```bash
curl "http://localhost:3000/api/wallet/find_one?source=evm&where=%7B%22address%22:%220x4f00D43b5aF0a0aAd62E9075D1bFa86a89CDb9aB%22,%22network%22:%22ethereum%22%7D"
```

或者使用更易读的格式：
```
GET /api/wallet/find_one?source=evm&where={"address":"0x4f00D43b5aF0a0aAd62E9075D1bFa86a89CDb9aB","network":"ethereum"}
```

## 支持的网络

### EVM 网络
- `ethereum` - 以太坊主网
- `iotex` - IoTeX 网络
- `polygon` - Polygon
- `bsc` - 币安智能链

### Solana
- `solana` - Solana 主网

## 错误排查

如果仍然遇到错误，请检查：

1. **URL 格式**: 确保使用 `/api/wallet/find_one` 格式
2. **Source 参数**: 必须包含 `source=solana` 或 `source=evm`
3. **Where 参数**: 必须是有效的 JSON 字符串并进行 URL 编码
4. **地址格式**: 确保使用正确的地址格式
5. **网络参数**: EVM 查询必须包含 `network` 参数

## 开发服务器

确保您的 Next.js 开发服务器正在运行：
```bash
npm run dev
# 或
pnpm dev
# 或
bun dev
``` 