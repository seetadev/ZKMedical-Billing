# Medinvoice on Starknet

**Medinvoice** is a decentralized healthcare invoice management system built on Starknet, leveraging the power of Cairo smart contracts. This project combines ERC-20 token functionality with invoice management capabilities, enabling secure, transparent, and efficient healthcare payment processing on the blockchain.

The system features **MediToken (MED)**, a utility token specifically designed for healthcare transactions, and a comprehensive invoice management contract that allows healthcare providers to create, manage, and process invoices in a decentralized manner. By utilizing Starknet's scalability and low transaction costs, Medinvoice aims to revolutionize how healthcare payments are handled, providing a trustless environment for both providers and patients.

Key benefits include immutable invoice records, automated payment processing, reduced intermediary costs, and enhanced transparency in healthcare billing. The project is fully compatible with Starknet's ecosystem and follows best practices for security and gas optimization.

### Deployed Addresses:

v1: [0x06bce0a379ece930bcd48d8f8b619174882a7cb411e9d177e4ede61e81472057](https://sepolia.voyager.online/contract/0x06bce0a379ece930bcd48d8f8b619174882a7cb411e9d177e4ede61e81472057)

v2: [0x044d8b61a156b05bdc96fa6f62fb7fd45aea00ef3d83a467bd5edf5ed5a2be6b](https://sepolia.voyager.online/contract/0x044d8b61a156b05bdc96fa6f62fb7fd45aea00ef3d83a467bd5edf5ed5a2be6b)

v3 (latest): [0x017aad7feed14f14cebb3809a7ceaa0479a57c861fb71c836adc7ce46ec90b27](https://sepolia.voyager.online/contract/0x017aad7feed14f14cebb3809a7ceaa0479a57c861fb71c836adc7ce46ec90b27)

## 🚀 Features

- Fully ERC-20 compliant (transfer, approve, transferFrom, etc.)
- Uses OpenZeppelin's `ERC20Component`
- Initializes with custom name (`Meditoken`) and symbol (`MED`)
- Decimals: 18
- Initial minting to a specified address during deployment

---

## 📁 Project Structure

```sh
MedToken/
├── src/contracts
│   └── MedInvoice.cairo  # Main contract file
├── Scarb.toml           # Scarb project configuration
└── README.md            # This file
```

---

## 🛠️ Requirements

- [Scarb](https://docs.swmansion.com/scarb/) (Starknet's package manager)
- [Starkli](https://book.starkli.rs) (CLI tool to deploy and interact with Starknet contracts)
- A Starknet wallet (e.g., [Braavos](https://braavos.app), [Argent X](https://www.argent.xyz/argent-x/))
- Starknet testnet ETH (e.g., from [Starknet faucet](https://faucet.starknet.io/))

---

## 📦 Build the Contract

Make sure you are in the project root directory, then run:

```bash
scarb build
```

This compiles your contract and outputs the Sierra and CASM artifacts into `./target/dev/`.

---

## 🚀 Deploy Using Starkli

rpc: https://starknet-sepolia.public.blastapi.io/rpc/v0_8

### Step 1: Declare the contract

```bash
starkli declare target/dev/sn_medi_invoice_MedInvoiceContract.contract_class.json #med invoice
```

Save the returned class hash.

### Step 2: Deploy the contract

```bash
starkli deploy <class_hash> <medi_token_address> <recipient_address> # med invoice
```

- `initial_tokens`: Number of tokens to mint (without decimals, the multiplier is automatically applied)
- `recipient_address`: Starknet address of the initial token holder

---

## 📘 About MediToken

MediToken (`MED`) is a utility token designed for healthcare dApps on Starknet. It can be used for:

- Paying for medical services
- Token-gated access to data or functionality
- Incentivizing participation in healthcare DAOs
- Governance and voting in decentralized systems

- github repo - https://github.com/anisharma07/cairo-meditoken

---

## 🔗 Resources

- [OpenZeppelin Cairo Contracts](https://github.com/OpenZeppelin/cairo-contracts)
- [Starknet Book](https://book.starknet.io)
- [Scarb Documentation](https://docs.swmansion.com/scarb/)
- [Starkli Book](https://book.starkli.rs/)

---

## 🧪 Testing

For detailed testing instructions and examples, see [TESTING_SETUP_COMPLETE.md](./TESTING_SETUP_COMPLETE.md).
