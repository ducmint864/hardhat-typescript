import { ethers, network } from "hardhat";
import { assert, expect } from "chai";
import deployFund from "../../scripts/deployFund";
import { Fund } from "../../typechain-types";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { developmentChains } from "../../helper-configs/NetworkConfig";
import "dotenv/config";

developmentChains.includes(network.config.chainId as number) ? describe.skip :
describe("Fund - staging test", async () => {
    let FUND_ADDRESS: string;
    let PRICE_FEED_ADDRESS: string;
    let FUND: Fund;

    let OWNER: HardhatEthersSigner;
    let OWNER_CONTRACT: Fund;

    before(async () => {        
        // arrange
        [FUND_ADDRESS, PRICE_FEED_ADDRESS] = await deployFund() ?? ["", ""];
        FUND = await ethers.getContractAt("Fund", FUND_ADDRESS);
        
        [OWNER, FUNDER] = await ethers.getsi.getSigners();
        FUNDER_CONTRACT = FUND.connect(FUNDER);
        OWNER_CONTRACT = FUND.connect(OWNER);
    })

    // it("allows people to fund and withdraw", async () => {
        
    // })
}) 