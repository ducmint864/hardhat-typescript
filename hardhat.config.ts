import "@nomicfoundation/hardhat-toolbox";
import "@nomicfoundation/hardhat-ethers"
import "solidity-coverage";
import "hardhat-gas-reporter";
import "dotenv/config";

const PRIVATE_KEY = process.env.PRIVATE_KEY || "";
const SEPOLIA_RPC_URL = process.env.SEPOLIA_RPC_URL;
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY;
const COINMARKETCAP_API_KEY = process.env.COINMARKETCAP_API_KEY;

module.exports = {
    solidity: "0.8.18",
    // defaultNetwork: "",
    networks: {
        sepolia_testnet: {
            url: SEPOLIA_RPC_URL,
            accounts: [PRIVATE_KEY],
            chainId: 11155111,
            gas: 7200,
            gasPrice: 30000 
        },
        hardhat_localhost: {
            url: process.env.HARDHAT_LOCALHOST_RPC_URL,
            chainId: 31337
            // gas: 1000000000,
            // gasPrice: 1000000000    
        },
        ganache_localhost: {
            url: process.env.GANACHE_LOCALHOST_RPC_URL,
            chainId: 1337,
            accounts: ["0xb4da86fe60e59ae527c76f1be8e5171c6d4b25f81dc3bded8f239ea6cf028ac4"],
        }
    },
    etherscan: {
        apiKey: process.env.ETHERSCAN_API_KEY,
    },
    gasReporter: {
        enabled: true,
        noColors: true,
        currency: 'USD',
        coinmarketcap: COINMARKETCAP_API_KEY
    }
};
