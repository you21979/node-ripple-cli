#!/usr/bin/env node
var rp = require('ripple-lib-promise');
var TradeWallet = require('ripple-usecase').TradeWallet;
var fs = require('fs');

var TIMEOUT = 20;
var RIPPLE_WALLET_PATH = '/etc/trade_wallet.json';


var trade = function(remote, wallet, type, price, amount){
    var tw = new TradeWallet(remote, wallet.address, wallet.secret);
    switch(type){
    case 'buy':
        return tw.buy(wallet.pair, price, amount).then(function(res){
            console.log(res);
            return remote;
        });
    case 'sell':
        return tw.sell(wallet.pair, price, amount).then(function(res){
            console.log(res)
            return remote;
        });
    default:
        console.log('unknown operation');
        throw new Error('unknown operation:'+type);
    }
}

var main = function(){
    var config = JSON.parse(fs.readFileSync(RIPPLE_WALLET_PATH, "utf8"));

    var opt = process.argv.splice(2)
    if(opt.length !== 4){
        console.log("%s wallet type price amount", process.argv[1])
        console.log(" wallet = wallet name");
        console.log(" type = buy or sell");
        console.log(" price = float");
        console.log(" amount = float");
        return;
    }

    var wallet = config[opt.shift()];
    if(!wallet){
        throw new Error('wallet is empty');
    }
    var type = opt.shift();
    var price = parseFloat(opt.shift());
    var amount = parseFloat(opt.shift());

    var connect = function(){
        rp.createConnect(TIMEOUT).then(function(remote){
            return trade(remote, wallet, type, price, amount);
        }).then(function(remote){
            remote.disconnect();
        }).catch(function(err){
            console.log(err);
            process.exit(-1);
        })
    }
    connect();
}

main();
