const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("DancingPig", function () {
  let Token;
  let token;
  let WETH;
  let weth;
  let UniswapV2Factory;
  let uniswapV2Factory;
  let UniswapV2Router02;
  let uniswapV2Router;
  let owner, addr1, addr2;

  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();

    WETH = await ethers.getContractFactory("MockWETH");
    weth = await WETH.deploy();
    // await weth.deployed();

    // await token.deployed();

    UniswapV2Factory = await ethers.getContractFactory("UniswapV2Factory");
    uniswapV2Factory = await UniswapV2Factory.deploy(owner.address);
    // await uniswapV2Factory.deployed();

    UniswapV2Router02 = await ethers.getContractFactory("UniswapV2Router");
    uniswapV2Router = await UniswapV2Router02.deploy(
      uniswapV2Factory.target,
      weth.target
    );

    Token = await ethers.getContractFactory("DancingPig");
    token = await Token.deploy(uniswapV2Router.target);
    // await uniswapV2Router.deployed();

    // await token.initialize(uniswapV2Router.address);
  });

  it("Should update openTrade and Create Pair", async function () {
    // Transfer tokens to contract for liquidity
    await token.transfer(token.target, "1000000000000000000000");
    await weth.deposit({ value: "10000000000000000000" });
    await token.connect(addr2).deposit({ value: "10000000000000000000" });
    await weth.transfer(token.target, "1000000000000000000");
    await weth.approve(uniswapV2Router.target, "10000000000000000000");

    // Open trading
    try {
      await token.openTrading();
    } catch (error) {
      console.error("openTrading error:", error);
      throw error;
    }
    // Check if trading is open
    // expect(await token.tradingOpen()).to.be.true;
  });
});
