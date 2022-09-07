module.exports = async function ({ getNamedAccounts, deployments, getChainId }) {
  const { deploy } = deployments

  const { deployer, dev } = await getNamedAccounts()

  const chainId = await getChainId();

  const sablier = await ethers.getContract("Sablier");

  await deploy("SafeVesting", {
    from: deployer,
    args: [sablier.address],
    log: true,
    deterministicDeployment: false
  })

  const txOptions = {
    gasPrice: 1050000000,
    gasLimit: 5000000,
  }

  const SafeVesting = await ethers.getContract("SafeVesting")
  if (await SafeVesting.owner() !== dev) {
    console.log("Transfer ownership of SafeVesting to dev")
    await (await SafeVesting.transferOwnership(dev, txOptions)).wait()
  }
}

module.exports.tags = ["SafeVesting"]
module.exports.dependencies = ["Sablier"]
