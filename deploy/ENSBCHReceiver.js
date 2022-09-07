const { ROUTER_ADDRESS } = require('@dogmoneyswap/sdk');

module.exports = async function ({ ethers, deployments, getNamedAccounts, getChainId }) {
  const { deploy } = deployments

  const [ deployerSigner ] = await ethers.getSigners()

  const { deployer, dev } = await getNamedAccounts()

  const chainId = await getChainId();

  const domain = await ethers.getContract("DomainToken")
  const bar = await ethers.getContract("DomainBar")
  const router = ROUTER_ADDRESS[chainId];

  await deploy("ENSBCHReceiver", {
    from: deployer,
    args: [domain.address, bar.address, router],
    log: true,
    deterministicDeployment: false
  })

  const txOptions = {
    gasPrice: 1050000000,
    gasLimit: 5000000,
  }

  const ENSBCHReceiver = await ethers.getContract("ENSBCHReceiver")
  if (await ENSBCHReceiver.owner() !== dev) {
    // Transfer ownership of MasterChef to Timelock
    console.log("Transfer ownership of ENSBCHReceiver to dev")
    await (await ENSBCHReceiver.transferOwnership(dev, txOptions)).wait()
  }

  console.warn("ENSBCHReceiver deployment: do not forget to transfer  RegistararController's ownership to ENSBCHReceiver");
}

module.exports.tags = ["ENSBCHReceiver"]
module.exports.dependencies = ["DomainToken", "DomainBar"]
