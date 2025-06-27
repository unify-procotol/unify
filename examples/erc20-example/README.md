# Mimo Trading Pair Example

这个示例演示了如何使用 Unify 框架创建一个 Mimo 交易对插件，从 Mimo Exchange 获取实时价格。

## 功能特性

- 💱 **Real-time Pricing**: 通过 Mimo Exchange API 获取实时交易对价格
- 🔄 **Multi-pair Support**: 支持 IOTX/USDT, WIOTX/USDT, DWIN/USDT 等多种交易对
- 📈 **Price Impact**: 获取价格冲击和滑点信息
- 🛣️ **Route Information**: 显示最优交易路径
- 🌐 **RESTful API**: 提供完整的 REST API 接口
- 🚀 **Type Safe**: 完全类型安全的 TypeScript 实现

## 快速开始

### 安装依赖
```bash
bun install
```

### 启动服务器
```bash
bun run dev
```

服务器将在 `http://localhost:3000` 启动。

### 运行客户端示例

**Mimo 交易对价格演示：**
```bash
bun run client
```

**测试单个交易对：**
```bash
bun run test-pair iotx/usdt
```

## API 端点

### Mimo Trading RESTful API
- `GET /PairEntity/find_one?source=mimo&where[pair]=iotx/usdt` - 获取交易对价格

### 演示端点
- `GET /` - 健康检查和 API 文档
- `GET /demo/price/:pair` - 获取交易对价格的演示 (例如: `/demo/price/iotx/usdt`)

## 支持的交易对

- `iotx/usdt` - IoTeX 原生代币 / Tether USD
- `wiotx/usdt` - Wrapped IoTeX / Tether USD  
- `dwin/usdt` - Drop Wireless Infrastructure / Tether USD
- `iotx/wiotx` - IoTeX / Wrapped IoTeX
- 以及其他在 IoTeX 网络上的代币对