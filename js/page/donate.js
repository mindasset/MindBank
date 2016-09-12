var Donate = Vue.extend({
    template: '#donate-template',
    data: function(){
        return {
            accountStore: accountStore,
            donateAmount: 1,
            donateMsg: '',
            donateSign: '',
            donateConfirmModalShow: false,
            donateTipModalShow: false,
            donateChooseTipModalShow: false
        };
    },
    components: {
        'common-header': CommonHeader,
        'sidemenu': CommonSideMenu
    },
    computed: {
        blocksLeft: function(){
            var testnet = Coin_API.getInfo()['testnet'];
            var powBlocksPerDay = testnet?10:960;
            var currentPowHeight = this.accountStore.latest_block.powHeight;
            return powBlocksPerDay*100 - Number(currentPowHeight);
        },
        daysLeft: function(){
            var testnet = Coin_API.getInfo()['testnet'];
            var powBlocksPerDay = testnet?10:960;
            return Math.floor(this.blocksLeft/powBlocksPerDay);
        }
    },
    methods: {
        donate: function(){
            var self = this;

            var testnet = Coin_API.getInfo()['testnet'];
            var powBlocksPerDay = testnet?10:960;
            var currentPowHeight = this.accountStore.latest_block.powHeight;

            if(currentPowHeight < powBlocksPerDay*100) return;
            var orgs = Coin_API.getVoteRanking(currentPowHeight-powBlocksPerDay*100, 100);
            console.log(orgs);
            if(!orgs || orgs.length < 1) return;
            var voteOrgs = [];
            for(var i in orgs){
                var tmp = {};
                tmp.address = i;
                tmp.votes = Number(orgs[i]);
                voteOrgs.push(tmp);
            }
            voteOrgs.sort(function(a, b){
                return b.votes - a.votes;
            });
            console.log(voteOrgs);
            var currentCentury = Math.floor(currentPowHeight/powBlocksPerDay/100);
            if(!currentCentury){
                return;
            }
            var donateOrgCount = Math.min(currentCentury, voteOrgs.length);
            var donateAmount = Number(this.donateAmount)/donateOrgCount;
            var color = 2;
            var feeRate = Math.max(Number(Coin_API.getFeeRate(0.15)), Number(ColorFeeRate[2]));
            var arr = [];
            for(var i = 0; i < donateOrgCount; i ++){
                var obj = {};
                console.log(i);
                console.log(voteOrgs[i]);
                obj.toID = voteOrgs[i].address;
                obj.amount = donateAmount;
                obj.locktime = 0;
                obj.content = this.donateSign + ":" + this.donateMsg;
                arr.push(obj);
            }
            Coin_API.requestPaymentMulti(self.accountStore.accountID, arr, color, feeRate,  function (e) {
                self.hideDonateConfirmModal();
                CPage.showNotice(TR('Donate successfully'));
            },function(e){
                CPage.showNotice(TR("Failed to donate:") + TR(e));
            });
        },
        showDonateConfirmModal: function(){
            console.log(222222);

            this.donateConfirmModalShow = true;
        },
        hideDonateConfirmModal: function(){
            this.donateConfirmModalShow = false;
        },
        showDonateTipModal: function(){
            console.log(333);
            this.donateTipModalShow = true;
        },
        hideDonateTipModal: function(){
            this.donateTipModalShow = false;
        },
        showDonateChooseTipModal: function(){
            this.donateChooseTipModalShow = true;
        },
        hideDonateChooseTipModal: function(){
            this.donateChooseTipModalShow = false;
        },
    }
});