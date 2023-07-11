import { ethers } from "hardhat";
import { assert, expect } from "chai";
import deployFund from "../../scripts/deployFund";
import { Fund } from "../../typechain-types";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";


describe("Fund", async () => {
    let FUND_ADDRESS: string;
    let PRICE_FEED_ADDRESS: string;
    let FUND: Fund;

    let OWNER: HardhatEthersSigner;
    let FUNDER: HardhatEthersSigner;
    let FUNDER_CONTRACT: Fund;
    let OWNER_CONTRACT: Fund;

    let TOTAL_FUND: bigint;
    const SEND_AMOUNT: bigint = ethers.parseEther("1")

    before(async () => {
        // action
        [FUND_ADDRESS, PRICE_FEED_ADDRESS] = await deployFund() ?? ["", ""];
        FUND = await ethers.getContractAt("Fund", FUND_ADDRESS);

        [OWNER, FUNDER] = await ethers.getSigners();
        FUNDER_CONTRACT = FUND.connect(FUNDER);
        OWNER_CONTRACT = FUND.connect(OWNER);
        
        TOTAL_FUND = 0n;
    })

    describe("constructor()", async () => {
        it("-Initializes Fund contract with correct price feed address", async () => {
            //assertion
            assert.equal(await FUND.priceFeed(), PRICE_FEED_ADDRESS);
        })
    })

    describe("fund()", async () => {
        it("Fails if you don't fund enough ETH", async () => {
            // assertion
            await expect(FUND.fund()).to.be.revertedWith("Minimum amount not reached! Transaction has been reverted.");
        })

        it("Store the correct amount of ETH that each funder has funded", async () => {
            // action
            await FUNDER_CONTRACT.fund({ value: SEND_AMOUNT });
            TOTAL_FUND += SEND_AMOUNT;

            // assertion
            assert.equal(SEND_AMOUNT, await FUNDER_CONTRACT.addressToAmount(FUNDER.address));
        })

        it("Only add a funder to the funders array once", async () => {
            // action
            await FUNDER_CONTRACT.fund({ value: SEND_AMOUNT });
            await FUNDER_CONTRACT.fund({ value: SEND_AMOUNT });
            TOTAL_FUND += (SEND_AMOUNT * 2n);

            // assertion
            assert.equal(1, await FUNDER_CONTRACT.getFundersCount());
        })
    })

    describe("withdraw()", async () => {
        it("Reverts if the account who withdraws ISN'T the owner of the contract", async () => {
            // assertion
            await expect(FUNDER_CONTRACT.withdraw()).to.be.revertedWith("Only the owner of this funding is allowed to withdraw the funded money!");
        })
        
        it("Sends all the funded money to the owner account", async () => {
            // action
            const contractBalanceBefore: bigint = await ethers.provider.getBalance(FUND_ADDRESS);
            const ownerBalanceBefore: bigint = await ethers.provider.getBalance(OWNER);

            const response = await OWNER_CONTRACT.withdraw();
            const receipt = await response.wait();
            const txFee : bigint = receipt?.gasPrice * receipt?.gasUsed;
            
            const contractBalanceAfter: bigint = await ethers.provider.getBalance(FUND_ADDRESS);
            const ownerBalanceAfter: bigint = await ethers.provider.getBalance(OWNER);

            // assertion
            assert.deepEqual(contractBalanceAfter, 0n);
            assert.deepEqual(ownerBalanceAfter + txFee, contractBalanceBefore + ownerBalanceBefore)
        })
    })
})