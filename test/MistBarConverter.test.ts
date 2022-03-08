import { ethers } from "hardhat";
import { expect } from "chai";

const ether = ethers.utils.parseEther;
const uintmax = ethers.constants.MaxUint256;

describe("MistBarConverter", function () {
  before(async function () {
    this.DomainToken = await ethers.getContractFactory("DomainToken")
    this.DomainBar = await ethers.getContractFactory("DomainBar")
    this.MistToken = await ethers.getContractFactory("DomainToken")
    this.MistBar = await ethers.getContractFactory("DomainBar")
    this.Router = await ethers.getContractFactory("UniswapV2Router02")
    this.WETH = await ethers.getContractFactory("WETH9Mock")
    this.MistBarConverter = await ethers.getContractFactory("MistBarConverter");
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

    this.mist = await this.MistToken.deploy(this.alice.address, ether("100"))
    this.mistBar = await this.DomainBar.deploy(this.mist.address)

    this.weth = await this.WETH.deploy()
    this.factory = await this.Factory.deploy(this.alice.address)
    this.router = await this.Router.deploy(this.factory.address, this.weth.address)
    await this.factory.createPair(this.domain.address, this.weth.address);
    const pairAddress = await this.factory.getPair(this.domain.address, this.weth.address)
    this.pair = this.Pair.attach(pairAddress);

    this.mistBarConverter = await this.MistBarConverter.deploy(
      ether("35"),
      this.domain.address,
      this.bar.address,
      this.mist.address,
      this.mistBar.address,
      this.router.address,
    );

    await this.domain.transfer(this.mistBarConverter.address, ether("36"));
    await this.domain.approve(this.router.address, uintmax);
    await this.mist.approve(this.router.address, uintmax);

    // DOMAIN/weth: add liquidity / mint LP tokens
    await this.router.addLiquidityETH(
      this.domain.address,
      ether("25"),
      ether("25"),
      ether("25"),
      this.alice.address,
      uintmax,
      {value: ether("25")}
    );

    // MIST/weth: add liquidity / mint LP tokens
    await this.router.addLiquidityETH(
      this.mist.address,
      ether("25"),
      ether("25"),
      ether("25"),
      this.alice.address,
      uintmax,
      {value: ether("25")}
    );
  })

  it("should allow to invoke convert by third party", async function () {
    expect(await this.domain.balanceOf(this.mistBarConverter.address)).to.equal(ether("36"));
    await this.mistBarConverter.connect(this.carol).convert();
    expect(await this.domain.balanceOf(this.mistBarConverter.address)).to.equal(ether("0"));
    expect(await this.bar.balanceOf(this.mistBarConverter.address)).to.equal(ether("35"));

    await this.domain.transfer(this.mistBarConverter.address, ether("1"));
    await this.mistBarConverter.connect(this.carol).convert();
    expect(await this.domain.balanceOf(this.mistBarConverter.address)).to.equal(ether("0"));
    expect(await this.bar.balanceOf(this.mistBarConverter.address)).to.equal(ether("35"));
    const mistBalance = await this.mist.balanceOf(this.mistBar.address);
    expect(mistBalance.gt(ether("1"))).to.be.true;
    expect(mistBalance.lt(ether("2"))).to.be.true;
  })
})
