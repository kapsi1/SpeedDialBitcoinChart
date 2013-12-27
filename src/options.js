function notifyOptionsChanged() {
    chrome.runtime.sendMessage(null, 'optionsChanged');
}

var set = function (id, value) {
        return localStorage.setItem.call(localStorage, id, value);
    },
    get = function (id) {
        return localStorage.getItem.call(localStorage, id);
    };

Array.prototype.forEach.call(document.querySelectorAll('.refresh'), function (el) {
    el.value = get(el.id) || el.value;

    el.addEventListener('change', function () {
        if (this.value >= 0) {
            set(this.id, this.value);
            notifyOptionsChanged();
        }
    });
});

var range = get('range');

Array.prototype.forEach.call(document.querySelectorAll('input[name="range"]'), function (el) {
    if (el.value === range) {
        el.checked = true;
    }
    el.addEventListener('change', function () {
        if (this.checked) {
            set('range', this.value);
            notifyOptionsChanged();
        }
    });
});

var exchangesEl = document.getElementById('exchanges'),
    currenciesEl = document.getElementById('currencies');

function activate(li) {
    Array.prototype.forEach.call(document.querySelectorAll('#' + li.parentNode.id + ' li'), function (el) {
        el.classList.remove('active');
    });
    li.classList.add('active');
}

function showCurrencies(exchange) {
    Array.prototype.forEach.call(document.querySelectorAll('#currencies ul'), function (el) {
        el.classList.add('hidden');
    });
    document.querySelector('#currencies #' + exchange).classList.remove('hidden');
}

function setExchange(exchangeEl) {
    var exchange = exchangeEl.textContent;
    console.log('setExchange', exchange);
    showCurrencies(exchange);
    activate(exchangeEl);
    activate(document.querySelector('#' + exchange + ' li'));
//    setCurrency(document.querySelector('#' + exchange + ' li'));
    localStorage.setItem('exchange', exchange);
//    notifyOptionsChanged();
}

function setCurrency(currencyEl) {
    console.log('setCurrency', currencyEl.textContent);
    activate(currencyEl);
    set('currency', currencyEl.textContent);
    notifyOptionsChanged();
}

exchanges.forEach(function (server) {
    var li = document.createElement('li'),
        a = document.createElement('a');
    a.textContent = server.exchange;
    li.classList.add(server.exchange);
    a.href = '#';
    li.appendChild(a);
    exchangesEl.appendChild(li);

    var ul = document.createElement('ul');
    ul.classList.add('nav', 'nav-pills');
    ul.id = server.exchange;
    server.currencies.forEach(function (currencyObj) {
        var li = document.createElement('li'),
            a = document.createElement('a');
        a.textContent = currencyObj.type;
        a.href = '#';
        li.classList.add(currencyObj.type);
        li.appendChild(a);
        ul.appendChild(li);
    });
    currenciesEl.appendChild(ul);
});

var exchange = get('exchange') || document.querySelector('#exchanges a').textContent,
    currency = get('currency') || document.querySelector('#currencies a').textContent;

setExchange(document.querySelector('#exchanges .' + exchange));
setCurrency(document.querySelector('#currencies .' + currency.replace('/', '\\/') + ':not(.hidden)'));

Array.prototype.forEach.call(document.querySelectorAll('#exchanges li'), function (el) {
    el.addEventListener('click', function () {
        setExchange(el);
//        setCurrency(document.querySelector('#currencies li'));
    });
});
Array.prototype.forEach.call(document.querySelectorAll('#currencies li'), function (el) {
    el.addEventListener('click', function () {
        setCurrency(el);
    });
});