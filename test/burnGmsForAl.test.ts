import { ethers } from "hardhat";
import { deployProxy } from "./utils";
import { GMsV5 } from "../typechain-types";
import { expect } from "chai";

describe("burnTokens", () => {
  it("User burns for one AL", async () => {
    const [owner, otherAccount] = await ethers.getSigners();
    const gmsContract = (await deployProxy("GMsV5")) as GMsV5;

    // Airdrop 10 tokens of tokenId 3
    let addresses3 = new Array(10).fill(otherAccount.address);
    await gmsContract.airdropGMs(3, addresses3);

    // Airdrop 5 tokens of tokenId 2
    let addresses2 = new Array(5).fill(otherAccount.address);
    await gmsContract.airdropGMs(2, addresses2);

    // setup
    await gmsContract.setTokenPoints(3, 1);
    await gmsContract.setTokenPoints(2, 2);
    await gmsContract.setLastTokenId(6);

    // Check that the airdrop was successful for tokenId 3
    let balance3 = await gmsContract.balanceOf(otherAccount.address, 3);
    expect(balance3.toNumber()).to.equal(10);

    // Check that the airdrop was successful for tokenId 2
    let balance2 = await gmsContract.balanceOf(otherAccount.address, 2);
    expect(balance2.toNumber()).to.equal(5);

    // Check that the total points is 10 + 5(2) = 20
    const initialPoints = await gmsContract.getUserPoints(otherAccount.address);
    expect(initialPoints.toNumber()).to.equal(20);

    await gmsContract
      .connect(otherAccount)
      .burnTokens([3, 2], [balance3, balance2]);

    const filter = gmsContract.filters.RedeemFreeMint();
    const events = await gmsContract.queryFilter(filter);

    expect(events).to.not.be.empty;
    const event = events[0];

    expect(event.args.quantity).to.equal(1);
  });

  it("User tries to burn less than 20 points", async () => {
    const [owner, otherAccount] = await ethers.getSigners();
    const gmsContract = (await deployProxy("GMsV5")) as GMsV5;

    // Airdrop 10 tokens of tokenId 3
    let addresses3 = new Array(9).fill(otherAccount.address);
    await gmsContract.airdropGMs(3, addresses3);

    // Airdrop 5 tokens of tokenId 2
    let addresses2 = new Array(5).fill(otherAccount.address);
    await gmsContract.airdropGMs(2, addresses2);

    // setup
    await gmsContract.setTokenPoints(3, 1);
    await gmsContract.setTokenPoints(2, 2);
    await gmsContract.setLastTokenId(6);

    // Check that the airdrop was successful for tokenId 3
    let balance3 = await gmsContract.balanceOf(otherAccount.address, 3);
    expect(balance3.toNumber()).to.equal(9);

    // Check that the airdrop was successful for tokenId 2
    let balance2 = await gmsContract.balanceOf(otherAccount.address, 2);
    expect(balance2.toNumber()).to.equal(5);

    // Check that the total points is 10 + 5(2) = 20
    const initialPoints = await gmsContract.getUserPoints(otherAccount.address);
    expect(initialPoints.toNumber()).to.equal(19);

    try {
      await gmsContract
        .connect(otherAccount)
        .burnTokens([3, 2], [balance3, balance2]);
    } catch (err) {
      if (err instanceof Error) {
        expect(
          err.message.includes(
            "Cannot redeem AL without burning at least 20 points"
          ),
          `Unexpected error message: ${err.message}`
        );
      } else {
        expect(
          false,
          `An unexpected error was thrown that's not an instance of Error: ${err}`
        );
      }
    }
  });
  it("User burns for 5 AL", async () => {
    const [owner, otherAccount] = await ethers.getSigners();
    const gmsContract = (await deployProxy("GMsV5")) as GMsV5;

    // Airdrop 19 tokens of tokenId 1
    let addresses3 = new Array(16).fill(otherAccount.address);
    await gmsContract.airdropGMs(1, addresses3);

    // Airdrop 10 tokens of tokenId 2
    let addresses2 = new Array(10).fill(otherAccount.address);
    await gmsContract.airdropGMs(2, addresses2);

    // setup
    await gmsContract.setTokenPoints(1, 5);
    await gmsContract.setTokenPoints(2, 2);
    await gmsContract.setLastTokenId(6);

    // Check that the airdrop was successful for tokenId 1
    let balance1 = await gmsContract.balanceOf(otherAccount.address, 1);
    expect(balance1.toNumber()).to.equal(16);

    // Check that the airdrop was successful for tokenId 2
    let balance2 = await gmsContract.balanceOf(otherAccount.address, 2);
    expect(balance2.toNumber()).to.equal(10);

    // Check that the total points is 100
    const initialPoints = await gmsContract.getUserPoints(otherAccount.address);
    expect(initialPoints.toNumber()).to.equal(100);

    await gmsContract
      .connect(otherAccount)
      .burnTokens([1, 2], [balance1, balance2]);

    const filter = gmsContract.filters.RedeemFreeMint();
    const events = await gmsContract.queryFilter(filter);

    expect(events).to.not.be.empty;
    const event = events[0];

    expect(event.args.quantity).to.equal(5);
  });
});
