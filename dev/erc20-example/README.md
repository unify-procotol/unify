# Mimo Trading Pair Example

This example demonstrates how to use the URPC framework to create a Mimo trading pair plugin that fetches real-time prices from Mimo Exchange.

## Features

- 💱 **Real-time Pricing**: Get real-time trading pair prices through Mimo Exchange API
- 🔄 **Multi-pair Support**: Support for IOTX/USDT, WIOTX/USDT, DWIN/USDT and other trading pairs
- 📈 **Price Impact**: Get price impact and slippage information
- 🛣️ **Route Information**: Display optimal trading paths
- 🌐 **RESTful API**: Provides complete REST API interface
- 🚀 **Type Safe**: Fully type-safe TypeScript implementation

## Getting Started

### Install Dependencies
```bash
bun install
```

### Start Server
```bash
bun run dev
```

The server will start at `http://localhost:3000`.

### Run Client Example

**Mimo Trading Pair Price Demo:**
```bash
bun run client
```

**Test Single Trading Pair:**
```bash
bun run test-pair iotx/usdt
```

## API Endpoints

### Mimo Trading RESTful API
- `GET /PairEntity/find_one?source=mimo&where[pair]=iotx/usdt` - Get trading pair price

### Demo Endpoints
- `GET /` - Health check and API documentation
- `GET /demo/price/:pair` - Demo for getting trading pair price (e.g., `/demo/price/iotx/usdt`)

## Supported Trading Pairs

- `iotx/usdt` - IoTeX Native Token / Tether USD
- `wiotx/usdt` - Wrapped IoTeX / Tether USD  
- `dwin/usdt` - Drop Wireless Infrastructure / Tether USD
- `iotx/wiotx` - IoTeX / Wrapped IoTeX
- And other token pairs on the IoTeX network