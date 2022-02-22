require('babel-register');
require('babel-polyfill');
require("dotenv").config();
const HDWalletProvider = require('truffle-hdwallet-provider-privkey')

module.exports = {
  networks: {
    development: {
      host: "127.0.0.1",
      port: 8545,
      network_id: "*" // Match any network id
    },

    rinkeby: {
      provider: function () {
        return new HDWalletProvider(
          [process.env.DEPLOYER_PRIVATE_KEY],
          `https://eth-rinkeby.alchemyapi.io/v2/${process.env.ALCHEMY_API_KEY}` // URL to Ethereum Node
        )
      },
      network_id: 4
    },

    matic: {
      provider: function () {
        return new HDWalletProvider(
          [process.env.DEPLOYER_PRIVATE_KEY],
          `https://polygon-rpc.com`
        )
      },
      network_id: 137
    }
  },

  contracts_directory: './src/contracts/',
  contracts_build_directory: './src/abis/',

  compilers: {
    solc: {
      version: '0.8.9',
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  }
}
