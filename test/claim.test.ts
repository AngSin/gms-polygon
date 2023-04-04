import {ethers} from 'hardhat';
import {deployProxy} from "./utils";
import {GMs} from "../typechain-types";
import { expect } from "chai";
import {Bytes} from "@ethersproject/bytes/src.ts";

describe('claim', () => {
	it('only lets users claim once', async () => {
		const [owner, otherAccount] = await ethers.getSigners();
		const gmsContract = await deployProxy('GMs') as GMs;
		await gmsContract.startNewClaim(1, ethers.constants.HashZero, 60 * 60, false);
		await gmsContract.connect(otherAccount).claim([], 0);
		expect(await gmsContract.balanceOf(otherAccount.address, 1)).eq(1);
		await expect(gmsContract.connect(otherAccount).claim([], 0)).to.be.revertedWith(
			'You already have this gm!'
		);
		expect(await gmsContract.balanceOf(otherAccount.address, 1)).eq(1);
	});
});