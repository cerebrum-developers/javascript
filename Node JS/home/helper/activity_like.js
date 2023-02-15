'use strict';
const mongoose = require('mongoose');
const commonUtils = require('../../../../helper/commonUtils');
const { resStatusCode, activity_type } = require('../../../../helper/constant');
const ObjectID = require('mongodb').ObjectID;
let Activity = require('../../../../helper/logActivity');
let activityTemplate = require('../../../../helper/activity');
const mainActivityModel = mongoose.model('mainActivities');
let subActivity = require('../../../../helper/subActivity');
const subActivities = mongoose.model('subActivities');
const ActivityModel = mongoose.model('Activities');

const _ = require('lodash');
let Likes = mongoose.model('Likes');

let createLikeOnActivity = function (req, res) {
  if (req.params.activity_id) {
    mainActivityModel.findById({ _id: req.params.activity_id }, function (err, activity) {

      Likes.findOneAndRemove({ 'activity_id': req.params.activity_id, 'user_id': req.userInfo._id }, function (err, like) {
        if (err) {
          const response = commonUtils.genErrorResponse(resStatusCode.error.internalServerError, req.t('ERROR'), err);
          return res.status(response.statusCode).json(response);
        }
        if (!like) {
          var likes = new Likes();
          likes.activity_id = req.params.activity_id ? req.params.activity_id : null;
          likes.user_id = req.userInfo._id;
          likes.save(function (err) {
            if (!err) {
              const activityText = activityTemplate.addLike(req.userInfo.firstName + ' ' + req.userInfo.lastName);
              const subActivityPromise = subActivity.logSubActivity(activity._id, req.userInfo._id, activity.organization_id,
                activity.workspace_id, null, activity.record_id, null, activityText, 'activity',
                activity_type.likedPost, "", "", '', "", req.params.activity_id, "");
              subActivityPromise.then(function (result) {
                let notificationText = activityTemplate.addLike(req.userInfo.firstName + ' ' + req.userInfo.lastName);
                const notificationActivityPromise = Activity.logActivity(req.userInfo._id, activity.organization_id,
                  activity.workspace_id, null,
                  activity.record_id, null, notificationText, 'notification', activity_type.likedPost, "", "", '', "", req.params.activity_id, "");
                notificationActivityPromise.then(async (result) => {
                  const response = commonUtils.genSuccessResponse(resStatusCode.created, 'Like added on activity', likes);
                  return res.status(response.statusCode).json(response);
                })
              });
            } else {
              const response = commonUtils.genErrorResponse(resStatusCode.error.internalServerError, req.t('ERROR'), err);
              return res.status(response.statusCode).json(response);
            }
          });
        } else {
          ActivityModel.deleteMany({ 'activity_id': req.params.activity_id, 'user_id': req.userInfo._id, "activity_sub_type": "LIKED_POST", }, function (err, like) {
            subActivities.deleteMany({ 'main_activity_id': req.params.activity_id, 'user_id': req.userInfo._id, "activity_sub_type": "LIKED_POST", }, function (err, like) {
              const response = commonUtils.genSuccessResponse(resStatusCode.success, 'Like Removed successfully');
              return res.status(response.statusCode).json(response);
            });
          });
        }
      });
    })

  }
};
module.exports = createLikeOnActivity;
