const Mongoose = require('mongoose');
const Workspace = Mongoose.model('Workspace');
const WorkspaceRole = Mongoose.model('WorkspaceRole');
const OrganizationRole = Mongoose.model('OrganizationRole');
const User = Mongoose.model('User');
const ObjectId = require('mongodb').ObjectID;
const async = require('async');
const _ = require('lodash');
const commonUtils = require('../../../../helper/commonUtils');
const { resStatusCode } = require('../../../../helper/constant');
let workspaceOrganizationUsersFn = (req, res) => {
  const params = req.params;
  const workspaceId = params.id;
  const queryString = req.query;
  const keyword = _.get(req.query, 'keyword', '');
  const keywordRegex = new RegExp(keyword, 'i');
 
  const getOrganizationFn = (callback) => {
    const query = {
      _id: ObjectId(workspaceId)
    };
    const callbackFn = (error, result) => {
     if (error) {
        const response = commonUtils.genErrorResponse(resStatusCode.error.internalServerError, req.t('ERROR'), error);
        return res.status(response.statusCode).json(response);
     }
      callback(error, result.organization);
    };
    Workspace.findOne(query)
      .populate('organization_id')
      .exec(callbackFn);
  };

  const getCurrentWorkspaceUsersFn = (callback) => {
    const query = {
      'workspace_id': ObjectId(workspaceId),
    };
    const callbackFn = (error, result) => {
      callback(null, result);
    };
    WorkspaceRole.find(query, callbackFn).populate({
      path: 'user_id',
      'select': '_id  firstName lastName email avatar',
      match:{'_id':{$ne:null}}
    });
  };
  const getOrganizationUsersFn = (workspaceUsers, organization, callback) => {
    let result;
    if(workspaceUsers && !_.isEmpty(workspaceUsers)){
     result =  workspaceUsers.filter(function(user) {
      if (!user.user_id) {
        return false; // skip
      }
      return true;
    }).map(function(user) { return user.user_id; })
  }else{
     result =[]
  }
   
  const response = commonUtils.genSuccessResponse(resStatusCode.success, req.t('SUCCESS'), result);
    callback(null, response);
  };

  const getUsersFn = (workspaceUsers, callback) => {
    const query = {
      '_id': {
        '$in': _.map(workspaceUsers, (role) => {
          return role.user_id;
        }),
      },
      '$or': [{
        'firstName': keywordRegex
      }, {
        'lastName': keywordRegex
      },
      {
        'email': keywordRegex
      }]
    };
    const callbackFn = (error, result) => {
      const response = commonUtils.genSuccessResponse(resStatusCode.success, req.t('SUCCESS'), result);
      callback(error, response);
    };
    User.find(query,{firstName:1,lastName:1,email:1,avatar:1})
      .exec(callbackFn);
  };

  if (! _.isEmpty(queryString.keyword)) {
    async.waterfall([
        getCurrentWorkspaceUsersFn,
        getUsersFn,
    ], function (error, response) {
        res.json(response);
    });
    return;
}

  async.waterfall([
    (callback) => {
      async.parallel({
        'organization': getOrganizationFn,
        'workspaceUsers': getCurrentWorkspaceUsersFn,
      }, (error, results) => {
        callback(null, results.workspaceUsers, results.organization);
      });
    },
    getOrganizationUsersFn,
  ], (error, result) => {
   
     res.json(result);
  });
};

module.exports = workspaceOrganizationUsersFn;
