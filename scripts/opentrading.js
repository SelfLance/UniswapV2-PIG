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
  //   const provider = new InfuraProvider("fuji", INFURA_PROJECT_ID);
  const fujiProvider = new ethers.providers.JsonRpcProvider(
    "https://api.avax-test.network/ext/bc/C/rpc"
  );
  console.log("Provider: ", fujiProvider);

  //   console.log("Provider: ", fujiProvider);
  const wallet = new ethers.Wallet(PRIVATE_KEY, fujiProvider);
  console.log("Wallet: ", wallet);
  tokenABI = [
    {
      inputs: [
        {
          internalType: "address",
          name: "_uniswapV2RouterAddress",
          type: "address",
        },
      ],
      stateMutability: "nonpayable",
      type: "constructor",
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "address",
          name: "owner",
          type: "address",
        },
        {
          indexed: true,
          internalType: "address",
          name: "spender",
          type: "address",
        },
        {
          indexed: false,
          internalType: "uint256",
          name: "value",
          type: "uint256",
        },
      ],
      name: "Approval",
      type: "event",
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "address",
          name: "previousOwner",
          type: "address",
        },
        {
          indexed: true,
          internalType: "address",
          name: "newOwner",
          type: "address",
        },
      ],
      name: "OwnershipTransferred",
      type: "event",
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: false,
          internalType: "uint256",
          name: "tokenAmount",
          type: "uint256",
        },
      ],
      name: "SwapFailed",
      type: "event",
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: false,
          internalType: "uint256",
          name: "tokenAmount",
          type: "uint256",
        },
      ],
      name: "SwapSuccess",
      type: "event",
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "address",
          name: "from",
          type: "address",
        },
        {
          indexed: true,
          internalType: "address",
          name: "to",
          type: "address",
        },
        {
          indexed: false,
          internalType: "uint256",
          name: "value",
          type: "uint256",
        },
      ],
      name: "Transfer",
      type: "event",
    },
    {
      inputs: [],
      name: "_maxTxAmount",
      outputs: [
        {
          internalType: "uint256",
          name: "",
          type: "uint256",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [],
      name: "_maxWalletSize",
      outputs: [
        {
          internalType: "uint256",
          name: "",
          type: "uint256",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "owner",
          type: "address",
        },
        {
          internalType: "address",
          name: "spender",
          type: "address",
        },
      ],
      name: "allowance",
      outputs: [
        {
          internalType: "uint256",
          name: "",
          type: "uint256",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "spender",
          type: "address",
        },
        {
          internalType: "uint256",
          name: "amount",
          type: "uint256",
        },
      ],
      name: "approve",
      outputs: [
        {
          internalType: "bool",
          name: "",
          type: "bool",
        },
      ],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "account",
          type: "address",
        },
      ],
      name: "balanceOf",
      outputs: [
        {
          internalType: "uint256",
          name: "",
          type: "uint256",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [],
      name: "decimals",
      outputs: [
        {
          internalType: "uint8",
          name: "",
          type: "uint8",
        },
      ],
      stateMutability: "pure",
      type: "function",
    },
    {
      inputs: [],
      name: "deposit",
      outputs: [],
      stateMutability: "payable",
      type: "function",
    },
    {
      inputs: [],
      name: "name",
      outputs: [
        {
          internalType: "string",
          name: "",
          type: "string",
        },
      ],
      stateMutability: "pure",
      type: "function",
    },
    {
      inputs: [],
      name: "openTrading",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [],
      name: "owner",
      outputs: [
        {
          internalType: "address",
          name: "",
          type: "address",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [],
      name: "renounceOwnership",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [],
      name: "symbol",
      outputs: [
        {
          internalType: "string",
          name: "",
          type: "string",
        },
      ],
      stateMutability: "pure",
      type: "function",
    },
    {
      inputs: [],
      name: "totalSupply",
      outputs: [
        {
          internalType: "uint256",
          name: "",
          type: "uint256",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "recipient",
          type: "address",
        },
        {
          internalType: "uint256",
          name: "amount",
          type: "uint256",
        },
      ],
      name: "transfer",
      outputs: [
        {
          internalType: "bool",
          name: "",
          type: "bool",
        },
      ],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "sender",
          type: "address",
        },
        {
          internalType: "address",
          name: "recipient",
          type: "address",
        },
        {
          internalType: "uint256",
          name: "amount",
          type: "uint256",
        },
      ],
      name: "transferFrom",
      outputs: [
        {
          internalType: "bool",
          name: "",
          type: "bool",
        },
      ],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "newOwner",
          type: "address",
        },
      ],
      name: "transferOwnership",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [],
      name: "uniswapV2Pair",
      outputs: [
        {
          internalType: "address",
          name: "",
          type: "address",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [],
      name: "uniswapV2Router",
      outputs: [
        {
          internalType: "contract IUniswapV2Router02",
          name: "",
          type: "address",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [],
      name: "withdrawETH",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [],
      name: "withdrawTokens",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      stateMutability: "payable",
      type: "receive",
    },
  ];
  //   return;
  let tokenAddress = "0x029318aF4F1f52b85c4e95230fcbAFa757dd019b";
  wethAddress = "0x7b79995e5f793A07Bc00c21412e50Ecae098E7f9";
  const token = new ethers.Contract(tokenAddress, tokenABI, wallet);

  // Define the path for the swaphttps://testnet.snowtrace.io/token/0xAA92Cde478Cf0B6f70001E31fdcedbE251f19936/contract/writeContract?chainid=null#F2
  console.log("Token Address: ", tokenAddress, wethAddress);
  const gasEstimate = await token.estimateGas.openTrading();
  console.log("Estimated Gas: ", gasEstimate.toString());
  return;

  // Estimate gas for the populated transaction
  //   const gasEstimate = await provider.estimateGas(tx);
  //   const path = [tokenAddress, wethAddress];

  // Get the balance of tokens
  //   const amountIn = "10000000000000000000"; // (await token.balanceOf(wallet.address)) / 100;
  //   console.log(`Token balance: ${amountIn} tokens`);
  //   return;

  // Approve the UniswapV2Router to spend tokens
  //   const approveTx = await token.approve(uniswapV2RouterAddress, amountIn);
  //   await approveTx.wait();
  //   console.log("Tokens approved");

  // Perform the swap
  //   const deadline = Math.floor(Date.now() / 1000) + 60 * 10;

  try {
    // ... (your existing gas estimation code)

    // Ensure token instance is available before calling approve
    if (token) {
      //   console.log("uniswapV2RouterAddress: ", uniswapV2RouterAddress);
      //   const approveTx = await token.approve(uniswapV2RouterAddress, "1000");
      //   await approveTx.wait();
      //   console.log("Tokens approved");
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
    const deadline = Math.floor(Date.now() / 1000) + 60 * 10;
    const path = [tokenAddress, wethAddress];

    // Get the balance of tokens
    const amountIn = "10000000000000000000";
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
