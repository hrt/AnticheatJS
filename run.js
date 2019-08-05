var URLS = ["https://krunker.io/js/game*", "https://krunker.io/libs/zip-ext.*", "https://krunker.io/libs/zip.*"];
var REPO = 'https://raw.githack.com/hrt/HeroHunter/master/';
chrome.webRequest.onBeforeRequest.addListener(function(details) { return {redirectUrl: REPO + 'game.js'}; }, { urls: [URLS[0]] }, ["blocking"]);
chrome.webRequest.onBeforeRequest.addListener(function(details) { return {redirectUrl: REPO + 'zip-ext.js'}; }, { urls: [URLS[1]] }, ["blocking"]);
chrome.webRequest.onBeforeRequest.addListener(function(details) { return {redirectUrl: REPO + 'zip.js'}; }, { urls: [URLS[2]] }, ["blocking"]);
chrome.webRequest.onHeadersReceived.addListener(function(details) { return {cancel: details.type == "script"} }, { urls: ["https://krunker.io/*"] }, ["blocking"]);