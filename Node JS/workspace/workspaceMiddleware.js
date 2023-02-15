const workspaceUtils = require('./workspaceUtils')
const commonUtils = require('../../../helper/commonUtils')
const { resStatusCode } = require('../../../helper/constant')
const { MainActivitiesModel } = require('../../../helper/models');

const workspaceMiddleware = {}

workspaceMiddleware.duplicateNameValidator = async (req, res, next) => {
  try {
    if (req.body.name) {
      const data = await workspaceUtils.findWorkspace({ name: req.body.name });

      if (!data) {
        return next();
      }
      const response = commonUtils.genErrorResponse(resStatusCode.error.duplicateFound, req.t('ERR_ORG_EXIST'));
      return res.status(response.statusCode).json(response);
    }
    return next()
  } catch (err) {
    const response = commonUtils.genErrorResponse(resStatusCode.error.internalServerError, req.t('ERROR'), err);
    return res.status(response.statusCode).json(response);
  }
}

workspaceMiddleware.findWorkspaceById = async (req, res, next) => {
  try {
    const data = await workspaceUtils.findWorkspace({ organization_id: req.body.organization_id });
    if (data) {
      req.workspaceInfo = data;
      return next();
    }
    const response = await commonUtils.genErrorResponse(resStatusCode.error.badRequest, req.t('ERR_VALID_ORGID'));
    return res.status(response.statusCode).json(response);
  } catch (err) {
    const response = await commonUtils.genErrorResponse(resStatusCode.error.internalServerError, req.t('ERROR'), err);
    return res.status(response.statusCode).json(response);
  }
}
workspaceMiddleware.findWorkspaceByWorskpaceId = async (req, res, next) => {
  try {
    const data = await workspaceUtils.findWorkspace({ _id: req.body.workspace_id });
    if (data) {
      req.workspaceInfo = data;
      return next();
    }
    const response = await commonUtils.genErrorResponse(resStatusCode.error.badRequest, req.t('ERR_VALID_ORGID'));
    return res.status(response.statusCode).json(response);
  } catch (err) {
    const response = await commonUtils.genErrorResponse(resStatusCode.error.internalServerError, req.t('ERROR'), err);
    return res.status(response.statusCode).json(response);
  }
}
workspaceMiddleware.duplicateWsNameValidator = async (req, res, next) => {
  try {
    if (req.body.name) {
      const data = await workspaceUtils.findWorkspace({ name: req.body.name, organization_id: req.body.organization_id });

      if (!data) {
        return next();
      }
      const response = commonUtils.genErrorResponse(resStatusCode.error.duplicateFound, req.t('ERR_WS_EXIST'));
      return res.status(response.statusCode).json(response);
    }
    return next();
  } catch (err) {
    const response = commonUtils.genErrorResponse(resStatusCode.error.internalServerError, req.t('ERROR'), err);
    return res.status(response.statusCode).json(response);
  }
}
workspaceMiddleware.findWorkspaceByIdValidator = async (req, res, next) => {
  try {
    if (req.body.name) {

      const data = await workspaceUtils.findWorkspace({ _id: req.body.workspace_id });
      if (data) {
        req.WSInfo = data;
        return next();
      }
      const response = await commonUtils.genErrorResponse(resStatusCode.error.duplicateFound, req.t('INVALID_ERR'));
      return res.status(response.statusCode).json(response);
    }
    return next();
  } catch (err) {
    const response = await commonUtils.genErrorResponse(resStatusCode.error.internalServerError, req.t('ERROR'), err);
    return res.status(response.statusCode).json(response);
  }
}
workspaceMiddleware.duplicateOrgWsNameValidator = async (req, res, next) => {
  try {
    if (req.body.name) {

      const data = await workspaceUtils.findWorkspace({ name: req.body.name, _id: { '$ne': req.body.workspace_id }, organization_id: req.body.organization_id });
      if (!data) {
        return next();
      }
      const response = commonUtils.genErrorResponse(resStatusCode.error.duplicateFound, req.t('ERR_WS_EXIST'));
      return res.status(response.statusCode).json(response);
    }
    return next()
  } catch (err) {
    const response = commonUtils.genErrorResponse(resStatusCode.error.internalServerError, req.t('ERROR'), err);
    return res.status(response.statusCode).json(response);
  }
}
workspaceMiddleware.validateAssignUserWorkspace = async (req, res, next) => {
  try {
    const data = await workspaceUtils.findWorkspacePopulate({ _id: req.body.workspace_id, organization_id: req.body.organization_id });
    if (data) {
      req.WSInfo = data;
      return next();
    }
    const response = await commonUtils.genErrorResponse(resStatusCode.error.notFound, req.t('INVALID_ERR'));
    return res.status(response.statusCode).json(response);

    return next();
  } catch (err) {
    const response = commonUtils.genErrorResponse(resStatusCode.error.internalServerError, req.t('ERROR'), err);
    return res.status(response.statusCode).json(response);
  }
}
workspaceMiddleware.findWorkspaceRole = async (req, res, next) => {
  try {
    const data = await workspaceUtils.findWorkspaceRole({ workspace_id: req.body.workspace_id,user_id:req.body.user_id });
    if (data) {
      req.roleInfo = data;
      return next();
    }
    const response = await commonUtils.genErrorResponse(resStatusCode.error.badRequest, req.t('INVALID_ERR'));
    return res.status(response.statusCode).json(response);
  } catch (err) {
    const response = await commonUtils.genErrorResponse(resStatusCode.error.internalServerError, req.t('ERROR'), err);
    return res.status(response.statusCode).json(response);
  }
}

workspaceMiddleware.findMainActivityOfWorkspaceCreated = async (req, res, next) => {
  try {
    const {workspace_id } = req.body;
    const data = await MainActivitiesModel.findOne({ workspace_id: workspace_id, activity_sub_type: "CREATED_WORKSPACE"}, {_id: 2});
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
module.exports = workspaceMiddleware
