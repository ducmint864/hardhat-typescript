import { ethers } from "hardhat";
import { assert, expect} from "chai";
import deployFund from "../../scripts/deployFund";

describe("Fund", () => {
    beforeEach(async () => {
        deployFund();
    })
})