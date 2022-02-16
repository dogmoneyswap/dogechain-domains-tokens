import { ethers } from "hardhat";
import { expect } from "chai";

describe("DomainToken", function () {
  before(async function () {
    this.DomainToken = await ethers.getContractFactory("DomainToken")
    this.signers = await ethers.getSigners()
    this.alice = this.signers[0]
    this.bob = this.signers[1]
    this.carol = this.signers[2]
  })

  beforeEach(async function () {
    this.domain = await this.DomainToken.deploy(this.alice.address, "100")
    await this.domain.deployed()
  })

  it("should have correct name and symbol and decimal", async function () {
    const name = await this.domain.name()
    const symbol = await this.domain.symbol()
    const decimals = await this.domain.decimals()
    expect(name, "DomainToken")
    expect(symbol, "DOMAIN")
    expect(decimals, "18")
  })

  it("should supply token transfers properly", async function () {
    await this.domain.connect(this.alice).transfer(this.bob.address, "25", {
      from: this.alice.address,
    })
    const totalSupply = await this.domain.totalSupply()
    const aliceBal = await this.domain.balanceOf(this.alice.address)
    const bobBal = await this.domain.balanceOf(this.bob.address)
    expect(totalSupply, "100")
    expect(aliceBal, "75")
    expect(bobBal, "25")
  })

  it("should fail if you try to do bad transfers", async function () {
    await expect(this.domain.connect(this.alice).transfer(this.bob.address, "110")).to.be.revertedWith("ERC20: transfer amount exceeds balance")
    await expect(this.domain.connect(this.bob).transfer(this.carol.address, "1", { from: this.bob.address })).to.be.revertedWith(
      "ERC20: transfer amount exceeds balance"
    )
  })
})
