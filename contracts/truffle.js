var HDWalletProvider = require("truffle-hdwallet-provider");

var mnemonic = "circle decrease appear spy oven outdoor mule boil citizen grain agree thunder";

module.exports = {
  compilers: {
    solc: {
      version: "0.4.15",
    },
  },
  networks: {
    development: {
      host: "localhost",
      port: 8545,
      network_id: "*", // Match any network id
      gas: 4712388,
      gasPrice: 100000000000
    },
    ropsten: {
      provider: new HDWalletProvider(mnemonic, "https://ropsten.infura.io/v3/110eb3d44dfa476db42ef38c05365a1e"),
      network_id: 3,
      gas: 4600000,
      gasPrice: 100000000000
    },
    mainnet: {
      provider: new HDWalletProvider(mnemonic, "https://mainnet.infura.io/v3/110eb3d44dfa476db42ef38c05365a1e"),
      network_id: 1,
      gas: 4600000,
      gasPrice: 20000000000
    }
  }
};
