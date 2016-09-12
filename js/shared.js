var satoshi = 1000000;
var root = "/";
var resource = "../";
var war_checksum;
var min = true;
var isExtension = false;
var APP_VERSION = "1.0";
var APP_NAME = "javascript_web";
var IMPORTED_APP_NAME = "external";
var IMPORTED_APP_VERSION = "0";
var gParam = {}; // global params
var ColorName=new Array("Raw Stone","Mind Stone", "Mind Asset");
var ColorFeeRate=new Array(100000,100000,1000);
function stripHTML(a) {
    return $.trim($("<div>" + a.replace(/(<([^>]+)>)/ig, "") + "</div>").text())
}
$.fn.center = function () {
    scrollTo(0, 0);
    this.css("top", parseInt(Math.max(($(window).height() / 2) - (this.height() / 2), 0)) + "px");
    this.css("left", parseInt(Math.max(($(window).width() / 2) - (this.width() / 2), 0)) + "px");
    return this;
};

//if (!window.console) {
//    var names = ["log", "debug", "info", "warn", "error", "assert", "dir", "dirxml", "group", "groupEnd", "time", "timeEnd", "count", "trace", "profile", "profileEnd"];
//    window.console = {};
//    for (var i = 0; i < names.length; ++i) {
//        window.console[names[i]] = function () {
//        }
//    }
//}


Date.prototype.sameDayAs = function (a) {
    return((this.getFullYear() == a.getFullYear()) && (this.getMonth() == a.getMonth()) && (this.getDate() == a.getDate()))
};
function padStr(a) {
    return(a < 10) ? "0" + a : "" + a
}
function convert(a, b) {
    return(a / b).toFixed(2).toString().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,")
}
function sShift(a) {
    return(satoshi / a.conversion).toString().length - 1
}

function updateQueryString(b, d, a) {
    if (!a) {
        a = window.location.href
    }
    var c = new RegExp("([?|&])" + b + "=.*?(&|#|$)(.*)", "gi");
    if (c.test(a)) {
        if (typeof d !== "undefined" && d !== null) {
            return a.replace(c, "$1" + b + "=" + d + "$2$3")
        } else {
            return a.replace(c, "$1$3").replace(/(&|\?)$/, "")
        }
    } else {
        if (typeof d !== "undefined" && d !== null) {
            var f = a.indexOf("?") !== -1 ? "&" : "?", e = a.split("#");
            a = e[0] + f + b + "=" + d;
            if (e[1]) {
                a += "#" + e[1]
            }
            return a
        } else {
            return a
        }
    }
}
function loadScript(j, h, a) {
    var f = false;
    $("script").each(function () {
        var e = $(this).attr("src");
        if (e && e.replace(/^.*[\\\/]/, "").indexOf(j) == 0) {
            h();
            f = true;
            return false
        }
    });
    if (f) {
        return
    }
    console.log("Load " + j);
    var d = false;
    var c = document.createElement("script");
    c.type = "text/javascript";
    c.async = true;
    c.src = resource + j + (min ? ".min.js" : ".js") + "?" + war_checksum;
    try {
        c.addEventListener("error", function (k) {
            d = true;
            if (a) {
                a("Error Loading Script. Are You Offline?")
            }
        }, false);
        c.addEventListener("load", function (k) {
            if (!d) {
                h()
            }
        }, false)
    } catch (g) {
        setTimeout(function () {
            if (!d) {
                h()
            }
        }, 10000)
    }
    var b = document.getElementsByTagName("head")[0];
    b.appendChild(c)
}

function showID(id) {
    return id;
}
;

function getB64DataFromLink(clink) {
    var cj = (Coin_API.getContentByLink(clink));
    r = this.getFileContentFrJson(cj);
    return r;//rcreateImgHtml(r);
}
;
function parseTx(tx, IDs) {
    //console.log(IDs);
    tx.amount = 0;
    if (!tx.blockheight)
        tx.confirmations = 0;
    if (tx.iscoinbase) {
        tx.category = "minted";
        tx.address="";
        for (var j in tx.vout){
            //console.log(tx.vout[j].scriptPubKey);
            if(tx.vout[j].scriptPubKey&&tx.vout[j].scriptPubKey.addresses){
                for(var i in IDs){   
                    if(tx.vout[j].scriptPubKey.addresses[0]==IDs[i])
                    {
                        tx.address = tx.vout[j].scriptPubKey.addresses[0];
                        tx.amount += Number(tx.vout[j].value);
                        break;
                    }
                }
            }
        }
        
    } else if(tx.isstaining){
        tx.category="staining";
        tx.address="";
        for (var j in tx.vout){
            if(tx.vout[j].scriptPubKey&&tx.vout[j].scriptPubKey.addresses){
                for(var i in IDs){   
                    if(tx.vout[j].scriptPubKey.addresses[0]==IDs[i])
                    {
                        tx.address = tx.vout[j].scriptPubKey.addresses[0];
                        tx.amount += Number(tx.vout[j].value);
                        break;
                    }
                }
            }
        }
        for (var j in tx.vin){
             if(tx.vin[j].scriptPubKey&&tx.vin[j].scriptPubKey.addresses){
                for(var i in IDs){   
                    if(tx.vin[j].scriptPubKey.addresses[0]==IDs[i])
                    {
                        tx.address = tx.vin[j].scriptPubKey.addresses[0];
                        tx.amount -= Number(tx.vin[j].value);
                        break;
                    }
                }
            }
            
        }      
    }else if(tx.ispos){
        tx.category="pos";
        for (var j in tx.vout)
            tx.amount += Number(tx.vout[j].value);
        for (var j in tx.vin)
            tx.amount -= Number(tx.vin[j].value);
        if(tx.vout[0].scriptPubKey&&tx.vout[0].scriptPubKey.addresses)
            tx.address = tx.vout[0].scriptPubKey.addresses[0];
        else
            tx.address="";
    }
    else {
        var fromLocal = false;
        var fromForeign = false;
        var toForeign = false;
        var fromLocalAddress;
        var fromForeignAddress;
        var toForeignAddress;
        var toLocalAddress;
        for (var j in tx.vin) {
            var inid = tx.vin[j].scriptPubKey.addresses[0];
            var isOwnID = false;
            for (var k in IDs)
                if (IDs[k] == inid)
                    isOwnID = true;
            if (isOwnID) {
                fromLocal = true;
                tx.amount -= Number(tx.vin[j].value);
                fromLocalAddress = inid;
            } else {
                fromForeign = true;
                fromForeignAddress = inid;
            }
        }
        for (var j in tx.vout) {

            var outid = "N/A";
            if (tx.vout[j].scriptPubKey.addresses)
                outid = tx.vout[j].scriptPubKey.addresses[0];
            var isOwnID = false;
            for (var k in IDs)
                if (IDs[k] == outid)
                    isOwnID = true;
            if (isOwnID) {
                tx.amount += Number(tx.vout[j].value);
                toLocalAddress = outid;
            } else {
                toForeign = true;
                toForeignAddress = outid;
            }
        }
        if (fromLocal && fromForeign) {
            if (tx.amount > 0) {
                tx.category = "receive";
                tx.address = fromForeignAddress;
            }
            else {
                tx.category = "send";
                tx.address = toLocalAddress;
            }
        } else if (fromForeign) {
            tx.category = "receive";
            tx.address = fromForeignAddress;
        } else if (toForeign) {
            tx.category = "send";
            tx.address = toForeignAddress;
        } else {
            if(tx.amount>0)
                tx.category="deposit";
            else
                tx.category = "toSelf";
            tx.address = toLocalAddress;
        }
    }
    tx.amount = tx.amount.toFixed(6);
    return tx;
}
function parseTxDetail(tx){
    if(!tx) return;
    var t = tx.time? new Date(tx.time * 1000): new Date();
    tx.time = CUtil.dateToString(t);
    tx.vinDetail = [];
    tx.voutDetail = [];
    if(tx.iscoinbase){

    }else{
        for(var i in tx.vin){
            var id = "";
            if(tx.vin[i].scriptPubKey.addresses){
                id = tx.vin[i].scriptPubKey.addresses[0];
            }
            
            var val = Number(tx.vin[i].value);
            tx.vinDetail.push({
                address: id,
                val: val
            });
        }
        for(var i in tx.vout){
            var id = "";
            if(tx.vout[i].scriptPubKey.addresses){
                id = tx.vout[i].scriptPubKey.addresses[0];
            }
            
            var val = Number(tx.vout[i].value);
            tx.voutDetail.push({
                address: id,
                val: val
            })
        }
    }
    return tx;
}
function parseBlock(block){
    if(!block) return;
    block.blockHeight = block.height;
    block.size = Number(block.size)/1000;
    var time = block.time? new Date(Number(block.time)*1000): new Date();
    block.time = CUtil.dateToString(time);
    block.txs = [];
    var txidArr = block.tx;
    for(var i = 0; i < txidArr.length; i++){
        var tx = Coin_API.getTransaction(txidArr[i]);
        if(tx.iscoinbase){
            continue;
        }
        tx = parseTxDetail(tx);
        console.log(tx);
        block.txs.push(tx);
    }
    return block;
}
function getStrLinkType(str)
{
    if (CLink.setString(str).isValid())
        return "link_blockchain";
    
    var b58d = Coin_API.b58CheckDecode(str);
    if (b58d && !b58d.error)
        return "id";
    return "other";
}


function resetC2() {
    if ($("#shdr").length > 0) {
        var c1w = $("body").width() - $(".column1").width() - 150;
        $(".column2").css({width: c1w});
    } else {
        var c1w = $(window).width() * 0.95;
        $(".column2").css({left: 0});
        $(".column2").css({width: c1w});
    }
    var height = $(window).height() - 50;
    $(".column2").css({height: height});
}


var CLink = new function () {
    var CLink = this;
    this.nHeight = -1;
    this.nTx = -1;
    this.nVout = -1;
    this.linkname;
    this.linktype = "";
    this.setString = function (str, ln) {
        this.linkname = (typeof ln === 'undefined') ? "" : ln;
        this.nHeight = -1;
        this.nTx = -1;
        this.nVout = -1;
        this.linktype = "";
        if (typeof str === 'undefined')
            return this;
        var pc = str.indexOf(":");
        var head = pc > 0 ? str.substring(0, pc) : "";
        if (pc >= 0)
            str = str.substring(pc + 1);
        var pfd = str.indexOf(".");

        var psd = str.indexOf(".", pfd + 1);
        if (psd >= 0) {
            var ptd = str.indexOf(".", psd + 1);
            if (ptd >= 0)
                return this;
            if (!isNaN(parseInt(str.substring(0, pfd))))
                this.nHeight = parseInt(str.substring(0, pfd));
            if (!isNaN(parseInt(str.substring(pfd + 1))))
                this.nTx = parseInt(str.substring(pfd + 1, psd));
            if (!isNaN(parseInt(str.substring(psd + 1))))
                this.nVout = parseInt(str.substring(psd + 1));
        } else {
            if (!isNaN(parseInt(str.substring(0, pfd))))
                this.nHeight = parseInt(str.substring(0, pfd));
            if (!isNaN(parseInt(str.substring(pfd + 1)))) {
                this.nTx = parseInt(str.substring(pfd + 1));
                this.nVout = 0;
            }
        }
        if (this.isValid())
            this.linktype = "BLOCKCHAIN";
        
        return this;
    };
    this.set = function (nHeight, nTx, nVout) {
        if (typeof nHeight === "undefined")
            return this;
        if (typeof nHeight === "string")
            return this.setString(nHeight);
        if (typeof nHeight !== "number")
            return this;
        if (nHeight < 0) {
            this.nHeight = -1;
            this.nTx = -1;
            this.nVout = -1;
        } else {
            this.nHeight = nHeight;
            this.nTx = typeof nTx === "undefined" ? 0 : nTx;
            this.nVout = typeof nVout === "undefined" ? 0 : nVout;
        }
        return this;
    };
    this.toString = function () {
        return  (this.nHeight >= 0 && this.nTx >= 0) ?
                (this.nVout > 0 ? "ma:" + this.nHeight + "." + this.nTx + "." + this.nVout : "ma:" + this.nHeight + "." + this.nTx) : "";
    };
    this.toHtmlId = function () {
        return  this.nHeight >= 0 && this.nTx >= 0 ?
                (this.nVout > 0 ? this.nHeight + "_" + this.nTx + "_" + this.nVout : this.nHeight + "_" + this.nTx) : "";
    };
    this.isValid = function () {
        return  this.nHeight >= 0 && this.nTx >= 0;
    };
    this.isEmpty = function () {
        return isNaN(this.nHeight) || isNaN(this.nTx);
    };
    this.cmp = function (l1, l2) { // compare, invalid input link return false, l1 > l2 return 1, equal return 0, l1 < l2 return -1
        if (!this.set(l1).isValid())
            return false;
        var h1 = this.nHeight;
        var t1 = this.nTx;
        var o1 = this.nVout;
        if (!this.set(l2).isValid())
            return false;
        var h2 = this.nHeight;
        var t2 = this.nTx;
        var o2 = this.nVout;
        if (h1 != h2)
            return h1 > h2 ? 1 : -1;
        if (t1 != t2)
            return t1 > t2 ? 1 : -1;
        if (o1 != o2)
            return o1 > o2 ? 1 : -1;
        return 0;
    };
    this.nVoutPP = function () {
        this.nVout = this.nVout + 1;
        return this;
    };
};

var CUtil = new function () {
    this.decodeDataUrl = function (s) {
        var r = [];
        var t1 = s.split(";");
        var rctt = t1[1];
        var t2 = t1[0].split(":");
        r["type"] = t2[1];
        var t3 = rctt.split(",");
        r["data"] = t3[1];

        return r;
    };
    this.escapeHtml = function (h, br) {
        br = typeof br === "undefined" ? true : br;
        var str = $("<div>").text(h).html();
        str = br ? str.replace(/(?:\r\n|\r|\n)/g, '<br />') : str;
        return str;
    };
    this.copyToClipboard = function (text) {
        window.prompt("Copy to clipboard: Ctrl+C (Cmd+C for mac), Enter", text);
    };
    this.getGet = function (val) {
        var result = null;
        var tmp = [];
        var items = location.search.substr(1).split("&");
        for (var index = 0; index < items.length; index++) {
            tmp = items[index].split("=");
            if (tmp[0] === val)
                result = decodeURIComponent(tmp[1]);
        }
        return result;
    };
    this.setGet = function (idx, val, str) {
        str = typeof str === "undefined" ? window.location.href : str;
        var p = str.split("?");
        if (p.length === 1)
            return str + "?" + idx + "=" + val;
        else if (p.length > 2)
            return false;
        var r;
        var items = p[1].split("&");
        var fReplace = false;
        for (var i in items) {
            var tmp = items[i].split("=");
            if (tmp.length < 2)
                items.splice(i);
            if (tmp[0] === idx) {
                items[i] = idx + "=" + val;
                fReplace = true;
            }
        }
        if (!fReplace)
            items.push(idx + "=" + val);
        r = p[0] + "?" + items.join("&");
        return r;
    };
    this.isLinkHttp = function (lstr) {
        return lstr.substr(0, 4).toLowerCase() === "http";
    };
    this.isLinkHttps = function (lstr) {
        return lstr.substr(0, 5).toLowerCase() === "https";
    };
    this.isLinkMA = function (lstr) {
        return lstr.substr(0, 3).toLowerCase() === "ma";
    };
    this.isLinkBlockChain = function (lstr) {
        var link = CLink.setString(lstr);
        return link.isValid();
    };
    this.cleanNullElem = function (a) { // input of this function must be array
        if (!Array.isArray(a))
            return [];
        var r = [];
        for (var i in a) {
            if (a[i] !== null)
                r.push(a[i]);
        }
        return r;
    };
    this.getBalanceLevel = function (balance) {
        var l = 0;
        var b;
        if (typeof balance === "undefined")
            return false;
        else if (typeof balance === "number")
            b = balance;
        else {
            if (typeof balance.balance_total === "undefined")
                return l;
            else
                b = balance.balance_total;
        }
        b += 0.1; // correct the error for large number division
        l = Math.floor(((Math.log(b) / Math.log(10)) * 2 + 1));
        return l;
    };
    this.initGParam = function (balance) {
        gParam = {};
        gParam.accountID = Coin_API.getAccountID();
        if (typeof balance === "undefined")
            gParam.balance = Coin_API.getBalance(gParam.accountID, false).balance;
        else
            gParam.balance = balance;
    };
    this.getShortPId = function (fullId) {
        return typeof fullId === "undefined" ? "" : fullId.substr(0, 10) + "..." + fullId.substr(fullId.length - 2);
    };
    this.getLongPId = function (fullId) {
        return typeof fullId === "undefined" ? "" : fullId.substr(0, 25) + "..." + fullId.substr(fullId.length - 2);
    };
    this.hasChild = function (o) {
        for (var i in o) {
            if (typeof o[i] === "object")
                return true;
        }
        return false;
    }
    this.formatTimeLength = function (time) {
        var str;
        if (time < 60) {
            str = time.toFixed(3);
            str += " " + TR('seconds');
        }
        else if (time < 60 * 60) {
            str = (time / 60).toFixed(3);
            str += " " + TR('minutes');
        }
        else if (time < 60 * 60 * 24) {
            str = (time / 3600).toFixed(3);
            str += " " + TR('hours');
        }
        else {
            str = (time / (3600 * 24)).toFixed(3);
            str += " " + TR('days');
        }
        return str;
    };
    this.dateToString = function (a) {
        if (a.sameDayAs(new Date())) {
            return TR('Today') + " " + padStr(a.getHours()) + ":" + padStr(a.getMinutes()) + ":" + padStr(a.getSeconds())
        } else {
            return padStr(a.getFullYear()) + "-" + padStr(1 + a.getMonth()) + "-" + padStr(a.getDate()) + " " + padStr(a.getHours()) + ":" + padStr(a.getMinutes()) + ":" + padStr(a.getSeconds())
        }
    }
    this.dateToShortString = function (a) {
        if (a.sameDayAs(new Date())) {
            return TR('Today') + " " + padStr(a.getHours()) + ":" + padStr(a.getMinutes()) + ":" + padStr(a.getSeconds())
        } else {
            return padStr(a.getFullYear()) + "-" + padStr(1 + a.getMonth()) + "-" + padStr(a.getDate());
        }
    };
    this.isIdDev = function (id) {
        return id === "N7IWEOEBHWMBUM3GZD3GXY2LEDTKDSP2HAL5QWCK";
    };
   
    this.isArray = function (i) {
        return  (Object.prototype.toString.call(i) === "[object Array]");
    }
};

var CPage = new function () {
    this.prepareNotice = function (page) {
        var nDiv = $("#main-notices-container-tpl").clone(true, true);
        nDiv.attr("id", "main-notices-container").removeClass("hide");
        switch (page) {
            case "homepage":
            case "link":            
                $(".column2").prepend(nDiv);
                break;            
            case "wallet":            
            case "miner":
            case "tools":            
            default:
                $(".main-container").prepend(nDiv);
                break;
        }
    };
    this.showNotice = function (n, t, s, a) { // t: type n/e/w for normal/error/warning
        t = typeof t !== 'undefined' ? t : "n";
        s = typeof s !== 'undefined' ? s : 5;
        a = typeof a !== 'undefined' ? a : 1;
        $("#notices").removeClass("error").removeClass("warning");
        switch (t) {
            case "e":
                $("#notices").addClass("error");
                break;
            case "w":
                $("#notices").addClass("warning");
                break;
            case "n":
            default:
                break;
        }
        $("#notices").html(n).show();
        $("#notices").delay(s * 1000).hide(a * 1000);
    };
    this.prepareHeader = function (fShowId) {
        fShowId = typeof fShowId === "undefined" ? false : fShowId;
        var ddiv = $("#header-info-tpl").clone(true, true);
        ddiv.find(".navi-name").html(gParam.accountID).attr("fullid", gParam.accountID);
        if (fShowId)
            ddiv.find(".navi-name").parent().removeClass("hide");
        $("#navi-bar").find(".container").append(ddiv.children());
        $('#cblc').html(Coin_API.getBlockCount());
    };
    this.createImgHtml = function (ftype, fdata) {
        if (typeof ftype === "undefined")
            return false;
        if (!ftype)
            return false;
        if ($.inArray(ftype, CONTENT_FILE_TYPE.image) < 0)
            return false;
        var idiv = $('<img/>', {
            type: ftype,
            src: this.createImgSrc(ftype, fdata),
        });
        return idiv;
    };
    this.createImgSrc = function (type, b64) {
        return   "data:" + type + ";base64," + b64;
    };
    this.getBalanceHtml = function (bl, number) {
        number = typeof number === "undefined" ? false : number;
        if (bl == 0)
            return "";
        var ml = Math.min(Math.floor((bl - 1) / 4), 4);
        var sl = bl - ml * 4;
        var p = $("<div />");
        var div = $("<div />");
        div.addClass("icon20");
        
        for (var i = 0; i < sl; i++)
            p.append(div.clone(true, true));
        if (number)
            p.append($("<span />").html(TR("Deposit: ma") + number).css("margin", 20).addClass("grey_a"));
        return p;
    };
    this.updateBalance = function (b) {
        gParam.accountID = Coin_API.getAccountID();
        if (typeof b !== "undefined")
            gParam.balance = b;
        else
            gParam.balance = Coin_API.getBalance(gParam.accountID, false).balance;
        var bl = CUtil.getBalanceLevel(gParam.balance);
        if (!bl)
            return;
        $("#blclvl").html(this.getBalanceHtml(bl));
        $('#balance').html(gParam.balance.balance_total);
    };
    this.updateCblc = function () {
        $('#cblc').html(Coin_API.getBlockCount());
    };
    this.prepareProdDiv = function () {
        var ddiv = $("#prod-tpl").clone(true, true).removeAttr("id").removeClass("hide");
        var pdiv = $("#poster-tpl").clone(true, true).removeAttr("id");
        var cdiv = $("#cmt-tpl").clone(true, true).removeAttr("id");
        var bdiv = $("#buy-btn-tpl").clone(true, true).removeAttr("id");
        cdiv.find(".cmt").append(bdiv.children());
        ddiv.find(".container").prepend(pdiv.children());
        ddiv.find(".container").find(".brctt").append(cdiv.children());
        return ddiv;
    };
    this.notifyBlock = function (b) {
        $('#cblc').html(b.blockHeight);
        if (currentTab === "br-new-btn")
            $('#getnew-btn').removeClass("hide");
        else
            $('#getnew-btn').addClass("hide");
    };
    this.notifyAccount = function (b) {
        this.updateBalance();
        $("#navi-bar").find(".container").find(".navi-name").html(gParam.accountID).attr("fullid", gParam.accountID);
    };
    this.registerNotifications = function () {
        var aa = function (a) {
            CPage.notifyBlock(a);
        };
        var ab = function (a) {
            CPage.notifyAccount(a);
        };
        Coin_API.regNotifyBlocks(aa);
        Coin_API.regNotifyAccount(ab);
    }
    this.initDatePickerOptions = function () {
        var tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        var options = {
            altFormat: '@',
            dateFormat: 'yy-mm-dd',
            minDate: tomorrow
        };
        if (langCode == "zh") {
            for (var k in $.datepicker.regional["zh-CN"])
                options[k] = $.datepicker.regional["zh-CN"][k];
        }
        return options;

    }
};