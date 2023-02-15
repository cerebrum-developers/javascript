const marketWorkspaceUtils = require('./market-workspaceUtils');
const _ = require('lodash');
const commonUtils = require('../../../helper/commonUtils');
const { resStatusCode, activity_type } = require('../../../helper/constant');
const sendNotification = require('../../../helper/send-notification');
const workspaceUtils = require('../workspace/workspaceUtils');
const mongoose = require('mongoose');
const moment = require("moment");
const { ObjectId } = mongoose.Types;
const { MarketWorkspaceModel, MarketCommentModel, WorkspaceModel, OrgFollowModel } = require('../../../helper/models')
const marketWorkspaceContoller = {}
let saveWorkspaceHelper = require("./helper/save-workspace");
let editWorkspaceHelper = require("./helper/edit-workspace");
let workspaceListHelper = require("./helper/workspace-list");
let detailWorkspaceHelper = require("./helper/detail-workspace");
let publicDetailWorkspaceHelper = require("./helper/public-detail-workspace")
let cloneWorkspaceHelper = require("./helper/clone-workspace");
let cloneExistsWorkspaceHelper = require("./helper/clone-exists-workspace");
let cloneNewWorkspace = require("./helper/new-workspace");
const activityTemplate = require('../../../helper/activity');
const Activity = require('../../../helper/logActivity');
const rejectHtml = require('../../../templates/workspace-reject.html');
const approveHtml = require('../../../templates/workspace-approve.html');

let mainActivity = require('../../../helper/mainActivity');
marketWorkspaceContoller.addMarketWorkspace = async (req, res) => {
  try {
    saveWorkspaceHelper(req, res);
  } catch (err) {
    const response = commonUtils.genErrorResponse(resStatusCode.error.internalServerError, req.t('ERROR'), err);
    return res.status(response.statusCode).json(response);
  }
}
marketWorkspaceContoller.editMarketWorkspace = async (req, res) => {
  try {
    editWorkspaceHelper(req, res);
  } catch (err) {
    const response = commonUtils.genErrorResponse(resStatusCode.error.internalServerError, req.t('ERROR'), err);
    return res.status(response.statusCode).json(response);
  }
}

marketWorkspaceContoller.getMarketWorkspaces = async (req, res) => {
  try {
    workspaceListHelper(req, res)

  } catch (err) {
    const response = commonUtils.genErrorResponse(resStatusCode.error.internalServerError, req.t('ERROR'), err);
    return res.status(response.statusCode).json(response);
  }
}
marketWorkspaceContoller.workspaceApproval = async (req, res) => {
  try {
    const userInfo = req.marketWorkspaceInfo.owner
    if (req.userInfo.isSuperAdmin === true) {
      let data = {}
      if (req.body.type === 'reject') {
        let invitationMailBody = rejectHtml.replace('{URL}', process.env.SUBMISSION_URL);
        invitationMailBody = invitationMailBody.replace('{URL1}', process.env.SUBMISSION_URL);
        invitationMailBody = invitationMailBody.replace('{NAME}', req.marketWorkspaceInfo.owner.firstName + ' ' + req.marketWorkspaceInfo.owner.lastName);
        invitationMailBody = invitationMailBody.replace('{WORKSPACE}', req.marketWorkspaceInfo.title);
        commonUtils.sendMail(req.marketWorkspaceInfo.owner.email, invitationMailBody, req.t('WS_REJECT_SUBJECT'));
        data.status = "reject";
        const notificationInfo = '[' + req.userInfo.firstName + ' ' + req.userInfo.lastName + ']' + ' Unfortunately your workspace ' + req.marketWorkspaceInfo.title + ' did not meet the requirements for approval in the Voxxi Marketplace';
        const notificationData = {
          title: 'Notification',
          body: notificationInfo,
          params: {},
        };

        if (userInfo && userInfo.fcmToken && userInfo.isSetUpAccountData.tabEmailNotification &&
          userInfo.isSetUpAccountData.tabEmailNotification.onScreenNotification) {
          const notificationPermissions = userInfo.isSetUpAccountData.tabEmailNotification.onScreenNotification.map(per => per.children);
          if (notificationPermissions.indexOf(1) > -1 || notificationPermissions.indexOf('1') > -1) {
            if (notificationPermissions.indexOf(0) > -1 || notificationPermissions.indexOf('0') > -1) {
              sendNotification(req.marketWorkspaceInfo.owner.fcmToken, notificationData);
            } else {
              sendNotification(req.marketWorkspaceInfo.owner.fcmToken, notificationData);
            }
          }
        }
        await marketWorkspaceUtils.updateMarketWorkspace({ _id: req.marketWorkspaceInfo._id }, data);
        const response = commonUtils.genSuccessResponse(resStatusCode.success, req.t('SUCCESS'));
        return res.status(response.statusCode).json(response);
      } else {
        const notificationInfo = '[' + req.userInfo.firstName + ' ' + req.userInfo.lastName + ']' + ' congratulations, your workspace ' + req.marketWorkspaceInfo.title + ' has been aproved and has been posted in the Voxxi Marketplace';
        const notificationData = {
          title: 'Notification',
          body: notificationInfo,
          params: {},
        };
        if (userInfo && userInfo.fcmToken && userInfo.isSetUpAccountData.tabEmailNotification &&
          userInfo.isSetUpAccountData.tabEmailNotification.onScreenNotification) {
          const notificationPermissions = userInfo.isSetUpAccountData.tabEmailNotification.onScreenNotification.map(per => per.children);
          if (notificationPermissions.indexOf(1) > -1) {
            if (notificationPermissions.indexOf(0) > -1) {
              sendNotification(req.marketWorkspaceInfo.owner.fcmToken, notificationData);
            } else {
              sendNotification(req.marketWorkspaceInfo.owner.fcmToken, notificationData);
            }
          }
        }
        cloneWorkspaceHelper(req, res)
      }
    } else {
      const response = await commonUtils.genErrorResponse(resStatusCode.error.unauthorized, req.t('UNAUTH_ACC'));
      return res.status(response.statusCode).json(response);
    }
  } catch (err) {
    const response = await commonUtils.genErrorResponse(resStatusCode.error.internalServerError, req.t('ERROR'), err);
    return res.status(response.statusCode).json(response);
  }
}

marketWorkspaceContoller.detailMarketWorkspace = async (req, res) => {
  try {
    detailWorkspaceHelper(req, res)

  } catch (err) {
    const response = commonUtils.genErrorResponse(resStatusCode.error.internalServerError, req.t('ERROR'), err);
    return res.status(response.statusCode).json(response);
  }
}

marketWorkspaceContoller.publicDetailMarketWorkspace = async (req, res) => {
  try {
    publicDetailWorkspaceHelper(req, res);
  } catch (err) {
    const response = commonUtils.genErrorResponse(resStatusCode.error.internalServerError, req.t('ERROR'), err);
    return res.status(response.statusCode).json(response);
  }
}

marketWorkspaceContoller.addComment = async (req, res) => {
  try {
    const reqdata = {
      user_id: req.userInfo._id,
      market_id: req.body.market_id,
      comment: req.body.comment
    }
    await marketWorkspaceUtils.addMarketComment(reqdata);
    const response = commonUtils.genSuccessResponse(resStatusCode.success, req.t('MARKET_COMMENT_ADD'), {});
    return res.status(response.statusCode).json(response);
  } catch (err) {
    const response = commonUtils.genErrorResponse(resStatusCode.error.internalServerError, req.t('ERROR'), err);
    return res.status(response.statusCode).json(response);
  }
}
marketWorkspaceContoller.editComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    await marketWorkspaceUtils.updateMarketComment({ _id: commentId }, { comment: req.body.comment });
    const response = commonUtils.genSuccessResponse(resStatusCode.success, req.t('MARKET_COMMENT_UPDATE'), {});
    return res.status(response.statusCode).json(response);
  } catch (err) {
    const response = commonUtils.genErrorResponse(resStatusCode.error.internalServerError, req.t('ERROR'), err);
    return res.status(response.statusCode).json(response);
  }
}
marketWorkspaceContoller.overallRating = async (req, res) => {
  try {
    const { marketId } = req.params;
    const marketWorkspace = await marketWorkspaceUtils.findMarketWorkspace({ _id: marketId }, { usersRatings: 1 })
    // (5*252 + 4*124 + 3*40 + 2*29 + 1*33) / (252+124+40+29+33) = 4.11 and change
    const rating1 = marketWorkspace.usersRatings.map((l) => { return l.rating === 1 ? 1 : 0 });
    const rating2 = marketWorkspace.usersRatings.map((l) => { return l.rating === 2 ? 1 : 0 });
    const rating3 = marketWorkspace.usersRatings.map((l) => { return l.rating === 3 ? 1 : 0 });
    const rating4 = marketWorkspace.usersRatings.map((l) => { return l.rating === 4 ? 1 : 0 });
    const rating5 = marketWorkspace.usersRatings.map((l) => { return l.rating === 5 ? 1 : 0 });
    const total = (rating1.reduce((a, b) => a + b, 0) * 1 + rating2.reduce((a, b) => a + b, 0) * 2 + rating3.reduce((a, b) => a + b, 0) * 3 + rating4.reduce((a, b) => a + b, 0) * 4 + rating5.reduce((a, b) => a + b, 0) * 5) /
      (
        rating1.reduce((a, b) => a + b, 0) +
        rating2.reduce((a, b) => a + b, 0) +
        rating3.reduce((a, b) => a + b, 0) +
        rating4.reduce((a, b) => a + b, 0) +
        rating5.reduce((a, b) => a + b, 0));
    const response = commonUtils.genSuccessResponse(resStatusCode.success, req.t('SUCCESS'), { overallRating: parseInt(total) });
    return res.status(response.statusCode).json(response);
  } catch (err) {
    const response = commonUtils.genErrorResponse(resStatusCode.error.internalServerError, req.t('ERROR'), err);
    return res.status(response.statusCode).json(response);
  }
}
marketWorkspaceContoller.addRatingonMarketPlace = async (req, res) => {
  try {
    const { marketId } = req.params;
    const marketWorkspace = await marketWorkspaceUtils.findMarketWorkspace({ _id: marketId }, { usersRatings: 1 })
    const findMarketId = await MarketWorkspaceModel.findOne({ _id: marketId, 'usersRatings.user_id': req.userInfo._id }, { _id: 1 });
    if (findMarketId) {
      const userRating = [];
      marketWorkspace.usersRatings.forEach(item => {
        if (item.user_id.toString() === req.userInfo._id.toString()) {
          userRating.push({ user_id: item.user_id, rating: req.body.rating })
        } else {
          userRating.push(item);
        }
      });
      await marketWorkspaceUtils.updateMarketWorkspace({ _id: marketId }, { usersRatings: userRating });
    } else {
      await marketWorkspaceUtils.updateMarketWorkspace({ _id: marketId }, {
        $push: {
          usersRatings: {
            user_id: req.userInfo._id,
            rating: req.body.rating
          }
        }
      });
    }
    const response = commonUtils.genSuccessResponse(resStatusCode.success, req.t('RATE_SUBMITTED'), {});
    return res.status(response.statusCode).json(response);
  } catch (err) {
    const response = commonUtils.genErrorResponse(resStatusCode.error.internalServerError, req.t('ERROR'), err);
    return res.status(response.statusCode).json(response);
  }
}
marketWorkspaceContoller.getAllComment = async (req, res) => {
  try {
    const { marketDetailsId } = req.params;
    const promiseArray = [];
    const comment = await MarketCommentModel.find({ market_id: marketDetailsId }, {}, { sort: { created_at: -1 } }).populate({ path: 'user_id', model: 'User', select: { firstName: 1, lastName: 1, avatar: 1 } });
    await Promise.all(_.map(comment, async (item) => {
      const mappedRecord = item.toObject();
      const duration = await marketWorkspaceContoller.duration(item.createdAt, new Date());
      if (duration.milliseconds < 60) {
        mappedRecord.date = duration.milliseconds + ' milliseconds ago';
      } else if (duration.seconds < 60) {
        mappedRecord.date = duration.seconds + ' seconds ago';
      } else if (duration.minutes < 60) {
        mappedRecord.date = duration.minutes + ' minutes ago';
      } else if (duration.hours < 24) {
        mappedRecord.date = duration.hours + ' hours ago';
      } else if (duration.days < 7) {
        mappedRecord.date = duration.days + ' days ago';
      } else if (duration.weekdays < 4) {
        mappedRecord.date = duration.weekdays + ' weekdays ago';
      } else {
        mappedRecord.date = moment(item.createdAt).format("MMM DD, YYYY");
      }
      promiseArray.push(mappedRecord)
    }));
    const response = commonUtils.genSuccessResponse(resStatusCode.success, req.t('success'), promiseArray);
    return res.status(response.statusCode).json(response);
  } catch (err) {
    const response = commonUtils.genErrorResponse(resStatusCode.error.internalServerError, req.t('ERROR'), err);
    return res.status(response.statusCode).json(response);
  }
}

// function duration(t0, t1) {
marketWorkspaceContoller.duration = async function (t0, t1) {
  let d = (new Date(t1)) - (new Date(t0));
  let convert = new Date(d);
  let months = Math.floor(convert.getMonth());
  let weekdays = Math.floor(d / 1000 / 60 / 60 / 24 / 7);
  let days = Math.floor(d / 1000 / 60 / 60 / 24);
  let hours = Math.floor(d / 1000 / 60 / 60);
  let minutes = Math.floor(d / 1000 / 60);
  let seconds = Math.floor(d / 1000);
  let milliseconds = Math.floor(d);
  let t = {};
  ['months', 'weekdays', 'days', 'hours', 'minutes', 'seconds', 'milliseconds'].forEach(q => { if (eval(q) > 0) { t[q] = eval(q); } });
  return t;
}

marketWorkspaceContoller.cloneWorkspaceByChooseOption = async (req, res) => {
  try {
    cloneExistsWorkspaceHelper(req, res)
  } catch (err) {
    const response = commonUtils.genErrorResponse(resStatusCode.error.internalServerError, req.t('ERROR'), err);
    return res.status(response.statusCode).json(response);
  }
}
marketWorkspaceContoller.cloneWorkspaceByName = async (req, res) => {
  try {
    const data = req.body;
    data.owner = req.userInfo._id;
    data.fname = req.body.name.split(' ').join('-').toLowerCase();
    if (!req.body.organization_id) {
      const response = await commonUtils.genErrorResponse(resStatusCode.error.badRequest, req.t('REQ_ORG_ID'));
      return res.status(response.statusCode).json(response);
    }
    WorkspaceModel.countDocuments({
      'organization_id': req.body.organization_id
    }).then(async (totalWorkspace) => {
      data.displayOrder = totalWorkspace;
      const workspaceData = await workspaceUtils.addWorkspace(data);
      req.workspaceInfo = workspaceData;
      if (workspaceData) {
        const workspaceRoleData = {
          user_id: req.userInfo._id,
          email: req.userInfo.email,
          role: 'admin',
          workspace_id: workspaceData._id
        };
        workspaceUtils.addWorkspaceRole(workspaceRoleData);

        const activityText = activityTemplate.addActivityTemplate(req.userInfo.firstName + ' ' + req.userInfo.lastName, workspaceData.name, 'Workspace');
        mainActivity.logMainActivity(req.userInfo._id, workspaceData.organization_id, workspaceData._id, null, null, null, activityText, 'activity', activity_type.createdWorkspace, "", "", '', new Array());
        cloneNewWorkspace(req, res)
        // const response = commonUtils.genSuccessResponse(resStatusCode.success, 'Workspace create successfully.');
        // return res.status(response.statusCode).json(response);
      }
    })
  } catch (err) {
    const response = commonUtils.genErrorResponse(resStatusCode.error.internalServerError, req.t('ERROR'), err);
    return res.status(response.statusCode).json(response);
  }
}

marketWorkspaceContoller.followOrg = async (req, res) => {
  let inpuData = {};

  if (req.body.type === 'follow') {
    if (req.body.followType === 'organization') {
      inpuData = {
        user_id: ObjectId(req.userInfo._id),
        organization_id: ObjectId(req.body.organization_id),
        followType: req.body.followType
      }
    } else if (req.body.followType === 'people') {
      inpuData = {
        user_id: ObjectId(req.userInfo._id),
        following: ObjectId(req.body.following),
        followType: req.body.followType
      }
    }
    await marketWorkspaceUtils.addOrgFollow(inpuData);
    const response = await commonUtils.genSuccessResponse(resStatusCode.success, req.t('FOLLOW_SUBMITTED'), {});
    return res.status(response.statusCode).json(response);
  } else if (req.body.type === 'unfollow') {
    let condition = {};
    if (req.body.followType === 'organization') {
      condition = { user_id: req.userInfo._id, organization_id: req.body.organization_id, followType: req.body.followType }
    } else if (req.body.followType === 'people') {
      condition = { user_id: req.userInfo._id, following: req.body.following, followType: req.body.followType }
    }
    const followingId = await marketWorkspaceUtils.findOneFollow(condition);
    if (followingId) {
      await marketWorkspaceUtils.deleteOrgFollow({ _id: followingId._id })
    }
    const response = await commonUtils.genSuccessResponse(resStatusCode.success, req.t('UNFOLLOW_SUBMITTED'), {});
    return res.status(response.statusCode).json(response);
  }
}

marketWorkspaceContoller.getFollowOrg = async (req, res) => {
  let condition = {};
  if (req.body.followType === 'organization') {
    condition = { user_id: req.userInfo._id, organization_id: req.body.organization_id, followType: req.body.followType }
  } else if (req.body.followType === 'people') {
    condition = { user_id: req.userInfo._id, following: req.body.following, followType: req.body.followType }
  }
  const followInfo = await marketWorkspaceUtils.findOneFollow(condition);
  const response = await commonUtils.genSuccessResponse(resStatusCode.success, req.t('success'), followInfo);
  return res.status(response.statusCode).json(response);
}
module.exports = marketWorkspaceContoller
