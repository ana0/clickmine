var HDWalletProvider = require("truffle-hdwallet-provider");

var mnemonic = "circle decrease appear spy oven outdoor mule boil citizen grain agree thunder";

module.exports = {
  networks: {
    development: {
      host: "localhost",
      port: 8545,
      network_id: "*", // Match any network id
      gas: 4712388,
      gasPrice: 100000000000
    },
    ropsten: {
      provider: new HDWalletProvider(mnemonic, "https://ropsten.infura.io/"),
      network_id: 3,
      gas: 4600000,
      gasPrice: 100000000000
    },
    mainnet: {
      provider: new HDWalletProvider(mnemonic, "https://mainnet.infura.io/"),
      network_id: 1,
      gas: 4600000,
      gasPrice: 2000000000
    }
  }
};
