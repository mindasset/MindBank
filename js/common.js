Vue.filter('getDate', function (value){
    var today = new Date(value);
    var year = today.getFullYear();
    var month = today.getMonth() + 1;
    var day = today.getDate();
    return year + '-' + month + '-' + day;
});

var CommonModalRecieveAddressNew = Vue.extend({
    template: '#recieve-modal-new-address',
    data: function(){
        return {
            store: store
        };
    }
});
var CommonModalSendAddressNew = Vue.extend({
    template: '#send-modal-new-address',
    data: function(){
        return {
            store: store,
            addressStore: addressStore,
            newAddress: {
                alias: '',
                id: '',
                error: ''
            }
        };
    },
    methods: {
        save: function(){
            var obj = {};
            if(this.newAddress['id']){
                obj['alias'] = this.newAddress['alias'];
                obj['id'] = this.newAddress['id'];
                this.addressStore.paymentAddresses.push(obj);
                var adfile = JSON.stringify(this.addressStore.paymentAddresses);
                Coin_API.writeFile("wallet", "addressbook", "adb.json", adfile);
                this.newAddress ={
                    alias: '',
                    id: '',
                    error: ''
                };
                this.store.newSendAddressModalShow = 0;
            }else{
                  this.newAddress['error'] = TR('Invalid address');
            }
        },
        hide: function(){
            this.newAddress = [];
            this.store.newSendAddressModalShow = 0;
        }
    }
});
var CommonModalRecieveAddressQr = Vue.extend({
    template: '#recieve-modal-qr-address',
    props: ['isShow', 'address', 'label'],
    data: function(){
        return {
            store: store,
            isPay: false,
            amount: 1,
            msg: ''
        };
    },
    computed: {
        link: function(){
            var pre = 'mindasset:';
            var link = pre + this.store.qrAddress;
            var paramsArr = [];
            if(this.store.qrLabel){
                paramsArr.push('label=' + this.store.qrLabel);
            }
            if(this.msg){
                paramsArr.push('message=' + this.msg);
            }
            if(this.isPay){
                paramsArr.push('amount=' + this.amount);
            }
            if(paramsArr.length > 0){
                link = link + '?' + paramsArr.join('&');
            }
            return link;
        }
    },
    watch: {
        link: function(val, oldVal){
            var wrap = $(this.$els.canvas);
            wrap.children().remove();
            wrap.qrcode({
                width: 150,
                height: 150,
                text: this.link
            });
        }
    },
    methods: {
        saveQr: function(){
            var canvas = $(this.$els.canvas).find('canvas')[0];
            var img = canvas.toDataURL("image/png").replace("image/png", "image/octet-stream");
            window.location.href = img;
        }
    }
});
var CommonModalSendAddressQr = Vue.extend({
    template: '#send-modal-qr-address',
    data: function(){
        return {
        	store: store,
            msg: ''
        };
    },
    computed: {
        link: function(){
            var pre = 'mindasset:';
            var link = pre + this.store.qrAddress;
            var paramsArr = [];
            if(this.store.qrLabel){
                paramsArr.push('label=' + this.store.qrLabel);
            }
            if(this.msg){
                paramsArr.push('message=' + this.msg);
            }
            if(paramsArr.length > 0){
                link = link + '?' + paramsArr.join('&');
            }
            var wrap = $(this.$els.canvas);
            wrap.children().remove();
            wrap.qrcode({
                width: 150,
                height: 150,
                text: link
            });
            return link;
        }
    },
    methods: {
        saveQr: function(){
            var canvas = $(this.$els.canvas).find('canvas')[0];
            var img = canvas.toDataURL("image/png").replace("image/png", "image/octet-stream");
            window.location.href = img;
        }
    }
});
var CommonModalRecieveAddress = Vue.extend({
	template: '#common-modal-recieve-address',
	data: function(){
		return {
			store: store,
            addresses: ModalRecieveAddressData
		}
	},
    computed: {
        selectedAddresses: function(){
            var addresses = this.addresses;
            addresses = addresses.filter(function(item){
                return item.selected;
            });
            return addresses;
        },
        showOnOne: function(){
            return this.selectedAddresses.length != 1;
        },
        showOnMulti: function(){
            return this.selectedAddresses.length < 1;
        }
    },
	methods: {
		showModalNewAddress: function(){
			store.newRecieveAddressModalShow = 1;
		},
		hide: function(){
			this.store.recieveAddressModalShow = false;
		},
        showModalQrAddress: function(){
            if(this.selectedAddresses.length == 1){
                store.qrLabel = this.selectedAddresses[0].label;
                store.qrAddress = this.selectedAddresses[0].address;
                store.qrRecieveAddressModalShow = 1;
            }
        },
        copyAddress: function(){

        }
	}
});
var CommonModalSendAddress = Vue.extend({
    template: '#common-modal-send-address',
    data: function(){
        return {
            store: store,
            addressStore: addressStore
        }
    },
    computed: {
        addresses: function(){
            return this.addressStore.paymentAddresses;
        },
        selectedAddresses: function(){
            var addresses = this.addresses;
            addresses = addresses.filter(function(item){
                return item.selected;
            });
            return addresses;
        },
        showOnOne: function(){
            return this.selectedAddresses.length != 1;
        },
        showOnMulti: function(){
            return this.selectedAddresses.length < 1;
        }
    },
    methods: {
        showModalNewAddress: function(){
            this.store.newSendAddressModalShow = 1;
        },
        hide: function(){
            this.store.sendAddressModalShow = 0;
            $.each(this.addresses, function(index, item){
                item.selected = false;
            });
        },
        showModalQrAddress: function(){
            if(this.selectedAddresses.length == 1){
                store.qrLabel = this.selectedAddresses[0].alias;
                store.qrAddress = this.selectedAddresses[0].id;
                store.qrSendAddressModalShow = 1;
            }
        },
        copyAddress: function(){
             if(this.selectedAddresses.length == 1){
                CUtil.copyToClipboard(this.selectedAddresses[0].id);
            }
        },
        remove: function(){
            var self = this;
            $.each(this.selectedAddresses, function(index, item){
                self.addressStore.paymentAddresses.$remove(item);
            });
            var adfile = JSON.stringify(this.addressStore.paymentAddresses);
            Coin_API.writeFile("wallet", "addressbook", "adb.json", adfile);
        },
        confirm: function(){
            if(this.selectedAddresses.length == 1){
                this.store.selectAddressCallback(this.selectedAddresses[0]);
                this.hide();
            }
        }
    }
});
var CommonModalSign = Vue.extend({
	template: '#common-modal-sign',
	data: function(){
        return {
            'store': store,
            accountStore: accountStore,
            'signmsg': '',
            'signresult': '',
            'validatemsg': '',
            'validatesign': '',
            validateResult: '',
            signerr:''
        }
    },
    computed: {
    },
	methods: {
        hide: function(){
            this.store.signModalShow = 0;
            this.clearsign();
            this.clearvalidate();
        },
        goSign: function(){
            //this.clearsign();
             this.store.signModalShow = 1;
        },
        goValidate: function(){
           // this.clearvalidate();
             this.store.signModalShow = 2;
        },
        getSignResult: function(){
            var sig = Coin_API.signMessage(this.accountStore.accountID, this.signmsg);
            console.log(sig)
            if (!sig || sig.length != 88){
                this.signerr = TR("Please unlock your account first");
                return false;
            }
            this.signresult = sig;
            return sig;
        },
        clearsign: function(){
            this.store.signModalSignAddress = '';
            this.signmsg = '';
            this.signresult = '';
        },
        validateSign: function(){
            //id,sig,msg
            var self = this;
            self.validateResult = '';
            Coin_API.verifyMessage(this.store.signModalValiteAddress, this.validatesign, this.validatemsg, function(a){
                self.validateResult = TR('Validate success');
            }, function(e){
                self.validateResult = TR('Validate fail') + ':' + TR(e);
            });
        },
        clearvalidate: function(){
            this.store.signModalValiteAddress = '';
            this.validatesign = '';
            this.validatemsg = '';
            this.validateResult = '';
        },
        showModalRecieveAddress: function(){
            store.recieveAddressModalShow = 1;
        },
        showModalSendAddress: function(){
            var self = this;
            this.store.selectAddressCallback = function(obj){
                if(obj && obj.id){
                    self.store.signModalValiteAddress = obj.id;
                }
            };
            store.sendAddressModalShow = 1;
        }
	}
});

var CommonHeader = Vue.extend({
    template: '#common-header',
    data: function(){
        return {
            store: store,
            accountStore: accountStore,
            flagShowModalSign: false
        }
    },
    components: {
        'modal-sign': CommonModalSign,
        'modal-send-address': CommonModalSendAddress,
        'modal-send-address-new': CommonModalSendAddressNew,
        'modal-recieve-address-qr': CommonModalRecieveAddressQr,
        'modal-send-address-qr': CommonModalSendAddressQr
    },
    methods: {
        showModalMsgSign: function(){
            store.signModalShow = 1;
        },
        showModalMsgValite: function(){
            store.signModalShow = 2;
        },
        changeLang: function(lang){
            var r = Coin_API.setLang(lang);
            if(r){
                window.location.reload();
            }
        }
    }
});

var CommonSideMenu = Vue.extend({
	template: '#common-side-menu'
});

var MyWallet = {
    get_history: function (success, error) {
        Coin_API.listtransactions(accountStore.accountID, function (data) {
            if (!data || data.error) {
                if (error)
                    error();
                return;
            }
            accountStore.txs = data.txs.filter(function(item){
                if(item.color == 1){
                    return false;
                }else{
                    return true;
                }
            });
            for (var j in accountStore.txs)
                accountStore.txs[j] = parseTx(accountStore.txs[j], [accountStore.accountID]);           
                accountStore.balance = data.balance;
                accountStore.latest_block.blockHeight = data.currentblockheight;
                accountStore.latest_block.chainInterest = data.chainInterest;
                accountStore.latest_block.centuryVotes = data.centuryVotes;
                accountStore.latest_block.powHeight = data.powHeight;            
            if (success)
                success();

        }, function () {
            if (error)
                error();
        });
    },
    getUxtos: function(){
        var uxtos = Coin_API.getUnspent(accountStore.accountID);
        var currentHeight = accountStore.latest_block.blockHeight;
        var currentPowHeight = accountStore.latest_block.powHeight;
        var info=Coin_API.getInfo();
        var blocksPerday=info.testnet?15:1440;
        var powBlocksPerday=info.testnet?10:960;

        var arr = [];
        for(var i = 0, len = uxtos.length; i < len; i++){
            var uxto = uxtos[i];
            if(uxto.color != 2){
                continue;
            }
            if(Number(uxto.amount) < 1) continue;
            uxto.status = "unavailable";
            if(!uxto.blockheight || uxto.blockheight < 0){
                uxto.blockheight = currentHeight;
            }
            
            var holdHeight = currentHeight - Number(uxto.blockheight);
            var interestRate = Coin_API.getPOSInterestRate(currentHeight);
            var feerate = Math.max(Number(Coin_API.getFeeRate(0.15)), Number(ColorFeeRate[2]));
            var now = +new Date;

            var time = now - holdHeight*((24*60*60*1000)/blocksPerday);
            uxto.unixtime = time;
            uxto.time = CUtil.dateToString(new Date(time));

            uxto.address = uxto.address;
            uxto.amount = Number(uxto.amount);
            uxto.blocks = Math.min(currentHeight - uxto.blockheight, 96*blocksPerday);
            uxto.days = Math.min(96, Math.floor((currentHeight - uxto.blockheight)/blocksPerday));
            uxto.interest = 0;

            uxto.voteNumber = Math.floor(uxto.amount);
            uxto.realVoteNumber = Number(uxto.amount);
            uxto.voteSelected = false;
            uxto.posSelected = false;
            if(holdHeight >= blocksPerday*32){
                var interest = Number(uxto.amount)*Math.min(Math.floor(holdHeight/blocksPerday), 96)*interestRate/100;
                uxto.interest = Number(interest.toFixed(6));
                uxto.status = "ready";
            }
            arr.push(uxto);
        }
        arr.sort(function(a, b){
            return a.unixtime - b.unixtime;
        });
        accountStore.uxtos = arr;
    },
    updateUxtosAge: function(){
        if(!accountStore.uxtos) return;
        var currentHeight = accountStore.latest_block.blockHeight;
        var currentPowHeight = accountStore.latest_block.powHeight;
        
        var info = Coin_API.getInfo();
        var blocksPerday = info.testnet?15:1440;
        var powBlocksPerday = info.testnet?10:960;
        var interestRate = Coin_API.getPOSInterestRate(currentHeight);
        accountStore.uxtos.forEach(function(uxto, index){
            var holdHeight = currentHeight - Number(uxto.blockheight);
            uxto.blocks = Math.min(currentHeight - uxto.blockheight, 96*blocksPerday);
            uxto.days = Math.min(96, Math.floor((currentHeight - uxto.blockheight)/blocksPerday));
            uxto.interest = 0;

            if(holdHeight >= blocksPerday*32){
                var interest = Number(uxto.amount)*Math.min(Math.floor(holdHeight/blocksPerday), 96)*interestRate/100;
                uxto.interest = Number(interest.toFixed(6));
                uxto.status = "ready";
            }
        });
    },
    drawPosSuccessCallback: function(tx){
        if(tx['category'] == 'pos'){
            Coin_API.setGenerate(false, 2, accountStore.accountID, 1, false, function () {
                CPage.showNotice(TR('Draw successfully'));
                accountStore.mineStatus = false;
            }, function (e) {
                console.log(e);
            });
        }
    },
    notifiedTx : function (a) {
        console.log("new tx:" + a);
        var b = Coin_API.getBalance(accountStore.accountID);
        accountStore.balance = b.balance;
        //accountStore.latest_block.blockHeight = b.currentblockheight;
        var tx = parseTx(a.tx, accountStore.IDs);
        for (var j in accountStore.txs)
            if (accountStore.txs[j].txid == tx.txid) {
                accountStore.txs[j] = tx;
                return;
            }
        console.log(tx);
        if(tx['category'] == 'pos'){
            MyWallet.drawPosSuccessCallback(tx);
        }
        accountStore.txs.unshift(tx);
        MyWallet.getUxtos();
    },
    notifiedBlock : function (obj) {
        MyWallet.setLatestBlock(obj);
        MyWallet.updateUxtosAge();
    },
    notifiedFallback : function (obj) {
        MyWallet.get_history();
    },
    notifiedID : function (a) {
        for (var j in accountStore.IDs)
            if (accountStore.IDs[j] == a.id)
                return;
        accountStore.IDs.push(a.id);
        MyWallet.registerNotifications();
    },
    setLatestBlock: function(block) {
        if (block != null) {
            accountStore.latest_block = block;
            for (var j in accountStore.txs) {
                var tx = accountStore.txs[j];
                if (tx.blockheight != null && tx.blockheight > 0) {
                    tx.confirmations = (accountStore.latest_block.blockHeight - tx.blockheight + 1);
                } else {
                    tx.confirmations = 0;
                }
            }
        }
    },
    registerNotifications: function() {
        var aa = function (a) {
            MyWallet.notifiedBlock(a);
        };
        var ab = function (a) {
            MyWallet.notifiedTx(a);
        };
        var ac = function (a) {
            window.location.reload();
        };
        var ad = function (a) {
            MyWallet.notifiedID(a);
        };
        var af = function (a) {
            MyWallet.notifiedFallback(a);
        };
        Coin_API.regNotifyBlocks(aa);
        Coin_API.regNotifyTxs(ab, accountStore.IDs);
        Coin_API.regNotifyAccount(ac);
        Coin_API.regNotifyID(ad);
        Coin_API.regNotifyFallback(af);
    }
};