import { ethers, network } from "hardhat";
import networkConfig from "../helper-configs/NetworkConfig"

export async function main() {
    const Price = await ethers.deployContract("Price");
    await Price.waitForDeployment();
    const PriceAddress = await Price.getAddress();
    const chainId : number = network.config.chainId!;
    const priceFeedAddress = networkConfig[chainId as keyof typeof networkConfig].priceFeedAddress;

    const FundFactory = await ethers.getContractFactory("Fund", 
        {
            libraries: {
                Price: PriceAddress
            }
        }
    )
    console.log(`The address of the price feed is: ${priceFeedAddress}`);
    const Fund = await FundFactory.deploy(priceFeedAddress.toString()); // only parameter: the price feed address of the network this contract is being deployed to
    // const Fund = FundFactory.deploy();
    await Fund.waitForDeployment();
    const FundAddress = await Fund.getAddress();
    console.log(`Fund contract has been deployed to address ${FundAddress}`);
}

main().catch((err: any) => {
    console.log(err);
})