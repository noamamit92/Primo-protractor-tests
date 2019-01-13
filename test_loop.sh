#!/bin/sh
cat params.json
for param in $(jq '.[]' params.json); do
    echo '$param'
    baseUrl=$(jq '.baseUrl' <<< '$param')
    vid=$(jq '.vid' <<< '$param')
    isVe=$(jq '.isVe' <<< '$param')
    protractor tmp/protractor.conf.js --params.baseUrl="$baseUrl" --params.vid="$vid" --params.isVe="$isVe"
done