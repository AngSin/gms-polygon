import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "@nomiclabs/hardhat-etherscan";
import "@openzeppelin/hardhat-upgrades";
import * as dotenv from "dotenv";
dotenv.config();

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.17",
    settings: {
      optimizer: {
        enabled: true,
      }
    }
  },
  // networks: {
  //   hardhat: {},
  //   polygon: {
  //     chainId: 137,
  //     url: "https://polygon-rpc.com/\n",
  //     accounts: [process.env.PRIVATE_KEY!!],
  //     gasMultiplier: 5,
  //     gasPrice: 500_000_000_000,
  //     gas: 50_000_000,
  //   },
  //   polygon_mumbai: {
  //     url: "https://rpc-mumbai.maticvigil.com",
  //     accounts: [process.env.PRIVATE_KEY!!]
  //   },
  // },
  // etherscan: {
  //   apiKey: process.env.POLYGONSCAN_API_KEY
  // },
};

export default config;
