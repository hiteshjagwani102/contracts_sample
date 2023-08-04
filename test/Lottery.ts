import {
    loadFixture,
  } from "@nomicfoundation/hardhat-toolbox/network-helpers";
  import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
  import { expect } from "chai";
  import { ethers } from "hardhat";

describe("Lottery",async function() {

    async function deployLotteryFixture() {
        const [owner, otherAccount] = await ethers.getSigners();
        const Lottery = await ethers.getContractFactory("Lottery");
        const lottery = await Lottery.deploy();

        return { lottery,owner,otherAccount }
    }


    describe("Deployment", function(){

        it("Should set the right owner", async function(){
            const {owner, lottery} = await loadFixture(deployLotteryFixture);
            expect(await lottery.owner()).to.equal(owner.address)
        })
    })

    describe("Participation", function(){

        it("Should be successful if value greater than limit", async function(){
            const {lottery,otherAccount} = await loadFixture(deployLotteryFixture);
            const value = ethers.parseEther("1");
            await expect(lottery.connect(otherAccount).enter({ value: value })).not.to.be.reverted;
        })

        it("List should be updated on new participant", async function(){
            const {lottery,otherAccount} = await loadFixture(deployLotteryFixture);
            const value = ethers.parseEther("1");
            await lottery.connect(otherAccount).enter({ value: value });
            const list = await lottery.getList();
            expect(list[list.length-1]).to.equal(otherAccount.address);
        })

        it("Balance should be updated on new participant with the amount transferred", async function(){
            const {lottery,otherAccount} = await loadFixture(deployLotteryFixture);
            const balanceBefore = await ethers.provider.getBalance(await lottery.getAddress());
            const value = ethers.parseEther("1");
            await lottery.connect(otherAccount).enter({ value: value });
            const balanceAfter = await ethers.provider.getBalance(await lottery.getAddress());
            expect(balanceAfter-balanceBefore).to.equal(ethers.parseUnits("1"));
        })    

        it("Should revert if caller is owner", async function(){
            const {owner,lottery} = await loadFixture(deployLotteryFixture);
            await expect(lottery.connect(owner).enter()).to.be.revertedWith("Owner cannot enter the lottery");
        })


        it("Should revert if value less than limit", async function(){
            const {lottery,otherAccount} = await loadFixture(deployLotteryFixture);
            const value = ethers.parseEther("0");
            await expect(lottery.connect(otherAccount).enter({ value: value })).to.be.revertedWith("Please transfer atleast 1 ether to join");
        })

        it("Should revert if caller already participated", async function(){
            const {lottery,otherAccount} = await loadFixture(deployLotteryFixture);
            const value = ethers.parseEther("1");
            await lottery.connect(otherAccount).enter({ value: value });
            const list = await lottery.getList();
            await expect(lottery.connect(otherAccount).enter({ value: value })).to.be.revertedWith("Player cannot participate twice");
        })

    })

    describe("PickingLottery", function(){

        it("Should revert if not caller is owner", async function(){
            const {owner,lottery,otherAccount} = await loadFixture(deployLotteryFixture);
            await expect(lottery.connect(otherAccount).pickLottery()).to.be.revertedWith("Lottery can only be picked by owner");
        })

        it("Should revert if no one participated", async function(){
            const {lottery,owner,otherAccount} = await loadFixture(deployLotteryFixture);
            await expect(lottery.connect(owner).pickLottery()).to.be.revertedWith("Atleast one player required");
        })

        it("Should update the account balance to zero", async function(){
            const {lottery,owner,otherAccount} = await loadFixture(deployLotteryFixture);
            const value = ethers.parseEther("1");
            await lottery.connect(otherAccount).enter({ value: value });
            await lottery.connect(owner).pickLottery();
            expect(await ethers.provider.getBalance(lottery.getAddress())).to.equal(0);
        })
    })

    describe("Resetting", function(){

        it("Should not revert if caller is owner", async function(){
            const {owner,lottery,otherAccount} = await loadFixture(deployLotteryFixture);
            await expect(lottery.connect(owner).reset()).not.to.be.reverted;
        })


        it("Should update the list to become empty", async function(){
            const {lottery,owner,otherAccount} = await loadFixture(deployLotteryFixture);
            await lottery.connect(owner).reset();
            expect((await lottery.getList()).length).to.equal(0);
        })

        it("Should revert if not caller is owner", async function(){
            const {owner,lottery,otherAccount} = await loadFixture(deployLotteryFixture);
            await expect(lottery.connect(otherAccount).reset()).to.be.revertedWith("Only owner can reset lottery");
        })
    })


})