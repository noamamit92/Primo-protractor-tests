import {browser, by, element} from "protractor";
import {search} from "../utils/search.util";

describe('search a simple term', function () {
    it('should search for a simple term', function () {
        browser.get('https://primo-demo.hosted.exlibrisgroup.com/primo-explore/search?vid=NORTH');

        search('simple');

        browser.waitForAngular();

        const searchResults = element.all(by.xpath('//prm-brief-result-container'));
        expect(searchResults.count()).toEqual(10);
    });
});