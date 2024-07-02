const { ethers } = require("hardhat");
require("dotenv").config();
const { InfuraProvider } = require("@ethersproject/providers");

async function main() {
  const { PRIVATE_KEY, INFURA_PROJECT_ID } = process.env;
  if (!PRIVATE_KEY || !INFURA_PROJECT_ID) {
    throw new Error(
      "Please set PRIVATE_KEY and INFURA_PROJECT_ID in your .env file"
    );
  }
  console.log("Private Key: ", PRIVATE_KEY);
  console.log("Infura Project ID: ", INFURA_PROJECT_ID);

  // Provider and Wallet
  const provider = new InfuraProvider("sepolia", INFURA_PROJECT_ID);
  console.log("Provider: ", provider);
  const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
  console.log("Wallet: ", wallet);
  //   return;

  // Addresses
  const uniswapV2RouterAddress = "0xC532a74256D3Db42D0Bf7a0400fEFDbad7694008"; // Replace with actual UniswapV2Router address
  const tokenAddress = "0xB5fE533d6483c00eb45450Cf7CEd0c39D2B1590e"; // Replace with actual token address
  const wethAddress = "0x79aEf8fb59cA266F26BfA1a09b8cFDa024F1b1d2"; // WETH address on Ropsten

  // UniswapV2Router ABI
  const uniswapV2RouterABI = [
    "function swapExactTokensForETH(uint256 amountIn, uint256 amountOutMin, address[] calldata path, address to, uint256 deadline) external returns (uint256[] memory amounts)",
    "function WETH() external pure returns (address)",
    "function approve(address spender, uint256 amount) public returns (bool)",
  ];

  // Token ABI
  const tokenABI = [
    "function approve(address spender, uint256 amount) public returns (bool)",
    "function balanceOf(address account) external view returns (uint256)",
  ];

  // Create contract instances
  const uniswapV2Router = new ethers.Contract(
    uniswapV2RouterAddress,
    uniswapV2RouterABI,
    wallet
  );
  const token = new ethers.Contract(tokenAddress, tokenABI, wallet);

  // Define the path for the swap
  console.log("Token Address: ", tokenAddress, wethAddress);
  const path = [tokenAddress, wethAddress];

  // Get the balance of tokens
  const amountIn = "10000000000000000000"; // (await token.balanceOf(wallet.address)) / 100;
  console.log(`Token balance: ${amountIn} tokens`);
  //   return;

  // Approve the UniswapV2Router to spend tokens
  //   const approveTx = await token.approve(uniswapV2RouterAddress, amountIn);
  //   await approveTx.wait();
  //   console.log("Tokens approved");

  // Perform the swap
  const deadline = Math.floor(Date.now() / 1000) + 60 * 10;

  try {
    // ... (your existing gas estimation code)

    // Ensure token instance is available before calling approve
    if (token) {
      console.log("uniswapV2RouterAddress: ", uniswapV2RouterAddress);
      const approveTx = await token.approve(uniswapV2RouterAddress, "1000");
      await approveTx.wait();
      console.log("Tokens approved");
    } else {
      console.error("Token contract instance not found");
    }

    // ... (your existing code)
  } catch (e) {
    console.error("approve Esitimation Error", e);
  }

  try {
    // Estimate gas for the transaction
    // const gasEstimate = await uniswapV2Router.estimateGas.swapExactTokensForETH(
    //   amountIn,
    //   0, // Accept any amount of ETH
    //   path,
    //   wallet.address,
    //   deadline
    // );
    // console.log("Estimated Gas: ", gasEstimate.toString());
    const approveTx = await token.estimateGas.approve(
      uniswapV2RouterAddress,
      amountIn
    );
    console.log("Approve Gas: ", approveTx);

    // Populate the transaction
    const tx = await uniswapV2Router.populateTransaction.swapExactTokensForETH(
      amountIn,
      0, // Accept any amount of ETH
      path,
      wallet.address,
      deadline
    );

    // Estimate gas for the populated transaction
    const gasEstimate = await provider.estimateGas(tx);
    console.log("Estimated Gas: ", gasEstimate.toString());
  } catch (e) {
    console.log("Error is: ", e);
  }
  return;
  const swapTx = await uniswapV2Router.swapExactTokensForETH(
    amountIn,
    0, // Accept any amount of ETH
    path,
    wallet.address,
    deadline
  );
  const receipt = await swapTx.wait();
  console.log("Swap transaction hash:", receipt.transactionHash);

  // Get the ETH balance after the swap
  const ethBalance = await provider.getBalance(wallet.address);
  console.log(`ETH balance: ${ethBalance} ETH`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
