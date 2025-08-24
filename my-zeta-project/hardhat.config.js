require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

const { PRIVATE_KEY, ZETA_TESTNET_RPC, ZETA_MAINNET_RPC } = process.env;

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.30",
    settings: { optimizer: { enabled: true, runs: 200 } },
  },
  networks: {
    // ← 이 이름이 --network zetachain 과 정확히 일치해야 합니다
    zetachain: {
      chainId: 7001,
      url: ZETA_TESTNET_RPC || "https://zetachain-athens-evm.blockpi.network/v1/rpc/public",
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
    },
    zetachainMainnet: {
      chainId: 7000,
      url: ZETA_MAINNET_RPC || "https://zetachain-evm.blockpi.network/v1/rpc/public",
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
    },
  },
};
