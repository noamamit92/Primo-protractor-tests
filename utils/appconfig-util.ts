import Browser from "./browser-util";
import data from '../gotcha.json'


export default class AppConfigUtil {

    public static async setEnviormentVars() {       
        let scopes = data.conf.scopes;
        for (let scope of scopes) {
            if (this.isScopeLocal(scope.locations)) {
                scope['scopeType'] = 'Local';
            } else if (this.isScopePC(scope.locations)) {
                scope['scopeType'] = 'PC';
            } else if (this.isScopeEbsco(scope.locations)) {
                scope['scopeType'] = 'EBSCO';
            } else if (this.isScopeWorldCat(scope.locations)) {
                scope['scopeType'] = 'WorldCat';
            } else if (this.isScopeBlended(scope.locations)) {
                scope['scopeType'] = 'Blended';
            }
        }    
    }


    private static isScopeLocal(locations: string) : boolean {
        if (this.isPrimoVe) {
            return (locations=='Local');
        } else {
            let onlyLocalRegex = new RegExp('^(scope:\(.*\))+$')
            return onlyLocalRegex.test(locations);
        }
    }

    private static isScopePC(locations: string) : boolean {
        return (locations == 'primo_central_multiple_fe');
    }

    private static isScopeEbsco(locations: string) : boolean {
        return (locations=='EbscoLocal');
    }

    private static isScopeWorldCat(locations: string) : boolean {
        return (locations=='WorldCatLocal');
    }

    private static isScopeBlended(locations: string) : boolean {
        let containsEbsco = locations.includes('EbscoLocal');
        let containsWorldCat = locations.includes('WorldCatLocal');
        let containsPC = locations.includes('primo_central_multiple_fe');
        let containsLocal: boolean;
        if (this.isPrimoVe) {
            containsLocal = locations.includes('Local')    
        } else {
            let localIncRegex = new RegExp('(scope:\(.*\))+');
            containsLocal = localIncRegex.test(locations);
        }
         return (containsLocal && (containsPC || containsEbsco || containsWorldCat));
    }

    static get isPrimoVe() : boolean {
        return Browser.getBrowser().params.isVe == 'true';
    }
}
