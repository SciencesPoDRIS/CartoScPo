#!/bin/sh 

/cartoscpo/node_modules/gulp/bin/gulp.js js:app

chmod -R 550 /cartoscpo/app && chown -R nginx:nginx /cartoscpo/app

exec "$@"
