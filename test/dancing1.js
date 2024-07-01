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
    await weth.deposit({ value: "100000000000000000000" });

    await token.connect(addr2).deposit({ value: "10000000000000000000" });
    // await weth.transfer(token.target, "1000000000000000000");
    // await weth.approve(uniswapV2Router.target, "10000000000000000000");

    // Open trading
    try {
      await token.openTrading();
    } catch (error) {
      console.error("openTrading error:", error);
      throw error;
    }
    let pairAddress = await uniswapV2Factory.getPair(token.target, weth.target);
    console.log("Pair Address is", pairAddress);

    // Create an instance of the UniswapV2Pair contract
    const pairABI = [
      "function getReserves() external view returns (uint112 reserve0, uint112 reserve1, uint32 blockTimestampLast)",
      "function token0() external view returns (address)",
      "function token1() external view returns (address)",
      "function balanceOf(address owner) external view returns (uint256)",
      // Add other function signatures you need
    ];
    const pairContract = new ethers.Contract(
      pairAddress,
      pairABI,
      ethers.provider
    );

    // Get reserves
    let [reserve0, reserve1] = await pairContract.getReserves();

    // Get token0 and token1 addresses
    let token0 = await pairContract.token0();
    let token1 = await pairContract.token1();

    // Determine which reserve corresponds to which token
    let token0IsWETH;
    if (token0.toLowerCase() === weth.target.toLowerCase()) {
      token0IsWETH = true;
    } else if (token1.toLowerCase() === weth.target.toLowerCase()) {
      token0IsWETH = false;
    } else {
      throw new Error("Neither token0 nor token1 is WETH");
    }
    console.log("REserves: ", reserve0, reserve1);

    // Compute token price
    let tokenPrice;
    console.log("Both Token Reserves: ", reserve0, reserve1);
    if (token0IsWETH) {
      // Price of token1 in terms of WETH
      tokenPrice = Number(reserve0) / Number(reserve1);
      console.log("Token Price in ", tokenPrice);
    } else {
      // Price of token0 in terms of WETH
      tokenPrice = Number(reserve1) / Number(reserve0);
    }

    console.log(`Token price in WETH: ${tokenPrice}`);
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
    //   1000000000000000000000n 1000000000000000000000n

    // Get token0 and token1 addresses
    token0 = await pairContract.token0();
    token1 = await pairContract.token1();

    // Determine which reserve corresponds to which token
    // let token0IsWETH;
    if (token0.toLowerCase() === weth.target.toLowerCase()) {
      token0IsWETH = true;
    } else if (token1.toLowerCase() === weth.target.toLowerCase()) {
      token0IsWETH = false;
    } else {
      throw new Error("Neither token0 nor token1 is WETH");
    }

    // Compute token price
    // let tokenPrice;
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

  // it.only("Should buy MyToken with ETH", async function () {
  //   const path = [weth.target, token.target];
  //   const amountIn = "1000000000000000000";

  //   await uniswapV2Router
  //     .connect(addr1)
  //     .swapExactETHForTokens(
  //       0,
  //       path,
  //       addr1.address,
  //       Math.floor(Date.now() / 1000) + 60 * 10,
  //       { value: amountIn }
  //     );

  //   const tokenBalance = await token.balanceOf(addr1.address);
  //   console.log("Token Balance is: ", tokenBalance);
  //   // expect(tokenBalance).to.be.gt(0);
  // });

  // it("Should sell MyToken for ETH", async function () {
  //   const path = [token.target, weth.target];
  //   const amountIn = await token.balanceOf(addr1.address);

  //   await token.connect(addr1).approve(uniswapV2Router.target, amountIn);

  //   await uniswapV2Router
  //     .connect(addr1)
  //     .swapExactTokensForETH(
  //       amountIn,
  //       0,
  //       path,
  //       addr1.address,
  //       Math.floor(Date.now() / 1000) + 60 * 10
  //     );

  //   // const ethBalance = await ethers.provider.getBalance(addr1.address);
  //   // expect(ethBalance).to.be.gt(0);
  // });
});
