# MediToken - How to get started?

MediToken is an ERC20 token designed to revolutionize the healthcare sector by introducing a transparent, trustless, and decentralized mechanism for managing healthcare processes. Deployed across multiple blockchain networks, MediToken enables seamless and secure interactions within the healthcare ecosystem. The deployed addresses for each supported chain are listed [here](https://github.com/seetadev/ZKMedical-Billing/tree/main/Medi_Token#deployed-contract-addresses).

## Potential Applications of MediToken in Healthcare
MediToken can be utilized in various healthcare applications, including but not limited to:
- **Token-Gated Access Control** for resources & functionalities
- **Tokenized Health Records**
- **Patient Payments**
- **Insurance Claims**
- **Health Rewards**
- **Research Funding and Donations**
- **Inventory Management**
- **Governance and Voting**
- **Patient Data Ownership**

## Migrating a Web2 Project to Web3 Using MediToken

If you are transitioning from a Web2 project to the Web3 ecosystem, follow these steps to integrate access control using MediToken:

### 1. Integrate Wallet Connection
Utilize our [custom cross-platform connect wallet functionality](https://github.com/seetadev/ZKMedical-Billing/tree/main/web3-medical-invoice-ionic-metamask-connector) or choose from popular options like [ConnectKit](https://docs.family.co/connectkit), [RainbowKit](https://www.rainbowkit.com/docs/introduction), or another preferred method.

### 2. Install Required Dependencies
To interact with the MediToken contract, install the necessary libraries:
```bash
yarn add ethers@5.6.1 wagmi@1.x
```
Alternatively, you can use `web3.js` if preferred.

### 3. Setup Contract ABI
Copy the contract ABI from [here](https://github.com/seetadev/ZKMedical-Billing/tree/main/Medi_Token/abi/MediTokenAbi.json), then create a `utils/abis` directory inside your `src` directory. Create a `MediTokenAbi.json` file inside `abis` and paste the copied content.

### 4. Import the ABI
Import the `MediTokenAbi.json` file where you need to interact with the contract:
```javascript
import MediTokenAbi from "../../utils/abis/MediTokenAbi.json";
```

### 5. Import Required Hooks and Libraries
Import the necessary hooks and libraries for wallet connection and contract interaction:
```javascript
import { useAccount, useSigner } from 'wagmi';
import { ethers } from 'ethers';
```

### 6. Retrieve the Connected Wallet Address
Destructure the address from the `useAccount` hook inside your functional component:
```javascript
const { address } = useAccount();
```

### 7. Track the Number of Tokens
Create a state variable to keep track of the number of MediTokens for the connected address:
```javascript
const [numOfTokens, setNumOfTokens] = useState(0);
```

### 8. Fetch User Tokens
Create a function to fetch the current number of tokens held by the connected address:
```javascript
const fetchUserTokens = async () => {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const contract = new ethers.Contract(
        MEDITOKEN_CONTRACT_ADDRESS,
        MediTokenAbi,
        signer
    );
    const userTokens = await contract.balanceOf(address);
    console.log("User tokens:", userTokens);
    setNumOfTokens(userTokens / 10 ** 18);
};
```

### 9. Use useEffect for Initial Fetch
Depending on your product's requirements, render the user's token balance when the component mounts. If you want to restrict access to certain functionalities on the first render, pass an empty dependency array to `useEffect`:
```javascript
useEffect(() => {
    try {
        fetchUserTokens();
    } catch (e) {
        console.log("Error getting user tokens:", e);
    }
}, []);
```

### 10. Implement Conditional Logic
Use the `numOfTokens` state variable to conditionally implement various functionalities based on the number of tokens the connected wallet holds.

For more diverse and interesting use cases, integrate MediToken into your smart contracts.

## Solidity Smart Contract Integration

In your Solidity smart contract, follow these steps to integrate MediToken:

### 1. Import Necessary Contracts
```javascript
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
```

### 2. Define State Variables
Declare an immutable state variable to store the MediToken contract address:
```javascript
IERC20 public immutable i_mediToken;
```

### 3. Set Constructor Parameters
Set the constructor to receive the MediToken contract address for a specific chain during deployment:
```javascript
constructor(address _mediToken) Ownable(msg.sender) {
    i_mediToken = IERC20(_mediToken);
}
```

### 4. Implement Token Gating
Follow the CEI (Checks-Effects-Interactions) pattern in Solidity. Token-gate functions that require access control by adding a balance check at the top:
```javascript
require(i_mediToken.balanceOf(msg.sender) >= 1, "You need to hold a MediToken to save.");
```

### 5. Get User Tokens
Create a function to return the MediToken balance of the caller:
```javascript
function getUserTokens() public view returns (uint256) {
    return i_mediToken.balanceOf(msg.sender);
}
```

## Creating and Deploying Your Own Token

If you're looking to deploy your own token while leveraging the same infrastructure as MediToken, follow the steps outlined in the [project README](https://github.com/seetadev/ZKMedical-Billing/blob/main/Medi_Token/README.md).

Before proceeding with deployment, make sure to customize the following:

- **Token Name and Symbol**: Modify these parameters in the [MediToken contract](https://github.com/seetadev/ZKMedical-Billing/blob/main/Medi_Token/src/MediToken.sol).
- **Total Supply**: Adjust the total supply settings in the [deployment script](https://github.com/seetadev/ZKMedical-Billing/blob/main/Medi_Token/script/DeployToken.s.sol).

By updating these values, you can tailor the token to fit your specific needs before deploying it on the desired blockchain.
