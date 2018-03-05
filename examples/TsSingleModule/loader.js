SystemJS.config({
    packages: {
        // meaning [baseURL]/local/package when no other rules are present
        // path is normalized using map and paths configuration
        '/': {
            main: 'index.js',
            format: 'cjs',
            defaultExtension: 'js'
        }
    }

});
SystemJS.import('index.js');