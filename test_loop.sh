#!/bin/sh
for param in $(jq '.[]' -f params.json); do
    baseUrl=$(jq -r '.baseUrl' <<< '$param')
    vid=$(jq -r '.vid' <<< '$param')
    isVe=$(jq -r '.isVe' <<< '$param')
    protractor tmp/protractor.conf.js --params.baseUrl="$baseUrl" --params.vid="$vid" --params.isVe="$isVe"
done