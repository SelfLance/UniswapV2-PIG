const hre = require("hardhat");

async function main() {
  //   let deployer = "0x1640fc5781B960400b9B0cAE7Cd72b21B2E246e7";
  //   const WETH = await hre.ethers.getContractFactory("MockWETH");
  const Token = await hre.ethers.getContractFactory("DancingPig");
  //   const UniswapV2Factory = await hre.ethers.getContractFactory(
  //     "UniswapV2Factory"
  //   );
  //   const UniswapV2Router02 = await hre.ethers.getContractFactory(
  //     "UniswapV2Router"
  //   );

  //   const weth = await WETH.deploy();
  //   const factory = await UniswapV2Factory.deploy(deployer);
  //   const router = await UniswapV2Router02.deploy(factory.target, weth.target);
  // Deploy the contracts
  //   await weth.deployed();
  const routerAddress = "0xE649933D24b9174595eAfA038F711a7D1c1b066b";

  const token = await Token.deploy(routerAddress);

  //   await token.deployed();

  //   await factory.deployed();

  //   await router.deployed();

  //   console.log("WETH deployed to:", weth.target);
  console.log("Token deployed to:", token.target);
  //   console.log("Factory deployed to:", factory.target);
  //   console.log("Router deployed to:", router.target);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
