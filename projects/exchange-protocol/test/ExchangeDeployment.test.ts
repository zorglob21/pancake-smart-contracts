/* eslint-disable */
import { ethers, waffle } from 'hardhat';
import { expect } from "chai";
let factoryV2_address:string;
let wbnb_address:string;
let tokenERC20_address:string;
let router_address:string;


describe("Testing deployment of all pancakeSwap Exchange contracts", function(){

 it( "Should deploy PancakeFactory successfully", async function deployFactory(){
    const [owner, addr1, addr2] = await ethers.getSigners();
    const FactoryV2 = await ethers.getContractFactory("PancakeFactory");
    const factoryV2 = await FactoryV2.deploy(owner.address);
    factoryV2_address = factoryV2.address;
    
  });



 it( "Should deploy WBNB successfully and deposit 10 bnb to contract", async function (){
    const [owner, addr1, addr2] = await ethers.getSigners();
    const WBNB = await ethers.getContractFactory("WBNB");
    const wbnb = await WBNB.deploy();
    wbnb_address = wbnb.address;
    const balance = await wbnb.balanceOf(owner.address);
    await wbnb.deposit({value: ethers.utils.parseEther("99.0")})

    //console.log(ethers.utils.formatEther(await wbnb.balanceOf(owner.address)));

    const BalanceOwnerWBNB = await wbnb.balanceOf(owner.address);
    
    const balanceOwnerWBNB = ethers.utils.formatEther(BalanceOwnerWBNB);
  
    expect(balanceOwnerWBNB).to.equal("99.0");
  });

  it( "Should deploy dummy ERC20 token successfully + send tokens to non owner address" , async function (){
    const [owner, addr1, addr2] = await ethers.getSigners();
    const TokenErc20 = await ethers.getContractFactory("MockERC20");
    const totalSupplyinEther = "10000";
    const totalSupplyinWei = ethers.utils.parseEther(totalSupplyinEther); 
    const tokenERC20 = await TokenErc20.deploy("ERC20", "E20", totalSupplyinWei);
    tokenERC20_address = tokenERC20.address;
    
    const transferAmountinWei = ethers.utils.parseEther("100");
    await tokenERC20.transfer(addr1.address, transferAmountinWei);

    const balanceAddr1 =ethers.utils.formatEther(await tokenERC20.balanceOf(addr1.address));
    expect(balanceAddr1).to.equal("100.0");
  

  });

  
 it( "Should deploy router successfully", async function deployFactory(){
  const [owner, addr1, addr2] = await ethers.getSigners();
  const Router = await ethers.getContractFactory("PancakeRouter");
  const router = await Router.deploy(factoryV2_address, wbnb_address);
  router_address = router.address;

});

it( "Should approve tokens, then create a liquidity pool, make a swap and withdraw liquidities", async function (){
  const [owner, addr1, addr2] = await ethers.getSigners();
  const WBNBContract = await ethers.getContractAt("WBNB", wbnb_address);
  const tokenERC20Contract = await ethers.getContractAt("MockERC20", tokenERC20_address);
  const factoryV2Contract = await ethers.getContractAt("PancakeFactory", factoryV2_address);
  const routerContract = await ethers.getContractAt("PancakeRouter", router_address);
  
  //we give approval to the router to transfer the token
  const approveVal = ethers.utils.parseEther("10000");
  await tokenERC20Contract.connect(addr1).approve(router_address, approveVal);
  const allowance= ethers.utils.formatEther(await tokenERC20Contract.allowance(addr1.address, router_address));
  expect(allowance).to.equal("10000.0");
  
  //We create a pair and add liquidities
  const val1 = ethers.utils.parseEther("10");
  const val2 = ethers.utils.parseEther("9");
  const val3 = ethers.utils.parseEther("1");
  const deadlineInfo = await ethers.provider.getBlock("latest");
  const deadline = deadlineInfo.timestamp + 500;
  const init_code = await factoryV2Contract.INIT_CODE_PAIR_HASH();
  console.log(init_code);

  //console.log(deadline, val1, val2, val3);
  await routerContract.connect(addr1).addLiquidityETH(tokenERC20_address, val1, val2, val3, addr1.address, deadline, {value: ethers.utils.parseEther("1.0")});
  // const test = await routerContract.connect(addr1).factory();
  // console.log(test);
});

}

)

