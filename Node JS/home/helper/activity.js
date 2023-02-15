'use strict';
const mongoose = require('mongoose');
const commonUtils = require('../../../../helper/commonUtils');
const { resStatusCode, activity_type } = require('../../../../helper/constant');
const ObjectID = require('mongodb').ObjectID;
const User = mongoose.model('User');
const _ = require('lodash');
const organizationUtils = require("../../organization/organizationUtils");
const userUtils = require("../../user/userUtils");;
const ApplicationComments = mongoose.model('Applicationcomment');
const marketUtils = require("../../market-workspace/market-workspaceUtils")
const workspaceUtils = require("../../workspace/workspaceUtils");
const mainActivities = mongoose.model('mainActivities');
const subActivities = mongoose.model('subActivities');
const { OrganizationRoleModel, WorkspaceRoleModel } = require('../../../../helper/models')

const getCommentOnActivity = async (req, res) => {
  const queryString = req.query;
  let limit = 10;
  let skip = queryString.skip ? parseInt(queryString.skip) : 0;
  let matchCondition = {};
  let organization_id = {};
  let workspace_id = {};
  let organizations_ids = [];
  let workspace_ids = [];
  let user_ids = [];
  let user_admin_workspace = []
  let follow;

  let userFollowOrganizations = await userUtils.findUser({ _id: req.userInfo._id}, { organizationOrder:1, _id: 0 });
  userFollowOrganizations = userFollowOrganizations.organizationOrder
  let userAdminWorkspaces = await workspaceUtils.findWorkspaceRoles({ user_id: req.userInfo._id, role:"admin" }, { workspace_id: 1 })
  for (let i = 0; i < userAdminWorkspaces.length; i++) {
    user_admin_workspace.push(String(userAdminWorkspaces[i].workspace_id));
  }

  if (req.query.user_id && !_.isEmpty(req.query.user_id)) {
    user_ids = [req.query.user_id];
    follow = await marketUtils.findOneFollow({ user_id: ObjectID(req.userInfo._id), following: ObjectID(req.query.user_id), followType: "people" }, { following: 1 })
  } else if ((_.isEmpty(req.query.organization_id)) && (_.isEmpty(req.query.workspace_id))) {
    //  user_ids = [req.userInfo._id];
    follow = await marketUtils.findAllFollow({ user_id: req.userInfo._id, followType: "organization" }, { organization_id: 1 })
    for (let i = 0; i < follow.length; i++) {
      organizations_ids.push(ObjectID(follow[i].organization_id));
    }
    let userlist = await marketUtils.findAllFollow({ user_id: req.userInfo._id, followType: "people" }, { following: 1 });
    for (let i = 0; i < userlist.length; i++) {
      user_ids.push(ObjectID(userlist[i].following));
    }
    let org = await organizationUtils.findOrganizationRoles({ user_id: { $in: user_ids } }, { organization_id: 1 })
    for (let i = 0; i < org.length; i++) {
      organizations_ids.push(ObjectID(org[i].organization_id));
    }
    organizations_ids = organizations_ids.filter(value => userFollowOrganizations.includes(value));
    organizations_ids = _.uniqWith(organizations_ids, _.isEqual);
    let roles = await workspaceUtils.findWorkspaceRoles({ user_id: req.userInfo._id }, { workspace_id: 1 })
    for (let i = 0; i < roles.length; i++) {
      workspace_ids.push(ObjectID(roles[i].workspace_id));
    }
  } else {
    let userlist = await marketUtils.findAllFollow({ user_id: req.userInfo._id, followType: "people" }, { following: 1 });
    for (let i = 0; i < userlist.length; i++) {
      user_ids.push(ObjectID(userlist[i].following));
    }
  }

  // }
  if (req.query.user_id) {
    if (req.query.user_id.toString() == req.userInfo._id.toString()) {
      matchCondition = {
        $and: [
          {
            'user_id': ObjectID(req.query.user_id)
          }
          , {
            'activity_type': {
              $in: ['comment', 'activity']
            }
          }, {
            'activity_sub_type': {
              $in: ['CREATED_ORGANIZATION', 'CREATED_POST', 'SHARED_POST', 'CREATED_RECORD', 'CREATED_WORKSPACE']
            },
          }]
      };
    } else {

      if (follow && !_.isEmpty(follow)) {
        let mainOrg = await organizationUtils.findOrganizations({ owner: ObjectID(req.query.user_id) }, { _id: 1 })
        let orgs = [];
        let filteredArray = mainOrg.filter(value => userFollowOrganizations.includes(value.id));
        for (let i = 0; i < filteredArray.length; i++) {
          orgs.push(ObjectID(filteredArray[i].id));
        }
        let final_org = [];
        let followOrg = await marketUtils.findAllFollow({ user_id: ObjectID(req.userInfo._id), organization_id: { $in: orgs }, followType: "organization" }, { organization_id: 1 })
        for (let i = 0; i < followOrg.length; i++) {
          final_org.push(ObjectID(followOrg[i].organization_id));
        }
        final_org = _.uniqWith(final_org, _.isEqual);
        if (final_org && !_.isEmpty(final_org)) {
          matchCondition = {
            $or: [
              {
                $and: [
                  {
                    'organization_id': { $in: final_org }
                  }
                  , {
                    'activity_type': {
                      $in: ['comment', 'activity']
                    }
                  }, {
                    'activity_sub_type': {
                      $in: ['CREATED_ORGANIZATION', 'CREATED_POST', 'SHARED_POST', 'CREATED_RECORD', 'CREATED_WORKSPACE']
                    },
                  }]
              },
              {
                $and: [
                  {
                    'user_id': ObjectID(req.query.user_id)
                  }
                  , {
                    'activity_type': {
                      $in: ['comment', 'activity']
                    }
                  }, {
                    'activity_sub_type': {
                      $in: ['CREATED_POST', 'SHARED_POST']
                    },
                  }]
              }
            ]
          }
        } else {
          matchCondition = {
            $and: [
              {
                'user_id': ObjectID(req.query.user_id)
              }
              , {
                'activity_type': {
                  $in: ['comment', 'activity']
                }
              }, {
                'activity_sub_type': {
                  $in: ['SHARED_POST', 'CREATED_POST']
                },
              }]
          };
        }

      } else {
        matchCondition = {
          $and: [
            {
              'user_id': ObjectID(req.query.user_id)
            }
            , {
              'activity_type': {
                $in: ['comment', 'activity']
              }
            }, {
              'activity_sub_type': {
                $in: ['CREATED_POST', 'SHARED_POST']
              },
            }]
        };
      }
    }

  } else
    if ((_.isEmpty(req.query.organization_id)) && (_.isEmpty(req.query.workspace_id))) {

      // matchCondition = {
      //   $and: [{
      //     $or: [
      //       {
      //         'organization_id': { $in: organizations_ids }
      //       }
      //       , {
      //         'workspace_id': { $in: workspace_ids }
      //       }, {
      //         'user_id': { $in: user_ids }
      //       }
      //     ]
      //   }
      //     , {
      //     'activity_type': {
      //       $in: ['comment', 'activity']
      //     }
      //   }, {
      //     'activity_sub_type': {
      //       $in: ['CREATED_ORGANIZATION', 'CREATED_POST', 'SHARED_POST', 'CREATED_RECORD', 'CREATED_WORKSPACE']
      //     },
      //   }]
      // };
      matchCondition = {
        $or: [
          {
            $and: [
              {
                'user_id': ObjectID(req.userInfo._id)
              }
              , {
                'activity_type': {
                  $in: ['comment', 'activity']
                }
              }, {
                'activity_sub_type': {
                  $in: ['CREATED_ORGANIZATION', 'CREATED_POST', 'SHARED_POST', 'CREATED_RECORD', 'CREATED_WORKSPACE']
                 //  $in: ['CREATED_POST', 'SHARED_POST']
                },
              }]
          }, {
            $and: [
              {
                'user_id': { $in: user_ids }
              }
              , {
                'activity_type': {
                  $in: ['comment', 'activity']
                }
              }, {
                'activity_sub_type': {
                  $in: ['CREATED_POST', 'SHARED_POST']
                },
              }]
          },
          {
            $and: [{
              $or: [
                {
                  'organization_id': { $in: organizations_ids }
                }
                , {
                  'workspace_id': { $in: workspace_ids }
                }
              ]
            }
              , {
              'activity_type': {
                $in: ['comment', 'activity']
              }
            }, {
              'activity_sub_type': {
                $in: ['CREATED_ORGANIZATION', 'CREATED_POST', 'SHARED_POST', 'CREATED_RECORD', 'CREATED_WORKSPACE']
              },
            }]
          }]
      }
    } else
      if ((!_.isEmpty(req.query.workspace_id))) {
        workspace_id = ObjectID(req.query.workspace_id);
        // matchCondition = {
        //   $and: [
        //     {
        //       'workspace_id': workspace_id
        //     }, {
        //       'activity_type': {
        //         $in: ['comment', 'activity']
        //       }
        //     },
        //     {
        //       'activity_sub_type': {
        //         $in: ['CREATED_POST', 'SHARED_POST', 'CREATED_RECORD', 'CREATED_WORKSPACE']
        //       },
        //     }
        //   ]
        // };
        matchCondition = {
          $or: [
            {
              $and: [
                // {
                // $or: [
                {
                  'user_id': ObjectID(req.userInfo._id)
                },
                {
                  'workspace_id': workspace_id
                }
                //   ]
                // }
                , {
                  'activity_type': {
                    $in: ['comment', 'activity']
                  }
                }, {
                  'activity_sub_type': {
                    $in: ['CREATED_POST', 'SHARED_POST', 'CREATED_RECORD', 'CREATED_WORKSPACE']
                  },
                }]
            }, {
              $and: [
                {
                  'user_id': !_.isEmpty(user_ids) ? { $in: user_ids } : { $ne: null }
                },
                {
                  'workspace_id': workspace_id
                }

                , {
                  'activity_type': {
                    $in: ['comment', 'activity']
                  }
                }, {
                  'activity_sub_type': {
                    $in: ['CREATED_POST', 'SHARED_POST', 'CREATED_RECORD', 'CREATED_WORKSPACE']
                  },
                }]
            }]
        }
      } else if (req.query.organization_id && !_.isEmpty(req.query.organization_id)) {
        organization_id = ObjectID(req.query.organization_id);
        // matchCondition = {
        //   $and: [{
        //     'organization_id': organization_id
        //   }, {
        //     'activity_type': {
        //       $in: ['activity']
        //     }
        //   }, {
        //     'activity_sub_type': {
        //       $in: ['CREATED_ORGANIZATION', 'CREATED_POST', 'SHARED_POST', 'CREATED_RECORD', 'CREATED_WORKSPACE']
        //     },
        //   }]
        // };
        matchCondition = {
          $or: [
            {
              $and: [
                // {
                // $or: [
                {
                  'user_id': ObjectID(req.userInfo._id)
                },
                {
                  'organization_id': organization_id
                }
                //   ]
                // }
                , {
                  'activity_type': {
                    $in: ['comment', 'activity']
                  }
                }, {
                  'activity_sub_type': {
                    $in: ['CREATED_POST', 'CREATED_ORGANIZATION', 'SHARED_POST', 'CREATED_RECORD', 'CREATED_WORKSPACE']
                  },
                }]
            }, {
              $and: [
                {
                  'user_id': !_.isEmpty(user_ids) ? { $in: user_ids } : { $ne: null }
                },
                {
                  'organization_id': organization_id
                }
                , {
                  'activity_type': {
                    $in: ['comment', 'activity']
                  }
                }, {
                  'activity_sub_type': {
                    $in: ['CREATED_POST', 'SHARED_POST', 'CREATED_RECORD', 'CREATED_WORKSPACE']
                  },
                }]
            }]
        }
      }
      else {
        workspace_id = null;
        matchCondition = {
          $and: [{
            'organization_id': null
          }, {
            'workspace_id': null
          }, {
            'activity_type': {
              $in: ['comment', 'activity']
            },
          }, {
            'activity_sub_type': {
              $in: ['CREATED_POST', 'SHARED_POST']
            },
          }]
        };
      }
  mainActivities.aggregate([
    { $match: matchCondition },
    { "$sort": { 'updatedAt': -1 } },
    { $group: { _id: null, total: { $sum: 1 } } },
  ]).exec(async (err, total) => {
    console.log(total);
    const totalRecord = !_.isEmpty(total) ? total[0].total : 0;
    mainActivities.aggregate([{
      $match: matchCondition
    },
    {
      $sort: { updatedAt: -1 }
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
        updatedAt: 1,
        comment: 1,
        avatar: 1,
        comment_rich_link: 1,
        user: {
          name: { $concat: ['$user.firstName', ' ', '$user.lastName'] },
          _id: '$user._id',
          avatar: '$user.avatar',
          position: '$user.position',
          email: '$user.email',
          businessName: { $arrayElemAt: ['$business.businessName', 0] },
          orgName: "",
          orgId: ""
        },
      }
    },
    {
      $sort: { updatedAt: -1 }
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
        updatedAt: 1,
        user: 1,
        workspaceName: "$workspace.name",
        invited_user: {
          'name': { '$concat': ["$Invited_user.firstName", " ", "$Invited_user.lastName"] },
          '_id': '$Invited_user._id',
          'avatar': '$Invited_user.avatar',
          //'createdAt': '$Invited_user.createdAt'
          'updatedAt': '$Invited_user.updatedAt'
        },
      }
    },
    {
      $sort: { updatedAt: -1 }
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
          },
{
      $sort: { updatedAt: -1 }
    }],
        as: 'wsRole'
      }
    },
    {
      $project: {
        _id: 1,
        user_id: 1,
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
        updatedAt: 1,
        user: 1,
        workspaceName: 1,
        workspaceRole: { $arrayElemAt: ['$wsRole.role', 0] },
        invited_user: 1
      }
    },
    {
      $sort: { updatedAt: -1 }
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
        organization_id: 1,
        workspace_id: 1,
        application_id: 1,
        post_id: 1,
        avatar: 1,
        comment_rich_link: 1,
        invited_user_id: 1,
        activity_id: 1,
        record_id: 1,
        comment: 1,
        activity_text: 1,
        activity_type: 1,
        activity_sub_type: 1,
        uniqueId: 1,
        createdAt: 1,
        updatedAt: 1,
        user: 1,
        workspaceName: 1,
        workspaceRole: 1,
        organizationName: "$organization.name",
        invited_user: 1
      }
    },
    {
      $sort: { updatedAt: -1 }
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
          },
          {
            $sort: { updatedAt: -1 }
       }],
        as: 'orgRole'
      }
    },
    {
      $project: {
        _id: 1,
        user_id: 1,
        organization_id: 1,
        workspace_id: 1,
        application_id: 1,
        post_id: 1,
        avatar: 1,
        comment_rich_link: 1,
        invited_user_id: 1,
        activity_id: 1,
        record_id: 1,
        comment: 1,
        activity_text: 1,
        activity_type: 1,
        activity_sub_type: 1,
        uniqueId: 1,
        createdAt: 1,
        updatedAt: 1,
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
        user_id: 1,
        organization_id: 1,
        workspace_id: 1,
        application_id: 1,
        avatar: 1,
        comment_rich_link: 1,
        post_id: 1,
        invited_user_id: 1,
        activity_id: 1,
        record_id: 1,
        comment: 1,
        activity_text: 1,
        activity_type: 1,
        activity_sub_type: 1,
        uniqueId: 1,
        createdAt: 1,
        updatedAt: 1,
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
      $sort: { updatedAt: -1 }
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
        updatedAt: 1,
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
      $sort: { updatedAt: -1 }
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
      $lookup: {
        from: 'shareactivities',
        localField: '_id',
        foreignField: 'activity_id',
        as: 'shareCount'
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
          },
{
      $sort: { updatedAt: -1 }
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
          },
{
      $sort: { updatedAt: -1 }
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
          },
{
      $sort: { updatedAt: -1 }
    }],
        as: 'shareBusiness'
      }
    },
    {
      $project: {
        _id: 1,
        user_id: 1,
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
        updatedAt: 1,
        user: 1,
        workspaceName: 1,
        workspaceRole: 1,
        organizationName: 1,
        organizationRole: 1,
        recordsCells: 1,
        cell: 1,
        fields: 1,
        fieldsType: 1,
        invited_user: 1,
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
              //createdAt: '$$shareData.createdAt'
              updatedAt:'$$shareData.updatedAt'
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
        updatedAt: 1,
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
      $lookup: {
        from: 'likes',
        localField: '_id',
        foreignField: 'activity_id',
        as: 'activityLikes'
      }
    },
    {
      $project: {
        _id: 1,
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
        updatedAt: 1,
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
        applicationName: 1,
        ActivityLikes: '$activityLikes.user_id',
        //   ActivityComments: 1,
        task: 1,
        invited_user: 1,

      }
    },
    {
      $lookup: {
        from: 'applicationcomments',
        let: { org: '$_id', record: '$record_id' },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ['$activity_id', '$$org'] },
                  { $eq: ['$record_id', '$$record'] }
                ]
              }
            }
          }],
        as: 'ActivityComments'
      }
    },
    {
      $project: {
        _id: 1,
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
        updatedAt: 1,
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
        applicationName: 1,
        ActivityLikes: 1,
        ActivityComments: 1,
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
    { $skip: skip },
    { $limit: 10 },
    {
      "$lookup": {
        "from": "subactivities",
        "let": { "id": "$_id" },
        "pipeline": [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ['$main_activity_id', '$$id'] }
                ]
              }
            }
          },
          { "$sort": { 'updatedAt': -1 } },
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
              uniqueId: {
                $cond: { if: { $eq: ['$uniqueId', ""] }, then: '$_id', else: '$uniqueId' }
              },
              activity_id: 1,
              main_activity_id: 1,
              user_id: 1,
              organization_id: 1,
              workspace_id: 1,
              application_id: 1,
              record_id: 1,
              post_id: 1,
              invited_user_id: 1,
              comment: 1,
              avatar: 1,
              comment_rich_link: 1,
              activity_text: 1,
              activity_type: 1,
              activity_sub_type: 1,
              createdAt: 1,
              updatedAt: 1,
              recordsCells: "$recordsCells.cells",
            }
          },
          {
            $group: {
              _id: '$uniqueId',
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
              //createdAt: { $first: "$createdAt" },
              updatedAt: { $first: "$updatedAt" },
              invited_user: { $first: "$invited_user" },
              recordsCells: { $first: '$recordsCells' },
            },
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
                      recordsCells: { $ne: null }
                    },
                  ]
                },
                {
                  activity_sub_type: { $ne: "CREATED_RECORD" }
                }
              ]
            }
          },
          { "$sort": { 'updatedAt': -1 } },
          { "$limit": 4 }
        ],
        "as": "subActivity",
      }
    },
    {
      $unwind: {
        preserveNullAndEmptyArrays: true,
        path: '$subActivity'
      }
    },
    //     {
    //         $lookup:
    //         {
    //           from: "users",
    //           localField: "subActivity.user_id",
    //           foreignField: "_id",
    //           as: "subActivity.userData"
    //         }
    //       }
    {
      $lookup: {
        from: 'users',
        let: { user_id: '$subActivity.user_id' },
        pipeline: [
          {
            $match:
            {
              $expr:
              {
                $eq: ['$_id', '$$user_id']
              }
            }
          },
          {
            $project: {
              firstName: 1,
              lastName: 1,
              email: 1,
              avatar: 1
            }
          }
        ],
        as: 'subActivity.user'
      }
    },
    {
      $lookup: {
        from: 'organizations',
        let: { organization_id: '$subActivity.organization_id' },
        pipeline: [
          {
            $match:
            {
              $expr:
              {
                $eq: ['$_id', '$$organization_id']
              }
            }
          },
          {
            $project: {
              name: 1
            }
          }
        ],
        as: 'subActivity.orgName'
      }
    },
    {
      $lookup: {
        from: 'workspaces',
        let: { workspace_id: '$subActivity.workspace_id' },
        pipeline: [
          {
            $match:
            {
              $expr:
              {
                $eq: ['$_id', '$$workspace_id']
              }
            }
          },
          {
            $project: {
              name: 1
            }
          }
        ],
        as: 'subActivity.wsName'
      }
    }, {
      $lookup: {
        from: 'applications',
        let: { application_id: '$subActivity.application_id' },
        pipeline: [
          {
            $match:
            {
              $expr:
              {
                $eq: ['$_id', '$$application_id']
              }
            }
          },
          {
            $project: {
              name: 1
            }
          }
        ],
        as: 'subActivity.appName'
      }
    }, {
      $lookup: {
        from: 'records',
        localField: 'subActivity.record_id',
        foreignField: '_id',
        as: 'subActivity.recordsCells'
      }
    },
    {
      $unwind: {
        preserveNullAndEmptyArrays: true,
        path: '$subActivity.recordsCells'
      }
    },
    {
      $lookup: {
        from: 'fields',
        localField: 'subActivity.application_id',
        foreignField: 'application_id',
        as: 'subActivity.fieldType'
      }
    },
    {
      $lookup: {
        from: 'users',
        localField: 'subActivity.invited_user_id',
        foreignField: '_id',
        as: 'subActivity.Invited_user'
      },
    },
    {
      $project: {
        _id: 1,
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
        updatedAt: 1,
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
        applicationName: 1,
        ActivityLikes: 1,
        ActivityComments: 1,
        task: 1,
        invited_user: 1,
        'subActivity._id': 1,
        'subActivity.main_activity_id': 1,
        'subActivity.user_id': 1,
        'subActivity.invited_user_id': 1,
        'subActivity.organization_id': 1,
        'subActivity.workspace_id': 1,
        'subActivity.application_id': 1,
        'subActivity.avatar': 1,
        'subActivity.comment_rich_link': 1,
        'subActivity.post_id': 1,
        'subActivity.invited_user_id': 1,
        'subActivity.activity_id': 1,
        'subActivity.record_id': 1,
        'subActivity.comment': 1,
        'subActivity.activity_text': 1,
        'subActivity.activity_type': 1,
        'subActivity.activity_sub_type': 1,
        'subActivity.uniqueId': 1,
        'subActivity.createdAt': 1,
        'subActivity.updatedAt': 1,
        'subActivity.user': { $arrayElemAt: ['$subActivity.user', 0] },
        'subActivity.workspaceName': {
          "$ifNull": [{ "$arrayElemAt": ['$subActivity.wsName.name', 0] }, ""]
        },
        'subActivity.workspaceRole': 1,
        'subActivity.organizationName': {
          "$ifNull": [{ "$arrayElemAt": ['$subActivity.orgName.name', 0] }, ""]
        },
        'subActivity.applicationName': {
          "$ifNull": [{ "$arrayElemAt": ['$subActivity.appName.name', 0] }, ""]
        },
        'subActivity.invited_user': 1,
        'subActivity.organizationRole': 1,
        'subActivity.recordsCells': "$subActivity.recordsCells.cells",
        'subActivity.fields': "$subActivity.fieldType._id",
        'subActivity.fieldsType': '$subActivity.fieldType.type',
        'subActivity.invited_user': {
          'firstName': { $arrayElemAt: ['$subActivity.Invited_user.firstName', 0] },
          'lastName': { $arrayElemAt: ['$subActivity.Invited_user.lastName', 0] },
          '_id': { $arrayElemAt: ['$subActivity.Invited_user._id', 0] },
          'avatar': { $arrayElemAt: ['$subActivity.Invited_user.avatar', 0] },
        },
      }
    },
    {
      $group: {
        _id: "$_id",
        user_id: { $first: '$user_id' },
        organization_id: { $first: '$organization_id' },
        workspace_id: { $first: '$workspace_id' },
        application_id: { $first: '$application_id' },
        post_id: { $first: '$post_id' },
        invited_user_id: { $first: '$invited_user_id' },
        activity_id: { $first: '$activity_id' },
        record_id: { $first: '$record_id' },
        comment: { $first: '$comment' },
        avatar: { $first: '$avatar' },
        comment_rich_link: { $first: '$comment_rich_link' },
        activity_text: { $first: '$activity_text' },
        activity_type: { $first: '$activity_type' },
        activity_sub_type: { $first: '$activity_sub_type' },
        uniqueId: { $first: '$uniqueId' },
        //createdAt: { $first: '$createdAt' },
        updatedAt: { $first: '$updatedAt' },
        user: { $first: '$user' },
        organizationName: { $first: '$organizationName' },
        workspaceName: { $first: '$workspaceName' },
        workspaceRole: { $first: '$workspaceRole' },
        invited_user: { $first: '$invited_user' },
        applicationName: { $first: '$applicationName' },
        organizationRole: { $first: '$organizationRole' },
        recordsCells: { $first: '$recordsCells' },
        fields: { $first: '$fields' },
        fieldsType: { $first: '$fieldsType' },
        cell: { $first: '$cell' },
        shareData: { $first: '$shareData' },
        shareUser: { $first: '$shareUser' },
        shareCount: { $first: '$shareCount' },
        ActivityLikes: { $first: '$ActivityLikes' },
        ActivityComments: { $first: '$ActivityComments' },
        task: { $first: '$task' },
        ActivityLikes: { $first: '$ActivityLikes' },
        subActivity: { $push: '$subActivity' }
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
      if (activities && activities.length) {
        await Promise.all(_.map(activities, async (activity) => {

          // console.log('activityactivity',activity)

          if(req.userInfo._id){

            if(activity.organization_id && req.query.organization_id){

              const orgsRole = await OrganizationRoleModel.findOne({ user_id: req.userInfo._id, organization_id: activity.organization_id }, { role: 1, _id: 0 }).then(function(data) {
                // console.log('orgsRoleorgsRole Data',data);
                if(data){
                  return true
                }
                else{
                  return false
                }
              });
              if(!orgsRole){
                return false
              }
              // console.log('orgsRoleorgsRole',orgsRole)
            }
           
            if(activity.workspace_id && req.query.workspace_id){

              const wsRole = await WorkspaceRoleModel.findOne({ user_id: req.userInfo._id, workspace_id: activity.workspace_id }, { role: 1, _id: 0 }).then(function(data) {
                // console.log('wsRolewsRolewsRole Data',data);
                if(data){
                  return true
                }
                else{
                  return false
                }
              });
              if(!wsRole){
                return false
              }
              // console.log('wsRolewsRolewsRole',wsRole)
            }
            // console.log('activity.workspace_idactivity.workspace_id',activity.workspace_id)
          }

          if (activity.activity_type === 'activity' || activity.activity_type === 'comment') {

            if (activity.user.businessName && !_.isEmpty(activity.user.businessName)) {
              let domain = activity.user.email.substring(activity.user.email.lastIndexOf("@") + 1);
              const org = await organizationUtils.findOrganization({ domain: domain }, { name: 1 });
              if(org){
                activity.user.orgName = org.name;
                activity.user.orgId = org._id;
              }
            }

            let subCount = await subActivities
              .aggregate
              ([{
                $match: {
                  $and: [{
                    main_activity_id: ObjectID(activity._id)
                  }, {
                    'activity_type': {
                      $in: ['comment', 'activity']
                    }
                  }, {
                    'activity_sub_type': {
                      $in: ['LIKED_POST', 'UPDATED_WORKSPACE', 'TASK_CREATED', 'CREATED_APP', 'UPDATED_APP', 'CREATED_RECORD', 'COMMENTED_ON', 'COMMENTED_ON_APPLICATION', 'INVITED_USER', 'CREATED_WORKSPACE', 'UPDATED_RECORD']
                    },
                  }
                  ],
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
                  uniqueId: {

                    $cond: { if: { $eq: ['$uniqueId', ""] }, then: '$_id', else: '$uniqueId' }
                  },
                  recordsCells: "$recordsCells.cells",
                  activity_sub_type: '$activity_sub_type'
                }
              },
              {
                $group: {
                  _id: '$uniqueId',
                  recordsCells: { $first: '$recordsCells' },
                  activity_sub_type: { $first: '$activity_sub_type' }
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
                          recordsCells: { $ne: null }
                        },
                      ]
                    },
                    {
                      activity_sub_type: { $ne: "CREATED_RECORD" }
                    }
                  ]
                }
              }
              ])
            // .countDocuments({
            //   $and: [{
            //     main_activity_id: ObjectID(activity._id)
            //   }, {
            //     'activity_type': {
            //       $in: ['comment', 'activity']
            //     }
            //   }, {
            //     'activity_sub_type': {
            //       $in: ['LIKED_POST', 'UPDATED_WORKSPACE', 'TASK_CREATED', 'CREATED_APP', 'UPDATED_APP', 'CREATED_RECORD', 'COMMENTED_ON', 'COMMENTED_ON_APPLICATION', 'INVITED_USER', 'CREATED_WORKSPACE', 'UPDATED_RECORD']
            //     },
            //   }]
            // }
            // )

            activity.subActivityTotal = subCount && !_.isEmpty(subCount) ? subCount.length : 0;
            let userName = '';
            let applicationName = '';
            let workspaceName = '';
            let organizationName = '';
            userName = activity.user.name ? activity.user.name : null;
            workspaceName = activity.workspaceName ? activity.workspaceName : null;
            organizationName = activity.organizationName ? activity.organizationName : null;
            applicationName = activity.applicationName ? activity.applicationName : null;

            if (activity.activity_sub_type === activity_type.createdOrganization) {

              activity.activity_text = activity.activity_text.replace('[user-name]', userName);
              activity.activity_text = activity.activity_text.replace('[substance-name]', organizationName);

              getCreatedAtDateForLatestSorting = '';
              let parentWorkspace = activity;
              parentWorkspace.ActivityComments = _.filter(parentWorkspace.ActivityComments, { parentId: null })
              parentWorkspace.ActivityComments = _.orderBy(parentWorkspace.ActivityComments, ['updatedAt'], ['desc']);
              parentWorkspace.ActivityCommentsTotal = parentWorkspace.ActivityComments.length;
              parentWorkspace.ActivityComments = _.take(_.drop(parentWorkspace.ActivityComments, 0), 3);

              if (parentWorkspace.ActivityComments.length > 0) {
                let detail = await getDetail(parentWorkspace.ActivityComments[0].activity_id, parentWorkspace.ActivityComments[0].record_id);
                parentWorkspace.ActivityComments = detail
              }
              if (parentWorkspace.ActivityComments && parentWorkspace.ActivityComments.length) {
                const maxDateObjOfComment = _.maxBy(activity.ActivityComments, 'updatedAt');
                if (maxDateObjOfComment && maxDateObjOfComment !== undefined) {
                  activity['latestAnyUpdates'] = maxDateObjOfComment.updatedAt;
                } else {
                  activity['latestAnyUpdates'] = activity.updatedAt;
                }

                let data = await getComment(parentWorkspace)
                parentWorkspace.ActivityComments = data.results;
                userIds = _.concat(userIds, data.userId)
              }
              parentWorkspace.latestAnyUpdates = !getCreatedAtDateForLatestSorting ? new Date(parentWorkspace.updatedAt) : getCreatedAtDateForLatestSorting;
              getCreatedAtDateForLatestSorting = parentWorkspace.latestAnyUpdates;
              allParentActivity.push(parentWorkspace);
            } else if (activity.activity_sub_type === activity_type.createdWorkspace) {
              getCreatedAtDateForLatestSorting = '';
              activity.activity_text = activity.activity_text.replace('[user-name]', userName);
              activity.activity_text = activity.activity_text.replace('[substance-name]', workspaceName);

              let parentWorkspace = activity;
              let hrefLink = '';
              if (!_.isEmpty(parentWorkspace.workspace)) {
                if (parentWorkspace.organization && parentWorkspace.organization !== undefined && parentWorkspace.workspace && parentWorkspace.workspace !== undefined) {
                  hrefLink = parentWorkspace.organization.shortid + '/' + parentWorkspace.organization.slug + '/' +
                    parentWorkspace.workspace._id.toString() + '/' + parentWorkspace.workspaceName + '/home/' + parentWorkspace.organization._id.toString();
                }
              }

              parentWorkspace.ActivityComments = _.filter(parentWorkspace.ActivityComments, { parentId: null })

              parentWorkspace.ActivityComments = _.orderBy(parentWorkspace.ActivityComments, ['updatedAt'], ['desc']);
              parentWorkspace.ActivityCommentsTotal = parentWorkspace.ActivityComments.length;
              parentWorkspace.ActivityComments = _.take(_.drop(parentWorkspace.ActivityComments, 0), 3);

              if (parentWorkspace.ActivityComments.length > 0) {
                let detail = await getDetail(parentWorkspace.ActivityComments[0].activity_id, parentWorkspace.ActivityComments[0].record_id);
                parentWorkspace.ActivityComments = detail
              }
              if (parentWorkspace.ActivityComments && parentWorkspace.ActivityComments.length) {
                const maxDateObjOfComment = _.maxBy(activity.ActivityComments, 'updatedAt');
                if (maxDateObjOfComment && maxDateObjOfComment !== undefined) {
                  activity['latestAnyUpdates'] = maxDateObjOfComment.updatedAt;
                } else {
                  activity['latestAnyUpdates'] = activity.updatedAt;
                }

                let data = await getComment(parentWorkspace)
                parentWorkspace.ActivityComments = data.results;
                userIds = _.concat(userIds, data.userId)
              }
              parentWorkspace.latestAnyUpdates = !getCreatedAtDateForLatestSorting ? new Date(parentWorkspace.updatedAt) : getCreatedAtDateForLatestSorting;
              getCreatedAtDateForLatestSorting = parentWorkspace.latestAnyUpdates;
              allParentActivity.push(parentWorkspace);
            }
            else if (activity.activity_sub_type === activity_type.createdPost) {

              getCreatedAtDateForLatestSorting = '';
              //  userName = activity.user.name ? activity.user.name : null;
              activity.activity_text = activity.activity_text.replace('[user-name]', userName);
              let appendSubActivity = activity;
              // eslint-disable-next-line no-useless-escape
              let regex = /\{\{[^\}]*\}\}/g;
              if (activity.comment && !_.isEmpty(activity.comment)) {
                activity.comment_for_update = activity.comment;
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
              appendSubActivity.ActivityComments = _.filter(appendSubActivity.ActivityComments, { parentId: null })
              appendSubActivity.ActivityComments = _.orderBy(appendSubActivity.ActivityComments, ['updatedAt'], ['desc']);
              appendSubActivity.ActivityCommentsTotal = appendSubActivity.ActivityComments.length;
              appendSubActivity.ActivityComments = _.take(_.drop(appendSubActivity.ActivityComments, 0), 3);
              if (appendSubActivity.ActivityComments.length > 0) {
                let detail = await getDetail(appendSubActivity.ActivityComments[0].activity_id, appendSubActivity.ActivityComments[0].record_id);
                appendSubActivity.ActivityComments = detail
              }
              if (appendSubActivity.ActivityComments && appendSubActivity.ActivityComments.length) {
                const maxDateObjOfComment = _.maxBy(activity.ActivityComments, 'updatedAt');
                if (maxDateObjOfComment && maxDateObjOfComment !== undefined) {
                  activity['latestAnyUpdates'] = maxDateObjOfComment.updatedAt;
                } else {
                  activity['latestAnyUpdates'] = activity.updatedAt;
                }
                let data = await getComment(appendSubActivity)
                appendSubActivity.ActivityComments = data.results;
                userIds = _.concat(userIds, data.userId)

              }

              appendSubActivity.latestAnyUpdates = !getCreatedAtDateForLatestSorting ? new Date(appendSubActivity.updatedAt) : getCreatedAtDateForLatestSorting;
              getCreatedAtDateForLatestSorting = appendSubActivity.latestAnyUpdates;
              allParentActivity.push(appendSubActivity);
            }
            else if (activity.activity_sub_type === activity_type.sharedPost) {

              getCreatedAtDateForLatestSorting = '';
              //userName = activity.user.name ? activity.user.name : null;
              activity.activity_text = activity.activity_text.replace('[user-name]', userName);
              let appendSubActivity = activity;
              // eslint-disable-next-line no-useless-escape
              let regex = /\{\{[^\}]*\}\}/g;
              if (activity.comment && !_.isEmpty(activity.comment)) {
                activity.comment_for_update = activity.comment;
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
              if (activity.shareData && activity.shareData.comment && !_.isEmpty(activity.shareData.comment)) {
                activity.shareData.comment_for_update = activity.shareData.comment;
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
              appendSubActivity.ActivityComments = _.filter(appendSubActivity.ActivityComments, { parentId: null })
              appendSubActivity.ActivityComments = _.orderBy(appendSubActivity.ActivityComments, ['updatedAt'], ['desc']);
              appendSubActivity.ActivityCommentsTotal = appendSubActivity.ActivityComments.length;
              appendSubActivity.ActivityComments = _.take(_.drop(appendSubActivity.ActivityComments, 0), 3);
              if (appendSubActivity.ActivityComments.length > 0) {
                let detail = await getDetail(appendSubActivity.ActivityComments[0].activity_id, appendSubActivity.ActivityComments[0].record_id);
                appendSubActivity.ActivityComments = detail
              }
              if (appendSubActivity.ActivityComments && appendSubActivity.ActivityComments.length) {
                const maxDateObjOfComment = _.maxBy(activity.ActivityComments, 'updatedAt');
                if (maxDateObjOfComment && maxDateObjOfComment !== undefined) {
                  activity['latestAnyUpdates'] = maxDateObjOfComment.updatedAt;
                } else {
                  activity['latestAnyUpdates'] = activity.updatedAt;
                }
                let data = await getComment(appendSubActivity)
                appendSubActivity.ActivityComments = data.results;
                userIds = _.concat(userIds, data.userId)
              }
              appendSubActivity.latestAnyUpdates = !getCreatedAtDateForLatestSorting ? new Date(appendSubActivity.updatedAt) : getCreatedAtDateForLatestSorting;
              getCreatedAtDateForLatestSorting = appendSubActivity.latestAnyUpdates;
              allParentActivity.push(appendSubActivity);
            }
            else if (activity.activity_sub_type === activity_type.createdRecord) {
              getCreatedAtDateForLatestSorting = '';
              // userName = activity.user.name ? activity.user.name : null;
              // applicationName = activity.applicationName ? activity.applicationName : null;
              activity.activity_text = activity.activity_text.replace('[user-name]', userName);
              activity.activity_text = activity.activity_text.replace('[substance-name]', applicationName);
              let appendSubActivity = activity;
              if (appendSubActivity.ActivityComments && appendSubActivity.ActivityComments.length) {
                appendSubActivity.ActivityComments = _.filter(appendSubActivity.ActivityComments, { parentId: null })

                appendSubActivity.ActivityComments = _.orderBy(appendSubActivity.ActivityComments, ['updatedAt'], ['desc']);
                appendSubActivity.ActivityCommentsTotal = appendSubActivity.ActivityComments.length;
                appendSubActivity.ActivityComments = _.take(_.drop(appendSubActivity.ActivityComments, 0), 3);
                if (appendSubActivity.ActivityComments.length > 0) {
                  let detail = await getDetail(appendSubActivity.ActivityComments[0].activity_id, appendSubActivity.ActivityComments[0].record_id);
                  appendSubActivity.ActivityComments = detail
                }
                let data = await getComment(appendSubActivity)
                appendSubActivity.ActivityComments = data.results;
                userIds = _.concat(userIds, data.userId)
              }
              appendSubActivity.latestAnyUpdates = !getCreatedAtDateForLatestSorting ? new Date(appendSubActivity.updatedAt) : getCreatedAtDateForLatestSorting;
              getCreatedAtDateForLatestSorting = appendSubActivity.latestAnyUpdates;
              allParentActivity.push(appendSubActivity);
            }
            if (activity.subActivityTotal > 0) {
              activity.subActivity = activity.subActivity.filter(
                (element) => {
                  if (element._id && !_.isEmpty(element._id)) {
                    return element;
                  }
                }
              );
              await Promise.all(_.map(activity.subActivity, async (subActivityData, keyIndex) => {

                let subuserName = '';
                let subapplicationName = '';
                let subworkspaceName = '';
                let suborganizationName = '';
                subuserName = subActivityData.user.firstName ? subActivityData.user.firstName + ' ' + subActivityData.user.lastName : null;
                subworkspaceName = subActivityData.workspaceName ? subActivityData.workspaceName : null;
                suborganizationName = subActivityData.organizationName ? subActivityData.organizationName : null;
                subapplicationName = subActivityData.applicationName ? subActivityData.applicationName : null;
                if (subActivityData.activity_sub_type === activity_type.invitedUser) {
                  let invitedUserName = subActivityData.invited_user.firstName ? subActivityData.invited_user.firstName + '' + subActivityData.invited_user.lastName : null;
                  subActivityData.activity_text = subActivityData.activity_text.replace('[user-name]', subuserName);
                  subActivityData.activity_text = subActivityData.activity_text.replace('[invitation-name]', invitedUserName);
                  subActivityData.activity_text = subActivityData.activity_text.replace('[substance-name]', !_.isEmpty(suborganizationName) ? organizationName : workspaceName);
                  let appendSubActivity = activity;

                  if (getCreatedAtDateForLatestSorting < new Date(appendSubActivity.updatedAt)) {
                    getCreatedAtDateForLatestSorting = new Date(appendSubActivity.updatedAt);
                  }

                  //   allSubActivity[activity.main_activity_id].push(appendSubActivity);


                } else if (subActivityData.activity_sub_type === activity_type.updatedApp) {
                  subActivityData.activity_text = subActivityData.activity_text.replace('[user-name]', subuserName);
                  subActivityData.activity_text = subActivityData.activity_text.replace('[substance-name]', subapplicationName);
                  let appendSubActivity = activity;
                  if (getCreatedAtDateForLatestSorting < new Date(appendSubActivity.updatedAt)) {
                    getCreatedAtDateForLatestSorting = new Date(appendSubActivity.updatedAt);
                  }
                  //  allSubActivity[activity.main_activity_id].push(appendSubActivity);
                } else if (subActivityData.activity_sub_type === activity_type.createdApp) {

                  subActivityData.activity_text = subActivityData.activity_text.replace('[user-name]', subuserName);
                  subActivityData.activity_text = subActivityData.activity_text.replace('[substance-name]', subapplicationName);
                  //  applicationName = subActivityData.applicationName ? subActivityData.applicationName : null;
                  let appendSubActivity = activity;
                  if (getCreatedAtDateForLatestSorting < new Date(appendSubActivity.updatedAt)) {
                    getCreatedAtDateForLatestSorting = new Date(appendSubActivity.updatedAt);
                  }
                  // allSubActivity[activity.main_activity_id].push(appendSubActivity);
                } else if (subActivityData.activity_sub_type === activity_type.createdTask) {
                  //  userName = subActivityData.user.name ? subActivityData.user.name : null;

                  subActivityData.activity_text = subActivityData.activity_text.replace('[user-name]', subuserName);
                  subActivityData.activity_text = subActivityData.activity_text.replace('[substance-name]', subapplicationName);
                  let appendSubActivity = activity;
                  if (getCreatedAtDateForLatestSorting < new Date(appendSubActivity.updatedAt)) {
                    getCreatedAtDateForLatestSorting = new Date(appendSubActivity.updatedAt);
                  }
                  // allSubActivity[activity.main_activity_id].push(appendSubActivity);
                }
                else if (subActivityData.activity_sub_type === activity_type.updatedTask) {
                  //  userName = subActivityData.user.name ? subActivityData.user.name : null;

                  subActivityData.activity_text = subActivityData.activity_text.replace('[user-name]', subuserName);
                  subActivityData.activity_text = subActivityData.activity_text.replace('[substance-name]', subapplicationName);
                  let appendSubActivity = activity;
                  if (getCreatedAtDateForLatestSorting < new Date(appendSubActivity.updatedAt)) {
                    getCreatedAtDateForLatestSorting = new Date(appendSubActivity.updatedAt);
                  }
                  // allSubActivity[activity.main_activity_id].push(appendSubActivity);
                } else if (subActivityData.activity_sub_type === activity_type.updatedWorkspace) {
                  // userName = subActivityData.user.name ? subActivityData.user.name : null;
                  // workspaceName = subActivityData.workspaceName ? subActivityData.workspaceName : null;

                  subActivityData.activity_text = subActivityData.activity_text.replace('[user-name]', subuserName);
                  subActivityData.activity_text = subActivityData.activity_text.replace('[substance-name]', subworkspaceName);
                  let appendSubActivity = activity;
                  if (getCreatedAtDateForLatestSorting < new Date(appendSubActivity.updatedAt)) {
                    getCreatedAtDateForLatestSorting = new Date(appendSubActivity.updatedAt);
                  }
                  //   allSubActivity[activity.main_activity_id].push(appendSubActivity);
                } else if (subActivityData.activity_sub_type === activity_type.commentedOnTask) {
                  // userName = subActivityData.user.name ? subActivityData.user.name : null;
                  subActivityData.activity_text = subActivityData.activity_text.replace('[user-name]', subuserName);
                  let appendSubActivity = activity;
                  if (getCreatedAtDateForLatestSorting < new Date(appendSubActivity.updatedAt)) {
                    getCreatedAtDateForLatestSorting = new Date(appendSubActivity.updatedAt);
                  }
                  //  allSubActivity[activity.main_activity_id].push(appendSubActivity);
                }

                else if (subActivityData.activity_sub_type === activity_type.commentedOnActivity || subActivityData.activity_sub_type === activity_type.commentedOnApp) {

                  // userName = subActivityData.user.name ? subActivityData.user.name : null;
                  subActivityData.activity_text = subActivityData.activity_text.replace('[user-name]', subuserName);
                  let appendSubActivity = activity;
                  if (getCreatedAtDateForLatestSorting < new Date(appendSubActivity.updatedAt)) {
                    getCreatedAtDateForLatestSorting = new Date(appendSubActivity.updatedAt);
                  }
                  //  if (subActivityData.activity_sub_type == 'COMMENTED_ON_APPLICATION') {

                  //              allSubActivity[activity.main_activity_id].push(appendSubActivity);
                  // }
                }
                else if (subActivityData.activity_sub_type === activity_type.likedPost) {

                  // userName = subActivityData.user.name ? subActivityData.user.name : null;
                  subActivityData.activity_text = subActivityData.activity_text.replace('[user-name]', subuserName);
                  let appendSubActivity = activity;
                  if (getCreatedAtDateForLatestSorting < new Date(appendSubActivity.updatedAt)) {
                    getCreatedAtDateForLatestSorting = new Date(appendSubActivity.updatedAt);
                  }
                  //allSubActivity[activity.main_activity_id].push(appendSubActivity);

                } else if (subActivityData.activity_sub_type === activity_type.updatedRecord) {

                  // userName = subActivityData.user.name ? subActivityData.user.name : null;

                  subActivityData.activity_text = subActivityData.activity_text.replace('[user-name]', subuserName);
                  subActivityData.activity_text = subActivityData.activity_text.replace('[substance-name]', subapplicationName);
                  let appendSubActivity = activity;
                  if (getCreatedAtDateForLatestSorting < new Date(appendSubActivity.updatedAt)) {
                    getCreatedAtDateForLatestSorting = new Date(appendSubActivity.updatedAt);
                  }
                  //  allSubActivity[activity.main_activity_id].push(appendSubActivity);
                }
              }));
            }
          }
        }));
      } else {
        activities = [];
      }
      userIds = _.uniqWith(userIds, _.isEqual);
      if (userIds && userIds.length) {
        User.find({ _id: { $in: _.compact(userIds) } }, 'firstName lastName avatar', function (err, users) {
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

              if (allParentActivity[key].ActivityComments && allParentActivity[key].ActivityComments.length) {
                for (let i = 0; i < allParentActivity[key].ActivityComments.length; i++) {
                  allParentActivity[key].ActivityComments[i]['activity_id'] = allParentActivity[key]._id;
                  let getUserPromise = allParentActivity[key].ActivityComments[i].comment.match(regex);
                  if (getUserPromise && getUserPromise.length) {
                    getUserPromise.map(user => {
                      return allParentActivity[key].ActivityComments[i].comment = allParentActivity[key].ActivityComments[i].comment.replace(user, stringUsers[user]);
                    });
                  }
                }
              }
            });
            allParentActivity.forEach(function (element) {
              element.ActivityComments = _.orderBy(element.ActivityComments, ['updatedAt'], ['desc']);

              // if (element.workspace_id && element.workspace_id !== null) {
              //   //element.subActivity = allSubActivity[element.record_id.toString()];

              //   let arr = [];
              //   let itemArr = []
              //   arr = element.subActivity.map(item => {
              //     if (!item.uniqueId) {
              //       return item;
              //     } else if (item.uniqueId && !itemArr.includes(item.uniqueId.toString())) {
              //       itemArr.push(item.uniqueId.toString());
              //       return item;
              //     } else {
              //      // element.subActivityTotal = element.subActivityTotal - 1;
              //       return false;
              //     }
              //   })
              //   arr = _.compact(arr);
              //   element.subActivity = arr;
              // }
            });

            for (let index = 0; index < allParentActivity.length; index++) {
              const parent = allParentActivity[index];
              parent['likesCount'] = !_.isEmpty(parent['ActivityLikes']) ? parent['ActivityLikes'].length : 0;;
              //    delete parent['ActivityLikes'];
              const maxDateObj = _.maxBy(parent.subActivity, 'updatedAt');
              if (maxDateObj && maxDateObj !== undefined) {
                allParentActivity[index]['latestAnyUpdates'] = maxDateObj.updatedAt;
              } else {
                allParentActivity[index]['latestAnyUpdates'] = parent.updatedAt;
              }
              const maxDateObjComment = _.maxBy(parent.ActivityComments, 'updatedAt');
              if (maxDateObjComment && maxDateObjComment !== undefined) {
                allParentActivity[index]['latestAnyUpdates'] = maxDateObjComment.updatedAt;
              }
            }
            allParentActivity = _.orderBy(allParentActivity, ['latestAnyUpdates'], ['desc']);
            let parentData = allParentActivity.filter(function (sub) {
              if (sub.activity_sub_type == 'CREATED_RECORD' && sub.subActivity && sub.subActivity.length > 0) {
                return sub;
              } else if (sub.activity_sub_type !== 'CREATED_RECORD') {
                return sub
              }
            });
            if (parentData.length > 0) {
              // const finalArr = _.take(_.drop(parentData, skip), 10);
              parentData = parentData.filter((i) => {
                if (i.activity_sub_type === "CREATED_WORKSPACE") {
                  return user_admin_workspace.includes(String(i.workspace_id));
                } else {
                  return i;
                }
              });
              const response = commonUtils.genSuccessResponse(resStatusCode.success, req.t('SUCCESS'), { totalRecord: totalRecord, data: parentData });
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
          element.ActivityComments = _.orderBy(element.ActivityComments, ['updatedAt'], ['desc']);

          // if (element.workspace_id && element.workspace_id !== null) {
          //   // element.subActivity = allSubActivity[element.main_activity_id.toString()];
          //   let arr = [];
          //   let itemArr = [];
          //   arr = element.subActivity.map(item => {
          //     if (!item.uniqueId) {
          //       return item;
          //     } else if (item.uniqueId && !itemArr.includes(item.uniqueId.toString())) {
          //       itemArr.push(item.uniqueId.toString());
          //       return item;
          //     } else {
          //     //  element.subActivityTotal = element.subActivityTotal - 1;
          //       return false;
          //     }
          //   })
          //   arr = _.compact(arr);
          //   element.subActivity = arr;
          // }
        });
        for (let index = 0; index < allParentActivity.length; index++) {
          const parent = allParentActivity[index];
          parent['likesCount'] = !_.isEmpty(parent['ActivityLikes']) ? parent['ActivityLikes'].length : 0;
          // delete parent['ActivityLikes'];
          const maxDateObj = _.maxBy(parent.subActivity, 'updatedAt');
          if (maxDateObj && maxDateObj !== undefined) {
            allParentActivity[index]['latestAnyUpdates'] = maxDateObj.updatedAt;
          } else {
            allParentActivity[index]['latestAnyUpdates'] = parent.updatedAt;
          }
        }
        allParentActivity = _.orderBy(allParentActivity, ['latestAnyUpdates'], ['desc']);

        let parentData = allParentActivity.filter(function (sub) {
          if (sub.activity_sub_type == 'CREATED_RECORD' && sub.subActivity && sub.subActivity.length > 0) {
            return sub;
          } else if (sub.activity_sub_type !== 'CREATED_RECORD') {
            return sub
          }
        });
        if (parentData.length > 0) {
          //const finalArr = _.take(_.drop(parentData, skip), 10);
          parentData = parentData.filter((i) => {
            if (i.activity_sub_type === "CREATED_WORKSPACE") {
              return user_admin_workspace.includes(String(i.workspace_id));
            } else {
              return i;
            }
          });
          const response = commonUtils.genSuccessResponse(resStatusCode.success, req.t('SUCCESS'), { totalRecord: totalRecord, data: parentData });
          return res.status(response.statusCode).json(response);
        } else {
          const response = commonUtils.genSuccessResponse(resStatusCode.success, req.t('SUCCESS'));
          return res.status(response.statusCode).json(response);
        }
      }
    });
  })

  async function getComment(appendSubActivity) {
    let results = [];
    let userId = [];
    let regex = /\{\{[^\}]*\}\}/g;
    for (let cKey = 0; cKey < appendSubActivity.ActivityComments.length; cKey++) {
      let item = appendSubActivity.ActivityComments[cKey];
      let userDetail = await userUtils.findUser({ _id: item.user_id }, { firstName: 1, lastName: 1, avatar: 1 })
      let name = "";
      let image = "";;
      if (userDetail && !_.isEmpty(userDetail)) {
        name = userDetail.firstName + ' ' + userDetail.lastName;
        image = userDetail.avatar;
      }
      item.isShow = item._id
      item.username = name;
      item.user_avatar = image;
      let getUserPromise = item.comment.match(regex);
      if (getUserPromise && getUserPromise.length) {
        let refinedUserId = getUserPromise.map(user => {
          return user.replace('{{', '').replace('}}', '');
        });
        if (refinedUserId && refinedUserId.length) {
          userId = _.concat(userId, refinedUserId);
        }
      }
      results.push(item)
    }
    return { results: results, userId: userId };
  }
  async function getDetail(id, record_id) {
    let query = { parentId: null };
    if (record_id == null) {
      query.activity_id = id;
    } else {
      query.record_id = record_id
    }
    return ApplicationComments.aggregate([{
      $match: query
    },
    {
      $graphLookup: {
        from: "applicationcomments",
        startWith: "$_id",
        connectFromField: "_id",
        connectToField: "parentId",
        depthField: "depth",
        as: "children",
        maxDepth: 0,
      }
    },
    { $sort: { updatedAt: -1 } },
    {
      $lookup:
      {
        from: "users",
        localField: "user_id",
        foreignField: "_id",
        as: "user"
      }
    },
    {
      $unwind: {
        preserveNullAndEmptyArrays: true,
        path: '$user'
      }
    },
    {
      $project: {
        _id: 1,
        comment: "$comment",
        image: "$image",
        comment_rich_link: "$comment_rich_link",
        parentId: "$parentId",
        record_id: "$record_id",
        likeUsers: "$likeUsers",
        activity_id: '$activity_id',
        user_id: '$user_id',
        createdAt: '$createdAt',
        updatedAt: '$updatedAt',
        username: { '$concat': ["$user.firstName", " ", "$user.lastName"] },
        user_avatar: "$user.avatar",
        comment_for_update: "$comment",
        totalComments: { $size: "$children" }
      }
    },
    { "$skip": 0 },
    { "$limit": 3 }
    ])
  }
};
module.exports = getCommentOnActivity;