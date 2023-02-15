const Mongoose = require('mongoose');
const Workspace = Mongoose.model('Workspace');
const Organization = Mongoose.model('Organization');
const organizationUtils = require('../../organization/organizationUtils');

const async = require('async');
const _ = require('lodash');
const commonUtils = require('../../../../helper/commonUtils');
const { resStatusCode } = require('../../../../helper/constant');

const ObjectId = require('mongodb').ObjectID;
const getWorkspacesCtrlFn =  (req, res)=> {
  const params = req.params;
  const organization_id = params.id;
  const queryParams = req.query;
  const keyword = _.get(queryParams, 'keyword', '');
  const keywordRegex = new RegExp(keyword, 'i');

  const loadWorkspaceRolesFn = async  (next)=> {
    let organization = await organizationUtils.findOrganization({ _id: organization_id }, { owner: 1 });
    let organizationOwner = organization.owner;
    let matchCondition = '';
    if (req.userInfo._id.equals(organizationOwner)) {
      matchCondition = { "_id": { $ne: null } };
    } else {
      matchCondition = { _id: req.userInfo._id };
    }
    Workspace.find({
      'organization_id': organization_id,
      'name': keywordRegex,
    })
      .populate({
        path: 'participants',
        populate: {
          path: 'user_id',
          select: '_id firstName lastName email avatar',
          match: matchCondition
        },
      })
      .exec( (error, result) =>{
        if (error) {
          const response = commonUtils.genErrorResponse(resStatusCode.error.internalServerError, req.t('ERROR'), error);
          return res.status(response.statusCode).json(response);
        }
        const mappedWorkspaces = _.map(result,(workspace)=> {
          return {
            'id': workspace._id,
            'workspacename': workspace.name,
            'users': _.map(workspace.participants, (participant) =>{
                return participant;
            }),
          };
        });
        next(null, mappedWorkspaces);
      });
  };

  async.parallel({
    'workspaces': loadWorkspaceRolesFn,
  },  (error, results)=> {
    const response = commonUtils.genSuccessResponse(resStatusCode.success, req.t('SUCCESS'), results);
    return res.status(response.statusCode).json(response);
  });
};

module.exports = getWorkspacesCtrlFn;
