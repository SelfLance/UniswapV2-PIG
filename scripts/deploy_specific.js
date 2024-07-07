const hre = require("hardhat");

async function main() {
  // Get the contract factories
  //   const [deployer] = await hre.ethers.getSigners();
  const factory = "0xFBcb645Aac7BE88126a96c87B92A923b7f99E106";
  const weth = "0xC4d0ffCBdd13f4d9B7809471F9FC68b07340a783";

  const UniswapV2Router02 = await hre.ethers.getContractFactory(
    "UniswapV2Router02"
  );

  const router = await UniswapV2Router02.deploy(factory, weth);
  console.log("Router deployed to:", router.target);

  // Initialize the token contract with the router address
  //   await token.initialize(router.address);
  //   let thousand = "1000000000000000000000";
  //   let hundred = "100000000000000000000";

  // Fund the contracts
  //   await token.transfer(token.target, thousand);
  //   await weth.deposit({ value: hundred });
  //   await weth.transfer(token.target, hundred);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
