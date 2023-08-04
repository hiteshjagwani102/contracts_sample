// SPDX-License-Identifier: MIT

pragma solidity ^0.8.2;

contract Lottery{
    address public owner;
    address payable[] public players;

    constructor(){
        owner = msg.sender;
    }

    function alreadyParticipated() private view returns(bool) {
        for(uint _i; _i<players.length; _i++){
            if(players[_i]==msg.sender) return true;
        }
        return false;
    }

    function enter() payable public {
        require(msg.sender != owner , "Owner cannot enter the lottery");
        require(alreadyParticipated() == false,"Player cannot participate twice");
        require(msg.value >= 1 ether,"Please transfer atleast 1 ether to join");
        players.push(payable(msg.sender));
    }

    function getList() view public returns(address payable[]  memory){
        return players;
    }

    function random() view private returns(uint) {
        return uint(sha256(abi.encodePacked(block.difficulty,block.number,players)));
     }

    function pickLottery() public {
        require(msg.sender == owner, "Lottery can only be picked by owner");
        require(players.length>0,"Atleast one player required");
         players[random()%players.length].transfer(address(this).balance);
         reset();
    }

    function reset() public {
        require(msg.sender == owner, "Only owner can reset lottery");
        players = new address payable[](0);
    }

}
