module.exports = async function ({ getNamedAccounts, deployments }) {
  const { deploy } = deployments

  const { deployer } = await getNamedAccounts()

  await deploy("Sablier", {
    from: deployer,
    args: [],
    log: true,
    deterministicDeployment: false
  })
}

module.exports.tags = ["Sablier"]
module.exports.dependencies = []
