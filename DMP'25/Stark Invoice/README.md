## Invoice Billing App on Cairo

This is a decentralized invoice billing application built on the Starknet blockchain using Cairo smart contracts. The application provides a comprehensive solution for creating, managing, and processing invoices with blockchain-based transparency and security.

### Architecture:

The application is built using Ionic framework for cross-platform compatibility, with Cairo smart contracts handling the backend logic on Starknet. The Social Calc engine provides advanced spreadsheet functionality for invoice calculations.

### Related Blockchain Repositories:

[MediToken](https://github.com/anisharma07/cairo-meditoken)  
[MedInvoice](https://github.com/anisharma07/cairo-medinvoice)

### Screencast Demo:

[drive link](https://drive.google.com/drive/folders/1zRnLYHy3tzIOQnD-aWovxIG5ih2BTyh_?usp=sharing)

### Vercel Deployment:

[Web App link](https://cairo-invoice-frontend.vercel.app/)

## Usage of Social Calc Engine

The Social Calc Engine is integrated as the core calculation engine for handling complex invoice computations and spreadsheet-like functionality within the application.

### Features Provided:

- **Dynamic Calculations**: Real-time calculation of line items, subtotals, taxes, and final amounts
- **Formula Support**: Supports standard spreadsheet formulas (SUM, MULTIPLY, PERCENTAGE, etc.)
- **Cell References**: Ability to reference other cells for complex invoice calculations
- **Data Validation**: Input validation for numerical values and formula syntax
- **Export Capabilities**: Export calculations and invoice data in various formats

## Keyboard Shortcuts

The application features smart keyboard shortcuts that automatically create files when needed: **Ctrl+S** for local saves
**Ctrl+Shift+S** for blockchain saves
**Ctrl+O** to open file manager
**Ctrl+N** to Create New File

## Running the Project on Web

To build an APK from the codebase, follow these steps:

- Install Node.js if not already installed.

- Clone the repository:

```bash
git clone REPO_URL
```

- Navigate to the project directory:

```bash
cd REPO_NAME
```

- Install project dependencies:

```bash
npm install
```

- Install the Ionic CLI globally:

```bash
npm install -g @ionic/cli
```

- Serve the application:

```bash
ionic serve
```

These steps will set up the project and allow you to test it in a development environment.

## Running the Project on Android Device

- Install Android Studio if not already installed.

- Sync android codebase

```base
ionic cap sync android
```

- Opening the Project in android Studio

```bash
ionic cap open android
```

Now you can run the app on a physical device or a virtual emulator, you can also build the app from the menu bar

## Running the Project on IOS Device

- Install XCode and XCode CLI if not already installed.

- Sync ios codebase

```base
ionic cap sync ios
```

- Opening the Project in XCode

```bash
ionic cap open ios
```

Now you can run the app on a physical device or a virtual emulator, you can also build the app from the menu bar
