## MedETH

MedETH demonstrates token-gated access control for performing specific functions within a decentralized healthcare system, integrating MediToken.

## Tech Stack Used

* Solidity
* ethers.js
* Next.js
* Foundry
* Metamask
* OpenZeppelin
* ConnectKit
* WalletConnect
* TypeScript
* JavaScript
* Chakra UI
* Alchemy
* Wagmi
* Lighthouse Storage (IPFS gateway)
* Lit Protocol

## Foundry Setup

## Prerequisites

Before you begin, ensure you have the following installed:

* **Foundry:** Installation instructions can be found in the Foundry documentation [https://book.getfoundry.sh/](https://book.getfoundry.sh/).

If you are using Windows, it is recommended to use Windows Subsystem for Linux (WSL) for the Foundry setup.

## Getting Started

### Cloning the Repository

1. Clone your fork of ZKMedical-Billing repository:

```bash
git clone https://github.com/[USER_NAME]/ZKMedical-Billing/
```

2. Navigate to the `foundry/` directory:

```bash
cd ZKMedical-Billing/MedETH/foundry/
```

### Setting Up Environment Variables

1. Create a file named `.env` in the foundry directory.

2. Configure the `.env` file according to the provided `.env.example` file.

### Installing Dependencies

Install the necessary dependencies:

```bash
forge install foundry-rs/forge-std OpenZeppelin/openzeppelin-contracts --no-commit
```

### Building the Project

Build the project with the following command:

```bash
make build
```

### Deployment

**Note:** Before deploying, update the contract address of the MediToken contract for the specific version and chain in both `DeployUserSide.s.sol` and `DeployDoctorSide.s.sol` scripts.

The Makefile is set up for deployments on several testnets, including Sepolia, Polygon Amoy, Arbitrum Sepolia, OP Sepolia, Polygon Cardona, Filecoin Calibration, and Scroll Sepolia.

#### Deployment Commands

##### Deploy on Sepolia

```bash
make deploy-user ARGS="--network sepolia"
```

```bash
make deploy-doctor ARGS="--network sepolia"
```

##### Deploy on Polygon Amoy

```bash
make deploy-user ARGS="--network amoy"
```

```bash
make deploy-doctor ARGS="--network amoy"
```

##### Deploy on Arbitrum Sepolia

```bash
make deploy-user ARGS="--network arbitrum"
```

```bash
make deploy-doctor ARGS="--network arbitrum"
```

##### Deploy on OP Sepolia

```bash
make deploy-user ARGS="--network optimism"
```

```bash
make deploy-doctor ARGS="--network optimism"
```

##### Deploy on Polygon Cardona

```bash
make deploy-user ARGS="--network cardona"
```

```bash
make deploy-doctor ARGS="--network cardona"
```

##### Deploy on Scroll Sepolia

```bash
make deploy-user ARGS="--network scroll"
```

```bash
make deploy-doctor ARGS="--network scroll"
```

#### Deployed Contract Addresses

* Sepolia Testnet
    - UserSide: [0x97e82f8a22793Cc270eE2a25D47006194053504f](https://sepolia.etherscan.io/address/0x97e82f8a22793Cc270eE2a25D47006194053504f)  
    - DoctorSide: [0xd777F1661e6895B25D70Ff6375A114373ee6590c](https://sepolia.etherscan.io/address/0xd777F1661e6895B25D70Ff6375A114373ee6590c)

* OP Sepolia Testnet
    - UserSide: [0x1E2DBa267514C319E45C5E867f44f42e0f1Cd4F0](https://sepolia-optimism.etherscan.io/address/0x1E2DBa267514C319E45C5E867f44f42e0f1Cd4F0)
    - DoctorSide: [0x77C5f60D10625Bb80DecA89f5713d01964450aa8](https://sepolia-optimism.etherscan.io/address/0x77C5f60D10625Bb80DecA89f5713d01964450aa8)

* Polygon Amoy Testnet
    - UserSide: [0x66E1e28A6E6BD3a4c30a53C964e65ADa11Cf9EB8](https://amoy.polygonscan.com/address/0x66E1e28A6E6BD3a4c30a53C964e65ADa11Cf9EB8)  
    - DoctorSide: [0xB551eE1236593Fe6cB5a679c0962E89d30740FF8](https://amoy.polygonscan.com/address/0xB551eE1236593Fe6cB5a679c0962E89d30740FF8)
      
* Arbitrum Sepolia Testnet
    - UserSide: [0x8D2fe41E336EF8a49AaE0FE26c3D346d7618541e](https://sepolia.arbiscan.io/address/0x8D2fe41E336EF8a49AaE0FE26c3D346d7618541e)
    - DoctorSide: [0xB6c60435840346C5Ef447bf4A2ECFbB075F45b48](https://sepolia.arbiscan.io/address/0xB6c60435840346C5Ef447bf4A2ECFbB075F45b48)

* Polygon Cardona Testnet
    - UserSide: [0xBBC039C47B3D190d3A8ab4b900145367B4C388Dc](https://cardona-zkevm.polygonscan.com/address/0xBBC039C47B3D190d3A8ab4b900145367B4C388Dc)
    - DoctorSide: [0x20D207Bc77154082B5F32E65ad076236E362C3AE](https://cardona-zkevm.polygonscan.com/address/0x20D207Bc77154082B5F32E65ad076236E362C3AE)

* Scroll Sepolia Testnet
    - UserSide: [0xE2E3899AcAD6c4F6F1db0702D49d8dA75AE813bb](https://sepolia.scrollscan.com/address/0xE2E3899AcAD6c4F6F1db0702D49d8dA75AE813bb)
    - DoctorSide: [0xBdCFBbdcc15d9f451AC9e74585b9EB7485b7c0C2](https://sepolia.scrollscan.com/address/0xBdCFBbdcc15d9f451AC9e74585b9EB7485b7c0C2)

* Filecoin Calibration Testnet
    - UserSide: [0xB9D4F7F14E5281A214aF74787b01508062CCd2Df](https://calibration.filfox.info/en/address/0xB9D4F7F14E5281A214aF74787b01508062CCd2Df)
    - DoctorSide: [0xC1aF668bBF21a2170017f07757726BebB063238a](https://calibration.filfox.info/en/address/0xC1aF668bBF21a2170017f07757726BebB063238a)
  
* NEAR's Aurora Testnet
    - UserSide: [0x7F03597Ec06E419b87B0d51138B9Dd809593Fcc8](https://explorer.testnet.aurora.dev/address/0x7F03597Ec06E419b87B0d51138B9Dd809593Fcc8)
    - DoctorSide: [0x57214C3497Ef0A5af63048fD01023dF2736266f0](https://explorer.testnet.aurora.dev/address/0x57214C3497Ef0A5af63048fD01023dF2736266f0)


## Frontend Setup

**Note:** Update the compiled ABIs of both the contracts in the `/frontend/src/utils/abis/` directory.

1. From the root, navigate to the `frontend/` directory.

```bash
cd tokengated-healthcare-infra/frontend/
```

2. Create a `.env` file in the root directory of the project.

```
touch .env
```

3. Refer to `.env.example` to update `.env`.

4. Install Dependencies.

```
yarn
```

5. Run the project at `localhost:3000`.

```
yarn run dev
```

