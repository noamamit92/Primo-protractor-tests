import {by, element, Key, promise} from "protractor";

export class SearchUtil{
    public static readonly search_query_input_selector: string = '#searchBar';
    public static readonly search_button_selector: string = '.search-actions .button-confirm';
    public static readonly brief_result_container_xpath: string = '//prm-brief-result-container';

    public static search(term: string) {
        var searchBar = element(by.css(this.search_query_input_selector));
        searchBar.sendKeys(term);
        var searchButton = element(by.css(this.search_button_selector));
        searchButton.sendKeys(Key.ENTER);
    }

    public static assertNumberOfResultsAppeared(expectedNumberOfResults: number): promise.Promise<void> {
        const searchResults = element.all(by.xpath(this.brief_result_container_xpath));
        return expect(searchResults.count()).toEqual(expectedNumberOfResults);
    }
}