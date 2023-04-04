// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC1155/ERC1155Upgradeable.sol";

contract GMs is Initializable, ERC1155Upgradeable, OwnableUpgradeable, UUPSUpgradeable {
    using Strings for uint256;
    struct ClaimEvent {
        uint256 tokenId;
        bytes32 root;
        uint256 startTimestamp;
        uint256 period;
        bool isWl;
        address[] claimed;
    }

    ClaimEvent[] public claimEvents;

    string public baseUri;
    mapping(address => bool) private addressToIsController;
    bool public isSoulbound;

    function initialize() initializer public {
        baseUri = "https://gms-metadata.s3.eu-central-1.amazonaws.com/polygon/";
        isSoulbound = true;
        __ERC1155_init(baseUri);
        __Ownable_init();
        __UUPSUpgradeable_init();
    }

    modifier onlyOwnerOrController() {
        require(isController(msg.sender) || super.owner() == msg.sender, "Caller is not controller or owner!");
        _;
    }

    function setIsSoulbound(bool _isSoulbound) public onlyOwnerOrController {
        isSoulbound = _isSoulbound;
    }

    function setBaseUri(string calldata _baseUri) public onlyOwnerOrController {
        baseUri = _baseUri;
    }

    function setControllers(address[] calldata _controllers, bool _enabled) public onlyOwner {
        for (uint256 i = 0; i < _controllers.length; i++) {
            addressToIsController[_controllers[i]] = _enabled;
        }
    }

    function isController(address _controller) public view returns (bool) {
        return addressToIsController[_controller];
    }

    function airdropGMs(uint256 _gmId, address[] calldata _airdropWinners) public onlyOwnerOrController {
        for (uint256 i = 0; i < _airdropWinners.length; i++) {
            super._mint(_airdropWinners[i], _gmId, 1, "");
        }
    }

    function _beforeTokenTransfer(
        address,
        address from,
        address to,
        uint256[] memory,
        uint256[] memory,
        bytes memory
    ) internal override virtual {
        if (isSoulbound) {
            require(from == address(0) || isController(from) || to == address(0), "GMs cannot be transferred");
        }
    }

    event Soulbound(uint256 indexed id, bool bounded);

    function _afterTokenTransfer(
        address,
        address from,
        address,
        uint256[] memory ids,
        uint256[] memory,
        bytes memory
    ) internal override virtual {
        if (isSoulbound) {
            if (from == address(0)) {
                for (uint256 i = 0; i < ids.length; i++) {
                    uint256 id = ids[i];
                    emit Soulbound(id, true);
                }
            }
        }
    }

    function uri(uint256 _tokenId) public view override returns (string memory) {
        return string(abi.encodePacked(baseUri, _tokenId.toString()));
    }

    function _authorizeUpgrade(address newImplementation) internal onlyOwner override {}

    function hasUserClaimed(uint256 _claimEventIndex) public view returns (bool) {
        ClaimEvent memory claimEvent = claimEvents[_claimEventIndex];
        for (uint256 i = 0; i < claimEvent.claimed.length; i++) {
            if (claimEvent.claimed[i] == msg.sender) {
                return true;
            }
        }
        return false;
    }

    function claim(bytes32[] memory _proof, uint256 _claimEventIndex) public {
        ClaimEvent memory claimEvent = claimEvents[_claimEventIndex];
        require(claimEvent.startTimestamp > 0, "Claim hasn't started yet!");
        require(claimEvent.startTimestamp + claimEvent.period > block.timestamp, "Claim has ended!");
        if (claimEvent.isWl) {
            require(MerkleProof.verify(_proof, claimEvent.root, keccak256(bytes.concat(keccak256(abi.encode(msg.sender))))), "You are not whitelisted for this gm!");
        }
        require(!hasUserClaimed(_claimEventIndex), "You already have this gm!");
        super._mint(msg.sender, claimEvent.tokenId, 1, "");
        claimEvents[_claimEventIndex].claimed.push(msg.sender);
    }

    function burn(uint256 _id) public {
        super._burn(msg.sender, _id, 1);
    }

    function startNewClaim(
        uint256 _claimId,
        bytes32 _root,
        uint256 _claimPeriod,
        bool _isWl
    ) public onlyOwnerOrController {
        address[] memory emptyArray = new address[](0);
        ClaimEvent memory claimEvent = ClaimEvent(_claimId, _root, block.timestamp, _claimPeriod, _isWl, emptyArray);
        claimEvents.push(claimEvent);
    }
}