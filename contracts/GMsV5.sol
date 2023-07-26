// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "./GMsV4.sol";

contract GMsV5 is GMsV4 {

    // Mapping to store the points of each token
    mapping(uint256 => uint256) public tokenPoints;

    // Event to be emitted
    event UserPointsStatus(address indexed user, uint256 status);

    bool private setupComplete;

    function setupTokenPoints() public onlyOwnerOrController {
        require(!setupComplete, "Setup already completed");

        setTokenPoints(1, 5);
        setTokenPoints(2, 2);
        setTokenPoints(3, 1);
        setTokenPoints(4, 2);
        setTokenPoints(5, 5);
        setTokenPoints(6, 20);

        setupComplete = true;
    }

    function setTokenPoints(uint256 _tokenId, uint256 _points) public onlyOwnerOrController {
        tokenPoints[_tokenId] = _points;
    }

    function checkPoints(address _wallet) public view returns (uint256 totalPoints) {
        
        uint256 userPoints;
        for (uint256 i = 1; i <= 6; i++) {
            uint256 balance = balanceOf(_wallet, i);

            if (balance > 0) {
                userPoints += balance * tokenPoints[i];
            }
        }

        return userPoints;
    }

    function burnTokens(address _wallet, uint256[] calldata _tokenIds, uint256[] calldata _amounts) public {
        uint256 initialBalance = checkPoints(_wallet);
        uint256 expectedBurnedPoints = 0;
        uint256 totalPointsBurned;
        uint256 status = 0;

        for (uint256 i = 0; i < _tokenIds.length; i++) {
            expectedBurnedPoints +=  tokenPoints[_tokenIds[i]] * _amounts[i];
        }

        require(expectedBurnedPoints >= 20, "Cannot redeem AL without burning at least 20 points");

        super._burnBatch(_wallet, _tokenIds, _amounts);

        uint256 finalBalance = checkPoints(_wallet);
        require(initialBalance - finalBalance == expectedBurnedPoints, "Points burned do not match the expected amount");

        totalPointsBurned = initialBalance - finalBalance;

        status = totalPointsBurned / 20; // Integer division, will truncate any fractional part

        emit UserPointsStatus(_wallet, status);
    }
}
