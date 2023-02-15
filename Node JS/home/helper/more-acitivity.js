'use strict';
const mongoose = require('mongoose');
const commonUtils = require('../../../../helper/commonUtils');
const { resStatusCode, activity_type } = require('../../../../helper/constant');
const ObjectID = require('mongodb').ObjectID;
const _ = require('lodash');
const organizationUtils = require("../../organization/organizationUtils");
const subActivities = mongoose.model('subActivities');
const getSubActivities = async (req, res) => {
  const queryString = req.query;
  let limit = 10;
  let skip = queryString.skip ? parseInt(queryString.skip) : 0;
  let userId = req.userInfo._id;
  let matchCondition = {};
  
  matchCondition = {
    $and: [{
      main_activity_id: req.activity._id
    }, {
      'activity_type': {
        $in: ['comment', 'activity']
      }
    }, {
      'activity_sub_type': {
        $in: ['LIKED_POST', 'UPDATED_WORKSPACE', 'TASK_CREATED', 'CREATED_APP', 'UPDATED_APP', 'CREATED_RECORD', 'COMMENTED_ON', 'COMMENTED_ON_APPLICATION', 'INVITED_USER', 'CREATED_WORKSPACE', 'UPDATED_RECORD']
      },
    }]
  };

  subActivities.aggregate([{
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
      user_id: 1,
      main_activity_id: 1,
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
      uniqueId: {

        $cond: { if: { $eq: ['$uniqueId', ""] }, then: '$_id', else: '$uniqueId' }
      },
      createdAt: 1,
      comment: 1,
      avatar: 1,
      comment_rich_link: 1,
      user: {
        // name: { $concat: ['$user.firstName', ' ', '$user.lastName'] },
        firstName: '$user.firstName',
        lastName: '$user.lastName',
        _id: '$user._id',
        avatar: '$user.avatar',
        position: '$user.position',
        email:"$user.email",
        orgId:"",
        orgName:"",
        businessName: { $arrayElemAt: ['$business.businessName', 0] },
      },
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
      user_id: 1,
      main_activity_id: 1,
      organization_id: 1,
      workspace_id: 1,
      application_id: 1,
      post_id: 1,
      invited_user_id: 1,
      activity_id: 1,
      record_id: 1,
      comment: 1,
      avatar: 1,
      comment_rich_link: 1,
      activity_text: 1,
      activity_type: 1,
      activity_sub_type: 1,
      uniqueId: 1,
      createdAt: 1,
      user: 1,
      workspaceName: "$workspace.name",
      invited_user: {
        'firstName': '$Invited_user.firstName',
        'lastName': '$Invited_user.lastName',
        '_id': '$Invited_user._id',
        'avatar': '$Invited_user.avatar',
        'createdAt': '$Invited_user.createdAt'
      },
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
      main_activity_id: 1,
      organization_id: 1,
      workspace_id: 1,
      application_id: 1,
      post_id: 1,
      invited_user_id: 1,
      activity_id: 1,
      record_id: 1,
      comment: 1,
      avatar: 1,
      comment_rich_link: 1,
      activity_text: 1,
      activity_type: 1,
      activity_sub_type: 1,
      uniqueId: 1,
      createdAt: 1,
      user: 1,
      workspaceName: 1,
      workspaceRole: { $arrayElemAt: ['$wsRole.role', 0] },
      invited_user: 1
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
      main_activity_id: 1,
      organization_id: 1,
      workspace_id: 1,
      application_id: 1,
      post_id: 1,
      invited_user_id: 1,
      activity_id: 1,
      record_id: 1,
      comment: 1,
      avatar: 1,
      comment_rich_link: 1,
      activity_text: 1,
      activity_type: 1,
      activity_sub_type: 1,
      uniqueId: 1,
      createdAt: 1,
      user: 1,
      workspaceName: 1,
      workspaceRole: 1,
      organizationName: "$organization.name",
      invited_user: 1
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
      main_activity_id: 1,
      organization_id: 1,
      workspace_id: 1,
      application_id: 1,
      post_id: 1,
      invited_user_id: 1,
      activity_id: 1,
      record_id: 1,
      comment: 1,
      avatar: 1,
      comment_rich_link: 1,
      activity_text: 1,
      activity_type: 1,
      activity_sub_type: 1,
      uniqueId: 1,
      createdAt: 1,
      user: 1,
      workspaceName: 1,
      workspaceRole: 1,
      organizationName: 1,
      organizationRole: { $arrayElemAt: ['$orgRole.role', 0] },
      invited_user: 1
    }
  },
  {
    $lookup: {
      from: 'records',
      localField: 'record_id',
      foreignField: '_id',
      as: 'recordsCells'
    }
  },
  {
    $unwind: {
      preserveNullAndEmptyArrays: true,
      path: '$recordsCells'
    }
  },
  {
    $project: {
      _id: 1,
      user_id: 1, main_activity_id: 1,
      organization_id: 1,
      workspace_id: 1,
      application_id: 1,
      post_id: 1,
      invited_user_id: 1,
      activity_id: 1,
      record_id: 1,
      comment: 1,
      avatar: 1,
      comment_rich_link: 1,
      activity_text: 1,
      activity_type: 1,
      activity_sub_type: 1,
      uniqueId: 1,
      createdAt: 1,
      user: 1,
      workspaceName: 1,
      workspaceRole: 1,
      organizationName: 1,
      invited_user: 1,
      organizationRole: 1,
      recordsCells: "$recordsCells.cells"
    }
  },
  {
    $lookup: {
      from: 'fields',
      localField: 'application_id',
      foreignField: 'application_id',
      as: 'fieldType'
    }
  },
  {
    $project: {
      _id: 1,
      user_id: 1,
      main_activity_id: 1,
      organization_id: 1,
      workspace_id: 1,
      application_id: 1,
      post_id: 1,
      invited_user_id: 1,
      activity_id: 1,
      record_id: 1,
      comment: 1,
      avatar: 1,
      comment_rich_link: 1,
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
      recordsCells: 1,
      fields: '$fieldType._id',
      fieldsType: '$fieldType.type',
      invited_user: 1
    }
  },
  {
    $lookup: {
      from: 'cells',
      let: { record_id: '$record_id' },
      pipeline: [
        {
          $match:
          {
            $expr:
            {
              $eq: ['$record_id', '$$record_id']
            }
          }
        },
        {
          $project: {
            record_id: 1,
            field_id: 1,
            value: 1
          }
        }
      ],
      as: 'cell'
    }
  },

  {
    $project: {
      _id: 1,
      user_id: 1,
      main_activity_id: 1,
      organization_id: 1,
      workspace_id: 1,
      application_id: 1,
      post_id: 1,
      invited_user_id: 1,
      activity_id: 1,
      record_id: 1,
      comment: 1,
      avatar: 1,
      comment_rich_link: 1,
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
      recordsCells: 1,
      fields: 1,
      fieldsType: 1,
      invited_user: 1,
    }
  },
  {
    $lookup: {
      from: 'applications',
      localField: 'application_id',
      foreignField: '_id',
      as: 'application'
    }
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
    }
  },
  {
    $unwind: {
      preserveNullAndEmptyArrays: true,
      path: '$task'
    }
  },

  {
    $project: {
      _id: 1,
      main_activity_id: 1,
      user_id: 1,
      organization_id: 1,
      workspace_id: 1,
      application_id: 1,
      record_id: 1,
      post_id: 1,
      invited_user_id: 1,
      activity_id: 1,
      comment: 1,
      avatar: 1,
      comment_rich_link: 1,
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
      recordsCells: 1,
      fields: 1,
      fieldsType: 1,
      cell: 1,
      shareData: 1,
      shareUser: 1,
      shareCount: 1,
      applicationName: { $ifNull: ["$application.name", ""] },
      task: 1,
      invited_user: 1,
    }
  },
  {
    $match: {
      "$or": [
        {
          "$and": [
            {
              activity_sub_type: "CREATED_RECORD",
            },
            {
              recordsCells: { $exists: true }
            },
          ]
        },
        {
          activity_sub_type: { $ne: "CREATED_RECORD" }
        }
      ]
    }
  },
  {
    $group: {
      _id: {
        uniqueId: '$uniqueId'
      },
      activity_id: { $first: "$activity_id" },
      main_activity_id: { $first: "$main_activity_id" },
      user_id: { $first: "$user_id" },
      organization_id: { $first: "$organization_id" },
      workspace_id: { $first: "$workspace_id" },
      application_id: { $first: "$application_id" },
      record_id: { $first: "$record_id" },
      post_id: { $first: "$post_id" },
      invited_user_id: { $first: "$invited_user_id" },

      comment: { $first: "$comment" },
      avatar: { $first: "$avatar" },
      comment_rich_link: { $first: "$comment_rich_link" },
      activity_text: { $first: "$activity_text" },
      activity_type: { $first: "$activity_type" },
      activity_sub_type: { $first: "$activity_sub_type" },
      uniqueId: { $first: "$uniqueId" },
      createdAt: { $first: "$createdAt" },
      user: { $first: "$user" },
      workspaceName: { $first: "$workspaceName" },
      workspaceRole: { $first: "$workspaceRole" },
      organizationName: { $first: "$organizationName" },
      organizationRole: { $first: "$organizationRole" },
      recordsCells: { $first: "$recordsCells" },
      fields: { $first: "$fields" },
      fieldsType: { $first: "$fieldsType" },
      cell: { $first: "$cell" },
      shareData: { $first: "$shareData" },
      shareUser: { $first: "$shareUser" },
      shareCount: { $first: "$shareCount" },
      applicationName: { $first: "$applicationName" },
      task: { $first: "$task" },
      invited_user: { $first: "$invited_user" },
      // 'numberOf': {
      //   $sum: 1
    }
  },

  { $skip: skip },
  { $limit: 10 }
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
      await Promise.all(_.map(activities, async (activity, keyIndex) => {
        if (activity.activity_type === 'activity' || activity.activity_type === 'comment') {
          if (activity.user.businessName && !_.isEmpty(activity.user.businessName)) {
            let domain = activity.user.email.substring(activity.user.email.lastIndexOf("@") + 1);
            const org = await organizationUtils.findOrganization({ domain: domain }, { name: 1 });
            activity.user.orgName = org.name;
            activity.user.orgId = org._id;
          }
          let userName = '';
          let applicationName = '';
          let workspaceName = '';
          let organizationName = '';
          userName = activity.user.name ? activity.user.name : null;
          workspaceName = activity.workspaceName ? activity.workspaceName : null;
          organizationName = activity.organizationName ? activity.organizationName : null;
          applicationName = activity.applicationName ? activity.applicationName : null;


          if (activity.activity_sub_type === activity_type.invitedUser) {

            let invitedUserName = activity.invited_user.name ? activity.invited_user.name : null;
            activity.activity_text = activity.activity_text.replace('[user-name]', userName);
            activity.activity_text = activity.activity_text.replace('[invitation-name]', invitedUserName);
            activity.activity_text = activity.activity_text.replace('[substance-name]', !_.isEmpty(organizationName) ? organizationName : workspaceName);
            let appendSubActivity = activity;

            if (getCreatedAtDateForLatestSorting < new Date(appendSubActivity.createdAt)) {
              getCreatedAtDateForLatestSorting = new Date(appendSubActivity.createdAt);
            }
          }
          else if (activity.activity_sub_type === activity_type.updatedWorkspace) {

            activity.activity_text = activity.activity_text.replace('[user-name]', userName);
            activity.activity_text = activity.activity_text.replace('[substance-name]', workspaceName);
            let appendSubActivity = activity;
            if (getCreatedAtDateForLatestSorting < new Date(appendSubActivity.createdAt)) {
              getCreatedAtDateForLatestSorting = new Date(appendSubActivity.createdAt);
            }
            // allSubActivity[activity.workspace_id.toString()].push(appendSubActivity);
          }
          else if (activity.activity_sub_type === activity_type.updatedApp) {
            activity.activity_text = activity.activity_text.replace('[user-name]', userName);
            activity.activity_text = activity.activity_text.replace('[substance-name]', applicationName);
            let appendSubActivity = activity;
            if (getCreatedAtDateForLatestSorting < new Date(appendSubActivity.createdAt)) {
              getCreatedAtDateForLatestSorting = new Date(appendSubActivity.createdAt);
            }
            //  allSubActivity[activity.workspace_id.toString()].push(appendSubActivity);
          } else if (activity.activity_sub_type === activity_type.createdApp) {
            activity.activity_text = activity.activity_text.replace('[user-name]', userName);
            activity.activity_text = activity.activity_text.replace('[substance-name]', applicationName);
            let appendSubActivity = activity;
            if (getCreatedAtDateForLatestSorting < new Date(appendSubActivity.createdAt)) {
              getCreatedAtDateForLatestSorting = new Date(appendSubActivity.createdAt);
            }
            // allSubActivity[activity.workspace_id.toString()].push(appendSubActivity);
          }

          else if (activity.activity_sub_type === activity_type.createdTask) {

            activity.activity_text = activity.activity_text.replace('[user-name]', userName);
            activity.activity_text = activity.activity_text.replace('[substance-name]', applicationName);
            let appendSubActivity = activity;
            if (getCreatedAtDateForLatestSorting < new Date(appendSubActivity.createdAt)) {
              getCreatedAtDateForLatestSorting = new Date(appendSubActivity.createdAt);
            }
            // allSubActivity[activity.workspace_id.toString()].push(appendSubActivity);
          } else if (activity.activity_sub_type === activity_type.commentedOnTask) {

            activity.activity_text = activity.activity_text.replace('[user-name]', userName);
            let appendSubActivity = activity;
            if (getCreatedAtDateForLatestSorting < new Date(appendSubActivity.createdAt)) {
              getCreatedAtDateForLatestSorting = new Date(appendSubActivity.createdAt);
            }
            //   allSubActivity[activity.workspace_id.toString()].push(appendSubActivity);
          }

          else if (activity.activity_sub_type === activity_type.createdRecord) {

            getCreatedAtDateForLatestSorting = '';
            activity.activity_text = activity.activity_text.replace('[user-name]', userName);
            activity.activity_text = activity.activity_text.replace('[substance-name]', applicationName);
            let appendSubActivity = activity;

            appendSubActivity.latestAnyUpdates = !getCreatedAtDateForLatestSorting ? new Date(appendSubActivity.createdAt) : getCreatedAtDateForLatestSorting;
            getCreatedAtDateForLatestSorting = appendSubActivity.latestAnyUpdates;

            //  allParentActivity.push(appendSubActivity);
          }
          else if (activity.activity_sub_type === activity_type.commentedOnActivity || activity.activity_sub_type === activity_type.commentedOnApp) {

            activity.activity_text = activity.activity_text.replace('[user-name]', userName);
            let appendSubActivity = activity;

            if (getCreatedAtDateForLatestSorting < new Date(appendSubActivity.createdAt)) {
              getCreatedAtDateForLatestSorting = new Date(appendSubActivity.createdAt);
            }

          }
          else if (activity.activity_sub_type === activity_type.likedPost) {

            activity.activity_text = activity.activity_text.replace('[user-name]', userName);
            let appendSubActivity = activity;
            if (getCreatedAtDateForLatestSorting < new Date(appendSubActivity.createdAt)) {
              getCreatedAtDateForLatestSorting = new Date(appendSubActivity.createdAt);
            }
          }
          else if (activity.activity_sub_type === activity_type.updatedRecord) {
            activity.activity_text = activity.activity_text.replace('[user-name]', userName);
            activity.activity_text = activity.activity_text.replace('[substance-name]', applicationName);
            let appendSubActivity = activity;

            if (getCreatedAtDateForLatestSorting < new Date(appendSubActivity.createdAt)) {
              getCreatedAtDateForLatestSorting = new Date(appendSubActivity.createdAt);
            }
            //   allSubActivity[activity.record_id.toString()].push(appendSubActivity);
          }
        }
      }));
      //  }));
    } else {
      activities = [];
    }
    activities = _.orderBy(activities, ['latestAnyUpdates'], ['desc']);

    if (activities.length > 0) {
      // const finalArr = _.take(_.drop(parentData, 0), 10);
      const response = commonUtils.genSuccessResponse(resStatusCode.success, req.t('SUCCESS'), { data: activities });
      return res.status(response.statusCode).json(response);
    } else {
      const response = commonUtils.genSuccessResponse(resStatusCode.success, req.t('SUCCESS'));
      return res.status(response.statusCode).json(response);
    }

  });


};
module.exports = getSubActivities;