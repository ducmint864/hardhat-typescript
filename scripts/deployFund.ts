import { ethers, network } from "hardhat";
import networkConfig from "../helper-configs/NetworkConfig"
import { Fund } from "../typechain-types";
import "dotenv/config"

export async function main() {
    const PriceContract = await ethers.deployContract("Price");
    await PriceContract.waitForDeployment();
    const PriceContractAddress = await PriceContract.getAddress();
    const chainId : number = network.config.chainId! ?? process.env.DEFAULT_CHAIN_ID;

    const FundFactory = await ethers.getContractFactory("Fund", 
        {
            libraries: {
                Price: PriceContractAddress
            }
        }
    )
    const FundContract : Fund = await FundFactory.deploy(networkConfig[chainId as keyof typeof networkConfig].priceFeedAddress); // only parameter: the price feed address of the network this contract is being deployed to
    await FundContract.waitForDeployment();
    console.log(`Fund contract has been deployed to address ${await FundContract.getAddress()}`);
}

main().catch((err: any) => {
    console.log(err);
})