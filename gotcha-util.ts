import {ResponsePromise} from "protractor-http-client/dist/promisewrappers";
import {HttpClient} from "protractor-http-client/dist/http-client";
import fs from 'fs';
import minimist from 'minimist';
import {config} from "./protractor.conf";

const request = require('request');

class GotchaUtil {

    public static init() {
        let params = minimist(process.argv.splice(2)) || {};
        let baseUrl = params['baseUrl'] || config.params.baseUrl;
        let vid = params['vid'] || config.params.vid;
        let isVe = params['isVe'] || config.params.isVe;
        let system = isVe === 'true' ? 've' : 'primo';

        fs.writeFile('gotcha.json', "{}", 'utf8', () => {
            console.log("file written to root as {}")
        });

        const systemToRestPath = {
            'primo': '/primo_library/libweb/webservices/rest/v1',
            've': '/primaws/rest/pub'
        };
        const apiRoute = {
            'conf': {
                'primo': '/configuration',
                've': '/configuration/vid'
            },
            'jwt': {
                'primo': '',
                've': '/institution'
            },
            'gotcha': {
                'primo': '/gotcha/vid',
                've': '/gotcha/vid'
            }

        };
        const http = new HttpClient(baseUrl);

        let confRoute = systemToRestPath[system] + apiRoute.conf[system] + '/' + vid;
        console.log('baseUrl: ' + baseUrl);

        const confResponse: ResponsePromise = <ResponsePromise>http.get(confRoute).then(
            (confResponse) => {
                let conf = JSON.parse(confResponse.body);
                let institutionCode = conf['primo-view']['institution']['institution-code'];
                console.log('view institution: ' + institutionCode);

                let jwtPath = {
                    'primo': systemToRestPath[system] + apiRoute.jwt[system] + '/guestJwt/' + institutionCode + '?lang=en_US&viewId=' + vid,
                    've': systemToRestPath[system] + apiRoute.jwt[system] + '/' + institutionCode + '/guestJwt?lang=en&viewId=' + vid
                };
                console.log('jwtPath: ' + jwtPath[system]);
                const jwtResponse: ResponsePromise = <ResponsePromise>http.get(jwtPath[system]).then(
                    (jwtResponse) => {
                        let jwt = jwtResponse.body;
                        console.log('jwt: ' + jwt);

                        let gotchaPath = systemToRestPath[system] + apiRoute.gotcha[system] + '/' + vid + '/all?newspapersActive=' + conf['primo-view'].institution['newspapers-search'] + '&refEntryActive=' + conf['primo-view']['attributes-map']['refEntryActive'];
                        console.log('gotchaPath: ' + gotchaPath);

                        function callback(error, gotchaResponse, body) {
                            let gotcha = gotchaResponse.body;
                            console.log('gotcha: ' + gotcha);
                            fs.writeFile('gotcha.json', gotcha, 'utf8', () => {
                                console.log("file written to root with data: " + gotcha)
                            });
                            fs.writeFile('tmp/gotcha.json', gotcha, 'utf8', () => {
                                console.log("file written to tmp/gotcha.json")
                            });
                        }

                        let options = {
                            method: 'GET',
                            url: baseUrl + gotchaPath,
                            headers: {
                                'Authorization': 'Bearer ' + jwt
                            }
                        };
                        const gotchaResponse = request(options, callback)
                    }
                )
            }
        );
    }
}

GotchaUtil.init();
