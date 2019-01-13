import {by, element} from "protractor";
import {search} from "../utils/search.util";
import {Browser} from "../utils/browser.util";

describe('search a simple term', function () {
    it('should search for a simple term', function () {
        Browser.get('/search', '').then(() => {
            search('simple');

            Browser.waitForAngular().then(() => {
                const searchResults = element.all(by.xpath('//prm-brief-result-container'));
                expect(searchResults.count()).toEqual(10).then(() => {
                    Browser.close();
                });
            });
        });
    });
});