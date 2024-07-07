const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("DancingPig with UniswapV3", function () {
  let Token;
  let token;
  let WETH;
  let weth;
  let UniswapV3Factory;
  let uniswapV3Factory;
  let SwapRouter;
  let swapRouter;
  let NonfungiblePositionManager;
  let positionManager;
  let owner, addr1, addr2;
  let poolAddress;

  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();

    WETH = await ethers.getContractFactory("MockWETH");
    weth = await WETH.deploy();

    UniswapV3Factory = await ethers.getContractFactory("UniswapV3Factory");
    uniswapV3Factory = await UniswapV3Factory.deploy();

    SwapRouter = await ethers.getContractFactory("SwapRouter");
    swapRouter = await SwapRouter.deploy(
      uniswapV3Factory.address,
      weth.address
    );

    NonfungiblePositionManager = await ethers.getContractFactory(
      "NonfungiblePositionManager"
    );
    positionManager = await NonfungiblePositionManager.deploy(
      uniswapV3Factory.address,
      weth.address,
      swapRouter.address
    );

    Token = await ethers.getContractFactory("DancingPig");
    token = await Token.deploy(swapRouter.address, positionManager.address);

    await token.transfer(token.address, "1000000000000000000000");
    await token.deposit({ value: "1000000000000000000000" });

    try {
      await token.openTrading();
    } catch (error) {
      console.error("openTrading error:", error);
      throw error;
    }
    poolAddress = await uniswapV3Factory.getPool(
      weth.address,
      token.address,
      3000
    );
    console.log(
      "WETH Address: ",
      weth.address,
      "   Router Address: ",
      swapRouter.address,
      " Factory: ",
      uniswapV3Factory.address,
      " Dancing Token: ",
      token.address,
      " Pool Address: ",
      poolAddress
    );
  });

  it("Should Transfer Eth to Swap with Token", async function () {
    const path = [weth.address, token.address];
    const amountIn = ethers.utils.parseEther("0.1");

    await weth.transfer(poolAddress, ethers.utils.parseEther("0.01"));

    console.log(
      "Pool Contract Address Balance ",
      await weth.balanceOf(poolAddress)
    );
    await swapRouter.connect(addr1).exactInputSingle({
      tokenIn: weth.address,
      tokenOut: token.address,
      fee: 3000,
      recipient: addr1.address,
      deadline: Math.floor(Date.now() / 1000) + 60 * 10,
      amountIn: amountIn,
      amountOutMinimum: 0,
      sqrtPriceLimitX96: 0,
    });
  });

  it("Should Transfer Token to Swap with Eth", async function () {
    const path = [token.address, weth.address];
    const amountIn = ethers.utils.parseEther("0.5");

    await token.transfer(addr1.address, ethers.utils.parseEther("1"));
    console.log(
      "Balance of Token on Addr1: ",
      await token.balanceOf(addr1.address)
    );

    await token.connect(addr1).approve(swapRouter.address, amountIn);
    console.log(
      "Pool Contract Address Balance ",
      await token.balanceOf(poolAddress)
    );
    await swapRouter.connect(addr1).exactInputSingle({
      tokenIn: token.address,
      tokenOut: weth.address,
      fee: 3000,
      recipient: addr1.address,
      deadline: Math.floor(Date.now() / 1000) + 60 * 10,
      amountIn: amountIn,
      amountOutMinimum: 0,
      sqrtPriceLimitX96: 0,
    });
  });

  it("Should Swap Eth for Token", async function () {
    const path = [weth.address, token.address];
    const amountIn = ethers.utils.parseEther("0.1");

    await token.transfer(token.address, ethers.utils.parseEther("1000"));
    await weth.transfer(token.address, ethers.utils.parseEther("1000"));

    await swapRouter.connect(addr1).exactInputSingle({
      tokenIn: weth.address,
      tokenOut: token.address,
      fee: 3000,
      recipient: addr1.address,
      deadline: Math.floor(Date.now() / 1000) + 60 * 10,
      amountIn: amountIn,
      amountOutMinimum: 0,
      sqrtPriceLimitX96: 0,
    });

    const tokenBalance = await token.balanceOf(addr1.address);
    console.log("Token Balance is: ", tokenBalance);
  });

  it("Should update openTrade and Create Pair", async function () {
    const path = [weth.address, token.address];
    const amountIn = ethers.utils.parseEther("1");

    await swapRouter.connect(addr1).exactInputSingle({
      tokenIn: weth.address,
      tokenOut: token.address,
      fee: 3000,
      recipient: addr1.address,
      deadline: Math.floor(Date.now() / 1000) + 60 * 10,
      amountIn: amountIn,
      amountOutMinimum: 0,
      sqrtPriceLimitX96: 0,
    });

    const tokenBalance = await token.balanceOf(addr1.address);
    console.log("Token Balance is: ", tokenBalance);

    await token.transfer(addr2.address, ethers.utils.parseEther("10000"));
    await token
      .connect(addr2)
      .transfer(poolAddress, ethers.utils.parseEther("10000"));

    const poolContract = await ethers.getContractAt(
      "IUniswapV3Pool",
      poolAddress
    );
    const [tick, liquidity] = await poolContract.slot0();

    console.log("Pool Tick: ", tick, " Pool Liquidity: ", liquidity);

    console.log("Token Balance in Pool: ", await token.balanceOf(poolAddress));
    console.log("ETH Balance in Pool: ", await weth.balanceOf(poolAddress));
    console.log("All Pools Created: ", await uniswapV3Factory.allPoolsLength());
  });
});
