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

The Makefile is set up for deployments on several testnets, including Sepolia, Polygon Amoy, Arbitrum Sepolia, and OP Sepolia.

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

### Deployed Contract Addresses

* **Arbitrum Sepolia:** [0x28D21e6b655f786969709CAD9e3B8e639256C1D8](https://sepolia.arbiscan.io/address/0x28D21e6b655f786969709CAD9e3B8e639256C1D8)
* **Sepolia:** [0x19FBC4DacDe7F9d828fF0CB55470104896AaB29b](https://sepolia.etherscan.io/address/0x19FBC4DacDe7F9d828fF0CB55470104896AaB29b)
* **Polygon Amoy:** [0x89E4F30AFB281689632535e1657D15243a83b802](https://amoy.polygonscan.com/address/0x89E4F30AFB281689632535e1657D15243a83b802)
* **OP Sepolia:** [0xCa6Fca3c411C9C61Bb2b502F89c48cd5807BE8E8](https://sepolia-optimism.etherscan.io/address/0xCa6Fca3c411C9C61Bb2b502F89c48cd5807BE8E8)
