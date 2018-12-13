const { omit } = require('./utils');
const { mongo } = require('config');
const mongoose = require('mongoose');
const debug = require('debug')('mongo');
mongoose.Promise = global.Promise;

if (!mongoose.connection.db) {
  mongoose
    .connect(
      mongo.uri,
      {
        promiseLibrary: global.Promise,
        useMongoClient: true
      }
    )
    .catch(() => debug('unable to connect to mongo', mongo.uri));
} else {
  mongoose.models = {};
  mongoose.connection.models = {};
  mongoose.connection.removeAllListeners();
}

exports.connection = mongoose.connection;

// re-exports models
exports.Center = require('./center');
exports.Modification = require('./modification');
exports.User = require('./user');

exports.sanitizeCenter = center =>
  omit(center, '_id', '___v', 'id', 'createdAt', 'updatedAt');
