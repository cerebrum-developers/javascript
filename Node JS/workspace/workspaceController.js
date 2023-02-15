
const workspaceUtils = require('./workspaceUtils');
const workspaceValidation = require('./workspaceValidation');
const commonUtils = require('../../../helper/commonUtils');
const { resStatusCode, activity_type } = require('../../../helper/constant');
const mongoose = require('mongoose');
const { ObjectId } = mongoose.Types;
const { WorkspaceRoleModel, WorkspaceModel, WorkspaceSubscriptionModel } = require('../../../helper/models');
const _ = require('lodash');
let organizationUsersList = require("./helper/organization-users");
let userWorkspaces = require("./helper/user-workspaces");
let workspaceList = require("./helper/organization-workspaces");
const userUtils = require('../user/userUtils');
const invitationMail = require('../../../templates/workspace-invitation');
const roleMail = require('../../../templates/workspace-role.html');

let guestInvitation = require("../../../templates/workspace-guest-invitation.js");
const sendNotification = require('../../../helper/send-notification');
let deleteWsHelper = require('./helper/delete-workspace');
const workspaceContoller = {}
const activityTemplate = require('../../../helper/activity');
let Activity = require('../../../helper/logActivity');
const io = require("socket.io-client");
const socketUrl = `${process.env.SOCKET_URL}?authorization=${process.env.ADMIN_TOKEN}`;
let mainActivity = require('../../../helper/mainActivity');
let subActivity = require('../../../helper/subActivity');

const organizationUtils = require('../organization/organizationUtils');

workspaceContoller.addWorkspace = async (req, res) => {
  try {
    let data = req.body;
    data.owner = req.userInfo._id;
    data.fname = req.body.name.split(' ').join('-').toLowerCase();

    if (!req.body.organization_id) {
      const response = await commonUtils.genErrorResponse(resStatusCode.error.badRequest, req.t('REQ_ORG_ID'));
      return res.status(response.statusCode).json(response);
    }

    const orgUserRole = await organizationUtils.findOrganizationRoles({ organization_id: ObjectId(req.body.organization_id), user_id: ObjectId(req.userInfo._id) }, { role: 1 });

    if(orgUserRole.length && orgUserRole[0] && orgUserRole[0].role === 'admin'){
    
      WorkspaceModel.countDocuments({
        'organization_id': req.body.organization_id
      }).then(async (totalWorkspace) => {
        data.displayOrder = totalWorkspace;
        let workspaceData = await workspaceUtils.addWorkspace(data);
  
        if (workspaceData) {
          const workspaceRoleData = {
            user_id: req.userInfo._id,
            email: req.userInfo.email,
            role: 'admin',
            workspace_id: workspaceData._id
          };
          workspaceUtils.addWorkspaceRole(workspaceRoleData);
          let activityText = activityTemplate.addActivityTemplate(req.userInfo.firstName + ' ' + req.userInfo.lastName, workspaceData.name, 'Workspace');
          let logActivityPromise = mainActivity.logMainActivity(req.userInfo._id, workspaceData.organization_id, workspaceData._id, null, null, null, activityText, 'activity', activity_type.createdWorkspace, "", "", '', new Array());
  
          logActivityPromise.then(function (result, err) {
            if (result) {
              let notificationText = activityTemplate.addNotificationOnWsCreated('added', 'workspace');
              const notificationActivityPromise = Activity.logActivity(req.userInfo._id, workspaceData.organization_id, workspaceData._id, null, null, null, notificationText, 'notification', activity_type.createdWorkspace, "", "", '', new Array());
              notificationActivityPromise.then(async (result) => {
                // Update notification count for user who created the post
                const socket = io(socketUrl);
                socket.on("connect", () => {
                  socket.emit("getNotificationCount", [req.userInfo._id]);
                  socket.disconnect();
                });
                const response = commonUtils.genSuccessResponse(resStatusCode.created, req.t('WS_ADD_SUCCESS'), { workspace_id: workspaceData._id, organization_id: workspaceData.organization_id, name: workspaceData.name });
                return res.status(response.statusCode).json(response);
              });
            }
          })
        } else {
          let workspaceData = await workspaceUtils.addWorkspace(data);
          const response = commonUtils.genSuccessResponse(resStatusCode.created, req.t('WS_ADD_SUCCESS'), { workspace_id: workspaceData._id, organization_id: workspaceData.organization_id, name: workspaceData.name });
          return res.status(response.statusCode).json(response);
        }
      })
    }
    else{
      const response = {
        statusCode : 400,
        success: false,
        message: "Access denied!"
      }
      return res.status(400).json(response)
    }

  } catch (err) {
    const response = commonUtils.genErrorResponse(resStatusCode.error.internalServerError, req.t('ERROR'), err);
    return res.status(response.statusCode).json(response);
  }
}
workspaceContoller.editWorkspace = async (req, res) => {

  try {
    let data = req.body;
    data.fname = req.body.name.split(' ').join('-').toLowerCase();
    await workspaceUtils.updateWorkspace({ _id: req.WSInfo._id }, req.body)

    let activityText = activityTemplate.editActivityTemplate(req.userInfo.firstName + ' ' + req.userInfo.lastName, data.name, 'Workspace');
    // let logActivityPromise = Activity.logActivity(req.userInfo._id, req.WSInfo.organization_id, req.WSInfo._id, null, null, null, activityText, 'activity', activity_type.updatedWorkspace, "", "", '', new Array());
    const subActivityPromise = subActivity.logSubActivity(req.mainActivityId, req.userInfo._id, req.WSInfo.organization_id, req.WSInfo._id, null, null, null, activityText, 'activity', activity_type.updatedWorkspace, "", "", '', new Array());

    subActivityPromise.then(function (result, err) {
      if (result) {
        let notificationText = activityTemplate.addNotificationOnWsCreated('updated', 'workspace');
        const notificationActivityPromise = Activity.logActivity(req.userInfo._id, req.WSInfo.organization_id, req.WSInfo._id, null, null, null, notificationText, 'notification', activity_type.updatedWorkspace, "", "", '', new Array());
        notificationActivityPromise.then(async (result) => {
          // Update notification count for user who created the post
          const socket = io(socketUrl);
          socket.on("connect", () => {
            socket.emit("getNotificationCount", [req.userInfo._id]);
            socket.disconnect();
          });
          const response = commonUtils.genSuccessResponse(resStatusCode.success, req.t('WS_EDIT_SUCCESS'));
          return res.status(response.statusCode).json(response);
        })

      }
    });

  } catch (err) {
    const response = await commonUtils.genErrorResponse(resStatusCode.error.internalServerError, req.t('ERROR'), err);
    return res.status(response.statusCode).json(response);
  }
}
workspaceContoller.getWorkspaces = async (req, res) => {
  try {
    const resData = await workspaceUtils.findWorkspaces({ organization_id: req.body.organization_id });
    const userId = req.userInfo._id;

    if (resData && resData.length) {
      let promiseArray = [];
      promiseArray = await Promise.all(_.map(resData, async (value) => {

        let subscription = false;

        await WorkspaceSubscriptionModel.findOne({
          workspace_id: ObjectId(value.id),
          user_id: ObjectId(userId)
        }).then(async (response) => {
          if (response && response._id){
            subscription = true;
          }
        });

        if ((value.owner).toString() == (userId).toString()) {
          subscription = true;
        }

        console.log(typeof (value.owner))
        console.log(typeof (userId))
        console.log('value.owner', value.name, value.owner, userId)

        let wsData = {};
        wsData._id = value.id;
        wsData.slug = value.slug;
        wsData.name = value.name;
        wsData.description = value.description;
        wsData.organization_id = value.organization_id;
        wsData.owner = value.owner;
        wsData.fname = value.fname;
        wsData.shortid = value.shortid;
        wsData.isPaid = value.isPaid;
        wsData.removeFromGroup = value.removeFromGroup;
        wsData.requireReSubscription = value.requireReSubscription;
        wsData.isMultipleTiers = value.isMultipleTiers;
        wsData.isUpsell = value.isUpsell;
        wsData.upsell = value.upsell;
        wsData.paymentOptions = value.paymentOptions;
        wsData.createdAt = value.createdAt;
        wsData.updatedAt = value.updatedAt;
        wsData.isSubscribed = subscription;
        let role = await workspaceUtils.findWorkspaceRole({ workspace_id: value._id, user_id: req.userInfo._id }, { role: 1 })
        if (role != null || !_.isEmpty(role)) {
          wsData.role = role.role;
        } else {
          wsData.role = '';
        }
        return wsData
      }))
      promiseArray = _.reject(promiseArray, ['role', '']);
      const response = commonUtils.genSuccessResponse(resStatusCode.success, req.t('SUCCESS'), _.compact(promiseArray));
      return res.status(response.statusCode).json(response);
    }
    const response = commonUtils.genSuccessResponse(resStatusCode.success, req.t('SUCCESS'), resData);
    return res.status(response.statusCode).json(response);


  } catch (err) {
    const response = commonUtils.genErrorResponse(resStatusCode.error.internalServerError, req.t('ERROR'), err);
    return res.status(response.statusCode).json(response);
  }
}

workspaceContoller.getPaidWorkspaces = async (req, res) => {
  try {

    const userId = req.userInfo._id;

    await WorkspaceModel.aggregate([
      {
        '$match': {
          owner: ObjectId(userId),
          isPaid: true
        }
      },
      {
        '$lookup': {
          'from': 'workspaceroles',
          'localField': '_id',
          'foreignField': 'workspace_id',
          'as': 'workspaceroles'
        }
      },
      { 
        '$addFields': {
          'workspaceMembers' : {
            '$size': "$workspaceroles"
          }
        }
      },
      {
        "$project": {
          "_id": 1,
          "name": 1,
          "isPaid": 1,
          "paymentOptions": 1,
          "workspaceMembers" : 1
        }
      },
      {
        $sort : {"_id":-1}
      }
    ]).exec((err, responseData) => {
      const sumMembers = responseData.reduce((sum, { workspaceMembers }) => sum + workspaceMembers, 0);
      const response = commonUtils.genSuccessResponse(resStatusCode.success, req.t('SUCCESS'), responseData);
      response.totalMembers = sumMembers;
      return res.status(response.statusCode).json(response);
    })

  } catch (err) {
    const response = commonUtils.genErrorResponse(resStatusCode.error.internalServerError, req.t('ERROR'), err);
    return res.status(response.statusCode).json(response);
  }
}


workspaceContoller.getPaidWorkspace = async (req, res) => {
  try {

    const userId = req.userInfo._id;
    const workspaceId = req.params.id;

    let getPaidWorkspace = await workspaceUtils.findWorkspace({
      // owner: ObjectId(userId),
      _id: ObjectId(workspaceId)
    });

    const response = commonUtils.genSuccessResponse(resStatusCode.success, req.t('SUCCESS'), getPaidWorkspace);
    return res.status(response.statusCode).json(response);

  } catch (err) {
    const response = commonUtils.genErrorResponse(resStatusCode.error.internalServerError, req.t('ERROR'), err);
    return res.status(response.statusCode).json(response);
  }
}

workspaceContoller.deletePaidWorkspaces = async (req, res) => {
  try {

    const userId = req.userInfo._id;
    const workspaceId = req.params.id;

    let deletePaidWorkspace = await workspaceUtils.updateWorkspace({
      owner: ObjectId(userId),
      isPaid: true,
      _id: ObjectId(workspaceId)
    },
    {
      isPaid: false
    });

    const response = commonUtils.genSuccessResponse(resStatusCode.success, req.t('SUCCESS'), deletePaidWorkspace);
    return res.status(response.statusCode).json(response);

  } catch (err) {
    const response = commonUtils.genErrorResponse(resStatusCode.error.internalServerError, req.t('ERROR'), err);
    return res.status(response.statusCode).json(response);
  }
}
   


workspaceContoller.getUserWorkspaces = async (req, res) => {
  try {
    userWorkspaces(req, res);
  } catch (err) {
    const response = await commonUtils.genErrorResponse(resStatusCode.error.internalServerError, req.t('ERROR'), err);
    return res.status(response.statusCode).json(response);
  }
}
workspaceContoller.getWorkspaceMembers = async (req, res) => {
  try {
    const params = req.params;
    const workspace_id = params.id;
    const queryParams = req.query;
    const name = _.get(queryParams, 'name', '');
    const role = _.get(queryParams, 'role');
    const nameRegex = new RegExp('^' + name, 'i');
    let matchCondition = { "_id": { $ne: null } };
    if (name) {
      matchCondition = {
        '$or': [
          { 'firstName': nameRegex },
          { 'lastName': nameRegex },
        ],
      }
    }
    const query = { workspace_id: ObjectId(workspace_id) };
    if (role) { query.role = role; }
    const callbackFn = (error, user) => {
      if (error) {
        const response = commonUtils.genErrorResponse(resStatusCode.error.notFound, req.t('ERROR'), error);
        return res.status(response.statusCode).json(response);
      }
      const responseValue = _.map(user, (item) => {
        if (!_.isNull(item.user_id)) {
          return item;
        }
      });
      const response = commonUtils.genSuccessResponse(resStatusCode.success, req.t('SUCCESS'), _.compact(responseValue));
      return res.status(response.statusCode).json(response);
    };
    const wsAggregatorOptions = [{
      $match: query
    },
    {
      $lookup: {
        from: 'users',
        localField: 'user_id',
        foreignField: '_id',
        as: 'users'
      }
    },
    {
      $unwind: {
        preserveNullAndEmptyArrays: true,
        path: '$users'
      }
    },
    {
      $match: matchCondition
    },
    {
      $project: {
        _id: 1,
        role: 1,
        email: 1,
        createdAt: 1,
        status: 1,
        workspace_id: 1,
        user_id: {
          'firstName': { $cond: { if: '$users', then: '$users.firstName', else: '' } },
          'lastName': { $cond: { if: '$users', then: '$users.lastName', else: '' } },
          'email': { $cond: { if: '$users', then: '$users.email', else: '$email' } },
          '_id': { $cond: { if: '$users', then: '$users._id', else: '' } },
          'avatar': { $cond: { if: '$users', then: '$users.avatar', else: '' } },
          'lastSeen': { $cond: { if: '$users', then: '$users.lastSeen', else: '' } },
        }
      }
    },
    ];

    WorkspaceRoleModel.aggregate(wsAggregatorOptions).exec(callbackFn);
  } catch (err) {
    const response = commonUtils.genErrorResponse(resStatusCode.error.internalServerError, req.t('ERROR'), err);
    return res.status(response.statusCode).json(response);
  }
}
workspaceContoller.getWorkspaceOrganizationUsers = async (req, res) => {
  try {
    organizationUsersList(req, res);
  } catch (err) {
    const response = commonUtils.genErrorResponse(resStatusCode.error.internalServerError, req.t('ERROR'), err);
    return res.status(response.statusCode).json(response);
  }
}
workspaceContoller.changeOrder = async (req, res) => {
  try {
    let promiseArray = [];
    promiseArray = _.map(req.body.workspaces, (value, index) => {
      let query = { _id: value };
      return workspaceUtils.updateWorkspaceOrder(query, { displayOrder: index });
    });
    const response = await commonUtils.genSuccessResponse(resStatusCode.success, req.t('SUCCESS'));
    return res.status(response.statusCode).json(response);
  } catch (err) {
    const response = await commonUtils.genErrorResponse(resStatusCode.error.internalServerError, req.t('ERROR'), err);
    return res.status(response.statusCode).json(response);
  }
}
workspaceContoller.getOrganizationWorkspaces = async (req, res) => {
  try {
    workspaceList(req, res);
  } catch (err) {
    const response = await commonUtils.genErrorResponse(resStatusCode.error.internalServerError, req.t('ERROR'), err);
    return res.status(response.statusCode).json(response);
  }
}
workspaceContoller.getPredefineWorkSpace = async (req, res) => {
  try {
    if (req.userInfo.isSuperAdmin === true) {
      await categoryUtils.updateCategory({ _id: req.body.categoryId }, { Title: req.body.Title });
      const response = commonUtils.genSuccessResponse(resStatusCode.success, req.t('SUCCESS'));
      return res.status(response.statusCode).json(response);
    } else {
      const response = commonUtils.genErrorResponse(resStatusCode.error.unauthorized, req.t('UNAUTH_ACC'));
      return res.status(response.statusCode).json(response);
    }
  } catch (err) {
    const response = await commonUtils.genErrorResponse(resStatusCode.error.internalServerError, req.t('ERROR'), err);
    return res.status(response.statusCode).json(response);
  }
}
workspaceContoller.assignUsers = async (req, res) => {
  try {
    let requestData = req.body.users;
    if (requestData.length > 0) {
      for (let i = 0; i < requestData.length; i++) {
        let user = await userUtils.findUser({ email: requestData[i].email }, { firstName: 1, lastName: 1, isSetUpAccountData: 1, email: 1, organizationOrder: 1, fcmToken: 1 });
        let obj = {};
        let query = {};
        let invitationMailBody;
        if (user) {
          let orgOrder = _.find(user.organizationOrder, ObjectId(req.WSInfo.organization_id._id));
          if (!orgOrder) {
            await userUtils.updateUser({ _id: user._id }, {
              $push: {
                organizationOrder: ObjectId(req.WSInfo.organization_id._id)
              }
            })
          }
          query = { user_id: user._id, workspace_id: req.WSInfo._id };
          obj.user_id = user._id;
          obj.status = 'active';
          obj.email = null;
          invitationMailBody = invitationMail.replace('{URL}', process.env.SITE_URL);
          invitationMailBody = invitationMailBody.replace('{URL1}', process.env.SITE_URL);
          const notificationInfo = '[' + req.userInfo.firstName + ' ' + req.userInfo.lastName + ']' + ' Workspace invitation';
          const notificationData = {
            title: 'Notification',
            body: notificationInfo,
            params: {},
          };
          let activityText = activityTemplate.sendInvitationLinkTemplate(req.userInfo.firstName + ' ' + req.userInfo.lastName, user.firstName + ' ' + user.lastName, req.WSInfo.name, 'Workspace');
          // const logActivityPromise = Activity.logActivity(req.userInfo._id, req.WSInfo.organization_id, req.WSInfo._id, null, null, null, activityText, 'activity', activity_type.invitedUser, "", user._id, '', new Array());
          const subActivityPromise = subActivity.logSubActivity(req.mainActivityId, req.userInfo._id, req.WSInfo.organization_id, req.WSInfo._id, null, null, null, activityText, 'activity', activity_type.invitedUser, "", user._id, '', new Array());
          subActivityPromise.then(function (promiseData) {
            if (promiseData) {
              let notificationText = activityTemplate.addNotificationOnUserInvited('added', 'workspace');
              const notificationActivityPromise = Activity.logActivity(req.userInfo._id, req.WSInfo.organization_id, req.WSInfo._id, null, null, null, notificationText, 'notification', activity_type.invitedUser, "", user._id, '', new Array());
              notificationActivityPromise.then(function (result) {
                // Update notification count for user who created the post
                const socket = io(socketUrl);
                socket.on("connect", () => {
                  socket.emit("getNotificationCount", [user._id]);
                  socket.disconnect();
                });
                if (user && user.isSetUpAccountData.tabEmailNotification &&
                  user.isSetUpAccountData.tabEmailNotification.recMessageNotification &&
                  user.isSetUpAccountData.tabEmailNotification.onScreenNotification) {
                  const emailPermissions = user.isSetUpAccountData.tabEmailNotification.recMessageNotification.map(per => per.children);
                  const notificationPermissions = user.isSetUpAccountData.tabEmailNotification.onScreenNotification.map(per => per.children);
                  if (emailPermissions.indexOf(2) > -1 || emailPermissions.indexOf('2') > -1) {
                    if (notificationPermissions.indexOf(1) > -1 || notificationPermissions.indexOf('1') > -1) {
                      sendNotification(user.fcmToken, notificationData);
                    }
                  }
                }
              });
            }
          });
        } else {
          query = { email: requestData[i].email, workspace_id: req.WSInfo._id };
          obj.status = 'active';
          obj.email = requestData[i].email;
          const insertData = {
            email: requestData[i].email,
            role: 'guest'
          }
          let saveUser = await userUtils.addUser(insertData);
          obj.user_id = saveUser._id;
          invitationMailBody = guestInvitation.replace('{URL}', `${process.env.SITE_URL}/auth/sign-up?userId=${saveUser._id}&email=${requestData[i].email}`);
          invitationMailBody = invitationMailBody.replace('{URL1}', `${process.env.SITE_URL}/auth/sign-up?userId=${saveUser._id}&email=${requestData[i].email}`);
        }
        obj.role = requestData[i].role;
        obj.workspace_id = req.WSInfo._id;
        let options = {
          'upsert': true,
          'new': true,
          'returnNewDocument': true,
        };
        let avatar = req.userInfo.avatar ? process.env.MEDIA_URL + '/' + req.userInfo.avatar : process.env.LOGO_URL;
        invitationMailBody = invitationMailBody.replace('{NAME}', req.userInfo.firstName + ' ' + req.userInfo.lastName);
        invitationMailBody = invitationMailBody.replace('{EMAIL}', req.userInfo.email);
        invitationMailBody = invitationMailBody.replace('{ORGNAME}', req.WSInfo.organization_id.name);
        invitationMailBody = invitationMailBody.replace('{ORGNAME1}', req.WSInfo.organization_id.name);
        invitationMailBody = invitationMailBody.replace('{WORKSPACE}', req.WSInfo.name);
        invitationMailBody = invitationMailBody.replace('{DESCRIPTION}', req.WSInfo.description);
        invitationMailBody = invitationMailBody.replace('{AVATAR}', avatar);
        commonUtils.sendMail(requestData[i].email, invitationMailBody, req.t('WS_INVITATION_SUBJECT'));
        await workspaceUtils.addRoles(query, obj, options);
      }
      const response = commonUtils.genSuccessResponse(resStatusCode.created, req.t('SUCCESS'));
      return res.status(response.statusCode).json(response);
    } else {
      const response = await commonUtils.genErrorResponse(resStatusCode.error.badRequest, req.t('ERR_NO_USERS'));
      return res.status(response.statusCode).json(response);
    }
  } catch (err) {
    const response = await commonUtils.genErrorResponse(resStatusCode.error.internalServerError, req.t('ERROR'), err);
    return res.status(response.statusCode).json(response);
  }
}
workspaceContoller.deleteWorkspace = async (req, res) => {
  try {
    let callbackFn = async (error) => {
      if (error) {
        const response = await commonUtils.genErrorResponse(resStatusCode.error.internalServerError, req.t('ERROR'), err);
        return res.status(response.statusCode).json(response);
      }
      const response = commonUtils.genSuccessResponse(resStatusCode.success, req.t('SUCCESS'));
      return res.status(response.statusCode).json(response);
    };
    deleteWsHelper(req, res, callbackFn);
  } catch (err) {
    const response = await commonUtils.genErrorResponse(resStatusCode.error.internalServerError, req.t('ERROR'), err);
    return res.status(response.statusCode).json(response);
  }
}

workspaceContoller.leaveWorkspace = async (req, res) => {
  try {
   
    WorkspaceRoleModel.findOne({ workspace_id: ObjectId(req.params.id), user_id: ObjectId(req.userInfo._id) }, { _id: 1}).then(async (ws) => {
      if(!ws){
        const response = {
          statusCode: resStatusCode.error.notFound,
          success: false,
          message: req.t('WORKSPACE_NOT_FOUND')
        }
        return res.status(resStatusCode.error.notFound).json(response);
      }
      else{
        let workspaceRoleId = ws._id;
        WorkspaceRoleModel.deleteOne({_id: workspaceRoleId}, (error) => {
          if (error) {
            const response = commonUtils.genErrorResponse(resStatusCode.error.internalServerError, req.t('ERROR'), error);
            return res.status(response.statusCode).json(response);
          } else {
            const response = commonUtils.genSuccessResponse(resStatusCode.success, req.t('LEAVE_WORKSPACE_SUCCESS'));
            return res.status(response.statusCode).json(response);
          }
        });
      }
    })
    
  } catch (err) {
    const response = await commonUtils.genErrorResponse(resStatusCode.error.internalServerError, req.t('ERROR'), err);
    return res.status(response.statusCode).json(response);
  }
}

workspaceContoller.getSharedWorkspaces = async (req, res) => {
  try {
    const resData = await workspaceUtils.findWorkspaces({ organization_id: req.body.organization_id });
    if (resData && resData.length) {
      let promiseArray = [];
      promiseArray = await Promise.all(_.map(resData, async (value) => {
        let wsData = {};
        wsData._id = value.id;
        wsData.slug = value.slug;
        wsData.name = value.name;
        wsData.description = value.description;
        wsData.organization_id = value.organization_id;
        wsData.owner = value.owner;
        wsData.fname = value.fname;
        wsData.shortid = value.shortid;
        wsData.createdAt = value.createdAt;
        wsData.updatedAt = value.updatedAt;
        let role = await workspaceUtils.findWorkspaceRole({ workspace_id: value._id, user_id: req.userInfo._id }, { role: 1 })
        if (role != null || !_.isEmpty(role)) {
          wsData.role = role.role;
        } else {
          wsData.role = '';
        }
        return wsData
      }))
      const response = commonUtils.genSuccessResponse(resStatusCode.success, req.t('SUCCESS'), promiseArray);
      return res.status(response.statusCode).json(response);
    }
    const response = commonUtils.genSuccessResponse(resStatusCode.success, req.t('SUCCESS'), resData);
    return res.status(response.statusCode).json(response);


  } catch (err) {
    const response = commonUtils.genErrorResponse(resStatusCode.error.internalServerError, req.t('ERROR'), err);
    return res.status(response.statusCode).json(response);
  }
}
workspaceContoller.editWorkspaceRole = async (req, res) => {
  try {
    let data = req.body;
    WorkspaceModel.findOne({ _id: ObjectId(data.workspace_id) }, { owner: 1, name: 1 })
      .populate({
        path: 'owner',
        'select': 'email isSetUpAccountData'
      }).then(async (ws) => {
        let email = ws.owner.email;

        if (ws.owner.isSetUpAccountData.tabEmailNotification &&
          ws.owner.isSetUpAccountData.tabEmailNotification.recMessageNotification &&
          ws.owner.isSetUpAccountData.tabEmailNotification.onScreenNotification) {
          const emailPermissions = ws.owner.isSetUpAccountData.tabEmailNotification.recMessageNotification.map(per => per.children);
          if (emailPermissions.indexOf(3) > -1 || emailPermissions.indexOf('3') > -1) {
            let userData = await userUtils.findUser({ _id: data.user_id }, { firstName: 1, lastName: 1, avatar: 1 })
            let comment = '<strong>' + userData.firstName + ' ' + userData.lastName + '</strong> has joined as ' + '<strong>' + data.role + '</strong> - ' + '<strong>' + ws.name + '</strong>';
            let invitationMailBody = roleMail.replace('{URL}', process.env.SITE_URL);
            invitationMailBody = invitationMailBody.replace('{COMMENT}', comment);
            commonUtils.sendMail(email, invitationMailBody, req.t('WS_ROLE_SUBJECT'));
          }
        }
        await workspaceUtils.updateWorkspaceRole({ _id: req.roleInfo._id }, data);
        const response = commonUtils.genSuccessResponse(resStatusCode.success, req.t('SUCCESS'));
        return res.status(response.statusCode).json(response);
      });
  } catch (err) {
    const response = commonUtils.genErrorResponse(resStatusCode.error.internalServerError, req.t('ERROR'), err);
    return res.status(response.statusCode).json(response);
  }
}
workspaceContoller.removeUsers = async (req, res) => {
  try {
    let id = [];
    let email = [];
    let users = req.body.users;
    let emails = req.body.emails;
    if (users.length < 1 && emails.length < 1) {
      const response = await commonUtils.genErrorResponse(resStatusCode.error.badRequest, req.t('ERR_NO_USERS'));
      return res.status(response.statusCode).json(response);
    } else {
      if (users.length > 0) {
        for (let i = 0; i < users.length; i++) {
          if (users[i] != req.workspaceInfo.owner) {
            id.push((users[i]));
          }
        }
      }
      if (emails.length > 0) {
        for (let j = 0; j < emails.length; j++) {
          email.push((emails[j]));
        }
      }
      const query = {
        workspace_id: req.body.workspace_id,

        '$or': [{
          user_id: {
            $in: id
          }
        },
        {
          email: {
            $in: emails
          }
        }
        ]
      };
      let allUsers = await userUtils.findUsers({
        '$or': [{
          _id: {
            $in: id
          }
        },
        {
          email: {
            $in: emails
          }
        }
        ]
      }, { email: 1, firstName: 1, lastName: 1 });

      if (allUsers && !_.isEmpty(allUsers)) {
        let name = [];
        for (let k = 0; k < allUsers.length; k++) {
          name.push((allUsers[k].firstName + ' ' + allUsers[k].lastName));
        }
        WorkspaceModel.findOne({ _id: ObjectId(req.body.workspace_id) }, { owner: 1, name: 1 })
          .populate({
            path: 'owner',
            'select': 'email isSetUpAccountData'
          }).then(async (ws) => {
            let email = ws.owner.email;
            if (ws.owner.isSetUpAccountData.tabEmailNotification &&
              ws.owner.isSetUpAccountData.tabEmailNotification.recMessageNotification &&
              ws.owner.isSetUpAccountData.tabEmailNotification.onScreenNotification) {
              const emailPermissions = ws.owner.isSetUpAccountData.tabEmailNotification.recMessageNotification.map(per => per.children);
              if (emailPermissions.indexOf(3) > -1 || emailPermissions.indexOf('3') > -1) {
                let comment = '<strong>' + name + '</strong> has left ' + '<strong>' + ws.name + '</strong>';
                let invitationMailBody = roleMail.replace('{URL}', process.env.SITE_URL);
                invitationMailBody = invitationMailBody.replace('{COMMENT}', comment);
                commonUtils.sendMail(email, invitationMailBody, req.t('WS_ROLE_SUBJECT'));
              }
            }
            WorkspaceRoleModel.deleteMany(query, (error) => {
              if (error) {
                const response = commonUtils.genErrorResponse(resStatusCode.error.internalServerError, req.t('ERROR'), error);
                return res.status(response.statusCode).json(response);
              } else {
                const response = commonUtils.genSuccessResponse(resStatusCode.success, req.t('ORG_USER_DELETE_SUCCESS'));
                return res.status(response.statusCode).json(response);
              }
            });
          })
      } else {
        WorkspaceRoleModel.deleteMany(query, (error) => {
          if (error) {
            const response = commonUtils.genErrorResponse(resStatusCode.error.internalServerError, req.t('ERROR'), error);
            return res.status(response.statusCode).json(response);
          } else {
            const response = commonUtils.genSuccessResponse(resStatusCode.success, req.t('ORG_USER_DELETE_SUCCESS'));
            return res.status(response.statusCode).json(response);
          }
        });
      }



    }
  } catch (err) {
    const response = commonUtils.genErrorResponse(resStatusCode.error.internalServerError, req.t('ERROR'), err);
    return res.status(response.statusCode).json(response);
  }
}
module.exports = workspaceContoller
