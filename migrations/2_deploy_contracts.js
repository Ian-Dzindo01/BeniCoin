var BeniToken = artifacts.require("./BeniToken.sol");
var BeniTokenSale = artifacts.require("./BeniTokenSale.sol");

module.exports = function(deployer) {
  deployer.deploy(BeniToken, 1000000).then(function() {
    var tokenPrice = 1000000000000000;                                   // this is in wei
    return deployer.deploy(BeniTokenSale, BeniToken.address, tokenPrice);
  })
};
