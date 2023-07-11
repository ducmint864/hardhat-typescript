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

    const SEND_AMOUNT: bigint = ethers.parseEther("1")

    before(async () => {
        // action
        [FUND_ADDRESS, PRICE_FEED_ADDRESS] = await deployFund() ?? ["", ""];
        FUND = await ethers.getContractAt("Fund", FUND_ADDRESS);

        [OWNER, FUNDER] = await ethers.getSigners();
        FUNDER_CONTRACT = FUND.connect(FUNDER);
        OWNER_CONTRACT = FUND.connect(OWNER);
    })

    describe("constructor()", async () => {
        it("-Initializes Fund contract with correct price feed address", async () => {
            //assertion
            assert.equal(await FUND.getPriceFeed(), PRICE_FEED_ADDRESS);
        })
    })

    describe("fund()", async () => {
        it("Fails if you don't fund enough ETH", async () => {
            // assertion
            await expect(FUND.fund()).to.be.revertedWithCustomError(FUND, "Fund__BelowMinimum");
            // await FUND.fund();
        })

        it("Store the correct amount of ETH that each funder has funded", async () => {
            // action
            await FUNDER_CONTRACT.fund({ value: SEND_AMOUNT });

            // assertion
            assert.equal(SEND_AMOUNT, await FUNDER_CONTRACT.getAddressToAmount(FUNDER.address));
        })

        it("Only add a funder to the funders array once", async () => {
            // action
            await FUNDER_CONTRACT.fund({ value: SEND_AMOUNT });
            await FUNDER_CONTRACT.fund({ value: SEND_AMOUNT });

            // assertion
            assert.equal(1n, await FUNDER_CONTRACT.getFundersCount());
        })
    })

    describe("withdraw()", async () => {
        it("Reverts if the account who withdraws ISN'T the owner of the contract", async () => {
            // assertion
            await expect(FUNDER_CONTRACT.withdraw()).to.be.revertedWithCustomError(FUND, "Fund__NotOwner()");
        })

        it("Sends all the funded money to the owner account (single funder)", async () => {
            // action
            const contractBalanceBefore: bigint = await ethers.provider.getBalance(FUND_ADDRESS);
            const ownerBalanceBefore: bigint = await ethers.provider.getBalance(OWNER);

            const response = await OWNER_CONTRACT.withdraw();
            const receipt = await response.wait(1);
            const txFee: bigint = receipt?.gasPrice * receipt?.gasUsed;

            const contractBalanceAfter: bigint = await ethers.provider.getBalance(FUND_ADDRESS);
            const ownerBalanceAfter: bigint = await ethers.provider.getBalance(OWNER);

            // assertion
            assert.deepEqual(contractBalanceAfter, 0n);
            assert.deepEqual(ownerBalanceAfter + txFee, contractBalanceBefore + ownerBalanceBefore);
            await expect(FUND.getFunder(0)).to.be.reverted; // funders[] array should be cleared after withdrawal
            assert.deepEqual(await FUNDER_CONTRACT.getAddressToAmount(FUNDER.address), 0n); // addressToAmount[] of every funder should be reset to 0 after withdrawal
        })

        it("Sends all the funded money to the owner account (multiple funders)", async () => {
            // action
            let accounts: HardhatEthersSigner[] = await ethers.getSigners();
            for (let i = 1; i < accounts.length; i++) {
                FUNDER = accounts[i];
                FUNDER_CONTRACT = await FUND.connect(FUNDER);
                await FUNDER_CONTRACT.fund({ value: SEND_AMOUNT });
            }
            const contractBalanceBefore: bigint = await ethers.provider.getBalance(FUND_ADDRESS);
            const ownerBalanceBefore: bigint = await ethers.provider.getBalance(OWNER);

            const response = await OWNER_CONTRACT.withdraw({ gasLimit: BigInt("30000000") }); // I have the set the gas limit for the transaction because the amount of ETH withdrawn's too large that the gas will shoot up
            const receipt = await response.wait(1);
            const txFee: bigint = receipt?.gasUsed * receipt?.gasPrice;

            const contractBalanceAfter: bigint = await ethers.provider.getBalance(FUND_ADDRESS);
            const ownerBalanceAfter: bigint = await ethers.provider.getBalance(OWNER);
            // assertion
            assert.equal(contractBalanceAfter, 0n);
            assert.equal(ownerBalanceAfter + txFee, contractBalanceBefore + ownerBalanceBefore);
            await expect(FUND.getFunder(0)).to.be.reverted; // funders[] array should be cleared after withdrawal
            for (let i = 1; i < accounts.length; i++) {
                FUNDER = accounts[i];
                assert.equal(await FUNDER_CONTRACT.getAddressToAmount(FUNDER.address), 0n); //addressToAmount[] of every funder should be reset to 0 after withdrawal
            }
        })
    })
})