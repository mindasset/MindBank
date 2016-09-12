var Address = Vue.extend({
    template: '#address-template',
    data: function(){
        return {
            addressStore: addressStore
        }
    },
    components: {
        'common-header': CommonHeader,
        'sidemenu': CommonSideMenu
    },
    computed: {
        addresses: function(){
            console.log( this.addressStore.paymentAddresses);
            return this.addressStore.paymentAddresses;
        },
        selectedAddresses: function(){
            var addresses = this.addressStore.paymentAddresses;
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
            store.newSendAddressModalShow = 1;
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
        validateMsg: function(){
            if(this.selectedAddresses.length == 1){
                store.signModalValiteAddress = this.selectedAddresses[0].id;
                store.signModalShow = 2;
            }
        },
        remove: function(){
            var self = this;
            $.each(this.selectedAddresses, function(index, item){
                self.addressStore.paymentAddresses.$remove(item);
            });
            var adfile = JSON.stringify(this.addressStore.paymentAddresses);
            Coin_API.writeFile("wallet", "addressbook", "adb.json", adfile);
        }

    }
});