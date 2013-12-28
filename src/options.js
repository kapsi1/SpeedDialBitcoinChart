/*global chrome*/
(function () {
    'use strict';

    function notifyOptionsChanged() {
        chrome.runtime.sendMessage(null, 'optionsChanged');
    }

    function set(id, value) {
        localStorage.setItem.call(localStorage, id, value);
        notifyOptionsChanged();
    }

    function get(id) {
        return localStorage.getItem.call(localStorage, id);
    }

    function eachElement(arg1, fn) {
        if (typeof arg1 === 'string') //CSS selector
            Array.prototype.forEach.call(document.querySelectorAll(arg1), fn);
        else Array.prototype.forEach.call(arg1, fn); //nodeList
    }

    function activateButton(button, event) {
        eachElement(button.parentNode.parentNode.parentNode.querySelectorAll('button'), function (el) {
                el.classList.remove('active');
            }
        );
        button.classList.add('active');
        if (event)
            event.preventDefault();
    }

    eachElement('.refresh-time', function (el) {
        el.value = get(el.id) || el.value;

        el.addEventListener('change', function () {
            if (this.value >= 0) {
                set(this.id, this.value);
            }
        });
    });

    var range = get('range');
    eachElement('#chart-range button', function (button) {
        if (button.value === range) {
            activateButton(button, event);
        }
        button.addEventListener('click', function (event) {
            activateButton(button, event);
            set('range', button.value);
        });
    });

    window.dataSources.forEach(function (server) {
        var wrapper = document.createElement('div'),
            header = document.createElement('h5'),
            currencyList = document.createElement('div');

        wrapper.id = server.exchange;
        header.textContent = server.exchange;
        currencyList.className = 'btn-group';

        server.currencies.forEach(function (currencyObj) {
            var currencyEl = document.createElement('button');
            currencyEl.textContent = currencyObj.type;
            currencyEl.className = 'btn btn-default';
            currencyList.appendChild(currencyEl);
        });

        wrapper.appendChild(header);
        wrapper.appendChild(currencyList);
        document.getElementById('exchanges').appendChild(wrapper);
    });

    eachElement(document.querySelectorAll('#exchanges button'), function (button) {
        button.addEventListener('click', function (event) {
            activateButton(button, event);
            set('exchange', this.parentNode.parentNode.id);
            set('currency', this.textContent);
        });
    });

    var exchange = get('exchange'),
        currency = get('currency');
    eachElement('#exchanges button', function (button) {
        if (button.parentNode.parentNode.id === exchange && button.textContent === currency)
            activateButton(button);
    });
})();