import { assert } from "chai";
import { ethers } from "hardhat";
import { main } from "../scripts/deploy.ts"

describe("Escrow", function () {
    this.beforeEach(function () {
        main().catch((err: any) => {
            console.log(err);
        })
    })
})