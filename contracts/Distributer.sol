// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

/// Library imports
import "@openzeppelin/contracts/access/Ownable.sol";

/// Local imports
import "./FastToken.sol";

contract Distributer is Ownable {

    uint256 public foundersTotalSupply;
    uint256 public employeesTotalSupply;
    uint256 public soldTokensTotalSupply;
    FastToken public fastToken;
    
    constructor() { 
        fastToken = new FastToken();
        foundersTotalSupply = 400000 * (10 ** 18);
        employeesTotalSupply = 200000 * (10 ** 18);
        soldTokensTotalSupply = 400000 * (10 ** 18);
        require(fastToken.totalSupply() == (foundersTotalSupply + employeesTotalSupply + soldTokensTotalSupply), "Does not match total supply");
    }
  
    mapping(address => Owners) public owners;
     
    enum OwnerType { Founder, Employee }

    struct Owners {
        OwnerType ownerType;
        uint256 totalAmount; 
        uint256 claimed;
        uint256 allocationTime;
    }

   function addFounder(address founder_, uint256 amount_) public onlyOwner {

        Owners storage owner = owners[founder_];
        require(0 == owner.totalAmount, "On founder address Founder already exists");
        require(amount_ <= foundersTotalSupply, "Can not add a new founder because the tokens are exhausted");
        owner.ownerType = OwnerType.Founder;
        owner.totalAmount = amount_;
        owner.claimed = (amount_ / 5);
        owner.allocationTime = (block.timestamp);
        
        foundersTotalSupply -= amount_;
        require(fastToken.transfer(founder_, amount_ / 5), "Cannot transfer tokens");
    }

    function addEmployee(address employee_, uint256 amount_) public onlyOwner {

        Owners storage owner = owners[employee_];
        require(0 == owners[employee_].totalAmount, "On employee address employee already exists");
        require(amount_ <= employeesTotalSupply, "Can not add a new employee because the tokens are spended");
        owner.ownerType = OwnerType.Employee;
        owner.totalAmount = amount_;
        owner.claimed = (amount_ / 10);
        owner.allocationTime = (block.timestamp);
        
        employeesTotalSupply -= amount_;
        require(fastToken.transfer(employee_, amount_ / 10), "Cannot transfer tokens");
    }

    function soldTokensManagement(address buyer_, uint256 amount_) public onlyOwner {

        require(amount_ <= soldTokensTotalSupply, "Should not exceed the total balance of tokens sold");
        require(fastToken.transfer(buyer_, amount_), "Cannot transfer tokens");
        soldTokensTotalSupply -= amount_;
    }

    function claim() public {

        Owners storage user = owners[msg.sender];
        require(0 < user.totalAmount, "You can not accsess this information");
        require(user.totalAmount > user.claimed, "Your total amount is exhausted");
        uint256 month = 0;
        uint256 ta = 0;
        if (OwnerType.Employee == user.ownerType) {

            require((user.allocationTime + 180 days) < block.timestamp, "Your account is still frozen");
            month = (block.timestamp - (user.allocationTime + 180 days)) / 30 days + 1;
            ta = month * user.totalAmount / 10;
        } else {

            require((user.allocationTime + 730 days) < block.timestamp, "Your account is still frozen");
            month = (block.timestamp - (user.allocationTime + 730 days)) / 30 days + 1;
            ta = month * user.totalAmount / 5;
        }
        require(ta > user.claimed, "You already use your amount balance for this month");

        if (ta > user.totalAmount) {
            ta = user.totalAmount;
        }
        require(fastToken.transfer(msg.sender, (ta - user.claimed)), "Cannot transfer tokens");
        user.claimed = ta;
    }
}
