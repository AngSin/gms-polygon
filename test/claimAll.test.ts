import { ethers, upgrades } from 'hardhat';
import { deployProxy } from "./utils";
import { GMs, GMsV2 } from "../typechain-types";
import { expect } from "chai";

describe('claimAll', () => {
	it('only lets users claim once', async () => {
		const [owner, otherAccount] = await ethers.getSigners();
		const gmsContract = await deployProxy('GMs') as GMs;
		const GMsV2Factory = await ethers.getContractFactory("GMsV2");
		await gmsContract.startNewClaim(1, ethers.constants.HashZero, 60 * 60, false);
		await gmsContract.startNewClaim(1, ethers.constants.HashZero, 60 * 60, true);
		await gmsContract.startNewClaim(1, ethers.constants.HashZero, 60 * 60, false);
		const updatedGmsContract = await upgrades.upgradeProxy(gmsContract, GMsV2Factory, { kind: "uups" }) as GMsV2;
		await updatedGmsContract.claimAll([[], [], []]);
		expect(await updatedGmsContract.balanceOf(owner.address, 1)).to.equal(2);
		await expect(updatedGmsContract.claimAll([[], [], []]));
		expect(await updatedGmsContract.balanceOf(owner.address, 1)).to.equal(2);
	});
});