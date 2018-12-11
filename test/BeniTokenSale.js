var BeniToken = artifacts.require("./BeniToken.sol");
var BeniTokenSale = artifacts.require("./BeniTokenSale.sol");

contract('BeniTokenSale', function(accounts) {
    var tokenSaleInstance;
    var tokenInstance;
    var tokenPrice = 1000000000000000; // you're doing this to evade floating point values
    var buyer = accounts[1];
    var admin = accounts[0];
    var numberOfTokens;
    var tokensAvailable = 750000;

    it('initalizes the contract with the correct values', function() {
        return BeniTokenSale.deployed().then(function(instance) {
            tokenSaleInstance = instance;
            return tokenSaleInstance.address
        }).then(function(address) {
            assert.notEqual(address, 0x0, 'has contract address');
            return tokenSaleInstance.tokenContract();
        }).then(function(address) {
            assert.notEqual(address, 0x0, 'has contract address');
            return tokenSaleInstance.tokenPrice();
        }).then(function(price) {
            assert.equal(price, tokenPrice, 'has set token price')
        })
    })

    it('facilitates token buying', function() {
        return BeniToken.deployed().then(function(instance) {
            tokenInstance = instance;
            return BeniTokenSale.deployed()
        }).then(function(instance) {
            // Then grab token sale instance
            tokenSaleInstance = instance;
            // Provison 75% of tokens to the TokenSale
            return tokenInstance.transfer(tokenSaleInstance.address, tokensAvailable, {
                from: admin
            })
        }).then(function(receipt) {
            numberOfTokens = 10;
            return tokenSaleInstance.buyTokens(numberOfTokens, {
                from: buyer,
                value: numberOfTokens * tokenPrice
            })
        }).then(function(receipt) {
            assert.equal(receipt.logs.length, 1, 'triggers one event');
            assert.equal(receipt.logs[0].event, 'Sell', 'should be the "Sell" event');
            assert.equal(receipt.logs[0].args._buyer, accounts[1], 'logs the account the tokens are transferred to');
            assert.equal(receipt.logs[0].args._amount, numberOfTokens, 'logs the transfer amount');
            return tokenSaleInstance.tokensSold();
        }).then(function(amount) {
            assert.equal(amount.toNumber(), numberOfTokens, 'tokens sold is incremented properly')
            return tokenInstance.balanceOf(buyer)
        }).then(function(balance) {
            assert.equal(balance.toNumber(), numberOfTokens);
            return tokenInstance.balanceOf(tokenSaleInstance.address)
        }).then(function(balance) {
            assert.equal(balance.toNumber(), tokensAvailable - numberOfTokens);
            // Try to be more tokens than you can afford with sent value
            return tokenSaleInstance.buyTokens(numberOfTokens, {
                from: buyer,
                value: 2
            })
        }).then(assert.fail).catch(function(error) {
            assert(error.message.indexOf('revert') >= 0, 'msg.value must equal numberOfTokens in wei')
            return tokenSaleInstance.buyTokens(800000, {
                from: buyer,
                value: numberOfTokens * tokenPrice
            })
        }).then(assert.fail).catch(function(error) {
            assert(error.message.indexOf('revert') >= 0, 'cannot purchase more tokens than available')
        })
    })

    it('ends token sale', function() {
       return BeniTokenSale.deployed().then(function(instance) {
        // grab token sale instance
        tokenSaleInstance = instance;
        // try to end sale from account other than the admin
        return tokenSaleInstance.endSale({ from: buyer });
    }).then(assert.fail).catch(function(error) {
        assert(error.message.indexOf('revert' >= 0, 'must be admin to end sale'));
        // End sale as admin
        return tokenSaleInstance.endSale({ from: admin });
    }).then(function(receipt) {
        return tokenInstance.balanceOf(admin);
    }).then(function(balance) {
        assert.equal(balance.toNumber(), 999990, 'returns all unsold beni tokens to admin')
        // Check that token price was reset when self destruct was called
        return tokenSaleInstance.tokenPrice();
    }).then(function(price) {
        assert.equal(price.toNumber(), 0, 'token price was reset')
    })
});
});
