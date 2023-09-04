import {ethers, network, run } from "hardhat";
import config from "../config";
require('dotenv').config();
import * as fs from 'fs';

const main = async () => {
  // Compile contracts
  await run("compile");
  console.log("Compiled contracts.");

  const networkName = network.name;
  console.log(network.name);
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

  console.log("Deploying to network:", networkName);

 
  console.log("Deploying Pancake FactoryV2...");

  const FactoryV2 = await ethers.getContractFactory("PancakeFactory");
  const factoryV2 = await FactoryV2.deploy(owner.address);


  console.log("Deploying Pancake router...");
 

  const Router = await ethers.getContractFactory("PancakeRouter");
  const router = await Router.deploy(factoryV2.address, config.WBNB[networkName]);

  console.log(" Factory deployed to: ", factoryV2.address);
  console.log(" Router deployed to: ", router.address);

  const contracts = {
    PancakeV2Factory: factoryV2.address,
    Router: router.address,
  }
  if (!fs.existsSync("./deployments")) {
    fs.mkdirSync("./deployments", { recursive: true });
  }
  fs.writeFileSync(`./deployments/${networkName}.json`, JSON.stringify(contracts, null, 2))
};

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
