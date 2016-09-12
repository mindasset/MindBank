var Vote = Vue.extend({
    template: '#vote-template',
    data: function(){
        return {
            accountStore: accountStore,
            voteModalShow: false,
            selectedVoteAddress: '',
            voteModalTipShow: false
        };
    },
    components: {
        'common-header': CommonHeader,
        'sidemenu': CommonSideMenu
    },
    computed: {
        orgList: function(){
            var obj = {
            };
            var items = ["a","b","c","d","e","f","g","h","i","j","k","l","m","n","o","p","q","r","s","t","u","v","w","x","y","z"];
            for(var i = 0, len = items.length; i < len; i++){
                obj[items[i].toUpperCase()] = [];
            }
            var org = ORG_LIST||{};
            var lang = Coin_API.getLang()['userlang']||Coin_API.getLang()['systemlang'];
            for(var i in org){
                var index = org[i]['firstLetter'].toUpperCase();
                var item = {};
                item.address = i;
                item.name = org[i][lang];
                if(lang == 'en'){
                    index = item.name.charAt(0).toUpperCase();
                }
                if(obj[index].length == 0){
                    item.nav = index;
                }
                obj[index].push(item);
            }
            console.log(JSON.stringify(obj));
            return obj;
        },
        awardAmount: function(){
            var currentHeight = this.accountStore.latest_block.blockHeight;
            var amount = Number(Coin_API.getlotteryrewards(currentHeight).value)/100000000;
            return amount;
        },
        centuryProgress: function(){
            var currentHeight = Number(this.accountStore.latest_block.blockHeight);
            var testnet = Coin_API.getInfo()['testnet'];
            var blocksPerDay = testnet?10:960;
            return Math.floor((currentHeight%(blocksPerDay*100))/(blocksPerDay*100)*100);
        },
        uxtos: function(){
            var uxtos = this.accountStore.uxtos;
            uxtos = uxtos.filter(function(uxto){
                if(uxto.days >= 32){
                    return true;
                }else{
                    return false;
                }
            });
            return uxtos;
        },
        selectAll: {
            get: function(){
                var unselected = this.uxtos.filter(function(uxto){
                    return !uxto.voteSelected;
                });
                if(unselected.length > 0){
                    return false;
                }
                return true;
            },
            set: function(val){
                this.uxtos.forEach(function(uxto){
                    uxto.voteSelected = val;
                });
                console.log(this.uxtos);
            }
        },
        showOnMulti: function(){
            var selected = this.uxtos.filter(function(uxto){
                return uxto.voteSelected;
            });
            if(selected.length > 0){
                return false;
            }
            return true;
        }
    },
    methods: {
        goItem: function(e){
            if(!e.target) return;
            var index = e.target.innerHTML.toUpperCase();
            var ele = $('#' + index);
            if(!ele||!ele.length){
                return;
            }
            var top = ele.position().top;
            var scrollTop = $('.vote-table-wrap').scrollTop();
            $('.vote-table-wrap').animate({'scrollTop':top + scrollTop});
        },
        vote: function(){
            var self = this;
            var accountID = this.accountStore.accountID;
            var feerate = Math.max(Number(Coin_API.getFeeRate(0.15)), Number(ColorFeeRate[2]));
            var address = this.selectedVoteAddress;
            var selectedUxtos = this.uxtos.filter(function(uxto){
                if(uxto.voteSelected){
                    return true;
                }else{
                    return false;
                }
            });
            console.log(JSON.parse(JSON.stringify(selectedUxtos)));
            var voteAmount = 0;
            selectedUxtos.forEach(function(uxto){
                voteAmount += Number((uxto.realVoteNumber - feerate/100000000*160).toFixed(6));
            });

            var voteList = [];
            var vote = {};
            vote.address = address;
            vote.value = voteAmount-feerate/100000000*100;
            console.log(vote.value);
            voteList.push(vote);
            Coin_API.requestVote(accountID, selectedUxtos, voteList, feerate, function () {
                self.hideVoteModal();
                CPage.showNotice(TR('Vote successfully'));
            }, function(e){
                console.log(e);
                CPage.showNotice(TR("Failed to vote:") + TR(e));
            });
        },
        showVoteModal: function(item){
            this.selectedVoteAddress = item.address;
            this.voteModalShow = true;
        },
        hideVoteModal: function(){
            this.voteModalShow = false;
            this.uxtos.forEach(function(uxto){
                uxto.voteSelected = false;
            });
        },
        showVoteTipModal: function(){
            this.voteModalTipShow = true;
        },
        hideVoteTipModal: function(){
            this.voteModalTipShow = false;
        }
    }
});