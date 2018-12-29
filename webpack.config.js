const webpack = require('webpack');
const CleanWebpackPlugin = require('clean-webpack-plugin')
const WebpackShellPlugin = require('webpack-shell-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const ChromeExtensionReloader = require('webpack-chrome-extension-reloader')
const VueLoaderPlugin = require('vue-loader/lib/plugin')
const ejs = require('ejs');

const config = {
  devtool: '#cheap-module-source-map', /* In Webpack 4, defaults devtool outputs an eval() for speeding compil but this obvioulsy fail in chrome extension due to CSP */
  context: __dirname + '/src',
  mode: "development",
  entry: {
    'background/background': './background/background.js',
    'content/back': './content/back.js',
    'reader/init-reading': './reader/init-reading.js',
    'pages/popup/popup': './pages/popup/popup.js', 
    'pages/lab/lab': './pages/lab/lab.js',
    'pages/options/options': './pages/options/options.js',
    'pages/bookmarks/bookmarks': './pages/bookmarks/bookmarks.js',
    'pages/importexport/importexport': './pages/importexport/importexport.js',
    'backup/index': './backup/amr-backup.js',
  },
  output: {
    path: __dirname + '/dist',
    filename: '[name].js'
  },
  resolve: {
    alias: {
      vue$: 'vue/dist/vue.runtime.esm.js',
    },
    extensions: ['*', '.js', '.vue', '.json']
  },
  module: {
    rules: [
      {
        test: /\.vue$/,
        loader: 'vue-loader'
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      },
      {
        test: /\.(png|jp(e*)g|gif|svg|ico)$/,
        loader: 'url-loader',
        options: {
          limit: 8000,
          name: 'img/[name].[ext]'
        }
      }
    ],
  },
  plugins: [
    new VueLoaderPlugin(),
    new CopyWebpackPlugin([
      {from: 'icons', to: 'icons', ignore: ['icon.xcf']},
      {from: 'background/background.html', to: 'background/background.html'},
      {from: 'pages/popup/popup.html', to: 'pages/popup/popup.html', transform: transformHtml},
      {from: 'pages/lab/lab.html', to: 'pages/lab/lab.html'},
      {from: 'pages/options/options.html', to: 'pages/options/options.html'},
      {from: 'pages/bookmarks/bookmarks.html', to: 'pages/bookmarks/bookmarks.html'},
      {from: 'pages/importexport/importexport.html', to: 'pages/importexport/importexport.html'},
      {
        from: 'manifest.json',
        to: 'manifest.json',
        transform(content) {
          if (config.mode !== 'development') {
            return content;
          }
          const ext = JSON.parse(content);
          // Add dev env tools
          const extra= " 'unsafe-eval' http://localhost:8098/ ";
          const [scriptSource, ...rest] = ext.content_security_policy.split(';');
          ext.content_security_policy = `${scriptSource} ${extra}; ${rest.join(';')}`;

          return JSON.stringify(ext, null, 2);
        },
      },
      {from: 'content/*.css', to: '.'},
      {from: 'reader/*.css', to: '.'},
      {from: '_locales/**/*', to: '.'},
      {from: 'backup/amr-backup.html', to: 'backup/index.html'},
      {from: '../node_modules/jquery/dist/jquery.min.js', to: 'lib/jquery.min.js'},
      {from: '../node_modules/jquery-modal/jquery.modal.min.js', to: 'lib/jquery.modal.min.js'}, 
      {from: '../node_modules/jquery-modal/jquery.modal.min.css', to: 'lib/jquery.modal.min.css'},
      {from: '../node_modules/jquery.scrollto/jquery.scrollTo.min.js', to: 'lib/jquery.scrollTo.min.js'}
    ]),
    new WebpackShellPlugin({
      onBuildEnd: ['node scripts/remove-evals.js']
    }),
  ]
};

if (process.env.NODE_ENV === 'production') {
  config.devtool = '';
  config.mode = "production";

  config.plugins = (config.plugins || []).concat([
    new CleanWebpackPlugin(['./dist/', './dist-zip/']),
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: '"production"'
      }
    }),
    new UglifyJsPlugin({
      sourceMap: true
    }),
    new webpack.LoaderOptionsPlugin({
      minimize: true
    })
  ]);
} else {
  if (process.env["--watch"]) {
    config.plugins = (config.plugins || []).concat([
      new webpack.HotModuleReplacementPlugin(),
      new ChromeExtensionReloader({
        entries: {
          background: 'background/background',
          options: 'pages/options/options',
          popup: 'pages/popup/popup'
        },
      }),
    ])
  }
}

function transformHtml(content) {
  return ejs.render(content.toString(), {
    ...process.env,
  });
}

module.exports = config;
