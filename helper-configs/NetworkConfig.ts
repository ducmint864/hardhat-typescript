const networkConfig = {
    31337: { 
        name: "hardhat_localhost",
        priceFeedAddress: "0x694AA1769357215DE4FAC081bf1f309aDC325306" // borrow from sepolia testnet
    },
    11155111: { // sepolia_test_net
        name: "sepolia_testnet",
        priceFeedAddress: "0x694AA1769357215DE4FAC081bf1f309aDC325306"
    }
}

export default networkConfig;
