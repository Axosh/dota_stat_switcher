// ============================== //
// ===== MAIN FUNCTIONALITY ===== //
// ============================== //

function esportsPageLogic(currentPage, targetSite, currSite) {
    result = currentPage;
    league_id = getLeagueId(currentPage, currSite);

    if(league_id != '' && targetSite == ID_DOTAMAX)
    {
        league_id = '?league_id=' + league_id;
    }

    result = "http://" + getLeaguesBase(targetSite) + league_id;

    if(league_id != '' && targetSite == ID_DOTAMAX)
    {
        result = result.replace('tour', 'tour_league_overview')
    }

    return result;
}

function isLeaguesPage(currentPage) {
    if(currentPage.includes('/leagues/') || currentPage.includes('/tour/') || currentPage.includes('tour_league_overview'))
        return true;
    
    return false;
}

function getLeaguesBase(targetSite) {
    result = "";

    switch(targetSite) {
        case ID_DOTABUFF:
            result = 'dotabuff.com/esports/leagues/';
            break;
        case ID_STRATZ:
            result = 'stratz.com/leagues/';
            break;
        case ID_DOTAMAX:
            result = 'dotamax.com/match/tour/';
            break;
        case ID_DATDOTA:
            result = 'datdota.com/leagues/';
            break;
        
    }

    return result;
}

function getLeagueId(currentURL, currentSite) {
    league_url_chunk = getLeaguesBase(currentSite);

    if(currentSite == ID_DOTAMAX)
        league_url_chunk = 'dotamax.com/match/tour_league_overview/?league_id='

    startIndex = currentURL.indexOf(league_url_chunk) + league_url_chunk.length;

    endChar = '/';

    // want just the stuff where the league ID starts - need to figure out
    // basically if this is a dotabuff URL where it has {leagueid}-some-league-name
    // NOTE: if going to a dotabuff page, the stuff after the leagueid will resolve 
    //       automatically.
    endCharCheck = currentURL.replace(league_url_chunk, '');
    if(endCharCheck.indexOf('-') > -1)
        endChar = '-';

	endIndex = currentURL.indexOf(endChar, startIndex);

	if(endIndex == -1)
		result = currentURL.substring(startIndex);
	else
		result = currentURL.substring(startIndex, endIndex);
	return result;
}