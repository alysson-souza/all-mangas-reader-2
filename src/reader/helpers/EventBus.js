/**
 * Just a Vue instance used as event bus
 * Used for :
 *  - This way, we can open Bookmarks Popup from other components without including it in template
 *  - Detect and propagate thin scan (height > 3 * width)
 *  - Go to next / previous chapter
 *  - Display a temporary message
 *  - Notify chapter finished loading
 */
import Vue from "vue"

export default new Vue()
