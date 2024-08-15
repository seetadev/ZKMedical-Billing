## MediToken

This project implements a MediToken (ERC20) smart contract.

## Prerequisites

Before you begin, ensure you have the following installed:

* **Foundry:** Installation instructions can be found in the [Foundry documentation](https://book.getfoundry.sh/getting-started/installation).

If you are using Windows, it is recommended to use Windows Subsystem for Linux (WSL) for the Foundry setup.

## Getting Started

### Cloning the Repository

1. Clone your fork of ZKMedical-Billing repository:

```bash
git clone https://github.com/[USER_NAME]/ZKMedical-Billing/
```

2. Navigate to the Medi_Token directory:

```bash
cd ZKMedical-Billing/Medi_Token
```

### Setting Up Environment Variables

1. Create a file named `.env` in the Medi_Token directory.

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

### Running Tests

#### Running All Tests

To run all tests, use the command:

```bash
make test
```

#### Running a Single Test

To run a specific test function, use the following command structure:

```bash
forge test --mt testFunction -vvv
```

Replace `testFunction` with the actual test function name you want to run.

For example, to run the `testTransfer` function, use:

```bash
forge test --mt testTransfer -vvv
```

### Deployment

The Makefile is set up for deployments on several testnets, including Sepolia, Polygon Amoy, Arbitrum Sepolia, OP Sepolia, Polygon Cardona, and Scroll Sepolia.

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

#### Deployed Contract Addresses

* Arbitrum Sepolia: [0x89E4F30AFB281689632535e1657D15243a83b802](https://sepolia.arbiscan.io/token/0x89E4F30AFB281689632535e1657D15243a83b802)
* Sepolia: [0x3B550adA770897B0b215e414e45354861357788c](https://sepolia.etherscan.io/token/0x3B550adA770897B0b215e414e45354861357788c)
* Polygon Amoy: [0x7aD0A9dB054101be9428fa89bB1194506586D1aD](https://amoy.polygonscan.com/token/0x7aD0A9dB054101be9428fa89bB1194506586D1aD)
* OP Sepolia: [0xc898870DF59123F346a0e3787966023e0ED78B93](https://sepolia-optimism.etherscan.io/token/0xc898870DF59123F346a0e3787966023e0ED78B93)
* Polygon Cardona: [0x4216a9c6EB59FcA323169Ef3194783d3dC9b7F23](https://cardona-zkevm.polygonscan.com/address/0x4216a9c6EB59FcA323169Ef3194783d3dC9b7F23)
* Scroll Sepolia: [0x6e650a339AbE4D9cf0aa8091fB2099284968beFf](https://sepolia.scrollscan.com/address/0x6e650a339AbE4D9cf0aa8091fB2099284968beFf)
