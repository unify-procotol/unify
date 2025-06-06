# Unify Entities

Pre-built entities for the unify-server framework.

## Installation

```bash
npm install unify-entities
# or
bun add unify-entities
```

## Usage

### BalanceEntity

The `BalanceEntity` provides a unified interface to query blockchain balances across multiple networks.

```typescript
import { createSource } from "unify-server";
import { BalanceEntity } from "unify-entities";

const source = createSource();

source.register({
  id: "crypto-api",
  entities: {
    balance: BalanceEntity,
  },
});
```

#### Supported Networks

- **Solana**: Query SOL balances
- **Ethereum**: Query ETH balances  
- **IoTeX**: Query IOTX balances

#### API Usage

Once registered, you can query balances via REST API:

```bash
# Query Solana balance
GET /balance/{wallet_address}?network=solana

# Query Ethereum balance
GET /balance/{wallet_address}?network=ethereum

# Query IoTeX balance
GET /balance/{wallet_address}?network=iotex
```

#### Response Format

```json
{
  "address": "wallet_address",
  "network": "solana",
  "balance": 1.234,
  "symbol": "SOL",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## Contributing

This package is part of the unify-server monorepo. Please refer to the main repository for contribution guidelines. 