/*
 * http://jsbin.com/iqafek/2/edit
 */

var normalizeWheelDelta = function () {
    // Keep a distribution of observed values, and scale by the
    // 33rd percentile.
    var distribution = [],
        done = null,
        scale = 30;
    return function (n) {
        // Zeroes don't count.
        if (n == 0) return n;
        // After 500 samples, we stop sampling and keep current factor.
        if (done != null) return n * done;
        var abs = Math.abs(n);
        // Insert value (sorted in ascending order).
        outer: do { // Just used for break goto
            for (var i = 0; i < distribution.length; ++i) {
                if (abs <= distribution[i]) {
                    distribution.splice(i, 0, abs);
                    break outer;
                }
            }
            distribution.push(abs);
        } while (false);
        // Factor is scale divided by 33rd percentile.
        var factor = scale / distribution[Math.floor(distribution.length / 3)];
        if (distribution.length == 500) done = factor;
        return n * factor;
    };
}();

var requestAnimationFrame = window.requestAnimationFrame ||
    window.webkitRequestAnimationFrame ||
    window.mozRequestAnimationFrame ||
    window.oRequestAnimationFrame ||
    window.msRequestAnimationFrame ||
        function (callback) {
            window.setTimeout(callback, 1000 / 60);
    };

var currentY = 0,
    targetY = 0,
    oldY = 0,
    maxScrollTop = 0,
    minScrollTop,
    direction,
    fricton = 0.95, // higher value for slower deceleration
    vy = 0,
    stepAmt = 1,
    minMovement = 0.1,
    ts = 0.1;

function getScrollPosition() {
    if (document.documentElement.scrollTop == 0) {
        return document.body.scrollTop;
    } else {
        return document.documentElement.scrollTop;
    }
}

function updateScrollTarget(amt) {
    targetY += amt;
    vy += (targetY - oldY) * stepAmt;

    oldY = targetY;
}

function mouseScroll(e) {
    // cancel the default scroll behavior
    if (e.preventDefault) {
        e.preventDefault();
    }

    var evt = e; //.originalEvent;

    var delta = evt.detail ? evt.detail * -1 : evt.wheelDelta / 40;
    var dir = delta < 0 ? -1 : 1;
    if (dir != direction) {
        vy = 0;
        direction = dir;
    }
    currentY = -getScrollPosition();
    updateScrollTarget(delta);
}

function animationLoop() {
    requestAnimationFrame(animationLoop);

    // scroll up or down by 10 pixels when the mousewheel is used
    if (mouseWheelActive) {
        if (vy < -(minMovement) || vy > minMovement) {

            currentY = (currentY + vy);
            if (currentY > maxScrollTop) {
                currentY = vy = 0;
            } else if (currentY < minScrollTop) {
                vy = 0;
                currentY = minScrollTop;
            }

            $('html, body').scrollTop(-currentY);
            vy *= fricton;
        }
    }
}

function feelTheSmoothWheeling() {
    // deal with the mouse wheel
    window.addEventListener("mousewheel", mouseScroll, false);
    window.addEventListener("DOMMouseScroll", mouseScroll, false);

    targetY = oldY = getScrollPosition();
    currentY = -targetY;

    minScrollTop = document.documentElement.clientHeight - document.documentElement.scrollHeight;

    animationLoop();
}