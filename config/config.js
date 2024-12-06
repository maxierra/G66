const path = require('path');
const { app } = require('electron');
const isDev = process.env.NODE_ENV !== 'production';
const isElectron = process.env.ELECTRON_APP === 'true';

function getAppPaths() {
    let paths = {
        database: '',
        temp: require('os').tmpdir(),
        userData: ''
    };

    if (isDev) {
        paths.database = path.join(__dirname, '..', 'database');
        paths.userData = path.join(__dirname, '..', 'userData');
    } else if (isElectron) {
        const userDataPath = app.getPath('userData');
        paths.database = path.join(userDataPath, 'database');
        paths.userData = userDataPath;
    } else {
        paths.database = path.join(process.cwd(), 'database');
        paths.userData = path.join(process.cwd(), 'userData');
    }

    return paths;
}

module.exports = {
    isDev,
    isElectron,
    getPaths: getAppPaths
};
