let mongoose = require('mongoose');
let ObjectId = require('mongodb').ObjectID;
const Activity = mongoose.model('Activities');
let ApplicationComments = mongoose.model('Applicationcomment');
const subActivities = mongoose.model('subActivities');
const mainActivities = mongoose.model('mainActivities');
let async = require('async');

const ShareActivity = mongoose.model('ShareActivity');
let deletePostFn = (args, res, callback) => {
  let activity_id = args.params.id;
  let dataWillDelete = undefined;
  let deleteCommentsFn = (callback) => {
    let query = {
      'activity_id': { $in: args.activityIds }
    };
    ApplicationComments.deleteMany(query, callback);
  };

  let deleteSubActivityFn = (callback) => {
    subActivities.deleteMany({
      '$or': [
        { 'main_activity_id': { $in: args.activityIds } },
        { 'activity_id': { $in: args.activityIds } },
      ],
    }, callback);
  };
  let deleteActivityFn = (callback) => {
    let query = {
      '$or': [
        { 'post_id': { $in: args.activityIds } },
        { 'activity_id': { $in: args.activityIds } },
      ],
    };
    Activity.deleteMany(query, callback);

  };
  let deleteShareActivityFn = (callback) => {
    mainActivities.deleteMany({
      '$or': [
        { 'post_id': { $in: args.activityIds } },
        { 'activity_id': { $in: args.activityIds } },
      ],
    }, callback);
  };
  let deleteShareActivityLogFn = (callback) => {
    ShareActivity.deleteMany({
      'activity_id': ObjectId(activity_id),
    }, callback);
  };
  let deleteFn = (callback) => {
    mainActivities.deleteOne({
      '_id': ObjectId(activity_id),
    }, callback);
  };
  let parallelFn = (callback) => {
    async.parallel([
      deleteCommentsFn,
      deleteSubActivityFn,
      deleteActivityFn,
      deleteShareActivityFn,
      deleteShareActivityLogFn,
      deleteFn
    ], callback);
  };

  let collectDataBeforeDelete = (callback) => {
    let query = args.query || {
      '_id': ObjectId(activity_id)
    };
    let callbackFn = (err, response) => {
      if (err) {
        callback(err);
        return;
      }
      dataWillDelete = response;
      callback(null);
    };
    mainActivities.findOne(query, callbackFn);
  };

  async.waterfall([
    collectDataBeforeDelete,
    parallelFn
  ], callback);
};

module.exports = deletePostFn;