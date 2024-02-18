## Bandada Feedback using zksbts

We are extending on the Bandada Semaphore implementation to receive anonymous feedback reports by citizens, store feedback details from both users and government officials on the medical billing errors and incident reports so that they could strategize more productively and do early stage prevention of medical billing errors and incidents. 


## Use manual off-chain group locally

**Please make sure you are on the `main` branch.**

- [NodeJS](https://nodejs.org/en) >= v18.17.0
- A [supabase](https://supabase.com/) free tier project.
- A local copy of [Bandada](https://github.com/privacy-scaling-explorations/bandada)

Clone the Bandada repository and follow the [README](https://github.com/privacy-scaling-explorations/bandada/blob/main/README.md) to run it locally and create your first manual off-chain group:

```bash
git clone https://github.com/privacy-scaling-explorations/bandada.git
```

To get started, create a [Supabase account](https://supabase.com/dashboard/sign-up) and a free-tier project with basic configuration.

Once your project is ready, access the `Table Editor` from your project dashboard (you can use the [Supabase CLI](https://supabase.com/docs/guides/cli/local-development) if you prefer) and create the following tables with the columns as shown in the image:

- `feedback`, which will store all feedback (= signals) sent from users (= identities).
- Store all nullifier hashes in the `nullifier_hash` table to prevent double signaling. Refer to the [Semaphore documentation](https://docs.semaphore.pse.dev/glossary#nullifier) for more information.
- Store all Semaphore group roots in the `root_history` table to fix the [Merkle Tree](https://github.com/semaphore-protocol/semaphore/issues/98) (= [Semaphore groups](https://github.com/semaphore-protocol/semaphore/issues/98)) roots expiration issue. Refer to the [conversation](https://github.com/semaphore-protocol/semaphore/issues/98) on GitHub for more information.

![Tables schema](https://github.com/vplasencia/bandada-semaphore-demo/assets/20580910/e6c4362f-8f50-4ed2-87a1-a624a9b1052c)

## 🛠 Installation

Clone this repository running the following command in your terminal:

```bash
git clone https://github.com/vplasencia/bandada-semaphore-demo.git
```

and install the dependencies:

```bash
cd bandada-semaphore-demo && yarn
```

## 🔧 Configuration

Copy the environment variables for the development environment, run this command:

```bash
cp .env.development.local.example .env.development.local
```

```bash
# These can be retrieved from the Bandada dashboard (e.g., https://<dashboard_url>/groups/off-chain/<group_id>).
NEXT_PUBLIC_BANDADA_GROUP_ID=<bandada-group-id>
NEXT_PUBLIC_BANDADA_GROUP_API_KEY=<bandada-group-api-key>
# These can be retrieved in the Supabase dashboard (Settings -> API -> URL / Project API keys).
NEXT_PUBLIC_SUPABASE_API_URL=<supabase-api-url>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<supabase-anon-key>
```

## 📜 Usage

To start the applications in a development environment, run the following command:

```bash
yarn dev
```

The Feedback and other apps will be deployed at the following URLs (without any changes to the default configurations):

- Bandada API: http://localhost:3000
- Bandada Dashboard: http://localhost:3001
- Feedback App: http://localhost:3002

## 👨‍💻 Contributing

### Code quality and formatting

Run [ESLint](https://eslint.org/) to analyze the code and catch bugs:

```bash
yarn lint
```

Run [Prettier](https://prettier.io/) to check formatting rules:

```bash
yarn prettier
```

or to format the code automatically:

```bash
yarn prettier:write
```
