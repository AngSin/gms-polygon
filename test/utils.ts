import { ethers, upgrades } from "hardhat";
import { StandardMerkleTree } from "@openzeppelin/merkle-tree";

const addresses: string[] = require("./wlAddresses.json");

export const deployContract = async (name: string) => {
  const contractFactory = await ethers.getContractFactory(name);
  return await contractFactory.deploy();
};

export const deployProxy = async (name: string) => {
  const contractFactory = await ethers.getContractFactory(name);
  return await upgrades.deployProxy(contractFactory, { kind: "uups" });
};

export const createNewTree = (newAddresses: string[]) => {
  const leaves = [...addresses, ...newAddresses].map((address) => [address]);
  return StandardMerkleTree.of(leaves, ["address"]);
};
