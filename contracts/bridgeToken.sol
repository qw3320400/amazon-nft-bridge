// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";

struct ProductInfo {
    string id;
    string platform;
    string url;
}

struct MintInfo {
    ProductInfo product;
    uint256 amount;
    address to;
}

struct BurnInfo {
    ProductInfo product;
    uint256 amount;
    address from;
}

/**
 * @title BridgeToken
 * @author jianwei.fang
 * @notice when bridge a nft token, mint a corespon bToken.
 */
contract BridgeToken is ERC1155 {

    bytes4 private constant _receivedSelector = bytes4(keccak256("onERC1155Received(address,address,uint256,uint256,bytes)"));

    bytes4 private constant _batchReceivedSelector = bytes4(keccak256("onERC1155BatchReceived(address,address,uint256[],uint256[],bytes)"));

    string public name;

    string public symbol;

    address public relayer;

    mapping(uint256 => ProductInfo) public tokenToProduct;

    event BatchMint(address indexed from, MintInfo[] mintList);

    event BatchBurn(address indexed from, BurnInfo[] burnList);

    constructor(address relayer_) ERC1155("") {
        name = "BridgeToken";
        symbol = "BT";
        relayer = relayer_;
    }

    modifier onlyRelayer(address relayer_) {
        require(relayer == relayer_, "only relayer");
        _;
    }

    /**
     * relayer use this funtion to mint corespon token of real-world asset
     * @param mintList mint info list
     */
    function batchMint(MintInfo[] calldata mintList) external onlyRelayer(msg.sender) {
        for (uint256 i = 0; i < mintList.length; i++) {
            uint tokenID = getBridgeTokenID(mintList[i].product);
            _mint(mintList[i].to, tokenID, mintList[i].amount, "");
            tokenToProduct[tokenID] = mintList[i].product;
        }
        emit BatchMint(msg.sender, mintList);
    }

    /**
     * impliment IERC1155Receiver to receive token
     * when received, burn the token, and relay back
     */
    function onERC1155Received(
        address,
        address from,
        uint256 id,
        uint256 value,
        bytes calldata
    ) external returns (bytes4) {
        uint256[] memory ids = new uint256[](1);
        ids[0] = id;
        uint256[] memory values = new uint256[](1);
        values[0] = value;
        _burnBatchToken(from, ids, values);
        return _receivedSelector;
    }

    /**
     * impliment IERC1155Receiver to receive token
     * when received, burn the token, and relay back
     */
    function onERC1155BatchReceived(
        address,
        address from,
        uint256[] calldata ids,
        uint256[] calldata values,
        bytes calldata
    ) external returns (bytes4) {
        _burnBatchToken(from, ids, values);
        return _batchReceivedSelector;
    }

    /**
     * burn batch token and emit event
     */
    function _burnBatchToken(
        address from,
        uint256[] memory ids,
        uint256[] memory values
    ) private {
        BurnInfo[] memory burnList = new BurnInfo[](ids.length);
        for (uint256 i = 0; i < ids.length; i++) {
            burnList[i] = BurnInfo(tokenToProduct[ids[i]], values[i], from);
        }
        _burnBatch(address(this), ids, values);
        emit BatchBurn(from, burnList);
    }

    function uri(uint256 tokenID) public view override returns (string memory) {
        return tokenToProduct[tokenID].url;
    }

    /**
     * get token id from product info
     * @param product product info
     */
    function getBridgeTokenID(ProductInfo calldata product) pure public returns (uint256) {
        return uint256(keccak256(abi.encodePacked(product.platform, product.id)));
    }
}