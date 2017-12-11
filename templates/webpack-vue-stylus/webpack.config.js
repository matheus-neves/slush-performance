const
  PROD     = (process.env.NODE_ENV == 'prod' ? true : false),

  webpack  = require('webpack'),
  path     = require('path'),
  nib      = require('nib'),
  jeet     = require('jeet'),
  rupture  = require('rupture'),
  kswiss   = require('kouto-swiss'),

  UglifyJSPlugin            = require('uglifyjs-webpack-plugin'),
  HtmlWebpackPlugin         = require('html-webpack-plugin'),
  ExtractTextPlugin         = require('extract-text-webpack-plugin'),
  CompressionPlugin         = require('compression-webpack-plugin'),
  WebpackSpritesmith        = require('webpack-spritesmith'),
  SVGSpritemapPlugin        = require('svg-spritemap-webpack-plugin'),
  StyleExtHtmlWebpackPlugin = require('style-ext-html-webpack-plugin'),
  PurifyCSSPlugin           = require('purifycss-webpack'),
  HtmlPluginRemove          = require('html-webpack-plugin-remove'),

  paths = {
    html        : path.resolve(__dirname, 'dev', 'index.html'),
    js          : path.resolve(__dirname, 'dev', 'assets/js/main.js'),
    styl        : path.resolve(__dirname, 'dev', 'assets/stylus/style.styl'),
    priorityCSS : path.resolve(__dirname, 'dev', 'assets/stylus/priority.styl'),
    bundleCSS   : 'assets/css/',
    bundleJS    : 'assets/js/'
  },

  extractStyle    = new ExtractTextPlugin({
    filename: paths.bundleCSS + 'style.css'
  }),
  extractPriority = new ExtractTextPlugin({
    filename: paths.bundleCSS + 'priority.css'
  });


const config = {

  context: path.resolve(__dirname, 'dev'),

  devtool: (!PROD ? 'source-map' : ''),

  entry: [

    paths.js,
    paths.styl,
    paths.priorityCSS

  ],

  output: {
    path: path.resolve(__dirname, 'build'),
    filename: paths.bundleJS + 'main.js'
  },

  devServer: {
    contentBase: path.resolve(__dirname, 'dev'),
    publicPath: '/',
    hot: false,
    port: 3000,
    historyApiFallback: true
  },
  performance: {
    hints: false
  },
  plugins: [

    new SVGSpritemapPlugin({
      src: path.resolve(__dirname, 'dev', 'assets/images/svg/*.svg'),
      filename: 'assets/images/svg-symbols.svg',
      prefix: '',
      svgo: true,
      chunk: 'svg-symbols'
    }),

    new WebpackSpritesmith({
      src: {
        cwd: path.resolve(__dirname, 'dev', 'assets/images/sprite/'),
        glob: '*'
      },
      target: {
        image: path.resolve(__dirname, 'dev', 'assets/images/sprite.png'),
        css: path.resolve(__dirname, 'dev', 'assets/stylus/sprite.styl')
      },
      apiOptions: {
        cssImageRef: '~sprite.png'
      }
    }),

    extractPriority,
    extractStyle,

    new HtmlWebpackPlugin({
      template: paths.html,
      filename: 'index.html',
      minify: PROD ? { collapseWhitespace: true, conservativeCollapse: true, removeComments: true } : {}
    })
  ],

  module: {

    rules: [

      {
        test: /\.(html)$/,
        loader: 'html-loader'
      },

      {
        test: /\.js$/,
        loader: 'babel-loader',
        query: {
          presets: [
            ['es2015', {
              /***
                (modules: false)
                Faz com que o babel carregue os modulos de maneira estática,
                com isso o uglify js é capaz de efetuar o tree shaking e o dead code elimination
              ***/
              modules: false
            }]
          ]
        },
        exclude: ['/node_modules/'],
      },

      {
        test: /\.vue$/,
        loader: 'vue-loader'
      },

      {
        test: /style\.styl$/,
        loader: extractStyle.extract({
          use: [
            {
              loader: 'css-loader',
              options: { minimize: (PROD ? true : false) }
            },
            {
              loader: 'stylus-loader',
              options: {
                use: [jeet(), rupture(), kswiss(), nib()],
              }
            },
          ],
          fallback: 'style-loader',
          publicPath: '../../'
        }),

      },

      {
        test: /priority\.styl$/,
        loader: extractPriority.extract({
          use: [
            {
              loader: 'css-loader',
              options: { minimize: (PROD ? true : false) }
            },
            {
              loader: 'stylus-loader',
              options: {
                use: [jeet(), rupture(), kswiss(), nib()]
              }
            },
          ],
          fallback: 'style-loader',
          publicPath: '../../'
        }),
      },


      (!PROD ?

      {
        test: /\.(eot|svg|ttf|woff|woff2|png|jpe?g)$/i,
        use: [
          {
            loader: 'url-loader',
            query: {
              limit: 500,
              name: '[path][name].[ext]'
            }
          }
        ]
      }

      :

      {
        test: /\.(eot|svg|ttf|woff|woff2|png|jpe?g)$/i,

        use: [
          {
            loader: 'url-loader',
            query: {
              limit: 500,
              name: '[path][name].[ext]'
            }
          },

          {
            loader: 'image-webpack-loader',
            query: {
              mozjpeg: {
                quality: 80
              }
            }
          }
        ]

      })

    ],
  },

  resolve: {
    extensions: [".js", ".json", ".styl", ".vue"],
    modules: ["node_modules", "images"],
    alias: {
      'vue': 'vue/dist/vue.common.js',
      'vue$': 'vue/dist/vue.esm.js'
    }
  }

};

if(PROD) {

  config.plugins.push(

    new StyleExtHtmlWebpackPlugin({
      file: paths.bundleCSS + 'priority.css',
      position: 'head-top'
    }),

    new PurifyCSSPlugin({paths: [paths.html],minimize: true}),
    new UglifyJSPlugin(),

    new HtmlPluginRemove(/<link href="assets\/css\/priority\.css" rel="stylesheet">/),
    new HtmlPluginRemove(/<link href="assets\/css\/style\.css" rel="stylesheet">/)
  );
}


module.exports = config;
