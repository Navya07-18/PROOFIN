require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

const MONAD_TESTNET_RPC = process.env.MONAD_TESTNET_RPC || "https://testnet-rpc.monad.xyz";
const PRIVATE_KEY = process.env.PRIVATE_KEY || "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";

module.exports = {
  solidity: {
    version: "0.8.28",
    settings: {
      viaIR: true,
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    hardhat: {
      chainId: 31337,
    },
    monadTestnet: {
      url: MONAD_TESTNET_RPC,
      chainId: 10143,
      accounts: [PRIVATE_KEY],
    },
  },
  etherscan: {
    apiKey: {
      monadTestnet: "placeholder",
    },
    customChains: [
      {
        network: "monadTestnet",
        chainId: 10143,
        urls: {
          apiURL: "https://testnet.monadscan.com/api",
          browserURL: "https://testnet.monadscan.com",
        },
      },
    ],
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts",
  },
};
