// ===================== //
// ===== CONSTANTS ===== //
// ===================== //

var ID_DOTABUFF = 'db';
var ID_OPENDOTA = 'od';
var ID_STRATZ = 'sz';
var ID_DOTAMAX = 'dx';
var ID_STEAM = 'sm';
var ID_DATDOTA = 'dd';
//var ID_GOSUAI = 'ga';

// ============================== //
// ===== MAIN FUNCTIONALITY ===== //
// ============================== //

var currTabUrl = "";
var xmlDoc ="";
var steamid64 = "";

chrome.tabs.query({
    active: true,
    currentWindow: true
  }, function(tabs) {
        var tab = tabs[0];
        currTabUrl = tab.url;
      });

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
	
	currentPage = currTabUrl;
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
		else if(isLeaguesPage(currentPage) && targetSite != ID_OPENDOTA)
			result = esportsPageLogic(currentPage, targetSite, currSite);
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
	player_url_chunk = getPlayerBase(currentSite);
	startIndex = currentURL.indexOf(player_url_chunk) + player_url_chunk.length;
	endIndex = currentURL.indexOf('/', startIndex);

	if(endIndex == -1)
		result = currentURL.substring(startIndex);
	else
		result = currentURL.substring(startIndex, endIndex);
	return result;
}

function getMatchID(currentURL, currentSite) {
	match_url_chunk = getMatchStatsBase(currentSite);
	startIndex = currentURL.indexOf(match_url_chunk) + match_url_chunk.length;
	endIndex = currentURL.indexOf('/', startIndex);

	if(endIndex == -1)
		result = currentURL.substring(startIndex);
	else
		result = currentURL.substring(startIndex, endIndex);
	return result;
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
	else if (currentPage.includes('datdota.com'))
		result = ID_DATDOTA;
	else if  (currentPage.includes('steamcommunity.com'))
		result = ID_STEAM;
	//else if  (currentPage.includes('gosu.ai'))
	//	result = ID_GOSUAI;


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
document.getElementById('datdota_switch').addEventListener('click', switchPage);
//document.getElementById('gosuai_switch').addEventListener('click', switchPage);

document.getElementById('dotabuff_newtab').addEventListener('click', newTab);
document.getElementById('opendota_newtab').addEventListener('click', newTab);
document.getElementById('stratz_newtab').addEventListener('click', newTab);
document.getElementById('dotamax_newtab').addEventListener('click', newTab);
document.getElementById('steam_newtab').addEventListener('click', newTab);
document.getElementById('datdota_newtab').addEventListener('click', newTab);
//document.getElementById('gosuai_newtab').addEventListener('click', newTab);