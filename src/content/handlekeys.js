import options from "./options";

class HandleKey {
    constructor() {
        this.lastpresstime;
        this.dirpress;
    } 
    /**
     * Initialize keys handling
     */
    init() {
        let self = this;
        let regiterKeys = (e) => {
            let t = self.getTarget(e);
            if (!((t.type && t.type == "text") || t.nodeName.toLowerCase() == "textarea")) {
                if (e.which == 87) { //W
                    window.scrollBy(0, -40);
                }
                if (e.which == 83) { //S
                    window.scrollBy(0, 40);
                }
                if (e.which == 107 || e.which == 187) { //+
                    self.zoomin();
                }
                if (e.which == 109 || e.which == 189) { //-
                    self.zoomout();
                }
                if (e.which == 66) { //b
                    if ($("#pChapBtn0").length > 0) {
                        window.location.href = $("#pChapBtn0").attr("href");
                    }
                }
                if (e.which == 78) { //n
                    if ($("#nChapBtn0").length > 0) {
                        window.location.href = $("#nChapBtn0").attr("href");
                    }
                }
                if (options.lrkeys == 1) {
                    let doubleTap,
                        nb,
                        curimg,
                        viss;
                    //Left key or A
                    if ((e.which == 37) || (e.which == 65)) {
                        doubleTap = false;
                        if (self.lastpresstime !== undefined && Date.now() - self.lastpresstime < 500 && self.dirpress !== undefined && self.dirpress == 1) {
                            doubleTap = true;
                        }
                        self.dirpress = 1;
                        self.lastpresstime = Date.now();
                        //Get first visible image
                        curimg = self.whichImageIsFirst(true);
                        if (curimg !== null && curimg.length > 0) {
                            //Check if top and bottom of this image are visible
                            viss = self.topbotVis(curimg);
                            //If top not visible
                            if (!viss.topVis && !doubleTap) {
                                //Move to top of current scan
                                $.scrollTo($(curimg).closest("tr")[0], 800, { queue: true });
                            } else {
                                //Calculate previous scan id
                                nb = curimg.data("order") - 1;
                                if (nb == -1) {
                                    //Current scan was first scan, move to top
                                    $.scrollTo($(document.body), 800, { queue: true });
                                } else {
                                    //Move to bottom of previous scan
                                    $(".spanForImg").each(function (index) {
                                        if ($(this).data("order") == nb) {
                                            $.scrollTo($(this).closest("tr")[0], 800, { queue: true, offset: { top: self.scrollbotoffset($(this).closest("tr")[0]) } });
                                        }
                                    });
                                }
                            }
                        }
                        e.preventDefault();
                        e.stopPropagation();
                    }
                    //Right key or D
                    if ((e.which == 39) || (e.which == 68)) {
                        doubleTap = false;
                        if (self.lastpresstime !== undefined && Date.now() - self.lastpresstime < 500 && self.dirpress !== undefined && self.dirpress == 2) {
                            doubleTap = true;
                        }
                        self.lastpresstime = Date.now();
                        self.dirpress = 2;
                        //If we are at top of the page --> move to first scan
                        if (window.pageYOffset === 0) {
                            nb = 0;
                            $(".spanForImg").each(function (index) {
                                if ($(this).data("order") == nb) {
                                    $.scrollTo($(this).closest("tr")[0], 800, { queue: true });
                                }
                            });
                        } else {
                            if (window.pageYOffset >= document.documentElement.scrollHeight - window.innerHeight) {
                                if (options.rightnext == 1) {
                                    if ($("#nChapBtn0").length > 0) {
                                        window.location.href = $("#nChapBtn0").attr("href");
                                    }
                                }
                            }
                            //Get first visible image
                            curimg = self.whichImageIsFirst(false);
                            if (curimg !== null && curimg.length > 0) {
                                //Check if top and bottom of this image are visible
                                viss = self.topbotVis(curimg[0]);
                                //If bottom not visible
                                if (!viss.bottomVis && !doubleTap) {
                                    //Move to bottom of current scan
                                    $.scrollTo($(curimg).closest("tr")[0], 800, { queue: true, offset: { top: self.scrollbotoffset($(curimg).closest("tr")[0]) } });
                                } else {
                                    //Calculate next scan id
                                    nb = curimg.data("order") + 1;
                                    if (nb >= $(".spanForImg").length) {
                                        //Current scan was last scan -> move to bottom of page
                                        $.scrollTo($(document.body), 800, { queue: true, offset: { top: document.body.offsetHeight } });
                                    } else {
                                        // Move to top of next scan
                                        $(".spanForImg").each(function (index) {
                                            if ($(this).data("order") == nb) {
                                                $.scrollTo($(this).closest("tr")[0], 800, { queue: true });
                                            }
                                        });
                                    }
                                }
                            }
                        }
                        e.preventDefault();
                        e.stopPropagation();
                        e.stopImmediatePropagation()
                    }
                }
            }
        }
        window.addEventListener('keydown', regiterKeys, true);

        //disable default websites shortcuts (fanfox)
        let stopProp = (e) => e.stopImmediatePropagation();
        if (options.lrkeys == 1) {
            window.addEventListener('keyup', stopProp, true);
            window.addEventListener('keypress', stopProp, true);
        }

        let timer = window.setInterval(function () {
            if (/loaded|complete/.test(document.readyState)) {
                window.clearInterval(timer);
                self.enableContextMenu();
            }
        }, 100);
    }

    /**
     * Zoom in (+ key)
     */
    zoomin() {
        let ancheight = document.body.offsetHeight - this.getTopPlus();
        let self = this;
        $(".imageAMR").each(function (index) {
            if ($(this).data("zoom")) {
                $(this).data("zoom", $(this).data("zoom") * 1.2);
            } else {
                $(this).data("zoom", 1.2);
                $(this).data("baseheight", $(this).height());
                $(this).data("basewidth", $(this).width());
            }
            self.setHWZoom(this);
        });
        let newheight = document.body.offsetHeight - this.getTopPlus();
        let ratioY = (newheight / ancheight);

        $.scrollTo('50%', { axis: 'x' });
        window.scrollBy(0, window.scrollY * (ratioY - 1));
    }

    /**
     * Zoom out (key -)
     */
    zoomout() {
        let ancheight = document.body.offsetHeight - this.getTopPlus();
        let self = this;
        $(".imageAMR").each(function (index) {
            if ($(this).data("zoom")) {
                $(this).data("zoom", $(this).data("zoom") * 0.833);
            } else {
                $(this).data("zoom", 0.833);
                $(this).data("baseheight", $(this).height());
                $(this).data("basewidth", $(this).width());
            }
            self.setHWZoom(this);
        });
        let newheight = document.body.offsetHeight - this.getTopPlus();
        let ratioY = (newheight / ancheight);

        $.scrollTo('50%', { axis: 'x' });
        window.scrollBy(0, window.scrollY * (ratioY - 1));
    }

    /**
     * Prevent websites from disabling context menus
     */
    enableContextMenu() {
        void (document.ondragstart = null);
        void (document.onselectstart = null);
        void (document.onclick = null);
        void (document.onmousedown = null);
        void (document.onmouseup = null);
        void (document.oncontextmenu = null);
        void (document.body.oncontextmenu = null);
        this.removeContextOn("img");
        this.removeContextOn("td");
    }

    /**
     * Remove prevent context menu from element
     * @param {*} elt 
     */
    removeContextOn(elt) {
        let elements = document.getElementsByTagName(elt);
        //for (let e in elements) {
        for (let i = 0; i < elements.length; i++) {
            let e = elements[i];
            void (e.oncontextmenu = null);
        }
    }
    /**
     * Check if top and bottom of this image are visible
     * @param {*} spanFimg 
     */
    topbotVis(spanFimg) {
        let isTopVisible = true;
        let isBotVisible = true;
        let fTop = $("img:visible", $(spanFimg)).sort(function (a, b) {
            let aTop = a.offsetTop + a.offsetParent.offsetTop;
            let bTop = b.offsetTop + b.offsetParent.offsetTop;
            //console.log("Top : a : " + aTop + " ; b : " + bTop + " --> " + ((aTop < bTop) ? -1 : ((aTop == bTop) ? 0 : 1)));
            return ((aTop < bTop) ? -1 : ((aTop == bTop) ? 0 : 1));
        }).first();
        //console.log(fTop);
        if (!this.topVisible(fTop[0])) {
            isTopVisible = false;
        }
        let lBot = $("img:visible", $(spanFimg)).sort(function (a, b) {
            let aBot = a.offsetTop + a.offsetHeight + a.offsetParent.offsetTop + a.offsetParent.offsetHeight;
            let bBot = b.offsetTop + b.offsetHeight + b.offsetParent.offsetTop + b.offsetParent.offsetHeight;
            //console.log("Bottom : a : " + aBot + " ; b : " + bBot + " --> " + ((aBot < bBot) ? -1 : ((aBot == bBot) ? 0 : 1)));
            return ((aBot < bBot) ? -1 : ((aBot == bBot) ? 0 : 1));
        }).last();
        //console.log(lBot);
        if (!this.bottomVisible(lBot[0])) {
            isBotVisible = false;
        }
        //console.log({bottomVis: isBotVisible, topVis: isTopVisible});
        return { bottomVis: isBotVisible, topVis: isTopVisible };
    }

    /**
     * Get target of event
     * @param {*} e 
     */
    getTarget(e) {
        e = e || window.event;
        return e.target || e.srcElement;
    }

    /**
     * Get first visible image
     * @param {*} needFirst 
     */
    whichImageIsFirst(needFirst) {
        let resp = null, 
            self = this;

        $(".AMRtable tr").each(function (index) {
            let isVisible = false;
            $(".spanForImg img", $(this)).each(function (index) {
                if (self.elementInViewport2(this)) {
                    isVisible = true;
                }
            });
            //console.log("isVisible : " + isVisible);
            if (isVisible) {
                if (!needFirst && resp === null) {
                    //Return the last scan of the first visible tr
                    resp = $(".spanForImg", $(this)).sort(function (a, b) {
                        let nba = $(a).data("order");
                        let nbb = $(b).data("order");
                        return ((nba < nbb) ? -1 : ((nba == nbb) ? 0 : 1));
                    }).last();
                } else if (needFirst) {
                    //return the first scan of the last visible tr
                    resp = $(".spanForImg", $(this)).sort(function (a, b) {
                        let nba = $(a).data("order");
                        let nbb = $(b).data("order");
                        return ((nba < nbb) ? -1 : ((nba == nbb) ? 0 : 1));
                    }).first();
                }
            }
        });
        return resp;
    }

    scrollbotoffset(el) {
        let height = el.offsetHeight;
        return height - window.innerHeight - 45;
    }

    /**
     * Check if element is visible actually
     * @param {*} el 
     */
    elementInViewport2(el) {
        let top = el.offsetTop;
        let left = el.offsetLeft;
        let width = el.offsetWidth;
        let height = el.offsetHeight;

        while (el.offsetParent) {
            el = el.offsetParent;
            top += el.offsetTop;
            left += el.offsetLeft;
        }
        top += el.offsetTop;
        left += el.offsetLeft;

        //console.log("top : " + top + " ; height : " + height + " ; wyo : " + window.pageYOffset + " ; wyo + wih : " + (window.pageYOffset + window.innerHeight));
        //left < (window.pageXOffset + window.innerWidth) &&
        //(left + width) > window.pageXOffset
        return (
            top < (window.pageYOffset + window.innerHeight) &&
            (top + height) > window.pageYOffset
        );
    }

    /**
     * Check if element bottom is visible
     * @param {*} el 
     */
    bottomVisible(el) {
        let top = el.offsetTop;
        let height = el.offsetHeight;

        while (el.offsetParent) {
            el = el.offsetParent;
            top += el.offsetTop;
        }
        top += el.offsetTop;
        //console.log("t+h " + (top + height) + " ; wt+wh " + window.pageYOffset + window.innerHeight );
        return (
            (top + height) <= window.pageYOffset + window.innerHeight
        );
    }
    /**
     * Check if element top is visible
     * @param {*} el 
     */
    topVisible(el) {
        let top = el.offsetTop;
        let height = el.offsetHeight;

        while (el.offsetParent) {
            el = el.offsetParent;
            top += el.offsetTop;
        }
        top += el.offsetTop;
        return (
            top >= (window.pageYOffset)
        );
    }
    /**
     * Compute zoom of images keeping ratio
     * @param {*} img 
     */
    setHWZoom(img) {
        $(img).css("height", $(img).data("zoom") * $(img).data("baseheight") + "px");
        $(img).css("width", $(img).data("zoom") * $(img).data("basewidth") + "px");
        $(img).css("max-width", "none");
    }

    getTopPlus() {
        let ret;
        if (document.body.style.borderTopWidth !== undefined && document.body.style.borderTopWidth !== "") {
            ret = parseInt(document.body.style.borderTopWidth, 10);
        } else {
            ret = 0;
        }
        return ret;
    }
}
export default (new HandleKey)