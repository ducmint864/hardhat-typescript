import { ethers, network } from "hardhat";
import "dotenv/config"
import { Fund } from "../typechain-types";
import networkConfig from "../helper-configs/NetworkConfig"
import { developmentChains } from "../helper-configs/NetworkConfig";
import deployMockV3Aggregator from "./test/deployMock";


// function to deploy the Fund smart contract
export default async function deployFund() {
    try {

        const chainId: number = network.config.chainId! ?? process.env.DEFAULT_CHAIN_ID;
        let priceFeedAddress;

        console.log("---------------------------- Contract deployment script ----------------------------\n");
        console.log("--> Network: {\n\tName: ", networkConfig[chainId as keyof typeof networkConfig].name);
        console.log("\tChain-Id: ", chainId);
        console.log("}");
        console.log("------------------------------------------------------------------------------------");


        if (developmentChains.includes(chainId)) {
            console.log("--> Local host detected! Using MockV3Aggregator contract");
            priceFeedAddress = deployMockV3Aggregator();
        }
        else {
            priceFeedAddress = networkConfig[chainId as keyof typeof networkConfig].priceFeedAddress;
        }

        const PriceContract = await ethers.deployContract("Price");
        await PriceContract.waitForDeployment();
        const PriceContractAddress = await PriceContract.getAddress();
        const FundFactory = await ethers.getContractFactory("Fund",
            {
                libraries: {
                    Price: PriceContractAddress
                }
            }
        )
        const FundContract: Fund = await FundFactory.deploy(priceFeedAddress); // only parameter: the price feed address of the network this contract is being deployed to
        await FundContract.waitForDeployment();
        console.log(`Fund contract has been deployed to address ${await FundContract.getAddress()}`);
    } catch (err: any) {
        console.log("--> Error deploying Fund contract: ", err);
    }
}

// Invoke contract deployment function
deployFund();