var Index = Vue.extend({
    template: '#index-template',
    data: function(){
        return {
            accountStore: accountStore,
            allInterest: 2400000000,
            isModalPosShow: false
        }
    },
    components: {
        'common-header': CommonHeader,
        'sidemenu': CommonSideMenu,
    },
    computed: {
        balance: function(){
            var availableBlance = this.accountStore.balance[2][2];
            var unconfirmBalance = this.accountStore.balance[2][0];
            var lockedBalance = this.accountStore.balance[2][1];
            var totalBalance = this.accountStore.balance[2][0] + this.accountStore.balance[2][1] + this.accountStore.balance[2][2];
            return [availableBlance, unconfirmBalance, lockedBalance, totalBalance];
        },
        address: function(){
            var wrap = $(this.$els.canvas);
            wrap.children().remove();
            wrap.qrcode({
                width: 100,
                height: 100,
                text: this.accountStore.accountID
            });
            return this.accountStore.accountID;
        },
        chainInterest:function(){
            return this.accountStore.latest_block.chainInterest/100000000;
        },
        interestLeft:function(){
            return this.allInterest-this.chainInterest;
        },
        currentPeriodNum: function(){
            var interest = this.interestLeft;
            if(interest<=0)
                return 100;
            var t = this.allInterest;
            var n = 0;
            n=Math.log(interest/t)/Math.log(0.9);
            return Math.floor(n);
        },
        currentPeriodTotal: function(){
            var period = this.currentPeriodNum;
            return this.allInterest * Math.pow(0.9, period) * 0.1;
        },
        currentPeriodRest: function(){
            var period = this.currentPeriodNum;
            return this.interestLeft - this.allInterest * Math.pow(0.9, period + 1);
        },
        currentPeriodUsedPercent: function(){
            return Math.floor((this.currentPeriodTotal - this.currentPeriodRest)/this.currentPeriodTotal*100);
        },
        allPeriodUsedPercent: function(){
            return Math.floor(this.chainInterest/this.allInterest*100);
        },
        recentDealList: function(){
            var txs = this.accountStore.txs;
            var len = Math.min(txs.length, 6);
            var arr = [];
            for(var i = 0; i < len; i++){
                var tx = txs[i];
                var item = {};
                var time;
                if(!tx.blocktime){
                    time = new Date();
                }else{
                    time = new Date(tx.blocktime * 1000);
                }
                item.time = CUtil.dateToString(time);
                if(tx.amount >= 0){
                    item.type = 'recieve';
                    item.signal = '+';
                }else{
                    item.signal = '-';
                    item.type = 'send';
                }
                item.amount = Math.abs(tx.amount);

                item.address = tx.address;
                arr.push(item);
            }
            return arr;
        },
        currentPosInterestRate: function(){
            var interestRate = Coin_API.getPOSInterestRate(this.accountStore.latest_block.blockHeight);
            return (interestRate*100).toFixed(5);
        },
        currentAnticipatedInterest: function(){
            var result = 0;
            var uxtos = this.accountStore.uxtos;
            for(var i = 0, len = uxtos.length; i < len; i++){
                console.log(uxtos[i].interest);
                result += Number(uxtos[i].interest);
            }
            result = result.toFixed(6);
            return result;
        },
        currentAccruedInterest: function(){
            var result = 0;
            var txs = this.accountStore.txs;
            var len = txs.length;
            for(var i = 0; i < len; i++){
                var tx = txs[i];
                if((tx.color == 2) && tx.ispos){
                    result += Number(tx.amount);
                }
            }
            result = result.toFixed(6);
            return result;
        },
        posDealList: function(){
            //need data
            return [];
        }

    },
    methods: {
        showModalPos: function(){
            this.isModalPosShow = true;
        },
        hideModalPos: function(){
            this.isModalPosShow = false;
        }
    }
});