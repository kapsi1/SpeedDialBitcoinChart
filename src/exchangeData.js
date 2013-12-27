if (!exchanges) {
    var exchanges, sourcesXhr;
    sourcesXhr = new XMLHttpRequest();
    sourcesXhr.open("GET", chrome.extension.getURL('exchanges.json'), false);
    sourcesXhr.send();
    exchanges = JSON.parse(sourcesXhr.response);
}