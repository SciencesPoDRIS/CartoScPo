#!/bin/sh 

/cartoscpo/node_modules/gulp/bin/gulp.js js:app

chgrp -R nginx /cartoscpo/app
chmod -R 750 /cartoscpo/app

exec "$@"
