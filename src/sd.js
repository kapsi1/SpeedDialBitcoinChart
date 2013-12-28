var options, chartTimer, tickerTimer, tradesReq = new XMLHttpRequest(), tickerReq = new XMLHttpRequest(),
    width = 228, height = 168, leftPadding = 33, rightPadding = 10, bottomPadding = 20,
    lastEl = document.getElementById("last-value"),
    currencyObj, exchange, data = [], line, x, y, svg, xAxis, yAxis;

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
        for (i = 0; i < exchanges.length; i++) {
            for (j = 0; j < exchanges[i].currencies.length; j++) {
                if (exchanges[i].currencies[j].type === currency) {
                    currencyObj = exchanges[i].currencies[j];
                    exchange = exchanges[i].exchange;
                }
            }
        }
    } else {
        currencyObj = exchanges[0].currencies[0];
        exchange = exchanges[0].exchange;
    }
    document.getElementById('exchange').textContent = exchange;
}

line = d3.svg.line()
    .x(function (d) {
        return x(1000 * d[currencyObj.trades.timeVar]);
    })
    .y(function (d) {
        return y(d[currencyObj.trades.priceVar]);
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
        return 1000 * d[currencyObj.trades.timeVar];
    }));
    y.domain([
        d3.min(data, function (d) {
            return d[currencyObj.trades.priceVar];
        }),
        d3.max(data, function (d) {
            return d[currencyObj.trades.priceVar];
        })
    ]);

    var lineGraph = svg.selectAll("#chart>path").data([data], function (d) {
        return 1000 * d[currencyObj.trades.timeVar];
    });

    lineGraph.enter().append("path").attr("d", line);

    lineGraph.attr("d", line);

    svg.selectAll(".xaxis").call(xAxis);
    svg.selectAll(".yaxis").call(yAxis);
}

tickerReq.onload = function () {
    var value, res = JSON.parse(this.response);
    if (currencyObj.ticker.containerObject) {
        value = res[currencyObj.ticker.containerObject][currencyObj.ticker.priceVar];
    } else {
        value = res[currencyObj.ticker.priceVar];
    }
    lastEl.textContent = +value + ' ' + currencyObj.type;
};

tradesReq.onload = function () {
    var d = new Date(), serverData = JSON.parse(this.response);
    data = serverData.filter(function (transaction) {
        return (d - transaction.date * 1000) / 1000 / 60 < options.chartTimeRange; //time in minutes
    });

    updateChart();
};

function reload() {
    clearInterval(chartTimer);
    clearInterval(tickerTimer);

    tickerTimer = setInterval(function () {
        tickerReq.open("get", currencyObj.ticker.url, true);
        tickerReq.send();
    }, options.lastValRefreshTime);
    tickerReq.open("get", currencyObj.ticker.url, true);
    tickerReq.send();

    chartTimer = setInterval(function () {
        tradesReq.open("get", currencyObj.trades.url, true);
        tradesReq.send();
    }, options.chartRefreshTime);
    tradesReq.open("get", currencyObj.trades.url, true);
    tradesReq.send();
}

chrome.runtime.onMessage.addListener(function (message) {
    getOptions();
    reload();
});

getOptions();
reload();