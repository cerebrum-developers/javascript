'use strict';
const mongoose = require('mongoose');
const commonUtils = require('../../../../helper/commonUtils');
const { resStatusCode, activity_type } = require('../../../../helper/constant');
const ObjectID = require('mongodb').ObjectID;
const Activity = mongoose.model('Activities');
const User = mongoose.model('User');
const _ = require('lodash');
const userUtils = require("../../user/userUtils");
const organizationUtils = require("../../organization/organizationUtils");
const marketUtils = require("../../market-workspace/market-workspaceUtils")
const subActivities = mongoose.model('subActivities');
const mainActivities = mongoose.model('mainActivities');

const getCommentOnActivity = async (req, res) => {
  const queryString = req.query;
  
  mainActivities.aggregate([{
    $match: { '_id': ObjectID(req.params.id), "activity_type": "activity" }
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
      avatar:1,
      comment_rich_link:1,
      _id: 1,
      user_id: 1,
      organization_id: 1,
      record_id: 1,
      workspace_id: 1,
      application_id: 1,
      post_id: 1,
      activity_id: 1,
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
        email:"$user.email",
        businessName: { $arrayElemAt: ['$business.businessName', 0] },
        orgId:"",
        orgName:""
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
      avatar:1,
      comment_rich_link:1,
      user_id: 1,
      organization_id: 1,
      workspace_id: 1,
      record_id: 1,
      application_id: 1,
      post_id: 1,
      activity_id: 1,
      comment: 1,
      activity_text: 1,
      activity_type: 1,
      activity_sub_type: 1,
      uniqueId: 1,
      createdAt: 1,
      user: 1,
      workspaceName: "$workspaceName",
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
      user_id: 1,
      comment_rich_link:1,
      avatar:1,
      organization_id: 1,
      workspace_id: 1,
      application_id: 1,
      post_id: 1,
      record_id: 1,
      activity_id: 1,
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
      user_id: 1,
      comment_rich_link:1,
      avatar:1,
      organization_id: 1,
      workspace_id: 1,
      application_id: 1,
      post_id: 1,
      record_id: 1,
      activity_id: 1,
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
      user_id: 1,
      avatar:1,
      comment_rich_link:1,
      organization_id: 1,
      workspace_id: 1,
      application_id: 1,
      post_id: 1,
      record_id: 1,
      activity_id: 1,

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
      organizationRole: { $arrayElemAt: ['$orgRole.role', 0] },

    }
  },


  {
    $lookup: {
      from: 'shareactivities',
      localField: '_id',
      foreignField: 'activity_id',
      as: 'shareCount'
    }
  },
  {
    $lookup: {
      from: 'activities',
      let: { org: '$post_id' },
      pipeline: [
        {
          $match: {
            $expr: {
              $and: [
                { $eq: ['$_id', '$$org'] }
              ]
            }
          }
        }],
      as: 'shareData'
    }
  },
  {
    $lookup: {
      from: 'users',
      let: { user: { $arrayElemAt: ['$shareData.user_id', 0] } },
      pipeline: [
        {
          $match: {
            $expr: {
              $and: [

                { $eq: ['$_id', '$$user'] }
              ]
            }
          }
        }],
      as: 'shareUser'
    }
  },
  {
    $lookup: {
      from: 'businesses',
      let: { user: { $arrayElemAt: ['$shareUser._id', 0] } },
      pipeline: [
        {
          $match: {
            $expr: {
              $and: [

                { $eq: ['$owner', '$$user'] }
              ]
            }
          }
        }],
      as: 'shareBusiness'
    }
  },
  {
    $project: {
      _id: 1,
      user_id: 1,
      avatar:1,
      comment_rich_link:1,
      organization_id: 1,
      workspace_id: 1,
      application_id: 1,
      post_id: 1,
      record_id: 1,
      activity_id: 1,
      comment: 1,
      activity_text: 1,
      activity_type: 1,
      activity_sub_type: 1,
      uniqueId: 1,
      createdAt: 1,
      user: 1,
      workspaceName: 1,
      workspaceRole: 1,
      organizationName: 1,
      organizationRole: 1,
      shareData: {
        $let: {
          vars: {
            shareData: {
              $arrayElemAt: ['$shareData', 0]
            }
          },
          in: {
            comment: '$$shareData.comment',
            avatar: '$$shareData.avatar',
            comment_rich_link: '$$shareData.comment_rich_link',
            createdAt: '$$shareData.createdAt'
          }
        }
      },
      shareUser: {
        $let: {
          vars: {
            shareUser: {
              $arrayElemAt: ['$shareUser', 0]
            }
          },
          in: {
            _id: '$$shareUser._id',
            avatar: '$$shareUser.avatar',
            position: '$$shareUser.position',
            name: { $concat: ['$$shareUser.firstName', ' ', '$$shareUser.lastName'] },
            businessName: { $arrayElemAt: ['$shareBusiness.businessName', 0] }
          }
        }
      },
      shareCount: { $size: "$shareCount" }
    }
  },
  { $skip: 0 },
  { $limit: 1 }
 

  ]).exec(async (err, activities) => {
    if (err) {
      const response = commonUtils.genErrorResponse(resStatusCode.error.internalServerError, req.t('ERROR'));
      return res.status(400).json(response);
    }
    let allParentActivity = [];
    let userIds = [];
    let stringUsers = {};
    let allSubActivity = {};
    let getCreatedAtDateForLatestSorting = '';
    if (activities && activities.length) {

      // activities.forEach(function (groupActivity) {
      await Promise.all(_.map(activities, async (activity, keyIndex) => {

        if (activity.activity_type === 'activity' || activity.activity_type === 'comment') {
          let userName = '';
          if (activity.user.businessName && !_.isEmpty(activity.user.businessName)) {
            let domain = activity.user.email.substring(activity.user.email.lastIndexOf("@") + 1);
            const org = await organizationUtils.findOrganization({ domain: domain }, { name: 1 });
            activity.user.orgName = org.name;
            activity.user.orgId = org._id;
          }
          if (activity.activity_id && activity.activity_id !== null && allSubActivity[activity.activity_id.toString()] == null) {
            allSubActivity[activity.activity_id.toString()] = [];
          }
          if (activity.activity_sub_type === activity_type.createdPost) {
            getCreatedAtDateForLatestSorting = '';
            userName = activity.user.name ? activity.user.name : null;
            activity.activity_text = activity.activity_text.replace('[user-name]', userName);
            let appendSubActivity = activity;
            appendSubActivity.ActivityComments = [];
            appendSubActivity.ActivityLikes = [];
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
        }
      }));

    } else {
      activities = [];
    }
    userIds=_.compact(userIds)
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
            stringUsers['{{' + user.id + '}}'] = '<div [contenteditable]="false" class="client-name"><img src="' + imgUrl + '">' + name + '</div>';
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
          allParentActivity.forEach(function (element) {
            if (element._id && element._id !== null && allSubActivity[element._id.toString()] && element.activity_sub_type === 'CREATED_POST') {
              element.subActivity = [];
              element.subActivityTotal = 0;
              element.ActivityComments = [];
              element.ActivityLikes = []
            }
          });
          for (let index = 0; index < allParentActivity.length; index++) {
            const parent = allParentActivity[index];
            allParentActivity[index]['likesCount'] = 0;
            const maxDateObj = _.maxBy(parent.subActivity, 'createdAt');
            if (maxDateObj && maxDateObj !== undefined) {
              allParentActivity[index]['latestAnyUpdates'] = maxDateObj.createdAt;
            } else {
              allParentActivity[index]['latestAnyUpdates'] = parent.createdAt;
            }

          }
          allParentActivity = _.orderBy(allParentActivity, ['latestAnyUpdates'], ['desc']);

          if (allParentActivity.length > 0) {
            const response = commonUtils.genSuccessResponse(resStatusCode.success, req.t('SUCCESS'), { totalRecord: 1, data: allParentActivity });
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
      allParentActivity.forEach(function (element) {
        element.subActivity = [];
        element.subActivityTotal = 0;
        element.ActivityComments = [];
        element.ActivityLikes = []
      });
      for (let index = 0; index < allParentActivity.length; index++) {
        const parent = allParentActivity[index];
        parent['likesCount'] = 0;
        const maxDateObj = _.maxBy(parent.subActivity, 'createdAt');
        if (maxDateObj && maxDateObj !== undefined) {
          allParentActivity[index]['latestAnyUpdates'] = maxDateObj.createdAt;
        } else {
          allParentActivity[index]['latestAnyUpdates'] = parent.createdAt;
        }
      }
      allParentActivity = _.orderBy(allParentActivity, ['latestAnyUpdates'], ['desc']);

      if (allParentActivity.length > 0) {
          const response = commonUtils.genSuccessResponse(resStatusCode.success, req.t('SUCCESS'), { totalRecord: 1, data: allParentActivity });
          return res.status(response.statusCode).json(response);
        
      } else {
        const response = commonUtils.genSuccessResponse(resStatusCode.success, req.t('SUCCESS'));
        return res.status(response.statusCode).json(response);
      }
    }
  });

};

module.exports = getCommentOnActivity;