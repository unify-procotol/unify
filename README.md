# 🌟 Unify Protocol: Solve Data Heterogeneity

## Overview

Unify is a protocol focused on entity-first abstraction, aimed at resolving same-domain, cross-source complexity 🧭. Developers define unified entity models to seamlessly abstract over diverse implementations (APIs, protocols, schemas).


## 🌐 Why Unify?
Kills switch-case hell in multi-protocol apps 🧹
- Frontend works with clean abstractions
- backend freely extends supported sources.


## Features
- 1️⃣ Entity-Driven API → Call `repo().findOne()` to abstract away backend differences (schema, protocol, source).
- 2️⃣ Plug-and-Play Sources → Switch implementation via `source:"evm"/"solana"` — same interface, no logic rewrite.
- 3️⃣ Data Standardization → Protocol-agnostic outputs via entity contracts (e.g., unify EVM hex and Solana base58 addresses).


## Use Case 

Query balance for an EVM and a Solana wallet — same code pattern, different source:
```ts
repo<WalletEntity>({ entityName: "wallet", source: "evm" }).findOne({ where: { address: "0x..." } });
repo<WalletEntity>({ entityName: "wallet", source: "solana" }).findOne({ where: { address: "1111..." } });
```

```ts
repo<User>({ source: "legacy-api" }).find() // legacy system
repo<User>({ source: "v2-graphql" }).find() // new service
```


## License

MIT License 🚀
