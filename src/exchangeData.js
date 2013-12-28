/*global chrome*/
(function () {
    'use strict';
    var sourcesXhr;
    if (!window.dataSources) {
        sourcesXhr = new XMLHttpRequest();
        sourcesXhr.open("GET", chrome.extension.getURL('exchanges.json'), false);
        sourcesXhr.send();
        window.dataSources = JSON.parse(sourcesXhr.response);
    }
})();