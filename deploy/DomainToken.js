 module.exports = async function ({ getNamedAccounts, deployments }) {
  const { deploy } = deployments

  const { deployer, dev } = await getNamedAccounts()
  const totalSupply = "1000000000000000000000000"; // 1 million

  await deploy("DomainToken", {
    from: deployer,
    args: [dev, totalSupply],
    log: true,
    deterministicDeployment: false
  })
}

module.exports.tags = ["DomainToken"]
module.exports.dependencies = []
