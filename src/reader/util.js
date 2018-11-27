import browser from "webextension-polyfill";
import options from "../content/options";

class Util {
    removeProtocol(url) {
        if (url.indexOf("https") == 0) return url.substring(6);
        else if (url.indexOf("http") == 0) return url.substring(5);
        return url;
    }
    debug(message) {
        if (options.debug === 1) console.log(message);
    }
    /**
     * Return the path from a url (used for chapters url)
     */
    chapPath(chap_url) {
        if (!chap_url) return chap_url;
        return chap_url.split("/").slice(3).join("/")//new URL(chap_url).pathname
    }
    matchChapUrl(chap, tomatch) {
        return (this.chapPath(chap) === this.chapPath(tomatch))
    }
}
export default (new Util)