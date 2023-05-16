// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "./GMsV3.sol";

interface IERC20Burnable {
    function burnFrom(address account, uint256 amount) external;
}

contract GMsV4 is GMsV3 {
    address public bananaContract;

    function setBananaContract(address _bananaContract) public onlyOwnerOrController {
        bananaContract = _bananaContract;
    }

    function burnBananasForGMs(uint256 _amount) public {
        require(_amount % 50 ether == 0, "Incorrect amount of bananas!");
        IERC20Burnable(bananaContract).burnFrom(msg.sender, _amount);
        if (_amount > 50 ether) {
            uint256 bigGmMintAmount = _amount / 100 ether;
            super._mint(msg.sender, 8, bigGmMintAmount, "");
            if (_amount % 100 ether != 0) {
                super._mint(msg.sender, 7, 1, "");
            }
        } else {
            super._mint(msg.sender, 7, 1, "");
        }
    }
}