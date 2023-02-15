'use strict';
const mongoose = require('mongoose');
const OrganizationRole = mongoose.model('OrganizationRole');
const Application = mongoose.model('Application');
const Organization = mongoose.model('Organization');
const WorkspaceRole = mongoose.model('WorkspaceRole');
const Record = mongoose.model('Record');
const Field = mongoose.model('Field');
const { ObjectId } = mongoose.Types;
const Subscription = mongoose.model('Subscription');

const UserModel = mongoose.model("User");
const Cell = mongoose.model('Cell');
const Workspace = mongoose.model('Workspace');
const async = require('async');
const Activity = mongoose.model('Activities');
const commonUtils = require('../../../../helper/commonUtils');
const ApplicationCommentModel = mongoose.model('Applicationcomment');
const subActivities = mongoose.model('subActivities');
const mainActivities = mongoose.model('mainActivities');
const { resStatusCode } = require('../../../../helper/constant');
const requestUrl = require('request');
const _ = require('lodash');

module.exports = deleteUserFn;
function deleteUserFn(request, res) {
  const params = request.params;
  const removeSubscriptionFn = (callback) => {
    Subscription.findOne({ organization_id: request.params.id }, { subscriptionId: 1 }, (err, sub) => {
      if (sub && !_.isEmpty(sub)) {
        requestUrl({
          har: {
            url: process.env.STRIPE_API_URL + '/v1/subscriptions/' + sub.subscriptionId,
            method: 'DELETE',
            headers: [{
              name: 'Authorization',
              value: 'Bearer ' + process.env.STRIPE_API_KEY
            }]
          }
        }, async (error, result) => {
          Subscription.deleteOne({ organization_id: (request.params.id) }, callback);
        })
      } else {
        callback();
      }
    })

  };
  const removeUserFromUserFn = (callback) => {
    UserModel.findOneAndUpdate({ _id: request.userInfo._id },
      { $pull: { "organizationOrder": request.params.id } }, callback);
  };
  const removeWorkspaceFn = (callback) => {
    Workspace.find({ organization_id: request.params.id }, (err, ws) => {
      if (ws && ws.length > 0) {
        for (let i = 0; i < ws.length; i++) {
          WorkspaceRole.deleteMany({ 'workspace_id': ws[i]._id })
        }
        Workspace.deleteMany({ organization_id: (request.params.id) }, callback);
      } else {
        callback();
      }
    })

  };
  const removeApplicationFn = (callback) => {
    Application.deleteMany({
      organization_id: request.params.id
    }, callback);
  };
  const removeUserFromOrganizationFn = (callback) => {
    OrganizationRole.deleteMany({
      organization_id: request.params.id
    }, callback);
  };
  const removeRecordsFn = (callback) => {
    Record.deleteMany({
      organization_id: request.params.id
    }, callback);
  };
  const removeFieldsFn = (callback) => {
    Field.deleteMany({
      organization_id: request.params.id
    }, callback);
  };
  const removeCellsFn = (callback) => {
    Cell.deleteMany({
      organization_id: request.params.id
    }, callback);
  };
  const removeActvityFn = (callback) => {
    Activity.deleteMany({
      organization_id: request.params.id
    }, callback);
  };
  const removeActvityCommentsFn = (callback) => {
    ApplicationCommentModel.deleteMany({
      organization_id: request.params.id
    }, callback);
  };
  const removerganizationFn = (callback) => {
    Organization.deleteOne({
      _id: request.params.id
    }, callback);
  };
  const removeMainActvityFn = (callback) => {
    mainActivities.deleteMany({
      organization_id: request.params.id
    }, callback);
  };
  const removeSubActvityFn = (callback) => {
    subActivities.deleteMany({
      organization_id: request.params.id
    }, callback);
  };

  let startDeleteProcess = (callback) => {
    async.parallel([
      (callback) => {
        removeSubscriptionFn(callback);
      },
      (callback) => {
        removeUserFromUserFn(callback);
      },
      (callback) => {
        removeWorkspaceFn(callback);
      }, (callback) => {
        removeUserFromOrganizationFn(callback);
      }, (callback) => {
        removeApplicationFn(callback);
      }, (callback) => {
        removeRecordsFn(callback);
      }, (callback) => {
        removeCellsFn(callback);
      }, (callback) => {
        removeFieldsFn(callback);
      },
      (callback) => {
        removeActvityFn(callback);
      }, (callback) => {
        removeActvityCommentsFn(callback);
      }, (callback) => {
        removerganizationFn(callback);
      }, (callback) => {
        removeMainActvityFn(callback);
      }, (callback) => {
        removeSubActvityFn(callback);
      }
    ], (error) => {
      if (error) {
        const response = commonUtils.genErrorResponse(resStatusCode.error.internalServerError, request.t('ERROR'), error);
        return res.status(400).json(response);
      }
      const response = commonUtils.genSuccessResponse(resStatusCode.success, request.t('SUCCESS'));
      return res.status(response.statusCode).json(response);
    });
  };
  async.waterfall([
    startDeleteProcess
  ]);
}