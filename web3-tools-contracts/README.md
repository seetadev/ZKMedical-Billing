## web3-tools-contracts

A token-gated utility smart contract for platform-independent medical invoice projects.

## Prerequisites

Before you begin, ensure you have the following installed:

* **Foundry:** Installation instructions can be found in the [Foundry documentation](https://book.getfoundry.sh/getting-started/installation).

If you are using Windows, it is recommended to use Windows Subsystem for Linux (WSL) for the Foundry setup.

## Getting Started

### Cloning the Repository

1. Clone your fork of the `ZKMedical-Billing` repository:

```bash
git clone https://github.com/[USER_NAME]/ZKMedical-Billing/
```

2. Navigate to the `web3-tools-contracts/` directory:

```bash
cd ZKMedical-Billing/web3-tools-contracts/
```

### Setting Up Environment Variables

1. Create a file named `.env` in the `web3-tools-contracts/` directory.

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

The Makefile is set up for deployments on several testnets, including Sepolia, Polygon Amoy, Arbitrum Sepolia, OP Sepolia, Polygon Cardona, Filecoin Calibration, and Scroll Sepolia.

#### Deployment Commands

##### Deploy on Sepolia

```bash
make deploy ARGS="--network sepolia"
```

##### Deploy on Polygon Amoy

```bash
make deploy ARGS="--network amoy"
```

##### Deploy on Arbitrum Sepolia

```bash
make deploy ARGS="--network arbitrum"
```

##### Deploy on OP Sepolia

```bash
make deploy ARGS="--network optimism"
```

##### Deploy on Polygon Cardona

```bash
make deploy ARGS="--network cardona"
```

##### Deploy on Scroll Sepolia

```bash
make deploy ARGS="--network scroll"
```

### Deployed Contract Addresses

* **Arbitrum Sepolia:** [0x3e75F50f610DaA4dc07fDbfd837fcde978f75327](https://sepolia.arbiscan.io/address/0x3e75F50f610DaA4dc07fDbfd837fcde978f75327)
* **Sepolia:** [0x37bC8D6Fa5FeE7A3fB1D93Fe51eD0Bc53bBdE026](https://sepolia.etherscan.io/address/0x37bC8D6Fa5FeE7A3fB1D93Fe51eD0Bc53bBdE026)
* **Polygon Amoy:** [0x8D2fe41E336EF8a49AaE0FE26c3D346d7618541e](https://amoy.polygonscan.com/address/0x8D2fe41E336EF8a49AaE0FE26c3D346d7618541e)
* **OP Sepolia:** [0x88Ef03c80A73740F3f6b312Efc9B46D7316A5456](https://sepolia-optimism.etherscan.io/address/0x88Ef03c80A73740F3f6b312Efc9B46D7316A5456)
* **Polygon Cardona:** [0x5c1dBee87430956762901f4aaa18367aE7631A21](https://cardona-zkevm.polygonscan.com/address/0x5c1dBee87430956762901f4aaa18367aE7631A21)
* **Scroll Sepolia:** [0x5B78fbCB2d94e3B1c7Da8eFaA85eB5a2839F905E](https://sepolia.scrollscan.com/address/0x5B78fbCB2d94e3B1c7Da8eFaA85eB5a2839F905E)
* **Filecoin Calibration:** [0xa8162f65f3b7D3573C9B2812b3f8308cE62914F6](https://calibration.filfox.info/en/address/0xa8162f65f3b7D3573C9B2812b3f8308cE62914F6)
