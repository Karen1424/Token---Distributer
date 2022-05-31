// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

/// Library imports
import "@openzeppelin/contracts/access/Ownable.sol";

/// Local imports
import "./FastToken.sol";

contract Distributer is Ownable {

    address distributerOwner;
    uint256 public foundersTotalSupply;
    uint256 public employeesTotalSupply;
    uint256 public soldTokensTotalSupply;
    FastToken private fastToken;

    constructor() { 
        distributerOwner = msg.sender;
        fastToken = new FastToken();
        require(fastToken.totalSupply() == 1000000,"does not match total supply"); 
        fastToken.approve(distributerOwner, 1000000);
        foundersTotalSupply = 400000;
        employeesTotalSupply = 200000;
        soldTokensTotalSupply = 400000;
    }
  
    mapping(address => Owners) public owners;
     
    enum OwnerStatus { Active, Frozen }

    enum OwnerType { Founder, Employee }

    struct Owners {
        OwnerStatus status;
        OwnerType user;
        address owner;
        uint256 amount;
        uint256 activeAmount;
        uint256 freezingTime;
        uint256 currentTime;  
    }

    /// Owner Only functions
    function addFounder(address founder_, uint256 amount_) public onlyOwner {

        require(owners[founder_].owner == address(0), "on this address Founder already exists");
        require(foundersTotalSupply >= amount_, "Can not add a new founder because the tokens are exhausted");
        Owners memory owner = Owners(OwnerStatus.Frozen,
                                     OwnerType.Founder,
                                     founder_,
                                     (amount_ - (amount_ / 5)),
                                     (amount_ / 5),
                                     (block.timestamp + 730 days),
                                     (block.timestamp + 730 days));
        
        owners[founder_] = owner;
        foundersTotalSupply -= amount_;   
    } 

    function addEmployee(address employee_, uint256 amount_) public onlyOwner {

        require(owners[employee_].owner == address(0), "on this address employee already exists");
        require(employeesTotalSupply >= amount_, "Can not add a new employee because the tokens are exhausted");
        Owners memory owner = Owners(OwnerStatus.Frozen,
                                     OwnerType.Employee,
                                     employee_,
                                     (amount_ - (amount_ / 10)),
                                     (amount_ / 10),
                                     (block.timestamp + 180 days),
                                     (block.timestamp + 180 days));

        owners[employee_] = owner;
        employeesTotalSupply -= amount_;
    }

    function soldTokensManagement(address buyer_, uint256 amount_) public payable onlyOwner {

        require(msg.sender != distributerOwner, "Distributer can not be buyer");
        require(amount_ >= soldTokensTotalSupply, "should not exceed the total balance of tokens sold");
        fastToken.transfer(buyer_, amount_);
        soldTokensTotalSupply -= amount_;
    }

    /// Utils
    function secondsPerDay(uint256 second_) private pure returns(uint256) {

        return (second_ / 86400);
    }
 
    /// Owners API
    function currentStatus(address owner_) public view returns(Owners memory) {

        require(msg.sender != owners[owner_].owner, "you can not accsess this information");
        return owners[owner_];
    }

    function ownersToUse() public payable {

        require(msg.sender == owners[msg.sender].owner, "you can not accsess this information");
        require(owners[msg.sender].currentTime > block.timestamp, "Your account is still frozen");

        /// check employee or Founder
        uint256 ownerPercent = (owners[msg.sender].user == OwnerType.Employee ? 10000 : 50000); 

        uint256 day = secondsPerDay((block.timestamp - owners[msg.sender].currentTime));
        uint256 partOfAmount = (day / 30);
        partOfAmount = (partOfAmount * ownerPercent) + ownerPercent;
        owners[msg.sender].status = OwnerStatus.Active;
        fastToken.transfer(msg.sender, partOfAmount);
        owners[msg.sender].amount -= (partOfAmount);
        day = (day / 30) + 1;
        owners[msg.sender].currentTime += (day * 30 days);
    }  
}