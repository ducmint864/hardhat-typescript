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
        [FUND_ADDRESS, PRICE_FEED_ADDRESS] = await deployFund() ?? ["", ""];
        FUND = await ethers.getContractAt("Fund", FUND_ADDRESS);

        [OWNER, FUNDER] = await ethers.getSigners();
        FUNDER_CONTRACT = FUND.connect(FUNDER);
        OWNER_CONTRACT = FUND.connect(OWNER);
        
        TOTAL_FUND = BigInt(0);
    })

    describe("constructor()", async () => {
        it("-Initializes Fund contract with correct price feed address", async () => {
            assert.equal(await FUND.priceFeed(), PRICE_FEED_ADDRESS);
        })
    })

    describe("fund()", async () => {
        it("Fails if you don't fund enough ETH", async () => {
            await expect(FUND.fund()).to.be.revertedWith("Minimum amount not reached! Transaction has been reverted.");
        })

        it("Store the correct amount of ETH that each funder has funded", async () => {
            await FUNDER_CONTRACT.fund({ value: SEND_AMOUNT });
            TOTAL_FUND += SEND_AMOUNT;
            assert.equal(SEND_AMOUNT, await FUNDER_CONTRACT.addressToAmount(FUNDER.address));
        })

        it("Only add a funder to the funders array once", async () => {
            // send ETH 2 more times
            await FUNDER_CONTRACT.fund({ value: SEND_AMOUNT });
            await FUNDER_CONTRACT.fund({ value: SEND_AMOUNT });
            TOTAL_FUND += (SEND_AMOUNT * BigInt(2));
            assert.equal(1, await FUNDER_CONTRACT.getFundersCount());
        })
    })

    describe("withdraw()", async () => {
        it("Reverts if the account who withdraws ISN'T the owner of the contract", async () => {
            await expect(FUNDER_CONTRACT.withdraw()).to.be.revertedWith("Only the owner of this funding is allowed to withdraw the funded money!");
        })
        
        it("Sends all the funded money to the owner account", async () => {
            const balanceBefore: bigint = await ethers.provider.getBalance(OWNER);

            // infos of withdrawal transaction
            const response = await OWNER_CONTRACT.withdraw();
            const sender: string = response.from;
            const receiver: string = response.to;
            const value : bigint = response.value;
            const fee: bigint = response.gasPrice * response.gasLimit;

            const expected: bigint = balanceBefore + value - fee;
            const balanceAfter: bigint = await ethers.provider.getBalance(OWNER);

            assert.equal(value, TOTAL_FUND);
            assert.equal(sender, FUND_ADDRESS);
            assert.equal(receiver, OWNER.address);
            assert.equal(balanceAfter, expected);
        })
    })
})