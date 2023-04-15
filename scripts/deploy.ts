import { ethers } from "hardhat";

async function main() {
  const GMsV2 = await ethers.getContractFactory("GMsV2");
  const gmsV2 = await GMsV2.deploy();

  await gmsV2.deployed();

  console.log(
    `GMsV2 deployed to ${gmsV2.address}`
  );
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
