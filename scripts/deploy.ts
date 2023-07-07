import { ethers } from "hardhat";

async function main() {
    const Price = await ethers.deployContract("Price");
    const PriceAddress = await Price.getAddress();

    await Price.waitForDeployment();
    
    const EscrowFactory = await ethers.getContractFactory("Escrow", 
    {
        libraries: {
            Price: PriceAddress
        }
    })
    const Escrow = await EscrowFactory.deploy();
    await Escrow.waitForDeployment();

    const EscrowAddress = await Escrow.getAddress();
    console.log(`Escrow smart contract has been deployed to address: ${EscrowAddress}\n`);
}

main().catch((err: any) => {
    console.log(err);
})