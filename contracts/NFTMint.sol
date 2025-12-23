// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title NFTMint
 * @dev Contrato NFT ERC721 para mint na Arc Testnet
 * Suporta limite por wallet, período de mint, e controle de supply
 */
contract NFTMint is ERC721, Ownable, ReentrancyGuard {
    uint256 private _nextTokenId = 1;
    uint256 public maxSupply;
    uint256 public mintPrice;
    uint256 public walletMintLimit;
    uint256 public startTime;
    uint256 public endTime;
    bool public mintingActive;

    // Mapeamento para rastrear mints por wallet
    mapping(address => uint256) public mintedBy;

    // Eventos
    event Mint(address indexed to, uint256 indexed tokenId, uint256 price);

    constructor(
        string memory name,
        string memory symbol,
        uint256 _maxSupply,
        uint256 _mintPrice,
        uint256 _walletMintLimit,
        uint256 _startTime,
        uint256 _endTime
    ) ERC721(name, symbol) Ownable(msg.sender) {
        maxSupply = _maxSupply;
        mintPrice = _mintPrice;
        walletMintLimit = _walletMintLimit;
        startTime = _startTime;
        endTime = _endTime;
        mintingActive = true;
    }

    /**
     * @dev Mint NFT para um endereço
     * @param to Endereço que receberá o NFT
     */
    function safeMint(address to) public payable nonReentrant {
        require(mintingActive, "Minting is not active");
        require(block.timestamp >= startTime, "Minting has not started");
        require(block.timestamp <= endTime, "Minting has ended");
        require(totalSupply() < maxSupply, "Max supply reached");
        require(mintedBy[to] < walletMintLimit, "Wallet limit reached");
        require(msg.value >= mintPrice, "Insufficient payment");

        uint256 tokenId = _nextTokenId++;
        _safeMint(to, tokenId);
        mintedBy[to]++;

        // Reembolsar excesso se houver
        if (msg.value > mintPrice) {
            payable(to).transfer(msg.value - mintPrice);
        }

        emit Mint(to, tokenId, mintPrice);
    }

    /**
     * @dev Retorna o total de NFTs mintados
     */
    function totalSupply() public view returns (uint256) {
        return _nextTokenId - 1;
    }

    /**
     * @dev Ativa/desativa minting (apenas owner)
     */
    function setMintingActive(bool _active) public onlyOwner {
        mintingActive = _active;
    }

    /**
     * @dev Atualiza preço de mint (apenas owner)
     */
    function setMintPrice(uint256 _price) public onlyOwner {
        mintPrice = _price;
    }

    /**
     * @dev Atualiza limite por wallet (apenas owner)
     */
    function setWalletMintLimit(uint256 _limit) public onlyOwner {
        walletMintLimit = _limit;
    }

    /**
     * @dev Atualiza período de mint (apenas owner)
     */
    function setMintPeriod(uint256 _startTime, uint256 _endTime) public onlyOwner {
        startTime = _startTime;
        endTime = _endTime;
    }

    /**
     * @dev Retira fundos do contrato (apenas owner)
     */
    function withdraw() public onlyOwner {
        uint256 balance = address(this).balance;
        payable(owner()).transfer(balance);
    }

    /**
     * @dev Override para suportar tokenURI
     */
    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        _requireOwned(tokenId);
        // Retornar URI base + tokenId (implementar lógica de metadata)
        return string(abi.encodePacked(baseURI(), _toString(tokenId)));
    }

    function baseURI() public pure returns (string memory) {
        // Em desenvolvimento, usar localhost. Em produção, usar domínio real
        // Você pode atualizar isso após deploy ou criar função setBaseURI()
        return "http://localhost:3000/api/metadata/";
    }

    function _toString(uint256 value) internal pure returns (string memory) {
        if (value == 0) {
            return "0";
        }
        uint256 temp = value;
        uint256 digits;
        while (temp != 0) {
            digits++;
            temp /= 10;
        }
        bytes memory buffer = new bytes(digits);
        while (value != 0) {
            digits -= 1;
            buffer[digits] = bytes1(uint8(48 + uint256(value % 10)));
            value /= 10;
        }
        return string(buffer);
    }
}

