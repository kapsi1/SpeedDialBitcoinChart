if (!dataSources) {
    var dataSources, sourcesXhr;
    sourcesXhr = new XMLHttpRequest();
    sourcesXhr.open("GET", chrome.extension.getURL('dataSources.json'), false);
    sourcesXhr.send();
    dataSources = JSON.parse(sourcesXhr.response);
}