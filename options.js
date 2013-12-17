function notifyOptionsChanged(){
    chrome.runtime.sendMessage(null, 'optionsChanged');
}

var set = function (id, value) {
        return localStorage.setItem.call(localStorage, id, value);
    },
    get = function (id) {
        return localStorage.getItem.call(localStorage, id);
    }

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
    if(el.value === range) {
        el.checked = true;
    }
    el.addEventListener('change', function () {
        if (this.checked) {
            set('range', this.value);
            notifyOptionsChanged();
        }
    });
});