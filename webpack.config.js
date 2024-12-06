const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = {
    mode: 'production',
    entry: './main.js',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'main.js'
    },
    target: 'electron-main',
    node: {
        __dirname: false,
        __filename: false
    },
    plugins: [
        new CopyPlugin({
            patterns: [
                { from: 'views', to: 'views' },
                { from: 'public', to: 'public' },
                { from: 'routes', to: 'routes' },
                { 
                    from: 'package.json', 
                    to: 'package.json',
                    transform(content) {
                        const jsonContent = JSON.parse(content);
                        delete jsonContent.devDependencies;
                        delete jsonContent.scripts;
                        return JSON.stringify(jsonContent, null, 2);
                    }
                }
            ]
        })
    ],
    module: {
        rules: [
            {
                test: /\.node$/,
                use: 'node-loader',
            }
        ]
    }
};
