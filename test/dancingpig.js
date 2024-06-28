const { expect } = require("chai");
const { ethers } = require("hardhat");
const BigNumber = require("bignumber.js");

describe("DancingPig", function () {
  let Token, token, owner, addr1, addr2, feeSetter, uniswapV2Factory, WETH;

  beforeEach(async function () {
    [owner, addr1, addr2, feeSetter] = await ethers.getSigners();
    let initialSupply = 1000000000000000;
    const MockWETH = await ethers.getContractFactory("MockWETH");
    WETH = await MockWETH.deploy(initialSupply);
    const UniswapV2Factory = await ethers.getContractFactory(
      "UniswapV2Factory"
    );

    uniswapV2Factory = await UniswapV2Factory.deploy(feeSetter.address);
    console.log(
      "uniswapV2Factory.target,WETH.target ",
      uniswapV2Factory.target,
      WETH.target
    );
    UniswapV2Router = await ethers.getContractFactory("UniswapV2Router");
    uniswapV2Router = await UniswapV2Router.deploy(
      uniswapV2Factory.target,
      WETH.target
    );

    Token = await ethers.getContractFactory("DancingPig");
    token = await Token.deploy(uniswapV2Router.target);
    console.log("Token Dancing: ", token.target);
    // await token.deployed();
  });

  it("Should assign the total supply of tokens to the owner", async function () {
    const ownerBalance = await token.balanceOf(owner.address);
    expect(await token.totalSupply()).to.equal(ownerBalance);
  });

  it("Should transfer tokens between accounts", async function () {
    await token.transfer(addr1.address, 50);
    const addr1Balance = await token.balanceOf(addr1.address);
    expect(addr1Balance).to.equal(50);

    await token.connect(addr1).transfer(addr2.address, 50);
    const addr2Balance = await token.balanceOf(addr2.address);
    expect(addr2Balance).to.equal(50);
  });

  it("Should fail if sender doesn’t have enough tokens", async function () {
    const initialOwnerBalance = await token.balanceOf(owner.address);

    await expect(
      token.connect(addr1).transfer(owner.address, 1)
    ).to.be.revertedWith("SafeMath: subtraction overflow");

    expect(await token.balanceOf(owner.address)).to.equal(initialOwnerBalance);
  });

  it("Should update balances after transfers", async function () {
    const initialOwnerBalance = await token.balanceOf(owner.address);

    await token.transfer(addr1.address, 100);
    await token.transfer(addr2.address, 50);

    // const finalOwnerBalance = await token.balanceOf(owner.address);
    // const num1 = new BigNumber("150"); // 1 ETH in wei

    // const scientificNumber = new BigNumber("3.77777777777777e+32");
    // console.log(scientificNumber.toFixed());

    // expect(finalOwnerBalance.toString()).to.equal(scientificNumber.toFixed());

    const addr1Balance = await token.balanceOf(addr1.address);
    expect(addr1Balance.toString()).to.equal("100");

    const addr2Balance = await token.balanceOf(addr2.address);
    expect(addr2Balance.toString()).to.equal("50");
  });
  it("Should update openTrade and Create Pair", async function () {
    let amount = "100000000000000000000";
    await WETH.transfer(token.target, amount);
    await token.transfer(token.target, amount);
    const tx = await owner.sendTransaction({
      to: token.target,
      value: amount, // sending 1 ETH
    });

    // Wait for the transaction to be mined
    await tx.wait();
    await token.openTrading();
  });
});
