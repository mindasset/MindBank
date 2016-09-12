var Notice = Vue.extend({
    template: '#notice-template',
    data: function(){
        return {
        	accountStore: accountStore,
            selectCentury: 0
        };
    },
    components: {
        'common-header': CommonHeader,
        'sidemenu': CommonSideMenu
    },
    computed: {
        blocksPerDay: function(){
            var testnet = Coin_API.getInfo()['testnet'];
            return testnet?15:1440;
        },
        powBlocksPerDay: function(){
            var testnet = Coin_API.getInfo()['testnet'];
            return testnet?10:960;
        },
        century: function(){
            if(0 == this.selectCentury){
                return this.currentCentury;
            }else{
                return this.selectCentury;
            }
        },
        currentCentury: function(){
            var testnet = Coin_API.getInfo()['testnet'];
            var currentPowHeight = Number(this.accountStore.latest_block.powHeight);
            var currentCentury;
            if(testnet){
                currentCentury = Math.floor((currentPowHeight - this.powBlocksPerDay*10)/(this.powBlocksPerDay*100));
            }else{
                currentCentury = Math.floor((currentPowHeight - this.powBlocksPerDay*8)/(this.powBlocksPerDay*100));
            }
            currentCentury = Math.max(0, currentCentury);
            console.log(currentCentury);
            return currentCentury;
        },
        blocksByEnd: function(){
            var testnet = Coin_API.getInfo()['testnet'];
            var currentHeight = Number(this.accountStore.latest_block.blockHeight);
            if(testnet){
                return this.powBlocksPerDay*100 + this.powBlocksPerDay*10 - currentHeight%(this.powBlocksPerDay*100 + this.powBlocksPerDay*10);
            }else{
                return this.powBlocksPerDay*100 + this.powBlocksPerDay*8 - currentHeight%(this.powBlocksPerDay*100 + this.powBlocksPerDay*8);
            }
        },
        daysByEnd: function(){
            return Math.floor(this.blocksByEnd/this.powBlocksPerDay);
        },
        awardAddresses: function(){
            var testnet = Coin_API.getInfo()['testnet'];
            var century = Number(this.century);
            var powBlockHeight;
            var record = [];
            if(testnet){
                powBlockHeight = century*this.powBlocksPerDay*100 + this.powBlocksPerDay*10 + 2;
            }else{
                powBlockHeight = century*this.powBlocksPerDay*100 + this.powBlocksPerDay*8 + 2;
            }
            
            console.log(powBlockHeight);
            record = Coin_API.getlotteryrewards(powBlockHeight).addresses;

            return record;
        },
        awardAmount: function(){
            var selectCentury = this.selectCentury||this.currentCentury;
            var blockHeight = selectCentury*this.blocksPerDay*100 + 1;

            var amount = Math.floor(Number(Coin_API.getlotteryrewards(blockHeight).value)/100000000);
            console.log(amount);

            return amount;
        }
    },

});