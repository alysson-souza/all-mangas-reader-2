const webpack = require("webpack")
const ExtReloader = require("webpack-ext-reloader")
const { CleanWebpackPlugin } = require("clean-webpack-plugin")
const WebpackShellPluginNext = require("webpack-shell-plugin-next")
const path = require("path")
const CopyWebpackPlugin = require("copy-webpack-plugin")
const TerserPlugin = require("terser-webpack-plugin")
const VueLoaderPlugin = require("vue-loader/lib/plugin")
const CircularDependencyPlugin = require("circular-dependency-plugin")
const VuetifyLoaderPlugin = require("vuetify-loader/lib/plugin")
const ejs = require("ejs")

const AMR_BROWSER = process.env.AMR_BROWSER
const isFirefox = AMR_BROWSER === "firefox"
const isChrome = AMR_BROWSER === "chrome"

const config = {
    /* In Webpack 4, defaults devtool outputs an eval() for speeding compile
  but this obviously fail in chrome extension due to CSP */
    devtool: "cheap-module-source-map",
    context: __dirname + "/src",
    mode: "development",
    entry: {
        "background-worker": "./background-worker.ts",
        "reader/init-reading": "./reader/init-reading.js",
        "pages/popup/popup": "./pages/popup/popup.js",
        "pages/lab/lab": "./pages/lab/lab.js",
        "pages/options/options": "./pages/options/options.js",
        "pages/bookmarks/bookmarks": "./pages/bookmarks/bookmarks.js",
        "pages/importexport/importexport": "./pages/importexport/importexport.js",
        "backup/index": "./backup/amr-backup.js"
        // "mirrors/register_implementations": "./mirrors/register_implementations.js"
    },
    output: {
        path: __dirname + "/dist",
        filename: "[name].js"
    },
    resolve: {
        alias: {
            vue$: "vue/dist/vue.runtime.esm.js"
        },
        extensions: ["*", ".ts", ".js", ".vue", ".json"],
        fallback: {
            crypto: require.resolve("crypto-browserify"),
            stream: require.resolve("stream-browserify"),
            buffer: false
        }
    },
    module: {
        rules: [
            {
                test: /\.ts$/,
                exclude: /node_modules|vue\/src/,
                loader: "ts-loader",
                options: {
                    appendTsSuffixTo: [/\.vue$/]
                }
            },
            {
                test: /\.vue$/,
                loader: "vue-loader",
                options: {
                    esModule: true
                }
            },
            {
                test: /\.css$/,
                use: ["style-loader", "css-loader"]
            },
            {
                test: /\.s[ac]ss$/i,
                use: ["style-loader", "css-loader", "sass-loader"]
            },
            {
                test: /\.(png|jp(e*)g|gif|svg|ico)$/,
                type: "asset",
                generator: {
                    filename: "img/[name].[ext]"
                }
            }
        ]
    },
    plugins: [
        new VueLoaderPlugin(),
        new VuetifyLoaderPlugin(),
        new ExtReloader({
            reloadPage: true, // Force the reload of the page also
            entries: {
                // The entries used for the content/background scripts or extension pages
                background: "background-worker",
                extensionPage: "popup"
            }
        }),
        new CopyWebpackPlugin({
            patterns: [
                { from: "icons", to: "icons", globOptions: { ignore: ["icon.xcf"] } },
                { from: "pages/popup/popup.html", to: "pages/popup/popup.html", transform: transformHtml },
                { from: "pages/lab/lab.html", to: "pages/lab/lab.html", transform: transformHtml },
                { from: "pages/options/options.html", to: "pages/options/options.html", transform: transformHtml },
                {
                    from: "pages/bookmarks/bookmarks.html",
                    to: "pages/bookmarks/bookmarks.html",
                    transform: transformHtml
                },
                {
                    from: "pages/importexport/importexport.html",
                    to: "pages/importexport/importexport.html",
                    transform: transformHtml
                },
                {
                    from: "manifest.json",
                    to: "manifest.json",
                    transform(content) {
                        // This is not working properly on firefox
                        // adding a http domain to load script fails firefox csp rules and
                        // prevent the extension from working (csp are ignored and failed)
                        if (config.mode !== "development") {
                            return content
                        }
                        return content
                        // const ext = JSON.parse(content)
                        // // Add dev env tools
                        // const extra = " 'unsafe-eval' http://localhost:8098 'unsafe-inline'"
                        // const [scriptSource, ...rest] = ext.content_security_policy.extension_pages.split(";")
                        // ext.content_security_policy.extension_pages = `${scriptSource} ${extra}; ${rest.join(";")}`
                        //
                        // return JSON.stringify(ext, null, 2)
                    }
                },
                { from: "reader/*.css", to: "." },
                { from: "_locales/**/*", to: "." },
                { from: "backup/amr-backup.html", to: "backup/index.html" },
                { from: "../node_modules/jquery/dist/jquery.min.js", to: "lib/jquery.min.js" }
            ]
        }),
        // new WebpackShellPluginNext({
        //     onBuildStart: {
        //         //scripts: ['node ./src/mirrors/update-ws.js && echo "Mirrors Rebuilt"'],
        //         scripts: ["node ./scripts/optimize-mirrors-icons.js", "node ./scripts/compile-mirrors.js"],
        //         blocking: true
        //     },
        //     onBuildEnd: {
        //         scripts: ["node scripts/remove-evals.js"]
        //     }
        // }),
        new CircularDependencyPlugin({
            // exclude detection of files based on a RegExp
            exclude: /a\.js|node_modules/,
            // include specific files based on a RegExp
            include: /src/,
            // add errors to webpack instead of warnings
            failOnError: false,
            // allow import cycles that include an asyncronous import,
            // e.g. via import(/* webpackMode: "weak" */ './file.js')
            allowAsyncCycles: false,
            // set the current working directory for displaying module paths
            cwd: process.cwd()
        })
    ]
}

if (process.env.NODE_ENV === "production") {
    config.devtool = "source-map"
    config.mode = "production"

    config.plugins = (config.plugins || []).concat([
        new CleanWebpackPlugin(),
        new webpack.DefinePlugin({
            "process.env": {
                NODE_ENV: '"production"'
            }
        }),
        new webpack.LoaderOptionsPlugin({
            minimize: true
        })
    ])

    config.optimization = {
        minimize: true,
        minimizer: [new TerserPlugin()]
    }
} else {
    // if (process.env["--watch"]) {
    //     config.plugins = (config.plugins || []).concat([
    //         new webpack.HotModuleReplacementPlugin(),
    //         new ExtensionReloader({
    //             entries: {
    //                 background: "background-worker",
    //                 extensionPage: ["pages/options/options", "pages/popup/popup"]
    //             }
    //         })
    //     ])
    // }

    // Add manifest update after
    if (AMR_BROWSER) {
        config.plugins.push(
            new WebpackShellPluginNext({
                onAfterDone: { scripts: [`node scripts/update-manifest.js -${AMR_BROWSER}`] }
            })
        )
    }
}

function transformHtml(content) {
    return ejs.render(content.toString(), {
        ...process.env
    })
}

module.exports = config
