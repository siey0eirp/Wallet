function 21
/*21 function
var ensCtrl = function ensCtrl($scope, $sce, walletService) {
   $scope.ajaxReq = ajaxReq;
   $scope.hideEnsInfoPanel = false;
   walletService.wallet = null;
   $scope.ensConfirmModalModal = new Modal(document.getElementById('ensConfirmModal'));
   $scope.ensFinalizeModal = new Modal(document.getElementById('ensFinalizeConfirm'));
   $scope.Validator = Validator;
   $scope.wd = false;
   $scope.haveNotAlreadyCheckedLength = true;
   var ENS = new ens();
   var DomainSale = new domainsale();
   $scope.ensModes = ens.modes;
   $scope.minNameLength = 7;
   $scope.objDomainSale = {};
   $scope.objENS = {
       bidValue: 0.01,
       dValue: 0.01,
       name: '',
       namehash: '',
       nameSHA3: '',
       nameReadOnly: false,
       resolvedAddress: null,
       revealObject: null,
       secret: hd.bip39.generateMnemonic().split(" ").splice(0, 3).join(" "),
       status: -1,
       timer: null,
       timeRemaining: null,
       timeRemainingReveal: null,
       txSent: false
   };
   $scope.gasLimitDefaults = {
       startAuction: '200000',
       newBid: '500000',
       reveal: '200000',
       finalize: '200000'
   };
   $scope.tx = {
       gasLimit: '500000',
       data: '',
       to: '',
       unit: "ether",
       value: 0,
       gasPrice: null
   };
   $scope.showENS = function () {
       return nodes.ensNodeTypes.indexOf(ajaxReq.type) > -1;
   };
   $scope.$watch(function () {
       if (walletService.wallet == null) return null;
       return walletService.wallet.getAddressString();
   }, function () {
       if (walletService.wallet == null) return;
       $scope.wallet = walletService.wallet;
       $scope.wd = true;
       $scope.objENS.nameReadOnly = true;
       $scope.wallet.setBalance();
       $scope.wallet.setTokens();
   });
   $scope.getCurrentTime = function () {
       return new Date().toString();
   };
   var updateScope = function updateScope() {
       if (!$scope.$$phase) $scope.$apply();
   };
   var timeRem = function timeRem(timeUntil) {
       var rem = timeUntil - new Date();
       if (rem < 0) {
           clearInterval($scope.objENS.timer);
           $scope.objENS.timeRemaining = "EXPIRED";
           return;
       }
       var _second = 1000;
       var _minute = _second * 60;
       var _hour = _minute * 60;
       var _day = _hour * 24;
       var days = Math.floor(rem / _day);
       var hours = Math.floor(rem % _day / _hour);
       var minutes = Math.floor(rem % _hour / _minute);
       var seconds = Math.floor(rem % _minute / _second);
       days = days < 10 ? '0' + days : days;
       hours = hours < 10 ? '0' + hours : hours;
       minutes = minutes < 10 ? '0' + minutes : minutes;
       seconds = seconds < 10 ? '0' + seconds : seconds;
       $scope.objENS.timeRemaining = days + ' days ' + hours + ' hours ' + minutes + ' minutes ' + seconds + ' seconds ';
       $scope.objENS.timeRemainingReveal = days - 2 + ' days ' + hours + ' hours ' + minutes + ' minutes ' + seconds + ' seconds ';
       updateScope();
   };
   $scope.nameOnChange = function () {
       $scope.objENS.status = -1;
       $scope.objENS.timeRemaining = null;
       clearInterval($scope.objENS.timer);
   };
   $scope.checkName = function () {
       // checks if it's the same length as a PK and if so, warns them.
       // If they confirm they can set haveNotAlreadyCheckedLength to true and carry on
       if ($scope.haveNotAlreadyCheckedLength && ($scope.objENS.name.length == 128 || $scope.objENS.name.length == 132 || $scope.objENS.name.length == 64 || $scope.objENS.name.length == 66)) {
           $scope.notifier.danger("That looks an awful lot like a private key. Are you sure you would like to check if this name is available on the ENS network? If so, click `Check`. If it is your private key, click refresh & try again.");
           $scope.haveNotAlreadyCheckedLength = false;
       } else if ($scope.Validator.isValidENSName($scope.objENS.name) && $scope.objENS.name.indexOf('.') == -1) {
           $scope.objENS.name = ens.normalise($scope.objENS.name);
           $scope.objENS.namehash = ens.getNameHash($scope.objENS.name + '.eth');
           $scope.objENS.nameSHA3 = ENS.getSHA3($scope.objENS.name);
           $scope.hideEnsInfoPanel = true;
           ENS.getAuctionEntries($scope.objENS.name, function (data) {
               if (data.error) $scope.notifier.danger(data.msg);else {
                   var entries = data.data;
                   for (var key in entries) {
                       $scope.objENS[key] = entries[key];
                   }switch ($scope.objENS.status) {
                       case $scope.ensModes.owned:
                           ENS.getOwner($scope.objENS.name + '.eth', function (data) {
                               $scope.objENS.owner = data.data;
                           });
                           ENS.getDeedOwner($scope.objENS.deed, function (data) {
                               $scope.objENS.deedOwner = data.data;
                           });
                           ENS.getAddress($scope.objENS.name + '.eth', function (data) {
                               $scope.objENS.resolvedAddress = data.data;
                           });
                           DomainSale.getSale($scope.objENS.name, function (data) {
                               $scope.objDomainSale.sale = data.data;
                           });
                           break;
                       case $scope.ensModes.notAvailable:
                           ENS.getAllowedTime($scope.objENS.name, function (data) {
                               $scope.objENS.allowedTime = data.data;
                               clearInterval($scope.objENS.timer);
                               $scope.objENS.timer = setInterval(function () {
                                   return timeRem($scope.objENS.allowedTime);
                               }, 1000);
                           });
                           break;
                       case $scope.ensModes.auction:
                           clearInterval($scope.objENS.timer);
                           $scope.objENS.timer = setInterval(function () {
                               return timeRem($scope.objENS.registrationDate);
                           }, 1000);
                           break;
                       case $scope.ensModes.reveal:
                           $scope.objENS.bidValue = 0;
                           $scope.objENS.secret = '';
                           $scope.objENS.highestBid = etherUnits.toEther($scope.objENS.highestBid.toString(), 'wei');
                           clearInterval($scope.objENS.timer);
                           $scope.objENS.timer = setInterval(function () {
                               return timeRem($scope.objENS.registrationDate);
                           }, 1000);
                           break;
                   }
                   updateScope();
               }
           });
       } else $scope.notifier.danger(globalFuncs.errorMsgs[30]);
   };

   $scope.onLongStringChanged = function () {
       try {
           $scope.objENS.revealObject = null;
           var tObj = JSON.parse($scope.longJsonString.replace(/\\/g, ''));
           $scope.objENS.revealObject = tObj;
           if (tObj.value) $scope.objENS.bidValue = Number(etherUnits.toEther(tObj.value, "wei"));
           if (tObj.secret) $scope.objENS.secret = tObj.secret;
           if (tObj.name && ens.normalise(tObj.name) != $scope.objENS.name) {
               // check if correct name
               $scope.notifier.danger(globalFuncs.errorMsgs[34]);
           } else if (tObj.owner && tObj.owner != $scope.wallet.getAddressString()) {
               // check owner = bidder
               $scope.notifier.danger(globalFuncs.errorMsgs[33]);
           } else {//estimate gas to see if it would not work
               //$scope.estimateGasLimit();
           }
           updateScope();
       } catch (e) {
           $scope.notifier.danger(e.message);
       }
   };
   var getShaBid = function getShaBid(_bidObject, callback) {
       ENS.shaBid(_bidObject.nameSHA3, _bidObject.owner, _bidObject.value, _bidObject.secretSHA3, function (data) {
           if (data.error) callback(true, data.msg);else callback(false, data.data);
       });
   };
   var getBidObject = function getBidObject() {
       var _objENS = $scope.objENS;
       var bidObject = {
           name: _objENS.name,
           nameSHA3: ENS.getSHA3(_objENS.name),
           owner: $scope.wallet.getAddressString(),
           value: etherUnits.toWei(_objENS.bidValue, 'ether'),
           secret: _objENS.secret.trim(),
           secretSHA3: ENS.getSHA3(_objENS.secret.trim())
       };
       return bidObject;
   };
   $scope.openAndBidAuction = function () {
       $scope.tx.gasLimit = $scope.gasLimitDefaults.newBid;
       var _objENS = $scope.objENS;
       $scope.bidObject = getBidObject();
       _objENS.registrationDate = new Date();
       _objENS.registrationDate.setDate(_objENS.registrationDate.getDate() + 5);
       getShaBid($scope.bidObject, function (isError, data) {
           if (isError) $scope.notifier.danger(data);else {
               var bidHash = data;
               $scope.tx.data = ENS.getStartAndBidAuctionData($scope.objENS.name, bidHash);
               $scope.tx.to = ENS.getAuctionAddress();
               $scope.tx.value = _objENS.dValue;
               var txData = uiFuncs.getTxData($scope);
               txData.nonce = txData.gasPrice = null;
               uiFuncs.generateTx(txData, function (rawTx) {
                   if (!rawTx.isError) {
                       $scope.generatedTxs.push(rawTx.signedTx);
                       $scope.bidObject = JSON.stringify($scope.bidObject);
                       $scope.ensConfirmModalModal.open();
                   } else {
                       $scope.notifier.danger(rawTx.error);
                   }
                   if (!$scope.$$phase) $scope.$apply();
               });
           }
       });
   };
   $scope.revealBid = function () {
       $scope.tx.gasLimit = $scope.gasLimitDefaults.reveal;
       var _objENS = $scope.objENS;
       ajaxReq.getTransactionData($scope.wallet.getAddressString(), function (data) {
           if (data.error) $scope.notifier.danger(data.msg);
           data = data.data;
           $scope.tx.to = ENS.getAuctionAddress();
           $scope.tx.data = ENS.getRevealBidData(_objENS.name, etherUnits.toWei(_objENS.bidValue, 'ether'), _objENS.secret);
           $scope.tx.value = 0;
           var txData = uiFuncs.getTxData($scope);
           txData.gasPrice = data.gasprice;
           txData.nonce = data.nonce;
           uiFuncs.generateTx(txData, function (rawTx) {
               if (!rawTx.isError) {
                   $scope.generatedTxs.push(rawTx.signedTx);
                   $scope.ensConfirmModalModal.open();
               } else {
                   $scope.notifier.danger(rawTx.error);
               }
           });
       });
   };
   $scope.finalizeDomain = function () {
       $scope.tx.gasLimit = $scope.gasLimitDefaults.finalize;
       if ($scope.wallet.getAddressString() != $scope.objENS.deedOwner) {
           $scope.notifier.danger(globalFuncs.errorMsgs[33]);
           return;
       }
       var _objENS = $scope.objENS;
       ajaxReq.getTransactionData($scope.wallet.getAddressString(), function (data) {
           if (data.error) $scope.notifier.danger(data.msg);
           data = data.data;
           $scope.tx.to = ENS.getAuctionAddress();
           $scope.tx.data = ENS.getFinalizeAuctionData(_objENS.name);
           $scope.tx.value = 0;
           var txData = uiFuncs.getTxData($scope);
           txData.gasPrice = data.gasprice;
           txData.nonce = data.nonce;
           uiFuncs.generateTx(txData, function (rawTx) {
               if (!rawTx.isError) {
                   $scope.generatedTxs = [];
                   $scope.generatedTxs.push(rawTx.signedTx);
                   $scope.ensFinalizeModal.open();
               } else {
                   $scope.notifier.danger(rawTx.error);
               }
           });
       });
   };
   $scope.getRevealTime = function () {
       if ($scope.objENS && $scope.objENS.registrationDate) return new Date($scope.objENS.registrationDate - 48 * 60 * 60 * 1000);
       return new Date().toString();
   };
   $scope.bidAuction = function (nonce, gasPrice) {
       $scope.tx.gasLimit = $scope.gasLimitDefaults.newBid;
       var _objENS = $scope.objENS;
       $scope.bidObject = getBidObject();
       getShaBid($scope.bidObject, function (isError, data) {
           if (isError) $scope.notifier.danger(data);else {
               var bidHash = data;
               $scope.tx.data = ENS.getNewBidData(bidHash);
               $scope.tx.to = ENS.getAuctionAddress();
               $scope.tx.value = _objENS.dValue;
               var txData = uiFuncs.getTxData($scope);
               if (nonce && gasPrice) {
                   txData.nonce = nonce;
                   txData.gasPrice = gasPrice;
               } else txData.nonce = txData.gasPrice = null;
               uiFuncs.generateTx(txData, function (rawTx) {
                   if (!rawTx.isError) {
                       $scope.generatedTxs.push(rawTx.signedTx);
                       $scope.bidObject = JSON.stringify($scope.bidObject);
                       $scope.ensConfirmModalModal.open();
                   } else {
                       $scope.notifier.danger(rawTx.error);
                   }
                   if (!$scope.$$phase) $scope.$apply();
               });
           }
       });
   };
   $scope.sendTxStatus = "";
   $scope.sendTx = function () {
       $scope.ensConfirmModalModal.close();
       $scope.ensFinalizeModal.close();
       var signedTx = $scope.generatedTxs.shift();
       uiFuncs.sendTx(signedTx, function (resp) {
           if (!resp.isError) {
               var emailLink = '<a class="strong" href="mailto:support@myetherwallet.com?Subject=Issue%20regarding%20my%20ENS%20&Body=Hi%20Taylor%2C%20%0A%0AI%20have%20a%20question%20concerning%20my%20ENS%20transaction.%20%0A%0AI%20was%20attempting%20to%3A%0A-%20Start%20an%20ENS%20auction%0A-%20Bid%20on%20an%20ENS%20name%0A-%20Reveal%20my%20ENS%20bid%0A-%20Finalize%20my%20ENS%20name%0A%0AUnfortunately%20it%3A%0A-%20Never%20showed%20on%20the%20blockchain%0A-%20Failed%20due%20to%20out%20of%20gas%0A-%20Failed%20for%20another%20reason%0A-%20Never%20showed%20up%20in%20the%20account%20I%20was%20sending%20to%0A%0APlease%20see%20the%20below%20details%20for%20additional%20information.%0A%0AThank%20you.%20%0A%0A_%0A%0A%20name%3A%20' + $scope.objENS.name + '%0A%20timeRemaining%3A%20' + $scope.getRevealTime().toString() + '%0A%20revealDate%3A%20' + $scope.objENS.registrationDate.toString() + "%0A%20timer%3A%20" + $scope.objENS.timer + "%0A%20txSent%3A%20" + $scope.objENS.txSent + "%0A%20to%3A%20" + $scope.tx.to + "%0A%20from%20address%3A%20" + $scope.wallet.getAddressString() + "%0A%20data%3A%20" + $scope.tx.data + "%0A%20value%3A%20" + $scope.tx.value + '" target="_blank" rel="noopener noreferrer">Confused? Email Us.</a>';
               var bExStr = $scope.ajaxReq.type != nodes.nodeTypes.Custom ? "<a class='strong' href='" + $scope.ajaxReq.blockExplorerTX.replace("[[txHash]]", resp.data) + "' target='_blank' rel='noopener'> View your transaction </a>" : '';
               $scope.sendTxStatus += globalFuncs.successMsgs[2] + "<p>" + resp.data + "</p><p>" + bExStr + "</p><p>" + emailLink + "</p>";
               $scope.notifier.success($scope.sendTxStatus);
               if ($scope.generatedTxs.length) $scope.sendTx();else $scope.sendTxStatus = '';
           } else {
               $scope.notifier.danger(resp.error);
           }
       });
       $scope.objENS.txSent = true;
       $scope.objENS.hideEnsInfoPanel = false;
   };
   $scope.generateTx = function () {
       try {
           var _objENS = $scope.objENS;
           $scope.sentTxs = [];
           $scope.generatedTxs = [];
           if (!$scope.Validator.isValidENSName(_objENS.name)) throw globalFuncs.errorMsgs[30];else if (!$scope.Validator.isPositiveNumber(_objENS.bidValue) || _objENS.bidValue < 0.01) throw globalFuncs.errorMsgs[0];else if (_objENS.status != $scope.ensModes.reveal && (!$scope.Validator.isPositiveNumber(_objENS.dValue) || _objENS.dValue < _objENS.bidValue || $scope.wallet.balance <= _objENS.dValue)) throw globalFuncs.errorMsgs[0];else if (!$scope.Validator.isPasswordLenValid(_objENS.secret, 0)) throw globalFuncs.errorMsgs[31];else if (_objENS.revealObject && _objENS.revealObject.name && ens.normalise(_objENS.revealObject.name) != _objENS.name) throw globalFuncs.errorMsgs[34];else {
               if ($scope.objENS.status == $scope.ensModes.open) $scope.openAndBidAuction();else if ($scope.objENS.status == $scope.ensModes.auction) $scope.bidAuction();else if ($scope.objENS.status == $scope.ensModes.reveal) $scope.revealBid();
           }
       } catch (e) {
           $scope.notifier.danger(e);
       }
   };
};
module.exports = ensCtrl;
*/
function 20
/*20 function
var domainsaleCtrl = function domainsaleCtrl($scope, $sce, walletService) {
   $scope.referrer = "0x7cB57B5A97eAbe94205C07890BE4c1aD31E486A8";
   $scope.ajaxReq = ajaxReq;
   $scope.hideDomainSaleInfoPanel = false;
   walletService.wallet = null;
   $scope.domainsaleConfirmModalModal = new Modal(document.getElementById('domainsaleConfirmModal'));
   $scope.Validator = Validator;
   $scope.wd = false;
   $scope.haveNotAlreadyCheckedLength = true;
   var ENS = new ens();
   var DomainSale = new domainsale();
   $scope.ensModes = ens.modes;
   $scope.domainsaleModes = domainsale.modes;
   $scope.domainsaleTransactions = domainsale.transactions;
   $scope.minNameLength = 7;
   $scope.objDomainSale = {
       status: -1,
       name: '',
       address: '',
       balance: -1,
       balanceEth: -1,
       price: 0,
       priceEth: 0,
       reserve: 0,
       reserveEth: 0,
       bid: 0,
       bidEth: 0,
       seller: '',
       nameReadOnly: false,
       timeRemaining: null
   };
   $scope.gasLimitDefaults = {
       // TODO set sensible values
       transfer: '200000',
       offer: '200000',
       bid: '200000',
       buy: '200000',
       cancel: '200000',
       finish: '200000',
       withdraw: '200000'
   };
   $scope.tx = {
       data: '',
       to: '',
       unit: "ether",
       value: 0,
       gasPrice: null
   };
   $scope.showDomainSale = function () {
       return nodes.domainsaleNodeTypes.indexOf(ajaxReq.type) > -1;
   };
   $scope.$watch(function () {
       if (walletService.wallet == null) return null;
       return walletService.wallet.getAddressString();
   }, function () {
       if (walletService.wallet == null) return;
       $scope.wallet = walletService.wallet;
       $scope.wd = true;
       $scope.objDomainSale.nameReadOnly = true;
       $scope.wallet.setBalance();
       $scope.wallet.setTokens();
   });
   $scope.getCurrentTime = function () {
       return new Date().toString();
   };
   var updateScope = function updateScope() {
       if (!$scope.$$phase) $scope.$apply();
   };
   var timeRem = function timeRem(timeUntil) {
       var rem = timeUntil - new Date();
       if (rem < 0) {
           clearInterval($scope.objDomainSale.timer);
           $scope.objDomainSale.timeRemaining = "FINISHED";
           return;
       }
       var _second = 1000;
       var _minute = _second * 60;
       var _hour = _minute * 60;
       var _day = _hour * 24;
       var hours = Math.floor(rem % _day / _hour);
       var minutes = Math.floor(rem % _hour / _minute);
       var seconds = Math.floor(rem % _minute / _second);
       hours = hours < 10 ? '0' + hours : hours;
       minutes = minutes < 10 ? '0' + minutes : minutes;
       seconds = seconds < 10 ? '0' + seconds : seconds;
       $scope.objDomainSale.timeRemaining = hours + ' hours ' + minutes + ' minutes ' + seconds + ' seconds ';
       updateScope();
   };
   $scope.addressOnChange = function () {
       // Resets information
       $scope.objDomainSale.balance = -1;
   };
   $scope.nameOnChange = function () {
       // Resets information
       $scope.objDomainSale.status = -1;
       $scope.objDomainSale.bid = 0;
       $scope.objDomainSale.bidEth = 0;
       $scope.objDomainSale.buy = 0;
       $scope.objDomainSale.buyEth = 0;
       $scope.objDomainSale.reserve = 0;
       $scope.objDomainSale.reserveEth = 0;
       $scope.objDomainSale.timeRemaining = null;
       $scope.tx = {
           data: '',
           to: '',
           unit: 'ether',
           value: 0
       };
       clearInterval($scope.objDomainSale.timer);
   };
   $scope.checkBalance = function () {
       if ($scope.Validator.isValidAddress($scope.objDomainSale.address)) {
           DomainSale.getBalance($scope.objDomainSale.address, function (data) {
               var entries = data.data;
               for (var key in entries) {
                   $scope.objDomainSale[key] = entries[key];
               }$scope.hideDomainSaleInfoPanel = true;
           });
       }
   };
   $scope.checkName = function () {
       // checks if it's the same length as a PK and if so, warns them.
       // If they confirm they can set haveNotAlreadyCheckedLength to true and carry on
       if ($scope.haveNotAlreadyCheckedLength && ($scope.objDomainSale.name.length == 128 || $scope.objDomainSale.name.length == 132 || $scope.objDomainSale.name.length == 64 || $scope.objDomainSale.name.length == 66)) {
           $scope.notifier.danger("That looks an awful lot like a private key. Are you sure you would like to check if this name is available on the ENS network? If so, click `Check`. If it is your private key, click refresh & try again.");
           $scope.haveNotAlreadyCheckedLength = false;
       } else if ($scope.Validator.isValidENSName($scope.objDomainSale.name) && $scope.objDomainSale.name.indexOf('.') == -1) {
           $scope.objDomainSale.name = ens.normalise($scope.objDomainSale.name);
           $scope.objDomainSale.namehash = ens.getNameHash($scope.objDomainSale.name + '.eth');
           $scope.objDomainSale.nameSHA3 = ENS.getSHA3($scope.objDomainSale.name);
           $scope.hideDomainSaleInfoPanel = true;
           ENS.getAuctionEntries($scope.objDomainSale.name, function (data) {
               if (data.error) $scope.notifier.danger(data.msg);else {
                   var entries = data.data;
                   for (var key in entries) {
                       if (key != 'status') $scope.objDomainSale[key] = entries[key];
                   }if (data.data.status != $scope.ensModes.owned) {
                       // Not owned so ineligible for domainsale
                       $scope.objDomainSale.status = $scope.domainsaleModes.ineligible;
                       updateScope();
                   } else {
                       $scope.objDomainSale.valueEth = Number(etherUnits.toEther($scope.objDomainSale.value.toString(), 'wei'));
                       ENS.getDeedOwner($scope.objDomainSale.deed, function (data) {
                           $scope.objDomainSale.deedOwner = data.data;
                           if (data.data.toLowerCase() != DomainSale.getContractAddress().toLowerCase()) {
                               // Not owned by DomainSale contract
                               $scope.objDomainSale.status = $scope.domainsaleModes.nottransferred;
                               updateScope();
                           } else {
                               ENS.getDeedPreviousOwner($scope.objDomainSale.deed, function (data) {
                                   $scope.objDomainSale.seller = data.data;
                                   DomainSale.getSale($scope.objDomainSale.name, function (data) {
                                       var entries = data.data;
                                       for (var key in entries) {
                                           $scope.objDomainSale[key] = entries[key];
                                       }if ($scope.objDomainSale.price == 0 && $scope.objDomainSale.reserve == 0) {
                                           // Not yet offered for sale
                                           $scope.objDomainSale.status = $scope.domainsaleModes.notoffered;
                                       } else if ($scope.objDomainSale.auctionStarted.getTime() == 0) {
                                           // Available for sale
                                           $scope.objDomainSale.status = $scope.domainsaleModes.available;
                                           $scope.objDomainSale.minimumBid = $scope.objDomainSale.reserve;
                                           $scope.objDomainSale.minimumBidEth = $scope.objDomainSale.reserveEth;
                                           $scope.objDomainSale.bid = $scope.objDomainSale.minimumBid;
                                           $scope.objDomainSale.bidEth = $scope.objDomainSale.minimumBidEth;
                                       } else if ($scope.objDomainSale.auctionEnds.getTime() >= new Date().getTime()) {
                                           // Being auctioned
                                           $scope.objDomainSale.status = $scope.domainsaleModes.auctioning;
                                           $scope.objDomainSale.timer = setInterval(function () {
                                               return timeRem($scope.objDomainSale.auctionEnds);
                                           }, 1000);
                                           DomainSale.getMinimumBid($scope.objDomainSale.name, function (data) {
                                               var entries = data.data;
                                               for (var key in entries) {
                                                   $scope.objDomainSale[key] = entries[key];
                                               }$scope.objDomainSale.bid = $scope.objDomainSale.minimumBid;
                                               $scope.objDomainSale.bidEth = $scope.objDomainSale.minimumBidEth;
                                               updateScope();
                                           });
                                       } else {
                                           // Auction closed
                                           $scope.objDomainSale.status = $scope.domainsaleModes.closed;
                                       }
                                       updateScope();
                                   });
                               });
                           }
                       });
                   }
               }
           });
       } else $scope.notifier.danger(globalFuncs.errorMsgs[30]);
   };

   // Sync internal values with inputs
   $scope.syncPrice = function () {
       if ($scope.objDomainSale.priceEth == null) {
           $scope.objDomainSale.price = 0;
       } else {
           $scope.objDomainSale.price = Number(etherUnits.toWei($scope.objDomainSale.priceEth, 'ether'));
       }
   };
   $scope.syncReserve = function () {
       if ($scope.objDomainSale.reserveEth == null) {
           $scope.objDomainSale.reserve = 0;
       } else {
           $scope.objDomainSale.reserve = Number(etherUnits.toWei($scope.objDomainSale.reserveEth, 'ether'));
       }
   };
   $scope.syncBid = function () {
       if ($scope.objDomainSale.bidEth == null) {
           $scope.objDomainSale.bid = 0;
       } else {
           $scope.objDomainSale.bid = Number(etherUnits.toWei($scope.objDomainSale.bidEth, 'ether'));
       }
   };

   $scope.sendTxStatus = "";
   $scope.sendTx = function () {
       $scope.domainsaleConfirmModalModal.close();
       $scope.objDomainSale.status = -1;
       var signedTx = $scope.generatedTxs.shift();
       uiFuncs.sendTx(signedTx, function (resp) {
           if (!resp.isError) {
               var emailLink = '<a class="strong" href="mailto:support@myetherwallet.com?subject=Issue%20regarding%20my%20DomainSale%20&body=Hi%20Taylor%2C%20%0A%0AI%20have%20a%20question%20concerning%20my%20DomainSale%20transaction.%20%0A%0AI%20was%20attempting%20to%3A%0A-%20Start%20an%20ENS%20auction%0A-%20Bid%20on%20an%20ENS%20name%0A-%20Reveal%20my%20ENS%20bid%0A-%20Finalize%20my%20ENS%20name%0A%0AUnfortunately%20it%3A%0A-%20Never%20showed%20on%20the%20blockchain%0A-%20Failed%20due%20to%20out%20of%20gas%0A-%20Failed%20for%20another%20reason%0A-%20Never%20showed%20up%20in%20the%20account%20I%20was%20sending%20to%0A%0APlease%20see%20the%20below%20details%20for%20additional%20information.%0A%0AThank%20you.%20%0A%0A_%0A%0A%20name%3A%20' + $scope.objDomainSale.name + "%0A%20txSent%3A%20" + $scope.objDomainSale.txSent + "%0A%20to%3A%20" + $scope.tx.to + "%0A%20from%20address%3A%20" + $scope.wallet.getAddressString() + "%0A%20data%3A%20" + $scope.tx.data + "%0A%20value%3A%20" + $scope.tx.value + '" rel="noopener noreferrer">Confused? Email Us.</a>';
               var bExStr = $scope.ajaxReq.type != nodes.nodeTypes.Custom ? "<a class='strong' href='" + $scope.ajaxReq.blockExplorerTX.replace("[[txHash]]", resp.data) + "' target='_blank' rel='noopener'> View your transaction </a>" : '';
               $scope.sendTxStatus += globalFuncs.successMsgs[2] + "<p>" + resp.data + "</p><p>" + bExStr + "</p><p>" + emailLink + "</p>";
               $scope.notifier.success($scope.sendTxStatus);
               if ($scope.generatedTxs.length) $scope.sendTx();else $scope.sendTxStatus = '';
           } else {
               $scope.notifier.danger(resp.error);
           }
       });
       $scope.objDomainSale.txSent = true;
       $scope.hideDomainSaleInfoPanel = false;
   };
   // Transactions
   $scope.generateTransferTx = function () {
       try {
           $scope.objDomainSale.tx = domainsale.transactions.transfer;
           if (!$scope.Validator.isValidENSName($scope.objDomainSale.name)) throw globalFuncs.errorMsgs[30];
           $scope.tx.to = ENS.getAuctionAddress();
           $scope.tx.gasLimit = $scope.gasLimitDefaults.transfer;
           $scope.tx.data = ENS.getTransferData($scope.objDomainSale.name, DomainSale.getContractAddress());
           $scope.tx.value = 0;
           $scope.doTx();
       } catch (e) {
           $scope.notifier.danger(e);
       }
   };
   $scope.generateOfferTx = function () {
       try {
           $scope.objDomainSale.tx = domainsale.transactions.offer;
           if (!$scope.Validator.isValidENSName($scope.objDomainSale.name)) throw globalFuncs.errorMsgs[30];
           if ($scope.objDomainSale.price == 0 && $scope.objDomainSale.reserve == 0) throw globalFuncs.errorMsgs[38];
           $scope.tx.to = DomainSale.getContractAddress();
           $scope.tx.gasLimit = $scope.gasLimitDefaults.offer;
           $scope.tx.data = DomainSale.getOfferData($scope.objDomainSale.name, $scope.objDomainSale.price, $scope.objDomainSale.reserve, $scope.referrer);
           $scope.tx.value = 0;
           $scope.doTx();
       } catch (e) {
           $scope.notifier.danger(e);
       }
   };
   $scope.generateBuyTx = function () {
       try {
           $scope.objDomainSale.tx = domainsale.transactions.buy;
           if (!$scope.Validator.isValidENSName($scope.objDomainSale.name)) throw globalFuncs.errorMsgs[30];
           $scope.tx.to = DomainSale.getContractAddress();
           $scope.tx.gasLimit = $scope.gasLimitDefaults.buy;
           $scope.tx.data = DomainSale.getBuyData($scope.objDomainSale.name, $scope.referrer);
           $scope.tx.value = $scope.objDomainSale.priceEth;
           $scope.doTx();
       } catch (e) {
           $scope.notifier.danger(e);
       }
   };
   $scope.generateBidTx = function () {
       try {
           $scope.objDomainSale.tx = domainsale.transactions.bid;
           if (!$scope.Validator.isValidENSName($scope.objDomainSale.name)) throw globalFuncs.errorMsgs[30];
           if ($scope.objDomainSale.bidEth < $scope.objDomainSale.minimumBidEth) throw globalFuncs.errorMsgs[39];
           $scope.tx.to = DomainSale.getContractAddress();
           $scope.tx.gasLimit = $scope.gasLimitDefaults.bid;
           $scope.tx.data = DomainSale.getBidData($scope.objDomainSale.name, $scope.referrer);
           $scope.tx.value = $scope.objDomainSale.bidEth;
           $scope.doTx();
       } catch (e) {
           $scope.notifier.danger(e);
       }
   };
   $scope.generateCancelTx = function () {
       try {
           $scope.objDomainSale.tx = domainsale.transactions.cancel;
           if (!$scope.Validator.isValidENSName($scope.objDomainSale.name)) throw globalFuncs.errorMsgs[30];
           $scope.tx.to = DomainSale.getContractAddress();
           $scope.tx.gasLimit = $scope.gasLimitDefaults.cancel;
           $scope.tx.data = DomainSale.getCancelData($scope.objDomainSale.name);
           $scope.tx.value = 0;
           $scope.doTx();
       } catch (e) {
           $scope.notifier.danger(e);
       }
   };
   $scope.generateFinishTx = function () {
       try {
           $scope.objDomainSale.tx = domainsale.transactions.finish;
           if (!$scope.Validator.isValidENSName($scope.objDomainSale.name)) throw globalFuncs.errorMsgs[30];
           $scope.tx.to = DomainSale.getContractAddress();
           $scope.tx.gasLimit = $scope.gasLimitDefaults.finish;
           $scope.tx.data = DomainSale.getFinishData($scope.objDomainSale.name);
           $scope.tx.value = 0;
           $scope.doTx();
       } catch (e) {
           $scope.notifier.danger(e);
       }
   };
   $scope.generateWithdrawTx = function () {
       try {
           $scope.objDomainSale.tx = domainsale.transactions.withdraw;
           $scope.tx.to = DomainSale.getContractAddress();
           $scope.tx.gasLimit = $scope.gasLimitDefaults.withdraw;
           $scope.tx.data = DomainSale.getWithdrawData();
           $scope.tx.value = 0;
           $scope.doTx();
       } catch (e) {
           $scope.notifier.danger(e);
       }
   };
   $scope.doTx = function (nonce, gasPrice) {
       $scope.sentTxs = [];
       $scope.generatedTxs = [];
       var txData = uiFuncs.getTxData($scope);
       if (nonce && gasPrice) {
           txData.nonce = nonce;
           txData.gasPrice = gasPrice;
       } else {
           txData.nonce = txData.gasPrice = null;
       }
       uiFuncs.generateTx(txData, function (rawTx) {
           if (!rawTx.isError) {
               $scope.generatedTxs.push(rawTx.signedTx);
               $scope.domainsaleConfirmModalModal.open();
           } else {
               $scope.notifier.danger(rawTx.error);
           }
           if (!$scope.$$phase) $scope.$apply();
       });
   };
};
module.exports = domainsaleCtrl;
*/
function 24
/*24 function
var offlineTxCtrl = function offlineTxCtrl($scope, $sce, walletService) {
   $scope.ajaxReq = ajaxReq;
   walletService.wallet = null;
   walletService.password = '';
   $scope.unitReadable = ajaxReq.type;
   $scope.valueReadable = "";
   $scope.showAdvance = false;
   $scope.dropdownEnabled = true;
   $scope.showRaw = false;
   $scope.showWalletInfo = false;
   $scope.gasPriceDec = 0;
   $scope.nonceDec = 0;
   $scope.tokens = Token.popTokens;
   $scope.Validator = Validator;
   $scope.tx = {
       gasLimit: globalFuncs.defaultTxGasLimit,
       from: "",
       data: "",
       to: "",
       unit: "ether",
       value: '',
       nonce: null,
       gasPrice: null,
       donate: false
   };
   $scope.tokenTx = {
       to: '',
       value: 0,
       id: 'ether',
       gasLimit: 150000
   };
   $scope.localToken = {
       contractAdd: "",
       symbol: "",
       decimals: "",
       type: "custom"
   };
   $scope.$watch(function () {
       if (walletService.wallet == null) return null;
       return walletService.wallet.getAddressString();
   }, function () {
       if (walletService.wallet == null) return;
       $scope.wallet = walletService.wallet;
   });
   $scope.setTokens = function () {
       $scope.tokenObjs = [];
       for (var i = 0; i < $scope.tokens.length; i++) {
           $scope.tokenObjs.push(new Token($scope.tokens[i].address, '', $scope.tokens[i].symbol, $scope.tokens[i].decimal, $scope.tokens[i].type));
       }
       var storedTokens = globalFuncs.localStorage.getItem("localTokens", null) != null ? JSON.parse(globalFuncs.localStorage.getItem("localTokens")) : [];
       for (var i = 0; i < storedTokens.length; i++) {
           $scope.tokenObjs.push(new Token(storedTokens[i].contractAddress, '', globalFuncs.stripTags(storedTokens[i].symbol), storedTokens[i].decimal, storedTokens[i].type));
       }
   };
   $scope.setTokens();
   $scope.getWalletInfo = function () {
       if (ethFuncs.validateEtherAddress($scope.tx.from)) {
           ajaxReq.getTransactionData($scope.tx.from, function (data) {
               if (data.error) throw data.msg;
               data = data.data;
               $scope.gasPriceDec = ethFuncs.hexToDecimal(ethFuncs.sanitizeHex(ethFuncs.addTinyMoreToGas(data.gasprice)));
               $scope.nonceDec = ethFuncs.hexToDecimal(data.nonce);
               $scope.showWalletInfo = true;
           });
       }
   };
   $scope.$watch('tx', function () {
       $scope.showRaw = false;
   }, true);
   $scope.$watch('tokenTx.id', function () {
       if ($scope.tokenTx.id != 'ether') {
           $scope.tx.gasLimit = 150000;
       } else {
           $scope.tx.gasLimit = globalFuncs.defaultTxGasLimit;
       }
   });
   $scope.$watch('[tx.to]', function () {
       // if golem crowdfund address
       if ($scope.tx.to == "0xa74476443119A942dE498590Fe1f2454d7D4aC0d") {
           $scope.setSendMode('ether');
           $scope.dropdownEnabled = false;
           $scope.tx.data = '0xefc81a8c';
           $scope.tx.gasLimit = 70000;
       } else {
           $scope.dropdownEnabled = true;
       }
   }, true);
   $scope.setSendMode = function (index) {
       var tokensymbol = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '';

       $scope.tokenTx.id = index;
       if (index == 'ether') {
           $scope.unitReadable = ajaxReq.type;
       } else {
           $scope.unitReadable = tokensymbol;
       }
       $scope.dropdownAmount = false;
   };
   $scope.validateAddress = function (address, status) {
       $scope.customGasMsg = '';
       if (ethFuncs.validateEtherAddress(address)) {
           for (var i in CustomGasMessages) {
               if ($scope.tx.to.toLowerCase() == CustomGasMessages[i].to.toLowerCase()) {
                   $scope.customGasMsg = CustomGasMessages[i].msg != '' ? CustomGasMessages[i].msg : '';
               }
           }
           return true;
       } else {
           return false;
       }
   };
   $scope.generateTx = function () {
       if (!ethFuncs.validateEtherAddress($scope.tx.to)) {
           $scope.notifier.danger(globalFuncs.errorMsgs[5]);
           return;
       }
       var txData = uiFuncs.getTxData($scope);
       txData.isOffline = true;
       txData.nonce = ethFuncs.sanitizeHex(ethFuncs.decimalToHex($scope.nonceDec));
       txData.gasPrice = ethFuncs.sanitizeHex(ethFuncs.decimalToHex($scope.gasPriceDec));
       if ($scope.tokenTx.id != 'ether') {
           txData.data = $scope.tokenObjs[$scope.tokenTx.id].getData($scope.tx.to, $scope.tx.value).data;
           txData.to = $scope.tokenObjs[$scope.tokenTx.id].getContractAddress();
           txData.value = '0x00';
       }
       uiFuncs.generateTx(txData, function (rawTx) {
           if (!rawTx.isError) {
               $scope.rawTx = rawTx.rawTx;
               $scope.signedTx = rawTx.signedTx;
               $scope.showRaw = true;
           } else {
               $scope.showRaw = false;
               $scope.notifier.danger(rawTx.error);
           }
           if (!$scope.$$phase) $scope.$apply();
       });
   };
   $scope.confirmSendTx = function () {
       try {
           if ($scope.signedTx == "" || !ethFuncs.validateHexString($scope.signedTx)) throw globalFuncs.errorMsgs[12];
           var eTx = new ethUtil.Tx($scope.signedTx);
           if (eTx.data.length && Token.transferHex == ethFuncs.sanitizeHex(eTx.data.toString('hex').substr(0, 8))) {
               var token = Token.getTokenByAddress(ethFuncs.sanitizeHex(eTx.to.toString('hex')));
               var decoded = ethUtil.solidityCoder.decodeParams(["address", "uint256"], ethFuncs.sanitizeHex(eTx.data.toString('hex').substr(10)));
               $scope.tx.sendMode = 'token';
               $scope.tokenTx.value = decoded[1].div(new BigNumber(10).pow(token.decimal)).toString();
               $scope.tokenTx.to = decoded[0];
               $scope.unitReadable = token.symbol;
               $scope.tokenTx.from = ethFuncs.sanitizeHex(eTx.getSenderAddress().toString('hex'));
           } else {
               $scope.tx.sendMode = 'ether';
               $scope.tx.value = eTx.value.length ? etherUnits.toEther(ethFuncs.sanitizeHex(eTx.value.toString('hex')), 'wei') : 0;
               $scope.unitReadable = ajaxReq.type;
               $scope.tx.from = ethFuncs.sanitizeHex(eTx.getSenderAddress().toString('hex'));
               $scope.tx.to = ethFuncs.sanitizeHex(eTx.to.toString('hex'));
           }
           new Modal(document.getElementById('sendTransactionOffline')).open();
       } catch (e) {
           $scope.notifier.danger(e);
       }
   };
   $scope.sendTx = function () {
       new Modal(document.getElementById('sendTransactionOffline')).close();
       ajaxReq.sendRawTx($scope.signedTx, function (data) {
           if (data.error) {
               $scope.notifier.danger(data.msg);
           } else {
               $scope.notifier.success(globalFuncs.successMsgs[2] + "<a href='http://etherscan.io/tx/" + data.data + "' target='_blank' rel='noopener'>" + data.data + "</a>");
           }
       });
   };
};
module.exports = offlineTxCtrl;
*/

function 25
//25 function
// var onboardingCtrl = function onboardingCtrl($scope, globalService, $translate, $sce) {
//
//   $scope.onboardModal = document.getElementById('onboardingModal') ? new Modal(document.getElementById('onboardingModal')) : null;
//
//   $scope.onboardMsg = false; // a msg that displays on the modal if the user hasn't completed onboarding
//   $scope.onboardStatus = 1; // set the status to slide 1 for local storage later
//   $scope.showOnboardSlide = 1; // show slide 1
//
//   // if there is onboardStatus in localStorage....
//   if (globalFuncs.localStorage.getItem("onboardStatus", null) != null) {
//
//     // get the slide number from localStorage
//     $scope.onboardStatus = parseInt(globalFuncs.localStorage.getItem("onboardStatus"));
//
//     // if they've seen a few slides...
//     if ($scope.onboardStatus > 0 && $scope.onboardStatus < 10) {
//       $scope.showOnboardSlide = $scope.onboardStatus; // set the slide to the last slide they viewed
//       $scope.onboardMsg = true; // show a msg explaining they need to finish it
//       $scope.onboardModal.open(); // show the modal
//       //console.log( $scope.onboardStatus )
//     }
//
//     // otherwise, show the modal (starts at slide 1 by default, above)
//   } else {
//     $scope.onboardModal.open();
//   }
//
//   // whenever a user clicks a button on the modal...
//   $scope.setOnboardStatus = function (slideNum) {
//     $scope.showOnboardSlide = slideNum; // show the slide indicated
//     globalFuncs.localStorage.setItem("onboardStatus", JSON.stringify(slideNum)); // save number to localStorage for later
//     //console.log( "setOnboardStatus " + slideNum )
//   };
//
//   $scope.setOnboardStatus($scope.onboardStatus);
// };
// module.exports = onboardingCtrl;

function 23
/** 23 function
var helpersCtrl = function helpersCtrl($scope) {
   var ENS = new ens();

   var unitNames = ['wei', 'kwei', 'mwei', 'gwei', 'szabo', 'finney', 'ether', 'kether', 'mether', 'gether', 'tether'];

   $scope.units = {
       ether: 1
   };

   $scope.decimalNumber = 10;
   $scope.inputText = 'hello';

   $scope.convertUnit = function (currentUnit) {
       unitNames.forEach(function (unit) {
           if (currentUnit !== unit) {
               $scope.units[unit] = $scope.units[currentUnit] ? etherUnits.unitToUnit($scope.units[currentUnit], currentUnit, unit) : '';
           }
       });
   };

   $scope.decimalToHex = function () {
       $scope.hexNumber = $scope.decimalNumber ? ethFuncs.decimalToHex($scope.decimalNumber) : '';
       $scope.hexToPaddedHex();
   };

   $scope.hexToDecimal = function () {
       $scope.decimalNumber = $scope.hexNumber ? ethFuncs.hexToDecimal($scope.hexNumber) : '';
       $scope.hexToPaddedHex();
   };

   $scope.hexToPaddedHex = function () {
       $scope.hexPaddedLeft = $scope.hexNumber ? ethFuncs.padLeft($scope.hexNumber, 64, '0') : '';
   };

   $scope.toSHA3 = function () {
       $scope.outputText = $scope.inputText ? ethUtil.sha3($scope.inputText).toString('hex') : '';
   };

   /* ENS STUFF */
   /*
   $scope.toEnsLabelHash = function () {
       $scope.ensLabelHash = $scope.ensLabel ? ENS.getSHA3($scope.ensLabel) : '';
       $scope.allTheThings();
   };

   $scope.toEnsSecretHash = function () {
       $scope.ensSecretHash = $scope.ensSecret ? ENS.getSHA3($scope.ensSecret.trim()) : '';
       $scope.allTheThings();
   };

   $scope.toBidWei = function () {
       $scope.bidWei = $scope.bidEth ? Number(etherUnits.toWei($scope.bidEth, 'ether')) : '';
       $scope.toBidHex();
   };

   $scope.toBidEth = function () {
       $scope.bidEth = $scope.bidWei ? Number(etherUnits.toEther($scope.bidWei, 'wei')) : '';
       $scope.toBidHex();
   };

   $scope.toBidHex = function () {
       $scope.bidHex = $scope.bidWei ? ethFuncs.padLeft(ethFuncs.decimalToHex($scope.bidWei), 64, '0') : '';
       $scope.allTheThings();
   };

   $scope.allTheThings = function () {
       $scope.getStartAuctionData();
       $scope.getShaBid();
       $scope.getRevealBidData();
       $scope.getFinalizeAuctionData();
   };

   $scope.getStartAuctionData = function () {
       $scope.startAuctionData = $scope.ensLabel ? ENS.getStartAuctionData($scope.ensLabel) : '';
   };

   $scope.getShaBid = function () {
       if ($scope.ensLabelHash && $scope.ensAddress && $scope.bidWei && $scope.ensSecretHash) {
           ENS.shaBid($scope.ensLabelHash, $scope.ensAddress.toLowerCase(), $scope.bidWei, $scope.ensSecretHash, function (data) {
               $scope.shaBid = ENS.getNewBidData(data.data);
           });
       } else {
           $scope.shaBid = '';
       }
   };

   $scope.getRevealBidData = function () {
       if ($scope.ensLabel && $scope.bidWei && $scope.ensSecret) {
           $scope.revealBidData = ENS.getRevealBidData($scope.ensLabel, $scope.bidWei, $scope.ensSecret);
       } else {
           $scope.revealBidData = '';
       }
   };

   $scope.getFinalizeAuctionData = function () {
       $scope.finalizeAuctionData = $scope.ensLabel ? ENS.getFinalizeAuctionData($scope.ensLabel) : '';
   };

   $scope.findMyPrivateKey = function () {
       var setCharAt = function setCharAt(str, index, chr) {
           if (index > str.length - 1) return str;
           return str.substr(0, index) + chr + str.substr(index + 1);
       };
       var basePrivateKey = $scope.mistypedPK;
       var targetPublicAddress = $scope.mistypedAddr;
       basePrivateKey = basePrivateKey.substring(0, 2) == '0x' ? basePrivateKey.substring(2) : basePrivateKey;
       var characters = ['a', 'b', 'c', 'd', 'e', 'f', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
       var isFound = false;
       for (var keyPosition = 0; keyPosition < basePrivateKey.length; keyPosition++) {
           for (var character = 0; character < characters.length; character++) {
               var privateKeyGuess = setCharAt(basePrivateKey, keyPosition, characters[character]);
               var wallet = Wallet.fromPrivateKey(privateKeyGuess);
               var publicAddress = wallet.getAddressString();
               if (publicAddress.toLowerCase() == targetPublicAddress.toLowerCase()) {
                   $scope.actualPK = privateKeyGuess;
                   isFound = true;
               }
           }
       }
       if (!isFound) $scope.actualPK = "Sorry not found :(";
   };

   $scope.convertUnit('ether');
   $scope.decimalToHex();
   $scope.toSHA3();
};

module.exports = helpersCtrl;
*/
/*

0x7cB57B5A97eAbe94205C07890BE4c1aD31E486A8
mewtopia
0.01
exact depend exhibit

START AUCTION
0xede8acdb07aa9c7e03a795d250a2ac48bd73b9c7f8adab69a549cebd97fc157a093a5a4a

NEW BID
0xce92dced69faf18dd0953d9124d7917234b0efc05c78fd0d9abfc6ffb32d512680fdbb65

UNSEAL
0x47872b4207aa9c7e03a795d250a2ac48bd73b9c7f8adab69a549cebd97fc157a093a5a4a000000000000000000000000000000000000000000000000002386f26fc1000000d70f3b7e512382c3b5e27dd15df51c68c0a18528a604792ff20890eec20a31

FINALIZE
0x983b94fb07aa9c7e03a795d250a2ac48bd73b9c7f8adab69a549cebd97fc157a093a5a4a

*/

function 27
/* 27 function 
(function (Buffer){
'use strict';

var signMsgCtrl = function signMsgCtrl($scope, $sce, walletService) {
   walletService.wallet = null;
   $scope.visibility = "signView";
   $scope.$watch(function () {
       if (walletService.wallet == null) return null;
       return walletService.wallet.getAddressString();
   }, function () {
       if (walletService.wallet == null) return;
       $scope.wallet = walletService.wallet;
   });
   $scope.signMsg = {
       message: '',
       status: '',
       signedMsg: ''
   };
   $scope.verifyMsg = {
       signedMsg: '',
       status: ''
   };

   $scope.generateSignedMsg = function () {
       try {
           var thisMessage = $scope.signMsg.message;
           var hwType = $scope.wallet.getHWType();

           // Sign via MetaMask
           if (typeof hwType != "undefined" && hwType == "web3") {

               var msg = ethUtil.bufferToHex(new Buffer(thisMessage, 'utf8'));
               var signingAddr = web3.eth.accounts[0];
               var params = [msg, signingAddr];
               var method = 'personal_sign';
               $scope.notifier.info("Sent message for signing via MetaMask / Mist.");

               web3.currentProvider.sendAsync({
                   method: method,
                   params: params,
                   signingAddr: signingAddr
               }, function (err, result) {
                   if (err) return $scope.notifier.danger(err);
                   if (result.error) return $scope.notifier.danger(result.error);
                   $scope.signMsg.signedMsg = JSON.stringify({
                       address: signingAddr,
                       msg: thisMessage,
                       sig: result.result,
                       version: '2'
                   }, null, 2);
                   $scope.notifier.success('Successfully Signed Message with ' + signingAddr);
               });

               // Sign via Ledger
           } else if (typeof hwType != "undefined" && hwType == "ledger") {
               var msg = Buffer.from(thisMessage).toString("hex");
               var app = new ledgerEth($scope.wallet.getHWTransport());
               var localCallback = function localCallback(signed, error) {
                   if (typeof error != "undefined") {
                       error = error.errorCode ? u2f.getErrorByCode(error.errorCode) : error;
                       if (callback !== undefined) callback({
                           isError: true,
                           error: error
                       });
                       return;
                   }
                   var combined = signed['r'] + signed['s'] + signed['v'];
                   var combinedHex = combined.toString('hex');
                   var signingAddr = $scope.wallet.getAddressString();
                   $scope.signMsg.signedMsg = JSON.stringify({
                       address: $scope.wallet.getAddressString(),
                       msg: thisMessage,
                       sig: '0x' + combinedHex,
                       version: '2'
                   }, null, 2);
                   $scope.notifier.success('Successfully Signed Message with ' + signingAddr);
               };
               app.signPersonalMessage_async($scope.wallet.getPath(), msg, localCallback);

               // Sign via Digital Bitbox
           } else if (typeof hwType != "undefined" && hwType == "digitalBitbox") {
               var msg = ethUtil.hashPersonalMessage(ethUtil.toBuffer(thisMessage));
               var localCallback = function localCallback(signed, error) {
                   if (typeof error != "undefined") {
                       error = error.errorCode ? u2f.getErrorByCode(error.errorCode) : error;
                       $scope.notifier.danger(error);
                       return;
                   }
                   var combined = signed['r'] + signed['s'] + signed['v'];
                   var combinedHex = combined.toString('hex');
                   var signingAddr = $scope.wallet.getAddressString();
                   $scope.signMsg.signedMsg = JSON.stringify({
                       address: $scope.wallet.getAddressString(),
                       msg: thisMessage,
                       sig: '0x' + combinedHex,
                       version: '2'
                   }, null, 2);
                   $scope.notifier.success('Successfully Signed Message with ' + signingAddr);
               };
               $scope.notifier.info("Touch the LED for 3 seconds to sign the message. Or tap the LED to cancel.");
               var app = new DigitalBitboxEth($scope.wallet.getHWTransport(), '');
               app.signMessage($scope.wallet.getPath(), msg, localCallback);

               // Sign via trezor
           } else if (typeof hwType != "undefined" && hwType == "trezor") {
               TrezorConnect.ethereumSignMessage($scope.wallet.getPath(), thisMessage, function (response) {
                   if (response.success) {
                       $scope.signMsg.signedMsg = JSON.stringify({
                           address: '0x' + response.address,
                           msg: thisMessage,
                           sig: '0x' + response.signature,
                           version: '2'
                       }, null, 2);
                       $scope.notifier.success('Successfully Signed Message with ' + $scope.wallet.getAddressString());
                   } else {
                       $scope.notifier.danger(response.error);
                   }
               });

               // Sign via PK
           } else {
               var msg = ethUtil.hashPersonalMessage(ethUtil.toBuffer(thisMessage));
               var signed = ethUtil.ecsign(msg, $scope.wallet.getPrivateKey());
               //console.log(signed.r)
               //console.log(signed.s)
               //console.log([signed.v])
               var combined = Buffer.concat([Buffer.from(signed.r), Buffer.from(signed.s), Buffer.from([signed.v])]);
               var combinedHex = combined.toString('hex');
               var signingAddr = $scope.wallet.getAddressString();
               $scope.signMsg.signedMsg = JSON.stringify({
                   address: $scope.wallet.getAddressString(),
                   msg: thisMessage,
                   sig: '0x' + combinedHex,
                   version: '2'
               }, null, 2);
               $scope.notifier.success('Successfully Signed Message with ' + signingAddr);
           }
       } catch (e) {
           $scope.notifier.danger(e);
       }
   };

   $scope.verifySignedMessage = function () {
       var hwType = $scope.wallet.getHWType();
       // Verify via trezor
       if (typeof hwType != "undefined" && hwType == "trezor") {
           var json = JSON.parse($scope.verifyMsg.signedMsg);
           var address = ethFuncs.getNakedAddress(json.address);
           var sig = ethFuncs.getNakedAddress(json.sig);
           var message = json.msg;
           TrezorConnect.ethereumVerifyMessage(address, sig, message, function (response) {
               if (response.success) {
                   $scope.notifier.success(globalFuncs.successMsgs[6]);
                   $scope.verifiedMsg = {
                       address: json.address,
                       msg: json.msg,
                       sig: json.sig,
                       version: json.version
                   };
               } else {
                   $scope.notifier.danger(response.error);
               }
           });
           return;
       }

       try {

           var json = JSON.parse($scope.verifyMsg.signedMsg);
           var sig = new Buffer(ethFuncs.getNakedAddress(json.sig), 'hex');
           if (sig.length != 65) throw globalFuncs.errorMsgs[12];
           sig[64] = sig[64] == 0 || sig[64] == 1 ? sig[64] + 27 : sig[64];
           var hash = json.version == '2' ? ethUtil.hashPersonalMessage(ethUtil.toBuffer(json.msg)) : ethUtil.sha3(json.msg);
           var pubKey = ethUtil.ecrecover(hash, sig[64], sig.slice(0, 32), sig.slice(32, 64));
           if (ethFuncs.getNakedAddress(json.address) != ethUtil.pubToAddress(pubKey).toString('hex')) throw globalFuncs.errorMsgs[12];else {
               $scope.notifier.success(globalFuncs.successMsgs[6]);
               $scope.verifiedMsg = {
                   address: json.address,
                   msg: json.msg,
                   sig: json.sig,
                   version: json.version
               };
           }
       } catch (e) {
           $scope.notifier.danger(e);
       }
   };

   $scope.setVisibility = function (str) {
       $scope.visibility = str;
   };
};
module.exports = signMsgCtrl;
}).call(this,require("buffer").Buffer)
*/

/*
var swapCtrl = function swapCtrl($scope, $sce, walletService) {
   var lStorageKey = "swapOrder";
   $scope.ajaxReq = ajaxReq;
   $scope.showedMinMaxError = false;
   $scope.Validator = Validator;
   $scope.bity = new bity();
   $scope.bity.refreshRates(function () {
       $scope.setOrderCoin(true, "ETH");
   });
   setInterval(function () {
       $scope.bity.refreshRates();
   }, 30000);
   $scope.priceTicker = { ETHBTC: 1, ETHREP: 1, BTCREP: 1, BTCETH: 1, REPBTC: 1, REPETH: 1 };
   $scope.availableCoins = ["ETH", "BTC", "REP"];
   var initValues = function initValues() {
       $scope.showStage1 = true;
       $scope.showStage2 = $scope.showStage3Eth = $scope.showStage3Btc = false;
       $scope.orderResult = null;
       $scope.swapOrder = {
           fromCoin: "ETH",
           toCoin: "BTC",
           isFrom: true,
           fromVal: '',
           toVal: '',
           toAddress: '',
           swapRate: '',
           swapPair: ''
       };
   };
   $scope.verifyMinMaxValues = function () {
       if ($scope.swapOrder.toVal == '' || $scope.swapOrder.fromVal == '' || $scope.swapOrder.toVal == '0' || $scope.swapOrder.fromVal == '0' || $scope.showedMinMaxError) return false;
       var errors = {
           priceNotLoaded: 0,
           lessThanMin: 1,
           greaterThanMax: 2,
           noErrors: 3
       };
       var verify = function verify() {
           if (!$scope.bity.priceLoaded) return errors.priceNotLoaded;else if ($scope.swapOrder.toVal < bity.min || $scope.swapOrder.fromVal < bity.min) return errors.lessThanMin;else if ($scope.swapOrder.toCoin == "BTC" && $scope.swapOrder.toVal > bity.max || $scope.swapOrder.fromCoin == "BTC" && $scope.swapOrder.fromVal > bity.max) return errors.greaterThanMax;else if ($scope.swapOrder.toCoin == "ETH" && $scope.swapOrder.toVal * $scope.bity.curRate['ETHBTC'] > bity.max || $scope.swapOrder.fromCoin == "ETH" && $scope.swapOrder.fromVal * $scope.bity.curRate['ETHBTC'] > bity.max) return errors.greaterThanMax;else if ($scope.swapOrder.toCoin == "REP" && $scope.swapOrder.toVal * $scope.bity.curRate['REPBTC'] > bity.max || $scope.swapOrder.fromCoin == "REP" && $scope.swapOrder.fromVal * $scope.bity.curRate['REPBTC'] > bity.max) return errors.greaterThanMax;
           return errors.noErrors;
       };
       var vResult = verify();
       if (vResult == errors.noErrors) return true;else if (vResult == errors.priceNotLoaded) return false;else if (vResult == errors.lessThanMin || vResult == errors.greaterThanMax) {
           if (!isStorageOrderExists()) {
               uiFuncs.notifier.danger(globalFuncs.errorMsgs[27] + bity.max + " BTC, " + (bity.max / $scope.bity.curRate['ETHBTC']).toFixed(3) + " ETH, or " + (bity.max / $scope.bity.curRate['REPBTC']).toFixed(3) + " REP", 2500);
               $scope.showedMinMaxError = true;
           }
           return false;
       }
   };
   $scope.setOrderCoin = function (isFrom, coin) {
       if (isFrom) $scope.swapOrder.fromCoin = coin;else $scope.swapOrder.toCoin = coin;
       if ($scope.swapOrder.fromCoin == $scope.swapOrder.toCoin) for (var i in $scope.availableCoins) {
           if ($scope.availableCoins[i] != $scope.swapOrder.fromCoin) {
               $scope.swapOrder.toCoin = $scope.availableCoins[i];
               break;
           }
       }$scope.swapOrder.swapRate = $scope.bity.curRate[$scope.swapOrder.fromCoin + $scope.swapOrder.toCoin];
       $scope.swapOrder.swapPair = $scope.swapOrder.fromCoin + "/" + $scope.swapOrder.toCoin;
       $scope.updateEstimate(isFrom);
       $scope.dropdownFrom = $scope.dropdownTo = false;
   };
   $scope.updateEstimate = function (isFrom) {
       if (isFrom) $scope.swapOrder.toVal = parseFloat(($scope.bity.curRate[$scope.swapOrder.fromCoin + $scope.swapOrder.toCoin] * $scope.swapOrder.fromVal).toFixed(bity.decimals));else $scope.swapOrder.fromVal = parseFloat(($scope.swapOrder.toVal / $scope.bity.curRate[$scope.swapOrder.fromCoin + $scope.swapOrder.toCoin]).toFixed(bity.decimals));
       $scope.swapOrder.isFrom = isFrom;
   };
   $scope.setFinalPrices = function () {
       $scope.showedMinMaxError = false;
       try {

           if (!$scope.Validator.isPositiveNumber($scope.swapOrder.fromVal) || !$scope.Validator.isPositiveNumber($scope.swapOrder.toVal)) throw globalFuncs.errorMsgs[0];else if (!$scope.verifyMinMaxValues()) throw globalFuncs.errorMsgs[27];
           $scope.updateEstimate($scope.swapOrder.isFrom);
           $scope.showStage1 = false;
           $scope.showStage2 = true;
       } catch (e) {
           $scope.notifier.danger(e);
       }
   };
   var getProgressBarArr = function getProgressBarArr(index, len) {
       var tempArr = [];
       for (var i = 0; i < len; i++) {
           if (i < index) tempArr.push('progress-true');else if (i == index) tempArr.push('progress-active');else tempArr.push('');
       }
       return tempArr;
   };
   var isStorageOrderExists = function isStorageOrderExists() {
       var order = globalFuncs.localStorage.getItem(lStorageKey, null);
       return order && $scope.Validator.isJSON(order);
   };
   var setOrderFromStorage = function setOrderFromStorage() {
       var order = JSON.parse(globalFuncs.localStorage.getItem(lStorageKey, null));
       $scope.orderResult = order;
       $scope.swapOrder = order.swapOrder;
       processOrder();
   };
   var saveOrderToStorage = function saveOrderToStorage(order) {
       globalFuncs.localStorage.setItem(lStorageKey, JSON.stringify(order));
   };
   var processOrder = function processOrder() {
       var orderResult = $scope.orderResult;
       orderResult.progress = {
           status: "OPEN",
           bar: getProgressBarArr(1, 5),
           showTimeRem: true,
           timeRemaining: '10:00',
           secsRemaining: orderResult.validFor - parseInt((new Date().getTime() - new Date(orderResult.timestamp_created).getTime()) / 1000),
           pendingStatusReq: false,
           checkDelay: 1000
       };
       var timeRem = setInterval(function () {
           if (!orderResult) clearInterval(timeRem);
           if (orderResult.progress.secsRemaining > 0) {
               if (orderResult.progress.status == "OPEN") orderResult.progress.secsRemaining--;else orderResult.progress.secsRemaining++;
               var minutes = Math.floor(orderResult.progress.secsRemaining / 60);
               var seconds = orderResult.progress.secsRemaining - minutes * 60;
               minutes = minutes < 10 ? '0' + minutes : minutes;
               seconds = seconds < 10 ? '0' + seconds : seconds;
               orderResult.progress.timeRemaining = minutes + ':' + seconds;
               if (!$scope.$$phase) $scope.$apply();
           } else {
               orderResult.progress.timeRemaining = "00:00";
               clearInterval(timeRem);
           }
       }, 1000);
       var progressCheck = setInterval(function () {
           if (!orderResult) clearInterval(progressCheck);
           if (!orderResult.progress.pendingStatusReq) {
               orderResult.progress.pendingStatusReq = true;
               $scope.bity.getStatus({ orderid: orderResult.id }, function (data) {
                   if (data.error) $scope.notifier.danger(data.msg);else {
                       data = data.data;
                       if (bity.validStatus.indexOf(data.status) != -1) orderResult.progress.status = "RCVE";
                       if (orderResult.progress.status == "OPEN" && bity.validStatus.indexOf(data.input.status) != -1) {
                           orderResult.progress.secsRemaining = 1;
                           orderResult.progress.showTimeRem = false;
                           orderResult.progress.status = "RCVE";
                           orderResult.progress.bar = getProgressBarArr(3, 5);
                       } else if (orderResult.progress.status == "RCVE" && bity.validStatus.indexOf(data.output.status) != -1) {

                           orderResult.progress.status = "FILL";
                           orderResult.progress.bar = getProgressBarArr(5, 5);
                           orderResult.progress.showTimeRem = false;
                           var url = orderResult.output.currency == 'BTC' ? bity.btcExplorer.replace("[[txHash]]", data.output.reference) : bity.ethExplorer.replace("[[txHash]]", data.output.reference);
                           var bExStr = "<a href='" + url + "' target='_blank' rel='noopener'> View your transaction </a>";
                           $scope.notifier.success(globalFuncs.successMsgs[2] + data.output.reference + "<br />" + bExStr);
                           clearInterval(progressCheck);
                           clearInterval(timeRem);
                       } else if (bity.invalidStatus.indexOf(data.status) != -1) {
                           orderResult.progress.status = "CANC";
                           orderResult.progress.bar = getProgressBarArr(-1, 5);
                           $scope.notifier.danger("Time has run out. If you have already sent, please wait 1 hour. If your order has not be processed after 1 hour, please press the orange 'Issue with your Swap?' button.");
                           orderResult.progress.secsRemaining = 0;
                           clearInterval(progressCheck);
                       }
                       if (!$scope.$$phase) $scope.$apply();
                   }
                   orderResult.progress.pendingStatusReq = false;
               });
           }
       }, orderResult.progress.checkDelay);
       $scope.showStage2 = false;
       if ($scope.orderResult.input.currency == 'BTC') $scope.showStage3Btc = true;else {
           $scope.parentTxConfig = {
               to: ethUtil.toChecksumAddress($scope.orderResult.payment_address),
               value: $scope.orderResult.input.amount,
               sendMode: $scope.orderResult.input.currency == 'ETH' ? 'ether' : 'token',
               tokensymbol: $scope.orderResult.input.currency == 'ETH' ? '' : $scope.orderResult.input.currency,
               readOnly: true
           };
           new Modal(document.getElementById('sendTransaction'));
           $scope.showStage3Eth = true;
       }
   };
   $scope.openOrder = function () {

       if ($scope.swapOrder.toCoin != 'BTC' && $scope.Validator.isValidAddress($scope.swapOrder.toAddress) || $scope.swapOrder.toCoin == 'BTC' && $scope.Validator.isValidBTCAddress($scope.swapOrder.toAddress)) {
           var order = {
               amount: $scope.swapOrder.isFrom ? $scope.swapOrder.fromVal : $scope.swapOrder.toVal,
               mode: $scope.swapOrder.isFrom ? 0 : 1,
               pair: $scope.swapOrder.fromCoin + $scope.swapOrder.toCoin,
               destAddress: $scope.swapOrder.toAddress
           };
           $scope.bity.openOrder(order, function (data) {
               if (!data.error) {
                   $scope.orderResult = data.data;
                   $scope.orderResult.swapOrder = $scope.swapOrder;
                   var orderResult = $scope.orderResult;
                   saveOrderToStorage(orderResult);
                   processOrder();
               } else $scope.notifier.danger(data.msg);
               if (!$scope.$$phase) $scope.$apply();
           });
       } else {
           $scope.notifier.danger(globalFuncs.errorMsgs[5]);
       }
   };
   $scope.newSwap = function () {
       globalFuncs.localStorage.setItem(lStorageKey, '');
       initValues();
   };
   initValues();
   if (isStorageOrderExists()) {
       $scope.showStage1 = false;
       setOrderFromStorage();
   }
};
module.exports = swapCtrl;
*/
function 42
/* 42 function
var cxWalletDecryptDrtv = function cxWalletDecryptDrtv() {
 return {
   restrict: "E",
   template: '<div class="row" ng-controller=\'cxDecryptWalletCtrl\'>\n \
     <div class="col-md-4 col-sm-6">\n \
       <h4 translate="decrypt_Select"> Select a Wallet: </h4>\n \
       <div class="radio" ng-repeat="twallet in allWallets  track by $index">\n \
         <label><input type="radio" name="selectedWallet" ng-model="$parent.selectedWallet" value="{{twallet.addr}}"> {{twallet.nick}} <small>({{twallet.balance}} Ether)</small> </label>\n \
       </div>\n \
     </div>\n \
     <div class="col-md-4 col-sm-6" ng-show="selectedWallet!=\'\'">\n \
       <h4 translate="ADD_Label_3"> Your wallet is encrypted. Please enter the password: </h4>\n \
       <input class="form-control" type="password" placeholder="{{ \'x_Password\' | translate }}" ng-model="password" ng-keyup="$event.keyCode == 13 && decryptWallet()" >\n \
     </div>\n \
     <div class="col-md-4 col-sm-6" id="walletuploadbutton" ng-show="password.length>0">\n \
       <h4 id="uploadbtntxt-wallet" translate="ADD_Label_6"> Unlock Your Wallet:</h4>\n \
       <div class="form-group"><a ng-click="decryptWallet()" class="btn btn-primary btn-block" translate="ADD_Label_6_short">UNLOCK</a></div>\n \
     </div>\n \
   </div>'
 };
};
module.exports = cxWalletDecryptDrtv;
*/

function 46
/** 46 function
var ens = require('./ens');
var domainsaleInterface = require('./domainsaleConfigs/domainsaleABI.json');

var domainsale = function domainsale() {
   var _this = this;
   this.domainsaleABI = {};
   for (var i in domainsaleInterface) {
       this.domainsaleABI[domainsaleInterface[i].name] = domainsaleInterface[i];
   }switch (ajaxReq.type) {
       case nodes.nodeTypes.ETH:
           _this.setContractAddress('0xc67247454E720328714C4e17bEC7640572657bEE');
           break;
       case nodes.nodeTypes.Rinkeby:
           _this.setContractAddress('0x00');
           break;
       case nodes.nodeTypes.Ropsten:
           _this.setContractAddress('0xe8E98228Ca36591952Efdf6F645C5B229E6Cf688');
           break;
       default:
           _this.setContractAddress('0x00');
   }
};

domainsale.prototype.setContractAddress = function (_address) {
   this.contractAddress = _address;
};
domainsale.prototype.getContractAddress = function () {
   return this.contractAddress;
};
domainsale.prototype.getSale = function (name, callback) {
   var _this = this;
   name = ens.normalise(name);
   var funcABI = _this.domainsaleABI.sale;
   ajaxReq.getEthCall({ to: _this.getContractAddress(), data: _this.getDataString(funcABI, [name]) }, function (data) {
       if (data.error) callback(data);else {
           var outTypes = funcABI.outputs.map(function (i) {
               return i.type;
           });
           var res = ethUtil.solidityCoder.decodeParams(outTypes, data.data.replace('0x', ''));

           data.data = {
               price: res[0],
               priceEth: Number(etherUnits.toEther(res[0].toString(), 'wei')),
               reserve: res[1],
               reserveEth: Number(etherUnits.toEther(res[1].toString(), 'wei')),
               lastBid: res[2],
               lastBidEth: Number(etherUnits.toEther(res[2].toString(), 'wei')),
               lastBidder: res[3],
               auctionStarted: new Date(res[4].toNumber() * 1000),
               auctionEnds: new Date(res[5].toNumber() * 1000)
           };
           callback(data);
       }
   });
};
domainsale.prototype.getMinimumBid = function (name, callback) {
   var _this = this;
   name = ens.normalise(name);
   var funcABI = _this.domainsaleABI.minimumBid;
   ajaxReq.getEthCall({ to: _this.getContractAddress(), data: _this.getDataString(funcABI, [name]) }, function (data) {
       if (data.error) callback(data);else {
           var outTypes = funcABI.outputs.map(function (i) {
               return i.type;
           });
           var res = ethUtil.solidityCoder.decodeParams(outTypes, data.data.replace('0x', ''));

           data.data = {
               minimumBid: res[0],
               minimumBidEth: Number(etherUnits.toEther(res[0].toString(), 'wei'))
           };
           callback(data);
       }
   });
};
domainsale.prototype.getBalance = function (address, callback) {
   var _this = this;
   var funcABI = _this.domainsaleABI.balance;
   ajaxReq.getEthCall({ to: _this.getContractAddress(), data: _this.getDataString(funcABI, [address]) }, function (data) {
       if (data.error) callback(data);else {
           var outTypes = funcABI.outputs.map(function (i) {
               return i.type;
           });
           var res = ethUtil.solidityCoder.decodeParams(outTypes, data.data.replace('0x', ''));

           data.data = {
               balance: res[0],
               balanceEth: Number(etherUnits.toEther(res[0].toString(), 'wei'))
           };
           callback(data);
       }
   });
};

domainsale.prototype.getOfferData = function (name, price, reserve, referrer) {
   var _this = this;
   name = ens.normalise(name);
   var funcABI = _this.domainsaleABI.offer;
   return _this.getDataString(funcABI, [name, price, reserve, referrer]);
};

domainsale.prototype.getBuyData = function (name, referrer) {
   var _this = this;
   name = ens.normalise(name);
   var funcABI = _this.domainsaleABI.buy;
   return _this.getDataString(funcABI, [name, referrer]);
};

domainsale.prototype.getCancelData = function (name) {
   var _this = this;
   name = ens.normalise(name);
   var funcABI = _this.domainsaleABI.cancel;
   return _this.getDataString(funcABI, [name]);
};

domainsale.prototype.getBidData = function (name, referrer) {
   var _this = this;
   name = ens.normalise(name);
   var funcABI = _this.domainsaleABI.bid;
   return _this.getDataString(funcABI, [name, referrer]);
};

domainsale.prototype.getFinishData = function (name) {
   var _this = this;
   name = ens.normalise(name);
   var funcABI = _this.domainsaleABI.finish;
   return _this.getDataString(funcABI, [name]);
};

domainsale.prototype.getWithdrawData = function () {
   var _this = this;
   var funcABI = _this.domainsaleABI.withdraw;
   return _this.getDataString(funcABI, []);
};

domainsale.prototype.getDataString = function (func, inputs) {
   var fullFuncName = ethUtil.solidityUtils.transformToFullName(func);
   var funcSig = ethFuncs.getFunctionSignature(fullFuncName);
   var typeName = ethUtil.solidityUtils.extractTypeName(fullFuncName);
   var types = typeName.split(',');
   types = types[0] == "" ? [] : types;
   return '0x' + funcSig + ethUtil.solidityCoder.encodeParams(types, inputs);
};
domainsale.modes = {
   ineligible: 0,
   nottransferred: 1,
   notoffered: 2,
   available: 3,
   auctioning: 4,
   closed: 5
};
domainsale.transactions = {
   transfer: 1,
   offer: 2,
   buy: 3,
   bid: 4,
   cancel: 5,
   withdraw: 6
};
module.exports = domainsale;
**/
function 47
/* 47 function
module.exports=[
 {
   "constant": true,
   "inputs": [
     {
       "name": "_name",
       "type": "string"
     }
   ],
   "name": "sale",
   "outputs": [
     {
       "name": "",
       "type": "uint256"
     },
     {
       "name": "",
       "type": "uint256"
     },
     {
       "name": "",
       "type": "uint256"
     },
     {
       "name": "",
       "type": "address"
     },
     {
       "name": "",
       "type": "uint256"
     },
     {
       "name": "",
       "type": "uint256"
     }
   ],
   "payable": false,
   "stateMutability": "view",
   "type": "function"
 },
 {
   "constant": false,
   "inputs": [
     {
       "name": "_name",
       "type": "string"
     }
   ],
   "name": "invalidate",
   "outputs": [],
   "payable": false,
   "stateMutability": "nonpayable",
   "type": "function"
 },
 {
   "constant": false,
   "inputs": [
     {
       "name": "_name",
       "type": "string"
     }
   ],
   "name": "cancel",
   "outputs": [],
   "payable": false,
   "stateMutability": "nonpayable",
   "type": "function"
 },
 {
   "constant": true,
   "inputs": [],
   "name": "registrar",
   "outputs": [
     {
       "name": "",
       "type": "address"
     }
   ],
   "payable": false,
   "stateMutability": "view",
   "type": "function"
 },
 {
   "constant": true,
   "inputs": [
     {
       "name": "_name",
       "type": "string"
     }
   ],
   "name": "auctionStarted",
   "outputs": [
     {
       "name": "",
       "type": "bool"
     }
   ],
   "payable": false,
   "stateMutability": "view",
   "type": "function"
 },
 {
   "constant": false,
   "inputs": [
     {
       "name": "_name",
       "type": "string"
     }
   ],
   "name": "finish",
   "outputs": [],
   "payable": false,
   "stateMutability": "nonpayable",
   "type": "function"
 },
 {
   "constant": false,
   "inputs": [],
   "name": "withdraw",
   "outputs": [],
   "payable": false,
   "stateMutability": "nonpayable",
   "type": "function"
 },
 {
   "constant": true,
   "inputs": [
     {
       "name": "_name",
       "type": "string"
     }
   ],
   "name": "minimumBid",
   "outputs": [
     {
       "name": "",
       "type": "uint256"
     }
   ],
   "payable": false,
   "stateMutability": "view",
   "type": "function"
 },
 {
   "constant": false,
   "inputs": [
     {
       "name": "_name",
       "type": "string"
     },
     {
       "name": "bidReferrer",
       "type": "address"
     }
   ],
   "name": "bid",
   "outputs": [],
   "payable": true,
   "stateMutability": "payable",
   "type": "function"
 },
 {
   "constant": true,
   "inputs": [
     {
       "name": "_name",
       "type": "string"
     }
   ],
   "name": "auctionEnds",
   "outputs": [
     {
       "name": "",
       "type": "uint256"
     }
   ],
   "payable": false,
   "stateMutability": "view",
   "type": "function"
 },
 {
   "constant": true,
   "inputs": [
     {
       "name": "_name",
       "type": "string"
     }
   ],
   "name": "isBuyable",
   "outputs": [
     {
       "name": "",
       "type": "bool"
     }
   ],
   "payable": false,
   "stateMutability": "view",
   "type": "function"
 },
 {
   "constant": true,
   "inputs": [
     {
       "name": "_name",
       "type": "string"
     }
   ],
   "name": "isAuction",
   "outputs": [
     {
       "name": "",
       "type": "bool"
     }
   ],
   "payable": false,
   "stateMutability": "view",
   "type": "function"
 },
 {
   "constant": false,
   "inputs": [
     {
       "name": "_name",
       "type": "string"
     },
     {
       "name": "_price",
       "type": "uint256"
     },
     {
       "name": "reserve",
       "type": "uint256"
     },
     {
       "name": "referrer",
       "type": "address"
     }
   ],
   "name": "offer",
   "outputs": [],
   "payable": false,
   "stateMutability": "nonpayable",
   "type": "function"
 },
 {
   "constant": false,
   "inputs": [
     {
       "name": "_name",
       "type": "string"
     },
     {
       "name": "bidReferrer",
       "type": "address"
     }
   ],
   "name": "buy",
   "outputs": [],
   "payable": true,
   "stateMutability": "payable",
   "type": "function"
 },
 {
   "constant": true,
   "inputs": [
     {
       "name": "addr",
       "type": "address"
     }
   ],
   "name": "balance",
   "outputs": [
     {
       "name": "",
       "type": "uint256"
     }
   ],
   "payable": false,
   "stateMutability": "view",
   "type": "function"
 },
 {
   "constant": true,
   "inputs": [
     {
       "name": "_name",
       "type": "string"
     }
   ],
   "name": "price",
   "outputs": [
     {
       "name": "",
       "type": "uint256"
     }
   ],
   "payable": false,
   "stateMutability": "view",
   "type": "function"
 },
 {
   "inputs": [
     {
       "name": "_registry",
       "type": "address"
     }
   ],
   "payable": false,
   "stateMutability": "nonpayable",
   "type": "constructor"
 },
 {
   "anonymous": false,
   "inputs": [
     {
       "indexed": true,
       "name": "seller",
       "type": "address"
     },
     {
       "indexed": false,
       "name": "name",
       "type": "string"
     },
     {
       "indexed": false,
       "name": "price",
       "type": "uint256"
     },
     {
       "indexed": false,
       "name": "reserve",
       "type": "uint256"
     }
   ],
   "name": "Offer",
   "type": "event"
 },
 {
   "anonymous": false,
   "inputs": [
     {
       "indexed": true,
       "name": "bidder",
       "type": "address"
     },
     {
       "indexed": false,
       "name": "name",
       "type": "string"
     },
     {
       "indexed": false,
       "name": "bid",
       "type": "uint256"
     }
   ],
   "name": "Bid",
   "type": "event"
 },
 {
   "anonymous": false,
   "inputs": [
     {
       "indexed": true,
       "name": "seller",
       "type": "address"
     },
     {
       "indexed": true,
       "name": "buyer",
       "type": "address"
     },
     {
       "indexed": false,
       "name": "name",
       "type": "string"
     },
     {
       "indexed": false,
       "name": "value",
       "type": "uint256"
     }
   ],
   "name": "Transfer",
   "type": "event"
 },
 {
   "anonymous": false,
   "inputs": [
     {
       "indexed": false,
       "name": "name",
       "type": "string"
     }
   ],
   "name": "Cancel",
   "type": "event"
 },
 {
   "anonymous": false,
   "inputs": [
     {
       "indexed": true,
       "name": "recipient",
       "type": "address"
     },
     {
       "indexed": false,
       "name": "amount",
       "type": "uint256"
     }
   ],
   "name": "Withdraw",
   "type": "event"
 }
]
*/

function 48
/** function 48
(function (Buffer){
var uts46 = require('idna-uts46');
var registryInterface = require('./ensConfigs/registryABI.json');
var resolverInterface = require('./ensConfigs/resolverABI.json');
var auctionInterface = require('./ensConfigs/auctionABI.json');
var deedInterface = require('./ensConfigs/deedABI.json');
var ens = function ens() {
   var _this = this;
   this.registryABI = {};
   for (var i in registryInterface) {
       this.registryABI[registryInterface[i].name] = registryInterface[i];
   }this.resolverABI = {};
   for (var i in resolverInterface) {
       this.resolverABI[resolverInterface[i].name] = resolverInterface[i];
   }this.auctionABI = {};
   for (var i in auctionInterface) {
       this.auctionABI[auctionInterface[i].name] = auctionInterface[i];
   }this.deedABI = {};
   for (var i in deedInterface) {
       this.deedABI[deedInterface[i].name] = deedInterface[i];
   }switch (ajaxReq.type) {
       case nodes.nodeTypes.ETH:
           _this.setCurrentRegistry(ens.registry.ETH);
           break;
       case nodes.nodeTypes.Rinkeby:
           _this.setCurrentRegistry(ens.registry.Rinkeby);
           break;
       case nodes.nodeTypes.Ropsten:
           _this.setCurrentRegistry(ens.registry.ROPSTEN);
           break;
       default:
           _this.setCurrentRegistry(ens.registry.NULL);
   }
};
ens.registry = {
   ETH: require('./ensConfigs/ETHConfig.json'),
   Rinkeby: require('./ensConfigs/RinkebyConfig.json'),
   ROPSTEN: require('./ensConfigs/ROPConfig.json'),
   NULL: {}
};
ens.normalise = function (name) {
   try {
       return uts46.toUnicode(name, { useStd3ASCII: true, transitional: false });
   } catch (e) {
       throw e;
   }
};
ens.modes = {
   open: 0,
   auction: 1,
   owned: 2,
   forbidden: 3,
   reveal: 4,
   notAvailable: 5
};
ens.prototype.setCurrentRegistry = function (_registry) {
   this.curRegistry = _registry;
};
ens.prototype.getRegistryAddress = function () {
   return this.curRegistry.registry;
};

function namehash(name) {
   name = ens.normalise(name);
   var node = Buffer.alloc(32);
   if (name && name != '') {
       var labels = name.split(".");
       for (var i = labels.length - 1; i >= 0; i--) {
           node = ethUtil.sha3(Buffer.concat([node, ethUtil.sha3(labels[i])]));
       }
   }
   return '0x' + node.toString('hex');
}

function subnodehash(name) {
   name = ens.normalise(name);
   return '0x' + ethUtil.sha3(name).toString('hex');
}
ens.getNameHash = function (name) {
   return namehash(name);
};
ens.getSubNodeHash = function (name) {
   return subnodehash(name);
};
ens.prototype.getOwnerResolverAddress = function (funcABI, to, name, callback) {
   var _this = this;
   ajaxReq.getEthCall({ to: to, data: _this.getDataString(funcABI, [namehash(name)]) }, function (data) {
       if (data.error) callback(data);else {
           var outTypes = funcABI.outputs.map(function (i) {
               return i.type;
           });
           data.data = ethUtil.solidityCoder.decodeParams(outTypes, data.data.replace('0x', ''))[0];
           callback(data);
       }
   });
};
ens.prototype.getDeedOwner = function (to, callback) {
   this.getOwnerResolverAddress(this.deedABI.owner, to, '', callback);
};
ens.prototype.getDeedPreviousOwner = function (to, callback) {
   this.getOwnerResolverAddress(this.deedABI.previousOwner, to, '', callback);
};
ens.prototype.getOwner = function (name, callback) {
   this.getOwnerResolverAddress(this.registryABI.owner, this.getRegistryAddress(), name, callback);
};
ens.prototype.getResolver = function (name, callback) {
   this.getOwnerResolverAddress(this.registryABI.resolver, this.getRegistryAddress(), name, callback);
};
ens.prototype.getAddress = function (name, callback) {
   var _this = this;
   _this.getResolver(name, function (data) {
       if (data.error) callback(data);else {
           _this.getOwnerResolverAddress(_this.resolverABI.addr, data.data, name, callback);
       }
   });
};
ens.prototype.getName = function (name, callback) {
   var _this = this;
   name = ens.normalise(name);
   _this.getResolver(name, function (data) {
       if (data.error || data.data == '0x') callback(data);else {
           ajaxReq.getEthCall({ to: data.data, data: _this.getDataString(_this.resolverABI.name, [namehash(name)]) }, function (data) {
               if (data.error || data.data == '0x') callback(data);else {
                   var outTypes = _this.resolverABI.name.outputs.map(function (i) {
                       return i.type;
                   });
                   data.data = ethUtil.solidityCoder.decodeParams(outTypes, data.data.replace('0x', ''))[0];
                   callback(data);
               }
           });
       }
   });
};
ens.prototype.resolveAddressByName = function (name, callback) {
   var _this = this;
   name = ens.normalise(name);
   _this.getOwner(name, function (data) {
       if (data.error || data.data == '0x') callback(data);else {
           var owner = data.data;
           _this.getName(name, function (data) {
               if (data.error || data.data == '0x') {
                   callback({ data: owner, error: false });
               } else {
                   callback({ data: data.data, error: false });
               }
           });
       }
   });
};
ens.prototype.getAuctionAddress = function () {
   return this.curRegistry.public.ethAuction;
};
ens.prototype.getStartAuctionData = function (name) {
   var _this = this;
   name = _this.getSHA3(ens.normalise(name));
   var funcABI = _this.auctionABI.startAuction;
   return _this.getDataString(funcABI, [name]);
};
ens.prototype.getStartAndBidAuctionData = function (name, sealedHash) {
   var _this = this;
   name = _this.getSHA3(ens.normalise(name));
   var funcABI = _this.auctionABI.startAuctionsAndBid;
   return _this.getDataString(funcABI, [[name], sealedHash]);
};
ens.prototype.getFinalizeAuctionData = function (name) {
   var _this = this;
   name = _this.getSHA3(ens.normalise(name));
   var funcABI = _this.auctionABI.finalizeAuction;
   return _this.getDataString(funcABI, [name]);
};
var isSecretHashed = function isSecretHashed(secret) {
   return secret.substring(0, 2) == '0x' && secret.length == 66 && Validator.isValidHex(secret);
};
ens.prototype.getRevealBidData = function (name, value, secret) {
   var _this = this;
   name = _this.getSHA3(ens.normalise(name));
   secret = isSecretHashed(secret) ? secret : _this.getSHA3(secret);
   var funcABI = _this.auctionABI.unsealBid;
   return _this.getDataString(funcABI, [name, value, secret]);
};
ens.prototype.getSHA3 = function (str) {
   return '0x' + ethUtil.sha3(str).toString('hex');
};
ens.prototype.getNewBidData = function (sealedHash) {
   var _this = this;
   var funcABI = _this.auctionABI.newBid;
   return _this.getDataString(funcABI, [sealedHash]);
};
ens.prototype.getAuctionEntries = function (name, callback) {
   var _this = this;
   name = _this.getSHA3(ens.normalise(name));
   var funcABI = _this.auctionABI.entries;
   ajaxReq.getEthCall({ to: _this.curRegistry.public.ethAuction, data: _this.getDataString(funcABI, [name]) }, function (data) {
       if (data.error) callback(data);else {
           var outTypes = funcABI.outputs.map(function (i) {
               return i.type;
           });
           var res = ethUtil.solidityCoder.decodeParams(outTypes, data.data.replace('0x', ''));
           data.data = {
               status: res[0].toNumber(),
               deed: res[1],
               registrationDate: new Date(res[2].toNumber() * 1000),
               value: res[3],
               highestBid: res[4]
           };
           callback(data);
       }
   });
};
ens.prototype.shaBid = function (hash, owner, value, saltHash, callback) {
   var _this = this;
   var funcABI = _this.auctionABI.shaBid;
   ajaxReq.getEthCall({ to: _this.curRegistry.public.ethAuction, data: _this.getDataString(funcABI, [hash, owner, value, saltHash]) }, function (data) {
       if (data.error) callback(data);else {
           var outTypes = funcABI.outputs.map(function (i) {
               return i.type;
           });
           data.data = ethUtil.solidityCoder.decodeParams(outTypes, data.data.replace('0x', ''))[0];
           callback(data);
       }
   });
};
ens.prototype.getAllowedTime = function (name, callback) {
   var _this = this;
   var funcABI = _this.auctionABI.getAllowedTime;
   name = _this.getSHA3(ens.normalise(name));
   ajaxReq.getEthCall({ to: _this.curRegistry.public.ethAuction, data: _this.getDataString(funcABI, [name]) }, function (data) {
       if (data.error) callback(data);else {
           var outTypes = funcABI.outputs.map(function (i) {
               return i.type;
           });
           data.data = new Date(ethUtil.solidityCoder.decodeParams(outTypes, data.data.replace('0x', ''))[0] * 1000);
           callback(data);
       }
   });
};
ens.prototype.getTransferData = function (name, owner) {
   var _this = this;
   //    name = namehash(ens.normalise(name));
   name = _this.getSHA3(ens.normalise(name));
   var funcABI = _this.auctionABI.transfer;
   return _this.getDataString(funcABI, [name, owner]);
};
ens.prototype.getSetOwnerData = function (name, owner) {
   var _this = this;
   name = namehash(ens.normalise(name));
   var funcABI = _this.registryABI.setOwner;
   return _this.getDataString(funcABI, [name, owner]);
};
ens.prototype.getDataString = function (func, inputs) {
   var fullFuncName = ethUtil.solidityUtils.transformToFullName(func);
   var funcSig = ethFuncs.getFunctionSignature(fullFuncName);
   var typeName = ethUtil.solidityUtils.extractTypeName(fullFuncName);
   var types = typeName.split(',');
   types = types[0] == "" ? [] : types;
   return '0x' + funcSig + ethUtil.solidityCoder.encodeParams(types, inputs);
};
module.exports = ens;
}).call(this,require("buffer").Buffer)
**/
function 49
 /**
from 49 to 55 function
eth something is there which is in my knowledge it is not useful
but it is used in myetherwallet.com
in swap menu bar there is some option of eth
so for now we are going to comment it
  **/
/*
module.exports={
   "public": {
       "resolver": "0x5FfC014343cd971B7eb70732021E26C35B744cc4",
       "reverse": "0x9062c0a6dbd6108336bcbe4593a3d1ce05512069",
       "ethAuction": "0x6090a6e47849629b7245dfa1ca21d94cd15878ef",
   },
   "registry": "0x314159265dD8dbb310642f98f50C066173C1259b"
}
*/

function 63
/*
var http;
var ethPrice = function ethPrice() {};
var getValue = function getValue(arr, pair) {
   for (var i in arr) {
       if (arr[i].pair == pair) return arr[i].rate;
   }
};
var BITYRATEAPI = "https://bity.com/api/v1/rate2/";
var CCRATEAPI = "https://min-api.cryptocompare.com/data/price?fsym=ETH&tsyms=USD,EUR,GBP,BTC,CHF,REP";
ethPrice.getETHvalue = function (callback) {
   ajaxReq.http.get(CCRATEAPI).then(function (data) {
       data = data['data'];
       var priceObj = {
           usd: parseFloat(data['USD']).toFixed(6),
           eur: parseFloat(data['EUR']).toFixed(6),
           btc: parseFloat(data['BTC']).toFixed(6),
           chf: parseFloat(data['CHF']).toFixed(6),
           rep: parseFloat(data['REP']).toFixed(6),
           gbp: parseFloat(data['GBP']).toFixed(6)
       };
       callback(priceObj);
   });
};
ethPrice.getRates = function (callback) {
   ajaxReq.http.get(BITYRATEAPI).then(function (data) {
       callback(data['data']['objects']);
   });
};
module.exports = ethPrice;
*/

function 64
/*
var etherscan = function etherscan() {};
etherscan.SERVERURL = "localhost:3000";
etherscan.pendingPosts = [];
etherscan.config = {
   headers: {
       'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
   }
};

etherscan.getCurrentBlock = function (callback) {
   this.post({
       module: 'proxy',
       action: 'eth_blockNumber'
   }, function (data) {
       if (data.error) callback({ error: true, msg: data.error.message, data: '' });else callback({ error: false, msg: '', data: new BigNumber(data.result).toString() });
   });
};
etherscan.getBalance = function (addr, callback) {
   this.post({
       module: 'account',
       action: 'balance',
       address: addr,
       tag: 'latest'
   }, function (data) {
       if (data.message != 'OK') callback({ error: true, msg: data.message, data: '' });else callback({ error: false, msg: '', data: { address: addr, balance: data.result } });
   });
};
etherscan.getTransaction = function (txHash, callback) {
   this.post({
       module: 'proxy',
       action: 'eth_getTransactionByHash',
       txhash: txHash
   }, function (data) {
       if (data.error) callback({ error: true, msg: data.error.message, data: '' });else callback({ error: false, msg: '', data: data.result });
   });
};
etherscan.getTransactionData = function (addr, callback) {
   var response = { error: false, msg: '', data: { address: addr, balance: '', gasprice: '', nonce: '' } };
   var parentObj = this;
   parentObj.getBalance(addr, function (data) {
       if (data.error) {
           callback({ error: true, msg: data.msg, data: '' });
           return;
       }
       response.data.balance = data.data.balance;
       parentObj.post({
           module: 'proxy',
           action: 'eth_gasPrice'
       }, function (data) {
           if (data.error) {
               callback({ error: true, msg: data.error.message, data: '' });
               return;
           }
           response.data.gasprice = data.result;
           parentObj.post({
               module: 'proxy',
               address: addr,
               action: 'eth_getTransactionCount',
               tag: 'latest'
           }, function (data) {
               if (data.error) {
                   callback({ error: true, msg: data.error.message, data: '' });
                   return;
               }
               response.data.nonce = data.result;
               callback(response);
           });
       });
   });
};
etherscan.sendRawTx = function (rawTx, callback) {
   this.post({
       module: 'proxy',
       action: 'eth_sendRawTransaction',
       hex: rawTx
   }, function (data) {
       if (data.error) callback({ error: true, msg: data.error.message, data: '' });else callback({ error: false, msg: '', data: data.result });
   });
};
etherscan.getEstimatedGas = function (txobj, callback) {
   this.post({
       module: 'proxy',
       action: 'eth_estimateGas',
       to: txobj.to,
       value: txobj.value,
       data: txobj.data,
       from: txobj.from
   }, function (data) {
       if (data.error) callback({ error: true, msg: data.error.message, data: '' });else callback({ error: false, msg: '', data: data.result });
   });
};
etherscan.getEthCall = function (txobj, callback) {
   this.post({
       module: 'proxy',
       action: 'eth_call',
       to: txobj.to,
       data: txobj.data
   }, function (data) {
       if (data.error) callback({ error: true, msg: data.error.message, data: '' });else callback({ error: false, msg: '', data: data.result });
   });
};
etherscan.queuePost = function () {
   var data = this.pendingPosts[0].data;
   var callback = this.pendingPosts[0].callback;
   var parentObj = this;
   data.apikey = 'DSH5B24BQYKD1AD8KUCDY3SAQSS6ZAU175';
   ajaxReq.http.post(this.SERVERURL, ajaxReq.postSerializer(data), this.config).then(function (data) {
       callback(data.data);
       parentObj.pendingPosts.splice(0, 1);
       if (parentObj.pendingPosts.length > 0) parentObj.queuePost();
   }, function (data) {
       callback({ error: true, msg: "connection error", data: "" });
   });
};
etherscan.post = function (data, _callback) {
   this.pendingPosts.push({
       data: data,
       callback: function callback(_data) {
           _callback(_data);
       }
   });
   if (this.pendingPosts.length == 1) this.queuePost();
};
module.exports = etherscan;
*/
function 50
/*
module.exports={
   "public": {
       "resolver": "0x4c641fb9bad9b60ef180c31f56051ce826d21a9a",
       "reverse": "0xdb6cead81ce14a63c284728eed17738a81327ff0",
       "ethAuction": "0xc19fd9004b5c9789391679de6d766b981db94610"
   },
   "registry": "0x112234455c3a32fd11230c42e7bccd4a84e02010"
}
*/

function 51
/*
module.exports={
   "public": {
       "resolver": "0xb14fdee4391732ea9d2267054ead2084684c0ad8",
       "reverse": "0x0000000000000000000000000000000000000000",
       "ethAuction": "0x0000000000000000000000000000000000000000"
   },
   "registry": "0xe7410170f87102df0055eb195163a03b7f2bff4a"
}
*/

function 52
/*
module.exports=[{
   "constant": false,
   "inputs": [{
       "name": "_hash",
       "type": "bytes32"
   }],
   "name": "releaseDeed",
   "outputs": [],
   "payable": false,
   "type": "function"
}, {
   "constant": true,
   "inputs": [{
       "name": "_hash",
       "type": "bytes32"
   }],
   "name": "getAllowedTime",
   "outputs": [{
       "name": "timestamp",
       "type": "uint256"
   }],
   "payable": false,
   "type": "function"
}, {
   "constant": false,
   "inputs": [{
       "name": "unhashedName",
       "type": "string"
   }],
   "name": "invalidateName",
   "outputs": [],
   "payable": false,
   "type": "function"
}, {
   "constant": true,
   "inputs": [{
       "name": "hash",
       "type": "bytes32"
   }, {
       "name": "owner",
       "type": "address"
   }, {
       "name": "value",
       "type": "uint256"
   }, {
       "name": "salt",
       "type": "bytes32"
   }],
   "name": "shaBid",
   "outputs": [{
       "name": "sealedBid",
       "type": "bytes32"
   }],
   "payable": false,
   "type": "function"
}, {
   "constant": false,
   "inputs": [{
       "name": "bidder",
       "type": "address"
   }, {
       "name": "seal",
       "type": "bytes32"
   }],
   "name": "cancelBid",
   "outputs": [],
   "payable": false,
   "type": "function"
}, {
   "constant": true,
   "inputs": [{
       "name": "_hash",
       "type": "bytes32"
   }],
   "name": "entries",
   "outputs": [{
       "name": "",
       "type": "uint8"
   }, {
       "name": "",
       "type": "address"
   }, {
       "name": "",
       "type": "uint256"
   }, {
       "name": "",
       "type": "uint256"
   }, {
       "name": "",
       "type": "uint256"
   }],
   "payable": false,
   "type": "function"
}, {
   "constant": true,
   "inputs": [],
   "name": "ens",
   "outputs": [{
       "name": "",
       "type": "address"
   }],
   "payable": false,
   "type": "function"
}, {
   "constant": false,
   "inputs": [{
       "name": "_hash",
       "type": "bytes32"
   }, {
       "name": "_value",
       "type": "uint256"
   }, {
       "name": "_salt",
       "type": "bytes32"
   }],
   "name": "unsealBid",
   "outputs": [],
   "payable": false,
   "type": "function"
}, {
   "constant": false,
   "inputs": [{
       "name": "_hash",
       "type": "bytes32"
   }],
   "name": "transferRegistrars",
   "outputs": [],
   "payable": false,
   "type": "function"
}, {
   "constant": true,
   "inputs": [{
       "name": "",
       "type": "address"
   }, {
       "name": "",
       "type": "bytes32"
   }],
   "name": "sealedBids",
   "outputs": [{
       "name": "",
       "type": "address"
   }],
   "payable": false,
   "type": "function"
}, {
   "constant": true,
   "inputs": [{
       "name": "_hash",
       "type": "bytes32"
   }],
   "name": "state",
   "outputs": [{
       "name": "",
       "type": "uint8"
   }],
   "payable": false,
   "type": "function"
}, {
   "constant": false,
   "inputs": [{
       "name": "_hash",
       "type": "bytes32"
   }, {
       "name": "newOwner",
       "type": "address"
   }],
   "name": "transfer",
   "outputs": [],
   "payable": false,
   "type": "function"
}, {
   "constant": true,
   "inputs": [{
       "name": "_hash",
       "type": "bytes32"
   }, {
       "name": "_timestamp",
       "type": "uint256"
   }],
   "name": "isAllowed",
   "outputs": [{
       "name": "allowed",
       "type": "bool"
   }],
   "payable": false,
   "type": "function"
}, {
   "constant": false,
   "inputs": [{
       "name": "_hash",
       "type": "bytes32"
   }],
   "name": "finalizeAuction",
   "outputs": [],
   "payable": false,
   "type": "function"
}, {
   "constant": true,
   "inputs": [],
   "name": "registryStarted",
   "outputs": [{
       "name": "",
       "type": "uint256"
   }],
   "payable": false,
   "type": "function"
}, {
   "constant": true,
   "inputs": [],
   "name": "launchLength",
   "outputs": [{
       "name": "",
       "type": "uint32"
   }],
   "payable": false,
   "type": "function"
}, {
   "constant": false,
   "inputs": [{
       "name": "sealedBid",
       "type": "bytes32"
   }],
   "name": "newBid",
   "outputs": [],
   "payable": true,
   "type": "function"
}, {
   "constant": false,
   "inputs": [{
       "name": "labels",
       "type": "bytes32[]"
   }],
   "name": "eraseNode",
   "outputs": [],
   "payable": false,
   "type": "function"
}, {
   "constant": false,
   "inputs": [{
       "name": "_hashes",
       "type": "bytes32[]"
   }],
   "name": "startAuctions",
   "outputs": [],
   "payable": false,
   "type": "function"
}, {
   "constant": false,
   "inputs": [{
       "name": "hash",
       "type": "bytes32"
   }, {
       "name": "deed",
       "type": "address"
   }, {
       "name": "registrationDate",
       "type": "uint256"
   }],
   "name": "acceptRegistrarTransfer",
   "outputs": [],
   "payable": false,
   "type": "function"
}, {
   "constant": false,
   "inputs": [{
       "name": "_hash",
       "type": "bytes32"
   }],
   "name": "startAuction",
   "outputs": [],
   "payable": false,
   "type": "function"
}, {
   "constant": true,
   "inputs": [],
   "name": "rootNode",
   "outputs": [{
       "name": "",
       "type": "bytes32"
   }],
   "payable": false,
   "type": "function"
}, {
   "constant": false,
   "inputs": [{
       "name": "hashes",
       "type": "bytes32[]"
   }, {
       "name": "sealedBid",
       "type": "bytes32"
   }],
   "name": "startAuctionsAndBid",
   "outputs": [],
   "payable": true,
   "type": "function"
}, {
   "inputs": [{
       "name": "_ens",
       "type": "address"
   }, {
       "name": "_rootNode",
       "type": "bytes32"
   }, {
       "name": "_startDate",
       "type": "uint256"
   }],
   "payable": false,
   "type": "constructor"
}, {
   "anonymous": false,
   "inputs": [{
       "indexed": true,
       "name": "hash",
       "type": "bytes32"
   }, {
       "indexed": false,
       "name": "registrationDate",
       "type": "uint256"
   }],
   "name": "AuctionStarted",
   "type": "event"
}, {
   "anonymous": false,
   "inputs": [{
       "indexed": true,
       "name": "hash",
       "type": "bytes32"
   }, {
       "indexed": true,
       "name": "bidder",
       "type": "address"
   }, {
       "indexed": false,
       "name": "deposit",
       "type": "uint256"
   }],
   "name": "NewBid",
   "type": "event"
}, {
   "anonymous": false,
   "inputs": [{
       "indexed": true,
       "name": "hash",
       "type": "bytes32"
   }, {
       "indexed": true,
       "name": "owner",
       "type": "address"
   }, {
       "indexed": false,
       "name": "value",
       "type": "uint256"
   }, {
       "indexed": false,
       "name": "status",
       "type": "uint8"
   }],
   "name": "BidRevealed",
   "type": "event"
}, {
   "anonymous": false,
   "inputs": [{
       "indexed": true,
       "name": "hash",
       "type": "bytes32"
   }, {
       "indexed": true,
       "name": "owner",
       "type": "address"
   }, {
       "indexed": false,
       "name": "value",
       "type": "uint256"
   }, {
       "indexed": false,
       "name": "registrationDate",
       "type": "uint256"
   }],
   "name": "HashRegistered",
   "type": "event"
}, {
   "anonymous": false,
   "inputs": [{
       "indexed": true,
       "name": "hash",
       "type": "bytes32"
   }, {
       "indexed": false,
       "name": "value",
       "type": "uint256"
   }],
   "name": "HashReleased",
   "type": "event"
}, {
   "anonymous": false,
   "inputs": [{
       "indexed": true,
       "name": "hash",
       "type": "bytes32"
   }, {
       "indexed": true,
       "name": "name",
       "type": "string"
   }, {
       "indexed": false,
       "name": "value",
       "type": "uint256"
   }, {
       "indexed": false,
       "name": "registrationDate",
       "type": "uint256"
   }],
   "name": "HashInvalidated",
   "type": "event"
}]
*/

function 53
/*
module.exports=[{
   "constant": true,
   "inputs": [],
   "name": "creationDate",
   "outputs": [{
       "name": "",
       "type": "uint256"
   }],
   "payable": false,
   "type": "function"
}, {
   "constant": false,
   "inputs": [],
   "name": "destroyDeed",
   "outputs": [],
   "payable": false,
   "type": "function"
}, {
   "constant": false,
   "inputs": [{
       "name": "newOwner",
       "type": "address"
   }],
   "name": "setOwner",
   "outputs": [],
   "payable": false,
   "type": "function"
}, {
   "constant": true,
   "inputs": [],
   "name": "registrar",
   "outputs": [{
       "name": "",
       "type": "address"
   }],
   "payable": false,
   "type": "function"
}, {
   "constant": true,
   "inputs": [],
   "name": "owner",
   "outputs": [{
       "name": "",
       "type": "address"
   }],
   "payable": false,
   "type": "function"
}, {
   "constant":true,
   "inputs":[],
   "name":"previousOwner",
   "outputs":[{
       "name":"",
       "type":"address"
   }],
   "payable":false,
   "type":"function"
}, {
   "constant": false,
   "inputs": [{
       "name": "refundRatio",
       "type": "uint256"
   }],
   "name": "closeDeed",
   "outputs": [],
   "payable": false,
   "type": "function"
}, {
   "constant": false,
   "inputs": [{
       "name": "newRegistrar",
       "type": "address"
   }],
   "name": "setRegistrar",
   "outputs": [],
   "payable": false,
   "type": "function"
}, {
   "constant": false,
   "inputs": [{
       "name": "newValue",
       "type": "uint256"
   }],
   "name": "setBalance",
   "outputs": [],
   "payable": true,
   "type": "function"
}, {
   "inputs": [],
   "type": "constructor"
}, {
   "payable": true,
   "type": "fallback"
}, {
   "anonymous": false,
   "inputs": [{
       "indexed": false,
       "name": "newOwner",
       "type": "address"
   }],
   "name": "OwnerChanged",
   "type": "event"
}, {
   "anonymous": false,
   "inputs": [],
   "name": "DeedClosed",
   "type": "event"
}]
*/
function 54
/*
module.exports=[{
   "constant": true,
   "inputs": [{
       "name": "node",
       "type": "bytes32"
   }],
   "name": "resolver",
   "outputs": [{
       "name": "",
       "type": "address"
   }],
   "payable": false,
   "type": "function"
}, {
   "constant": true,
   "inputs": [{
       "name": "node",
       "type": "bytes32"
   }],
   "name": "owner",
   "outputs": [{
       "name": "",
       "type": "address"
   }],
   "payable": false,
   "type": "function"
}, {
   "constant": false,
   "inputs": [{
       "name": "node",
       "type": "bytes32"
   }, {
       "name": "label",
       "type": "bytes32"
   }, {
       "name": "owner",
       "type": "address"
   }],
   "name": "setSubnodeOwner",
   "outputs": [],
   "payable": false,
   "type": "function"
}, {
   "constant": false,
   "inputs": [{
       "name": "node",
       "type": "bytes32"
   }, {
       "name": "ttl",
       "type": "uint64"
   }],
   "name": "setTTL",
   "outputs": [],
   "payable": false,
   "type": "function"
}, {
   "constant": true,
   "inputs": [{
       "name": "node",
       "type": "bytes32"
   }],
   "name": "ttl",
   "outputs": [{
       "name": "",
       "type": "uint64"
   }],
   "payable": false,
   "type": "function"
}, {
   "constant": false,
   "inputs": [{
       "name": "node",
       "type": "bytes32"
   }, {
       "name": "resolver",
       "type": "address"
   }],
   "name": "setResolver",
   "outputs": [],
   "payable": false,
   "type": "function"
}, {
   "constant": false,
   "inputs": [{
       "name": "node",
       "type": "bytes32"
   }, {
       "name": "owner",
       "type": "address"
   }],
   "name": "setOwner",
   "outputs": [],
   "payable": false,
   "type": "function"
}, {
   "anonymous": false,
   "inputs": [{
       "indexed": true,
       "name": "node",
       "type": "bytes32"
   }, {
       "indexed": false,
       "name": "owner",
       "type": "address"
   }],
   "name": "Transfer",
   "type": "event"
}, {
   "anonymous": false,
   "inputs": [{
       "indexed": true,
       "name": "node",
       "type": "bytes32"
   }, {
       "indexed": true,
       "name": "label",
       "type": "bytes32"
   }, {
       "indexed": false,
       "name": "owner",
       "type": "address"
   }],
   "name": "NewOwner",
   "type": "event"
}, {
   "anonymous": false,
   "inputs": [{
       "indexed": true,
       "name": "node",
       "type": "bytes32"
   }, {
       "indexed": false,
       "name": "resolver",
       "type": "address"
   }],
   "name": "NewResolver",
   "type": "event"
}, {
   "anonymous": false,
   "inputs": [{
       "indexed": true,
       "name": "node",
       "type": "bytes32"
   }, {
       "indexed": false,
       "name": "ttl",
       "type": "uint64"
   }],
   "name": "NewTTL",
   "type": "event"
}]
*/
function 55
/*
module.exports=[{
   "constant": true,
   "inputs": [{
       "name": "interfaceID",
       "type": "bytes4"
   }],
   "name": "supportsInterface",
   "outputs": [{
       "name": "",
       "type": "bool"
   }],
   "payable": false,
   "type": "function"
}, {
   "constant": true,
   "inputs": [{
       "name": "node",
       "type": "bytes32"
   }],
   "name": "addr",
   "outputs": [{
       "name": "ret",
       "type": "address"
   }],
   "payable": false,
   "type": "function"
}, {
   "constant": true,
   "inputs": [{
       "name": "node",
       "type": "bytes32"
   }, {
       "name": "kind",
       "type": "bytes32"
   }],
   "name": "has",
   "outputs": [{
       "name": "",
       "type": "bool"
   }],
   "payable": false,
   "type": "function"
}, {
   "constant": false,
   "inputs": [{
       "name": "node",
       "type": "bytes32"
   }, {
       "name": "addr",
       "type": "address"
   }],
   "name": "setAddr",
   "outputs": [],
   "payable": false,
   "type": "function"
}, {
   "constant": true,
   "inputs": [{
       "name": "node",
       "type": "bytes32"
   }],
   "name": "content",
   "outputs": [{
       "name": "ret",
       "type": "bytes32"
   }],
   "payable": false,
   "type": "function"
}, {
   "constant": false,
   "inputs": [{
       "name": "node",
       "type": "bytes32"
   }, {
       "name": "hash",
       "type": "bytes32"
   }],
   "name": "setContent",
   "outputs": [],
   "payable": false,
   "type": "function"
}, {
   "inputs": [{
       "name": "ensAddr",
       "type": "address"
   }],
   "type": "constructor"
}, {
   "payable": false,
   "type": "fallback"
}]
*/
function 65
/*
var _ethscan = require('./etherscan');
var kovan = {};
for (var attr in _ethscan) {
   kovan[attr] = _ethscan[attr];
}
kovan.SERVERURL = 'https://kovan.etherscan.io/api';
module.exports = kovan;
*/
function 66
/*
var _ethscan = require('./etherscan');
var rinkeby = {};
for (var attr in _ethscan) {
   rinkeby[attr] = _ethscan[attr];
}
rinkeby.SERVERURL = 'https://rinkeby.etherscan.io/api';
module.exports = rinkeby;
*/
function 95 96 97 98 99 101 103
// },{}],95:[function(require,module,exports){
// module.exports=[
//   {
//     "address":"0x6F6DEb5db0C4994A8283A01D6CFeEB27Fc3bBe9C",
//     "symbol":"Smart",
//     "decimal":0,
//     "type":"default"
//   },{
//     "address":"0x085fb4f24031eaedbc2b611aa528f22343eb52db",
//     "symbol":"BEC",
//     "decimal":8,
//     "type":"default"
//   }
// ]
//
// },{}],96:[function(require,module,exports){
// module.exports=[{
// "address":"0x59416A25628A76b4730eC51486114c32E0B582A1",
// "symbol":"☀ PLASMA",
// "decimal":6,
// "type":"default"
// },{
// "address":"0xAf30D2a7E90d7DC361c8C4585e9BB7D2F6f15bc7",
// "symbol":"1ST",
// "decimal":18,
// "type":"default"
// },{
// "address":"0xfdbc1adc26f0f8f8606a5d63b7d3a3cd21c22b23",
// "symbol":"1WO",
// "decimal":8,
// "type":"default"
// },{
// "address":"0xaEc98A708810414878c3BCDF46Aad31dEd4a4557",
// "symbol":"300",
// "decimal":18,
// "type":"default"
// },{
// "address":"0x13f1b7fdfbe1fc66676d56483e21b1ecb40b58e2",
// "symbol":"ACC",
// "decimal":18,
// "type":"default"
// },{
// "address":"0x422866a8F0b032c5cf1DfBDEf31A20F4509562b0",
// "symbol":"ADST",
// "decimal":0,
// "type":"default"
// },{
// "address":"0xD0D6D6C5Fe4a677D343cC433536BB717bAe167dD",
// "symbol":"ADT",
// "decimal":9,
// "type":"default"
// },{
// "address":"0x4470BB87d77b963A013DB939BE332f927f2b992e",
// "symbol":"ADX",
// "decimal":4,
// "type":"default"
// },{
// "address":"0x27dce1ec4d3f72c3e457cc50354f1f975ddef488",
// "symbol":"AIR",
// "decimal":8,
// "type":"default"
// },{
// "address":"0x1063ce524265d5a3A624f4914acd573dD89ce988",
// "symbol":"AIX",
// "decimal":18,
// "type":"default"
// },{
// "address":"0xEA610B1153477720748DC13ED378003941d84fAB",
// "symbol":"ALIS",
// "decimal":18,
// "type":"default"
// },{
// "address":"0x181a63746d3adcf356cbc73ace22832ffbb1ee5a",
// "symbol":"ALCO",
// "decimal":8,
// "type":"default"
// },{
// "address":"0x638ac149ea8ef9a1286c41b977017aa7359e6cfa",
// "symbol":"ALTS",
// "decimal":18,
// "type":"default"
// },{
// "address":"0x4dc3643dbc642b72c158e7f3d2ff232df61cb6ce",
// "symbol":"AMB",
// "decimal":18,
// "type":"default"
// },{
// "address":"0x949bEd886c739f1A3273629b3320db0C5024c719",
// "symbol":"AMIS",
// "decimal":9,
// "type":"default"
// },{
// "address":"0x960b236A07cf122663c4303350609A66A7B288C0",
// "symbol":"ANT",
// "decimal":18,
// "type":"default"
// },{
// "address":"0x23aE3C5B39B12f0693e05435EeaA1e51d8c61530",
// "symbol":"APT",
// "decimal":18,
// "type":"default"
// },{
// "address":"0xAc709FcB44a43c35F0DA4e3163b117A17F3770f5",
// "symbol":"ARC",
// "decimal":18,
// "type":"default"
// },{
// "address":"0x1245ef80f4d9e02ed9425375e8f649b9221b31d8",
// "symbol":"ARCT",
// "decimal":8,
// "type":"default"
// },{
// "address":"0xBA5F11b16B155792Cf3B2E6880E8706859A8AEB6",
// "symbol":"ARN",
// "decimal":8,
// "type":"default"
// },{
// "address":"0xfec0cF7fE078a500abf15F1284958F22049c2C7e",
// "symbol":"ART",
// "decimal":18,
// "type":"default"
// },{
// "address":"0x7705FaA34B16EB6d77Dfc7812be2367ba6B0248e",
// "symbol":"ARX",
// "decimal":8,
// "type":"default"
// },{
// "address":"0x27054b13b1B798B345b591a4d22e6562d47eA75a",
// "symbol":"AST",
// "decimal":4,
// "type":"default"
// },{
// "address":"0x17052d51E954592C1046320c2371AbaB6C73Ef10",
// "symbol":"ATH",
// "decimal":18,
// "type":"default"
// },{
// "address":"0x78B7FADA55A64dD895D8c8c35779DD8b67fA8a05",
// "symbol":"ATL",
// "decimal":18,
// "type":"default"
// },{
// "address":"0x887834D3b8D450B6bAB109c252Df3DA286d73CE4",
// "symbol":"ATT",
// "decimal":18,
// "type":"default"
// },{
// "address":"0xeD247980396B10169BB1d36f6e278eD16700a60f",
// "symbol":"AVA 🐴",
// "decimal":4,
// "type":"default"
// },{
// "address":"0x0d88ed6e74bbfd96b831231638b66c05571e824f",
// "symbol":"AVT",
// "decimal":18,
// "type":"default"
// },{
// "address":"0x0D8775F648430679A709E98d2b0Cb6250d2887EF",
// "symbol":"BAT",
// "decimal":18,
// "type":"default"
// },{
// "address":"0xbc1234552EBea32B5121190356bBa6D3Bb225bb5",
// "symbol":"BCL",
// "decimal":18,
// "type":"default"
// },{
// "address":"0x1e797Ce986C3CFF4472F7D38d5C4aba55DfEFE40",
// "symbol":"BCDN",
// "decimal":15,
// "type":"default"
// },{
// "address":"0xAcfa209Fb73bF3Dd5bBfb1101B9Bc999C49062a5",
// "symbol":"BCDT",
// "decimal":18,
// "type":"default"
// },{
// "address":"0x1c4481750daa5Ff521A2a7490d9981eD46465Dbd",
// "symbol":"BCPT",
// "decimal":18,
// "type":"default"
// },{
// "address":"0x74C1E4b8caE59269ec1D85D3D4F324396048F4ac",
// "symbol":"BeerCoin 🍺 ",
// "decimal":0,
// "type":"default"
// },{
// "address":"0x8aA33A7899FCC8eA5fBe6A608A109c3893A1B8b2",
// "symbol":"BET",
// "decimal":18,
// "type":"default"
// },{
// "address":"0xb2bfeb70b903f1baac7f2ba2c62934c7e5b974c4",
// "symbol":"BKB",
// "decimal":8,
// "type":"default"
// },{
// "address":"0xce59d29b09aae565feeef8e52f47c3cd5368c663",
// "symbol":"BLX? Bullion Crypto",
// "decimal":18,
// "type":"default"
// },{
// "address":"0xE5a7c12972f3bbFe70ed29521C8949b8Af6a0970",
// "symbol":"BLX? Iconomi",
// "decimal":18,
// "type":"default"
// },{
// "address":"0xdf6ef343350780bf8c3410bf062e0c015b1dd671",
// "symbol":"BMC",
// "decimal":8,
// "type":"default"
// },{
// "address":"0xf028adee51533b1b47beaa890feb54a457f51e89",
// "symbol":"BMT",
// "decimal":18,
// "type":"default"
// },{
// "address":"0xb8c77482e45f1f44de1745f52c74426c631bdd52",
// "symbol":"BNB",
// "decimal":18,
// "type":"default"
// },{
// "address":"0xdD6Bf56CA2ada24c683FAC50E37783e55B57AF9F",
// "symbol":"BNC",
// "decimal":12,
// "type":"default"
// },{
// "address":"0x1F573D6Fb3F13d689FF844B4cE37794d79a7FF1C",
// "symbol":"BNT",
// "decimal":18,
// "type":"default"
// },{
// "address":"0xCc34366E3842cA1BD36c1f324d15257960fCC801",
// "symbol":"BON",
// "decimal":18,
// "type":"default"
// },{
// "address":"0x7f1e2c7d6a69bf34824d72c53b4550e895c0d8c2",
// "symbol":"BOP",
// "decimal":8,
// "type":"default"
// },{
// "address":"0xC2C63F23ec5E97efbD7565dF9Ec764FDc7d4e91d",
// "symbol":"BOU",
// "decimal":18,
// "type":"default"
// },{
// "address":"0x5Af2Be193a6ABCa9c8817001F45744777Db30756",
// "symbol":"BQX",
// "decimal":8,
// "type":"default"
// },{
// "address":"0x9E77D5a1251b6F7D456722A6eaC6D2d5980bd891",
// "symbol":"BRAT",
// "decimal":8,
// "type":"default"
// },{
// "address":"0xf26ef5e0545384b7dcc0f297f2674189586830df",
// "symbol":"BSDC",
// "decimal":18,
// "type":"default"
// },{
// "address":"0x0886949c1b8C412860c4264Ceb8083d1365e86CF",
// "symbol":"BTCE",
// "decimal":8,
// "type":"default"
// },{
// "address":"0x73dd069c299a5d691e9836243bcaec9c8c1d8734",
// "symbol":"BTE",
// "decimal":8,
// "type":"default"
// },{
// "address":"0xfad572db566e5234ac9fc3d570c4edc0050eaa92",
// "symbol":"BTH",
// "decimal":18,
// "type":"default"
// },{
// "address":"0x2accaB9cb7a48c3E82286F0b2f8798D201F4eC3f",
// "symbol":"BTL (Battle)",
// "decimal":18,
// "type":"default"
// },{
// "address":"0x92685E93956537c25Bb75D5d47fca4266dd628B8",
// "symbol":"BTL (Bitlle)",
// "decimal":4,
// "type":"default"
// },{
// "address":"0xcb97e65f07da24d46bcdd078ebebd7c6e6e3d750",
// "symbol":"BTM",
// "decimal":8,
// "type":"default"
// },{
// "address":"0x26E75307Fc0C021472fEb8F727839531F112f317",
// "symbol":"C20",
// "decimal":18,
// "type":"default"
// },{
// "address":"0x7d4b8Cce0591C9044a22ee543533b72E976E36C3",
// "symbol":"CAG",
// "decimal":18,
// "type":"default"
// },{
// "address":"0x1d462414fe14cf489c7A21CaC78509f4bF8CD7c0",
// "symbol":"CAN",
// "decimal":6,
// "type":"default"
// },{
// "address":"0x423e4322cdda29156b49a17dfbd2acc4b280600d",
// "symbol":"CAR",
// "decimal":9,
// "type":"default"
// },{
// "address":"0x111111f7e9B1Fe072ade438F77E1Ce861C7eE4E3",
// "symbol":"CAT (BitClave)",
// "decimal":18,
// "type":"default"
// },{
// "address":"0x68e14bb5A45B9681327E16E528084B9d962C1a39",
// "symbol":"CATs (BitClave)",
// "decimal":18,
// "type":"default"
// },{
// "address":"0x56ba2Ee7890461f463F7be02aAC3099f6d5811A8",
// "symbol":"CAT (Blockcat)",
// "decimal":18,
// "type":"default"
// },{
// "address":"0xc166038705FFBAb3794185b3a9D925632A1DF37D",
// "symbol":"CC3",
// "decimal":18,
// "type":"default"
// },{
// "address":"0x28577A6d31559bd265Ce3ADB62d0458550F7b8a7",
// "symbol":"CCC",
// "decimal":18,
// "type":"default"
// },{
// "address":"0x8a95ca448A52C0ADf0054bB3402dC5e09CD6B232",
// "symbol":"CDL",
// "decimal":18,
// "type":"default"
// },{
// "address":"0x177d39AC676ED1C67A2b268AD7F1E58826E5B0af",
// "symbol":"CDT",
// "decimal":18,
// "type":"default"
// },{
// "address":"0x6fFF3806Bbac52A20e0d79BC538d527f6a22c96b",
// "symbol":"CDX",
// "decimal":18,
// "type":"default"
// },{
// "address":"0x12FEF5e57bF45873Cd9B62E9DBd7BFb99e32D73e",
// "symbol":"CFI",
// "decimal":18,
// "type":"default"
// },{
// "address":"0x06012c8cf97bead5deae237070f9587f8e7a266d",
// "symbol":"CK",
// "decimal":0,
// "type":"default"
// },{
// "address":"0x7fce2856899a6806eeef70807985fc7554c66340",
// "symbol":"CLP",
// "decimal":9,
// "type":"default"
// },{
// "address":"0x7e667525521cF61352e2E01b50FaaaE7Df39749a",
// "symbol":"CMC",
// "decimal":18,
// "type":"default"
// },{
// "address":"0xf85fEea2FdD81d51177F6b8F35F0e6734Ce45F5F",
// "symbol":"CMT",
// "decimal":18,
// "type":"default"
// },{
// "address":"0xb2f7eb1f2c37645be61d73953035360e768d81e6",
// "symbol":"COB",
// "decimal":18,
// "type":"default"
// },{
// "address":"0x65292eeadf1426cd2df1c4793a3d7519f253913b",
// "symbol":"COSS",
// "decimal":18,
// "type":"default"
// },{
// "address":"0xAef38fBFBF932D1AeF3B808Bc8fBd8Cd8E1f8BC5",
// "symbol":"CRB",
// "decimal":8,
// "type":"default"
// },{
// "address":"0x672a1AD4f667FB18A333Af13667aa0Af1F5b5bDD",
// "symbol":"CRED",
// "decimal":18,
// "type":"default"
// },{
// "address":"0x4E0603e2A27A30480E5e3a4Fe548e29EF12F64bE",
// "symbol":"CREDO",
// "decimal":18,
// "type":"default"
// },{
// "address":"0x80a7e048f37a50500351c204cb407766fa3bae7f",
// "symbol":"CRPT",
// "decimal":18,
// "type":"default"
// },{
// "address":"0xE4c94d45f7Aef7018a5D66f44aF780ec6023378e",
// "symbol":"CryptoCarbon",
// "decimal":6,
// "type":"default"
// },{
// "address":"0xBf4cFD7d1eDeeEA5f6600827411B41A21eB08abd",
// "symbol":"CTL",
// "decimal":2,
// "type":"default"
// },{
// "address":"0xE3Fa177AcecfB86721Cf6f9f4206bd3Bd672D7d5",
// "symbol":"CTT",
// "decimal":18,
// "type":"default"
// },{
// "address":"0x662aBcAd0b7f345AB7FfB1b1fbb9Df7894f18e66",
// "symbol":"CTX",
// "decimal":18,
// "type":"default"
// },{
// "address":"0x41e5560054824eA6B0732E656E3Ad64E20e94E45",
// "symbol":"CVC",
// "decimal":8,
// "type":"default"
// },{
// "address":"0xdab0C31BF34C897Fb0Fe90D12EC9401caf5c36Ec",
// "symbol":"DAB",
// "decimal":0,
// "type":"default"
// },{
// "address":"0x07d9e49ea402194bf48a8276dafb16e4ed633317",
// "symbol":"DALC",
// "decimal":8,
// "type":"default"
// },{
// "address":"0xBB9bc244D798123fDe783fCc1C72d3Bb8C189413",
// "symbol":"DAO",
// "decimal":16,
// "type":"default"
// },{
// "address":"0x81c9151de0c8bafcd325a57e3db5a5df1cebf79c",
// "symbol":"DAT",
// "decimal":18,
// "type":"default"
// },{
// "address":"0x1b5f21ee98eed48d292e8e2d3ed82b40a9728a22",
// "symbol":"DATA (DataBrokerDAO)",
// "decimal":18,
// "type":"default"
// },{
// "address":"0x0cf0ee63788a0849fe5297f3407f701e122cc023",
// "symbol":"DATA (Streamr)",
// "decimal":18,
// "type":"default"
// },{
// "address":"0x399A0e6FbEb3d74c85357439f4c8AeD9678a5cbF",
// "symbol":"DCL",
// "decimal":3,
// "type":"default"
// },{
// "address":"0xcC4eF9EEAF656aC1a2Ab886743E98e97E090ed38",
// "symbol":"DDF",
// "decimal":18,
// "type":"default"
// },{
// "address":"0x3597bfD533a99c9aa083587B074434E61Eb0A258",
// "symbol":"DENT",
// "decimal":8,
// "type":"default"
// },{
// "address":"0xE0B7927c4aF23765Cb51314A0E0521A9645F0E2A",
// "symbol":"DGD",
// "decimal":9,
// "type":"default"
// },{
// "address":"0x55b9a11c2e8351b4Ffc7b11561148bfaC9977855",
// "symbol":"DGX 1.0",
// "decimal":9,
// "type":"default"
// },{
// "address":"0x2e071D2966Aa7D8dECB1005885bA1977D6038A65",
// "symbol":"DICE",
// "decimal":16,
// "type":"default"
// },{
// "address":"0x13f11C9905A08ca76e3e853bE63D4f0944326C72",
// "symbol":"DIVX",
// "decimal":18,
// "type":"default"
// },{
// "address":"0x07e3c70653548b04f0a75970c1f81b4cbbfb606f",
// "symbol":"DLT",
// "decimal":18,
// "type":"default"
// },{
// "address":"0x2ccbFF3A042c68716Ed2a2Cb0c544A9f1d1935E1",
// "symbol":"DMT",
// "decimal":8,
// "type":"default"
// },{
// "address":"0x0AbdAce70D3790235af448C88547603b945604ea",
// "symbol":"DNT",
// "decimal":18,
// "type":"default"
// },{
// "address":"0xE43E2041dc3786e166961eD9484a5539033d10fB",
// "symbol":"DNX",
// "decimal":18,
// "type":"default"
// },{
// "address":"0xEEF6E90034eEa89E31Eb4B8eaCd323F28A92eaE4",
// "symbol":"DOW",
// "decimal":18,
// "type":"default"
// },{
// "address":"0x01b3Ec4aAe1B8729529BEB4965F27d008788B0EB",
// "symbol":"DPP",
// "decimal":18,
// "type":"default"
// },{
// "address":"0x419c4db4b9e25d6db2ad9691ccb832c8d9fda05e",
// "symbol":"DRGN",
// "decimal":18,
// "type":"default"
// },{
// "address":"0x3c75226555FC496168d48B88DF83B95F16771F37",
// "symbol":"DROP",
// "decimal":0,
// "type":"default"
// },{
// "address":"0x621d78f2EF2fd937BFca696CabaF9A779F59B3Ed",
// "symbol":"DRP",
// "decimal":2,
// "type":"default"
// },{
// "address":"0xd234bf2410a0009df9c3c63b610c09738f18ccd7",
// "symbol":"DTR",
// "decimal":8,
// "type":"default"
// },{
// "address":"0xafc39788c51f0c1ff7b55317f3e70299e521fff6",
// "symbol":"eBCH",
// "decimal":8,
// "type":"default"
// },{
// "address":"0xeb7c20027172e5d143fb030d50f91cece2d1485d",
// "symbol":"eBTC",
// "decimal":8,
// "type":"default"
// },{
// "address":"0xa578aCc0cB7875781b7880903F4594D13cFa8B98",
// "symbol":"ECN",
// "decimal":2,
// "type":"default"
// },{
// "address":"0x08711D3B02C8758F2FB3ab4e80228418a7F8e39c",
// "symbol":"EDG",
// "decimal":0,
// "type":"default"
// },{
// "address":"0xced4e93198734ddaff8492d525bd258d49eb388e",
// "symbol":"EDO",
// "decimal":18,
// "type":"default"
// },{
// "address":"0x5b26C5D0772E5bbaC8b3182AE9a13f9BB2D03765",
// "symbol":"EDU",
// "decimal":8,
// "type":"default"
// },{
// "address":"0xf9F0FC7167c311Dd2F1e21E9204F87EBA9012fB2",
// "symbol":"EHT",
// "decimal":8,
// "type":"default"
// },{
// "address":"0xc8C6A31A4A806d3710A7B38b7B296D2fABCCDBA8",
// "symbol":"ELIX",
// "decimal":18,
// "type":"default"
// },{
// "address":"0xB802b24E0637c2B87D2E8b7784C055BBE921011a",
// "symbol":"EMV",
// "decimal":2,
// "type":"default"
// },{
// "address":"0xF629cBd94d3791C9250152BD8dfBDF380E2a3B9c",
// "symbol":"ENJ",
// "decimal":18,
// "type":"default"
// },{
// "address":"0x86Fa049857E0209aa7D9e616F7eb3b3B78ECfdb0",
// "symbol":"EOS",
// "decimal":18,
// "type":"default"
// },{
// "address":"0x1b9743f556d65e757c4c650b4555baf354cb8bd3",
// "symbol":"ETBS",
// "decimal":12,
// "type":"default"
// },{
// "address":"0x3a26746Ddb79B1B8e4450e3F4FFE3285A307387E",
// "symbol":"ETHB",
// "decimal":8,
// "type":"default"
// },{
// "address":"0xf3db5fa2c66b7af3eb0c0b782510816cbe4813b8",
// "symbol":"EVX",
// "decimal":4,
// "type":"default"
// },{
// "address":"0xc98e0639c6d2ec037a615341c369666b110e80e5",
// "symbol":"EXMR",
// "decimal":8,
// "type":"default"
// },{
// "address":"0x190e569bE071F40c704e15825F285481CB74B6cC",
// "symbol":"FAM",
// "decimal":12,
// "type":"default"
// },{
// "address":"0xf04a8ac553FceDB5BA99A64799155826C136b0Be",
// "symbol":"FLIXX",
// "decimal":18,
// "type":"default"
// },{
// "address":"0x0ABeFb7611Cb3A01EA3FaD85f33C3C934F8e2cF4",
// "symbol":"FRD",
// "decimal":18,
// "type":"default"
// },{
// "address":"0xe6f74dcfa0e20883008d8c16b6d9a329189d0c30",
// "symbol":"FTC",
// "decimal":2,
// "type":"default"
// },{
// "address":"0xEA38eAa3C86c8F9B751533Ba2E562deb9acDED40",
// "symbol":"FUEL",
// "decimal":18,
// "type":"default"
// },{
// "address":"0x419D0d8BdD9aF5e606Ae2232ed285Aff190E711b",
// "symbol":"FUN",
// "decimal":8,
// "type":"default"
// },{
// "address":"0x88FCFBc22C6d3dBaa25aF478C578978339BDe77a",
// "symbol":"FYN",
// "decimal":18,
// "type":"default"
// },{
//  "address":"0x708876f486e448ee89eb332bfbc8e593553058b9",
// "symbol":"GAVEL",
// "decimal":18,
// "type":"default"
// },{
// "address":"0x7585F835ae2d522722d2684323a0ba83401f32f5",
// "symbol":"GBT",
// "decimal":18,
// "type":"default"
// },{
// "address":"0x4F4f0Db4de903B88f2B1a2847971E231D54F8fd3",
// "symbol":"GEE",
// "decimal":8,
// "type":"default"
// },{
// "address":"0x24083Bb30072643C3bB90B44B7285860a755e687",
// "symbol":"GELD",
// "decimal":18,
// "type":"default"
// },{
// "address":"0xae4f56f072c34c0a65b3ae3e4db797d831439d93",
// "symbol":"GIM",
// "decimal":8,
// "type":"default"
// },{
// "address":"0xb3Bd49E28f8F832b8d1E246106991e546c323502",
// "symbol":"GMT",
// "decimal":18,
// "type":"default"
// },{
// "address":"0x6810e776880C02933D47DB1b9fc05908e5386b96",
// "symbol":"GNO",
// "decimal":18,
// "type":"default"
// },{
// "address":"0xa74476443119A942dE498590Fe1f2454d7D4aC0d",
// "symbol":"GNT",
// "decimal":18,
// "type":"default"
// },{
// "address":"0x12b19d3e2ccc14da04fae33e63652ce469b3f2fd",
// "symbol":"GRID",
// "decimal":12,
// "type":"default"
// },{
// "address":"0xB70835D7822eBB9426B56543E391846C107bd32C",
// "symbol":"GTC",
// "decimal":18,
// "type":"default"
// },{
// "address":"0x025abAD9e518516fdaAFBDcdB9701b37fb7eF0FA",
// "symbol":"GTKT",
// "decimal":0,
// "type":"default"
// },{
// "address":"0xf7B098298f7C69Fc14610bf71d5e02c60792894C",
// "symbol":"GUP",
// "decimal":3,
// "type":"default"
// },{
// "address":"0x103c3A209da59d3E7C4A89307e66521e081CFDF0",
// "symbol":"GVT",
// "decimal":18,
// "type":"default"
// },{
// "address":"0x58ca3065c0f24c7c96aee8d6056b5b5decf9c2f8",
// "symbol":"GXC",
// "decimal":10,
// "type":"default"
// },{
// "address":"0x22F0AF8D78851b72EE799e05F54A77001586B18A",
// "symbol":"GXVC",
// "decimal":10,
// "type":"default"
// },{
// "address":"0xFeeD1a53bd53FFE453D265FC6E70dD85f8e993b6",
// "symbol":"H2O",
// "decimal":18,
// "type":"default"
// },{
// "address":"0xffe8196bc259e8dedc544d935786aa4709ec3e64",
// "symbol":"HDG",
// "decimal":18,
// "type":"default"
// },{
// "address":"0xba2184520A1cC49a6159c57e61E1844E085615B6",
// "symbol":"HGT",
// "decimal":8,
// "type":"default"
// },{
// "address":"0xa9240fBCAC1F0b9A6aDfB04a53c8E3B0cC1D1444",
// "symbol":"HIG",
// "decimal":18,
// "type":"default"
// },{
// "address":"0x14F37B574242D366558dB61f3335289a5035c506",
// "symbol":"HKG",
// "decimal":3,
// "type":"default"
// },{
// "address":"0xcbCC0F036ED4788F63FC0fEE32873d6A7487b908",
// "symbol":"HMQ",
// "decimal":8,
// "type":"default"
// },{
// "address":"0xb45d7Bc4cEBcAB98aD09BABDF8C818B2292B672c",
// "symbol":"HODL",
// "decimal":18,
// "type":"default"
// },{
// "address":"0x554C20B7c486beeE439277b4540A434566dC4C02",
// "symbol":"HST",
// "decimal":18,
// "type":"default"
// },{
// "address":"0xC0Eb85285d83217CD7c891702bcbC0FC401E2D9D",
// "symbol":"HVN",
// "decimal":8,
// "type":"default"
// },{
// "address":"0x5a84969bb663fb64F6d015DcF9F622Aedc796750",
// "symbol":"ICE",
// "decimal":18,
// "type":"default"
// },{
// "address":"0x888666CA69E0f178DED6D75b5726Cee99A87D698",
// "symbol":"ICN",
// "decimal":18,
// "type":"default"
// },{
// "address":"0xa33e729bf4fdeb868b534e1f20523463d9c46bee",
// "symbol":"ICO",
// "decimal":10,
// "type":"default"
// },{
// "address":"0x014B50466590340D41307Cc54DCee990c8D58aa8",
// "symbol":"ICOS",
// "decimal":6,
// "type":"default"
// },{
// "address":"0x814cafd4782d2e728170fda68257983f03321c58",
// "symbol":"IDEA",
// "decimal":0,
// "type":"default"
// },{
// "address":"0x7654915a1b82d6d2d0afc37c52af556ea8983c7e",
// "symbol":"IFT",
// "decimal":18,
// "type":"default"
// },{
// "address":"0x16662f73df3e79e54c6c5938b4313f92c524c120",
// "symbol":"IIC",
// "decimal":18,
// "type":"default"
// },{
// "address":"0x88AE96845e157558ef59e9Ff90E766E22E480390",
// "symbol":"IKB",
// "decimal":0,
// "type":"default"
// },{
// "address":"0xe3831c5A982B279A198456D577cfb90424cb6340",
// "symbol":"IMC",
// "decimal":6,
// "type":"default"
// },{
// "address":"0x22E5F62D0FA19974749faa194e3d3eF6d89c08d7",
// "symbol":"IMT",
// "decimal":0,
// "type":"default"
// },{
// "address":"0xf8e386EDa857484f5a12e4B5DAa9984E06E73705",
// "symbol":"IND",
// "decimal":18,
// "type":"default"
// }, {
// "address":"0x5b2e4a700dfbc560061e957edec8f6eeeb74a320",
// "symbol":"INS",
// "decimal":10,
// "type":"default"
// },{
// "address":"0xa8006c4ca56f24d6836727d106349320db7fef82",
// "symbol":"INXT",
// "decimal":8,
// "type":"default"
// },{
// "address":"0x0aeF06DcCCC531e581f0440059E6FfCC206039EE",
// "symbol":"ITT",
// "decimal":8,
// "type":"default"
// },{
// "address":"0xfca47962d45adfdfd1ab2d972315db4ce7ccf094",
// "symbol":"IXT",
// "decimal":8,
// "type":"default"
// },{
// "address":"0x0Aaf561eFF5BD9c8F911616933F84166A17cfE0C",
// "symbol":"JBX",
// "decimal":0,
// "type":"default"
// },{
// "address":"0x8727c112C712c4a03371AC87a74dD6aB104Af768",
// "symbol":"JET (new)",
// "decimal":18,
// "type":"default"
// },{
// "address":"0xc1E6C6C681B286Fb503B36a9dD6c1dbFF85E73CF",
// "symbol":"JET (old)",
// "decimal":18,
// "type":"default"
// },{
// "address":"0x773450335eD4ec3DB45aF74f34F2c85348645D39",
// "symbol":"JetCoins",
// "decimal":18,
// "type":"default"
//  },{
//  "address":"0xa5Fd1A791C4dfcaacC963D4F73c6Ae5824149eA7",
// "symbol":"JNT",
// "decimal":18,
// "type":"default"
// },{
// "address":"0x27695E09149AdC738A978e9A678F99E4c39e9eb9",
// "symbol":"KICK",
// "decimal":8,
// "type":"default"
// },{
// "address":"0x818Fc6C2Ec5986bc6E2CBf00939d90556aB12ce5",
// "symbol":"KIN",
// "decimal":18,
// "type":"default"
// },{
// "address":"0xdd974D5C2e2928deA5F71b9825b8b646686BD200",
// "symbol":"KNC",
// "decimal":18,
// "type":"default"
// },{
// "address":"0x9541FD8B9b5FA97381783783CeBF2F5fA793C262",
// "symbol":"KZN",
// "decimal":8,
// "type":"default"
// },{
// "address":"0x2eb86e8fc520e0f6bb5d9af08f924fe70558ab89",
// "symbol":"LGR",
// "decimal":8,
// "type":"default"
// },{
// "address":"0xff18dbc487b4c2e3222d115952babfda8ba52f5f",
// "symbol":"LIFE",
// "decimal":18,
// "type":"default"
// },{
// "address":"0x514910771af9ca656af840dff83e8264ecf986ca",
// "symbol":"LINK - ChainLink",
// "decimal":18,
// "type":"default"
// },{
// "address":"0xe2e6d4be086c6938b53b22144855eef674281639",
// "symbol":"LINK - Link Platform",
// "decimal":18,
// "type":"default"
// },{
// "address":"0x24A77c1F17C547105E14813e517be06b0040aa76",
// "symbol":"LIVE",
// "decimal":18,
// "type":"default"
// },{
// "address":"0x63e634330A20150DbB61B15648bC73855d6CCF07",
// "symbol":"LNC",
// "decimal":18,
// "type":"default"
// },{
// "address":"0x6beb418fc6e1958204ac8baddcf109b8e9694966",
// "symbol":"LNC-Linker Coin",
// "decimal":18,
// "type":"default"
// },{
// "address":"0x5e3346444010135322268a4630d2ed5f8d09446c",
// "symbol":"LOC",
// "decimal":18,
// "type":"default"
// },{
// "address":"0x21aE23B882A340A22282162086bC98D3E2B73018",
// "symbol":"LOK",
// "decimal":18,
// "type":"default"
// },{
// "address":"0xEF68e7C694F40c8202821eDF525dE3782458639f",
// "symbol":"LRC",
// "decimal":18,
// "type":"default"
// },{
// "address":"0xFB12e3CcA983B9f59D90912Fd17F8D745A8B2953",
// "symbol":"LUCK",
// "decimal":0,
// "type":"default"
// },{
// "address":"0xa89b5934863447f6e4fc53b315a93e873bda69a3",
// "symbol":"LUM",
// "decimal":18,
// "type":"default"
// },{
// "address":"0xfa05A73FfE78ef8f1a739473e462c54bae6567D9",
// "symbol":"LUN",
// "decimal":18,
// "type":"default"
// },{
// "address":"0x3f4b726668da46f5e0e75aa5d478acec9f38210f",
// "symbol":"M-ETH",
// "decimal":18,
// "type":"default"
// },{
// "address":"0x0F5D2fB29fb7d3CFeE444a200298f468908cC942",
// "symbol":"MANA",
// "decimal":18,
// "type":"default"
// },{
// "address":"0x386467f1f3ddbe832448650418311a479eecfc57",
// "symbol":"MBRS",
// "decimal":0,
// "type":"default"
// },{
// "address":"0x93E682107d1E9defB0b5ee701C71707a4B2E46Bc",
// "symbol":"MCAP",
// "decimal":8,
// "type":"default"
// },{
// "address":"0x138A8752093F4f9a79AaeDF48d4B9248fab93c9C",
// "symbol":"MCI",
// "decimal":18,
// "type":"default"
// },{
// "address":"0xB63B606Ac810a52cCa15e44bB630fd42D8d1d83d",
// "symbol":"MCO",
// "decimal":8,
// "type":"default"
// },{
// "address":"0x51DB5Ad35C671a87207d88fC11d593AC0C8415bd",
// "symbol":"MDA",
// "decimal":18,
// "type":"default"
// },{
// "address":"0x40395044Ac3c0C57051906dA938B54BD6557F212",
// "symbol":"MGO",
// "decimal":8,
// "type":"default"
// },{
// "address":"0xe23cd160761f63FC3a1cF78Aa034b6cdF97d3E0C",
// "symbol":"MIT",
// "decimal":18,
// "type":"default"
// },{
// "address":"0xC66eA802717bFb9833400264Dd12c2bCeAa34a6d",
// "symbol":"MKR",
// "decimal":18,
// "type":"default"
// },{
// "address":"0xBEB9eF514a379B997e0798FDcC901Ee474B6D9A1",
// "symbol":"MLN",
// "decimal":18,
// "type":"default"
// },{
// "address":"0x1a95B271B0535D15fa49932Daba31BA612b52946",
// "symbol":"MNE",
// "decimal":8,
// "type":"default"
// },{
// "address":"0x83cee9e086a77e492ee0bb93c2b0437ad6fdeccc",
// "symbol":"MNTP",
// "decimal":18,
// "type":"default"
// },{
// "address":"0x957c30aB0426e0C93CD8241E2c60392d08c6aC8e",
// "symbol":"MOD",
// "decimal":0,
// "type":"default"
// },{
// "address":"0xAB6CF87a50F17d7F5E1FEaf81B6fE9FfBe8EBF84",
// "symbol":"MRV",
// "decimal":18,
// "type":"default"
// },{
// "address":"0x68AA3F232dA9bdC2343465545794ef3eEa5209BD",
// "symbol":"MSP",
// "decimal":18,
// "type":"default"
// },{
// "address":"0xaF4DcE16Da2877f8c9e00544c93B62Ac40631F16",
// "symbol":"MTH",
// "decimal":5,
// "type":"default"
// },{
// "address":"0xF433089366899D83a9f26A773D59ec7eCF30355e",
// "symbol":"MTL",
// "decimal":8,
// "type":"default"
// },{
// "address":"0x7FC408011165760eE31bE2BF20dAf450356692Af",
// "symbol":"MTR",
// "decimal":8,
// "type":"default"
// },{
// "address":"0x0AF44e2784637218dD1D32A322D44e603A8f0c6A",
// "symbol":"MTX",
// "decimal":18,
// "type":"default"
// },{
// "address":"0xf7e983781609012307f2514f63D526D83D24F466",
// "symbol":"MYD",
// "decimal":16,
// "type":"default"
// },{
// "address":"0xa645264C5603E96c3b0B078cdab68733794B0A71",
// "symbol":"MYST",
// "decimal":8,
// "type":"default"
// },{
// "address":"0xa54ddc7b3cce7fc8b1e3fa0256d0db80d2c10970",
// "symbol":"NDC",
// "decimal":18,
// "type":"default"
// },{
// "address":"0xcfb98637bcae43C13323EAa1731cED2B716962fD",
// "symbol":"NET",
// "decimal":18,
// "type":"default"
// },{
// "address":"0xa823e6722006afe99e91c30ff5295052fe6b8e32",
// "symbol":"NEU",
// "decimal":18,
// "type":"default"
// },{
// "address":"0xe26517A9967299453d3F1B48Aa005E6127e67210",
// "symbol":"NIMFA",
// "decimal":18,
// "type":"default"
// },{
// "address":"0x1776e1F26f98b1A5dF9cD347953a26dd3Cb46671",
// "symbol":"NMR",
// "decimal":18,
// "type":"default"
// },{
// "address":"0xec46f8207d766012454c408de210bcbc2243e71c",
// "symbol":"NOX",
// "decimal":18,
// "type":"default"
// },{
// "address":"0x45e42D659D9f9466cD5DF622506033145a9b89Bc",
// "symbol":"NxC",
// "decimal":3,
// "type":"default"
// },{
// "address":"0x7627de4b93263a6a7570b8dafa64bae812e5c394",
// "symbol":"NXX",
// "decimal":8,
// "type":"default"
// },{
// "address":"0x5c6183d10A00CD747a6Dbb5F658aD514383e9419",
// "symbol":"NXX_OLD",
// "decimal":8,
// "type":"default"
// },{
// "address":"0x701C244b988a513c945973dEFA05de933b23Fe1D",
// "symbol":"OAX",
// "decimal":18,
// "type":"default"
// },{
// "address":"0x7F2176cEB16dcb648dc924eff617c3dC2BEfd30d",
// "symbol":"OHNI",
// "decimal":0,
// "type":"default"
// },{
// "address":"0xd26114cd6EE289AccF82350c8d8487fedB8A0C07",
// "symbol":"OMG",
// "decimal":18,
// "type":"default"
// },{
// "address":"0xb23be73573bc7e03db6e5dfc62405368716d28a8",
// "symbol":"ONEK",
// "decimal":18,
// "type":"default"
// },{
// "address":"0x4355fC160f74328f9b383dF2EC589bB3dFd82Ba0",
// "symbol":"OPT",
// "decimal":18,
// "type":"default"
// },{
// "address":"0x65a15014964f2102ff58647e16a16a6b9e14bcf6",
// "symbol":"Ox Fina",
// "decimal":3,
// "type":"default"
// },{
// "address":"0x694404595e3075a942397f466aacd462ff1a7bd0",
// "symbol":"PATENTS",
// "decimal":18,
// "type":"default"
// },{
// "address":"0xB97048628DB6B661D4C2aA833e95Dbe1A905B280",
// "symbol":"PAY",
// "decimal":18,
// "type":"default"
// },{
// "address":"0x55648de19836338549130b1af587f16bea46f66b",
// "symbol":"PBL",
// "decimal":18,
// "type":"default"
// },{
// "address":"0x53148Bb4551707edF51a1e8d7A93698d18931225",
// "symbol":"PCL",
// "decimal":8,
// "type":"default"
// },{
// "address":"0xE64509F0bf07ce2d29A7eF19A8A9bc065477C1B4",
// "symbol":"PIPL",
// "decimal":8,
// "type":"default"
// },{
// "address":"0x8eFFd494eB698cc399AF6231fCcd39E08fd20B15",
// "symbol":"PIX",
// "decimal":0,
// "type":"default"
//  },{
// "address":"0xE477292f1B3268687A29376116B0ED27A9c76170",
// "symbol":"PLAY",
// "decimal":18,
// "type":"default"
// },{
// "address":"0x0AfFa06e7Fbe5bC9a764C979aA66E8256A631f02",
// "symbol":"PLBT",
// "decimal":6,
// "type":"default"
// },{
// "address":"0xe3818504c1B32bF1557b16C238B2E01Fd3149C17",
// "symbol":"PLR",
// "decimal":18,
// "type":"default"
// },{
// "address":"0xD8912C10681D8B21Fd3742244f44658dBA12264E",
// "symbol":"PLU",
// "decimal":18,
// "type":"default"
// },{
// "address":"0x0e0989b1f9b8a38983c2ba8053269ca62ec9b195",
// "symbol":"POE",
// "decimal":8,
// "type":"default"
// },{
// "address":"0x779B7b713C86e3E6774f5040D9cCC2D43ad375F8",
// "symbol":"POOL",
// "decimal":8,
// "type":"default"
// },{
// "address":"0xee609fe292128cad03b786dbb9bc2634ccdbe7fc",
// "symbol":"POS",
// "decimal":18,
// "type":"default"
// },{
// "address":"0x595832f8fc6bf59c85c527fec3740a1b7a361269",
// "symbol":"POWR",
// "decimal":6,
// "type":"default"
// },{
// "address":"0xc42209accc14029c1012fb5680d95fbd6036e2a0",
// "symbol":"PPP",
// "decimal":18,
// "type":"default"
// },{
// "address":"0xd4fa1460F537bb9085d22C7bcCB5DD450Ef28e3a",
// "symbol":"PPT",
// "decimal":8,
// "type":"default"
// },{
// "address":"0x88a3e4f35d64aad41a6d4030ac9afe4356cb84fa",
// "symbol":"PRE",
// "decimal":18,
// "type":"default"
// },{
// "address":"0x226bb599a12C826476e3A771454697EA52E9E220",
// "symbol":"PRO",
// "decimal":8,
// "type":"default"
// },{
// "address":"0x163733bcc28dbf26B41a8CfA83e369b5B3af741b",
// "symbol":"PRS",
// "decimal":18,
// "type":"default"
// },{
// "address":"0x7728dfef5abd468669eb7f9b48a7f70a501ed29d",
// "symbol":"PRG",
// "decimal":6,
// "type":"default"
// },{
// "address":"0x0c04d4f331da8df75f9e2e271e3f3f1494c66c36",
// "symbol":"PRSP",
// "decimal":9,
// "type":"default"
// },{
// "address":"0x66497a283e0a007ba3974e837784c6ae323447de",
// "symbol":"PT",
// "decimal":18,
// "type":"default"
// },{
// "address":"0x8Ae4BF2C33a8e667de34B54938B0ccD03Eb8CC06",
// "symbol":"PTOY",
// "decimal":8,
// "type":"default"
// },{
// "address":"0x671AbBe5CE652491985342e85428EB1b07bC6c64",
// "symbol":"QAU",
// "decimal":8,
// "type":"default"
// },{
// "address":"0x99ea4dB9EE77ACD40B119BD1dC4E33e1C070b80d",
// "symbol":"QSP",
// "decimal":18,
// "type":"default"
// },{
// "address":"0x2C3C1F05187dBa7A5f2Dd47Dca57281C4d4F183F",
// "symbol":"QTQ",
// "decimal":18,
// "type":"default"
// },{
// "address":"0x9a642d6b3368ddc662CA244bAdf32cDA716005BC",
// "symbol":"QTUM",
// "decimal":18,
// "type":"default"
// },{
// "address":"0x697beac28B09E122C4332D163985e8a73121b97F",
// "symbol":"QRL",
// "decimal":8,
// "type":"default"
// },{
// "address":"0x255aa6df07540cb5d3d297f0d0d4d84cb52bc8e6",
// "symbol":"RDN",
// "decimal":18,
// "type":"default"
// },{
// "address":"0x5f53f7a8075614b699baad0bc2c899f4bad8fbbf",
// "symbol":"REBL",
// "decimal":18,
// "type":"default"
// },{
// "address":"0xE94327D07Fc17907b4DB788E5aDf2ed424adDff6",
// "symbol":"REP",
// "decimal":18,
// "type":"default"
// },{
// "address":"0x8f8221aFbB33998d8584A2B05749bA73c37a938a",
// "symbol":"REQ",
// "decimal":18,
// "type":"default"
// },{
// "address":"0xf05a9382A4C3F29E2784502754293D88b835109C",
// "symbol":"REX",
// "decimal":18,
// "type":"default"
// },{
// "address":"0xdd007278b667f6bef52fd0a4c23604aa1f96039a",
// "symbol":"RIPT",
// "decimal":8,
// "type":"default"
// },{
// "address":"0x607F4C5BB672230e8672085532f7e901544a7375",
// "symbol":"RLC",
// "decimal":9,
// "type":"default"
// },{
// "address":"0xcCeD5B8288086BE8c38E23567e684C3740be4D48",
// "symbol":"RLT",
// "decimal":10,
// "type":"default"
// },{
// "address":"0x4a42d2c580f83dce404acad18dab26db11a1750e",
// "symbol":"RLX",
// "decimal":18,
// "type":"default"
// },{
// "address":"0x0996bfb5d057faa237640e2506be7b4f9c46de0b",
// "symbol":"RNDR",
// "decimal":18,
// "type":"default"
// },{
// "address":"0xb4efd85c19999d84251304bda99e90b92300bd93",
// "symbol":"RPL",
// "decimal":18,
// "type":"default"
// },{
// "address":"0xc9de4b7f0c3d991e967158e4d4bfa4b51ec0b114",
// "symbol":"ROK",
// "decimal":18,
// "type":"default"
// },{
// "address":"0x4993CB95c7443bdC06155c5f5688Be9D8f6999a5",
// "symbol":"ROUND",
// "decimal":18,
// "type":"default"
//  },{
// "address":"0x3d1ba9be9f66b8ee101911bc36d3fb562eac2244",
// "symbol":"RVT",
// "decimal":18,
// "type":"default"
// },{
// "address":"0x4156D3342D5c385a87D264F90653733592000581",
// "symbol":"SALT",
// "decimal":8,
// "type":"default"
// },{
// "address":"0x7C5A0CE9267ED19B22F8cae653F198e3E8daf098",
// "symbol":"SAN",
// "decimal":18,
// "type":"default"
// },{
// "address":"0x1ec8fe51a9b6a3a6c427d17d9ecc3060fbc4a45c",
// "symbol":"S-A-PAT",
// "decimal":18,
// "type":"default"
// },{
// "address":"0xd7631787B4dCc87b1254cfd1e5cE48e96823dEe8",
// "symbol":"SCL",
// "decimal":8,
// "type":"default"
// },{
// "address":"0x4ca74185532dc1789527194e5b9c866dd33f4e82",
// "symbol":"sense",
// "decimal":18,
// "type":"default"
// },{
// "address":"0x3eb91d237e491e0dee8582c402d85cb440fb6b54",
// "symbol":"S-ETH",
// "decimal":18,
// "type":"default"
// },{
// "address":"0xe06eda7435ba749b047380ced49121dde93334ae",
// "symbol":"SET",
// "decimal":0,
// "type":"default"
// },{
// "address":"0xe06eda7435ba749b047380ced49121dde93334ae",
// "symbol":"SET",
// "decimal":0,
// "type":"default"
// },{
// "address":"0x98f5e9b7f0e33956c0443e81bf7deb8b5b1ed545",
// "symbol":"SEXY",
// "decimal":18,
// "type":"default"
// },{
// "address":"0xd248B0D48E44aaF9c49aea0312be7E13a6dc1468",
// "symbol":"SGT",
// "decimal":1,
// "type":"default"
// },{
// "address":"0xEF2E9966eb61BB494E5375d5Df8d67B7dB8A780D",
// "symbol":"SHIT",
// "decimal":0,
// "type":"default"
// },{
// "address":"0x8a187d5285d316bcbc9adafc08b51d70a0d8e000",
// "symbol":"SIFT",
// "decimal":0,
// "type":"default"
// },{
// "address":"0x2bDC0D42996017fCe214b21607a515DA41A9E0C5",
// "symbol":"SKIN",
// "decimal":6,
// "type":"default"
// },{
// "address":"0x4994e81897a920c0FEA235eb8CEdEEd3c6fFF697",
// "symbol":"SKO1",
// "decimal":18,
// "type":"default"
// },{
// "address":"0x4c382F8E09615AC86E08CE58266CC227e7d4D913",
// "symbol":"SKR",
// "decimal":6,
// "type":"default"
// },{
// "address":"0x7A5fF295Dc8239d5C2374E4D894202aAF029Cab6",
// "symbol":"SLT",
// "decimal":3,
// "type":"default"
// },{
// "address":"0x6F6DEb5db0C4994A8283A01D6CFeEB27Fc3bBe9C",
// "symbol":"Smart",
// "decimal":0,
// "type":"default"
// },{
// "address":"0xF4134146AF2d511Dd5EA8cDB1C4AC88C57D60404",
// "symbol":"SNC",
// "decimal":18,
// "type":"default"
// },{
// "address":"0x44F588aEeB8C44471439D1270B3603c66a9262F1",
// "symbol":"SNIP",
// "decimal":18,
// "type":"default"
// },{
// "address":"0xaeC2E87E0A235266D9C5ADc9DEb4b2E29b54D009",
// "symbol":"SNGLS",
// "decimal":0,
// "type":"default"
// },{
// "address":"0xf333b2Ace992ac2bBD8798bF57Bc65a06184afBa",
// "symbol":"SND",
// "decimal":0,
// "type":"default"
// },{
// "address":"0x983F6d60db79ea8cA4eB9968C6aFf8cfA04B3c63",
// "symbol":"SNM",
// "decimal":18,
// "type":"default"
// },{
// "address":"0x744d70FDBE2Ba4CF95131626614a1763DF805B9E",
// "symbol":"SNT",
// "decimal":18,
// "type":"default"
// },{
// "address":"0x58bf7df57d9DA7113c4cCb49d8463D4908C735cb",
// "symbol":"SPARC",
// "decimal":18,
// "type":"default"
// },{
// "address":"0x24aef3bf1a47561500f9430d74ed4097c47f51f2",
// "symbol":"SPARTA",
// "decimal":4,
// "type":"default"
// },{
// "address":"0x85089389C14Bd9c77FC2b8F0c3d1dC3363Bf06Ef",
// "symbol":"SPF",
// "decimal":18,
// "type":"default"
// },{
// "address":"0x68d57c9a1C35f63E2c83eE8e49A64e9d70528D25",
// "symbol":"SRN",
// "decimal":18,
// "type":"default"
// },{
// "address":"0x2C4e8f2D746113d0696cE89B35F0d8bF88E0AEcA",
// "symbol":"ST",
// "decimal":18,
// "type":"default"
// },{
// "address":"0xF70a642bD387F94380fFb90451C2c81d4Eb82CBc",
// "symbol":"STAR",
// "decimal":18,
// "type":"default"
// },{
// "address":"0x7dd7f56d697cc0f2b52bd55c057f378f1fe6ab4b",
// "symbol":"$TEAK",
// "decimal":18,
// "type":"default"
// },{
// "address":"0xB64ef51C888972c908CFacf59B47C1AfBC0Ab8aC",
// "symbol":"STORJ",
// "decimal":8,
// "type":"default"
// },{
// "address":"0xD0a4b8946Cb52f0661273bfbC6fD0E0C75Fc6433",
// "symbol":"STORM",
// "decimal":18,
// "type":"default"
// },{
// "address":"0x599346779e90fc3F5F997b5ea715349820F91571",
// "symbol":"STN",
// "decimal":4,
// "type":"default"
// },{
// "address":"0x46492473755e8dF960F8034877F61732D718CE96",
// "symbol":"STRC",
// "decimal":8,
// "type":"default"
// },{
// "address":"0x006BeA43Baa3f7A6f765F14f10A1a1b08334EF45",
// "symbol":"STX",
// "decimal":18,
// "type":"default"
// },{
// "address":"0x12480E24eb5bec1a9D4369CaB6a80caD3c0A377A",
// "symbol":"SUB",
// "decimal":2,
// "type":"default"
// },{
// "address":"0x9e88613418cf03dca54d6a2cf6ad934a78c7a17a",
// "symbol":"SWM",
// "decimal":18,
// "type":"default"
// },{
// "address":"0xB9e7F8568e08d5659f5D29C4997173d84CdF2607",
// "symbol":"SWT",
// "decimal":18,
// "type":"default"
// },{
// "address":"0x554c98b3ec772f79eE5b96d47A1D10852ED274C8",
// "symbol":"SXD",
// "decimal":18,
// "type":"default"
// },{
// "address":"0x6ceE948C9d593c58Cba5Dfa70482444899D1341c",
// "symbol":"SXS",
// "decimal":18,
// "type":"default"
// },{
// "address":"0xaADB05F449072D275833bAf7C82e8fCa4ee46575",
// "symbol":"SXU",
// "decimal":18,
// "type":"default"
// },{
// "address":"0x10b123fddde003243199aad03522065dc05827a0",
// "symbol":"SYN",
// "decimal":18,
// "type":"default"
// },{
// "address":"0xE7775A6e9Bcf904eb39DA2b68c5efb4F9360e08C",
// "symbol":"TaaS",
// "decimal":6,
// "type":"default"
// },{
// "address":"0xAFe60511341a37488de25Bef351952562E31fCc1",
// "symbol":"TBT",
// "decimal":8,
// "type":"default"
// },{
// "address":"0xa7f976C360ebBeD4465c2855684D1AAE5271eFa9",
// "symbol":"TFL",
// "decimal":8,
// "type":"default"
// },{
// "address":"0xFACCD5Fc83c3E4C3c1AC1EF35D15adf06bCF209C",
// "symbol":"TBC2",
// "decimal":8,
// "type":"default"
// },{
// "address":"0x6531f133e6DeeBe7F2dcE5A0441aA7ef330B4e53",
// "symbol":"TIME",
// "decimal":8,
// "type":"default"
// },{
// "address":"0x80bc5512561c7f85a3a9508c7df7901b370fa1df",
// "symbol":"TIO",
// "decimal":18,
// "type":"default"
// },{
// "address":"0xEa1f346faF023F974Eb5adaf088BbCdf02d761F4",
// "symbol":"TIX",
// "decimal":18,
// "type":"default"
// },{
// "address":"0xaAAf91D9b90dF800Df4F55c205fd6989c977E73a",
// "symbol":"TKN",
// "decimal":8,
// "type":"default"
// },{
// "address":"0x08f5a9235b08173b7569f83645d2c7fb55e8ccd8",
// "symbol":"TNT",
// "decimal":8,
// "type":"default"
// },{
// "address":"0xCb94be6f13A1182E4A4B6140cb7bf2025d28e41B",
// "symbol":"TRST",
// "decimal":6,
// "type":"default"
// },{
// "address":"0xBa138976D8e7644BA8fE74409286a85Dba85Ba2a",
// "symbol":"TRV",
// "decimal":18,
// "type":"default"
// },{
// "address":"0xf230b790e05390fc8295f4d3f60332c93bed42e2",
// "symbol":"TRX",
// "decimal":6,
// "type":"default"
// },{
// "address":"0x24692791bc444c5cd0b81e3cbcaba4b04acd1f3b",
// "symbol":"UKG",
// "decimal":18,
// "type":"default"
// },{
// "address":"0x89205A3A3b2A69De6Dbf7f01ED13B2108B2c43e7",
// "symbol":"Unicorn 🦄",
// "decimal":0,
// "type":"default"
// },{
// "address":"0xd01db73e047855efb414e6202098c4be4cd2423b",
// "symbol":"UQC",
// "decimal":18,
// "type":"default"
// },{
// "address":"0xEbeD4fF9fe34413db8fC8294556BBD1528a4DAca",
// "symbol":"VENUS",
// "decimal":3,
// "type":"default"
// },{
// "address":"0x8f3470A7388c05eE4e7AF3d01D8C722b0FF52374",
// "symbol":"VERI",
// "decimal":18,
// "type":"default"
// },{
// "address": "0xD850942eF8811f2A866692A623011bDE52a462C1",
// "symbol": "VET",
// "decimal": 18,
// "type": "default"
// },{
// "address":"0xe8ff5c9c75deb346acac493c463c8950be03dfba",
// "symbol":"VIBE",
// "decimal":18,
// "type":"default"
// },{
// "address":"0x2C974B2d0BA1716E644c1FC59982a89DDD2fF724",
// "symbol":"VIB",
// "decimal":18,
// "type":"default"
// },{
// "address":"0x882448f83d90b2bf477af2ea79327fdea1335d93",
// "symbol":"VIBEX",
// "decimal":18,
// "type":"default"
// },{
// "address":"0x519475b31653e46d20cd09f9fdcf3b12bdacb4f5",
// "symbol":"VIU",
// "decimal":18,
// "type":"default"
// },{
// "address":"0x83eEA00D838f92dEC4D1475697B9f4D3537b56E3",
// "symbol":"VOISE",
// "decimal":8,
// "type":"default"
// },{
// "address":"0xeDBaF3c5100302dCddA53269322f3730b1F0416d",
// "symbol":"VRS",
// "decimal":5,
// "type":"default"
// },{
// "address":"0x5c543e7AE0A1104f78406C340E9C64FD9fCE5170",
// "symbol":"VSL",
// "decimal":18,
// "type":"default"
// },{
// "address":"0x82665764ea0b58157E1e5E9bab32F68c76Ec0CdF",
// "symbol":"VSM(OLD)",
// "decimal":0,
// "type":"default"
// },{
// "address":"0x286BDA1413a2Df81731D4930ce2F862a35A609fE",
// "symbol":"WaBi",
// "decimal":18,
// "type":"default"
// },{
// "address":"0x74951B677de32D596EE851A233336926e6A2cd09",
// "symbol":"WBA",
// "decimal":7,
// "type":"default"
// },{
// "address":"0x6a0A97E47d15aAd1D132a1Ac79a480E3F2079063",
// "symbol":"WCT",
// "decimal":18,
// "type":"default"
// },{
// "address":"0x5e4ABE6419650CA839Ce5BB7Db422b881a6064bB",
// "symbol":"WiC",
// "decimal":18,
// "type":"default"
// },{
// "address":"0x667088b212ce3d06a1b553a7221E1fD19000d9aF",
// "symbol":"WINGS",
// "decimal":18,
// "type":"default"
// },{
// "address":"0xF6B55acBBC49f4524Aa48D19281A9A77c54DE10f",
// "symbol":"WLK",
// "decimal":18,
// "type":"default"
// },{
// "address":"0x728781E75735dc0962Df3a51d7Ef47E798A7107E",
// "symbol":"WOLK",
// "decimal":18,
// "type":"default"
// },{
// "address":"0x62087245087125d3db5b9a3d713d78e7bbc31e54",
// "symbol":"WPC",
// "decimal":18,
// "type":"default"
// },{
// "address":"0x910Dfc18D6EA3D6a7124A6F8B5458F281060fa4c",
// "symbol":"X8X",
// "decimal":18,
// "type":"default"
//  },{
// "address":"0x4DF812F6064def1e5e029f1ca858777CC98D2D81",
// "symbol":"XAUR",
// "decimal":8,
// "type":"default"
// },{
// "address":"0x533ef0984b2FAA227AcC620C67cce12aA39CD8CD",
// "symbol":"XGM",
// "decimal":8,
// "type":"default"
// },{
// "address":"0x30f4A3e0aB7a76733D8b60b89DD93c3D0b4c9E2f",
// "symbol":"XGT",
// "decimal":18,
// "type":"default"
// },{
// "address":"0xB110eC7B1dcb8FAB8dEDbf28f53Bc63eA5BEdd84",
// "symbol":"XID",
// "decimal":8,
// "type":"default"
// },{
// "address":"0xab95e915c123fded5bdfb6325e35ef5515f1ea69",
// "symbol":"XNN",
// "decimal":18,
// "type":"default"
// },{
// "address":"0xB24754bE79281553dc1adC160ddF5Cd9b74361a4",
// "symbol":"XRL",
// "decimal":9,
// "type":"default"
// },{
// "address":"0x0F513fFb4926ff82D7F60A05069047AcA295C413",
// "symbol":"XSC",
// "decimal":18,
// "type":"default"
// },{
// "address":"0x0F33bb20a282A7649C7B3AFf644F084a9348e933",
// "symbol":"YUPIE",
// "decimal":18,
// "type":"default"
// },{
// "address":"0x6781a0f84c7e9e846dcb84a9a5bd49333067b104",
// "symbol":"ZAP",
// "decimal": 18,
// "type":"default"
// },{
// "address":"0xE41d2489571d322189246DaFA5ebDe1F4699F498",
// "symbol":"ZRX",
// "decimal":18,
// "type":"default"
// },{
// "address":"0xe386b139ed3715ca4b18fd52671bdcea1cdfe4b1",
// "symbol":"ZST",
// "decimal":8,
// "type":"default"
// }]
//

// },{}],97:[function(require,module,exports){

//98:[function(require,module,exports){
// module.exports=[{
//     "address":"0xbd287b4398b248032183994229f5f6a9fdac98b1",
//     "symbol":"💥 PLASMA",
//     "decimal":6,
//     "type":"default"
//  },{
//     "address":"0x3C67f7D4decF7795225f51b54134F81137385f83",
//     "symbol":"GUP",
//     "decimal":3,
//     "type":"default"
//  },{
//     "address":"0x8667559254241ddeD4d11392f868d72092765367",
//     "symbol":"Aeternity",
//     "decimal":18,
//     "type":"default"
// }]
//
// },{}],99:[function(require,module,exports){
// arguments[4][5][0].apply(exports,arguments)
// },{"dup":5}],100:[function(require,module,exports){
// module.exports=[{
// "address":"0xA52832A0B3EBfAeF629B1a44A922F46c90445108",
// "symbol":"☼ PLASMA",
// "decimal":6,
// "type":"default"
// }]
//
// },{}],101:[function(require,module,exports){
// module.exports=[{
// "address":"0x95D7321EdCe519419ba1DbC60A89bAfbF55EAC0D",
// "symbol":"💥 PLASMA",
// "decimal":6,
// "type":"default"
// }]
//
// },{}],

// 103:[function(require,module,exports){
// module.exports=[
//   {
//     "address":"0xd245207cfbf6eb6f34970db2a807ab1d178fde6c",
//     "symbol":"APX",
//     "decimal":8,
//     "type":"default"
//   },
//   {
//     "address":"0xff3bf057adf3b0e015b6465331a6236e55688274",
//     "symbol":"BEER",
//     "decimal":0,
//     "type":"default"
//   },
//   {
//     "address":"0x08533d6a06ce365298b12ef92eb407cba8aa8273",
//     "symbol":"CEFS",
//     "decimal":8,
//     "type":"default"
//   },
//   {
//     "address":"0x94ad7e41c1d44022c4f47cb1ba019fd1a022c536",
//     "symbol":"DOT",
//     "decimal":8,
//     "type":"default"
//   },
//   {
//     "address":"0x4b4899a10f3e507db207b0ee2426029efa168a67",
//     "symbol":"QWARK",
//     "decimal":8,
//     "type":"default"
//   },
//   {
//     "address":"0x5e1715bb79805bd672729760b3f7f34d6f485098",
//     "symbol":"RICKS",
//     "decimal":8,
//     "type":"default"
//   }
// ]
//
// },{}],