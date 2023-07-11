// import { ethers, network } from "hardhat";
// import { assert } from "chai";
// import deployFund from "../../scripts/deployFund";
// import { Fund } from "../../typechain-types";
// import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
// import { developmentChains } from "../../helper-configs/NetworkConfig";

// developmentChains.includes(network.config.chainId as number) ? describe.skip :
// describe("Fund - staging test", async () => {
//     // this.timeout(100 * 1000); 
//     let FUND_ADDRESS: string;
//     let FUND: Fund;

//     let OWNER: HardhatEthersSigner;
//     let OWNER_CONTRACT: Fund;

//     const SEND_AMOUNT = ethers.parseUnits("1", "wei");

//     before(async () => {        
//         // arrange
//         [FUND_ADDRESS] = await deployFund() ?? ["", ""];
//         FUND = await ethers.getContractAt("Fund", FUND_ADDRESS);
//     })
    
//     it("allows people to fund and withdraw", async () => {
//         // arrange
//         OWNER = await ethers.provider.getSigner();
//         OWNER_CONTRACT = FUND.connect(OWNER);
//         // action
//         const ownerBalanceBefore: bigint = await ethers.provider.getBalance(OWNER);

//         await OWNER_CONTRACT.fund({value : SEND_AMOUNT});
//         const response = await OWNER_CONTRACT.withdraw();
//         const receipt = await response.wait(1);
//         const txFee: bigint = receipt!.fee!;

//         const ownerBalanceAfter: bigint = await ethers.provider.getBalance(OWNER);

//         // assert
//         assert.equal(ownerBalanceBefore, ownerBalanceAfter + txFee);
//     })
// }) 