import { ethers } from "hardhat";
import { expect } from "chai";

describe("ENSBCHReceiver", function () {
  before(async function () {
    this.DomainToken = await ethers.getContractFactory("DomainToken")
    this.DomainBar = await ethers.getContractFactory("DomainBar")
    this.ENSBCHReceiver = await ethers.getContractFactory("ENSBCHReceiver");

    this.signers = await ethers.getSigners()
    this.alice = this.signers[0]
    this.bob = this.signers[1]
    this.carol = this.signers[2]
  })

  beforeEach(async function () {
    this.domain = await this.DomainToken.deploy(this.alice.address, "100")
    this.bar = await this.DomainBar.deploy(this.domain.address)
    this.ensBchReceiver = await this.ENSBCHReceiver.deploy(
      this.domain.address,
      this.bar.address,
      this.router.address,
    );
    this.domain.mint(this.alice.address, "100")
    this.domain.mint(this.bob.address, "100")
    this.domain.mint(this.carol.address, "100")
  })

  it("should not allow enter if not enough approve", async function () {
    await expect(this.bar.enter("100")).to.be.revertedWith("ERC20: transfer amount exceeds allowance")
    await this.domain.approve(this.bar.address, "50")
    await expect(this.bar.enter("100")).to.be.revertedWith("ERC20: transfer amount exceeds allowance")
    await this.domain.approve(this.bar.address, "100")
    await this.bar.enter("100")
    expect(await this.bar.balanceOf(this.alice.address)).to.equal("100")
  })

  it("should not allow withraw more than what you have", async function () {
    await this.domain.approve(this.bar.address, "100")
    await this.bar.enter("100")
    await expect(this.bar.leave("200")).to.be.revertedWith("ERC20: burn amount exceeds balance")
  })

  it("should work with more than one participant", async function () {
    await this.domain.approve(this.bar.address, "100")
    await this.domain.connect(this.bob).approve(this.bar.address, "100", { from: this.bob.address })
    // Alice enters and gets 20 shares. Bob enters and gets 10 shares.
    await this.bar.enter("20")
    await this.bar.connect(this.bob).enter("10", { from: this.bob.address })
    expect(await this.bar.balanceOf(this.alice.address)).to.equal("20")
    expect(await this.bar.balanceOf(this.bob.address)).to.equal("10")
    expect(await this.domain.balanceOf(this.bar.address)).to.equal("30")
    // DomainBar get 20 more SUSHIs from an external source.
    await this.domain.connect(this.carol).transfer(this.bar.address, "20", { from: this.carol.address })
    // Alice deposits 10 more SUSHIs. She should receive 10*30/50 = 6 shares.
    await this.bar.enter("10")
    expect(await this.bar.balanceOf(this.alice.address)).to.equal("26")
    expect(await this.bar.balanceOf(this.bob.address)).to.equal("10")
    // Bob withdraws 5 shares. He should receive 5*60/36 = 8 shares
    await this.bar.connect(this.bob).leave("5", { from: this.bob.address })
    expect(await this.bar.balanceOf(this.alice.address)).to.equal("26")
    expect(await this.bar.balanceOf(this.bob.address)).to.equal("5")
    expect(await this.domain.balanceOf(this.bar.address)).to.equal("52")
    expect(await this.domain.balanceOf(this.alice.address)).to.equal("70")
    expect(await this.domain.balanceOf(this.bob.address)).to.equal("98")
  })
})
