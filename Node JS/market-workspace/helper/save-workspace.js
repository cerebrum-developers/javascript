'use strict';
const mongoose = require('mongoose');

const { ObjectId } = mongoose.Types;
const categoryUtils = require("../../category/categoryUtils");

const async = require('async');

const _ = require('lodash');
const commonUtils = require('../../../../helper/commonUtils');
const { resStatusCode } = require('../../../../helper/constant');

const MarketWorkspace = mongoose.model('MarketWorkspace');
const addWorkspacesTemplates = (req, res) => {

  let templateData = req.body;
  // save templates data
  let saveTemplates = (callback) => {
    let parse = JSON.parse(templateData.categories)
    let categories = _.map(parse, (item) => {
      return item._id;

    });
    const marketWS = new MarketWorkspace();
    marketWS.title = templateData.title;
    marketWS.description = templateData.description;
    marketWS.image = templateData.image;
    marketWS.language = templateData.language;
    marketWS.owner = req.userInfo._id;
    marketWS.categories = categories;
    marketWS.published = templateData.published? true:false
    marketWS.workspace_id = templateData.workspace_id;
    marketWS.save((err, result) => {
      if (err) {
        callback(err);
      } else {
        callback(null, result);
      }
    });
  };
  let addToPredefinedWorkspaces = async (marketWs, callback) => {
    if (req.userInfo.isSuperAdmin === true && marketWs && marketWs.published) {
      if (marketWs.workspace_id && (marketWs.categories.length > 0)) {
        let mappedResult = await Promise.all(_.map(marketWs.categories, async (categoryId) => {
          let wsData = await categoryUtils.findPredefinedWorkspace({ categoryId: categoryId });
          if (wsData) {
            let availableWorkspace = wsData.workspaces.includes(marketWs.workspace_id);
            if (!availableWorkspace) {
              await categoryUtils.updatePredefinedWorkspace({ categoryId: categoryId }, { $push: { workspaces: ObjectId(marketWs.workspace_id) } });
            }
          } else {
            let preDefindWS = {
              categoryId: categoryId,
              workspaces: [marketWs.workspace_id],
              user_id: req.userInfo._id
            }
            await categoryUtils.addPredefinedWorkspace(preDefindWS)
          }
        }))
        callback(null, marketWs)
      } else {
        callback(null, marketWs);
      }
    } else {
      callback(null, marketWs);
    }
  };
  async.waterfall([saveTemplates, addToPredefinedWorkspaces], (err, workspaceData) => {
  
    if (err) {
      const response = commonUtils.genErrorResponse(resStatusCode.error.internalServerError, req.t('ERROR'), err);
      return res.status(400).json(response);
    }
    const response = commonUtils.genSuccessResponse(resStatusCode.created, req.t('WS_ADD_SUCCESS'), workspaceData);
    return res.status(response.statusCode).json(response);
  });
};

module.exports = addWorkspacesTemplates;