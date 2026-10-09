# 🩺 ZK Medical Billing Module on Filecoin, Optimism and Starknet

### Verifiable, Decentralized, and Affordable Healthcare Infrastructure

**Built on Filecoin/IPFS, Optimism, Starknet & EVM Chains**
*Empowering developers to build open, verifiable, and privacy-preserving healthcare applications.*

---

## 🎯 Mission

**OP Medicine** is building the **Web3 healthcare backbone** — powered by **Filecoin’s verifiable storage** and **Optimism’s scalable execution** — to make **personalized medicine affordable, transparent, and decentralized**.

We develop **open-source developer tools** for medical data pipelines, billing systems, and clinical trials, enabling researchers, healthcare providers, and civic bodies to build trustless, patient-centric solutions.

---

## 🧬 Overview

Since November 2024, **OP Medicine** has powered **two Code for GovTech healthcare pilots** — deploying **Filecoin-based smart contracts**, **token-gated data systems**, and **decentralized billing modules** across civic and academic ecosystems.

Our core platform, **EMTTR (Electronic Medicine Trial and Test Records)**, provides verifiable medical data pipelines on Filecoin — connecting hospitals, insurers, and researchers through **transparent and programmable storage**.

🔗 Public mention: [Twitter Thread – Oct 2025](https://twitter.com/OP_medicine_DAO/status/1842251833445912126)

---

## Getting started (For Developers)

This repository contains multiple sub-projects.

If you're looking to quickly run a working part of the project, you can try one of the available modules such as:

## Run the frontend (medical-billing)

cd ZKMedical-Billing/medical-billing
npm install
npm start

This will start a local deployement server at:
http://localhost:3000

### Impportant notes

-Do not run `npm install` at the root of the repository.
-Each sub-projects has its own dependencies and setup instructions.
-Other modules(example- ZK velidation,contracts)may require additional configuration and can be explored seperately.
## 💾 Built on Filecoin & Optimism

| Layer                     | Role                                          | Impact                                                 |
| ------------------------- | --------------------------------------------- | ------------------------------------------------------ |
| **Filecoin/IPFS**         | Long-term verifiable data storage             | Persistent medical records, trial data, and invoices   |
| **FVM**                   | Smart contract execution over verifiable data | Automated claims, subscriptions, and audit trails      |
| **Optimism**              | Fast and low-cost L2 scalability              | Enables cross-chain healthcare applications            |
| **Storacha / Lighthouse** | Filecoin storage providers                    | HIPAA-aligned decentralized storage for medical assets |

---

## ⚙️ Core Components

### 🧾 1. EMTTR – Filecoin Trial & Test Records

Decentralized service for **electronic medicine trial and test records**.
Provides developers APIs to build **verifiable health and trial data pipelines** with Filecoin persistence.

* Supports **Filecoin FVM storage proofs** for each trial dataset
* Provides **token-gated access** via PPT and Medi tokens
* Integrated with **Storacha** for decentralized file verification

➡️ [EMTTR Developer Portal](https://emttr-deploy.vercel.app)

---

### 🪙 2. PPT Token (Prescription & Payment Token)

ERC-20 token deployed on Filecoin & Optimism for **medical billing and data access**.

| Contract             | Network  | Explorer                                                                                        |
| -------------------- | -------- | ----------------------------------------------------------------------------------------------- |
| PPT Token            | Filecoin | [Filfox](https://filfox.info/en/address/0xC00BBC9A2C88712dC1e094866973F036373C7134)             |
| Medical Invoice      | Filecoin | [Filfox](https://filfox.info/en/address/0x08bacb51f405a2D793E4F4BE53Ca2B3C8b8cF0CA)             |
| Storage Subscription | Filecoin | [Filfox](https://filfox.info/en/address/0xb0Bda1Ad964a55ACB077587e42BDfeC587D7e520)             |
| PPT Mirror Token     | Optimism | [Etherscan](https://optimistic.etherscan.io/address/0xa9c14d3e8ece4d924a4a4a819088f982b55f6734) |

💧 [SushiSwap Liquidity Pool (Filecoin)](https://calibration.filfox.info/en/address/0xb84A2bC5Dd76BcD6548022Ac86e77b84acB94A87)

---

### 🔐 3. Privacy-Preserving Medical Billing (ZK Module)

OP Medicine integrates with the
[**ZKMedical-Billing** repository](https://github.com/seetadev/ZKMedical-Billing)
for privacy-first and fraud-resistant medical billing:

* **Circom/Noir-based ZK proofs** for invoice validation
* **Sindri ZKML** for on-chain fraud and anomaly detection
* Bridges verified proofs to **Filecoin FVM contracts**
* Anchors all records on **IPFS/Filecoin** for immutable auditability

This dependency provides ZK verification for OP Medicine’s billing and subscription workflows.

---

### 💻 4. Developer-Facing Web3 Stack

* **React + Ionic DApps** with Filecoin data verification
* **Token-gated access** for healthcare providers
* **Lighthouse + Storacha integration** for secure storage
* **NFT-based credentials** for medical professionals

🔗 Live: [op-medicine-deploy.vercel.app](https://op-medicine-deploy.vercel.app)

---

## 🌍 Deployments & Adoption

* **Code for GovTech (C4GT) 2024–2025:** Open-source Filecoin smart contracts for healthcare transparency
* **Netaji Subhas University of Technology (NSUT):** Clinical billing & data pipeline pilot
* **Google Blocktest Prize:** Civic innovation use case for decentralized health data
* **Gates Foundation Program (Partner Initiative):** Affordable Web3 health infrastructure research

---

## 📊 Community Impact

✅ Filecoin-powered **verifiable medical records**
✅ Privacy-first **ZK medical billing**
✅ Tokenized access for **affordable healthcare**
✅ **Cross-chain interoperability** (Filecoin ↔ Optimism)
✅ **Open public-good infrastructure** for digital health

📄 [Impact Report (EMTTR × Filecoin)](https://docs.google.com/document/d/1EeDx_V51FxeZzRoFQjIaboOf2HTlVzHRHHEdV1tN0sc/edit?usp=sharing)

---

## 🧠 Why Filecoin Matters for OP Medicine

Filecoin provides the **verifiability layer** needed for healthcare data — ensuring that every record, test result, or invoice stored through OP Medicine is **tamper-proof, auditable, and cryptographically verifiable**.

Through **Compute-over-Data (CoD)** and **FVM smart contracts**, OP Medicine enables:

* AI-assisted medical audits over decentralized data
* Automated claims verification and reimbursement
* Transparent medical research pipelines for public health

> 🩺 OP Medicine proves that **Filecoin = the backbone of verifiable healthcare**.

---

## 🧩 Related Repositories

| Repo                                                                                               | Description                                          |
| -------------------------------------------------------------------------------------------------- | ---------------------------------------------------- |
| [aspiringsecurity/EMTTR](https://github.com/aspiringsecurity/EMTTR)                                | Core Filecoin + Optimism healthcare suite            |
| [seetadev/ZKMedical-Billing](https://github.com/seetadev/ZKMedical-Billing)                        | ZK verification and billing logic                    |
| [web3-kyc-lit](https://github.com/seetadev/web3-kyc-lit/tree/dev)                                  | Lit Protocol KYC integration                         |
| [web3-invoice-token-gated-storacha](https://github.com/seetadev/web3-invoice-token-gated-storacha) | React DApp for Filecoin-based subscription workflows |

---

## 🌐 Links & Resources

* 🧭 **Main Website:** [op-medicine-deploy.vercel.app](https://op-medicine-deploy.vercel.app)
* 🧩 **Developer Portal:** [emttr-deploy.vercel.app](https://emttr-deploy.vercel.app)
* 💬 **Community Page:** [Google Sites](https://sites.google.com/view/emttrservice/)
* 💾 **Filecoin RetroPGF Proposal:** [Filecoin-RetroPGF.md](https://github.com/aspiringsecurity/EMTTR/blob/main/Filecoin-RetroPGF.md)
* 🧠 **ZK Module:** [ZKMedical-Billing](https://github.com/seetadev/ZKMedical-Billing)

---

### 🫀 Maintainers & Acknowledgments

Built by the **OP Medicine** team with support from:

* 🧩 **Protocol Labs** & **Filecoin Foundation**
* 🌱 **C4GT grant by Gates Foundation, Omidyar Network & Github** & **Chainlink, Filecoin Impact Rewards, Avail**
* 🧠 **Code for GovTech (C4GT)** & **NSUT**

> “Making healthcare verifiable, private, and affordable — powered by Filecoin and Optimism.”


