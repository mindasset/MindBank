
var Coin_API = new function () {
    var apiconnected = false;
    var notifyblockfunc;
    var notifytx = {func: "", ids: []};
    var notifypeerfunc;
    var notifyaccountfunc;
    var notifyidfunc;
    var notifyfallbackfunc;
    var notifyimsgfunc;
    var callIDs = [];
    this.connectSlots = function ()
    {
        if (!apiconnected) {
            apiconnected = true;
            jsinterface.feedback.connect(this, this.feedback);
            jsinterface.notify.connect(this, this.notify);
        }
    };
    //! <!--  [ connect slots ] -->

    this.feedback = function (feedbackjson, func) {
        var msg = $.parseJSON(feedbackjson);
        if (msg.error)
            msg = msg.error;
        if (msg.message)
            msg = msg.message;
        var cmd = 'var a=' + func + ';a("' + msg + '")';
        eval(cmd);
    }
    this.notify = function (notifyjson) {
        var data = $.parseJSON(notifyjson);
        var cmd;
        if (!data | !data.type)
            return;
        switch (data.type) {
            case "block":
                cmd = 'var a=' + notifyblockfunc + ';a(data);';
                break;
            case "tx":                
                if (!notifytx.func || !data.tx || !data.tx.ids)
                    return;
                var found = false;
                for (var i in notifytx.ids) {
                    for (var j in data.tx.ids) {
                        if (Coin_API.areIDsEqual(data.tx.ids[j], notifytx.ids[i])) {
                            found = true;
                            break;
                        }
                    }
                    if (found)
                        break;
                }
                if (!found)
                    return;
                cmd = 'var a=' + notifytx.func + ';a(data);';
                break;
            case "accountSwitch":
                cmd = 'var a=' + notifyaccountfunc + ';a(data);';
                break;
            case "newID":
                cmd = 'var a=' + notifyidfunc + ';a(data);';
                break;
            case "fallback":
                cmd = 'var a=' + notifyfallbackfunc + ';a(data);';
                break;            
        }
        eval(cmd);
    }
    this.call = function (cmd, datajson, successfunc, errorfunc, async) {
        this.connectSlots();
        if (async) {
            var callID = jsinterface.jscallasync(cmd, JSON.stringify(datajson), successfunc, errorfunc);
            callIDs.push(callID);
            return;
        }
        var jsreply;
        var jsreplyjson = jsinterface.jscall(cmd, JSON.stringify(datajson));
        try {
            jsreply = $.parseJSON(jsreplyjson);
        }
        catch (e) {
            errorfunc(jsreplyjson);
        }
        if (!jsreply) {
            errorfunc("api error");
            return;
        }
        if (jsreply.error) {
            if (jsreply.error.message)
                errorfunc(jsreply.error.message);
            else
                errorfunc(jsreply.error);
            return;
        }
        successfunc(jsreply);
    };
    this.icall = function (cmd, datajson) {
        var jsreply;
        var jsreplyjson = jsinterface.jscall(cmd, JSON.stringify(datajson));
        if (jsreplyjson == "null" || !jsreplyjson) {
            return null;
        }
        if (jsreplyjson == '"OK"' || jsreplyjson == '"success"' || jsreplyjson == "OK" || jsreplyjson == "success")
            return true;
        try {
            jsreply = $.parseJSON(jsreplyjson);
        }
        catch (e) {
            console.log("icall error:" + cmd + e);
            return false;
        }
        if (jsreply.error) {
            if (jsreply.error.message)
                console.log("icall error:" + cmd + " " + jsreply.error.message);
            else
                console.log("icall error:" + cmd + " " + jsreply.error);
            return false;
        }
        return jsreply;
    };
    this.getAccountID = function () {
        return this.icall("getmainid", []);
    };
    this.getIDs = function (id) {
        var jsreply = this.icall("getidlist", [id]);
        return jsreply.ids;
    };
    this.requestPayment = function (fromIDs, toID, color,amount, content, feerate, locktime, success, error) {
        var data = [];
        var request = {};
        if (!fromIDs) {
            error("sender account id empty");
            return;
        }
        if (!Object.prototype.toString.call(fromIDs) == '[object Array]')
            fromIDs = [fromIDs];
        if (!toID) {
            error("recepient account id empty");
            return;
        }
        if (isNaN(amount)) {
            error("recepient amount is not number");
            return;
        }
        if (!amount) {
            error("recepient amount not set");
            return;
        }
        if (amount < 0) {
            error("recepient amount less than zero");
            return;
        }
        if (isNaN(color)) {
            error("color is not number");
            return;
        }
        
        if (color < 0|color>2|color!==parseInt(color)) {
            error("color is not valid");
            return;
        }
        request.color=color;
        request.ids = fromIDs;
        request.vout = [];
        var vout = {};
        vout.id = toID;
        vout.amount = amount;
        if (locktime && !isNaN(locktime))
            vout.locktime = locktime;
        if (content)
            vout.content = content;
        if (feerate && (!isNaN(feerate)))
            request.feerate = feerate;
        request.vout[0] = vout;
        data[0] = request;
        this.call("requestpayment", data, success, error, false);
    }
    this.requestPaymentMulti = function (fromIDs, recievers, color, feerate, success, error) {
        var data = [];
        var request = {};
        if (!fromIDs) {
            error("sender account id empty");
            return;
        }
        if (!Object.prototype.toString.call(fromIDs) == '[object Array]')
            fromIDs = [fromIDs];

        if (!Object.prototype.toString.call(recievers) == '[object Array]')
            recievers = [recievers];

        request.color=color;
        request.ids = fromIDs;
        request.vout = [];
        if (feerate && (!isNaN(feerate)))
            request.feerate = feerate;

        $.each(recievers, function(index, reciever){
            var toID = reciever.toID;
            var amount = reciever.amount;
            var locktime = reciever.locktime;
            var content = reciever.content;

            if (isNaN(color)) {
                error("color is not number");
                return;
            }
            if (color < 0|color>2|color!==parseInt(color)) {
                error("color is not valid");
                return;
            }
            var vout = {};
            vout.id = toID;
            vout.amount = amount;
            if (locktime && !isNaN(locktime))
                vout.locktime = locktime;
            if (content)
                vout.content = content;
            request.vout.push(vout);
        });
        data[0] = request;
        this.call("requestpayment", data, success, error, false);
    }
    this.requestDeposit = function (fromIDs, toID, amount,content,feerate, locktime, success, error) {
        var data = [];
        var request = {};
        if (!fromIDs) {
            error("sender account id empty");
            return;
        }
        if (!Object.prototype.toString.call(fromIDs) == '[object Array]')
            fromIDs = [fromIDs];
        if (!toID) {
            error("recepient account id empty");
            return;
        }
        if (isNaN(amount)) {
            error("recepient amount is not number");
            return;
        }
        if (!amount) {
            error("recepient amount not set");
            return;
        }
        if (amount < 0) {
            error("recepient amount less than zero");
            return;
        }        
       
        request.color=2;
        request.ids = fromIDs;
        request.vout = [];
        var vout = {};
        vout.id = toID;
        vout.amount = amount;
        if (locktime && !isNaN(locktime))
            vout.locktime = locktime;
        else
            error("locktime is 0 for deposit");
         locktime=parseInt(locktime);
        if (content)
            vout.content = content;
        if (feerate && (!isNaN(feerate)))
            request.feerate = feerate;
        request.vout[0] = vout;
        request.type=17;
        data[0] = request;
        this.call("requestpayment", data, success, error, false);

    }
    //request stain, return a stain tx, for next step stain mining
    this.requestStain = function (fromIDs, color,amount,feerate,success, error) {
        var data = [];
        var request = {};
        if (!fromIDs) {
            error("sender account id empty");
            return;
        }
        if (!Object.prototype.toString.call(fromIDs) == '[object Array]')
            fromIDs = [fromIDs];      
        if (color != 1) {
            error("color is not valid");
            return;
        }
        if (isNaN(amount)) {
            error("recepient amount is not number");
            return;
        }
        if (!amount) {
            error("recepient amount not set");
            return;
        }
        if (amount < 0) {
            error("recepient amount less than zero");
            return;
        }
        request.type="stain";
        request.ids = fromIDs;
        request.color=color;
        request.vout = [];        
        request.amount = amount;        
        if (feerate && (!isNaN(feerate)))
            request.feerate = feerate;        
        data[0] = request;
        console.log(data);
        this.call("requeststain", data, success, error, false);

    }
     this.requestSignSendTx = function (id,tx,success, error) {
        var data = [];     
        var request = {};
        if (!id) {
            error("sender account id empty");
            return;
        }
        request.id=id;
        if (!tx) {
            error("tx empty");
            return;
        }         
        request.tx=tx;
        data[0] = request;
        this.call("requestsignsendtx", data, success, error, false);
    }
    //request vote
    this.requestVote = function (fromIDs, cheques,votelist,feerate,success, error) {
        var data = [];
        var request = {};
        if (!fromIDs) {
            error("sender account id empty");
            return;
        }
        if (!Object.prototype.toString.call(fromIDs) == '[object Array]')
            fromIDs = [fromIDs]; 
        request.type="vote";
        request.ids = fromIDs;        
        if(Object.prototype.toString.call(cheques) == '[object Array]')
            request.vin=cheques;
        request.votelist = votelist;                
        if (feerate && (!isNaN(feerate)))
            request.feerate = feerate;        
        data[0] = request;
        console.log(data);
        this.call("requestvote", data, success, error, false);

    }
    this.requestOverride = function (id, txid, feerate, locktime, success, error) {
        var p = {};
        if (locktime && !isNaN(locktime))
            p.locktime = locktime;
        if (feerate && (!isNaN(feerate)))
            p.feerate = feerate;
        this.call("requestoverride", [id, txid, p], success, error, false);
    }
    this.createTxByContent = function (ctt, feeRate, toId, deposit, locktime) {
        feeRate = typeof feeRate === "undefined" ? 0 : feeRate;
        locktime = typeof locktime === "undefined" ? 0 : locktime;
        deposit = typeof deposit === "undefined" ? 0 : deposit;

        var accountID = Coin_API.getAccountID();
        var targetID = toId ? toId : (locktime > 0 ? accountID : "");
        var f;
        if (toId)
            locktime = 0;
        this.call("requestpayment2", [accountID, targetID, [ctt.hex], feeRate, deposit, locktime], function (r) {
            f = r;
        }, function (e) {
            console.log(e);
            f = e;
        }, false);
        return f;
    };
    this.createTxByContents = function (ctts, feeRate, toId, deposit, locktime) {
        locktime = typeof locktime === "undefined" ? 0 : locktime;
        deposit = typeof deposit === "undefined" ? 0 : deposit;
        var accountID = Coin_API.getAccountID();
        var targetID = toId ? toId : (locktime > 0 ? accountID : "");
        var f;
        if (toId) {
            deposit = 0;
            locktime = 0;
        }
        var cttInput = [];
        for (var i in ctts)
            cttInput.push(ctts[i].hex);
        this.call("requestpayment2", [accountID, targetID, cttInput, feeRate, deposit, locktime], function (r) {
            f = r;
        }, function (e) {
            f = e;
        }, false);
        return f;
    };
    this.listtransactions = function (id, success, error, number, offset) {
        var data = [];
        data[0] = id;
        data[1] = (number && isNaN(number)) ? number : 10000;
        data[2] = (offset && isNaN(offset)) ? offset : 0;
        this.call("listtransactions", data, function (result) {
            if (success)
                success(result);
        }, function (e) {
            if (error)
                error(e);
        });

    };
    this.getTxs = function(id, number, offset){
        var number = (number && isNaN(number)) ? number : 10000;
        var offset = (offset && isNaN(offset)) ? offset : 0;
        this.icall("listtransactions", [id, 10000, 0]);
    };
    this.clearCache = function () {
        return this.icall("clearcache", []);
    }
    this.getBalance = function (id, fUseWallet,flag) {
        if (typeof fUseWallet === "undefined")
            fUseWallet = true;
        if (typeof flag === "undefined")
            flag = 0;
        return this.icall("getbalance", [[id], fUseWallet,flag])
    }
    this.regNotifyBlocks = function (func) {
        this.connectSlots();
        notifyblockfunc = func;
    };
    this.regNotifyTxs = function (func, ids) {
        this.connectSlots();
        notifytx.func = func;
        notifytx.ids = ids;
    };
    this.regNotifyPeers = function (func) {
    }
    this.regNotifyAccount = function (func) {
        this.connectSlots();
        notifyaccountfunc = func;
    }
    this.regNotifyFallback = function (func) {
        this.connectSlots();
        notifyfallbackfunc = func;
    }
    this.regNotifyID = function (func) {
        this.connectSlots();
        notifyidfunc = func;
    }
    this.getInfo = function () {
        return this.icall("getinfo", [])
    };
    this.getLang = function () {
        return this.icall("getlang");
    }
    this.setLang = function (lang) {
        return this.icall("setlang", [lang]);
    }
    this.getBlockCount = function () {
        return JSON.stringify(this.icall("getblockcount", []));
    };
    this.getblockchaininfo = function () {
        return this.icall("getblockchaininfo", []);
    };
    this.getContentByLink = function (c, f) {
        f = typeof f === "undefined" ? 6 : f;
        return this.icall("getcontentbylink", [c, f]);
    };
    this.getHash = function (a) {
        return this.icall("gethash", [a]);
    };
    this.getBlockByHeight = function(height){
        return this.icall("getblockbyheight", [height]);
    };
    this.getTransaction = function(txid){
        return this.icall("getrawtransaction", [txid, 1]);
    };
    this.goToCustomPage = function (a) {
        return this.icall("gotocustompage", [a]);
    };

    this.getMiningInfo = function () {
        return this.icall("getmininginfo", [])
    }
    this.setGenerate = function (generate, mode,id, kernels, fnewkey, success, error,cheques) {
        fnewkey = typeof fnewkey === "undefined" ? false : fnewkey;
        if(!cheques)
            cheques=[];
        this.call("setgenerate", [generate,mode, Number(kernels), id, fnewkey,cheques], function (a) {
            if (success)
                success(a);
        }, function (e) {
            if (error)
                error(e);
        });
    }
    this.poolMine=function(generate,blockheader,kernels,beginnonce,endnonce,nbit,success,error){
        this.call("poolmine", [generate,blockheader, Number(kernels), Number(beginnonce),Number(endnonce),Number(nbit)], function (a) {
            if (success)
                success(a);
        }, function (e) {
            if (error)
                error(e);
        });
    }
    this.stainMine = function (generate, tx, kernels, success, error) {        
        this.call("stainmine", [generate,tx,Number(kernels)], function (a) {
            if (success){                
                success(a);
            }
        }, function (e) {
            if (error)
                error(e);
        });
    }
    this.getPOSTxs=function(id,prevBlockHash,interestrate,feerate){    
        this.call("getpostxs", [prevBlockHash, Number(interestrate),id,feerate], function (a) {
            if (success)
                success(a);
        }, function (e) {
            if (error)
                error(e);
        });
    }
    this.getLockInterestRate=function(lockblocks,blockheight)
    {
        if (!blockheight)
            blockheight=0;
        return this.icall("getlockinterestrate",[lockblocks,blockheight]);
    }
    this.getPOSInterestRate=function(blockheight)
    {
        if (!blockheight)
            blockheight=0;
        return this.icall("getposinterestrate",[blockheight]);
    }
    this.getUnspent = function (id) {
        if (Object.prototype.toString.call(id) != '[object Array]')
            id = [id];
        return this.icall("listunspent2", [id]);
    }
    this.setConf = function (app, idlocal, idforeign, conf, value) {
        if (!value)
            value = "";
        return this.icall("setconf", [app, idlocal, idforeign, conf, String(value)]);
    }
    this.getConf = function (app, idlocal, idforeign, conf) {
        var result = this.icall("getconf", [app, idlocal, idforeign, conf]);
        if (result.error)
            return "";
        return $.parseJSON(result);
    }
    this.writeFile = function (app, path, filename, filestring) {
        return this.icall("writefile", [app, path, filename, filestring]);
    }
    this.writeFileBase64 = function (filename, filestring) {
        return this.icall("writefile2", [filename, filestring]);
    }
    this.readFile = function (app, path, filename) {
        var result = this.icall("readfile", [app, path, filename]);
        if (result.error)
            return "";
        return result;
    }
    this.getSettings = function () {
        return this.icall("getsettings");
    }
    this.updateSettings = function (type1, type2, value) {
        return this.icall("updatesettings", [String(type1), String(type2), String(value)]);
    }
    this.signMessage = function (id, msg4sig) {
        return this.icall("signmessage", [id, msg4sig]);
    };
    this.getFeeRate = function (point) {
        if (typeof point === "undefined")
            return this.icall("getfeerate", []);
        else
            return this.icall("getfeerate", [point]);
    };
    this.getVoteRanking = function (height,count) {        
            return this.icall("getvoteranking", [height,count]);
    };
    this.getlotteryrewards = function (height) {        
            return this.icall("getlotteryrewards", [height]);
    };
    ////////////////////////////////////////////////////////////////////////////////////////////
    //Below is lib funcs
    this.checkNameKey = function (id) {
        return this.icall("isvalidpubkeyaddress", [id]);
    };

    this.getMatureTime = function (locktime) {
        return this.icall("getmaturetime", [locktime]);
    }
    this.areIDsEqual = function (id1, id2) {
        return id1==id2;
    };
    this.b58CheckEncode = function (hex) {
        return this.icall("encodebase58check", [hex]);
    }
    this.b58CheckDecode = function (b58) {
        return this.icall("decodebase58check", [b58]);
    }
    this.verifyMessage = function (id, sig, msg4sig, success, error) {
        this.call("verifymessage", [id, sig, msg4sig], function (a) {
            if (success)
                success(a);
        }, function (e) {
            if (error)
                error(e);
        });
    }

};