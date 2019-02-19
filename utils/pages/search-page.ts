import {by, element ,Key, promise, $, ElementFinder} from "protractor";
import data from '../../gotcha.json'
import Browser from "../../utils/browser-util";


export default class SearchPage{
    public static searchBar = element(by.css('#searchBar'));
    public static searchButton = element(by.css('.search-actions .button-confirm'));
    public static searchResults= element.all(by.css('.list-item'));
    public static tabDropDownButton = element(by.model('$ctrl.tab'));
    public static scopeDropDownButton = element(by.model('$ctrl.scope'));
    public static selectedTab = element.all(by.repeater("tab in $ctrl.tabOptions"));
    public static selectedScope = element.all(by.repeater("scope in $ctrl.scopeOptions"));
    private static scopesObjects = data.conf.scopes;
    private static searchTerms = data.tests.search;
    public static resultsCount = element(by.css('.results-count'));
    

    /**
     * inserts a term to the search bar and performs a simple search
     * @param term - a term to do search with.
     */
    public static search(term: string, tab: string, scope: string) {
        let urlParams = 'query=any,contains,' + encodeURI(term) + '&tab=' + tab + '&search_scope=' + scope;
        Browser.get('/search', urlParams);
        Browser.waitForAngular();        
    }

    public static resultCountValue(): promise.Promise<Number> {
        return new Promise((resolve, reject) => {
            this.resultsCount.getText().then((value) => {
                let num = Number(value.split(" ")[0].replace(/,/g,""));
                if (!isNaN(num)) {
                    resolve(num);
                } else {
                    reject('could not parse number of results');
                }
           });
        });
    }

    static get scopes(): any {
        return this.scopesObjects;
    }

    public static termsObject(key:string): any {
        return this.searchTerms[key];
    }

    static get terms() : any {
        return this.searchTerms;
    }

    static get selectedTabValue(): ElementFinder {
        return this.selectedTab.filter((element)=> {
            return element.getAttribute('aria-selected').then((value)=> {
                return value=='true';
            });
        }).first();
    }

    static get selectedScopeValue(): ElementFinder {
        return this.selectedScope.filter((element)=> {
            return element.getAttribute('aria-selected').then((value)=> {
                return value=='true';
            });
        }).first();
    }

}