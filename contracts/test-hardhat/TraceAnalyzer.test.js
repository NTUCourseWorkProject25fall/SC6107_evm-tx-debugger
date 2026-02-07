/**
 * Hardhat tests for analyzer libraries (Option 2 - no Foundry required).
 * For full Solidity-based tests, use Foundry: npm run test:foundry
 */

const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("EVM Transaction Debugger - Hardhat", function () {
  it("should have a valid Hardhat runtime", function () {
    expect(ethers.provider).to.not.be.undefined;
    expect(ethers.provider.getNetwork).to.be.a("function");
  });

  it("should connect to Hardhat network", async function () {
    const network = await ethers.provider.getNetwork();
    expect(network.chainId).to.equal(31337n);
  });

  it("should have default signer with balance", async function () {
    const [signer] = await ethers.getSigners();
    expect(signer.address).to.match(/^0x[a-fA-F0-9]{40}$/);
    const balance = await ethers.provider.getBalance(signer.address);
    expect(balance).to.be.gt(0n);
  });
});
