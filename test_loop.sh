#!/bin/sh

SERVER_NAME=primo-studio.exlibrisgroup.com
curl $SERVER_NAME:80/test-params -o params.zip -b "secret=$SECRET_COOKIE"
mkdir -p params
unzip params.zip -d params
for param_file in params/*; do
    echo
    param=$(jq -c '.' "$param_file")
    baseUrl=$(jq -r '.baseUrl' <<< "$param")
    vid=$(jq -r '.vid' <<< "$param")
    isVe=$(jq -r '.isVe' <<< "$param")
    suites=$(jq -r -c '.suites' <<< "$param")
    suitesarray=$(jq -r -c 'join(",")' <<< "$suites")
    protractor tmp/protractor.conf.js --params.baseUrl="$baseUrl" --params.vid="$vid" --params.isVe="$isVe" --suite="$suitesarray"
    curl -X POST $SERVER_NAME:80/test-response -H "Content-Type: application/json" --data-binary "@target/results.json" -b "baseUrl=$baseUrl;vid=$vid;isVe=$isVe;secret=$SECRET_COOKIE"
    echo
done
rm -rf params
rm -f params.zip