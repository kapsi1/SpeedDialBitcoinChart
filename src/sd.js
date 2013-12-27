var options, chartTimer, tickerTimer, tradesReq = new XMLHttpRequest(), tickerReq = new XMLHttpRequest(),
    width = 228, height = 168, leftPadding = 33, rightPadding = 10, bottomPadding = 20,
    lastEl = document.querySelector("#last"),
    dataSrc, data = [], line, x, y, svg, xAxis, yAxis;

function getOptions() {
    var refreshMinutes = localStorage.getItem('refreshMinutes') || 1,
        refreshSeconds = localStorage.getItem('refreshSeconds') || 0,
        refreshLastValSeconds = localStorage.getItem('refreshLastValSeconds') || 10;
    options = {
        chartRefreshTime: +refreshMinutes * 60 * 1000 + (+refreshSeconds * 1000),
        lastValRefreshTime: +refreshLastValSeconds * 1000,
        chartTimeRange: +localStorage.getItem('range') || 1440
    };
    var i, j, currency = localStorage.getItem('currency');
    if (currency) {
        for (i = 0; i < dataSources.length; i++) {
            for (j = 0; j < dataSources[i].currencies.length; j++) {
                if (dataSources[i].currencies[j].type === currency) {
                    dataSrc = dataSources[i].currencies[j];
                }
            }
        }
    } else {
        dataSrc = dataSources[0].currencies[0];
    }
    console.log('dataSrc', dataSrc);
}

line = d3.svg.line()
    .x(function (d) {
        return x(1000 * d[dataSrc.trades.timeVar]);
    })
    .y(function (d) {
        return y(d[dataSrc.trades.priceVar]);
    });
x = d3.time.scale().range([leftPadding, width - rightPadding]);
y = d3.scale.linear().range([height - bottomPadding, bottomPadding]);
svg = d3.select("svg")
    .attr("width", width)
    .attr("height", height);
xAxis = d3.svg.axis()
    .scale(x)
    .orient("bottom")
    .tickFormat(d3.time.format("%H:%M"))
    .ticks(4);
yAxis = d3.svg.axis()
    .scale(y)
    .orient("left")
    .ticks(5);

svg.append("g")
    .attr("class", "axis xaxis")
    .attr("transform", 'translate(' + 0 + ',' + (height - bottomPadding) + ')');
svg.append("g")
    .attr("class", "axis yaxis")
    .attr("transform", 'translate(' + (leftPadding - 0) + ',' + 0 + ')');

function updateChart() {
    x.domain(d3.extent(data, function (d) {
        return 1000 * d[dataSrc.trades.timeVar];
    }));
    y.domain([
        d3.min(data, function (d) {
            return d[dataSrc.trades.priceVar];
        }),
        d3.max(data, function (d) {
            return d[dataSrc.trades.priceVar];
        })
    ]);

    var lineGraph = svg.selectAll("#chart>path").data([data], function (d) {
        return 1000 * d[dataSrc.trades.timeVar];
    });

    lineGraph.enter().append("path").attr("d", line);

    lineGraph
        .attr("d", line);
//        .attr("transform", null)
//        .transition(1000)
//        .ease("linear")
//        .attr("transform", "translate(" + (
//            x(1000 * data[data.length - 1].date) - x(1000 * data[data.length - 2].date)
//            ) + ")");

    svg.selectAll(".xaxis").call(xAxis);
    svg.selectAll(".yaxis").call(yAxis);
}

tickerReq.onload = function () {
    var value, res = JSON.parse(this.response);
    if (dataSrc.ticker.containerObject) {
        value = res[dataSrc.ticker.containerObject][dataSrc.ticker.priceVar];
    } else {
        value = res[dataSrc.ticker.priceVar];
    }
    lastEl.textContent = +value + ' ' + dataSrc.type;
};

tradesReq.onload = function () {
    var d = new Date();
    data = JSON.parse(this.response).filter(function (transaction) {
        return (d - transaction.date * 1000) / 1000 / 60 < options.chartTimeRange; //time in minutes
    });

    updateChart();
};

function reload() {
    clearInterval(chartTimer);
    clearInterval(tickerTimer);

    tickerTimer = setInterval(function () {
        tickerReq.open("get", dataSrc.ticker.url, true);
        tickerReq.send();
    }, options.lastValRefreshTime);
    tickerReq.open("get", dataSrc.ticker.url, true);
    tickerReq.send();

    chartTimer = setInterval(function () {
        tradesReq.open("get", dataSrc.trades.url, true);
        tradesReq.send();
    }, options.chartRefreshTime);
    tradesReq.open("get", dataSrc.trades.url, true);
    tradesReq.send();
}

chrome.runtime.onMessage.addListener(function (message) {
    getOptions();
    reload();
});

getOptions();
reload();

//function getTestData() {
//    var xhr = new XMLHttpRequest();
//    xhr.onload = function () {
//        var d = new Date();
//        data = JSON.parse(this.response).filter(function (transaction) {
//            return (d - transaction.date * 1000) / 1000 / 60 < options.chartTimeRange; //time in minutes
//        });
//        updateChart();
//    }
//    xhr.open("GET", chrome.extension.getURL('testData.json'), true);
//    xhr.send();
//}
//getTestData();