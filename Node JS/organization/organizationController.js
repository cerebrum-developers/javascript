const organizationUtils = require('./organizationUtils');
const WorkspaceUtils = require('../workspace/workspaceUtils');
const userUtils = require('../user/userUtils');
const commonUtils = require('../../../helper/commonUtils');
const { resStatusCode, activity_type } = require('../../../helper/constant');
const constant = require('../../../helper/constant');
const mongoose = require('mongoose');
const { ObjectId } = mongoose.Types;
const { OrganizationRoleModel, UserModel, OrganizationModel, MarketWorkspaceModel, WorkspaceRoleModel, BusinessModel, WorkspaceModel, WorkspaceSubscriptionModel } = require('../../../helper/models')
const _ = require('lodash');
const leaveOrganizationHelper = require('./helper/leave-organization');
const invitationMail = require('../../../templates/organisation-invitation.html');
const sendNotification = require('../../../helper/send-notification');
const activityTemplate = require('../../../helper/activity');
let Activity = require('../../../helper/logActivity');
let mainActivity = require('../../../helper/mainActivity');
let subActivity = require('../../../helper/subActivity');
const io = require("socket.io-client");
const mediaServer = require('../../../helper/mediaServer');
const socketUrl = `${process.env.SOCKET_URL}?authorization=${process.env.ADMIN_TOKEN}`;
const cloneHelper = require('../organization/helper/clone-onboard-workspace');
const organizationContoller = {};
const request = require('request');
organizationContoller.addOrganization = async (req, res) => {
  try {

    let data = req.body;
    let userData = req.userInfo;
    OrganizationModel.countDocuments({
      'owner': req.userInfo._id
    }).then(async totalOrganization => {
      data.displayOrder = totalOrganization;
      let fname = req.body.name.split(' ').join('-').toLowerCase();
      let email = req.userInfo.email;
      data.owner = req.userInfo._id;
      data.fname = fname;
      data.domain = email.substring(email.lastIndexOf("@") + 1);
      if (req.files.avatar) {
        if (req.files.avatar.name === "blob") {
          req.files.avatar.name = req.body.fileName;
        }
        let attachmentData = [];
        data.thumbTypes = [];
        const configData = { owner: req.userInfo.id, fname, thumbTypes: [] };
        attachmentData = await commonUtils.uploadFile(req.files.avatar, constant.pictureTypes.orgLogo, configData);
        data.avatar = attachmentData.attachment ? attachmentData.attachment.path : '';
        data.avatarThumbs = attachmentData.thumbs ? attachmentData.thumbs : [];
      } else {
        data.avatar = '';
      }
      let organizationData = await organizationUtils.addOrganization(data);
      if (organizationData) {

        let activityText = activityTemplate.addOrganizationTemplate(req.userInfo.firstName + ' ' + req.userInfo.lastName);
        // const logActivityPromise = Activity.logActivity(req.userInfo._id, organizationData._id, null, null, null, null, activityText, 'activity', activity_type.createdOrganization, "", "", '', new Array());
        const logActivityPromise = mainActivity.logMainActivity(req.userInfo._id, organizationData._id, null, null, null, null, activityText, 'activity', activity_type.createdOrganization, "", "", '', new Array());

        logActivityPromise.then(function (promiseData) {
          if (promiseData) {
            let notificationText = activityTemplate.addNotificationOnOrgCreated('added', 'organization');
            const notificationActivityPromise = Activity.logActivity(req.userInfo._id, organizationData._id, null, null, null, null, notificationText, 'notification', activity_type.createdOrganization, "", "", '', new Array());
            notificationActivityPromise.then(async (result) => {
              // Update notification count for user who created the post
              const socket = io(socketUrl);
              socket.on("connect", () => {
                socket.emit("getNotificationCount", [req.userInfo._id]);
                socket.disconnect();
              });
              await userUtils.updateUser({ _id: req.userInfo._id }, {
                $push: {
                  organizationOrder: ObjectId(organizationData._id)
                }
              });
              const organizationRoleData = {
                user_id: req.userInfo._id,
                role: 'admin',
                organization_id: organizationData._id
              };
              await organizationUtils.addOrganizationRole(organizationRoleData);
            })
          }
        })
        //add customer into stripe
        request({
          har: {
            url: process.env.STRIPE_API_URL + '/v1/customers',
            method: 'POST',
            headers: [{
              name: 'Authorization',
              value: 'Bearer ' + process.env.STRIPE_API_KEY
            }],
            postData: {
              mimeType: 'application/x-www-form-urlencoded',
              params: [{
                name: 'name',
                value: userData.firstName + ' ' + userData.lastName
              },
              {
                name: 'address[city]',
                value: userData.city
              },
              {
                name: 'address[country]',
                value: 'US'
              },
              {
                name: 'address[line1]',
                value: userData.address
              },
              {
                name: 'address[state]',
                value: userData.state
              },
              {
                name: 'address[postal_code]',
                value: userData.zip
              },
              {
                name: 'email',
                value: userData.email
              },
              {
                name: 'description',
                value: organizationData.name + ' ' + organizationData._id
              }
              ]
            }
          }
        }, async (error, result) => {
          if (result && result.statusCode === 200) {
            let customerData = JSON.parse(result.body);
            await organizationUtils.updateOrganization({ _id: organizationData._id }, { customerId: customerData.id })
          }
          const response = commonUtils.genSuccessResponse(resStatusCode.created, req.t('ORG_ADD_SUCCESS'), organizationData);
          return res.status(response.statusCode).json(response);
        });
      }


    });
    // }

    // };

    // } else {
    //   const response = await commonUtils.genErrorResponse(resStatusCode.error.unauthorized, req.t('UNAUTH_ACC'));
    //   return res.status(response.statusCode).json(response);
    // }
  } catch (err) {
    const response = commonUtils.genErrorResponse(resStatusCode.error.internalServerError, req.t('ERROR'), err);
    return res.status(response.statusCode).json(response);
  }
}
organizationContoller.editOrganization = async (req, res) => {
  try {
    let data = req.body;
    let fname = req.orgInfo.slug;
    data.fname = fname;
    let email = req.userInfo.email;
    data.domain = email.substring(email.lastIndexOf("@") + 1);
    if (req.files.avatar) {
      const uploadValidation = await commonUtils.getUploadSize(req.body.organization_id, req.orgInfo.slug, req.files.avatar.size)
      if (uploadValidation == 'success') {
        let attachmentData = [];
        data.thumbTypes = [];
        const configData = { owner: req.userInfo.id, fname, thumbTypes: [] };
        if (req.orgInfo.avatar) {
          let oldData = req.orgInfo;
          oldData = { attachmentPath: oldData.avatar, thumbs: oldData.avatarThumbs };
          attachmentData = await commonUtils.updateFile(req.files.avatar, constant.pictureTypes.orgLogo, configData, oldData);
          data.avatar = attachmentData.attachment ? attachmentData.attachment.path : '';
          data.avatarThumbs = attachmentData.thumbs ? attachmentData.thumbs : [];
        } else {
          attachmentData = await commonUtils.uploadFile(req.files.avatar, constant.pictureTypes.orgLogo, configData);
          data.avatar = attachmentData.attachment ? attachmentData.attachment.path : '';
          data.avatarThumbs = attachmentData.thumbs ? attachmentData.thumbs : [];
        }
      } else {
        const response = await commonUtils.genErrorResponse(resStatusCode.error.notFound, req.t('UPGARDE_PLAN_ERR'));
        return res.status(response.statusCode).json(response);
      }

    }
    await organizationUtils.updateOrganization({ _id: req.orgInfo._id }, data);
    const response = commonUtils.genSuccessResponse(resStatusCode.success, req.t('ORG_EDIT_SUCCESS'), { _id: req.body.organization_id, backrgoundColor: req.body.backrgoundColor });
    return res.status(response.statusCode).json(response);
  } catch (err) {
    const response = commonUtils.genErrorResponse(resStatusCode.error.internalServerError, req.t('ERROR'), err);
    return res.status(response.statusCode).json(response);
  }
}
organizationContoller.getOrganizations = async (req, res) => {
  try {
    const queryString = req.query;
    if (queryString && !_.isEmpty(queryString)) {
      let match;
      let limit = 100;
      if (queryString.name) {
        match = {
          'name': {
            '$regex': new RegExp(queryString.name, 'ig'),
          },
        };

      } else {
        match = { "_id": { $ne: null } };
        limit = 5;
      }
      OrganizationModel.aggregate([
        { '$match': match },
        {
          '$sort': { createdAt: -1 }
        },
        { '$limit': limit },
      ]).exec((err, org) => {
        const response = commonUtils.genSuccessResponse(resStatusCode.success, req.t('SUCCESS'), org);
        return res.status(response.statusCode).json(response);
      })
    } else {
      let query =
        [
          { $match: { _id: { $in: req.userInfo.organizationOrder } } },
          { $addFields: { "__order": { $indexOfArray: [req.userInfo.organizationOrder, "$_id"] } } },
          { $sort: { "__order": 1 } }
        ];
      OrganizationModel.aggregate(query,
        async (error, organizations) => {
          const mappedResult = await Promise.all(_.map(organizations, async (item) => {
            const org = await organizationUtils.findOrganizationRole({ user_id: req.userInfo._id, organization_id: item._id }, { role: 1, _id: 0 });
            //     item = item.toObject();
            if (org) {
              item.role = org.role;
            } else {
              item.role = "";
            }
            return item;
          }));
          const response = commonUtils.genSuccessResponse(resStatusCode.success, req.t('SUCCESS'), _.compact(mappedResult));
          return res.status(response.statusCode).json(response);
        });


    }
  } catch (err) {
    const response = commonUtils.genErrorResponse(resStatusCode.error.internalServerError, req.t('ERROR'), err);
    return res.status(response.statusCode).json(response);
  }
}
organizationContoller.onboarding = async (req, res) => {

  console.log('onboarding -- 1')

  try {
    let data = req.body;
    let fname = req.body.name.split(' ').join('-').toLowerCase();
    let email = req.userInfo.email;
    data.fname = fname;
    data.domain = email.substring(email.lastIndexOf("@") + 1);
    data.owner = req.userInfo._id;
    if (req.files.avatar) {
      let attachmentData = [];
      data.thumbTypes = [];
      const configData = { owner: req.userInfo.id, fname, thumbTypes: req.body.thumbTypes || [] };
      attachmentData = await commonUtils.uploadFile(req.files.avatar, constant.pictureTypes.orgLogo, configData);
      data.avatar = attachmentData.attachment ? attachmentData.attachment.path : '';
      data.avatarThumbs = attachmentData.thumbs ? attachmentData.thumbs : [];
    }
    let organizationData = await organizationUtils.addOrganization(data);

    console.log('onboarding -- 2')

    if (organizationData) {
      let businessData = {
        owner: req.userInfo._id,
        industry: data.industryId
      }
      await userUtils.addBusiness(businessData);

      let activityText = activityTemplate.addOrganizationTemplate(req.userInfo.firstName + ' ' + req.userInfo.lastName);
      const logActivityPromise = mainActivity.logMainActivity(req.userInfo._id, organizationData._id, null, null, null, null, activityText, 'activity', activity_type.createdOrganization, "", "", '', new Array());
      logActivityPromise.then(function (promiseData) { 
        if (promiseData) {

          console.log('onboarding -- 3')

          let notificationText = activityTemplate.addNotificationOnOrgCreated('added', 'organization');
          const notificationActivityPromise = Activity.logActivity(req.userInfo._id, organizationData._id, null, null, null, null, notificationText, 'notification', activity_type.createdOrganization, "", "", '', new Array());
          notificationActivityPromise.then(async (result) => {
            // Update notification count for user who created the post
            const socket = io(socketUrl);
            socket.on("connect", () => {
              socket.emit("getNotificationCount", [req.userInfo._id]);
              socket.disconnect();
            });
            const organizationRoleData = {
              user_id: req.userInfo._id,
              role: 'admin',
              organization_id: organizationData._id
            };
            await organizationUtils.addOrganizationRole(organizationRoleData);

            await userUtils.updateUser({ _id: req.userInfo._id }, {
              onboarding: true, $push: {
                organizationOrder: ObjectId(organizationData._id)
              }
            });
            req.organizationData = organizationData;
            let userData = req.userInfo;
            //add customer into stripe

            console.log('onboarding -- 4')

            // request({
            //   har: {
            //     url: process.env.STRIPE_API_URL + '/v1/customers',
            //     method: 'POST',
            //     headers: [{
            //       name: 'Authorization',
            //       value: 'Bearer ' + process.env.STRIPE_API_KEY
            //     }],
            //     postData: {
            //       mimeType: 'application/x-www-form-urlencoded',
            //       params: [{
            //         name: 'name',
            //         value: userData.firstName + ' ' + userData.lastName
            //       },
            //       {
            //         name: 'address[city]',
            //         value: userData.city
            //       },
            //       {
            //         name: 'address[country]',
            //         value: 'US'
            //       },
            //       {
            //         name: 'address[line1]',
            //         value: userData.address
            //       },
            //       {
            //         name: 'address[state]',
            //         value: userData.state
            //       },
            //       {
            //         name: 'address[postal_code]',
            //         value: userData.zip
            //       },
            //       {
            //         name: 'email',
            //         value: userData.email
            //       },
            //       {
            //         name: 'description',
            //         value: organizationData.name + ' ' + organizationData._id
            //       }
            //       ]
            //     }
            //   }
            // }, async (error, result) => {
            //   if (result && result.statusCode === 200) {
            //     let customerData = JSON.parse(result.body);
            //     await organizationUtils.updateOrganization({ _id: organizationData._id }, { customerId: customerData.id })
            //   }
            //   cloneHelper(req, res)
            // });

            console.log('onboarding -- 5')

            const response = await commonUtils.genSuccessResponse(resStatusCode.created, req.t('SUCCESS_ONBOARDING'));
            return res.status(response.statusCode).json(response);
          })
        }
      })

      console.log('onboarding -- 6')


    }

  } catch (err) {

    console.log('onboarding -- error')

    const response = commonUtils.genErrorResponse(resStatusCode.error.internalServerError, req.t('ERROR'), err);
    return res.status(response.statusCode).json(response);
  }
}
organizationContoller.getOrganizationMembers = async (req, res) => {
  try {
    const params = req.params;
    const organization_id = params.id;
    const queryParams = req.query;
    const name = _.get(queryParams, 'name', '');
    const role = _.get(queryParams, 'role');
    const nameRegex = new RegExp('^' + name, 'i');
    let matchCondition = { "_id": { $ne: null } };

    let query = { organization_id: ObjectId(organization_id) };
    if (role) { query.role = role; }
    if (name) {
      matchCondition = {
        '$or': [
          { 'users.firstName': nameRegex },
          { 'users.lastName': nameRegex },
          { 'users.email': nameRegex },
        ],
      };
      query.user_id = {
        $ne: null
      };
      query.email = {
        $eq: null
      };
    }
    const organizationAggregatorOptions = [{
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
        status: 1,
        isEmployee: 1,
        organization_id: 1,
        createdAt: 1,
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

    const callbackFn = async (error, user) => {
      if (error) {
        const response = await commonUtils.genErrorResponse(resStatusCode.error.notFound, req.t('ERROR'), error);
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
    OrganizationRoleModel.aggregate(organizationAggregatorOptions)
      .exec(callbackFn);
  } catch (err) {
    const response = await commonUtils.genErrorResponse(resStatusCode.error.internalServerError, req.t('ERROR'), err);
    return res.status(response.statusCode).json(response);
  }
}
organizationContoller.getOrganizationEmployees = async (req, res) => {
  try {
    const params = req.params;
    const organization_id = params.id;
    const queryParams = req.query;
    const name = _.get(queryParams, 'name', '');
    const role = _.get(queryParams, 'role');
    const nameRegex = new RegExp('^' + name, 'i');
    let matchCondition = { "_id": { $ne: null } };

    const orgUserRole = await organizationUtils.findOrganizationRoles({ organization_id: ObjectId(organization_id), user_id: ObjectId(req.userInfo._id), isEmployee: true }, { role: 1 });

    // if(orgUserRole[0].role === 'light_member'){
    if (true === false) {
      const response = {
        statusCode: 400,
        success: false,
        message: "Access denied for Light Member"
      }
      return res.status(400).json(response)
    }
    else {
      const query = { organization_id: ObjectId(organization_id), isEmployee: true };
      if (role) { query.role = role; }
      if (name) {
        matchCondition = {
          '$or': [
            { 'users.firstName': nameRegex },
            { 'users.lastName': nameRegex },
            { 'users.email': nameRegex },
          ],
        };
        query.user_id = {
          $ne: null
        };
        query.email = {
          $eq: null
        };
      }
      const organizationAggregatorOptions = [{
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
          status: 1,
          isEmployee: 1,
          organization_id: 1,
          createdAt: 1,
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
      const callbackFn = async (error, user) => {
        if (error) {
          const response = await commonUtils.genErrorResponse(resStatusCode.error.notFound, req.t('ERROR'), error);
          return res.status(response.statusCode).json(response);
        }
        const responseValue = _.map(user, (item) => {
          if (!_.isNull(item.user_id)) {
            return item;
          }
        });

        let resData = {
          data: _.compact(responseValue),
          seats: req.seats,
          userPlan: req.userInfo.plan
        }

        const response = commonUtils.genSuccessResponse(resStatusCode.success, req.t('SUCCESS'), resData);
        return res.status(response.statusCode).json(response);
      };
      OrganizationRoleModel.aggregate(organizationAggregatorOptions).
        exec(callbackFn);
    }

  } catch (err) {
    const response = await commonUtils.genErrorResponse(resStatusCode.error.internalServerError, req.t('ERROR'), err);
    return res.status(response.statusCode).json(response);
  }
}
organizationContoller.editOrganizationRole = async (req, res) => {
  try {
    let data = req.body;
    await organizationUtils.updateOrganizationRole({ _id: req.roleInfo._id }, data);
    const response = commonUtils.genSuccessResponse(resStatusCode.success, req.t('SUCCESS'));
    return res.status(response.statusCode).json(response);
  } catch (err) {
    const response = commonUtils.genErrorResponse(resStatusCode.error.internalServerError, req.t('ERROR'), err);
    return res.status(response.statusCode).json(response);
  }
}
organizationContoller.inviteUsers = async (req, res) => {
  try {

    const totalSeats = req.seats;
    const organization_id = req.orgInfo._id;
    let matchCondition = { "_id": { $ne: null } };

    const orgUserRole = await organizationUtils.findOrganizationRoles({ organization_id: ObjectId(organization_id), user_id: ObjectId(req.userInfo._id), isEmployee: true }, { role: 1 });

    // if(orgUserRole[0].role === 'light_member'){
    if (true === false) {
      const response = {
        statusCode: 400,
        success: false,
        message: "Access denied for Light Member"
      }
      return res.status(400).json(response)
    }
    else {
      const query = { organization_id: ObjectId(organization_id), isEmployee: true };

      const organizationAggregatorOptions = [{
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
          status: 1,
          isEmployee: 1,
          organization_id: 1,
          createdAt: 1,
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

      const callbackFn = async (user) => {
        const responseValue = _.map(user, (item) => {
          if (!_.isNull(item.user_id)) {
            return item;
          }
        });
        // (_.compact(responseValue).length

        return responseValue.length;


        // return res.json(_.compact(responseValue).length);
      };

      const organizationMembers = await OrganizationRoleModel.aggregate(organizationAggregatorOptions);

      let organizationMembersCount = await callbackFn(organizationMembers)

      if (true === false) {
        // if (totalSeats <= organizationMembersCount) {
        let response = {
          "statusCode": 404,
          "success": false,
          "message": "All seats are consumed",
          "error": {
            "message": "All seats are consumed"
          }
        };
        return res.status(404).json(response)
      }
      else {
        let organizationDomain = req.orgInfo.domain;
        let requestData = req.body.users;
        if (requestData.length > 0) {
          for (let i = 0; i < requestData.length; i++) {
            let user = await userUtils.findUser({ email: requestData[i].email }, { firstName: 1, lastName: 1, isSetUpAccountData: 1, email: 1, organizationOrder: 1, fcmToken: 1 });
            let email = requestData[i].email;
            let userDomain = email.substring(email.lastIndexOf("@") + 1);
            let obj = {};
            let query = {};
            if (user) {
              let orgOrder = _.find(user.organizationOrder, ObjectId(req.orgInfo._id));

              if (!orgOrder) {
                await userUtils.updateUser({ _id: user._id }, {
                  $push: {
                    organizationOrder: ObjectId(req.orgInfo._id)
                  }
                });
              }
              query = { user_id: user._id, organization_id: req.orgInfo._id };
              obj.user_id = user._id;
              obj.status = 'active';
              obj.email = null;
              const notificationInfo = '[' + req.userInfo.firstName + ' ' + req.userInfo.lastName + ']' + ' Voxxi team invitation';
              const notificationData = {
                title: 'Notification',
                body: notificationInfo,
                params: {},
              };
              let activityText = activityTemplate.sendInvitationLinkTemplate(req.userInfo.firstName + ' ' + req.userInfo.lastName, user.firstName + ' ' + user.lastName, req.orgInfo.name, 'Organization');
              // const logActivityPromise = Activity.logActivity(req.userInfo._id, req.orgInfo._id, null, null, null, null, activityText, 'activity', activity_type.invitedUser, "", user._id, '', new Array());
              const subActivityPromise = subActivity.logSubActivity(req.mainActivityId, req.userInfo._id, req.orgInfo._id, null, null, null, null, activityText, 'activity', activity_type.invitedUser, "", user._id, '', new Array());

              // Sub acitivity entry

              subActivityPromise.then(function (promiseData) {
                if (promiseData) {

                  let notificationText = activityTemplate.addNotificationOnUserInvited('added', 'organization');
                  const notificationActivityPromise = Activity.logActivity(req.userInfo._id, req.orgInfo._id, null, null, null, null, notificationText, 'notification', activity_type.invitedUser, "", user._id, '', new Array());
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
                      if (emailPermissions.indexOf(2) > -1) {
                        if (notificationPermissions.indexOf(1) > -1) {
                          sendNotification(user.fcmToken, notificationData);
                        }
                      }
                    }
                  });
                }
              });
            } else {
              query = { email: requestData[i].email, organization_id: req.orgInfo._id };
              obj.user_id = null;
              obj.status = 'deactive';
              obj.email = requestData[i].email;
            }
            obj.role = requestData[i].role;
            obj.organization_id = req.orgInfo._id;
            obj.isEmployee = organizationDomain == userDomain ? true : false;
            let options = {
              'upsert': true,
              'new': true,
            };
            let avatar = req.userInfo.avatar ? process.env.MEDIA_URL + '/' + req.userInfo.avatar : process.env.LOGO_URL;
            let invitationMailBody = invitationMail.replace('{URL}', process.env.SITE_URL);
            invitationMailBody = invitationMailBody.replace('{URL1}', process.env.SITE_URL);
            invitationMailBody = invitationMailBody.replace('{NAME}', req.userInfo.firstName + ' ' + req.userInfo.lastName);
            invitationMailBody = invitationMailBody.replace('{EMAIL}', req.userInfo.email);
            invitationMailBody = invitationMailBody.replace('{ORGNAME}', req.orgInfo.name);
            invitationMailBody = invitationMailBody.replace('{ORGNAME1}', req.orgInfo.name);
            invitationMailBody = invitationMailBody.replace('{DESCRIPTION}', '');
            invitationMailBody = invitationMailBody.replace('{AVATAR}', avatar);
            commonUtils.sendMail(requestData[i].email, invitationMailBody, req.t('ORG_INVITATION_SUBJECT'));
            await organizationUtils.addRoles(query, obj, options);
          }
          const response = commonUtils.genSuccessResponse(resStatusCode.created, req.t('INVITATION_SUCCESS'));
          return res.status(response.statusCode).json(response);
        } else {
          const response = commonUtils.genErrorResponse(resStatusCode.error.badRequest, req.t('ERR_NO_USERS'));
          return res.status(response.statusCode).json(response);
        }
      }

    }

  } catch (err) {
    const response = commonUtils.genErrorResponse(resStatusCode.error.internalServerError, req.t('ERROR'), err);
    return res.status(response.statusCode).json(response);
  }
}
//Assign users list of dropdown for organizaton
organizationContoller.getUserList = async (req, res) => {
  try {
    const params = req.params;
    const organization_id = params.id;
    const queryString = req.query;
    const query = { organization_id: ObjectId(organization_id) };
    let UsersList = await organizationUtils.findOrganizationRoles(query, { user_id: 1 });
    let id = [];
    for (let i = 0; i < UsersList.length; i++) {
      id.push(mongoose.Types.ObjectId(UsersList[i].user_id));
    }
    let userQuery = {
      '_id': {
        $nin: id
      },
      '$or': [
        {
          'email': {
            '$regex': new RegExp(queryString.keyword, 'ig'),
          },
        },
        {
          'firstName': {
            '$regex': new RegExp(queryString.keyword, 'ig'),
          },
        }, {
          'lastName': {
            '$regex': new RegExp(queryString.keyword, 'ig'),
          },
        },
      ]
    };
    if (queryString.isEmployee && queryString.isEmployee === 'true') {
      userQuery.email = {
        '$regex': new RegExp(req.userInfo.email.split('@')[1].trim().toLowerCase(), 'i'),
      };
    }
    UserModel.find(userQuery,
      'firstName lastName email avatar',
      async (error, data) => {
        if (error) {
          const response = await scommonUtils.genErrorResponse(resStatusCode.error.notFound, req.t('ERROR'), error);
          return res.status(response.statusCode).json(response);
        }

        const response = commonUtils.genSuccessResponse(resStatusCode.success, req.t('SUCCESS'), data);
        return res.status(response.statusCode).json(response);
      })

  } catch (err) {
    const response = await commonUtils.genErrorResponse(resStatusCode.error.internalServerError, req.t('ERROR'), err);
    return res.status(response.statusCode).json(response);
  }
}
organizationContoller.leaveOrganization = async (req, res) => {
  try {
    OrganizationRoleModel.countDocuments({
      'organization_id': req.params.id,
      'role': 'admin'
    }).then(totalOrganization => {
      if (totalOrganization > 1) {
        OrganizationRoleModel.deleteOne({ 'organization_id': req.params.id, 'user_id': req.userInfo._id }, async (err) => {
          if (!err) {
            await UserModel.findOneAndUpdate({ _id: req.userInfo._id },
              { $pull: { "organizationOrder": ObjectId(req.params.id) } });

            const response = commonUtils.genSuccessResponse(resStatusCode.success, req.t('SUCCESS'));
            return res.status(response.statusCode).json(response);
          } else {

            const response = commonUtils.genErrorResponse(resStatusCode.error.internalServerError, req.t('ERROR'), err);
            return res.status(response.statusCode).json(response);
          }
        });
      } else {
        leaveOrganizationHelper(req, res)
      }
    })
  } catch (err) {
    const response = await commonUtils.genErrorResponse(resStatusCode.error.internalServerError, req.t('ERROR'), err);
    return res.status(response.statusCode).json(response);
  }
}
organizationContoller.removeUsers = async (req, res) => {
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
          if (users[i] != req.orgInfo.owner) {
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
        organization_id: req.body.organization_id,

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
      OrganizationRoleModel.deleteMany(query, (error) => {
        if (error) {
          const response = commonUtils.genErrorResponse(resStatusCode.error.internalServerError, req.t('ERROR'), error);
          return res.status(response.statusCode).json(response);
        } else {
          UserModel.updateMany({
            _id: {
              $in: id
            }
          }, { $pull: { "organizationOrder": req.body.organization_id } },
            async (err, result) => {
              const response = commonUtils.genSuccessResponse(resStatusCode.success, req.t('ORG_USER_DELETE_SUCCESS'));
              return res.status(response.statusCode).json(response);
            })

        }
      });
    }
  } catch (err) {
    const response = commonUtils.genErrorResponse(resStatusCode.error.internalServerError, req.t('ERROR'), err);
    return res.status(response.statusCode).json(response);
  }
}
organizationContoller.changeOrder = async (req, res) => {
  try {
    // req.body.organizations.forEach(async (element, index) => {
    //   await organizationUtils.updateOrganization({ _id: element }, { displayOrder: index });
    // });
    // promiseArray = _.map(req.body.organizations,(value, index) => {
    //   return ObjectId(value);
    // });
    await userUtils.updateUser({ _id: req.userInfo._id }, { organizationOrder: req.body.organizations })
    const response = await commonUtils.genSuccessResponse(resStatusCode.success, req.t('REORDER_SUCCESS'));
    return res.status(response.statusCode).json(response);
  } catch (err) {
    const response = await commonUtils.genErrorResponse(resStatusCode.error.internalServerError, req.t('ERROR'), err);
    return res.status(response.statusCode).json(response);
  }
}
organizationContoller.getOrgProfile = async (req, res) => {
  try {
    const { marketWorkspaceId } = req.params;
    const workspaceInfo = await organizationUtils.findMarketWorkspace({ _id: marketWorkspaceId }, { workspace_id: 1 }).populate({
      path: 'workspace_id',
      'select': '_id  name organization_id',
    });
    let orginfo = await OrganizationModel.findOne({ _id: workspaceInfo.workspace_id.organization_id }, {}).populate({
      path: 'owner',
      'select': '_id  firstName lastName email website',
    });
    if (orginfo) {
      orginfo = orginfo.toObject();
    }
    orginfo.userInfo = await BusinessModel.findOne({ owner: orginfo.owner });
    const response = await commonUtils.genSuccessResponse(resStatusCode.success, req.t('REORDER_SUCCESS'), orginfo);
    return res.status(response.statusCode).json(response);
  } catch (err) {
    const response = await commonUtils.genErrorResponse(resStatusCode.error.internalServerError, req.t('ERROR'), err);
    return res.status(response.statusCode).json(response);
  }
}
organizationContoller.getAllOrganization = async (req, res) => {
  try {
    const promiseArray = [];

    await Promise.all(_.map(req.userInfo.organizationOrder, async (org) => {

      const orgInfo = await OrganizationModel.findOne({ _id: org })
      if (orgInfo) {
        const workspaces = await WorkspaceModel.find({ organization_id: orgInfo._id });
        const mappedRecord = orgInfo.toObject();
        if (workspaces.length > 0) {
          mappedRecord.workspaces = workspaces;
          promiseArray.push(mappedRecord)
        }
      }

    }));
    const response = await commonUtils.genSuccessResponse(resStatusCode.success, req.t('REORDER_SUCCESS'), promiseArray);
    return res.status(response.statusCode).json(response);
  } catch (err) {
    const response = await commonUtils.genErrorResponse(resStatusCode.error.internalServerError, req.t('ERROR'), err);
    return res.status(response.statusCode).json(response);
  }
}
organizationContoller.getAllOrganizationWithWorkspace = async (req, res) => {

  try {

    const promiseArray = [];

    await Promise.all(_.map(req.userInfo.organizationOrder, async (org) => {

      let orgInfo = await OrganizationModel.findOne({ _id: org })

      if (orgInfo) {

        let orgRole = await organizationUtils.findOrganizationRole(
          {
            user_id: req.userInfo._id,
            organization_id: orgInfo._id
          },
          {
            role: 1,
            _id: 0
          }
        );

        orgInfo = JSON.parse(JSON.stringify(orgInfo));
        orgInfo.role = orgRole.role;

        const mappedRecord = orgInfo;

        const workspaces = await WorkspaceModel.aggregate(
          [
            {
              '$match': {
                'organization_id': ObjectId(orgInfo._id)
              }
            }, {
              '$lookup': {
                'from': 'workspaceroles',
                'localField': '_id',
                'foreignField': 'workspace_id',
                'as': 'workspaceRoles'
              }
            }, {
              '$unwind': '$workspaceRoles'
            }, {
              '$match': {
                'workspaceRoles.user_id': ObjectId(req.userInfo._id)
              }
            }
          ], async (error, usersWorkspaces) => {
            orgInfo.workspaces = usersWorkspaces;
            // console.log(usersWorkspaces)
            promiseArray.push(orgInfo)
          });

      }

    }));

    const response = await commonUtils.genSuccessResponse(resStatusCode.success, req.t('REORDER_SUCCESS'), promiseArray);
    return res.status(response.statusCode).json(response);

  } catch (err) {

    const response = await commonUtils.genErrorResponse(resStatusCode.error.internalServerError, req.t('ERROR'), err);
    return res.status(response.statusCode).json(response);
  }
}
organizationContoller.getAllMembersEmployeesOfOrgsAndWS = async (req, res) => {
  try {
    const promiseArray = [];

    await Promise.all(_.map(req.userInfo.organizationOrder, async (org) => {

      let orgInfo = await OrganizationModel.findOne({ _id: org })


      if (orgInfo) {
        let orgRole = await organizationUtils.findOrganizationRole({ user_id: req.userInfo._id, organization_id: orgInfo._id }, { role: 1, _id: 0 });

        orgInfo = JSON.parse(JSON.stringify(orgInfo));

        if (orgRole) {
          orgInfo.role = orgRole.role;
        }

        let mappedRecord = {};

        const orgRoles = await OrganizationModel.aggregate(
          [
            {
              '$match': {
                '_id': ObjectId(orgInfo._id)
              }
            },
            {
              '$lookup': {
                'from': 'organizationroles',
                'localField': '_id',
                'foreignField': 'organization_id',
                'as': 'organizationroles'
              }
            }, {
              '$lookup': {
                'from': 'users',
                'localField': 'organizationroles.user_id',
                'foreignField': '_id',
                'as': 'users'
              }
            },
          ], async (error, orgRoles) => {
            mappedRecord.organizationwithroles = orgRoles

            if (mappedRecord.organizationwithroles) {
              mappedRecord.organizationwithroles.map((organizationwithrole) => {
                organizationwithrole.users.map((user) => {
                  let userData = {
                    '_id': user._id,
                    'firstName': user.firstName,
                    'lastName': user.lastName,
                    'email': user.email,
                    'avatar': user.avatar,
                  }
                  if (!promiseArray.filter(promiseObj => promiseObj.email === user.email).length) {
                    promiseArray.push(userData)
                  }
                })
              })
            }
          });

        const workspaces = await WorkspaceModel.aggregate(
          [
            {
              '$match': {
                'organization_id': ObjectId(orgInfo._id)
              }
            },
            {
              '$lookup': {
                'from': 'workspaceroles',
                'localField': '_id',
                'foreignField': 'workspace_id',
                'as': 'workspaceroles'
              }
            }, {
              '$lookup': {
                'from': 'users',
                'localField': 'workspaceroles.user_id',
                'foreignField': '_id',
                'as': 'users'
              }
            },
          ], async (error, usersWorkspaces) => {
            usersWorkspaces.map((workspace) => {
              workspace.users.map((user) => {
                let userData = {
                  '_id': user._id,
                  'firstName': user.firstName,
                  'lastName': user.lastName,
                  'email': user.email,
                  'avatar': user.avatar,
                }
                if (!promiseArray.filter(promiseObj => promiseObj.email === user.email).length) {
                  promiseArray.push(userData)
                }
              })
            })
          });
      }

    }));

    const response = await commonUtils.genSuccessResponse(resStatusCode.success, req.t('SUCCESS'), promiseArray);
    return res.status(response.statusCode).json(response);

  } catch (err) {
    const response = await commonUtils.genErrorResponse(resStatusCode.error.internalServerError, req.t('ERROR'), err);
    return res.status(response.statusCode).json(response);
  }
}
organizationContoller.getAllMembersEmployeesOfOrgAndWS = async (req, res) => {
  try {

    const params = req.params;
    const organization_id = params.id;

    const promiseArray = [];

    let orgInfo = await OrganizationModel.findOne({ _id: organization_id })


    if (orgInfo) {
      let orgRole = await organizationUtils.findOrganizationRole({ user_id: req.userInfo._id, organization_id: orgInfo._id }, { role: 1, _id: 0 });

      orgInfo = JSON.parse(JSON.stringify(orgInfo));

      if (orgRole) {
        orgInfo.role = orgRole.role;
      }

      let mappedRecord = {};

      const orgRoles = await OrganizationModel.aggregate(
        [
          {
            '$match': {
              '_id': ObjectId(orgInfo._id)
            }
          },
          {
            '$lookup': {
              'from': 'organizationroles',
              'localField': '_id',
              'foreignField': 'organization_id',
              'as': 'organizationroles'
            }
          }, {
            '$lookup': {
              'from': 'users',
              'localField': 'organizationroles.user_id',
              'foreignField': '_id',
              'as': 'users'
            }
          },
        ], async (error, orgRoles) => {
          mappedRecord.organizationwithroles = orgRoles

          if (mappedRecord.organizationwithroles) {
            mappedRecord.organizationwithroles.map((organizationwithrole) => {
              organizationwithrole.users.map((user) => {
                let userData = {
                  '_id': user._id,
                  'firstName': user.firstName,
                  'lastName': user.lastName,
                  'email': user.email,
                  'avatar': user.avatar,
                }
                if (!promiseArray.filter(promiseObj => promiseObj.email === user.email).length) {
                  promiseArray.push(userData)
                }
              })
            })
          }
        });

      // const workspaces = await WorkspaceModel.aggregate(
      // [
      //   {
      //     '$match': {
      //       'organization_id': ObjectId(orgInfo._id)
      //     }
      //   },
      //   {
      //     '$lookup': {
      //       'from': 'workspaceroles', 
      //       'localField': '_id', 
      //       'foreignField': 'workspace_id', 
      //       'as': 'workspaceroles'
      //     }
      //   }, {
      //     '$lookup': {
      //       'from': 'users', 
      //       'localField': 'workspaceroles.user_id', 
      //       'foreignField': '_id', 
      //       'as': 'users'
      //     }
      //   },
      // ],async (error, usersWorkspaces) => {
      //   usersWorkspaces.map((workspace) => {
      //     workspace.users.map((user)=>{
      //       let userData = {
      //         '_id': user._id,
      //         'firstName': user.firstName,
      //         'lastName': user.lastName,
      //         'email': user.email,
      //         'avatar': user.avatar,
      //       }
      //       if(!promiseArray.filter(promiseObj => promiseObj.email === user.email).length){
      //         promiseArray.push(userData)
      //       }
      //     })
      //   })
      // });        
    }

    const response = await commonUtils.genSuccessResponse(resStatusCode.success, req.t('SUCCESS'), promiseArray);
    return res.status(response.statusCode).json(response);

  } catch (err) {
    const response = await commonUtils.genErrorResponse(resStatusCode.error.internalServerError, req.t('ERROR'), err);
    return res.status(response.statusCode).json(response);
  }
}
organizationContoller.getAllMembersOfWS = async (req, res) => {
  try {

    const params = req.params;
    const workspace_id = params.id;

    const promiseArray = [];

    let mappedRecord = {};

    const workspaces = await WorkspaceModel.aggregate(
      [
        {
          '$match': {
            '_id': ObjectId(workspace_id)
          }
        },
        {
          '$lookup': {
            'from': 'workspaceroles',
            'localField': '_id',
            'foreignField': 'workspace_id',
            'as': 'workspaceroles'
          }
        }, {
          '$lookup': {
            'from': 'users',
            'localField': 'workspaceroles.user_id',
            'foreignField': '_id',
            'as': 'users'

          }
        },
      ], async (error, usersWorkspaces) => {
        usersWorkspaces.map((workspace) => {
          workspace.users.map((user, index) => {
            let workspaceRole = workspace.workspaceroles[index].role;
            let userData = {
              '_id': user._id,
              'firstName': user.firstName,
              'lastName': user.lastName,
              'email': user.email,
              'avatar': user.avatar,
              'role': workspaceRole
            }
            if (!promiseArray.filter(promiseObj => promiseObj.email === user.email).length) {
              promiseArray.push(userData)
            }
          })
        })
      });

    const response = await commonUtils.genSuccessResponse(resStatusCode.success, req.t('SUCCESS'), promiseArray);
    return res.status(response.statusCode).json(response);

  } catch (err) {
    const response = await commonUtils.genErrorResponse(resStatusCode.error.internalServerError, req.t('ERROR'), err);
    return res.status(response.statusCode).json(response);
  }
}
organizationContoller.getOrgDetail = async (req, res) => {
  try {
    const orgInfo = await OrganizationModel.findOne({ _id: req.params.id }).populate({
      path: 'owner', select: "_id firstName lastName email website",
      populate: [{
        path: 'organization_id',
        select: '_id name',
      }]
    }).populate({
      path: 'workspaces', select: "_id"
    });
    const mappedRecord = orgInfo.toObject();
    mappedRecord.userInfo = await BusinessModel.findOne({ owner: orgInfo.owner._id }, { businessURL: 1, email: 1, businessDescription: 1 });
    if (orgInfo && orgInfo.workspaces.length > 0) {
      let ids = [];
      for (i = 0; i < orgInfo.workspaces.length; i++) {
        ids.push(ObjectId(orgInfo.workspaces[i]._id))
      }
      const workspaces = await MarketWorkspaceModel.aggregate([
        { $match: { workspace_id: { $in: ids }, clone: true } },
        {
          '$addFields': {
            'ratingAverage': { '$avg': '$usersRatings.rating' }
          }
        },
        {
          $lookup: {
            from: 'users',
            localField: 'owner',
            foreignField: '_id',
            as: 'user'
          },
        },
        {
          $lookup: {
            from: 'businesses',
            localField: 'owner',
            foreignField: 'owner',
            as: 'profile'
          },
        },
        {
          $unwind: {
            preserveNullAndEmptyArrays: true,
            path: '$user'
          }
        },
        {
          $unwind: {
            preserveNullAndEmptyArrays: true,
            path: '$profile'
          }
        },
        {
          '$sort': { ratingAverage: -1, createdAt: -1 }
        },
      ]).exec(async (err, workspaces) => {
        mappedRecord.workspaces = workspaces;
        const response = await commonUtils.genSuccessResponse(resStatusCode.success, req.t('SUCCESS'), mappedRecord);
        return res.status(response.statusCode).json(response);
      })

    } else {
      const response = await commonUtils.genSuccessResponse(resStatusCode.success, req.t('SUCCESS'), mappedRecord);
      return res.status(response.statusCode).json(response);
    }

  } catch (err) {
    const response = await commonUtils.genErrorResponse(resStatusCode.error.internalServerError, req.t('ERROR'), err);
    return res.status(response.statusCode).json(response);
  }
}
organizationContoller.orgBannerIng = async (req, res) => {
  try {
    let fname = req.orgInfo.slug;
    const configData = { owner: req.userInfo._id, fname, thumbTypes: [] };
    const attachmentData = await commonUtils.uploadFile(req.files.banner, constant.pictureTypes.orgBanner, configData);
    const banner = attachmentData.attachment ? attachmentData.attachment.path : '';
    await organizationUtils.updateOrganization({ _id: req.orgInfo._id }, { bannerImg: banner });
    const response = commonUtils.genSuccessResponse(resStatusCode.success, req.t('SUCCESS'));
    return res.status(response.statusCode).json(response);
  } catch (err) {
    const response = await commonUtils.genErrorResponse(resStatusCode.error.internalServerError, req.t('ERROR'), err);
    return res.status(response.statusCode).json(response);
  }
}
organizationContoller.getOrgSeat = async (req, res) => {
  try {

    let result = {
      totalSeats: 10,
      availableSeats: 2
    }

    const response = await commonUtils.genSuccessResponse(resStatusCode.success, req.t('SUCCESS'), result);
    return res.status(response.statusCode).json(response);


  } catch (err) {
    const response = await commonUtils.genErrorResponse(resStatusCode.error.internalServerError, req.t('ERROR'), err);
    return res.status(response.statusCode).json(response);
  }
}
organizationContoller.getOrgFilesSize = async (req, res) => {
  try {
    const orgId = req.params.id;
    const sizeData = await commonUtils.getOrgFilesSize(orgId);

    const response = await commonUtils.genSuccessResponse(resStatusCode.success, req.t('SUCCESS'), sizeData);
    return res.status(response.statusCode).json(response);


  } catch (err) {
    const response = await commonUtils.genErrorResponse(resStatusCode.error.internalServerError, req.t('ERROR'), err);
    return res.status(response.statusCode).json(response);
  }
}

organizationContoller.getAllWorkspaces = async (req, res) => {
  try {

   
    const isSuperAdmin = req.userInfo.isSuperAdmin;
    const authUserId = req.userInfo._id;

    console.log('isSuperAdmin', isSuperAdmin)
    console.log('authUserId', authUserId)

    const queryString = req.query;
    let response = {
      data : []
    };
    if (queryString && !_.isEmpty(queryString)) {
      let match;
      let limit = 500;
      if (queryString.search) {

        match = {
          'name': {
            '$regex': new RegExp(queryString.search, 'ig'),
          }
        };

        if (!isSuperAdmin){
          match = {
            'name': {
              '$regex': new RegExp(queryString.search, 'ig'),
            },
            'owner': ObjectId(authUserId)
          };
        }
      
        WorkspaceModel.aggregate([
          { '$match': match },
          {
            '$sort': { createdAt: -1 }
          },
          {
            $lookup:
            {
              from: "users",
              localField: "owner",
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
          { '$limit': limit },
          {
            $project: {
              _id: 1,
              name: 1,
              description: 1,
              slug: 1,
              shortid: 1,
              user: {
                firstName: 1,
                lastName: 1,
              },
              isPaid: 1
            }
          }
        ]).exec((err, org) => {
          response.data.push(...org);
          res.json(response);
        })
      }
    }
    else {
      res.json(response);
    }

    return res;

    } catch (err) {
      const response = await commonUtils.genErrorResponse(resStatusCode.error.internalServerError, req.t('ERROR'), err);
      return res.status(response.statusCode).json(response);
    }
}

organizationContoller.storePaidWorkspaces = async (req, res) => {
  try {

    let data = req.body;
    let updateData = {};
    let workspaces = req.body.workspaces;
    
    if(workspaces.length){
      workspaces.forEach(async (resData) => {
        if(resData.paymentOptions.length){
          updateData = {};
          updateData.isPaid = true;
          updateData.removeFromGroup = data.removeFromGroup;
          updateData.requireReSubscription = data.requireReSubscription;
          updateData.isMultipleTiers = data.isMultipleTiers;
          updateData.isUpsell = resData.isUpsell;
          updateData.upsell = resData.upsell;
          updateData.paymentOptions = resData.paymentOptions;
          await WorkspaceUtils.updateWorkspace({ _id: ObjectId(resData._id) }, updateData);

          // REMOVE FROM WORKSPACE WHERE ROLE IS NOT ADMIN
          if(data.removeFromGroup){
            await WorkspaceUtils.findWorkspaceRoles({ workspace_id: ObjectId(resData._id) }).then((workspaceRoledata) => {
              workspaceRoledata.forEach( async (workspaceRole) => {
                if (workspaceRole.role !== 'admin'){
                  await WorkspaceUtils.deleteWorkspaceRole({ _id: ObjectId(workspaceRole._id) })
                }
              });
            });
          }
          // REMOVE FROM WORKSPACE END

          // REMOVE FROM WORKSPACE SUBSCRIPTIONS WHERE ROLE IS NOT ADMIN
          if(data.requireReSubscription){
            await WorkspaceSubscriptionModel.deleteMany({ workspace_id: ObjectId(resData._id) });
          }
          // REMOVE FROM WORKSPACE SUBSCRIPTIONS END
        }
      });
    }

    const response = await commonUtils.genSuccessResponse(resStatusCode.success, 'Paid Group Created!', 'Paid Group Created!');
    res.status(response.statusCode).json(response);


  } catch (err) {
    const response = await commonUtils.genErrorResponse(resStatusCode.error.internalServerError, req.t('ERROR'), err);
    return res.status(response.statusCode).json(response);
  }
}

module.exports = organizationContoller
