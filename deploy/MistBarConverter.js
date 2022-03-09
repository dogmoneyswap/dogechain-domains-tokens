const { ROUTER_ADDRESS, MIST_ADDRESS, BAR_ADDRESS } = require('@mistswapdex/sdk');

module.exports = async function ({ ethers, deployments, getNamedAccounts, getChainId }) {
  const { deploy } = deployments

  const { deployer, dev } = await getNamedAccounts()

  const chainId = await getChainId();

  const reservedAmount = "350000000000000000000000"; // 35% of 1 million * 1e18
  const domain = await ethers.getContract("DomainToken")
  const domainbar = await ethers.getContract("DomainBar")

  const { address } = await deploy("MistBarConverter", {
    from: deployer,
    args: [
      reservedAmount,
      domain.address,
      domainbar.address,
      MIST_ADDRESS[chainId],
      BAR_ADDRESS[chainId],
      ROUTER_ADDRESS[chainId]
    ],
    log: true,
    deterministicDeployment: false
  })
}

module.exports.tags = ["MistBarConverter"]
module.exports.dependencies = ["DomainToken", "DomainBar"]
