# 🌟 Unify Protocol: Solve Data Heterogeneity

Unify is a protocol focused on entity-first abstraction, aimed at resolving same-domain, cross-source complexity 🧭. Developers define unified entity models to seamlessly abstract over diverse implementations (APIs, protocols, schemas).

## Get Started
```bash
npx @unilab/urpc-cli create my-project
```

## 🌐 Why Unify?
Kills switch-case hell in multi-protocol apps 🧹
- Frontend works with clean abstractions
- backend freely extends supported sources.


## Features
1️⃣ Entity-Driven API → Call `repo().findOne()` to abstract away backend differences (schema, protocol, source).

2️⃣ Plug-and-Play Sources → Switch implementation via `source:"evm"/"solana"` — same interface, no logic rewrite.

3️⃣ Data Standardization → Protocol-agnostic outputs via entity contracts (e.g., unify EVM hex and Solana base58 addresses).


## Use Case Example

Query balance for an EVM and a Solana wallet — same code pattern, different source:
```ts
repo<WalletEntity>({ entity: "wallet", source: "evm" }).findOne({ where: { address: "0x..." } });
repo<WalletEntity>({ entity: "wallet", source: "solana" }).findOne({ where: { address: "1111..." } });

repo<NFT>({ entity: "nft", source: "ethereum" }).findMany({ where: { owner: "0x..." } });
repo<NFT>({ entity: "nft", source: "polygon" }).findMany({ where: { owner: "0x..." } });
```
Legacy vs. modern systems 
```ts
repo<User>({ source: "legacy-api" }).findMany() // legacy system
repo<User>({ source: "v2-graphql" }).findMany() // new service
```
Device Agnostic IoT
```ts
repo<SensorData>({ source: "mqtt" }).create({...});  
repo<SensorData>({ source: "http-api" }).create({...}});  
```
Analytics & Logging Aggregation
```ts
// Query events from Datadog
repo<LogEntry>({ entity: "event", source: "datadog" }).find({ where: { type: "error", timestamp: { gte: "..." } } });
// Query user actions from Mixpanel
repo<LogEntry>({ entity: "userAction", source: "mixpanel" }).find({ where: { userId: "user-x", eventName: "login" } });
// Query system metrics from Prometheus
repo<Metric>({ entity: "metric", source: "prometheus" }).find({ where: { name: "cpu_usage", host: "server-a" } });
```
## License

MIT License 🚀
