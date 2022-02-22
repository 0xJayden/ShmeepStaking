const StakeShmeeps = artifacts.require("StakeShmeeps")

module.exports = async function (deployer) {

    await deployer.deploy(
        StakeShmeeps
    )
};