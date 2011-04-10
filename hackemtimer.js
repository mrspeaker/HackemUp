/*
    Welcome to a Hacker News Bookmarklet...
    "Hack'em Up" by Mr Speaker
    v1.0

    Timer module: Will only update when tab is focused.
*/
var hnutimer = {
    refreshTime: 2 * (60 * 1000),
    waitOnFocusTime: 1500,

    lastCheck: null,
    timerId: null,
    focusedTime: null,
    init: function(onTimerExpire){
        $(window).bind({
            "focus": function(){ hnutimer.onFocus(); },
            "blur": function(){ hnutimer.onBlur(); }
        });
        this.onTimerExpire = onTimerExpire;
        // Init onfocus to avoid first time load delay
        this.focusedTime = new Date().getTime() - this.waitOnFocusTime;
        this.update();
    },
    update: function(){
        var doFetch = true,
            refreshTime = this.refreshTime,
            previous = this.lastCheck,
            rightNow = new Date().getTime(),
            elapsed = previous ? rightNow - previous : refreshTime;

        if (elapsed < refreshTime) {
            doFetch = false;
            refreshTime -= elapsed;
        }

        if(doFetch) {
            if(rightNow - this.focusedTime >= this.waitOnFocusTime){
                this.onTimerExpire && this.onTimerExpire();
                this.lastCheck = rightNow;
            } else {
                refreshTime = this.waitOnFocusTime;
            }
        }
        this.timerId = setTimeout(function(){ hnutimer.update(); }, refreshTime);
    },
    onFocus: function(){
        this.focusedTime = new Date().getTime();
        this.update();
    },
    onBlur: function(){
        clearTimeout(this.timerId);
    }
};
