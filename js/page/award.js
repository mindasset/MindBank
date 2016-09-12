var Award = Vue.extend({
    template: '#award-template',
    data: function(){
        return {
            accountStore: accountStore,
            deposittime: 1024,
            depositamount: 0,
            allInterest: 2400000000,
            baseRate: {
                '32': 2.85714,
                '64': 4.28571,
                '128': 5.71428,
                '256': 7.14285,
                '512': 8.57142,
                '1024': 9.99999
            },
            historyList: []   
        }
    },
    components: {
        'common-header': CommonHeader,
        'sidemenu': CommonSideMenu
    },
    computed: {
        chainInterest:function(){
//            console.log(this.accountStore.latest_block);
            return this.accountStore.latest_block.chainInterest/100000000;
        },
        interestLeft:function(){
            return this.allInterest-this.chainInterest;
        },
        balance: function(){
            var availableBlance = this.accountStore.balance[2][2];
            var unconfirmBalance = this.accountStore.balance[2][0];
            var lockedBalance = this.accountStore.balance[2][1];
            var totalBalance = this.accountStore.balance[2][0] + this.accountStore.balance[2][1] + this.accountStore.balance[2][2];
            totalBalance=parseFloat(totalBalance).toFixed(4);
            return [availableBlance, unconfirmBalance, lockedBalance, totalBalance];
        },
        currentRates: function(){
            var period = this.currentPeriodNum;
            var obj = {};
            $.each(this.baseRate, function(k, v){                
                obj[k] = parseFloat(Coin_API.getLockInterestRate(Number(k)*1440)*100).toFixed(5);// v*Math.pow(0.9, period);                
            });
            return obj;
        },
        selectedRate: function(){
            return this.currentRates[this.deposittime];
        },
        expectedInterest: function(){
            var rate = this.selectedRate;
            var day = this.deposittime;
            var amount = parseFloat(this.depositamount)||0;
            return Math.floor(amount* rate/100 * day/100);
        },
        currentPeriodNum: function(){
            var interest = this.interestLeft;
            console.log(interest);
            if(interest<=0)
                return 100;
            var t = this.allInterest;
            var n = 0;
            n=Math.log(interest/t)/Math.log(0.9);
            console.log(n);
            return Math.floor(n);
//            while(t = t*0.9){
//                if(interest > t){
//                    break;
//                }else{
//                    n++;
//                }
//            }
//            return n;
        },
        currentPeriodTotal: function(){
            var period = this.currentPeriodNum;
            return parseInt(this.allInterest * Math.pow(0.9, period) * 0.1);
        },
        currentPeriodRest: function(){
            var period = this.currentPeriodNum;
            return Math.floor(this.interestLeft - this.allInterest * Math.pow(0.9, period + 1));
        },
        currentPeriodUsedPercent: function(){
            return Math.floor((this.currentPeriodTotal - this.currentPeriodRest)/this.currentPeriodTotal*100);
        },
        currentPeriodUsedCircleLeftRotate: function(){
            if(this.currentPeriodUsedPercent < 50){
                return -135;
            }else{
                return -135 + 360*(this.currentPeriodUsedPercent - 50)/100;
            }            
        },
        currentPeriodUsedCircleRightRotate: function(){
            if(this.currentPeriodUsedPercent >= 50){
                return 45;
            }else{
                return 45 - 360*(50 - this.currentPeriodUsedPercent)/100;
            }
        },
        nextPeriodTotal: function(){
            var period = this.currentPeriodNum + 1;
            return Math.floor(this.allInterest * Math.pow(0.9, period) * 0.1);
        },
        nextPeriodMaxRate: function(){
            //var period = this.currentPeriodNum + 1;
            return parseFloat(this.currentRates['1024'] * 0.9).toFixed(5);//Math.pow(0.9, period);
        },
        recordList: function(){
            var list = this.accountStore.txs;
            var arr = list.filter(function(item){
                var currentheight=accountStore.latest_block.blockHeight;
                if(item.blockheight){
                    currentheight=item.blockheight;
                }
                item.payback=0;                
                for (var i in item.vout){
                    if(item.vout[i].locktime){
                        var locktime=item.vout[i].locktime;
                        var testnet = Coin_API.getInfo()['testnet'];
                        var blocksPerDay = testnet?15:1440;
                        var powBlocksPerDay = testnet?10:960;
                        var lockdays;

                        var realDays = Math.round((locktime-currentheight-100)/blocksPerDay);
                        console.log(realDays);
                        if([32, 64, 128, 256, 512, 1024].indexOf(realDays) > -1){
                            lockdays = Math.min((locktime-currentheight)/blocksPerDay,1024);
                        }else{
                            lockdays = Math.min((locktime-currentheight)/powBlocksPerDay,1024);
                        }
                        if(lockdays>=32){
                            item.timeleft=Math.floor((locktime-accountStore.latest_block.blockHeight)/blocksPerDay);
                            item.intereaterate= parseFloat(Coin_API.getLockInterestRate(locktime-currentheight,currentheight)*100).toFixed(5); 
                            var paybackrate=item.intereaterate/100*lockdays/100;
                            item.investment=parseFloat(item.vout[i].value/(1+paybackrate)).toFixed(4);
                            item.payback=parseFloat(item.investment*paybackrate).toFixed(4);
                            if(!item.blockheight){
                                item.status="depunconfirmed";
                            }else if(item.timeleft < 0){
                                item.status="depreleased";
                                item.timeleft = "-";
                            }else{
                                item.status="deplocked";
                            }
                            return true;
                        }
                    }
                }
                return false;                
            });
            console.log(arr);
            return arr;
        },
        myTotalInterest:function(){
            var ti = 0;
            for(var i in this.recordList)
                    ti+=this.recordList[i].payback;
            return parseInt(ti);
        }
    },
    methods: {
        save: function(){
                var testnet = Coin_API.getInfo()['testnet'];
                var blocksPerDay = testnet?10:960;
                var feerate = Math.max(Number(Coin_API.getFeeRate(0.15)), Number(ColorFeeRate[2]));
                var lockblocks=Number(this.deposittime)*blocksPerDay;
                var locktime = lockblocks+ accountStore.latest_block.blockHeight+100;
                if(Coin_API.getLockInterestRate(lockblocks))
                {
                    Coin_API.requestDeposit(accountStore.accountID, accountStore.accountID, Number(this.depositamount), "", feerate, locktime, function () {
                        CPage.showNotice(TR('Your deposit is successfully sent'));
                    }, function (e) {
                        CPage.showNotice(TR("Failed to send deposit tx: ") + TR(e));
                });
                }else
                    CPage.showNotice(TR("Failed to send deposit tx:") + TR("lock time is too short"));
        }
    }
});