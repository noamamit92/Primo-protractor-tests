import {SearchUtil} from "../../utils/search.util";
import {Browser} from "../../utils/browser.util";

describe('search a simple term', function () {
    it('should search for simple', function () {
        Browser.get('/search').then(() => {
            SearchUtil.search('simple');

            Browser.waitForAngular().then(() => {
                return SearchUtil.assertNumberOfResultsAppeared(10);
            });
        });
    });
});