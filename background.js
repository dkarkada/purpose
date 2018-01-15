/*
DELAY is set to .6 seconds in this example. Such a short period is chosen to make
the extension's behavior more obvious, but this is not recommended in real life.
Note that in Chrome, alarms cannot be set for less than a minute. In Chrome:
* if you install this extension "unpacked", you'll see a warning
in the console, but the alarm will still go off after 6 seconds
* if you package the extension and install it, then the alarm will go off after
a minute.
*/ 
const RENEWPURPOSE = 10000;
const INTERVAL = 3000;
var urls = ['twitter.com', 'spider.seds.org', 'www.facebook.com'];
var timer, timer2;
var curHost;
var siteData = {};

/*
Restart alarm for the currently active tab, whenever background.js is run.
*/
var gettingActiveTab = browser.tabs.query({active: true, currentWindow: true});
gettingActiveTab.then((tabs) => {
	checkLegality(tabs[0].id);
	var rootURL = new URL(tab.url);
	curHost = rootURL.hostname;
});

/*
Restart alarm for the currently active tab, whenever a new tab becomes active.
*/
browser.tabs.onActivated.addListener((activeInfo) => {
	clearInterval(timer);
	clearInterval(timer2);
	if(typeof siteData[curHost] !== 'undefined'){
		var data = siteData[curHost];
		data.timeExited = Date.now();
		data.timeRemaining = INTERVAL - (data.timeExited - data.timeStarted);
		console.log(data.timeRemaining);
	}
	checkLegality(activeInfo.tabId);
});

function checkLegality(tabId){
	var gettingActiveTab = browser.tabs.get(tabId);
	gettingActiveTab.then((tab) => {
		var rootURL = new URL(tab.url);
		curHost = rootURL.hostname;
		if (urls.includes(curHost)){
			var data = siteData[curHost];
			if(typeof data === 'undefined'){
				askPurpose();
			}
			else {
				if ((Date.now() - data.timeExited) > RENEWPURPOSE){
					askPurpose(tabId);
				}
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

chrome.runtime.onMessage.addListener(
	function(request, sender, sendResponse) {
		if (request.request == "instructions"){
			var data = siteData[curHost];
			if(typeof data === 'undefined' || (Date.now() - data.timeExited) > RENEWPURPOSE){
				sendResponse({instructions: "Describe why you\'re on this site, using at least 40 characters."});
			}
			else{
				var response = "Type your purpose 1 time(s):</p><p>" + data.purpose;
				sendResponse({instructions: response});
			}
		}
		else{
			siteData[request.data.host] = request.data;
			var gettingActiveTab = browser.tabs.query({active: true, currentWindow: true});
			gettingActiveTab.then((tabs) => {
				timer = setTimeout(function(){askPurpose(tabs[0].id)}, INTERVAL);
			});
		}
	}
);