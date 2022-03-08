import { ethers } from "hardhat";
import { expect } from "chai";
import { advanceTimeAndBlock } from "./utilities/time";

const ether = ethers.utils.parseEther;

describe("MistBarConverter", function () {
  before(async function () {
    this.Sablier = await ethers.getContractFactory("Sablier")
    this.SafeVesting = await ethers.getContractFactory("SafeVesting")
    this.DomainToken = await ethers.getContractFactory("DomainToken")

    this.signers = await ethers.getSigners()
    this.alice = this.signers[0]
    this.bob = this.signers[1]
    this.carol = this.signers[2]
  })

  beforeEach(async function () {
    this.sablier = await this.Sablier.deploy()
    this.safeVesting = await this.SafeVesting.deploy(this.sablier.address)
    this.domain = await this.DomainToken.deploy(this.alice.address, ether(String(1e11)));
  })

  it("should create a sablier stream and withdraw from it", async function () {
    const amount = ethers.BigNumber.from("249999999999999980256000")
    await this.domain.transfer(this.safeVesting.address, amount);
    const tx = await this.safeVesting.createStream(this.bob.address, this.domain.address, amount, "31536000");
    const receipt = await tx.wait();
    const streamId = receipt.events[receipt.events.length - 1].topics[1];
    await this.safeVesting.renounceOwnership();
    await expect(this.sablier.cancelStream(streamId)).to.be.reverted;

    await advanceTimeAndBlock(30 + 31536000/2);
    await this.sablier.connect(this.bob).withdrawFromStream(streamId, amount.div(2));
    expect(await this.domain.balanceOf(this.bob.address)).to.be.equal(amount.div(2));

    await advanceTimeAndBlock(31536000/2);
    await this.sablier.connect(this.bob).withdrawFromStream(streamId, amount.div(2));
    expect(await this.domain.balanceOf(this.bob.address)).to.be.equal(amount);
  })
})
