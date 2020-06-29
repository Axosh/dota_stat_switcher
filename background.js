var currTabUrl = "about:blank"; // A default url just in case below code doesn't work

chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) { // onUpdated should fire when the selected tab is changed or a link is clicked 
    chrome.tabs.getSelected(null, function(tab) {
        currTabUrl = tab.url;
    });
});

chrome.runtime.onInstalled.addListener(function() {
    chrome.declarativeContent.onPageChanged.removeRules(undefined, function() {
        chrome.declarativeContent.onPageChanged.addRules([{
            conditions: [
                new chrome.declarativeContent.PageStateMatcher({
                    pageUrl: {
                        urlMatches: '(dotabuff|opendota|dotamax|datdota|steamcommunity|stratz)\.com'
                    }
                })
            ],
            actions: [new chrome.declarativeContent.ShowPageAction()]
        }]);
    });
});