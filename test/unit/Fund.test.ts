import { ethers } from "hardhat";
import { assert, expect} from "chai";
import deployFund from "../../scripts/deployFund";
import { Fund } from "../../typechain-types";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";

describe("Fund", async () => {
    let RESPONSE : string[];
    let FUND_ADDRESS : string;
    let PRICE_FEED_ADDRESS : string;
    let FUND : Fund;
    let ACCOUNTS : HardhatEthersSigner[];
    let DEPLOYER : HardhatEthersSigner;
    let FUNDER : HardhatEthersSigner;
    const SEND_AMOUNT : bigint = ethers.parseEther("0.1")

    before(async() => {
        RESPONSE = await deployFund() ?? ["", ""];
        [FUND_ADDRESS, PRICE_FEED_ADDRESS] = RESPONSE;
        ACCOUNTS = await ethers.getSigners();
        [DEPLOYER, FUNDER] = await ethers.getSigners();
        FUND = await ethers.getContractAt("Fund", FUND_ADDRESS);
    })

    describe("constructor()", async() => {
        it("-Initializes Fund contract with correct price feed address", async() => {
            assert.equal(await FUND.priceFeed(), PRICE_FEED_ADDRESS);
        })
    })

    describe("fund()", async() => {
        let funderContract : Fund;
        
        before(() => {
            funderContract = FUND.connect(FUNDER);
        })

        it ("Fails if you don't fund enough ETH", async () => {
            await expect(FUND.fund()).to.be.reverted;
        })

        it ("Store the correct amount of ETH that each funder has funded", async () => {
            funderContract.fund({value : SEND_AMOUNT});
            assert.equal(SEND_AMOUNT, await funderContract.addressToAmount(FUNDER.address));
        })

        it("Only add a funder to the funders array once", async () => {
            // send ETH 2 more times
            funderContract.fund({value : SEND_AMOUNT});
            funderContract.fund({value : SEND_AMOUNT});
            assert.equal(1, (await funderContract.funders()).length);
        })
    })
})