var App = Vue.extend({});

var router = new VueRouter();

router.map({
    '/': {
        component: Index
    },
    '/record': {
        component: Record
    },
    '/recieve': {
        component: Recieve
    },
    '/send': {
        component: Send
    },
    '/address': {
        component: Address
    },
    '/award': {
        component: Award
    },
    '/donate': {
        component: Donate
    },
    '/vote': {
        component: Vote
    },
    '/vote_result': {
        component: VoteResult
    },
    '/notice': {
        component: Notice
    }
});

accountStore.accountID = Coin_API.getAccountID();
accountStore.IDs = Coin_API.getIDs(accountStore.accountID);


MyWallet.get_history();
MyWallet.getUxtos();
MyWallet.registerNotifications();

doTranslate();
var getSendAddressFileResult = Coin_API.readFile("wallet", "addressbook", "adb.json");
if(getSendAddressFileResult){
    addressStore.paymentAddresses = $.parseJSON(getSendAddressFileResult);
}
router.start(App, '#app');

Vue.config.lang = langCode;
Vue.locale(langCode, trlist); 
