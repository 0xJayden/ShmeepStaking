// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";
import './interfaces/IShmeepNft.sol';
import './interfaces/IShmeepToken.sol';

contract StakeShmeeps is Ownable, IERC721Receiver {

	struct Stake {
		uint16 tokenId;
		uint80 value;
		address owner;
	}

	uint256 public numShmeepsStaked;
	uint256 public constant TOKEN_RATE = 1000 ether;
	uint256 public constant TOKEN_TAX_PERCENTAGE = 10;
	uint256 public constant MAX_TOKENS = 10000000000 ether;
	uint256 public totalTokensEarned;
	address public feeAccount;

	mapping(uint256 => Stake) private staked;
	event ShmeepStaked(address account, uint16 tokenId, uint80 time);

	IShmeepToken public shmeeps;
	IShmeepNft public shmeepNft;

	constructor() {
		feeAccount = address(0xD7aac94C2f596dfCa180ACF2735b43eF51B1ec2a);
		shmeeps = IShmeepToken(address(0x2a47F52B0fb86e83C723C3235d3fe41e612bF351));
		shmeepNft = IShmeepNft(address(0x8CE171d997d8a818D6c1437a39F344A74b068ADc));

	}

	function stakeShmeep (uint16[] calldata tokenIds) external {
		for(uint i = 0; i < tokenIds.length; i++) {
			require(shmeepNft.ownerOf(tokenIds[i]) == _msgSender(), "you don't own this nft.");
			shmeepNft.transferFrom(_msgSender(), address(this), tokenIds[i]);
			staked[tokenIds[i]] = Stake({
				tokenId: uint16(tokenIds[i]),
				value: uint80(block.timestamp),
				owner: _msgSender()
			});
			numShmeepsStaked += 1;
			emit ShmeepStaked(_msgSender(), tokenIds[i], uint80(block.timestamp));
		}
	}

	function claimTokens (uint16[] calldata tokenIds, bool unstake) external {
		uint256 owed = 0;
		uint256 taxOwed = 0;
		for(uint i = 0; i < tokenIds.length; i++) {
			owed += _claimShmeep(tokenIds[i], unstake);
			totalTokensEarned += owed + taxOwed;
		}
		if(owed == 0) {
			return;
		}
		taxOwed += owed * TOKEN_TAX_PERCENTAGE / 100;
		shmeeps.mint(msg.sender, owed);
		shmeeps.mint(feeAccount, taxOwed);
	}

	function _claimShmeep (uint16 tokenId, bool unstake) internal returns (uint256 owed) {
		Stake memory stake = staked[tokenId];
		require(stake.owner == msg.sender);
		if(totalTokensEarned < MAX_TOKENS) {
			owed = (block.timestamp - stake.value) * TOKEN_RATE / 1 days;
			owed = owed * (100 - TOKEN_TAX_PERCENTAGE) / 100;
		} else {
			owed = 0;
		}
		if(unstake) {
			delete staked[tokenId];
			numShmeepsStaked -= 1;
			shmeepNft.safeTransferFrom(address(this), msg.sender, tokenId, "");
		}
	}

	function onERC721Received(
        address,
        address from,
        uint256,
        bytes calldata
    ) external pure override returns (bytes4) {
      require(from == address(0x0), "Cannot send to Stake directly");
      return IERC721Receiver.onERC721Received.selector;
    }
}