/*
    Welcome to a Hacker News Bookmarklet...
    "Hack'em Up" by Mr Speaker
    v0.1
    
    Screen play:
        Drag bookmarklet to a tab that is opened to 
             http://www.ycombinator.com/news
        Every X minutes the page will be refreshed and
        changes will be highlighted.

    Written and directed by:
        var _ = mrspeaker
            twitter = @_
            mail = _@gmail.com,
            tubes = http://_.net;
 
    Also staring:
        jQuery Bookmarklet - version 1.0
        Originally written by: Brett Barros
        With modifications by: Paul Irish
*/

// Loadem Up...
window.bookmarklet = (function(opts){fullFunc(opts)})({ 
    css : [hnuBase + "hackemup.css?q=20"],
    js  : [
        hnuBase + "hackemup.js",
        hnuBase + "hackemtimer.js" 
    ],
    ready : function(){

        // Only works on the main page
        var loc = window.document.location;
        if(loc.hostname !== "news.ycombinator.com" || (loc.pathname !== "/" && loc.pathname !== "/news") ){
            alert("Only works on Hacker News front page:\nhttp://news.ycombinator.com/");
            return;
        };

        // Start the show.
        hackemup.init();
        hnutimer.init(function() { 
            // When the timer's done...
            hackemup.fetch(); 
        });
    }
});


// jQuery bookmarklet magic...
function fullFunc(a){function d(b){if(b.length===0){a.ready();return false}
$.getScript(b[0],function(){d(b.slice(1))})}function e(b){$.each(b,function(c,f){$("<link>")
.attr({href:f,rel:"stylesheet"}).appendTo("head")})}a.jqpath=a.
jqpath||"http://ajax.googleapis.com/ajax/libs/jquery/1.5.2/jquery.min.js";
(function(b){var c=document.createElement("script");c.type="text/javascript";c.src=b;
c.onload=function(){e(a.css);d(a.js)};document.body.appendChild(c)})(a.jqpath)};