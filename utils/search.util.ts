import {by, element, Key} from "protractor";

export function search(term: string) {
    element(by.css('#searchBar')).sendKeys(term);
    element(by.css('.search-actions .button-confirm')).sendKeys(Key.ENTER);
}