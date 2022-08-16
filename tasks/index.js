const {
  ROUTER_ADDRESS,
  MIST_ADDRESS,
  BAR_ADDRESS,
  SABLIER_ADDRESS,
  ENS_REGISTRAR_ADDRESS,
} = require('@mistswapdex/sdk');

const { task } = require("hardhat/config")

const MaxUint256 = require("ethers").constants.MaxInt256;
const { namehash } = require('ethers/lib/utils');

task("accounts", "Prints the list of accounts", require("./accounts"))
task("snapshot", "Prints the list of snapshot commands", require("./snapshot"))
task("gas-price", "Prints gas price").setAction(async function({ address }, { ethers }) {
  console.log("Gas price", (await ethers.provider.getGasPrice()).toString())
})

task("bytecode", "Prints bytecode").setAction(async function({ address }, { ethers }) {
  console.log("Bytecode", await ethers.provider.getCode(address))
})

task("erc20:transfer", "ERC20 transfer")
.addParam("token", "Token")
.addParam("amount", "Amount")
.addParam("recipient", "Recipient")
.setAction(async function ({ token, amount, recipient }, { ethers: { getNamedSigner } }, runSuper) {
  const erc20 = await ethers.getContractFactory("UniswapV2ERC20")

  const slp = erc20.attach(token)

  console.log((await (await slp.connect(await getNamedSigner("dev")).transfer(recipient, amount)).wait()).transactionHash);
});

task("erc20:approve", "ERC20 approve")
.addParam("token", "Token")
.addParam("spender", "Spender")
.addOptionalParam("deadline", MaxUint256)
.setAction(async function ({ token, spender, deadline }, { ethers: { getNamedSigner } }, runSuper) {
  const erc20 = await ethers.getContractFactory("UniswapV2ERC20")

  const slp = erc20.attach(token)

  await (await slp.connect(await getNamedSigner("dev")).approve(spender, deadline)).wait()
});

task("bar:enter", "DomainBar enter")
.addParam("amount", "Amount")
.setAction(async function ({ amount }, { ethers: { getNamedSigner } }, runSuper) {
  const domain = await ethers.getContract("DomainToken")

  const bar = await ethers.getContract("DomainBar")

  await run("erc20:approve", { token: domain.address, spender: bar.address })

  await (await bar.connect(await getNamedSigner("dev")).enter(amount)).wait()
});

task("bar:leave", "DomainBar leave")
.addParam("amount", "Amount")
.setAction(async function ({ amount }, { ethers: { getNamedSigner } }, runSuper) {
  const domain = await ethers.getContract("DomainToken")

  const bar = await ethers.getContract("DomainBar")

  await run("erc20:approve", { token: domain.address, spender: bar.address })

  await (await bar.connect(await getNamedSigner("dev")).leave(amount)).wait()
});

function encodeParameters(types, values) {
  const abi = new ethers.utils.AbiCoder()
  return abi.encode(types, values)
}

async function getRegistrarContract(ethers, chainId) {
  const ensRegistryAddress = ENS_REGISTRAR_ADDRESS[chainId];
  const ensRegistry = new ethers.Contract(
    ensRegistryAddress,
    require('../abi/ENS.json')
  );
  const resolverAddress = await ensRegistry.connect(ethers.provider).resolver(namehash('bch'));
  const resolver = new ethers.Contract(
    resolverAddress,
    require('../abi/IInterfaceResolver.json')
  );
  const registrarControllerAddress = await resolver.connect(ethers.provider).interfaceImplementer(namehash('bch'), 0x018fac06);

  const registrar = new ethers.Contract(
    registrarControllerAddress,
    require('../abi/ETHRegistrarControllerMock.json')
  );
  return registrar;
}

task("receiver:upgrade", "Convert bch to rebuy domain for domain bar")
.addParam("oldReceiver", "Account to transfer from")
.setAction(async function ({ oldReceiver }, { getChainId, ethers: { getNamedSigner } }, runSuper) {
  const chainId = await getChainId();

  const nreceiver = await ethers.getContract("ENSBCHReceiver")
  const receiverFactory = await ethers.getContractFactory("ENSBCHReceiver")
  const receiver = receiverFactory.attach(oldReceiver)
  const ethRegistrarController = await getRegistrarContract(ethers, chainId);
  console.log('nreceiver address', nreceiver.address);

  const xfer = await (await receiver.connect(await getNamedSigner("dev")).callTarget(
    ethRegistrarController.address,
    "0",
    "transferOwnership(address)",
    encodeParameters(["address"], [nreceiver.address]),
  {
    gasPrice: 1050000000,
    gasLimit: 5198000,
  })).wait()
  console.log('xfer', xfer.transactionHash)
});

task("receiver:convert", "Convert bch to rebuy domain for domain bar")
.setAction(async function ({ }, { getChainId, ethers: { getNamedSigner } }, runSuper) {
  const chainId = await getChainId();

  const receiver = await ethers.getContract("ENSBCHReceiver")

  const ethRegistrarController = await getRegistrarContract(ethers, chainId);

  const ethRegistrarBalance = await ethers.provider.getBalance(ethRegistrarController.address);
  console.log('ethRegistrarBalance', ethRegistrarBalance.toString());


  if (ethRegistrarBalance.eq(0)) {
    console.log('skipping withdraw step')
  } else {
    const withdraw = await (await ethRegistrarController.connect(await getNamedSigner("dev")).withdraw({
      gasPrice: 1050000000,
      gasLimit: 5198000,
    })).wait()
    console.log('withdraw', withdraw.transactionHash)
  }

  const receiverBalance = await ethers.provider.getBalance(receiver.address);
  console.log('receiverBalance', receiverBalance.toString());

  if (receiverBalance.eq(0)) {
    console.log('skipping convert step');
  } else {
    const served = await (await receiver.connect(await getNamedSigner("dev")).convert({
      gasPrice: 1050000000,
      gasLimit: 5198000,
    })).wait()
    console.log('converted', served.transactionHash)
  }
});

task("converter:stake", "Stake")
.setAction(async function ({ amount }, { ethers: { getNamedSigner } }, runSuper) {
  const converter = await ethers.getContract("MistBarConverter")
  const staked = await (await converter.connect(await getNamedSigner("dev")).stakeDomain()).wait()
  console.log('staked', staked.transactionHash)
});

task("converter:convert", "Convert to mist bar")
.setAction(async function ({ amount }, { ethers: { getNamedSigner } }, runSuper) {
  const converter = await ethers.getContract("MistBarConverter")
  const served = await (await converter.connect(await getNamedSigner("dev")).convert({
      gasPrice: 1050000000,
      gasLimit: 5198000,
    }
  )).wait()
  console.log('converted', served.transactionHash)
});

task("vesting:create", "Create new vesting")
.addParam("recipient", "Address of recipient")
.addParam("token", "Token contract address")
.addParam("amount", "Amount of tokens in wei")
.addParam("timelength", "Time in seconds")
.setAction(async function ({
  recipient,
  token,
  amount,
  timelength,
}, { ethers: { getNamedSigner } }, runSuper) {
  // TODO check deposit is multiple of time delta
  // divide the fixed deposit by the time delta and subtract the remainder from the initial number, ending up streaming a value that is very, very close to the fixed deposit
  const vesting = await ethers.getContract("SafeVesting")
  const stream = await (await vesting.connect(await getNamedSigner("dev")).createStream(
    recipient,
    token,
    amount,
    timelength,
    { gasPrice: 1050000000, gasLimit: 5198000 }
  )).wait();
  console.log('stream created', stream.transactionHash);
  console.log('stream id', stream.events[stream.events.length - 1].topics[1]);
});

task("vesting:balance", "Check balance of stream on account")
.addParam("stream", "Stream id")
.addParam("account", "Balance to check")
.setAction(async function ({
  stream,
  account,
}, { getChainId, ethers: { getNamedSigner } }, runSuper) {
  const chainId = await getChainId();

  const sablier = new ethers.Contract(
    SABLIER_ADDRESS[chainId],
     require('../abi/ISablier.json')
  );
  console.log('balance', ethers.utils.formatEther(await (await sablier.connect(await getNamedSigner("dev")).balanceOf(
    stream,
    account,
  ))));
});

task("vesting:withdraw", "Withdraw balance")
.addParam("stream", "Stream id")
.setAction(async function ({
  stream,
}, { getChainId, ethers: { getNamedSigner } }, runSuper) {
  const chainId = await getChainId();

  const sablier = new ethers.Contract(
      SABLIER_ADDRESS[chainId],
     require('../abi/ISablier.json')
  );
  const balance = (await (await sablier.connect(await getNamedSigner("dev")).balanceOf(
    stream,
    await (await getNamedSigner("vesting")).getAddress(),
  ))).toString();
  console.log('balance', balance);
  const withdraw = await (await sablier.connect(await getNamedSigner("vesting")).withdrawFromStream(
    stream,
    balance,
    { gasPrice: 1050000000, gasLimit: 5198000 }
  )).wait();
  console.log('withdraw', withdraw.transactionHash);
});
