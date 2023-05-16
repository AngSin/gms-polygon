import { ethers, upgrades } from 'hardhat';
import {deployContract, deployProxy} from "./utils";
import {Bananas, GMs, GMsV4} from "../typechain-types";
import { expect } from "chai";
import {StandardMerkleTree} from "@openzeppelin/merkle-tree";

describe('burning bananas', () => {
	it('mints the correct amount of 20 point GMs and 5 point GMs', async () => {
		const [owner, otherAccount] = await ethers.getSigners();
		const gmsContract = await deployProxy('GMs') as GMs;
		const GMsV4Factory = await ethers.getContractFactory("GMsV4");
		const bananaContract = await deployContract("Bananas") as Bananas;
		const updatedGmsContract = await upgrades.upgradeProxy(gmsContract, GMsV4Factory, { kind: "uups" }) as GMsV4;
		await updatedGmsContract.setBananaContract(bananaContract.address);
		await bananaContract.mint(ethers.utils.parseEther("500"));
		expect(await bananaContract.balanceOf(owner.address)).to.equal(ethers.utils.parseEther("500"));
		await expect(updatedGmsContract.burnBananasForGMs(ethers.utils.parseEther("49")))
			.to.be.revertedWith("Incorrect amount of bananas!");
		await expect(updatedGmsContract.burnBananasForGMs(ethers.utils.parseEther("50")))
			.to.be.revertedWith("ERC20: insufficient allowance");
		await bananaContract.approve(updatedGmsContract.address, ethers.utils.parseEther("500"));
		await updatedGmsContract.burnBananasForGMs(ethers.utils.parseEther("50"));
		expect(await updatedGmsContract.balanceOf(owner.address, 7)).to.equal(1);
		await updatedGmsContract.burnBananasForGMs(ethers.utils.parseEther("250"));
		expect(await updatedGmsContract.balanceOf(owner.address, 8)).to.equal(2);
		expect(await updatedGmsContract.balanceOf(owner.address, 7)).to.equal(2);
		expect(await bananaContract.balanceOf(owner.address)).to.equal(ethers.utils.parseEther("200"));
		await expect(updatedGmsContract.burnBananasForGMs(ethers.utils.parseEther("101")))
			.to.be.revertedWith("Incorrect amount of bananas!");
	});
});