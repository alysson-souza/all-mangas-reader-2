import browser from "webextension-polyfill";
import statsEvents from './stats-events';

/**
 * This file defines a function called on extension init which initialize version and check informations
 */

/**
 * Returns the week number for this date.  dowOffset is the day of week the week
 * "starts" on for your locale - it can be from 0 to 6. If dowOffset is 1 (Monday),
 * the week returned is the ISO 8601 week number.
 * @param int dowOffset
 * @return int
 */
Date.prototype.getWeek = function (dowOffset) {
    /*getWeek() was developed by Nick Baicoianu at MeanFreePath: http://www.meanfreepath.com */

    dowOffset = typeof (dowOffset) == 'int' ? dowOffset : 0; //default dowOffset to zero
    var newYear = new Date(this.getFullYear(), 0, 1);
    var day = newYear.getDay() - dowOffset; //the day of week the year begins on
    day = (day >= 0 ? day : day + 7);
    var daynum = Math.floor((this.getTime() - newYear.getTime() -
        (this.getTimezoneOffset() - newYear.getTimezoneOffset()) * 60000) / 86400000) + 1;
    var weeknum;
    //if the year starts before the middle of a week
    if (day < 4) {
        weeknum = Math.floor((daynum + day - 1) / 7) + 1;
        if (weeknum > 52) {
            nYear = new Date(this.getFullYear() + 1, 0, 1);
            nday = nYear.getDay() - dowOffset;
            nday = nday >= 0 ? nday : nday + 7;
            /*if the next year starts before the middle of
            the week, it is week #1 of that year*/
            weeknum = nday < 4 ? 1 : 53;
        }
    } else {
        weeknum = Math.floor((daynum + day - 1) / 7);
    }
    return weeknum;
}

const getDailyStr = function () {
    var d = new Date();
    var m = d.getMonth() + 1;
    var mstr = "" + m;
    if (m < 10) {
        mstr = "0" + mstr;
    }
    var j = d.getDate();
    var jstr = "" + j;
    if (j < 10) {
        jstr = "0" + jstr;
    }
    return d.getFullYear() + "/" + mstr + "/" + jstr;
}
const getWeeklyStr = function () {
    var d = new Date();
    var w = d.getWeek();
    var wstr = "" + w;
    if (w < 10) {
        wstr = "0" + wstr;
    }
    return d.getFullYear() + "/" + wstr;
}
const getMonthlyStr = function () {
    var d = new Date();
    var m = d.getMonth() + 1;
    var mstr = "" + m;
    if (m < 10) {
        mstr = "0" + mstr;
    }
    return d.getFullYear() + "/" + mstr;
}

/**
 * Initialize AMR version and track version changes
 */
export default function () {
    let manifest = browser.runtime.getManifest();

    let ancVersion = localStorage["version"];
    let curVersion = manifest.version;

    let url = manifest.homepage_url;
    let beta = false;
    //TODO
    /*if (url && url.indexOf("gitlab.com") > 0) {
        beta = true;
    }*/

    if (!ancVersion || curVersion !== ancVersion) {
        localStorage.version = curVersion;
        if (beta) {
            statsEvents.trackBeta(curVersion);
        } else {
            statsEvents.trackInstall(curVersion);
        }
    }
    if (beta) {
        browser.browserAction.setTitle({
            title: "All Mangas Reader Beta Channel " + curVersion
        });
    } else {
        browser.browserAction.setTitle({
            title: "All Mangas Reader " + curVersion
        });
    }
    let dailyStr = getDailyStr();
    let weeklyStr = getWeeklyStr();
    let monthlyStr = getMonthlyStr();
    if (!localStorage["dailyStr"] || localStorage["dailyStr"] != dailyStr) {
        statsEvents.trackActive('Day', dailyStr);
        localStorage["dailyStr"] = dailyStr;
    }
    if (!localStorage["weeklyStr"] || localStorage["weeklyStr"] != weeklyStr) {
        statsEvents.trackActive('Week', weeklyStr);
        localStorage["weeklyStr"] = weeklyStr;
    }
    if (!localStorage["monthlyStr"] || localStorage["monthlyStr"] != monthlyStr) {
        statsEvents.trackActive('Month', monthlyStr);
        localStorage["monthlyStr"] = monthlyStr;
    }
}