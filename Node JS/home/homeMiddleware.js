const homeUtils = require('./homeUtils');
const organizationUtils = require("../organization/organizationUtils");
const workspaceUtils = require("../workspace/workspaceUtils");
const commonUtils = require('../../../helper/commonUtils');
const { resStatusCode } = require('../../../helper/constant');
const homeMiddleware = {}
const _ = require('lodash')
const mongoose = require('mongoose');
const { ObjectId } = mongoose.Types;
const mainActivities = mongoose.model('mainActivities');

homeMiddleware.checkData = async (req, res, next) => {
  try {
    if (req.body.organization_id && req.body.organization_id != 'undefined' && req.body.organization_id != undefined) {
      const data = await organizationUtils.findOrganization({ _id: req.body.organization_id }, { fname: 1, name: 1 });
      req.orgInfo = data;
      return next()
    } else if (req.body.workspace_id && req.body.workspace_id != 'undefined' && req.body.workspace_id != undefined) {
      const workspace = await workspaceUtils.findWorkspace({ _id: req.body.workspace_id }, { fname: 1, name: 1, organization_id: 1 }).populate({
        path: 'organization_id',
        select: '_id slug',
      });
      req.wsInfo = workspace;
      return next()
    } else {
      return next();
    }
  } catch (err) {
    const response = await commonUtils.genErrorResponse(resStatusCode.error.internalServerError, req.t('ERROR'), err);
    return res.status(response.statusCode).json(response);
  }
}

homeMiddleware.getPost = async (req, res, next) => {
  try {
    const data = await homeUtils.findMainActivity({ _id: req.params.id }).populate({
      path: 'workspace_id',
      select: '_id organization_id slug fname',
      populate: [{
        path: 'organization_id',
        select: '_id slug',
      }]
    }).populate({
      path: 'organization_id',
      select: '_id slug fname',
    });
    if (data) {
      req.activity = data;
      return next();
    } else {
      const response = await commonUtils.genErrorResponse(resStatusCode.error.notFound, req.t('NO_DATA_FOUND'));
      return res.status(response.statusCode).json(response);
    }
  } catch (err) {
    const response = await commonUtils.genErrorResponse(resStatusCode.error.internalServerError, req.t('ERROR'), err);
    return res.status(response.statusCode).json(response);
  }
}
homeMiddleware.getActivity = async (req, res, next) => {
  try {
    const data = await homeUtils.findMainActivity({ _id: req.body.activity_id }).populate({
      path: 'organization_id',
      select: '_id slug',
    });
    if (data) {
      req.activityInfo = data;
      return next()
    } else {
      const response = await commonUtils.genErrorResponse(resStatusCode.error.notFound, req.t('NO_DATA_FOUND'));
      return res.status(response.statusCode).json(response);
    }
  } catch (err) {
    const response = await commonUtils.genErrorResponse(resStatusCode.error.internalServerError, req.t('ERROR'), err);
    return res.status(response.statusCode).json(response);
  }
}
homeMiddleware.getShareActivity = async (req, res, next) => {
  try {

    const share = await homeUtils.findMainActivity({ post_id: ObjectId(req.body.activity_id), user_id: req.userInfo._id });

    if (share && !_.isEmpty(share)) {
      const response = await commonUtils.genSuccessResponse(resStatusCode.success, req.t('ERROR'), 'Post already shared');
      return res.status(response.statusCode).json(response);
    } else {
      const data = await homeUtils.findMainActivity({ _id: req.body.activity_id }).populate({
        path: 'organization_id',
        select: '_id slug',
      });
      if (data) {
        req.activityInfo = data;
        return next()
      } else {
        const response = await commonUtils.genErrorResponse(resStatusCode.error.notFound, req.t('NO_DATA_FOUND'));
        return res.status(response.statusCode).json(response);
      }
    }


  } catch (err) {
    const response = await commonUtils.genErrorResponse(resStatusCode.error.internalServerError, req.t('ERROR'), err);
    return res.status(response.statusCode).json(response);
  }
}
homeMiddleware.getComment = async (req, res, next) => {
  try {
    const data = await homeUtils.findComment({ _id: req.params.id }).populate({
      path: 'activity_id',
      select: '_id organization_id',
      populate: [{
        path: 'organization_id',
        select: '_id slug',
      }]
    });
    if (data) {
      req.commentInfo = data;

      return next();
    } else {
      const response = await commonUtils.genErrorResponse(resStatusCode.error.notFound, req.t('NO_DATA_FOUND'));
      return res.status(response.statusCode).json(response);
    }
  } catch (err) {
    const response = await commonUtils.genErrorResponse(resStatusCode.error.internalServerError, req.t('ERROR'), err);
    return res.status(response.statusCode).json(response);
  }
}
homeMiddleware.findMainActivityOfPostCreated = async (req, res, next) => {
  try {

    const data = await mainActivities.findOne({ _id: req.body.activity_id, activity_sub_type: "CREATED_POST" }, { _id: 1 });

    if (data) {
      req.mainActivityId = data._id;
      return next();
    }
    const response = await commonUtils.genErrorResponse(resStatusCode.error.badRequest, req.t('INVALID_ERR'));
    return res.status(response.statusCode).json(response);
  } catch (err) {
    const response = await commonUtils.genErrorResponse(resStatusCode.error.internalServerError, req.t('ERROR'), err);
    return res.status(response.statusCode).json(response);
  }
}
homeMiddleware.getAllPost = async (req, res, next) => {
  try {
    const data = await homeUtils.findMainAllActivity({
      '$or': [
        { '_id': ObjectId(req.params.id) },
        { 'post_id': ObjectId(req.params.id) },
      ],
    }, { _id: 1 });
    if (data) {
      let ids = [];
      for (let i = 0; i < data.length; i++) {
        ids.push(ObjectId(data[i]._id));
      }
      req.activityIds = ids;
      return next();
    } else {
      const response = await commonUtils.genErrorResponse(resStatusCode.error.notFound, req.t('NO_DATA_FOUND'));
      return res.status(response.statusCode).json(response);
    }
  } catch (err) {
    const response = await commonUtils.genErrorResponse(resStatusCode.error.internalServerError, req.t('ERROR'), err);
    return res.status(response.statusCode).json(response);
  }
}
module.exports = homeMiddleware
