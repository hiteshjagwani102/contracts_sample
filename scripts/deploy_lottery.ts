import { ethers } from "hardhat";

async function main() {


  const lottery = await ethers.deployContract("Lottery");

  await lottery.waitForDeployment();

  console.log(
    `Lottery deployed to ${lottery.target}`
  );
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
