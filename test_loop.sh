#!/bin/sh
for param in $(jq -c '.[]' params.json); do
    echo
    baseUrl=$(jq -r '.baseUrl' <<< "$param")
    vid=$(jq -r '.vid' <<< "$param")
    isVe=$(jq -r '.isVe' <<< "$param")
    suites=$(jq -r -c '.suites' <<< "$param")
    suitesarray=$(jq -r -c 'join(",")' <<< "$suites")
    protractor tmp/protractor.conf.js --params.baseUrl="$baseUrl" --params.vid="$vid" --params.isVe="$isVe" --suite="$suitesarray"
done