'use strict';
const async = require('async');
const mongoose = require('mongoose');
const objectId = require('mongodb').ObjectID;
const WorkspaceRole = mongoose.model('WorkspaceRole');
const User = mongoose.model('User');
const commonUtils = require('../../../../helper/commonUtils');
const { resStatusCode } = require('../../../../helper/constant');
const _ = require('lodash');
const getUserWorkspacesCtrlFn = (request, res) => {
    const params = request.params;
    const organizationId = params.id;
    const queryParams = request.query;
    const userId = objectId(_.get(queryParams, 'user_id', ''));
    const loadUserFn = (next) => {
        User.findOne({ '_id': userId })
            .exec((error, user) => {

                if (error) {
                    const response = commonUtils.genErrorResponse(resStatusCode.error.internalServerError, request.t('ERROR'), error);
                    return res.status(response.statusCode).json(response);
                }
                const mappedUser = {
                    '_id': user._id,
                    'firstName': user.firstName,
                    'lastName': user.lastName,
                    'email': user.email,
                    'avatar': user.avatar,
                };
                next(null, mappedUser);
            });
    };

    const loadWorkspaceRolesFn = (next) => {
        WorkspaceRole.find({ 'user_id': userId })
            .populate({
                path: 'workspace_id',
                match: {
                    organization_id: organizationId,
                },
            })
            .exec((error, result) => {

                if (error) {
                    const response = commonUtils.genErrorResponse(resStatusCode.error.internalServerError, request.t('ERROR'), error);
                    return res.status(response.statusCode).json(response);
                }
                const acceptedWorkspaces = _.reject(result, ['workspace_id', null]);
                const mappedWorkspaces = _.map(acceptedWorkspaces, (role) => {
                    if (role.workspace_id) {
                        return {
                            'workspace': {
                                'id': role.workspace_id._id,
                                'name': role.workspace_id.name,
                            },
                            'role': role.role,
                        };
                    }
                });
                next(null, mappedWorkspaces);
            });
    };
    async.parallel({
        'user': loadUserFn,
        'workspaces': loadWorkspaceRolesFn,
    }, (error, results) => {
        const response = commonUtils.genSuccessResponse(resStatusCode.success, request.t('SUCCESS'), results);
        return res.status(response.statusCode).json(response);
    });
};

module.exports = getUserWorkspacesCtrlFn;
