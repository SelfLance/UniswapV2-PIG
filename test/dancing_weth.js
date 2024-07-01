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
  let pairContract;

  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();

    WETH = await ethers.getContractFactory("MockWETH");
    weth = await WETH.deploy();
    // await weth.deployed();

    UniswapV2Factory = await ethers.getContractFactory("UniswapV2Factory");
    uniswapV2Factory = await UniswapV2Factory.deploy(owner.address);
    // await uniswapV2Factory.deployed();

    UniswapV2Router02 = await ethers.getContractFactory("UniswapV2Router");
    uniswapV2Router = await UniswapV2Router02.deploy(
      uniswapV2Factory.target,
      weth.target
    );
    // await uniswapV2Router.deployed();

    Token = await ethers.getContractFactory("DancingPig");
    token = await Token.deploy(uniswapV2Router.target);
    await token.transfer(token.target, "1000000000000000000000000000");

    // await weth.deposit({ value: "100000000000000000000" });
    await weth.transfer(token.target, "10000000000000000000000");

    await token.openTrading();
    let pairAddress = await uniswapV2Factory.getPair(token.target, weth.target);
    console.log("My pair Address is: ", pairAddress);
    await token.transfer(pairAddress, "1000000000000000000000000000");
    await weth.transfer(pairAddress, "10000000000000000000000");
    //   et pairAddress = await uniswapV2Factory.getPair(token.target, weth.target);
    // expect(pairAddress).to.not.equal(ethers.constants.AddressZero);

    const pairABI = [
      "function getReserves() external view returns (uint112 reserve0, uint112 reserve1, uint32 blockTimestampLast)",
      "function token0() external view returns (address)",
      "function token1() external view returns (address)",
      "function balanceOf(address owner) external view returns (uint256)",
    ];
    pairContract = new ethers.Contract(pairAddress, pairABI, ethers.provider);
    // await token.deployed();
  });

  it("Should open trading and create a pair", async function () {
    let [reserve0, reserve1] = await pairContract.getReserves();
    let token0 = await pairContract.token0();
    let token1 = await pairContract.token1();

    let token0IsWETH = token0.toLowerCase() === weth.target.toLowerCase();

    let tokenPrice = token0IsWETH
      ? Number(reserve0) / Number(reserve1)
      : Number(reserve1) / Number(reserve0);

    console.log(`Token price in WETH: ${tokenPrice}`);
  });

  it("Should buy DancingPig tokens with ETH", async function () {
    const path = [weth.target, token.target];
    const amountIn = "100000000";

    await uniswapV2Router
      .connect(addr1)
      .swapExactETHForTokens(
        0,
        path,
        addr1.address,
        Math.floor(Date.now() / 1000) + 60 * 10,
        { value: amountIn }
      );

    let [reserve0, reserve1] = await pairContract.getReserves();
    let token0 = await pairContract.token0();
    let token1 = await pairContract.token1();

    let token0IsWETH = token0.toLowerCase() === weth.target.toLowerCase();

    let tokenPrice = token0IsWETH
      ? Number(reserve0) / Number(reserve1)
      : Number(reserve1) / Number(reserve0);

    console.log(`Token price in WETH After Bought: ${tokenPrice}`);
    // const tokenBalance = await token.balanceOf(addr1.address);
    // expect(tokenBalance).to.be.gt(0);
  });

  it("Should sell DancingPig tokens for ETH", async function () {
    const path = [token.target, weth.target];
    console.log("From **********: ", addr1.address);
    await token.transfer(addr1.address, "1000000000000000000000000000");
    await weth.transfer(addr1.address, "10000000000000000000000");
    const amountIn = "1000000000000000";
    await weth.deposit({ value: "100000000000000000000" });

    await token.connect(addr1).approve(uniswapV2Router.target, amountIn);

    await uniswapV2Router
      .connect(addr1)
      .swapExactTokensForETH(
        amountIn,
        0,
        path,
        addr1.address,
        Math.floor(Date.now() / 1000) + 60 * 10
      );

    const ethBalance = await ethers.provider.getBalance(addr1.address);
    expect(ethBalance).to.be.gt(0);
  });
});
