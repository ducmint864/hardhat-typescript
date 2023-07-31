const networkConfig = {
    31337: { 
        name: "hardhat_localhost",
        priceFeedAddress: "",
        priceContractAddress: "",
        fundContractAddress: "",
    },
    11155111: {
        name: "sepolia_testnet",
        priceFeedAddress: "0x694AA1769357215DE4FAC081bf1f309aDC325306",
        priceContractAddress: "0x484f06b2aD69d22721A0086eCcF466A1f0B046c3",
        fundContractAddress: "0x657e995502c90b7eeDBd7CaEB6000A0886e5ea72",
    },
    1337: {
        name: "ganache_localhost",
        priceFeedAddress: "",
        priceContractAddress: "",
        fundContractAddress: "",
    }
}

export const developmentChains = [1337, 31337];
export default networkConfig;
