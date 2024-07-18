# Web3 Medical Invoice Ionic Metamask Connector

Ionic React-based mobile application for managing medical invoices using Web3 technology, integrated with Metamask for wallet connectivity.

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

### Navigate to the `web3-medical-invoice-ionic-metamask-connector/` directory:

```bash
cd ZKMedical-Billing/web3-medical-invoice-ionic-metamask-connector/
```

### Opening the Project

Open the project in your preferred code editor. If you use Visual Studio Code, you can do this with:

```bash
code .
```

### Setting Up Environment Variables

1. Create a `.env` file in the root directory:

   ```bash
   touch .env
   ```

2. Copy the contents from `.env.example` and paste them into `.env`.

3. Obtain the following credential:
   - Infura API Key: Visit [Infura Dashboard](https://app.infura.io/) to create an API key and add it to `.env`:

     ```
     VITE_INFURA_API_KEY=<your_infura_api_key>
     ```

### Installing Dependencies

Install the necessary dependencies using Yarn:

```bash
yarn
```

### Running the Application

#### Serve the Application (Web Version)

```bash
ionic serve
```

#### Running on Android Device

Sync Android codebase:

```bash
ionic cap sync android
```

Run the synced Android APK on an Android device:

```bash
npx cap run android
```

Open the project in Android Studio:

```bash
ionic cap open android
```

#### Running on iOS Device

Sync iOS codebase:

```bash
ionic cap sync ios
```

Run the synced iOS IPA on an iOS device:

```bash
npx cap run ios
```

Open the project in Xcode:

```bash
ionic cap open ios
```
