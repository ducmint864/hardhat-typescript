const networkConfig = {
    31337: { 
        name: "hardhat_localhost",
        priceFeedAddress: ""
    },
    11155111: {
        name: "sepolia_testnet",
        priceFeedAddress: "0x694AA1769357215DE4FAC081bf1f309aDC325306"
    },
    1337: {
        name: "ganache_localhost",
        priceFeedAddress: ""
    }

}

export const developmentChains = [1337, 31337];
export default networkConfig;
