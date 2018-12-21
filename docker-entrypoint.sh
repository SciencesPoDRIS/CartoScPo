#!/bin/sh 

chmod -R 755 /cartoscpo/app/img/logos 
chown -R node /cartoscpo/app/img/logos

exec "$@"
