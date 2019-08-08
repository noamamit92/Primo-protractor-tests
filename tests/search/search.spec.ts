import SearchPage from "../../utils/pages/search-page";

describe('simple search test: ', function () {
    for(const area in SearchPage.terms) {
        SearchPage.terms[area].forEach((gotchaSearch,i) => {
            it('should search for ' + area + ' term in ' + gotchaSearch.scopeId + ' scope' + ' url: ' +gotchaSearch.link, function () {
                var fixedAvailLink = gotchaSearch.link.replace('pcAvailability=','pc111Availability=');
                fixedAvailLink += '&pcAvailability=false';
                SearchPage.goto(fixedAvailLink, gotchaSearch.queryTerm);
                expect(SearchPage.resultCountValue()).toBeLessThanOrEqual(Number(gotchaSearch.expected.replace(/\D/g,'')) * 1.1, 'number of results does not match');
                expect(SearchPage.resultCountValue()).toBeGreaterThanOrEqual(Number(gotchaSearch.expected.replace(/\D/g,''))*0.9, 'number of results does not match');
                SearchPage.scopeDropDownButton.isPresent().then((result) => {
                    if (result) {
                        expect(SearchPage.selectedScopeValue.getAttribute('value')).toEqual(gotchaSearch.scopeId, "incorrect scope is selected");
                    }
                });
                SearchPage.tabDropDownButton.isPresent().then((result) => {
                    if (result) {
                        expect(SearchPage.selectedTabValue.getAttribute('value')).toEqual(gotchaSearch.tab, "incorrect tab is selected");
                    }
                });
                expect(SearchPage.searchBar.getAttribute('value')).toEqual(gotchaSearch.queryTerm, "search bar does not contain correct term");
            });
        });
    };
});