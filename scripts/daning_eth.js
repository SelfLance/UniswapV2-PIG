const hre = require("hardhat");

async function main() {
  let deployer = "0x270D251FAD622758e82147C7a103168c869d7996";
  const WETH = await hre.ethers.getContractFactory("MockWETH");
  const Token = await hre.ethers.getContractFactory("DancingPig");
  const UniswapV2Factory = await hre.ethers.getContractFactory(
    "UniswapV2Factory"
  );
  const UniswapV2Router02 = await hre.ethers.getContractFactory(
    "UniswapV2Router"
  );

  const weth = await WETH.deploy();
  const factory = await UniswapV2Factory.deploy(deployer);
  const router = await UniswapV2Router02.deploy(factory.target, weth.target);
  // Deploy the contracts
  //   await weth.deployed();

  const token = await Token.deploy(router.target);

  //   await token.deployed();

  //   await factory.deployed();

  //   await router.deployed();

  console.log("WETH deployed to:", weth.target);
  console.log("Token deployed to:", token.target);
  console.log("Factory deployed to:", factory.target);
  console.log("Router deployed to:", router.target);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
