var transitionEndEvent = 'webkitTransitionEnd',
    transitionEnd = function(target, duration, callbackFn) {
    var me = this,
        clear = function() {
            if (target.transitionTimer) clearTimeout(target.transitionTimer);
            target.transitionTimer = null;
            target.removeEventListener(transitionEndEvent, handler, false);
        },
        handler = function() {
            clear();
            if (callbackFn) callbackFn.call(me);
        };
    clear();
    target.addEventListener(transitionEndEvent, handler, false);
    target.transitionTimer = setTimeout(handler, duration + 100);
};

module.exports = transitionEnd;
