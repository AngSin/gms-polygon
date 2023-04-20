import { ethers, upgrades } from 'hardhat';
import { deployProxy } from "./utils";
import { GMs, GMsV2 } from "../typechain-types";
import { expect } from "chai";
import {StandardMerkleTree} from "@openzeppelin/merkle-tree";

describe('claimAll', () => {
	it('only lets users claim once', async () => {
		const [owner, otherAccount] = await ethers.getSigners();
		const gmsContract = await deployProxy('GMs') as GMs;
		const GMsV3Factory = await ethers.getContractFactory("GMsV3");
		await gmsContract.startNewClaim(1, ethers.constants.HashZero, 60 * 60, false);
		await gmsContract.startNewClaim(1, ethers.constants.HashZero, 60 * 60, true);
		await gmsContract.startNewClaim(1, ethers.constants.HashZero, 60 * 60, false);
		const updatedGmsContract = await upgrades.upgradeProxy(gmsContract, GMsV3Factory, { kind: "uups" }) as GMsV2;
		await updatedGmsContract.claimAll([[], [], []]);
		expect(await updatedGmsContract.balanceOf(owner.address, 1)).to.equal(2);
		await expect(updatedGmsContract.claimAll([[], [], []]));
		expect(await updatedGmsContract.balanceOf(owner.address, 1)).to.equal(2);
	});

	it('lets users claim', async () => {
		const [owner, whitelisted, notWhitelisted0, notWhitelisted1] = await ethers.getSigners();
		const nonWhitelistedTree = StandardMerkleTree.of([[owner.address], [owner.address]], ["address"]);
		const whitelistedTree = StandardMerkleTree.of([[owner.address], [whitelisted.address]], ["address"]);
		const gmsContract = await deployProxy('GMs') as GMs;
		const GMsV3Factory = await ethers.getContractFactory("GMsV3");
		await gmsContract.startNewClaim(1, nonWhitelistedTree.root, 60 * 60, true);
		await gmsContract.startNewClaim(1, whitelistedTree.root, 60 * 60, true);
		await gmsContract.startNewClaim(1, nonWhitelistedTree.root, 60 * 60, true);
		const updatedGmsContract = await upgrades.upgradeProxy(gmsContract, GMsV3Factory, { kind: "uups" }) as GMsV2;
		await updatedGmsContract.connect(whitelisted).claimAll([
			["0xd5b5f64d66cc31c622be4bdc9e83b48fafd599c8e2dcd4402032ab1c9f89dece"],
			whitelistedTree.getProof([whitelisted.address]),
			["0xd5b5f64d66cc31c622be4bdc9e83b48fafd599c8e2dcd4402032ab1c9f89dece"],
		]);
		expect(await updatedGmsContract.balanceOf(whitelisted.address, 1)).to.equal(1);
	});
});