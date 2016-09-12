var Send = Vue.extend({
    template: '#send-template',
    data: function(){
    	return {
                    recievers: [
                        {
                        	alias: '',
                        	id: '',
                        	amount: ''
                        }
                    ],
                    store: store,
                    accountStore: accountStore,
                    feeTime: 0
        };	
    },
    computed: {
            feeRate: function(){
                var fee = parseInt(this.feeTime);
                var waitBlock = Math.max(0.25, Math.pow((10-fee), 2) * 10);
                var feeRate = parseFloat(Coin_API.getFeeRate(waitBlock))/100000;

                return feeRate;
        }
    },
    components: {
        'common-header': CommonHeader,
        'sidemenu': CommonSideMenu
    },
    methods: {
        addReciever: function(){
            this.recievers.push({
                id: '',
                alias: '',
                amount: ''
            });
        },
        removeReciever: function(reciever){
            if(this.recievers.length > 1){
                this.recievers.$remove(reciever);
            }
        },
        clearAll: function(){
            this.recievers = [
                {
                    id: '',
                    alias: '',
                    amount: ''
                }
            ];
        },
        showAddressModal: function(item){
            var self = this;
            this.store.sendAddressModalShow = 1;
            this.store.selectAddressCallback = function(obj){
                if(item){
                    item.alias = obj['alias'] || '';
                    item.id = obj['id'] || '';
                }
                self.store.sendAddressModalShow = 0;
            };
        },
        send:function(){
            var self = this;
            var color = 2;
            var feeRate = Number(self.feeRate) * 10000;
            var arr = [];
            $.each(this.recievers, function(index, reciever){
                    var obj = {};
                    obj.toID = reciever.id;
                    obj.amount = Number(reciever.amount);
                    obj.locktime = 0;
                    obj.content = '';
                    arr.push(obj);
            });
            Coin_API.requestPaymentMulti(self.accountStore.accountID, arr, color, feeRate,  function (e) {
                    CPage.showNotice(TR('Your payment is successfully sent'));
                },function(e){
                    CPage.showNotice(TR("Failed to send tx: ") + TR(e));
                });
        }
    }
});