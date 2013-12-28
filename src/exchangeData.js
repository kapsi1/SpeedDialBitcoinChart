/*global chrome*/
(function () {
    'use strict';
    var sourcesXhr;
    if (!window.exchanges) {
        sourcesXhr = new XMLHttpRequest();
        sourcesXhr.open("GET", chrome.extension.getURL('exchanges.json'), false);
        sourcesXhr.send();
        window.exchanges = JSON.parse(sourcesXhr.response);
    }
})();