pragma solidity ^0.4.2;
import "./BeniToken.sol";

contract BeniTokenSale {
    address admin;
    BeniToken public tokenContract;
    uint256 public tokenPrice;
    uint256 public tokensSold;
    uint256 public tokensBought;

    event Sell(address _buyer, uint256 _amount);

    constructor(BeniToken _tokenContract, uint256 _tokenPrice) public {
        admin = msg.sender;
        tokenContract = _tokenContract;
        tokenPrice = _tokenPrice;
    }

    function multiply(uint x, uint y) internal pure returns(uint z) {
        require(y == 0 || (z = x * y) / y == x);
    }


    function buyTokens(uint256 _numberOfTokens) public payable {
        require(msg.value == multiply(_numberOfTokens, tokenPrice));    // we want to be secure about this math here
        require(tokenContract.balanceOf(this) >= _numberOfTokens);      // this keyword references the current contract
        require(tokenContract.transfer(msg.sender, _numberOfTokens));

        tokensSold += _numberOfTokens;

        emit Sell(msg.sender, _numberOfTokens);
    }

    // function sellTokens(uint256 _numberOfTokens) public payable {

    //     // Make sure that the seller has sufficient number of tokens to sell.
    //     //require(tokenContract.balanceOf(msg.sender) >= _numberOfTokens)

    //     // Make sure that the contract has supplied the right number of ether.

    //     // Transfer the actual tokens.
    //     require(tokenContract.transfer(this, _numberOfTokens));

    //     // Increment the number of tokens bought
    //     tokensBought += _numberOfTokens;

    //     // Emit a Sell event
    //     emit Sell(this, _numberOfTokens);             // the contract is the buyer in this case

    // }

    // Ending DappToken Sale
    function endSale() public {
        require(msg.sender == admin);
        require(tokenContract.transfer(admin, tokenContract.balanceOf(this)));   // returns all unsold tokens to admin

        selfdestruct(admin);
    }

    function etherBalanceOfSC() public returns(uint256) {
        return address(this).balance;
    }
}
