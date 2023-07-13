import { ethers, network } from "hardhat";
import "dotenv/config"
import { Fund, Price } from "../typechain-types";
import networkConfig from "../helper-configs/NetworkConfig"
import { developmentChains } from "../helper-configs/NetworkConfig";
import deployMockV3Aggregator from "./test/deployMockV3Aggregator";
import { writeFileSync } from "fs";
import { join } from "path";


// Contract Addresses
let AGGREGATOR_CONTRACT_ADDRESS: string;
let PRICE_CONTRACT_ADDRESS: string;
let FUND_CONTRACT_ADDRESS: string;


// Contract instances
let PRICE_CONTRACT: Price;
let FUND_CONTRACT: Fund;


// deploy Fund contract
export default async function deployFund() {
    try {
        // Arrange
        const chainId: number = (network.config.chainId as number) ?? process.env.DEFAULT_CHAIN_ID;

        console.log("---------------------------- Contract deployment script ----------------------------\n");
        console.log("--> Network: {\n\tName: ", networkConfig[chainId as keyof typeof networkConfig].name);
        console.log("\tChain-Id: ", chainId);
        console.log("}");
        console.log("------------------------------------------------------------------------------------");

        if (developmentChains.includes(chainId)) {
            console.log("--> Local host detected! Using MockV3Aggregator contract");
            AGGREGATOR_CONTRACT_ADDRESS = await deployMockV3Aggregator() ?? ""; // Deploy MockV3Aggregator contract
        }
        else {
            AGGREGATOR_CONTRACT_ADDRESS = networkConfig[chainId as keyof typeof networkConfig].priceFeedAddress ?? "";
        }

        if (AGGREGATOR_CONTRACT_ADDRESS == "") {
            throw new Error("Cannot get address of MockV3Aggregator contract");
        }

        // Deploy Price contract
        PRICE_CONTRACT = await ethers.deployContract("Price");
        await PRICE_CONTRACT.waitForDeployment();
        PRICE_CONTRACT_ADDRESS = await PRICE_CONTRACT.getAddress() ?? "";
        if (PRICE_CONTRACT_ADDRESS == "") {
            throw new Error("Cannot get address of Price contract");
        }
        console.log(`Price contract has been deployed to address ${PRICE_CONTRACT_ADDRESS}`);

        // Deploy Fund contract
        const FundFactory = await ethers.getContractFactory("Fund",
            {
                libraries: {
                    Price: PRICE_CONTRACT_ADDRESS
                }
            }
        )
        FUND_CONTRACT = await FundFactory.deploy(AGGREGATOR_CONTRACT_ADDRESS);
        await FUND_CONTRACT.waitForDeployment();
        FUND_CONTRACT_ADDRESS = await FUND_CONTRACT.getAddress();
        if (FUND_CONTRACT_ADDRESS == "") {
            throw new Error("Cannot get address of Fund contract");
        }
        console.log(`Fund contract has been deployed to address ${await FUND_CONTRACT.getAddress()}`);

        // return addresses of all Aggregator, Price, Fund contract for later use
        return [AGGREGATOR_CONTRACT_ADDRESS, PRICE_CONTRACT_ADDRESS, FUND_CONTRACT_ADDRESS];

    } catch (err: any) {
        console.log("--> Error deploying Fund contract: ", err);
        process.exit(0);
    }
}


// Test deployFund()
(async () => {
    await deployFund();

    // write address of Aggregator, Price, and Fund contracts to front-end folder
    try {
        const dirName: string = "../hardhat-ts-front-end/assets/addresses/";
        writeFileSync(
            join(dirName, "Aggregator__contract__address.js"),
            ("export default const AGGREGATOR_CONTRACT_ADDRESS = \"" + AGGREGATOR_CONTRACT_ADDRESS + "\";"),
            { flag: "w" }
        );
        writeFileSync(
            join(dirName, "Price__contract__address.js"),
            ("export default const PRICE_CONTRACT_ADDRESS =\"" + PRICE_CONTRACT_ADDRESS + "\";"),
            { flag: "w" }
        );
        writeFileSync(
            join(dirName, "Fund__contract__address.js"),
            ("export default const PRICE_CONTRACT_ADDRESS =\"" + FUND_CONTRACT_ADDRESS + "\";"),
            { flag: "w" }
        );

    } catch (err: any) {
        console.log("--> Error saving contract address: ", err);    
    }
})();
