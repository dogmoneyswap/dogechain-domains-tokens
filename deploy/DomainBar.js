module.exports = async function ({ getNamedAccounts, deployments }) {
  const { deploy } = deployments

  const { deployer } = await getNamedAccounts()

  const domain = await deployments.get("DomainToken")

  await deploy("DomainBar", {
    from: deployer,
    args: [domain.address],
    log: true,
    deterministicDeployment: false
  })
}

module.exports.tags = ["DomainBar"]
module.exports.dependencies = ["DomainToken"]
