const Web3 = require('web3');

function initiateWeb3(){
        if (typeof web3 !== 'undefined') {
            web3 = new Web3(web3.currentProvider);
        } else {
            web3 = new Web3(new Web3.providers.HttpProvider("http://62.233.65.7:22004"));
        }
        return web3;
}
module.exports.initiateWeb3=initiateWeb3;