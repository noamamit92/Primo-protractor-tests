import {ResponsePromise} from "protractor-http-client/dist/promisewrappers";
import {HttpClient} from "protractor-http-client/dist/http-client";
import fs from 'fs';
import * as Launcher from 'protractor/built/launcher'
import minimist from 'minimist';
import {config} from "./protractor.conf";

const request = require('request');
const NUMBER_OF_ITERATIONS = 5;
class GotchaUtil {

    public static init() {

        let params = minimist(process.argv.splice(2)) || {};

        let envArray = params['envArray'].split(',') || config.params.envArray ;
        console.log(envArray[0]);


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


        if(envArray && envArray.length > 0){
            let isVe = 'true';
            let system = isVe === 'true' ? 've' : 'primo';
            console.log("running smoke on all enviornments");
            let _this = this;
            envArray.forEach((env)=>{

                console.log("running enviornment: " + env);

                const http = new HttpClient(env);

                let veInstancesRoute = systemToRestPath["ve"] + "/gotcha/ve";
                console.log('baseUrl: ' + env + veInstancesRoute);

                const veInstancesResponse: ResponsePromise = <ResponsePromise>http.get(veInstancesRoute).then(
                    (veInstancesResponse) => {

                        console.log("ve env response: "+ veInstancesResponse.body)
                        let veViews = JSON.parse(veInstancesResponse.body);
                        let index = 0;
                        Object.keys(veViews).filter(key => key !== 'beaconO22' && key.indexOf('ResearchRepository') === -1 && key.indexOf(':Services') === -1).forEach(function(key) {
                            if(index < 7){
                                console.log('Key : ' + key + ', Value : ' + veViews[key])
                                _this.runOnView(env, systemToRestPath, "ve", apiRoute, key, index);
                                index++;
                            }

                        })
                    });
            })
        }
    }

    static runOnView(baseUrl: any|string, systemToRestPath: {primo: string; ve: string}, system: string|string, apiRoute: {conf: {primo: string; ve: string}; jwt: {primo: string; ve: string}; gotcha: {primo: string; ve: string}}, vid: any|string, index: any|string) {
        const http = new HttpClient(baseUrl);

        let confRoute = systemToRestPath[system] + apiRoute.conf[system] + '/' + vid;
        console.log('baseUrl: ' + baseUrl + confRoute);

        const confResponse: ResponsePromise = <ResponsePromise>http.get(confRoute).then(
            (confResponse) => {
                let conf = JSON.parse(confResponse.body);
                let institutionCode = conf['primo-view']['institution']['institution-code'];
                let isNPActive = conf['primo-view']['institution']['newspapers-search'];
                console.log('view institution: ' + institutionCode);
                if(!isNPActive){//cannot test for now - need to fix gotcha api to not always send false for NPS
                    let jwtPath = {
                        'primo': systemToRestPath[system] + apiRoute.jwt[system] + '/guestJwt/' + institutionCode + '?lang=en_US&viewId=' + vid,
                        've': systemToRestPath[system] + apiRoute.jwt[system] + '/' + institutionCode + '/guestJwt?lang=en&viewId=' + vid
                    };
                    console.log('jwtPath: ' + jwtPath[system]);
                    const jwtResponse: ResponsePromise = <ResponsePromise>http.get(jwtPath[system]).then(
                        (jwtResponse) => {
                            let jwt = jwtResponse.body;
                            console.log('jwt: ' + jwt);

                            let gotchaPath = systemToRestPath[system] + apiRoute.gotcha[system] + '/' + vid + '/tests?area=search&test=basic&newspapersActive=' + conf['primo-view'].institution['newspapers-search'] + '&refEntryActive=' + conf['primo-view']['attributes-map']['refEntryActive'];
                            console.log('gotchaPath: ' + baseUrl + gotchaPath);


                            function callback(error, gotchaResponse, body) {
                                console.log("###### " +JSON.parse(gotchaResponse.body).errorCode);
                                error = error || JSON.parse(gotchaResponse.body).errorCode;
                                if (!error && gotchaResponse && gotchaResponse.body) {
                                    console.log("gotchaResponse.body: " + gotchaResponse.body);
                                    let gotchaObj = JSON.parse(gotchaResponse.body);
                                    let gotchaConfPath = systemToRestPath[system] + apiRoute.gotcha[system] + '/' + vid + '/conf?&newspapersActive=' + conf['primo-view'].institution['newspapers-search'] + '&refEntryActive=' + conf['primo-view']['attributes-map']['refEntryActive'];
                                    console.log('gotchaConfPath: ' + baseUrl + gotchaConfPath);

                                    function callbackConf(error, gotchaConfResponse, body) {
                                        if (!error && gotchaConfResponse && gotchaConfResponse.body) {
                                            setTimeout(function () {
                                                let gotchaConfObj = JSON.parse(gotchaConfResponse.body);
                                                console.log('gotcha: ' + JSON.stringify(gotchaConfObj));


                                                gotchaObj.conf = gotchaConfObj.conf;

                                                let gotcha = JSON.stringify(gotchaObj)
                                                console.log('gotcha: ' + gotcha + 'system: ' + system + (system === 've'));
                                                //run the tests

                                                let params = {baseUrl: baseUrl, vid: vid, isVe:
                                                    system === 've' ? 'true':'false',
                                                    gotcha: gotchaObj};

                                                const { fork } = require('child_process');
                                                const child = fork("tmp/launcher-util.js",{
                                                    stdio: "inherit"
                                                });
                                                child.on('message', function (message) {
                                                    child.send(params);
                                                });
                                                child.on('error', function (code, signal) {
                                                    console.log('child process exited error with ' +
                                                        `code ${code} and signal ${signal}`);
                                                });

                                            }, 30000 * index);
                                        }
                                        else {
                                            if (error) {
                                                console.log("error: " + error);
                                            }
                                        }

                                    }

                                    let options = {
                                        method: 'GET',
                                        url: baseUrl + gotchaConfPath,
                                        headers: {
                                            'Authorization': 'Bearer ' + jwt
                                        }
                                    };
                                    const gotchaConfResponse = request(options, callbackConf);

                                }
                                else {
                                    if (error) {
                                        console.log("error: " + error);
                                    }
                                }

                            }

                            let options = {
                                method: 'GET',
                                url: baseUrl + gotchaPath,
                                headers: {
                                    'Authorization': 'Bearer ' + jwt
                                }
                            };
                            const gotchaResponse = request(options, callback);

                        }
                    )
                }

            }
        );

    }
}

GotchaUtil.init();
