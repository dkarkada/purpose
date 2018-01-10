/*
DELAY is set to .6 seconds in this example. Such a short period is chosen to make
the extension's behavior more obvious, but this is not recommended in real life.
Note that in Chrome, alarms cannot be set for less than a minute. In Chrome:
* if you install this extension "unpacked", you'll see a warning
in the console, but the alarm will still go off after 6 seconds
* if you package the extension and install it, then the alarm will go off after
a minute.
*/ 
var DELAY = 0.01;
CATGIFS="https://www.twitter.com"
var urls = ['twitter.com'];

/*
Restart alarm for the currently active tab, whenever background.js is run.
*/
var gettingActiveTab = browser.tabs.query({active: true, currentWindow: true});
gettingActiveTab.then((tabs) => {
	restartAlarm(tabs[0].id);
});


askPurpose();


/*
Restart alarm for the currently active tab, whenever a new tab becomes active.
*/
browser.tabs.onActivated.addListener((activeInfo) => {
	restartAlarm(activeInfo.tabId);
	askPurpose();
});

function askPurpose(){
	var gettingActiveTab = browser.tabs.query({active: true, currentWindow: true});
	gettingActiveTab.then((tabs) => {
		var rootURL = new URL(tabs[0].url)
		if (urls.includes(rootURL.hostname)){
			browser.tabs.executeScript({file: "alertCode.js"});
		}
	});
}

/*
restartAlarm: clear all alarms,
then set a new alarm for the given tab.
*/
function restartAlarm(tabId) {
	browser.pageAction.hide(tabId);
	browser.alarms.clearAll();
	var gettingTab = browser.tabs.get(tabId);
	gettingTab.then((tab) => {
		if (tab.url != CATGIFS) {
			browser.alarms.create("", {delayInMinutes: DELAY});
		}
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

/*
On page action click, navigate the corresponding tab to the cat gifs.
*/
browser.pageAction.onClicked.addListener(() => {
	browser.tabs.update({url: CATGIFS});
});