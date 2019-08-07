import SearchPage from "../../utils/pages/search-page";

describe('simple search test: ', function () {
    for(const area in SearchPage.terms) {
        SearchPage.terms[area].forEach((gotchaSearch,i) => {
            it('should search for ' + area + ' term in ' + gotchaSearch.scopeId + ' scope' + ' url: ' +gotchaSearch.link, function () {
                SearchPage.goto(gotchaSearch.link, gotchaSearch.queryTerm);
                expect(SearchPage.resultCountValue()).toEqual(Number(gotchaSearch.expected), 'number of results does not match');
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