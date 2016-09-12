var Pos = Vue.extend({
    template: '#pos-template',
    data: function(){
        return {
            accountStore: accountStore,
            voteConfirmModalShow: false,
            posConfirmModalShow: false
        };
    },
    components: {
        'common-header': CommonHeader,
        'sidemenu': CommonSideMenu
    },
    computed: {
        currentPosInterestRate: function(){
            var interestRate = Coin_API.getPOSInterestRate(this.accountStore.latest_block.blockHeight);
            return (interestRate*100).toFixed(5);
        },
        currentPosDifficulty: function(){
            var info = Coin_API.getMiningInfo();
            if (info.difficulty){
                return info.difficulty.toFixed(3);
            }else{
                return 'N/A';
            }
        },
        uxtos: function(){
            return this.accountStore.uxtos;
        }
    },
    methods: {
        startGeneratePos: function(uxto){
            var self = this;
            var accountID = this.accountStore.accountID;
            this.hidePosConfirmModal();
            var selectedUxtos = this.uxtos.filter(function(uxto){
                if(uxto.posSelected){
                    return true;
                }else{
                    return false;
                }
            });
            console.log(JSON.stringify(selectedUxtos));
            Coin_API.setGenerate(true, 2, accountID, 1, false, function () {
                self.accountStore.mineStatus = true;
            }, function (e) {
                console.log(e);
            }, selectedUxtos);
        },
        stopGeneratePos: function(){
            var self = this;
            var accountID = this.accountStore.accountID;
            Coin_API.setGenerate(false, 2, accountID, 1, false, function () {
                self.accountStore.mineStatus = false;
            }, function (e) {
                console.log(e);
            });
        },
        hideVoteConfirmModal: function(){
            this.voteConfirmModalShow = false;
        },
        showVoteConfirmModal: function(){
            this.voteConfirmModalShow = true;
        },
        hidePosConfirmModal: function(){
            this.posConfirmModalShow = false;
        },
        showPosConfirmModal: function(){
            var self = this;
            var accountID = this.accountStore.accountID;
            if(!this.accountStore.mineStatus){
                var selectedUxtos = this.uxtos.filter(function(uxto){
                    if(uxto.posSelected){
                        return true;
                    }else{
                        return false;
                    }
                });
                if(selectedUxtos.length == 0){
                    CPage.showNotice(TR("Failed to draw:") + TR("Please choose cheques"));
                    return false;
                }
                this.posConfirmModalShow = true;
            }
        }
    }
});