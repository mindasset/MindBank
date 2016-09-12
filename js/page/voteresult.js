var VoteResult = Vue.extend({
    template: '#voteresult-template',
    data: function(){
        return {
            accountStore: accountStore
        };
    },
    components: {
        'common-header': CommonHeader,
        'sidemenu': CommonSideMenu
    },
    computed: {
        list: function(){
            var currentPowHeight = Number(this.accountStore.latest_block.powHeight);
            var currentBlockHeight = Number(this.accountStore.latest_block.powHeight);
            var testnet = Coin_API.getInfo()['testnet'];
            var powBlocksPerDay = testnet?10:960;
            var blocksPerDay = testnet?15:1440;
            var lang = Coin_API.getLang()['userlang']||Coin_API.getLang()['systemlang'];
            var result = [];
            var totalVotes = 0;
            var tmp;
            if((currentBlockHeight > blocksPerDay*100) && (currentPowHeight > powBlocksPerDay*100)){
                tmp = Coin_API.getVoteRanking(currentPowHeight - powBlocksPerDay*100, 100);
                for(var i in tmp){
                    totalVotes += Number(tmp[i]);
                }
                for(var i in tmp){
                    var obj = {};
                    obj.address = i;
                    obj.votes = Math.ceil(Number(tmp[i])/100000000);
                    obj.percent = (Number(tmp[i])/totalVotes*100).toFixed(2);
                    obj.org = ORG_LIST[i][lang];
                    result.push(obj);
                }
                result.sort(function(a, b){
                    return b.votes - a.votes;
                });
            }
            console.log(result);
            return result;
        }
    }
});