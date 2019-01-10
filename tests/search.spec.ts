import {browser, by, element, Key} from "protractor";

describe('search a simple term', function () {
    it('should search for a simple term', function () {
        browser.get('https://primo-demo.hosted.exlibrisgroup.com/primo-explore/search?vid=NORTH');

        element(by.css('#searchBar')).sendKeys('simple');
        element(by.css('.search-actions .button-confirm')).sendKeys(Key.ENTER);

        browser.waitForAngular();

        const searchResults = element.all(by.xpath('//prm-brief-result-container'));
        expect(searchResults.count()).toEqual(10);
    });
});