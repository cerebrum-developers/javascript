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
  let post_id = args.activity.post_id;
  let dataWillDelete = undefined;
  let deleteCommentsFn = (callback) => {
    let query = {
      'activity_id': { $in: activity_id }
    };
    ApplicationComments.deleteMany(query, callback);
  };

  let deleteSubActivityFn = (callback) => {
    subActivities.deleteMany({
      '$or': [
        { 'main_activity_id': { $in: activity_id } },
        { 'activity_id': { $in: activity_id } },
      ],
    }, callback);
  };
  let deleteActivityFn = (callback) => {
    let query = {
      'activity_id': activity_id
    };
    Activity.deleteMany(query, callback);
  };
  // let deleteShareActivityFn = (callback) => {
  //   mainActivities.deleteMany(
  //     {
  //       'activity_id': ObjectId(activity_id)
  //     }, callback);
  // };

  let deleteShareActivityLogFn = (callback) => {
    ShareActivity.deleteMany({
      'activity_id': ObjectId(activity_id),
    }, callback);
  };
  let deleteSharePostActivityLogFn = (callback) => {
    ShareActivity.deleteMany({
      'activity_id': ObjectId(post_id),
      'user_id': args.userInfo._id
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
     // deleteShareActivityFn,
      deleteShareActivityLogFn,
      deleteFn,
      deleteSharePostActivityLogFn
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