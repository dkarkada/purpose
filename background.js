const RENEWPURPOSE = 30*60*1000;
const INTERVAL = 2*60*1000;
var urls = [];
var timer;
var curHost;
var siteData = {};

/*
Read the blacklist from storage and load it into memory.
*/
browser.storage.local.get({blacklist: []}, function(result){
	var blacklist = result.blacklist;
	blacklist.forEach(function(site){
		urls.push(site);
	});
});

/*
Check legality for the currently active tab, whenever background.js is run.
*/
var gettingActiveTab = browser.tabs.query({active: true, currentWindow: true});
gettingActiveTab.then((tabs) => {
	checkLegality(tabs[0].id);
	var rootURL = new URL(tabs[0].url);
	curHost = rootURL.hostname;
});

/*
Check legality for the currently active tab, whenever a new tab becomes active.
*/
browser.tabs.onActivated.addListener((activeInfo) => {
	checkLegality(activeInfo.tabId);
});

/*
Check legality when page is refreshed, or new page is visited on same tab
*/
browser.tabs.onUpdated.addListener((tabId, changeInfo, tab)=>{
	if (changeInfo.url){
		checkLegality(tabId);
	}
});

function checkLegality(tabId){
	// we will start the timer over
	clearInterval(timer);
	// if we've been to the site already, get its data and set the remaining time for the timer from the last visit
	if(typeof siteData[curHost] !== 'undefined'){
		var data = siteData[curHost];
		data.timeExited = Date.now();
		data.timeRemaining = INTERVAL - (data.timeExited - data.timeStarted);
		if (data.timeRemaining < 0){
			data.timeRemaining = 0;
		}
	}
	// get the current url host, and then..
	var gettingActiveTab = browser.tabs.get(tabId);
	gettingActiveTab.then((tab) => {
		var rootURL = new URL(tab.url);
		curHost = rootURL.hostname;
		// if it's blacklisted
		if (urls.includes(curHost)){
			var data = siteData[curHost];
			// if we haven't been to the site yet, ask purpose
			if(typeof data === 'undefined'){
				askPurpose(tabId);
			}
			else {
				// if enough time has elapsed from last visit, ask new purpose
				if ((Date.now() - data.timeExited) > RENEWPURPOSE){
					askPurpose(tabId);
				}
				// otherwise, set a timer to quiz on purpose
				else {
					timer = setTimeout(function(){askPurpose(tabId)}, data.timeRemaining);
				}	
			}
		}
	});
}

function askPurpose(tabId){
	browser.tabs.executeScript(tabId, {file: "jquery-3.2.1.min.js"}, function(){
		browser.tabs.executeScript(tabId, {file: "jquery-ui.min.js"}, function(){
			browser.tabs.executeScript(tabId, {file: "purpose.js"});
		});
	});
}

browser.runtime.onMessage.addListener(function(request, sender, sendResponse) {
	// message from popup to add a page to the blacklist
	if (request.addPage){
		var gettingActiveTab = browser.tabs.query({active: true, currentWindow: true});
		gettingActiveTab.then((tabs) => {			
			var rootURL = new URL(tabs[0].url);
			curHost = rootURL.hostname;
			// if this page isnt already in the blacklist, then add it to both storage and memory blacklist
			// then ask purpose
			if (!(urls.includes(curHost))){
				browser.storage.local.get({blacklist: []}, function(result){
					var blacklist = result.blacklist;
					blacklist.push(curHost);
					browser.storage.local.set({blacklist: blacklist});
					urls.push(curHost);
					askPurpose(tabs[0].id);
				});
			}
		});
	}
	// message from askPurpose about whether asking or quizzing
	else if (request.request == "type"){
		var data = siteData[curHost];
		if(typeof data === 'undefined' || (Date.now() - data.timeExited) > RENEWPURPOSE){
			sendResponse({type: "ask"});
		}
		else{
			sendResponse({type: data.purpose});
		}
	}
	// message from askPurpose reporting the user's purpose (ask or quiz)
	else{
		// quiz result has been accepted
		if (typeof request.data === 'undefined'){
			siteData[curHost].timeStarted = request.timeStarted;
		}
		// purpose has been asked and returned as part of request.data
		else {
			siteData[request.data.host] = request.data;
		}
		// start timer to quiz/requiz
		var gettingActiveTab = browser.tabs.query({active: true, currentWindow: true});
		gettingActiveTab.then((tabs) => {
			timer = setTimeout(function(){askPurpose(tabs[0].id)}, INTERVAL);
		});
	}
});