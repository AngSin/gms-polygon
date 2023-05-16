// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";

contract Bananas is ERC20, ERC20Burnable {
    constructor() ERC20("Bananas", "BNA") {}

    function mint(uint256 _amount) public {
        super._mint(msg.sender, _amount);
    }
}