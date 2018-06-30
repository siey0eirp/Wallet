var express = require('express');
const Web3 = require('../web3_modules/initiateWeb3');
const contract = require('../web3_modules/coin_abi');
var router = express.Router();
var cors = require('cors');
var router = express.Router();
var decToHex = require("dec-to-hex")




/*router.post('/', cors(), function(req, res) {
	console.log("in blockNumber");
    var web3 = Web3.initiateWeb3();
    console.log("body::::::::::::: ",req.body.address);
		var coin = contract.getCoinInstance();
		var result = coin.balanceOf(req.body.address);
		var balance =""+result.c[0]+result.c[1];
		
		 let temp = parseInt(balance);
		 let hex = temp.toString(16);
    res.status(200).json({status:1,message:"OK",result:"0x"+hex});
}); */

router.post('/', cors(), function(req, res) {
	console.log("in blockNumber");
    var web3 = Web3.initiateWeb3();
    console.log("body::::::::::::: ",req.body.address);
		var result = web3.eth.getBalance(req.body.address);
		console.log("balance:",result,result.c);
		var balance =""+result.c[0]+result.c[1]+result.c[2]+result.c[3];
		
		 let temp = parseInt(balance);
		 let hex = temp.toString(16);
    console.log("body::::::::::::: ",hex);
    res.status(200).json({status:1,message:"OK",result:"0x7127124e43b38f50b366494300f549e114edf48"});
});

module.exports = router;
