/*
    Welcome to a Hacker News Bookmarklet...
    "Hack'em Up" by Mr Speaker
    v1.0

    DOM wranglin' a go-go.
*/
var hackemup = {

    loadfailz: 0,

    selecta: {
        body: "table:first",
        logo: "body table:first table:first tbody tr:first td:first a:first img",
        firstColumn: "body > center > table tbody tr:eq(3) td > table > tbody > tr > td:first"
    },

    init: function() {
        // Animate the first column
        $(this.selecta.firstColumn)
            .animate({ width: 35 }, 400);
    },

    fetch: function() {
        var _this = this,
            logo = $(this.selecta.logo).addClass("hnu-spin");

        // Fetch the new HTML
        $("<div></div>").load("/ " + this.selecta.body, function(response, status) {
            logo.removeClass("hnu-spin");

            if(status !== "success") {
                if(_this.loadfailz++ > 0) {
                    return;
                }
                // Retry once, after 1.5 seconds...
                setTimeout(function(){ _this.fetch(); }, 1500);
                return;
            }

            _this.loadfailz = 0;
            _this.update($(response));
        });
    },

    update: function(fetched) {
        // Remove added changes from last round
        // (because we re-parse the doc. TODO: just store the last doc
        // then we don't have to be careful about how we add new elements)
        $(this.selecta.body).find(".hnu").remove();

        // Extract some infoz
        var lastDoc = new hndoc($(this.selecta.body)),
            newDoc = new hndoc(fetched.children()),
            _this = this;

        // Replace the current page DOM with the latest DOM
        lastDoc.$.replaceWith(newDoc.$);

        // Stretch the first column
        $(this.selecta.firstColumn).addClass("hnu-col");

        // Check if articles have changed
        newDoc
            .articleList
            .each(function(){
                var newVersion = this,
                    oldVersion = lastDoc
                        .articleList
                        .filter(function(){
                            return newVersion.id === this.id;
                        });

                if(oldVersion.length) {
                    _this.updateArticle(newVersion, oldVersion[0]);
                }
                else {
                    _this.newArticle(newVersion);
                }
            });
            
        // Hide runs of rises (just means another story tanked)
        this.removeRuns(newDoc);

        // Check if karma has changed
        if(newDoc.karma !== lastDoc.karma) {
            this.setKarma(newDoc, lastDoc.karma);
        }
    },

    // Update the DOM to show last karma
    setKarma: function(doc, oldKarma) {
        var end = $(document.createTextNode(") | ")),
            old = $("<del></del>")
                .text(oldKarma)
                .addClass("hnu hnu-karma");

        doc.$karma().textContent = " (" + doc.karma;
        old.insertAfter(doc.$karma());
        end.insertAfter(old);
    },

    // Update the DOM to include the last lot of info
    updateArticle: function(newDoc, oldDoc) {
        if(newDoc.rank < oldDoc.rank || newDoc.rank - oldDoc.rank > 3) {
            $("<span></span>")
                .addClass("hnu")
                .addClass(newDoc.rank > oldDoc.rank ? "hnu-down" : "hnu-up")
                .text(Math.abs(oldDoc.rank - newDoc.rank))
                .hide()
                .prependTo(newDoc.$rank())
                .fadeIn();
        }

        if(newDoc.votes !== oldDoc.votes) {
            $("<span></span>")
                .addClass("hnu hnu-votes")
                .text(oldDoc.votes)
                .insertBefore(newDoc.$votes());
        }

        if(newDoc.comments !== oldDoc.comments) {
            $("<span></span>")
                .addClass('hnu hnu-votes')
                .text(oldDoc.comments)
                .insertBefore(newDoc.$comments());
        }
    },

    // Update the DOM to show the article is new
    newArticle: function(newDoc) {
        $("<span></span>")
            .addClass("hnu hnu-new")
            .text("+")
            .hide()
            .prependTo(newDoc.$rank())
            .fadeIn();
    },
    
    // Remove runs of +1 rises (when another story nose-dives)
    removeRuns: function(doc) {
        var prev = { rise: 0 },
            run = [],
            testRun = function(run) {
                // If run > 2, kill the icon
                run.length > 2 && run.forEach(function(el){
                    el.$.fadeOut("fast", function(){
                        $(this).remove();
                    });
                });
            };

        // Don't need to map & sort if find always returns in order... does it?
        doc.$.find(".hnu-up")
            .map(function() {
                return {
                    rise: parseInt($(this).text(), 10),
                    rank: parseInt(this.nextSibling.textContent.replace(/[^0-9]/g,""), 10),
                    $: $(this)
                };
            })
            .sort(function (a,b) {
                return a.rank > b.rank ? 1 : (a.rank < b.rank ? -1 : 0);
            })
            .toArray()
            .forEach(function(el) {
                if(el.rise !== prev.rise || el.rank !== prev.rank + 1) {
                    testRun(run);
                    run = [el];
                    prev = el;
                    return;
                }
                run.push(el);
                prev = el;
            });
        testRun(run);
    }
};

// Encapsulate an entire HN page
function hndoc($doc) {
    this.$ = $doc;
    this.$header = function() {
        return this._header || (this._header = this.$.find("tbody tr:first table"));
    };
    this.$articles = function() {
        return this._articles || (this._articles = this.$.find("tbody tr:eq(3) table tr").slice(0, -2));
    };
    this.$userNode = function(){
        return this._userNode || (this._userNode = this.$header().find("tr > td:last").children());
    };
    this.$karma = function(){
        return this._karma || (this._karma = this.$userNode().contents()[1]);
    };

    this.isLoggedIn = this.$userNode().find("a:first").text().indexOf("login") === -1;
    this.karma = ! this.isLoggedIn ? -1 : parseInt(this.$karma().textContent.replace(/[^0-9]/g,""), 10);
    this.articleList = this.$articles()
            .filter(function(ind) {
                // Every third TR is the start of an article
                return ind % 3 === 0;
            })
            .map(function() {
                // Turn them into articles
                return new hnarticle($(this));
            });
}

// Encapsulate an individual article
function hnarticle($row) {
    this.$ = $row;
    this.$rank = function(){
        return this._rank || (this._rank = this.$.find("td:first"));
    };
    this.$votes = function() {
        return this._votes || (this._votes = this.$.next().find("td:eq(1) span:first"));
    };
    this.$comments = function() {
        return this._comments || (this._comments = this.$.next().find("td:eq(1) a:last"));
    };
    this.$posted = function() {
        return this._posted || (this._posted = this.$.next().find("td:eq(1)").contents()[3]);
    };

    this.id = parseInt((this.$.next().find("td:eq(1) span").attr("id") + "").slice(6), 10);
    this.rank = parseInt(this.$rank().text().replace(/[^0-9]/g,""), 10);
    this.votes = parseInt(this.$votes().text(), 10);
    this.comments = (parseInt(this.$comments().text(), 10) || 0);
    this.posted = this.$posted().textContent;
    // Not grabbed yet: postedBy, article Name, URL
}
