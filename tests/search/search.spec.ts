import SearchPage from "../../utils/pages/search-page";

describe('simple search test: ', function () {
    for(const key in SearchPage.terms) {
        SearchPage.scopes.forEach((scope,i) => {
            it('should search for ' + key + ' term in ' + scope.scopeType + ' scope', function () {
                SearchPage.search(SearchPage.termsObject(key)[i].term, scope.tab, scope['scope-id']);
                expect(SearchPage.resultCountValue()).toEqual(SearchPage.termsObject(key)[i].expected, 'number of results does not match');
                SearchPage.scopeDropDownButton.isPresent().then((result) => {
                    if (result) {
                        expect(SearchPage.selectedScopeValue.getAttribute('value')).toEqual(scope['scope-id'], "incorrect scope is selected");
                    }
                });
                expect(SearchPage.selectedTabValue.getAttribute('value')).toEqual(scope.tab, "incorrect tab is selected");
                expect(SearchPage.searchBar.getAttribute('value')).toEqual(SearchPage.termsObject(key)[i].term, "search bar does not contain correct term");
            });
        });
    };
});