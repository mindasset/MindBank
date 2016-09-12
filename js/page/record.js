var Record = Vue.extend({
    template: '#record-template',
    data: function(){
        return {
            store: accountStore,
            currentPage: 0,
            typeFilterParam: 'all',
            addressFilterParam: '',
            timeFilterParam: 0,
            amountFilterParam: '',
            types:['all', 'receive','send','toSelf','deposit','minted','other'],
            isDetailShow: 0,
            currentTxId: ''
        };
    },
    components: {
        'common-header': CommonHeader,
        'sidemenu': CommonSideMenu
    },
    computed: {
        filterList: function(){
            var recordList = this.store.txs;
            this.currentPage = 0;
            var arr = [];
            arr = this.timeFilter(recordList);
            arr = this.typeFilter(arr);
            arr = this.addressFilter(arr);
            arr = this.amountFilter(arr);
          
            return arr;
        },
        showList: function(){
            var countPerPage = 10;
            var arr = [];
            var begin = this.currentPage*countPerPage;
            var end = Math.min(this.filterList.length, (this.currentPage + 1)* countPerPage );

            for(var i = begin; i < end; i++){
                var tx = this.filterList[i];
                var item = {};
                var time = tx.blocktime ? new Date(tx.blocktime * 1000) : new Date();
                var category = tx.category;
                if(category == 'receive' || category == 'send' || category== 'toSelf' || category=='deposit' || category=='minted'){
                    category = category;
                }else{
                    category = 'other';
                }
                item.time = CUtil.dateToString(time);
                item.category = category;

                item.address = tx.address;
                item.txid = tx.txid;
                item.amount = tx.amount;
                arr.push(item);
            }
            return arr;
        },
        total: function(){
            return this.filterList.length;
        },
         pageCount: function(){
            return Math.ceil(this.total/10);
        },
        pages: function(){
            var pageCount = this.pageCount;
            var left = 0;
            var right = pageCount -1;
            var arr = [];
            if(pageCount <= 7){
                left = 0;
                right = pageCount - 1;
            }else if(this.currentPage > 4 && this.currentPage  < pageCount - 3){
                left = this.currentPage - 3;
                right = this.currentPage + 3;
            }else{
                if(this.currentPage<=5){
                    left = 0;
                    right = 6;
                }else{
                    right = pageCount - 1
                    left = pageCount - 7;
                }
            }
            while(left <= right){
                arr.push(left);
                left++;
            }
            return arr;
        }
    },
    methods: {
        getStatus: function(tx){
            var lockBlocks = 0;
            var blocksLeft = 0;
            var locktime = 0;
            var LOCKTIME_THRESHOLD = 500000000;
            if (!tx.confirmations)
                return  'transaction0';
            for (var j in tx.vout)
                if (tx.vout[j].locktime > locktime)
                    locktime = tx.vout[j].locktime;
            if (locktime == 0) {
                switch (tx.confirmations) {
                    case 0:
                        return  'transaction0';
                    case 1:
                    case 2:
                    case 3:
                    case 4:
                    case 5:
                        return  ('clock' + tx.confirmations);
                    default:
                        return  'transaction2';
                }
            }
            if (locktime > LOCKTIME_THRESHOLD)//is time
            {
                var currentTime = (new Date()) / 1000;
                if (tx.blocktime)
                    lockBlocks = (locktime - tx.blocktime) / 60;
                else
                    lockBlocks = (locktime - currentTime) / 60;
                blocksLeft = (locktime - currentTime) / 60;

            } else//is blockheight
            {
                if (tx.blockheight > 0)
                    lockBlocks = locktime - tx.blockheight;
                else
                    lockBlocks = locktime - this.store.latest_block.blockHeight;
                blocksLeft = locktime - this.store.latest_block.blockHeight;
            }
            if (blocksLeft <= 0)
                return 'transaction2';
            if (blocksLeft > 1440)
                return 'lock_closed';
            if (lockBlocks >= 1440)
                lockBlocks = 1440;

            var clock = "clock" + Math.ceil(((lockBlocks - blocksLeft) * 5 + 1) / lockBlocks);
            return clock;
        },
        timeFilter: function(arr){
            var timeParam = parseInt(this.timeFilterParam);
            var result;
            if(timeParam == 0){
                return arr;
            }
            switch(timeParam){
                case 1:
                    var timeMin = new Date().setHours(0,0,0);
                    result = arr.filter(function(item){
                        var time = item.blocktime ? new Date(item.blocktime * 1000) : new Date();
                        if(time > timeMin){
                            return true;
                        }else{
                            return false;
                        }
                     });
                    break;
                case 2:
                    var timeMin = new Date().getTime() - 1000*60*60*24*7;
                    result = arr.filter(function(item){
                        var time = item.blocktime ? new Date(item.blocktime * 1000) : new Date();
                        if(time > timeMin){
                            return true;
                        }else{
                            return false;
                        }
                     });
                    break;
                case 3:
                    var timeMin = new Date(new Date().setDate(1)).setHours(0,0,0);
                    result = arr.filter(function(item){
                        var time = item.blocktime ? new Date(item.blocktime * 1000) : new Date();
                        if(time > timeMin){
                            return true;
                        }else{
                            return false;
                        }
                     });
                    break;
                 case 4:
                    var timeMax = new Date(new Date().setDate(1)).setHours(0,0,0);
                    var timeMin = timeMax - 1000*60*60*24*30;
                    result = arr.filter(function(item){
                        var time = item.blocktime ? new Date(item.blocktime * 1000) : new Date();
                        if(time > timeMin && time < timeMax){
                            return true;
                        }else{
                            return false;
                        }
                     });
                    break;
                 case 5:
                    var currentYear = new Date().getFullYear();
                    var timeMin = new Date(new Date().setFullYear(currentYear,0,0)).setHours(0,0,0);
                    result = arr.filter(function(item){
                        var time = item.blocktime ? new Date(item.blocktime * 1000) : new Date();
                        if(time > timeMin){
                            return true;
                        }else{
                            return false;
                        }
                     });
                    break;
            }
            return result;
        },
        typeFilter: function(arr){
            var type = this.typeFilterParam;
            var result;
            if('all' == type){
                return arr;
            }
            if('other' == type){
                result = arr.filter(function(item){
                    var category = item['category'];
                   if(category != 'receive' && category != 'send' && category!= 'toSelf' &&  category!='deposit'){
                        return true;
                   }else{
                        return false;
                   }
                });
            }else{
                result = arr.filter(function(item){
                    return item.category == type;
                });
            }
            return result;
        },
        addressFilter: function(arr){
            var addressFilterParam = this.addressFilterParam;
            var result = arr.filter(function(item){                
                return item.address.indexOf(addressFilterParam) > -1;
            });
            return result;
        },
        amountFilter: function(arr){
            var minAmount = this.amountFilterParam;

            if(minAmount === ''){
                return arr;
            }
            var result = arr.filter(function(item){
                return ((parseFloat(item.amount) - parseFloat(minAmount)) >= 0);
            });
            return result;
        },
        showDetail: function(item){
            console.log(item);
            this.currentTxId = item.txid;
            this.isDetailShow = 1;
        },
        goPage: function(page){
            this.currentPage = page;
        },
        goPrePage: function(){
            if(this.currentPage > 0)
                this.currentPage--;
        },
        goNextPage: function(){
            if(this.currentPage < this.pageCount - 1)
                this.currentPage++;
        }
    }
});