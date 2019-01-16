import {SearchUtil} from "../../utils/search.util";
import {Browser} from "../../utils/browser.util";

describe('search a simple term', function () {
    it('should search for simple', function () {
        console.log('*** Starting search test ***');
        Browser.get('/search');
        SearchUtil.search('simple');
        Browser.waitForAngular();
        SearchUtil.assertNumberOfResultsAppeared(10);
    });
});