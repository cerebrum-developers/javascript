'use strict';
const mongoose = require('mongoose');
const commonUtils = require('../../../../helper/commonUtils');
const { resStatusCode, activity_type } = require('../../../../helper/constant');
const ObjectID = require('mongodb').ObjectID;
const Activity = mongoose.model('Activities');
const OrganizationRole = mongoose.model('OrganizationRole');
const User = mongoose.model('User');
const _ = require('lodash');
const organizationUtils = require("../../organization/organizationUtils");
const userUtils = require("../../user/userUtils");;
const ApplicationComments = mongoose.model('Applicationcomment');
const marketUtils = require("../../market-workspace/market-workspaceUtils")
const workspaceUtils = require("../../workspace/workspaceUtils");
const mainActivities = mongoose.model('mainActivities');

const getCommentOnActivity = async (req, res) => {
  const queryString = req.query;

  let limit = 10;
  let skip = queryString.skip ? parseInt(queryString.skip) : 0;
  const name = _.get(queryString, 'keyword', '');

  let matchCondition = {};
  matchCondition = {
    $and: [{
      'activity_type': {
        $in: ['activity']
      },
    }, {
      'activity_sub_type': {
        $in: ['CREATED_POST']
      },
    }]
  };
  if (name) {
    matchCondition = {
      $and: [{
        'activity_type': {
          $in: ['activity']
        },
      }, {
        'activity_sub_type': {
          $in: ['CREATED_POST']
        },
      },
      { 'comment': { $regex: name } }
      ]
    }

  }

  mainActivities.aggregate([{
    $match: matchCondition
  },
  {
    $sort: { createdAt: -1 }
  },
  {
    $lookup: {
      from: 'users',
      localField: 'user_id',
      foreignField: '_id',
      as: 'user'
    }
  },
  {
    $unwind: {
      preserveNullAndEmptyArrays: true,
      path: '$user'
    }
  },

  {
    $lookup: {
      from: 'businesses',
      localField: 'user._id',
      foreignField: 'owner',
      as: 'business'
    }
  },
  {
    $project: {
      _id: 1,
      avatar: 1,
      user_id: 1,
      organization_id: 1,
      invited_user_id: 1,
      workspace_id: 1,
      application_id: 1,
      post_id: 1,
      activity_id: 1,
      record_id: 1,
      activity_text: 1,
      activity_type: 1,
      activity_sub_type: 1,
      uniqueId: 1,
      createdAt: 1,
      comment: 1,
      user: {
        name: { $concat: ['$user.firstName', ' ', '$user.lastName'] },
        _id: '$user._id',
        avatar: '$user.avatar',
        position: '$user.position',
        businessName: { $arrayElemAt: ['$business.businessName', 0] },
      },
    }
  },

  {
    $lookup: {
      from: 'workspaces',
      localField: 'workspace_id',
      foreignField: '_id',
      as: 'workspace'
    }
  },
  {
    $unwind: {
      preserveNullAndEmptyArrays: true,
      path: '$workspace'
    }
  },
  {
    $project: {
      _id: 1,
      avatar: 1,
      user_id: 1,
      organization_id: 1,
      workspace_id: 1,
      application_id: 1,
      post_id: 1,
      activity_id: 1,
      record_id: 1,
      comment: 1,
      activity_text: 1,
      activity_type: 1,
      activity_sub_type: 1,
      uniqueId: 1,
      createdAt: 1,
      user: 1,
      workspaceName: "$workspaceName"

    }
  },
  {
    $lookup: {
      from: 'workspaceroles',
      let: { user: req.userInfo._id, ws: '$workspace_id' },
      pipeline: [
        {
          $match: {
            $expr: {
              $and: [
                { $eq: ['$workspace_id', '$$ws'] },
                { $eq: ['$user_id', '$$user'] }
              ]
            }
          }
        }],
      as: 'wsRole'
    }
  },
  {
    $project: {
      _id: 1,
      avatar: 1,
      user_id: 1,
      organization_id: 1,
      workspace_id: 1,
      application_id: 1,
      post_id: 1,
      activity_id: 1,
      record_id: 1,
      comment: 1,
      activity_text: 1,
      activity_type: 1,
      activity_sub_type: 1,
      uniqueId: 1,
      createdAt: 1,
      user: 1,
      workspaceName: 1,
      workspaceRole: { $arrayElemAt: ['$wsRole.role', 0] },
    }
  },
  {
    $lookup: {
      from: 'organizations',
      localField: 'organization_id',
      foreignField: '_id',
      as: 'organization'
    }
  },
  {
    $unwind: {
      preserveNullAndEmptyArrays: true,
      path: '$organization'
    }
  },
  {
    $project: {
      _id: 1,
      avatar: 1,
      user_id: 1,
      organization_id: 1,
      workspace_id: 1,
      application_id: 1,
      post_id: 1,
      activity_id: 1,
      record_id: 1,
      comment: 1,
      activity_text: 1,
      activity_type: 1,
      activity_sub_type: 1,
      uniqueId: 1,
      createdAt: 1,
      user: 1,
      workspaceName: 1,
      workspaceRole: 1,
      organizationName: "$organizationName"
    }
  },
  {
    $lookup: {
      from: 'organizationroles',
      let: { user: req.userInfo._id, org: '$organization_id' },
      pipeline: [
        {
          $match: {
            $expr: {
              $and: [
                { $eq: ['$organization_id', '$$org'] },
                { $eq: ['$user_id', '$$user'] }
              ]
            }
          }
        }],
      as: 'orgRole'
    }
  },
  {
    $project: {
      _id: 1,
      avatar: 1,
      user_id: 1,
      organization_id: 1,
      workspace_id: 1,
      application_id: 1,
      post_id: 1,
      activity_id: 1,
      record_id: 1,
      comment: 1,
      activity_text: 1,
      activity_type: 1,
      activity_sub_type: 1,
      uniqueId: 1,
      createdAt: 1,
      user: 1,
      workspaceName: 1,
      workspaceRole: 1,
      organizationName: "$organizationName",
      organizationRole: { $arrayElemAt: ['$orgRole.role', 0] }
    }
  },

  {
    '$facet': {
      totalRecord: [{ $count: "total" }],
      data: [{ $skip: skip }, { $limit: 10 }]
    }
  }

  ]).exec(async (err, activities) => {

    if (err) {
      const response = commonUtils.genErrorResponse(resStatusCode.error.internalServerError, req.t('ERROR'));
      return res.status(400).json(response);
    }
    let allParentActivity = [];
    let userIds = [];
    let stringUsers = {};
    let getCreatedAtDateForLatestSorting = '';

    if (activities && activities[0].data.length) {
      await Promise.all(_.map(activities[0].data, async (activity, keyIndex) => {
        if (activity.activity_type === 'activity' || activity.activity_type === 'comment') {
          let userName = '';
          getCreatedAtDateForLatestSorting = '';
          userName = activity.user.name ? activity.user.name : null;
          activity.activity_text = activity.activity_text.replace('[user-name]', userName);
          let appendSubActivity = activity;
          // eslint-disable-next-line no-useless-escape
          let regex = /\{\{[^\}]*\}\}/g;
          if (activity.comment && !_.isEmpty(activity.comment)) {

            let getUserPromiseComm = activity.comment.match(regex);
            if (getUserPromiseComm && getUserPromiseComm.length) {
              let refinedUserId = getUserPromiseComm.map(user => {
                return user.replace('{{', '').replace('}}', '');
              });
              if (refinedUserId && refinedUserId.length) {
                userIds = _.concat(userIds, refinedUserId);
              }
            }
          }

          appendSubActivity.latestAnyUpdates = !getCreatedAtDateForLatestSorting ? new Date(appendSubActivity.createdAt) : getCreatedAtDateForLatestSorting;
          getCreatedAtDateForLatestSorting = appendSubActivity.latestAnyUpdates;
          allParentActivity.push(appendSubActivity);

        }
      }));
    } else {
      activities = [];
    }
    userIds = _.uniqWith(userIds, _.isEqual);
    userIds = _.compact(userIds)
    if (userIds && userIds.length) {
      User.find({ _id: { $in: userIds } }, 'firstName lastName avatar', function (err, users) {
        if (!err) {

          allParentActivity = _.orderBy(allParentActivity, ['latestAnyUpdates'], ['desc']);

          users.forEach(function (user) {
            let name = user.firstName + ' ' + user.lastName;
            let imgUrl = '';
            if (user.avatar && user.avatar !== '') {
              imgUrl = process.env.MEDIA_URL + '/' + user.avatar;
            } else {
              imgUrl = process.env.USER_URL;
            }
            stringUsers['{{' + user.id + '}}'] = '<div contenteditable="false" class="client-name"><img src="' + imgUrl + '">' + name + '</div>';
          });
          allParentActivity.forEach(function (comm, key) {
            // eslint-disable-next-line no-useless-escape
            let regex = /\{\{[^\}]*\}\}/g;
            if (comm.activity_text && comm.activity_text !== null) {
              let getUserPromise = comm.activity_text.match(regex);
              if (getUserPromise && getUserPromise.length) {
                getUserPromise.map(user => {
                  return allParentActivity[key].activity_text = allParentActivity[key].activity_text.replace(user, stringUsers[user]);
                });
              }
            }
            if (comm.comment && comm.comment !== null) {
              let getUserPromise = comm.comment.match(regex);
              if (getUserPromise && getUserPromise.length) {
                getUserPromise.map(user => {
                  return allParentActivity[key].comment = allParentActivity[key].comment.replace(user, stringUsers[user]);
                });
              }
            }
          });


          // for (let index = 0; index < allParentActivity.length; index++) {

          //   const parent = allParentActivity[index];
          //   parent['likesCount'] = !_.isEmpty(parent['ActivityLikes']) ? parent['ActivityLikes'].length : 0;;

          //   allParentActivity[index]['latestAnyUpdates'] = parent.createdAt;


          // }

          if (allParentActivity.length > 0) {
            // const finalArr = _.take(_.drop(allParentActivity, skip), 10);
            const response = commonUtils.genSuccessResponse(resStatusCode.success, req.t('SUCCESS'), { totalRecord: activities[0].totalRecord[0].total, data: allParentActivity });
            return res.status(response.statusCode).json(response);

          } else {
            const response = commonUtils.genSuccessResponse(resStatusCode.success, req.t('SUCCESS'));
            return res.status(response.statusCode).json(response);
          }
        } else {
          const response = commonUtils.genErrorResponse(resStatusCode.error.internalServerError, req.t('ERROR'), err);
          return res.status(response.statusCode).json(response);
        }
      });
    } else {

      for (let index = 0; index < allParentActivity.length; index++) {

        const parent = allParentActivity[index];
        parent['likesCount'] = !_.isEmpty(parent['ActivityLikes']) ? parent['ActivityLikes'].length : 0;

        allParentActivity[index]['latestAnyUpdates'] = parent.createdAt;

      }
      allParentActivity = _.orderBy(allParentActivity, ['latestAnyUpdates'], ['desc']);

      if (allParentActivity.length > 0) {
        const response = commonUtils.genSuccessResponse(resStatusCode.success, req.t('SUCCESS'), { totalRecord: activities[0].totalRecord[0].total, data: allParentActivity });
        return res.status(response.statusCode).json(response);
      } else {
        const response = commonUtils.genSuccessResponse(resStatusCode.success, req.t('SUCCESS'));
        return res.status(response.statusCode).json(response);
      }
    }
  });


};
module.exports = getCommentOnActivity;