// ===================== //
// ===== CONSTANTS ===== //
// ===================== //

var ID_DOTABUFF = 'db';
var ID_OPENDOTA = 'od';
var ID_STRATZ = 'sz';
var ID_DOTAMAX = 'dx';
var ID_STEAM = 'sm';
//var ID_GOSUAI = 'ga';

// ============================== //
// ===== MAIN FUNCTIONALITY ===== //
// ============================== //

var myURL = "";
var xmlDoc ="";
var steamid64 = "";

// change to current page on different site (same tab)
function switchPage(event) {
	let targetSite = event.target.value;//event.target.parentNode.value;
	if(targetSite == undefined)
		targetSite = event.target.parentNode.value;

	destination = getDestination(targetSite);

	if(destination == false || destination == "ERROR")
		return;

	// dotamax cert is dead
	if(targetSite == ID_DOTAMAX)
		destination = destination.replace('https://', 'http://');
	else
		destination = destination.replace('http://', 'https://');

	setCurrentURL(destination);
	//window.location.replace(destination);
}

// open current page on different site (new tab)
function newTab(event) {
	let targetSite = event.target.value;//event.target.parentNode.value;
	if(targetSite == undefined)
		targetSite = event.target.parentNode.value;

	destination = getDestination(targetSite);

	if(destination == false || destination == "ERROR")
		return;

	// dotamax cert is dead
	if(targetSite == ID_DOTAMAX)
		destination.replace('https://', 'http://');
	else
		destination.replace('http://', 'https://');

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
		if(isPlayerHeroStatsPage(currentPage))
			result = playerHeroStatsPageLogic(currentPage, targetSite, currSite);
		else
			result = playerPageLogic(currentPage, targetSite, currSite);
	}
	// only can get to steam profile really...
	else if (currSite != ID_STEAM)
	{
		if (isMatchPage(currentPage))
		{
			result = matchPageLogic(currentPage, targetSite, currSite);
		}
	}

	return result;
}

// builds the base player page url
function playerPageLogic(currentPage, targetSite, currSite) {
	result = currentPage;
	id = getPlayerID(currentPage, currSite);
	// do special conversions for steam
	if(targetSite == ID_STEAM) {
		steamid3 = steamID64_From_SteamID3(id);
		result = 'https://steamcommunity.com/profiles/' + String(steamid3);
	}
	else if (currSite == ID_STEAM) {
		steam_id3 = steamID3_From_SteamID64(currentPage);
		if (String(steam_id3).indexOf('-') >= 0)
			result = currentPage;
		else
			result = "http://www." + getPlayerPredicate(targetSite) + steam_id3;
	}
	else
	{
		//result = currentPage.replace(getPlayerPredicate(currSite), getPlayerPredicate(targetSite));
		//build fresh in case they have query string params
		if(targetSite == ID_DOTAMAX)
			result = "http://www." + getPlayerPredicate(targetSite) + id;
		else
			result = "https://www." + getPlayerPredicate(targetSite) + id;
	}

	return result;
} // end playerPageLogic()

function playerHeroStatsPageLogic(currentPage, targetSite, currSite) {
	result = currentPage;
	id = getPlayerID(currentPage, currSite);

	if(targetSite == ID_STEAM)
		return result;
	else {
		if(targetSite == ID_DOTAMAX) {
			result = 'http://dotamax.com/player/hero/' + id;
		}
		else
		{
			result = "https://" + getPlayerPredicate(targetSite) + id + "/heroes";
		}
		//else if(currSite == ID_DOTAMAX) {
		//	id = getPlayerID(currentPage, currSite);
		//	result = 'https://' + getPlayerPredicate(currSite) + id + '/heroes'
		//}
		//else
		//	result = currentPage.replace(getPlayerPredicate(currSite), getPlayerPredicate(targetSite));
	}

	return result;
} // end playerHeroStatsPageLogic()

function matchPageLogic(currentPage, targetSite, currSite) {
	result = currentPage;
	m_id = getMatchID(currentPage, currSite);

	if(targetSite == ID_DOTAMAX) {
		result = 'http://' + getMatchStatsPredicate(targetSite) + m_id;
	}
	else
	{
		result = "https://" + getMatchStatsPredicate(targetSite) + m_id;
	}

	return result;
}

// ============================ //
// ===== HELPER FUNCTIONS ===== //
// ============================ //

// https://www.reddit.com/r/Steam/comments/3yoduu/converting_steamid3_to_older_steamid/?st=jabmvb84&sh=29e0634f
function steamID64_From_SteamID3(id) {
	modifier = 0;
	base = 0;

	if (id % 2 == 0) {
		modifier = 0;
		base = id / 2;
	}
	else {
		modifier = 1;
		base = (id - 1) / 2;
	}

	return "7656119" + String((base * 2) + (7960265728 + modifier));
}

//Also if you ever wanna be able to go from steam profile, you just do ?xml=1 on the profile, get the ID64 And convert to ID3
//https://github.com/arhi3a/Steam-ID-Converter/blob/master/steam_id_converter.py
function steamID3_From_SteamID64(steam_url) {
	//steamid64 = "";
	steam_url = steam_url + "?xml=1";

	$.ajax({
        url: steam_url,
        beforeSend: function(xhr) {
             xhr.setRequestHeader("Authorization", "Bearer 6QXNMEMFHNY4FJ5ELNFMP5KRW52WFXN5")
        }, success: function(data){
        	parser = new DOMParser();
            //alert(data);
            var a = data.getElementsByTagName("steamID64")[0].childNodes[0].nodeValue;
            //alert(a);
            steamid64 = a;
            //xmlDoc = parser.parseFromString(data,"text/xml");
            //process the JSON data etc
            //steamid64 = xmlDoc.getElementsByTagName("steamID64")[0].childNodes[0].nodeValue;
        	}
	});

	// https://stackoverflow.com/questions/23259260/convert-64-bit-steam-id-to-32-bit-account-id
	steamid3 = (Number(steamid64.substr(-16,16)) - 6561197960265728);

	return steamid3;
}

function getPlayerID(currentURL, currentSite) {
	player_url_chunk = getPlayerPredicate(currentSite);
	startIndex = currentURL.indexOf(player_url_chunk) + player_url_chunk.length;
	endIndex = currentURL.indexOf('/', startIndex);

	if(endIndex == -1)
		result = currentURL.substring(startIndex);
	else
		result = currentURL.substring(startIndex, endIndex);
	return result;
}

function getMatchID(currentURL, currentSite) {
	match_url_chunk = getMatchStatsPredicate(currentSite);
	startIndex = currentURL.indexOf(match_url_chunk) + match_url_chunk.length;
	endIndex = currentURL.indexOf('/', startIndex);

	if(endIndex == -1)
		result = currentURL.substring(startIndex);
	else
		result = currentURL.substring(startIndex, endIndex);
	return result;
}

function getCurrentURL() {
	var result = "";
	chrome.tabs.query({
						  active: true,
						  currentWindow: true
						}, function(tabs) {
							  var tab = tabs[0];
							  myURL = tab.url;
							  //console.log(result);
							  //var url = tab.url;
							});

	//result = chrome.extension.getBackgroundPage().myURL;
	result = myURL;
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
		result = ID_DOTABUFF;
	else if  (currentPage.includes('opendota.com'))
		result = ID_OPENDOTA;
	else if  (currentPage.includes('stratz.com'))
		result = ID_STRATZ;
	else if  (currentPage.includes('dotamax.com'))
		result = ID_DOTAMAX;
	else if  (currentPage.includes('steamcommunity.com'))
		result = ID_STEAM;
	//else if  (currentPage.includes('gosu.ai'))
	//	result = ID_GOSUAI;


	return result;
}

// ***** PLAYER PAGES ***** //

// detect if url is that of a player pub profile page
function isPlayerPage(currentPage) {
	result = false;

	if(currentPage.includes('/players/') || currentPage.includes('/player/') || currentPage.includes('steamcommunity.com/profiles/') || currentPage.includes('steamcommunity.com/id/'))
		result = true;

	return result;
} // end isPlayerPage()

function getPlayerPredicate(targetSite) {
	result = "";
	switch (targetSite) {
		case ID_DOTABUFF:
			//result = 'https://www.dotabuff.com/players/';
			result = 'dotabuff.com/players/';
			break;
		case ID_OPENDOTA:
			//result = 'https://www.opendota.com/players/';
			result = 'opendota.com/players/';
			break;
		case ID_STRATZ:
			//result = 'https://stratz.com/en-us/player/';
			result = 'stratz.com/en-us/player/';
			break;
		case ID_DOTAMAX:
			//result = 'http://dotamax.com/player/detail/';
			result = 'dotamax.com/player/detail/';
			break;
		case ID_STEAM:
			//NOTE: This could also be steamcommunity.com/id/{somename} -- we'll handle that elsewhere in terms
			//		of getting SteamID3 to go to another page from a steam account
			result = 'steamcommunity.com/profiles/';
			break;
		//case ID_GOSUAI:
		//	result = 'gosu.ai/platform/dota/summary/';
		//	break;
	} // end switch

	return result;
} // end getPlayerPredicate()

// ***** PLAYER HERO STATS ***** //

function isPlayerHeroStatsPage(currentPage) {
	//if(isPlayerPage(currentPage)) { // this was a redundant check -- all player hero pages are also player pages
		if ((currentPage.includes('/hero/') || currentPage.includes('/heroes')) && !currentPage.includes('/esports')) {
			return true;
		}
	//}

	return false;
}

// ***** MATCH STATS ***** //

function isMatchPage(currentPage) {
	result = false;

	if(currentPage.includes('/matches/') || currentPage.includes('/match/'))
		result = true;

	return result;
}

// gets base url for a match-id page
function getMatchStatsPredicate(targetSite) {
	result = "";
	switch (targetSite) {
		case ID_DOTABUFF:
			result = 'dotabuff.com/matches/';
			break;
		case ID_OPENDOTA:
			result = 'opendota.com/matches/';
			break;
		case ID_STRATZ:
			result = 'stratz.com/en-us/match/';
			break;
		case ID_DOTAMAX:
			result = 'dotamax.com/match/detail/';
			break;
	}

	return result;
}

// ================================= //
// ===== INIT / BUTTON BINDING ===== //
// ================================= //

document.getElementById('dotabuff_switch').addEventListener('click', switchPage);
document.getElementById('opendota_switch').addEventListener('click', switchPage);
document.getElementById('stratz_switch').addEventListener('click', switchPage);
document.getElementById('dotamax_switch').addEventListener('click', switchPage);
document.getElementById('steam_switch').addEventListener('click', switchPage);
//document.getElementById('gosuai_switch').addEventListener('click', switchPage);

document.getElementById('dotabuff_newtab').addEventListener('click', newTab);
document.getElementById('opendota_newtab').addEventListener('click', newTab);
document.getElementById('stratz_newtab').addEventListener('click', newTab);
document.getElementById('dotamax_newtab').addEventListener('click', newTab);
document.getElementById('steam_newtab').addEventListener('click', newTab);
//document.getElementById('gosuai_newtab').addEventListener('click', newTab);