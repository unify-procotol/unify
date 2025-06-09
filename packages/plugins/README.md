# unify-plugin

Unified source plugins for blockchain data access. This package provides a plugin-based architecture for accessing data from different blockchain networks.

## Installation

```bash
npm install unify-plugin
```

## Usage

### Basic Usage

Import and register the plugins with your unify-api:

```typescript
import { createSource } from "unify-api";
import { SolanaPlugin, EVMPlugin } from "unify-plugin";

const source = createSource();

// Register plugins
source.register(SolanaPlugin);
source.register(EVMPlugin);

const app = source.getApp();
```

### API Endpoints

Once registered, the plugins provide the following endpoints:

#### Solana Balance
```bash
curl -X GET 'http://localhost:3000/balance/11111111111111111111111111111112?network=solana&sourceId=solana_plugin'
```

#### EVM Network Balances
```bash
# Ethereum
curl -X GET 'http://localhost:3000/balance/0x4f00D43b5aF0a0aAd62E9075D1bFa86a89CDb9aB?network=ethereum&sourceId=evm_plugin'

# IoTeX
curl -X GET 'http://localhost:3000/balance/0x4f00D43b5aF0a0aAd62E9075D1bFa86a89CDb9aB?network=iotex&sourceId=evm_plugin'

# Polygon
curl -X GET 'http://localhost:3000/balance/0x4f00D43b5aF0a0aAd62E9075D1bFa86a89CDb9aB?network=polygon&sourceId=evm_plugin'

# BSC
curl -X GET 'http://localhost:3000/balance/0x4f00D43b5aF0a0aAd62E9075D1bFa86a89CDb9aB?network=bsc&sourceId=evm_plugin'
```

## Supported Networks

### Solana Plugin
- **Solana**: Native SOL balance queries

### EVM Plugin
- **Ethereum**: ETH balance queries
- **IoTeX**: IOTX balance queries  
- **Polygon**: MATIC balance queries
- **BSC**: BNB balance queries

## Plugin Architecture

### Available Plugins

- `SolanaPlugin`: Handles Solana network balance queries
- `EVMPlugin`: Handles EVM-compatible network balance queries
