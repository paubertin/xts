const path = require('path');
const { CheckerPlugin } = require('awesome-typescript-loader')
const CopyPlugin = require('copy-webpack-plugin');

const WriteFilePlugin = require('write-file-webpack-plugin');

let exclude = [
    path.join(__dirname, 'node_modules/tstl'),
];

const CONFIG = {
    ORIGINAL: (sourceMap) => ({
        module: {
            rules: [
                {
                    test: /\.tsx?$/,
                    loader: "awesome-typescript-loader",
                    exclude
                },
                {
                    enforce: 'pre',
                    test: /\.js$/,
                    loader: 'source-map-loader',
                    exclude
                },
                {
                    test: /\.(glsl|vert|frag)$/,
                    use: 'ts-shader-loader'
                },
                {
                    test: /\.(png|jpg|gif)$/i,
                    use: [
                        {
                            loader: 'url-loader',
                            options: {
                                limit: 8192
                            }
                        }
                    ]
                }
            ],
        },
        plugins: [
            new CheckerPlugin(),
            // new WriteFilePlugin(),
            new CopyPlugin([
                {
                    from: path.join(__dirname, 'src/assets'),
                    to: 'assets',
                },
            ]),
        ],
        // resolve: {
        //   extensions: [ '.tsx', '.ts', '.js' ]
        // },
        output: {
            publicPath: "/public/",
            filename: 'bundle.js',
            path: path.join(__dirname, 'dist'),
            // Bundle absolute resource paths in the source-map,
            // so VSCode can match the source file.
            devtoolModuleFilenameTemplate: 'file:///[absolute-resource-path]'
        }
    }),
    TEST: {
        resolve: {
            root: [  // older webpack config
                __dirname,  // source at ./js-src/
            ],
            devtool: "source-map", // many options, but this one works best for me: https://webpack.js.org/configuration/devtool/
            output: {
                filename: 'bundle.js',
                path: path.join(__dirname, '/dist'),  // compile to ./static/js-build
                devtoolModuleFilenameTemplate: 'file:///[absolute-resource-path]'  // map to source with absolute file path not webpack:// protocol
            }
        },
    }
};

module.exports = CONFIG.ORIGINAL('cheap-source-map');