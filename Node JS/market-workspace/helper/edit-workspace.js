'use strict';
const mongoose = require('mongoose');
const { ObjectId } = mongoose.Types;
const categoryUtils = require("../../category/categoryUtils");
const async = require('async');
const _ = require('lodash');
const commonUtils = require('../../../../helper/commonUtils');
const { resStatusCode } = require('../../../../helper/constant');
const MarketWorkspace = mongoose.model('MarketWorkspace');
const updateWorkspacesTemplates = function (req, res) {
  let templateData = req.body;
  
  let workspace = req.marketWorkspaceInfo;
  let marketWsId = req.params.id;
  // update templates data
  let saveTemplates = function (callback) {
    let parse = JSON.parse(templateData.categories)
    let categories = _.map(parse, (item) => {
      return item._id;

    });
    templateData.published=templateData.published && templateData.published=='true'?true:false
   
    templateData.categories=categories;
    delete templateData.workspace_id;
   
    MarketWorkspace.updateOne({
      _id: marketWsId
    }, {
      $set: templateData
    }, {
      new: true
    }, function (err, doc) {
      if (err) {
        callback(err);
      } else {
        callback(null, doc);
      }
    });
  };
  let addToPredefinedWorkspaces = async (marketWs, callback) => {
   
    if (req.userInfo.isSuperAdmin && marketWs && (templateData.published && templateData.published !== 'false')) {
      if (workspace.workspace_id && (templateData.categories.length > 0)) {
        let mappedResult = await Promise.all(_.map(templateData.categories, async (categoryId) => {
          let wsData = await categoryUtils.findPredefinedWorkspace({ categoryId: categoryId });
          if (wsData) {
            let availableWorkspace = wsData.workspaces.includes(workspace.workspace_id._id);
           
            if (!availableWorkspace) {
              await categoryUtils.updatePredefinedWorkspace({ categoryId: categoryId }, { $push: { workspaces: workspace.workspace_id } });
            }
          } else {
            let preDefindWS = {
              categoryId: categoryId,
              workspaces: [workspace.workspace_id],
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
  async.waterfall([saveTemplates, addToPredefinedWorkspaces], function (err, data) {
    if (err) {
      const response = commonUtils.genErrorResponse(resStatusCode.error.internalServerError, req.t('ERROR'), err);
      return res.status(400).json(response);
    }
    const response = commonUtils.genSuccessResponse(resStatusCode.success, req.t('WS_EDIT_SUCCESS'));
    return res.status(response.statusCode).json(response);
  });
};
module.exports = updateWorkspacesTemplates;