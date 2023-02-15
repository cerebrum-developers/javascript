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
const mainActivities = mongoose.model('mainActivities');
const getCommentOnActivity = async (req, res) => {
  const queryString = req.query;

  let matchCondition = {};
  matchCondition = {
    $and: [{
      '_id': ObjectID(req.params.id)
    }, {
      "activity_type": "activity"
    }
    ]
  }
  mainActivities.aggregate([{
    $match: { '_id': ObjectID(req.params.id), "activity_type": "activity" }
  },
  {
    $lookup: {
      from: 'applicationcomments',
      localField: '_id',
      foreignField: 'activity_id',
      as: 'ActivityComments'
    }
  },
  {
    $lookup: {
      from: 'mainactivities',
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
    "$lookup": {
      "from": "users",
      let: { user: { $arrayElemAt: ["$shareData.user_id", 0] } },
      "pipeline": [
        {
          $match: {
            $expr: {
              $and: [

                { $eq: ['$_id', '$$user'] }
              ]
            }
          }
        }],
      "as": "shareUser"
    }
  },
  {
    "$lookup": {
      "from": "businesses",
      let: { user: { $arrayElemAt: ["$shareUser._id", 0] } },
      "pipeline": [
        {
          $match: {
            $expr: {
              $and: [

                { $eq: ['$owner', '$$user'] }
              ]
            }
          }
        }],
      "as": "shareBusiness"
    }
  },
  {
    $lookup: {
      from: 'likes',
      localField: '_id',
      foreignField: 'activity_id',
      as: 'ActivityLikes'
    },
  },
  {
    $lookup: {
      from: 'users',
      localField: 'user_id',
      foreignField: '_id',
      as: 'user'
    },
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
    },
  },
  {
    $lookup: {
      from: 'workspaces',
      localField: 'workspace_id',
      foreignField: '_id',
      as: 'workspace'
    },
  },
  {
    $unwind: {
      preserveNullAndEmptyArrays: true,
      path: '$workspace'
    }
  },
  {
    "$lookup": {
      "from": "workspaceroles",
      let: { user: ObjectID(req.userInfo._id), ws: "$workspace_id" },
      "pipeline": [
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
      "as": "wsRole"
    }
  },
  {
    $lookup: {
      from: 'organizations',
      localField: 'organization_id',
      foreignField: '_id',
      as: 'organization'
    },
  },
  {
    $unwind: {
      preserveNullAndEmptyArrays: true,
      path: '$organization'
    }
  },
  {
    "$lookup": {
      "from": "organizationroles",
      let: { user: ObjectID(req.userInfo._id), org: "$organization_id" },
      "pipeline": [
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
      "as": "orgRole"
    }
  },
  {
    $lookup: {
      from: 'users',
      localField: 'invited_user_id',
      foreignField: '_id',
      as: 'Invited_user'
    },
  },
  {
    $unwind: {
      preserveNullAndEmptyArrays: true,
      path: '$Invited_user'
    }
  },
  {
    $lookup: {
      from: 'applications',
      localField: 'application_id',
      foreignField: '_id',
      as: 'application'
    },
  },
  {
    $unwind: {
      preserveNullAndEmptyArrays: true,
      path: '$application'
    }
  },
  {
    $lookup: {
      from: 'tasks',
      localField: 'task_id',
      foreignField: '_id',
      as: 'task'
    },
  },
  {
    $unwind: {
      preserveNullAndEmptyArrays: true,
      path: '$task'
    }
  },
  {
    $lookup: {
      from: 'records',
      localField: 'record_id',
      foreignField: '_id',
      as: 'recordCells'
    },
  },
  {
    $unwind: {
      preserveNullAndEmptyArrays: true,
      path: '$recordCells'
    }
  },
  {
    $lookup: {
      from: 'fields',
      localField: 'application_id',
      foreignField: 'application_id',
      as: 'fieldType'
    },
  },


  {
    $project: {
      '_id': 1,
      'comment': 1,
      'comment_rich_link': 1,
      'uniqueId': 1,
      'avatar': 1,
      'activity_text': 1,
      'record_id': 1,
      'workspace_id': 1,
      'organization_id': 1,
      'activity_id': 1,
      'createdAt': 1,
      'application_id': 1,
      'activity_type': 1,
      'activity_sub_type': 1,
      'invited_email_id': 1,
      'user': {
        'name': { '$concat': ["$user.firstName", " ", "$user.lastName"] },
        '_id': '$user._id',
        'avatar': '$user.avatar',
        'position': '$user.position',
        'email': "$user.email",
        'orgId': "",
        'orgName': "",
        'businessName': { $arrayElemAt: ["$business.businessName", 0] },
        'createdAt': '$user.createdAt'
      },
      'ActivityComments': '$ActivityComments',
      'ActivityLikes': '$ActivityLikes',
      'workspace': {
        'name': "$workspace.name",
        '_id': '$workspace._id',
        'organization_id': '$workspace.organization_id',
        'avatar': '$workspace.avatar',
        'shortid': '$workspace.shortid',
        'slug': '$workspace.slug',
        'wsRole': { $arrayElemAt: ["$wsRole.role", 0] },
        'createdAt': '$workspace.createdAt'
      },
      'organization': {
        'name': "$organization.name",
        '_id': '$organization._id',
        'avatar': '$organization.avatar',
        'shortid': '$organization.shortid',
        'slug': '$organization.slug',
        'orgRole': { $arrayElemAt: ["$orgRole.role", 0] },
        'createdAt': '$organization.createdAt'
      },
      'application': {
        '_id': '$application._id',
        'name': '$application.name',
        'slug': '$application.slug'
      },
      'task': {
        '_id': '$task._id',
        'title': '$task.title'
      },
      'invited_user': {
        'name': { '$concat': ["$Invited_user.firstName", " ", "$Invited_user.lastName"] },
        '_id': '$Invited_user._id',
        'avatar': '$Invited_user.avatar',
        'createdAt': '$Invited_user.createdAt'
      },
      'recordsCells': '$recordCells.cells',
      'fields': '$fieldType._id',
      'fieldsType': "$fieldType.type",
      'post_id': 1,
      'shareUser': {
        $let: {
          vars: {
            shareUser: {
              $arrayElemAt: ["$shareUser", 0]
            }
          },
          in: {
            _id: "$$shareUser._id",
            avatar: "$$shareUser.avatar",
            position: "$$shareUser.position",
            name: { '$concat': ["$$shareUser.firstName", " ", "$$shareUser.lastName"] },
            businessName: { $arrayElemAt: ["$shareBusiness.businessName", 0] },
          }
        }
      },
      shareData: {
        $let: {
          vars: {
            shareData: {
              $arrayElemAt: ["$shareData", 0]
            }
          },
          in: {
            comment: "$$shareData.comment",
            avatar: "$$shareData.avatar",
            comment_rich_link: "$$shareData.comment_rich_link",
            createdAt: "$$shareData.createdAt"
          }
        }
      }
    }
  },
  {
    $sort: { 'createdAt': -1 }
  },
  {
    $group: {
      _id: {
        workspace_id: '$workspace._id'
      },
      respectiveActivity: {
        $push: '$$ROOT'
      },
      'numberOf': {
        $sum: 1
      }
    },
  },
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
      await Promise.all(_.map(activities, async (groupActivity) => {
        // activities.forEach(function (groupActivity) {
        await Promise.all(_.map(groupActivity.respectiveActivity, async (activity, keyIndex) => {

          if (activity.activity_type === 'activity' || activity.activity_type === 'comment') {
            if (activity.user.businessName && !_.isEmpty(activity.user.businessName)) {
              let domain = activity.user.email.substring(activity.user.email.lastIndexOf("@") + 1);
              const org = await organizationUtils.findOrganization({ domain: domain }, { name: 1 });
              activity.user.orgName = org.name;
              activity.user.orgId = org._id;
            }
            let userName = '';
            if (activity.activity_id && activity.activity_id !== null && allSubActivity[activity.activity_id.toString()] == null) {
              allSubActivity[activity.activity_id.toString()] = [];
            }
            if (activity.activity_sub_type === activity_type.sharedPost) {
              getCreatedAtDateForLatestSorting = '';
              userName = groupActivity.respectiveActivity[keyIndex].user.name ? groupActivity.respectiveActivity[keyIndex].user.name : null;
              groupActivity.respectiveActivity[keyIndex].activity_text = groupActivity.respectiveActivity[keyIndex].activity_text.replace('[user-name]', userName);
              let appendSubActivity = groupActivity.respectiveActivity[keyIndex];
              appendSubActivity.ActivityComments = [];
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
              if (activity.shareData.comment && !_.isEmpty(activity.shareData.comment)) {

                let getUserPromiseCommShare = activity.shareData.comment.match(regex);
                if (getUserPromiseCommShare && getUserPromiseCommShare.length) {
                  let refinedUserIdShare = getUserPromiseCommShare.map(user => {
                    return user.replace('{{', '').replace('}}', '');
                  });
                  if (refinedUserIdShare && refinedUserIdShare.length) {
                    userIds = _.concat(userIds, refinedUserIdShare);
                  }
                }
              }

              appendSubActivity.latestAnyUpdates = !getCreatedAtDateForLatestSorting ? new Date(appendSubActivity.createdAt) : getCreatedAtDateForLatestSorting;
              getCreatedAtDateForLatestSorting = appendSubActivity.latestAnyUpdates;
              allParentActivity.push(appendSubActivity);
            }
          }
        }));
      }));
    } else {
      activities = [];
    }
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
            if (comm.shareData.comment && comm.shareData.comment !== null) {
              let getUserPromise = comm.shareData.comment.match(regex);
              if (getUserPromise && getUserPromise.length) {
                getUserPromise.map(user => {
                  return allParentActivity[key].shareData.comment = allParentActivity[key].shareData.comment.replace(user, stringUsers[user]);
                });
              }
            }

          });
          allParentActivity.forEach(function (element) {
            if (element._id && element._id !== null && allSubActivity[element._id.toString()] && element.activity_sub_type === 'SHARED_POST') {
              element.subActivity = [];
              element.subActivityTotal = 0;
              element.ActivityComments = []
            }
          });
          for (let index = 0; index < allParentActivity.length; index++) {
            const parent = allParentActivity[index];
            allParentActivity[index]['likesCount'] = allParentActivity[index]['ActivityLikes'].length;
            delete allParentActivity[index]['ActivityLikes'];
            const maxDateObj = _.maxBy(parent.subActivity, 'createdAt');
            if (maxDateObj && maxDateObj !== undefined) {
              allParentActivity[index]['latestAnyUpdates'] = maxDateObj.createdAt;
            } else {
              allParentActivity[index]['latestAnyUpdates'] = parent.createdAt;
            }
            const maxDateObjComment = _.maxBy(parent.ActivityComments, 'createdAt');
            if (maxDateObjComment && maxDateObjComment !== undefined) {
              allParentActivity[index]['latestAnyUpdates'] = maxDateObjComment.createdAt;
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
        element.ActivityComments = []
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