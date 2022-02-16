module.exports = async function ({ ethers, deployments, getNamedAccounts }) {
  const { deploy } = deployments

  const { deployer, dev } = await getNamedAccounts()

  const domain = await ethers.getContract("DomainToken")
  const bar = await ethers.getContract("DomainBar")
  const router = "0x5d0bF8d8c8b054080E2131D8b260a5c6959411B8";
  
  const { address } = await deploy("ENSBCHReceiver", {
    from: deployer,
    args: [domain.address, bar.address, router],
    log: true,
    deterministicDeployment: false
  })
}

module.exports.tags = ["ENSBCHReceiver"]
module.exports.dependencies = ["DomainToken", "DomainBar"]
