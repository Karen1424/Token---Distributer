// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

/// Library imports
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract FastToken is ERC20 {
    
    constructor()
        ERC20("Fast Token", "FT")
    {
        _mint(msg.sender, 1000000 * (10 ** 18));   
    }

}
