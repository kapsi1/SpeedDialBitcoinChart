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

var sourcesEl = document.getElementById('sources'),
    currenciesEl = document.getElementById('currencies');

function activate(li) {
    Array.prototype.forEach.call(document.querySelectorAll('#' + li.parentNode.id + ' li'), function (el) {
        el.className = '';
    });
    li.className = 'active';
}

function showCurrencies(exchange) {
    Array.prototype.forEach.call(document.querySelectorAll('#currencies ul'), function (el) {
        el.style.display = 'none';
    });
    document.querySelector('#currencies #' + exchange).style.display = 'block';
}

function setCurrency(currency) {
    console.log('setCurrency', currency);
    localStorage.setItem('currency', currency);
    notifyOptionsChanged();
}

dataSources.forEach(function (server) {
    var li = document.createElement('li'),
        a = document.createElement('a');
    a.textContent = server.exchange;
    a.href = '#';
    li.appendChild(a);
    sourcesEl.appendChild(li);

    var ul = document.createElement('ul');
    ul.className = 'nav nav-pills';
    ul.id = server.exchange;
    server.currencies.forEach(function (currency) {
        var li = document.createElement('li'),
            a = document.createElement('a');
        a.textContent = currency.type;
        a.href = '#';
        li.appendChild(a);
        ul.appendChild(li);
    });
    currenciesEl.appendChild(ul);
});
activate(document.querySelector('#sources li'));
var firstServer = document.querySelector('#sources a').textContent;
showCurrencies(firstServer);
activate(document.querySelector('#' + firstServer + ' li'));

Array.prototype.forEach.call(document.querySelectorAll('#sources li'), function (el) {
    el.addEventListener('click', function () {
        activate(el);
        showCurrencies(el.textContent);
        activate(document.querySelector('#' + el.textContent + ' li'));
        setCurrency(document.querySelector('#' + el.textContent + ' li').textContent);
    });
});
Array.prototype.forEach.call(document.querySelectorAll('#currencies li'), function (el) {
    el.addEventListener('click', function () {
        activate(el);
        setCurrency(el.textContent);
    });
});