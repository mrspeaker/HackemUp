// Timer for fetching updates.
// Will only update when tab is focused.
var hnutimer = {
    refreshTime: 60000,
    lastCheck: null,
    timerId: null,
    focusedTime: null,
    init: function(onTimerExpire){
        $(window).bind({
            "focus": function(){ hnutimer.onFocus(); },
            "blur": function(){ hnutimer.onBlur(); }
        });
        this.onTimerExpire = onTimerExpire;
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
            if(rightNow - this.focusedTime > 1000){
                this.onTimerExpire && this.onTimerExpire();
                this.lastCheck = rightNow;
            } else {
                refreshTime = 1000;
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