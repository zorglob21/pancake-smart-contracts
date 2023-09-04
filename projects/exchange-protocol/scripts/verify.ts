import {ethers, network, run } from "hardhat";
import config from "../config";
require('dotenv').config();


async function main() {
  const networkName = network.name;
  console.log('verifying on network: ', networkName);

  // Sanity checks
  if (networkName === "mainnet") {
    if (!process.env.KEY_MAINNET) {
      throw new Error("Missing private key, refer to README 'Deployment' section");
    }
  } else if (networkName === "testnet") {
    if (!process.env.KEY_TESTNET) {
      throw new Error("Missing private key, refer to README 'Deployment' section");
    }
  }

  const  [owner] = await ethers.getSigners();


  async function verifyContract(contract: string, constructorArguments: any[] = []) {
    if (process.env.ETHERSCAN_API_KEY && process.env.NETWORK !== 'hardhat') {
      try {
        console.info('Verifying', contract, constructorArguments)
        const verify = await run('verify:verify', {
          address: contract,
          constructorArguments,
        })
        console.log(contract, ' verify successfully')
      } catch (error) {
        console.log(
          '....................',
          contract,
          ' error start............................',
          '\n',
          error,
          '\n',
          '....................',
          contract,
          ' error end............................'
        )
      }
    }}
  
  function sleep(ms: number) {
      return new Promise((resolve) => setTimeout(resolve, ms))
    }
  
  //await verifyContract("0xAe8FA97641AaC987DC41F26721742A0De623b7c0",[owner.address]);
  //await sleep(1000); 

  await verifyContract("0xF6f4A81B50B843291450Af828e1d6d6F02d46790",["0xAe8FA97641AaC987DC41F26721742A0De623b7c0", config.WBNB[networkName]]);
  await sleep(1000); 
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
