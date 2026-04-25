# Contributing to ZKMedical-Billing

Thank you for your interest in contributing! This guide helps you get started quickly.

## Repository Structure

```
ZKMedical-Billing/
├── medical-billing/                  # Primary entry point — React frontend
├── zk-medical-billing-tracker/       # Ionic + React + TypeScript app with ZK integration
├── zk_validate_verify/               # ZK proof validation and verification utilities
├── zk-medical-invoice-suite/         # ZK invoice verification tools
├── MedETH/                           # Ethereum-based medical components
├── Medi_Token/                       # Token implementation (ERC-20)
├── web3-tools-contracts/             # Smart contract utilities
└── web3-medical-invoice-ionic-metamask-connector/  # Web3 wallet integration
```

## Getting Started

### 1. Clone the repo

```bash
git clone https://github.com/seetadev/ZKMedical-Billing.git
cd ZKMedical-Billing
```

### 2. Run the primary frontend module

The `medical-billing` module is the recommended entry point for frontend contributors:

```bash
cd medical-billing
npm install
npm start
```

### 3. Run the ZK billing tracker (Ionic/React app)

```bash
cd zk-medical-billing-tracker
npm install
ionic serve
```

> **Note:** Install dependencies at the module level — do not run `npm install` at the root.

### 4. Smart contract development

Contract work lives in `web3-tools-contracts` and `MedETH`. Prerequisites: Node.js, Hardhat.

```bash
cd web3-tools-contracts
npm install
npx hardhat compile
npx hardhat test
```

## Making a Contribution

1. Fork the repository and create a branch:
   ```bash
   git checkout -b docs/your-change-description
   ```
   Use prefixes: `feat/`, `fix/`, `docs/`, `test/`

2. Make your changes and commit:
   ```bash
   git commit -m "[Docs]: Brief description of your change"
   ```
   Commit message format: `[Tag]: Description` — see merged PRs for examples.

3. Open a pull request with a clear title and description. Reference the related issue if applicable.

## Code Style

- **JavaScript/TypeScript**: Follow the existing ESLint config in each module. Run `npm run lint` before submitting.
- **Solidity**: Follow OpenZeppelin conventions. Run Slither for static analysis where possible.
- **General**: Keep PRs focused — one logical change per PR.

## Useful Links

- [Project Issue #48 (DMP 2026)](https://github.com/seetadev/ZKMedical-Billing/issues/48) — primary project brief
- [Filecoin FVM Docs](https://docs.filecoin.io/smart-contracts/fundamentals/the-fvm)
- [Circom Documentation](https://docs.circom.io/)
- [Ionic Framework Docs](https://ionicframework.com/docs)

## Questions

Open a GitHub Discussion or comment on the relevant issue. Maintainer: [@seetadev](https://github.com/seetadev).