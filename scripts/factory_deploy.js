const hre = require("hardhat");

async function main() {
  // Get the contract factories
  //   const [deployer] = await hre.ethers.getSigners();
  let deployer = "0x1640fc5781B960400b9B0cAE7Cd72b21B2E246e7";
  //   const WETH = await hre.ethers.getContractFactory("MockWETH");
  const Token = await hre.ethers.getContractFactory("DancingPig");
  //   const UniswapV2Factory = await hre.ethers.getContractFactory(
  //     "UniswapV2Factory"
  //   );
  //   const UniswapV2Router02 = await hre.ethers.getContractFactory(
  //     "UniswapV2Router"
  //   );

  //   const weth = await WETH.deploy();
  const factory = await UniswapV2Factory.deploy(deployer);
  //   const router = await UniswapV2Router02.deploy(factory.target, weth.target);
  // Deploy the contracts
  //   await weth.deployed();
  //   let routerAddress = "0xE05218138c5dD932C8d80141Fe62833d9893fE33";

  //   const token = await Token.deploy(routerAddress);

  //   await token.deployed();

  await factory.deployed();

  //   await router.deployed();

  //   console.log("WETH deployed to:", weth.target);
  //   console.log("Token deployed to:", token.target);
  console.log("Factory deployed to:", factory.target);
  //   console.log("Router deployed to:", router.target);

  // Initialize the token contract with the router address
  //   await token.initialize(router.address);
  //   let thousand = "1000000000000000000000";
  //   let hundred = "100000000000000000000";

  //   // Fund the contracts
  //   await token.transfer(token.target, thousand);
  //   await weth.deposit({ value: hundred });
  //   await weth.transfer(token.target, hundred);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
