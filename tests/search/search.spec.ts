import SearchPage from "../../utils/pages/search-page";

describe('simple search test: ', function () {
    for(const area in SearchPage.terms) {
        SearchPage.terms[area].forEach((gotchaSearch,i) => {
            it('should search for ' + area + ' term in ' + gotchaSearch.scopeId + ' scope' + ' url: ' +gotchaSearch.link, function () {
                var fixedAvailLink = gotchaSearch.link.replace('pcAvailability=','pc111Availability=');
                fixedAvailLink += '&pcAvailability=false';
                SearchPage.goto(fixedAvailLink, gotchaSearch.queryTerm);
                SearchPage.resultCountValue().then((count)=>{
                    var highBorder = Number(gotchaSearch.expected.replace(/\D/g,'')) * 1.1;
                    var lowBorder = Number(gotchaSearch.expected.replace(/\D/g,''))*0.9;
                    //pcAvailability seems to be unstable in ve - strange inconsistency - so checking both modes to be sure
                    if(count > highBorder || count < lowBorder){
                        fixedAvailLink = gotchaSearch.link.replace('pcAvailability=','pc111Availability=');
                        fixedAvailLink += '&pcAvailability=true';
                        SearchPage.goto(fixedAvailLink, gotchaSearch.queryTerm);
                        SearchPage.resultCountValue().then((count)=>{
                            expect(count).toBeLessThanOrEqual(highBorder, 'number of results does not match');
                            expect(count).toBeGreaterThanOrEqual(lowBorder, 'number of results does not match');
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
                            }
                        );
                    }

                });


            });
        });
    };
});