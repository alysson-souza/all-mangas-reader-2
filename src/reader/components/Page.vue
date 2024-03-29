<template>
    <tr>
        <!-- Displayed when one scan in page -->
        <Scan
            :full="true"
            :src="scans[0].src"
            :name="scans[0].name"
            :resize="resize"
            v-if="scans.length === 1"
            :bookmark="bookmark"
            :scaleUp="scaleUp" />

        <!-- Displayed when two scans in page -->
        <Scan
            :full="false"
            :src="scans[direction === 'ltr' ? 0 : 1].src"
            :name="scans[direction === 'ltr' ? 0 : 1].name"
            :resize="resize"
            class="amr-left-page"
            v-if="scans.length === 2"
            :bookmark="bookmark"
            :scaleUp="scaleUp" />
        <Scan
            :full="false"
            :src="scans[direction === 'ltr' ? 1 : 0].src"
            :name="scans[direction === 'ltr' ? 1 : 0].name"
            :resize="resize"
            class="amr-right-page"
            v-if="scans.length === 2"
            :bookmark="bookmark"
            :scaleUp="scaleUp" />
    </tr>
</template>

<script>
import Scan from "./Scan"

export default {
    data() {
        return {
            inViewport: false, // true if page or part of page is visible in viewport
            topInViewport: false, // true if top border of page is visible in viewport
            atTop: false, // true if top border is sticked on top of viewport
            bottomInViewport: false, // true if bottom border of page is visible in viewport
            atBottom: false, // true if bottom border is sticked on bottom of viewport
            visibleProportion: 0 // total height in viewport
        }
    },
    props: {
        index: Number /* Index of the page */,
        scans: Array /* List of scans to display */,
        direction: {
            /* Direction of reading */ type: String,
            default: "ltr"
        },
        resize: String /* Resize mode */,
        autoLoad: {
            /* Automatically start loading scans, if not, we need to call loadScan */ type: Boolean,
            default: true
        },
        bookmark: {
            /* Allow to bookmark scans */ type: Boolean,
            default: true
        },
        scaleUp: {
            type: Boolean,
            default: false
        },
        webtoonMode: {
            /* Removes whitespace between images */ type: Boolean,
            default: false
        }
    },
    name: "Page",
    components: { Scan },
    created() {
        /* Listen for scroll event to check if page is in viewport */
        window.addEventListener("scroll", () => {
            this.checkInViewPort()
        })
    },
    mounted() {
        // first set in viewport values
        this.$nextTick(() => this.checkInViewPort())
    },
    methods: {
        /* Check which part of the page is in viewport (in height) */
        checkInViewPort() {
            let el = this.$el
            let top = el.offsetTop
            const height = el.offsetHeight

            while (el.offsetParent) {
                el = el.offsetParent
                top += el.offsetTop
            }
            top += el.offsetTop

            this.inViewport = top < window.pageYOffset + window.innerHeight && top + height > window.pageYOffset
            this.bottomInViewport = top + height <= window.pageYOffset + window.innerHeight
            this.atBottom = Math.floor(top + height) === Math.floor(window.pageYOffset + window.innerHeight)
            this.topInViewport = top >= window.pageYOffset
            this.atTop = Math.floor(top) === Math.floor(window.pageYOffset)

            /* Compute visible proportion */
            if (this.bottomInViewport && this.topInViewport) this.visibleProportion = height
            else if (!this.bottomInViewport && this.topInViewport)
                this.visibleProportion = window.pageYOffset + window.innerHeight - top
            else if (this.bottomInViewport && !this.topInViewport)
                this.visibleProportion = top + height - window.pageYOffset
            else this.visibleProportion = window.innerHeight

            if (this.visibleProportion > window.innerHeight / 2) {
                this.$emit("become-current", { index: this.index })
            }
        }
    }
}
</script>

<style data-amr="true">
.amr-scan-container td.amr-right-page {
    text-align: left;
    padding-left: 4px;
}
td.amr-right-page .amr-scan {
    text-align: left;
}
.amr-scan-container td.amr-left-page {
    text-align: right;
    padding-right: 4px;
}
td.amr-left-page .amr-scan {
    text-align: right;
}
</style>
