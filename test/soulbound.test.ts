import {ethers} from 'hardhat';
import {deployProxy} from "./utils";
import {GMs} from "../typechain-types";
import { expect } from "chai";

describe('soulbound', () => {
	it('owners and controllers can change isSoulbound', async () => {
		const [owner, otherAccount] = await ethers.getSigners()
		const gmsContract = await deployProxy('GMs') as GMs;
		expect(await gmsContract.isSoulbound()).to.equal(true);
		// owner changes isSoulbound
		await gmsContract.setIsSoulbound(false);
		expect(await gmsContract.isSoulbound()).to.equal(false);

		// controller changes isSoulbound
		await gmsContract.setControllers([otherAccount.address], true);
		await gmsContract.connect(otherAccount).setIsSoulbound(true);
		expect(await gmsContract.isSoulbound()).to.equal(true);
	});

	it('tokens can only be transferred when not soulbound', async () => {
		const [owner, otherAccount] = await ethers.getSigners()
		const gmsContract = await deployProxy('GMs') as GMs;
		expect(await gmsContract.isSoulbound()).to.equal(true);
		await gmsContract.setIsSoulbound(false);
		expect(await gmsContract.isSoulbound()).to.equal(false);
		await gmsContract.airdropGMs(1, [otherAccount.address]);
		await gmsContract.connect(otherAccount).safeTransferFrom(otherAccount.address, owner.address, 1, 1, "0x1234");
		await gmsContract.setIsSoulbound(true);
		await expect(gmsContract.safeTransferFrom(owner.address, otherAccount.address, 1, 1, "0x1234")).to.be.revertedWith("GMs cannot be transferred");
	});
});