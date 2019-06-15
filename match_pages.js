// Governs moving around between match related pages: match, builds, etc.

// ============================== //
// ===== MAIN FUNCTIONALITY ===== //
// ============================== //

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