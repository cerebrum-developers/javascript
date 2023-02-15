'use strict';
const mongoose = require('mongoose');
const commonUtils = require('../../../../helper/commonUtils');
const { resStatusCode } = require('../../../../helper/constant');
const ObjectID = require('mongodb').ObjectID;
const ApplicationComments = mongoose.model('Applicationcomment');
const Activity = mongoose.model('Activities');
const mainActivityModel = mongoose.model('mainActivities');
let subActivity = require('../../../../helper/subActivity');
const subActivities = mongoose.model('subActivities');
const _ = require('lodash');
const AddLikeToComment = function (req, res) {
  
  ApplicationComments.findById({ _id: req.params.commentId }, function (error, commentObj) {
    if (!error) {
      if (commentObj) {
        let queryMatch = {};
        let messageChange = '';
        let logOfLikeAddOnly = false;
        let index = commentObj.likeUsers.indexOf(req.userInfo._id);
        if (index > -1) {
          queryMatch = { $pull: { likeUsers: req.userInfo._id } };
          logOfLikeAddOnly = false;
          messageChange = 'removed';
        } else {
          queryMatch = { $push: { likeUsers: req.userInfo._id } };
          logOfLikeAddOnly = true;
          messageChange = 'added';
        }
        ApplicationComments.findOneAndUpdate({ _id: req.params.commentId }, queryMatch, { new: true }, function (err, obj) {
          if (!err) {
            mainActivityModel.findOne(commentObj.activity_id, function (errAct, objActivity) {
              if (!errAct) {
                if (logOfLikeAddOnly) {
                  // let activityText = activityTemplate.addLikeToComment();
                  // let record_id = null;
                  // if (req.query.record_id && mongoose.Types.ObjectId.isValid(req.query.record_id)) {
                  //   record_id = req.query.record_id;
                  // }
                  // let logActivityPromise = logActivity.logActivity(req.userInfo._id, objActivity.organization_id, objActivity.workspace_id, null, record_id, null, activityText, 'activity', appConfig.ACTIVITY_SUB_TYPE.commentHearted, new Array());
                  // logActivityPromise.then(function (result, err) {
                    // if (result) {
                      const response = commonUtils.genSuccessResponse(resStatusCode.created, 'Like ' + messageChange + ' successfully', obj);
                      return res.status(response.statusCode).json(response);
                    // } else {
                    //   const response = commonUtils.genErrorResponse(resStatusCode.error.internalServerError, req.t('ERROR'), err);
                    //   return res.status(response.statusCode).json(response);
                    // }
                 // });
                } else {
                  const response = commonUtils.genSuccessResponse(resStatusCode.success, 'Like ' + messageChange + ' successfully', obj);
                  return res.status(response.statusCode).json(response);
                }
              }
            });
          } else {
            const response = commonUtils.genErrorResponse(resStatusCode.error.internalServerError, req.t('ERROR'), err);
            return res.status(response.statusCode).json(response);
          }
        });
      }
    }
  });
};

module.exports = AddLikeToComment;
