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
    FastToken private fastToken;

    constructor() { 
        fastToken = new FastToken();
        foundersTotalSupply = (400000 * 10 ** 18);
        employeesTotalSupply = (200000 * 10 ** 18);
        soldTokensTotalSupply = (400000 * 10 ** 18);
        require((fastToken.totalSupply() * 10 ** 18) == (foundersTotalSupply + employeesTotalSupply + soldTokensTotalSupply), "does not match total supply"); 
    }
  
    mapping(address => Owners) public owners;
     
    enum OwnerType { Founder, Employee }

    struct Owners {
        OwnerType ownerType;
        address owner;
        uint256 totalAmount; 
        uint256 monthsClaimed;
        uint256 allocationTime;
    }

    /// Owner Only functions
    function addFounder(address founder_, uint256 amount_) public onlyOwner {

        require(owners[founder_].owner == address(0), "on this address Founder already exists");
        require(foundersTotalSupply >= amount_, "Can not add a new founder because the tokens are exhausted");
        Owners memory owner = Owners(OwnerType.Founder,
                                     founder_,
                                     (amount_ - (amount_ / 5)),
                                     0,
                                     block.timestamp);
        
        owners[founder_] = owner;
        foundersTotalSupply -= amount_;
        fastToken.transfer(founder_, amount_ / 5);   
    } 

    function addEmployee(address employee_, uint256 amount_) public onlyOwner {

        require(owners[employee_].owner == address(0), "on this address employee already exists");
        require(employeesTotalSupply >= amount_, "Can not add a new employee because the tokens are spended");
        Owners memory owner = Owners(OwnerType.Employee,
                                     employee_,
                                     (amount_ - (amount_ / 10)),
                                     0,
                                     block.timestamp);

        owners[employee_] = owner;
        employeesTotalSupply -= amount_;
        fastToken.transfer(employee_, amount_ / 10);
    }

    function soldTokensManagement(address buyer_, uint256 amount_) public  onlyOwner {

        require(amount_ <= soldTokensTotalSupply, "should not exceed the total balance of tokens sold");
        fastToken.transfer(buyer_, amount_);
        soldTokensTotalSupply -= amount_;
    }

    /// Owners API
    function currentStatus(address owner_) public view returns(Owners memory) {

        require(msg.sender == owners[owner_].owner, "you can not accsess this information");
        return owners[owner_];
    }

    function claim() public {
        
        require(msg.sender == owners[msg.sender].owner, "you can not accsess this information");
        require(owners[msg.sender].totalAmount > 0, "Your total amount is exhausted");
        Owners memory user = owners[msg.sender];
        uint256 month = ((block.timestamp - user.allocationTime) / 31 days) + 1;
        uint256 ownerPercentsAmount = 0;
        
        if (user.ownerType == OwnerType.Employee) {
            require((user.allocationTime + 180 days) < block.timestamp, "Your account is still frozen");
            ownerPercentsAmount = (user.totalAmount / 10);
            month = ((month - user.monthsClaimed) > 10) ? 10 : month;
        } else {
            require((user.allocationTime + 730 days) < block.timestamp, "Your account is still frozen");
            ownerPercentsAmount = (user.totalAmount / 5);
            month = ((month - user.monthsClaimed) > 5) ? 5 : month;
        }
        
        require(month > user.monthsClaimed, "you already use your amount balance for this month");
        fastToken.transfer(msg.sender, (month - user.monthsClaimed) * ownerPercentsAmount);
        user.totalAmount -= (month * ownerPercentsAmount);
        user.monthsClaimed = month;
        owners[msg.sender] = user;
    }  
}
