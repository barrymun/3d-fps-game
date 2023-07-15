const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

module.exports = (env, argv) => {
    return {
        mode: argv.mode === 'development' ? 'development' : 'production',
        devtool: argv.mode === 'development' ? 'cheap-module-source-map' : 'source-map',
        entry: {
            main: [
                './src/index.ts',
                './src/utils.ts',
                './src/game-controller.ts',
                './src/weapon-controller.ts',
                './src/movement-controller.ts',
                './src/constants.ts',
            ],
        },
        module: {
            rules: [
                {
                    test: /\.tsx?$/,
                    use: 'ts-loader',
                    exclude: /node_modules/,
                },
                {
                    test: /\.(gltf)$/,
                    use: [
                        {
                            loader: 'file-loader',
                            options: {
                                name: '[name].[ext]',
                                outputPath: 'assets/',
                                publicPath: 'assets/',
                                context: 'src/',
                            },
                        },
                    ],
                },
                {
                    test: /\.(glb)$/,
                    use: [
                        {
                            loader: 'file-loader',
                            options: {
                                name: '[name].[ext]',
                                outputPath: 'assets/',
                                publicPath: 'assets/',
                                context: 'src/',
                            },
                        },
                    ],
                },
                {
                    test: /\.bin$/,
                    use: {
                        loader: 'file-loader',
                        options: {
                            name: '[name].[ext]',
                            outputPath: 'assets/',
                            publicPath: 'assets/',
                            context: 'src/',
                        },
                    },
                },
                {
                    test: /\.jpg$/,
                    use: {
                        loader: 'file-loader',
                        options: {
                            name: '[name].[ext]',
                            outputPath: 'assets/',
                            publicPath: 'assets/',
                            context: 'src/',
                        },
                    },
                },
            ],
        },
        resolve: {
            extensions: ['.ts', '.js'],
        },
        output: {
            filename: 'bundle.js',
            path: path.resolve(__dirname, 'dist'),
        },
        devtool: 'source-map',
        plugins: [
            new CopyPlugin({
                patterns: [{ from: 'src/index.html', to: 'index.html' }],
            }),
        ],
    };
};
