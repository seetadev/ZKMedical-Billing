# MediToken on Starknet

MediToken is an ERC-20 compatible token built on Starknet using the OpenZeppelin Cairo contracts. It is intended for use in decentralized healthcare systems as a utility token for transactions, access control, and governance.

## Medi Token: [0x06c23fc4f2017805ad3a9230eb67381b8a8658b7f2995dac5b6fd44a41f513e6](https://sepolia.voyager.online/contract/0x06c23fc4f2017805ad3a9230eb67381b8a8658b7f2995dac5b6fd44a41f513e6)

## Med Invoice: [0x06bce0a379ece930bcd48d8f8b619174882a7cb411e9d177e4ede61e81472057](https://sepolia.voyager.online/contract/0x06bce0a379ece930bcd48d8f8b619174882a7cb411e9d177e4ede61e81472057)

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
│   └── med_token.cairo  # Main contract file
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

### Step 1: Declare the contract

```bash
starkli declare target/dev/sn_medi_token_MedToken.contract_class.json # med token
starkli declare target/dev/sn_medi_token_MedInvoiceContract.contract_class.json #med invoice
```

Save the returned class hash.

### Step 2: Deploy the contract

```bash
starkli deploy <class_hash> <initial_tokens> <recipient_address> # med token
starkli deploy <class_hash> <medi_token_address> <recipient_address> # med invoice
```

- `initial_tokens`: Number of tokens to mint (without decimals, the multiplier is automatically applied)
- `recipient_address`: Starknet address of the initial token holder

Example:

```bash
starkli deploy 0x0123abc... 1000000 0xabc456...
```

---

## 📘 About MediToken

MediToken (`MED`) is a utility token designed for healthcare dApps on Starknet. It can be used for:

- Paying for medical services
- Token-gated access to data or functionality
- Incentivizing participation in healthcare DAOs
- Governance and voting in decentralized systems

---

## 🔗 Resources

- [OpenZeppelin Cairo Contracts](https://github.com/OpenZeppelin/cairo-contracts)
- [Starknet Book](https://book.starknet.io)
- [Scarb Documentation](https://docs.swmansion.com/scarb/)
- [Starkli Book](https://book.starkli.rs/)

---

## 🧪 Testing

For detailed testing instructions and examples, see [TESTING_SETUP_COMPLETE.md](./TESTING_SETUP_COMPLETE.md).