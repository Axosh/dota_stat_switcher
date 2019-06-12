// ============================== //
// ===== MAIN FUNCTIONALITY ===== //
// ============================== //

// change to current page on different site (same tab)
function switchPage(event) {
	let targetSite = event.target.value;//event.target.parentNode.value;
	if(targetSite == undefined)
		targetSite = event.target.parentNode.value;

	destination = getDestination(targetSite);

	setCurrentURL(destination);
	//window.location.replace(destination);
}

// open current page on different site (new tab)
function newTab(event) {
	let targetSite = event.target.value;//event.target.parentNode.value;
	if(targetSite == undefined)
		targetSite = event.target.parentNode.value;

	destination = getDestination(targetSite);

	window.open(destination, '_blank');
}

// Figure out:
// a) what page we're on
// b) where site we're going to
// c) how to transform current page to new site
function getDestination(targetSite) {
	currentPage = getCurrentURL();
	currSite = getCurrSite(currentPage);

	result = currentPage;

	if (isPlayerPage(currentPage))
	{
		result = currentPage.replace(getPlayerPredicate(currSite), getPlayerPredicate(targetSite));
		console.log(result);
	}

	return result;
}

// ============================ //
// ===== HELPER FUNCTIONS ===== //
// ============================ //

function getCurrentURL() {
	var result = "";
	chrome.tabs.query({
							  active: true,
							  currentWindow: true
							}, function(tabs) {
								  var tab = tabs[0];
								  result = tab.url;
								  console.log(result);
								  //var url = tab.url;
								});

	result = chrome.extension.getBackgroundPage().myURL;
	return result;
	//window.location.href;
}

function setCurrentURL(newUrl) {
	chrome.tabs.query({currentWindow: true, active: true}, function (tab) {
      chrome.tabs.update(tab.id, {url: newUrl});
	});
}

// figure out shorthand identifier for current page
function getCurrSite(currentPage) {
	result = 'ERROR';

	if (currentPage.includes('dotabuff.com'))
		result = 'db';
	else if  (currentPage.includes('opendota.com'))
		result = 'od';
	else if  (currentPage.includes('stratz.com'))
		result = 'sz';
	else if  (currentPage.includes('dotamax.com'))
		result = 'dm';

	return result;
}

// ***** PLAYER PAGES ***** //

// detect if url is that of a player pub profile page
function isPlayerPage(currentPage) {
	result = false;

	if(currentPage.includes('/players/') || currentPage.includes('/player/'))
		result = true;

	return result;
} // end isPlayerPage()

function getPlayerPredicate(targetSite) {
	result = "";
	switch (targetSite) {
		case 'db':
			result = 'https://www.dotabuff.com/players/';
			break;
		case 'od':
			result = 'https://www.opendota.com/players/';
			break;
		case 'sz':
			result = 'https://stratz.com/en-us/player/';
			break;
		case 'dm':
			result = 'http://dotamax.com/player/detail/';
			break;
	} // end switch

	return result;
} // end getPlayerPredicate()

// ================ //
// ===== INIT ===== //
// ================ //

document.getElementById('dotabuff_switch').addEventListener('click', switchPage);
document.getElementById('opendota_switch').addEventListener('click', switchPage);
document.getElementById('stratz_switch').addEventListener('click', switchPage);
document.getElementById('dotamax_switch').addEventListener('click', switchPage);

document.getElementById('dotabuff_newtab').addEventListener('click', newTab);
document.getElementById('opendota_newtab').addEventListener('click', newTab);
document.getElementById('stratz_newtab').addEventListener('click', newTab);
document.getElementById('dotamax_newtab').addEventListener('click', newTab);