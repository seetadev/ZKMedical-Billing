# Medical Invoice Ionic Token-Gated Implementation

Ionic React-based implementation of the medical invoice application with token-gated functionality.

## Prerequisites

Ensure you have the following installed on your machine:

- Node.js
- Yarn

You can check their versions using the following commands:

```bash
node -v
yarn -v
```

## Getting Started

### Cloning the Repository

Clone your fork of the ZKMedical-Billing repository:

```bash
git clone https://github.com/[USER_NAME]/ZKMedical-Billing/
```

### Navigate to the Project Directory

Change into the `medical-invoice-ionic-tokengated/` directory:

```bash
cd ZKMedical-Billing/medical-invoice-ionic-tokengated/
```

### Opening the Project

Open the project in your preferred code editor. For Visual Studio Code, use:

```bash
code .
```

### Setting Up Environment Variables

1. Create a `.env` file in the root directory:

   ```bash
   touch .env
   ```

2. Copy the contents from `.env.example` and paste them into `.env`.

3. Obtain the following credentials:
   - **Infura API Key:** Visit the [Infura Dashboard](https://app.infura.io/) to create an API key and add it to `.env`:

     ```
     VITE_INFURA_API_KEY=<your_infura_api_key>
     ```

4. Navigate to the [web3-tools-contracts](https://github.com/seetadev/ZKMedical-Billing/tree/main/web3-tools-contracts) directory to get the latest deployed contract address on all supported chains. Update the contract addresses in the `.env` file:

     ```
     VITE_MEDI_INVOICE_CONTRACT_ADDRESS=<contract_address>
     ```

### Installing Dependencies

Install the necessary dependencies using Yarn:

```bash
yarn
```

### Running the Application

#### Serve the Application (Web Version)

Start the web application:

```bash
ionic serve
```

#### Running on Android Device

1. Sync the Android codebase:

   ```bash
   ionic cap sync android
   ```

2. Run the synced APK on an Android device:

   ```bash
   npx cap run android
   ```

3. Open the project in Android Studio:

   ```bash
   ionic cap open android
   ```

#### Running on iOS Device

1. Sync the iOS codebase:

   ```bash
   ionic cap sync ios
   ```

2. Run the synced IPA on an iOS device:

   ```bash
   npx cap run ios
   ```

3. Open the project in Xcode:

   ```bash
   ionic cap open ios
   ```
