var Recieve = Vue.extend({
    template: '#recieve-template',
    data: function(){
    	return {
                    addresses: [
                        {
                            id: accountStore.accountID,
                            alias: ''
                        }
                    ]
    	}
    },
    components: {
    	'common-header': CommonHeader,
        'sidemenu': CommonSideMenu
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
        showModalQrAddress: function(){
            if(this.selectedAddresses.length == 1){
                store.qrLabel = this.selectedAddresses[0].alias;
                console.log(this.selectedAddresses[0]);
                store.qrAddress = this.selectedAddresses[0].id;
                store.qrRecieveAddressModalShow = 1;
            }
        },
        copyAddress: function(){
             if(this.selectedAddresses.length == 1){
                CUtil.copyToClipboard(this.selectedAddresses[0].id);
            }
        },
        validateMsg: function(){
            if(this.selectedAddresses.length == 1){
                store.signModalSignAddress = this.selectedAddresses[0].id;
                store.signModalShow = 1;
            }
        }

    }
});