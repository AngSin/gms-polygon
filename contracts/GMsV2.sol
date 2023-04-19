// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;
import "./GMs.sol";

contract GMsV3 is GMs {
    function claimAll(bytes32[][] memory _proofs) public {
        for (uint256 i = 0; i < _proofs.length; i++) {
            ClaimEvent memory claimEvent = claimEvents[i];
            if(
                claimEvent.startTimestamp > 0 &&
                claimEvent.startTimestamp + claimEvent.period > block.timestamp &&
                !hasUserClaimed(i)
            ) {
                if (claimEvent.isWl) {
                    if (MerkleProof.verify(_proofs[i], claimEvent.root, keccak256(bytes.concat(keccak256(abi.encode(msg.sender)))))) {
                        claim(_proofs[i], i);
                    }
                } else {
                    claim(_proofs[i], i);
                }
            }
        }
    }
}