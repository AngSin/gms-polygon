// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;
import "./GMs.sol";

contract GMsV2 is GMs {
    function claimAll(bytes32[][] memory _proofs) public {
        for (uint256 i = 0; i < _proofs.length; i++) {
            claim(_proofs[i], i);
        }
    }
}