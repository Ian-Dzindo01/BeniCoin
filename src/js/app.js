App = {
    web3Provider: null,
    contracts: {},
    account: '0x0',
    loading: false,
    tokenPrice: 1000000000000000,
    tokensSold: 0,
    tokensAvailable: 750000,

    init: function() {
        console.log("App initialized...")
        return App.initWeb3();
    },

    initWeb3: function() {
        if (typeof web3 !== 'undefined') {
            // If a web3 instance is already provided by Meta Mask.
            App.web3Provider = web3.currentProvider;
            web3 = new Web3(web3.currentProvider);
        } else {
            // Specify default instance if no web3 instance provided
            App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
            web3 = new Web3(App.web3Provider);
        }
        return App.initContracts();
    },

    initContracts: function() {
        $.getJSON("BeniTokenSale.json", function(beniTokenSale) {
            App.contracts.BeniTokenSale = TruffleContract(beniTokenSale);
            App.contracts.BeniTokenSale.setProvider(App.web3Provider);
            App.contracts.BeniTokenSale.deployed().then(function(beniTokenSale) {
                console.log("Beni Token Sale address: ", beniTokenSale.address);
            });
        }).done(function() {
            $.getJSON("BeniToken.json", function(beniToken) {
                App.contracts.BeniToken = TruffleContract(beniToken);
                App.contracts.BeniToken.setProvider(App.web3Provider);
                App.contracts.BeniToken.deployed().then(function(beniToken) {
                    console.log("Beni Token address: ", beniToken.address);
                });

                App.listenForEvents();
                return App.render();

            });
        });
    },

    // Listen for events emitted from the contract
    listenForEvents: function() {
        App.contracts.BeniTokenSale.deployed().then(function(instance) {
            instance.Sell({}, {
                fromBlock: 0,
                toBlock: 'latest',
            }).watch(function(error, event) {
                console.log("event triggered", event);
                App.render();
            })
        })
    },

    render: function() {
        if (App.loading) {
            return;
        }

        App.loading = true;

        var loader = $('#loader');
        var content = $('#content');

        loader.show()
        content.hide()

        // Load account data
        web3.eth.getCoinbase(function(err, account) {
            if (err == null) {
                App.account = account;
                $('#accountAddress').html("Your Account: " + account); // $ is used to access the id's from the index.html file
            }
        })


        // Load token sale contract
        App.contracts.BeniTokenSale.deployed().then(function(instance) {
            beniTokenSaleInstance = instance;
            return beniTokenSaleInstance.tokenPrice();
        }).then(function(tokenPrice) {
            App.tokenPrice = tokenPrice;
            $('.token-price').html(web3.fromWei(App.tokenPrice, "ether").toNumber());
            return beniTokenSaleInstance.tokensSold();
        }).then(function(tokensSold) {
            App.tokensSold = tokensSold.toNumber();
            $('.tokens-sold').html(App.tokensSold)
            $('.tokens-available').html(App.tokensAvailable);
        //     return web3.eth.getBalance(App.contracts.BeniTokenSale.address).toNumber();
        // }).then(function(balance) {
        //     $('#saleContractBalance').html("Contract Ether balance: " + balance);
        });

            var progressPercent = (Math.ceil(App.tokensSold) / App.tokensAvailable) * 100;
            $('#progress').css('width', progressPercent + '%');

            // Load token contract
            App.contracts.BeniToken.deployed().then(function(instance) {
                beniTokenInstance = instance;

                return beniTokenInstance.balanceOf(App.account)
            }).then(function(balance) {
                $('.beni-balance').html(balance.toNumber());
                App.loading = false;               // you want to do this part after all the asynchronous action is done.
                loader.hide();
                content.show();
            });
        },

    buyTokens: function() {
        $('#content').hide();
        $('#loader').show();
        var numberOfBuyTokens = $('#numberOfBuyTokens').val(); // retrieves the value that the user input on the form
        App.contracts.BeniTokenSale.deployed().then(function(instance) {
            return instance.buyTokens(numberOfBuyTokens, {
                from: App.account,
                value: numberOfBuyTokens * App.tokenPrice,
                gas: 500000
            });
        }).then(function(result) {
            console.log("Tokens bought...")
            $('form').trigger('reset')       // reset number of tokens in form
            // Wait for Sell event
        });
    }

//     sellTokens: function() {
//         $('#content').hide();
//         $('#loader').show();


//     }
}

$(function() {
    $(window).load(function() {
        App.init();
    })
});
