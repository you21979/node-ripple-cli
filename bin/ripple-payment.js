#!/usr/bin/env node
var rp = require('ripple-lib-promise');
var TradeWallet = require('ripple-usecase').TradeWallet;
var fs = require('fs');

var TIMEOUT = 20;
var RIPPLE_WALLET_PATH = '/etc/trade_wallet.json';

var payment = function(remote, wallet, address, currency, amount){
    var tw = new TradeWallet(remote, wallet.address, wallet.secret);
    return tw.withdraw(address, amount, currency).then(function(res){
        console.log(res);
        return remote;
    })
}

var main = function(){
    var config = JSON.parse(fs.readFileSync(RIPPLE_WALLET_PATH, "utf8"));

    var opt = process.argv.splice(2)
    if(opt.length !== 4){
        console.log("%s wallet type price amount", process.argv[1])
        console.log(" send_wallet = wallet name");
        console.log(" payment_address = address");
        console.log(" currency = XRP or BTC.ISSUER or etc");
        console.log(" amount = float");
        return;
    }

    var wallet = config[opt.shift()];
    if(!wallet){
        throw new Error('wallet is empty');
    }
    var address = opt.shift();
    var currency = opt.shift();
    var amount = parseFloat(opt.shift());

    var connect = function(){
        rp.createConnect(TIMEOUT).then(function(remote){
            return payment(remote, wallet, address, currency, amount);
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
