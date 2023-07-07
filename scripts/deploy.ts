import { ethers } from "hardhat"

export async function main() {
    const Price = await ethers.deployContract("Price");
    await Price.waitForDeployment();
    const PriceAddress = await Price.getAddress();
    
    const EscrowFactory = (await ethers.getContractFactory("Escrow", 
    {
        libraries: {
            Price: PriceAddress
        }
    })) as Escrow__factory;
    const Escrow = await EscrowFactory.deploy();
    await Escrow.waitForDeployment();
    const EscrowAddress = await Escrow.getAddress();
    console.log(`Escrow smart contract has been deployed to address: ${EscrowAddress}\n`);
}

main().catch((err: any) => {
    console.log(err);
})

