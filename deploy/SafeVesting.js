const { SABLIER_ADDRESS } = require('@dogmoneyswap/sdk');

module.exports = async function ({ getNamedAccounts, deployments, getChainId }) {
  const { deploy } = deployments

  const { deployer, dev } = await getNamedAccounts()

  const chainId = await getChainId();

  await deploy("SafeVesting", {
    from: deployer,
    args: [SABLIER_ADDRESS[chainId]],
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
