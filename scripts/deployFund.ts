import { ethers, network } from "hardhat";
import "dotenv/config"
import { Fund } from "../typechain-types";
import networkConfig from "../helper-configs/NetworkConfig"
import { developmentChains } from "../helper-configs/NetworkConfig";
import deployMockV3Aggregator from "./test/deployMockV3Aggregator";

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
            priceFeedAddress = await deployMockV3Aggregator() ?? "";
        }
        else {
            priceFeedAddress = networkConfig[chainId as keyof typeof networkConfig].priceFeedAddress ?? "";
        }

        if (priceFeedAddress == "") {
            throw new Error ("Cannot get address of MockV3Aggregator contract");
        }

        const PriceContract = await ethers.deployContract("Price");
        await PriceContract.waitForDeployment();
        const PriceContractAddress : string = await PriceContract.getAddress() ?? "";
        if (PriceContractAddress == "") {
            throw new Error("Cannot get address of Price contract");
        }

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
        return [await FundContract.getAddress(), priceFeedAddress];
    } catch (err: any) {
        console.log("--> Error deploying Fund contract: ", err);
    }
}

// Test deployFund()
// (async () => {
//     const response : string[] = await deployFund() ?? ["", ""];
//     console.log("Address of fund contract: ", response[0]);
//     console.log("Address of MockV3Aggregator contract: ", response[1]);
// })();