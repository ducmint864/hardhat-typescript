import { ethers } from "hardhat";
import { MockV3Aggregator__factory } from "../../typechain-types";
import { MockV3Aggregator } from "../../typechain-types/"

// deploy and return the address of the Mock Price Feed for later use
export default async function deployMockV3Aggregator() {
    try {
        const decimals = 8;
        const initialAnswer = 200000000000;
        const MockFactory = await ethers.getContractFactory("MockV3Aggregator");
        const MockV3Aggregator: MockV3Aggregator = await MockFactory.deploy(decimals, initialAnswer);
        await MockV3Aggregator.waitForDeployment();
        console.log(`MockV3Aggregator contract deployed to address: ${await MockV3Aggregator.getAddress()}`);
        return await MockV3Aggregator.getAddress();
    } catch (err : any) {
        console.log("--> Error deploying MockV3Aggregator contract: ", err);
        throw err;
    }
}

// // Test invoke
// deployMockV3Aggregator();