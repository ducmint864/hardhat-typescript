import { ethers } from "hardhat";
import { assert, expect} from "chai";
import deployFund from "../../scripts/deployFund";
import { Fund } from "../../typechain-types";

describe("Fund", async () => {
    let response : string[];
    let fundAddress : string;
    let priceFeedAddress : string;
    let fund : Fund;

    before(async() => {
        response = await deployFund() ?? ["", ""];
        fundAddress = response[0];
        priceFeedAddress = response[1];

        it("-Deploy the Fund contract without issues", () => {
            assert.notEqual(fundAddress, "")
        })

        it("-Deploy the MockV3Aggregator contracdt without issues", () => {
            assert.notEqual(priceFeedAddress, "");
        })
    })

    beforeEach(async () => {
        fund = await ethers.getContractAt("Fund", fundAddress);
    })

    describe("Constructor", async() => {
        it("-Initializes Fund contract with correct price feed address", async() => {
            assert.equal(await fund.priceFeed(), priceFeedAddress);
        })
    })
})