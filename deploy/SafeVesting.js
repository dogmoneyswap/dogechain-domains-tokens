// TODO update sdk
// const { SABLIER_ADDRESS } = require('@mistswapdex/sdk');

module.exports = async function ({ getNamedAccounts, deployments, getChainId }) {
  const { deploy } = deployments

  const { deployer, dev } = await getNamedAccounts()

  const chainId = await getChainId();

  await deploy("SafeVesting", {
    from: deployer,
    // TODO use SABLIER_ADDRESS
    args: [/* SABLIER_ADDRESS[chainId] */"0xeE85373F26E5380Fbd71FB7295BD68fdd0818887"],
    log: true,
    deterministicDeployment: false
  })

  const txOptions = {
    gasPrice: 1050000000,
    gasLimit: 5000000,
  }

  const SafeVesting = await ethers.getContract("SafeVesting")
  if (await SafeVesting.owner() !== dev) {
    // Transfer ownership of MasterChef to Timelock
    console.log("Transfer ownership of SafeVesting to dev")
    await (await SafeVesting.transferOwnership(dev, txOptions)).wait()
  }
}

module.exports.tags = ["SafeVesting"]
module.exports.dependencies = []
