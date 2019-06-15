// this is functions related to player pub pages - player stats, player hero stats, etc.

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