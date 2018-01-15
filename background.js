/*
DELAY is set to .6 seconds in this example. Such a short period is chosen to make
the extension's behavior more obvious, but this is not recommended in real life.
Note that in Chrome, alarms cannot be set for less than a minute. In Chrome:
* if you install this extension "unpacked", you'll see a warning
in the console, but the alarm will still go off after 6 seconds
* if you package the extension and install it, then the alarm will go off after
a minute.
*/ 
const DELAY = 0.01;
const RENEWPURPOSE = 30;
CATGIFS="https://www.twitter.com"
var urls = ['twitter.com', 'spider.seds.org', 'www.facebook.com'];
var timer;
var curHost;

browser.storage.local.clear();

/*
Restart alarm for the currently active tab, whenever background.js is run.
*/
var gettingActiveTab = browser.tabs.query({active: true, currentWindow: true});
gettingActiveTab.then((tabs) => {
	restartAlarm(tabs[0].id);
	checkLegality(tabs[0].id);
});





/*
Restart alarm for the currently active tab, whenever a new tab becomes active.
*/
browser.tabs.onActivated.addListener((activeInfo) => {
	clearInterval(timer);
	curHost = null;
	restartAlarm(activeInfo.tabId);
	checkLegality(activeInfo.tabId);
});

function checkLegality(tabId){
	var gettingActiveTab = browser.tabs.get(tabId);
	gettingActiveTab.then((tab) => {
		var rootURL = new URL(tab.url);
		curHost = rootURL.hostname;
		if (urls.includes(curHost)){
			var gettingItem = browser.storage.local.get([curHost]);
			gettingItem.then((item)=> {
				var timeRemaining = 5000;
				if(typeof item[curHost] === 'undefined'){
					askPurpose();
				}
				else {
					var lastTime = item[curHost].time;
					var now = Date.now();
					if ((now - lastTime)/1000 > RENEWPURPOSE){
						askPurpose(tabId);
					}
					else {
						timeRemaining = item[curHost].timeRemaining;
					}
				}
				timer = setInterval(quizPurpose, timeRemaining);
			});
		}
	});
}

function askPurpose(tabId){
	browser.tabs.executeScript(tabId, {file: "jquery-3.2.1.min.js"}, function(){
		browser.tabs.executeScript(tabId, {file: "jquery-ui.min.js"}, function(){
			browser.tabs.executeScript(tabId, {file: "askPurpose.js"});
		});
	});
}

function quizPurpose(){
	console.log('quiz');
}

/*
restartAlarm: clear all alarms,
then set a new alarm for the given tab.
*/
function restartAlarm(tabId) {
	//browser.pageAction.hide(tabId);
	browser.alarms.clearAll();
	var gettingTab = browser.tabs.get(tabId);
	gettingTab.then((tab) => {
		browser.alarms.create("", {delayInMinutes: DELAY});
	});
}

/*
On alarm, show the page action.
*/
browser.alarms.onAlarm.addListener((alarm) => {
	var gettingActiveTab = browser.tabs.query({active: true, currentWindow: true});
	gettingActiveTab.then((tabs) => {
		browser.pageAction.show(tabs[0].id);
	});
});