import { ethers } from "hardhat";
import { expect } from "chai";

const ether = ethers.utils.parseEther;
const uintmax = ethers.constants.MaxUint256;

describe("ENSBCHReceiver", function () {
  before(async function () {
    this.DomainToken = await ethers.getContractFactory("DomainToken")
    this.DomainBar = await ethers.getContractFactory("DomainBar")
    this.Router = await ethers.getContractFactory("UniswapV2Router02")
    this.WETH = await ethers.getContractFactory("WETH9Mock")
    this.EthRegistrarController = await ethers.getContractFactory("ETHRegistrarControllerMock");
    this.ENSBCHReceiver = await ethers.getContractFactory("ENSBCHReceiver");
    this.Factory = await ethers.getContractFactory("UniswapV2Factory");
    this.Pair = await ethers.getContractFactory("UniswapV2Pair");

    this.signers = await ethers.getSigners()
    this.alice = this.signers[0]
    this.bob = this.signers[1]
    this.carol = this.signers[2]
  })

  beforeEach(async function () {
    this.domain = await this.DomainToken.deploy(this.alice.address, ether("100"))
    this.bar = await this.DomainBar.deploy(this.domain.address)
    this.weth = await this.WETH.deploy()
    this.factory = await this.Factory.deploy(this.alice.address)
    this.router = await this.Router.deploy(this.factory.address, this.weth.address)
    await this.factory.createPair(this.domain.address, this.weth.address);
    const pairAddress = await this.factory.getPair(this.domain.address, this.weth.address)
    this.pair = this.Pair.attach(pairAddress);

    this.controller = await this.EthRegistrarController.deploy();
    this.ensBchReceiver = await this.ENSBCHReceiver.deploy(
      this.domain.address,
      this.bar.address,
      this.router.address,
      this.controller.address
    );

    await this.domain.transfer(this.bob.address, ether("25"))
    await this.domain.transfer(this.carol.address, ether("25"))

    await this.domain.approve(this.router.address, uintmax);

    // add liquidity / mint LP tokens
    await this.router.addLiquidityETH(
      this.domain.address,
      ether("25"),
      ether("25"),
      ether("25"),
      this.alice.address,
      uintmax,
      {value: ether("25")}
    );
  })

  it("should allow to proxy calls to owned contract", async function () {
    await expect(this.ensBchReceiver.callTarget(
      this.controller.address,
      "0",
      "withdraw()",
      ethers.utils.defaultAbiCoder.encode([], []))).to.not.be.reverted;
    await expect(this.ensBchReceiver.callTarget(
      this.controller.address,
      "0",
      "",
      ethers.utils.defaultAbiCoder.encode([], []))).to.be.reverted;

    expect(await this.controller.owner()).to.be.equal(this.alice.address);
    // transfer ownership of controller to receiver
    await this.controller.transferOwnership(this.ensBchReceiver.address);
    expect(await this.controller.owner()).to.be.equal(this.ensBchReceiver.address);
  });

  it("should register name and withdraw funds", async function () {
    const secret = "0x0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF";
    expect(await ethers.provider.getBalance(this.controller.address)).to.be.equal(ether("0"));
    await this.controller.register("name", this.alice.address, 3600, secret, { value: ether("1") });
    expect(await ethers.provider.getBalance(this.controller.address)).to.be.equal(ether("1"));
  });

  it("should register name and invoke convert", async function () {
    const reserves  = await this.Pair.attach(this.pair.address).getReserves();
    expect(reserves[0]).to.be.equal(ether("25"));
    expect(reserves[1]).to.be.equal(ether("25"));

    // bar is still empty
    expect(await this.bar.totalSupply()).to.be.equal(ether("0"));
    // also has no domain tokens
    expect(await this.domain.balanceOf(this.bar.address)).to.be.equal(ether("0"));

    const secret = "0x0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF";
    await this.controller.register("name", this.alice.address, 3600, secret, { value: ether("1") });

    await this.controller.transferOwnership(this.ensBchReceiver.address);

    await expect(this.ensBchReceiver.connect(this.carol).convert())
      .to.emit(this.ensBchReceiver, "Received").withArgs(this.controller.address, ether("1"));

    const newReserves = await this.Pair.attach(this.pair.address).getReserves();
    expect(newReserves[1]).to.be.equal(ether("26"));

    // bar is still empty
    expect(await this.bar.totalSupply()).to.be.equal(ether("0"));
    // but has our domain tokens
    expect(await this.domain.balanceOf(this.bar.address)).to.not.be.equal(ether("0"));
  });
})
