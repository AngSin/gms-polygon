// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "./GMsV4.sol";

contract GMsV5 is GMsV4 {

    uint256 public lastTokenId;
    mapping(uint256 => uint256) public tokenPoints;

    event RedeemFreeMint(address indexed user, uint256 quantity);

    function setTokenPoints(uint256 _tokenId, uint256 _points) public onlyOwnerOrController {
        tokenPoints[_tokenId] = _points;
    }

    function getUserPoints(address _wallet) public view returns (uint256 totalPoints) {
        uint256 userPoints;
        for (uint256 i = 1; i <= lastTokenId; i++) {
            uint256 balance = balanceOf(_wallet, i);

            userPoints += balance * tokenPoints[i];
        }

        return userPoints;
    }

    function setLastTokenId(uint256 _lastTokenId) public onlyOwnerOrController {
        lastTokenId = _lastTokenId;
    }

    function burnTokens(uint256[] calldata _tokenIds, uint256[] calldata _amounts) public {
        uint256 expectedBurnedPoints = 0;
        uint256 quantity = 0;

        for (uint256 i = 0; i < _tokenIds.length; i++) {
            expectedBurnedPoints +=  tokenPoints[_tokenIds[i]] * _amounts[i];
        }

        require(expectedBurnedPoints >= 20, "Cannot redeem Free Mint without burning at least 20 points");

        super._burnBatch(msg.sender, _tokenIds, _amounts);

        quantity = expectedBurnedPoints / 20;

        emit RedeemFreeMint(msg.sender, quantity);
    }
}
