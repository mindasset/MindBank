var langs = ['en', 'cn', 'tw'];
var langCode = 'cn';
var langCodeF = '';
var langJS = null;
var trlist = {};

langCodeF = typeof Coin_API === "undefined" ? navigator.language || navigator.userLanguage : Coin_API.getLang();
if (langCodeF.userlang)
    langCodeF = langCodeF.userlang;
else if (langCodeF.systemlang)
    langCodeF = langCodeF.systemlang;
langCode = langCodeF.substr(-2).toLowerCase();

var doTranslate = function () {
    var langFile = ($.inArray(langCode, langs) >= 0) ? '../js/lang/' + langCode + '.json' : '../js/lang/cn.json';
    var t;
    $.ajax({
        url: langFile,
        async: false,
        dataType: 'json',
        success: function (data) {
            t = data;
        }
    });
    trlist = t;
}
var TR = function (a) {
    if (!trlist || typeof trlist[a] === "undefined")
        return a;
    return trlist[a];
}