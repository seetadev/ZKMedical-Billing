We are extending Aztec’s Stealthdrop implementation in Noir to reward users with cashbacks and gift vouchers in invoices raised in case they exceed an expected range or during yearly festivals.
Demo at https://drive.google.com/drive/u/1/folders/1MS_uLsmDUNcdgugJZqOCQFUC7GMqFdOt

Android version at https://github.com/seetadev/ZKMedical-Billing/tree/main/zk-medical-billing-tracker (please download tablet.apk) 

Link: https://github.com/seetadev/ZKMedical-Billing/tree/main/zk-medical-billing-tracker/aztech-stealthdrop


## Getting Started

1. [Install nargo](https://noir-lang.org/docs/getting_started/installation/#installing-noirup) version 0.17.0 with `noirup -v 0.17.0`
2. Rename `env.examples` to `.env`, you can set up a number of things there but it contains sensible defaults
3. Install dependencies by running `yarn`
4. Compile the project with `yarn compile`
5. Optionally run `yarn gen` if you want fresh addresses, or if you changed the `.env` file
6. Run `NETWORK=localhost yarn dev`

There's a config to deploy on the Mumbai testnet as well. Just fill the details on the `.env` file and add `NETWORK=mumbai` on your commands.

## Testing

To run the [test file](./test/index.test.ts), try `yarn test`
