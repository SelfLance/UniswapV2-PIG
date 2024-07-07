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
  let pairAddress;

  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();

    WETH = await ethers.getContractFactory("MockWETH");
    weth = await WETH.deploy();
    UniswapV2Factory = await ethers.getContractFactory("UniswapV2Factory");
    uniswapV2Factory = await UniswapV2Factory.deploy(owner.address);
    UniswapV2Router02 = await ethers.getContractFactory("UniswapV2Router");
    uniswapV2Router = await UniswapV2Router02.deploy(
      uniswapV2Factory.target,
      weth.target
    );

    Token = await ethers.getContractFactory("DancingPig");
    token = await Token.deploy(uniswapV2Router.target);

    await token.transfer(token.target, "1000000000000000000000");
    await token.deposit({ value: "1000000000000000000000" });

    try {
      await token.openTrading();
    } catch (error) {
      console.error("openTrading error:", error);
      throw error;
    }
    pairAddress = await uniswapV2Factory.getPair(weth.target, token.target);
    console.log(
      "Weth AddresS: ",
      weth.target,
      "   Router Address: ",
      uniswapV2Router.target,
      " Factory: ",
      uniswapV2Factory.target,
      " Dancing Token: ",
      token.target,
      " Pair Address: ",
      pairAddress
    );
  });

  it.only("Should Transfer Eth to Swap with Token ", async function () {
    const path = [weth.target, token.target];
    const amountIn = "100000000000000000";

    await weth.transfer(pairAddress, "10000000000000000");

    console.log(
      "Pair Contract Address Balance ",
      await weth.balanceOf(pairAddress)
    );
    await uniswapV2Router
      .connect(addr1)
      .swapExactETHForTokens(
        0,
        path,
        addr1.address,
        Math.floor(Date.now() / 1000) + 60 * 10,
        { value: amountIn }
      );
  });
  it.only("Should Transfer Token to Swap with Eth ", async function () {
    const path = [token.target, weth.target];
    await token.transfer(addr1.address, "1000000000000000000");

    const amountIn = "500000000000000000"; //await token.balanceOf(addr1.address);
    console.log("Balance of Token on Addre1: ", amountIn);
    await token.connect(addr1).approve(uniswapV2Router.target, amountIn);
    // await weth.transfer(pairAddress, "10000000000000000000000");
    console.log(
      "Pair Contract Address Balance ",
      await token.balanceOf(pairAddress)
    );
    await uniswapV2Router
      .connect(addr1)
      .swapExactTokensForETH(
        amountIn,
        0,
        path,
        addr1.address,
        Math.floor(Date.now() / 1000) + 60 * 10
      );
  });
  it("Should Swpa Eth for Token", async function () {
    const path = [weth.target, token.target];
    const amountIn = "100000000000000000";
    await token.transfer(token.target, "1000000000000000000000");
    await weth.transfer(token.target, "1000000000000000000000");

    await uniswapV2Router
      .connect(addr1)
      .swapExactETHForTokens(
        0,
        path,
        addr1.address,
        Math.floor(Date.now() / 1000) + 60 * 10,
        { value: amountIn }
      );

    const tokenBalance = await token.balanceOf(addr1.address);
    console.log("Token Balance is: ", tokenBalance);
  });

  it("Should update openTrade and Create Pair", async function () {
    // console.log(`Token price in WETH: ${tokenPrice}`);
    const path = [weth.target, token.target];
    const amountIn = "1000000";

    await uniswapV2Router
      .connect(addr1)
      .swapExactETHForTokens(
        0,
        path,
        addr1.address,
        Math.floor(Date.now() / 1000) + 60 * 10,
        { value: amountIn }
      );

    const tokenBalance = await token.balanceOf(addr1.address);
    console.log("Token Balance is: ", tokenBalance);
    // Let Price:
    await token.transfer(addr2.address, "10000000000000000000000");
    // Deposit 1
    await token.connect(addr2).transfer(pairAddress, "10000000000000000000000");
    // Get reserves
    [reserve0, reserve1] = await pairContract.getReserves();
    console.log("REserves: ", reserve0, reserve1);
    token0 = await pairContract.token0();
    token1 = await pairContract.token1();
    // let token0IsWETH;
    if (token0.toLowerCase() === weth.target.toLowerCase()) {
      token0IsWETH = true;
    } else if (token1.toLowerCase() === weth.target.toLowerCase()) {
      token0IsWETH = false;
    } else {
      throw new Error("Neither token0 nor token1 is WETH");
    }

    console.log("Both Token Reserves: ", reserve0, reserve1);
    if (token0IsWETH) {
      // Price of token1 in terms of WETH
      tokenPrice = Number(reserve0) / Number(reserve1);
      console.log("Token Price in ", tokenPrice);
    } else {
      // Price of token0 in terms of WETH
      tokenPrice = Number(reserve1) / Number(reserve0);
    }

    console.log(
      "Balance Of Tokens: ",
      await pairContract.balanceOf(weth.target),
      await pairContract.balanceOf(token.target)
    );
    console.log(`Token price in WETH : ${tokenPrice}`);
    console.log("All Pairs Created: ", await uniswapV2Factory.allPairsLength());
  });
});
