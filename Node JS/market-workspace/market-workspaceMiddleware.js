const marketWorkspaceUtils = require('./market-workspaceUtils');
const commonUtils = require('../../../helper/commonUtils');
const { resStatusCode } = require('../../../helper/constant');
const marketWorkspaceMiddleware = {}
const workspaceUtils=require("../workspace/workspaceUtils");
const categoryUtils=require("../category/categoryUtils");
marketWorkspaceMiddleware.findWorkspace = async (req, res, next) => {
  try {
    const data = await workspaceUtils.findWorkspace({_id: req.body.workspace_id });
    if (data) {
     req.workspaceInfo=data;
     return next();
    }
    const response = await commonUtils.genErrorResponse(resStatusCode.error.notFound, req.t('ERR_VALID_WS'));
    return res.status(response.statusCode).json(response);
  } catch (err) {
    const response = await commonUtils.genErrorResponse(resStatusCode.error.internalServerError, req.t('ERROR'), err);
    return res.status(response.statusCode).json(response);
  }
}
marketWorkspaceMiddleware.findCategory = async (req, res, next) => {
  try {
    if(req.body.category_id){
    const data = await categoryUtils.findCategory({_id: req.body.category_id });
    if (data) {
     req.categoryInfo=data;
     return next();
    }
    const response = await commonUtils.genErrorResponse(resStatusCode.error.notFound, req.t('NO_DATA_FOUND'));
    return res.status(response.statusCode).json(response);
  }else{
    return next();
  }
  } catch (err) {
    const response = await commonUtils.genErrorResponse(resStatusCode.error.internalServerError, req.t('ERROR'), err);
    return res.status(response.statusCode).json(response);
  }
}
marketWorkspaceMiddleware.findMarketWorkspace = async (req, res, next) => {
  try {
    const data = await marketWorkspaceUtils.findMarketWorkspace({_id: req.body.workspace_id });
    if (data) {
     req.marketWorkspaceInfo=data;
     return next();
    }
    const response = await commonUtils.genErrorResponse(resStatusCode.error.notFound, req.t('ERR_VALID_WS'));
    return res.status(response.statusCode).json(response);
  } catch (err) {
    const response = await commonUtils.genErrorResponse(resStatusCode.error.internalServerError, req.t('ERROR'), err);
    return res.status(response.statusCode).json(response);
  }
}
marketWorkspaceMiddleware.findDetail = async (req, res, next) => {
  try {
    const data = await marketWorkspaceUtils.findMarketWorkspace({_id: req.params.id });
    if (data) {
     req.marketWorkspaceInfo=data;
     return next();
    }
    const response = await commonUtils.genErrorResponse(resStatusCode.error.notFound, req.t('ERR_VALID_WS'));
    return res.status(response.statusCode).json(response);
  } catch (err) {
    const response = await commonUtils.genErrorResponse(resStatusCode.error.internalServerError, req.t('ERROR'), err);
    return res.status(response.statusCode).json(response);
  }
}
module.exports = marketWorkspaceMiddleware
