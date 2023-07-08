import { ethers, network } from "hardhat"
import networkConfig from "../helper-configs/NetworkConfig";
import { Escrow } from "../typechain-types";
import "dotenv/config"

export async function main() {
    const PriceContract = await ethers.deployContract("Price");
    await PriceContract.waitForDeployment();
    const PriceContractAddress = await PriceContract.getAddress();
    const chainId : number = network.config.chainId! ?? process.env.DEFAULT_CHAIN_ID;
    
    const EscrowFactory = (await ethers.getContractFactory("Escrow",
        {
            libraries: {
                Price: PriceContractAddress
            }
        }));
    const EscrowContract : Escrow = await EscrowFactory.deploy(networkConfig[chainId as keyof typeof networkConfig].priceFeedAddress);
    await EscrowContract.waitForDeployment();
    console.log(`Escrow smart contract has been deployed to address: ${await EscrowContract.getAddress()}\n`);
}

main().catch((err: any) => {
    console.log(err);
})