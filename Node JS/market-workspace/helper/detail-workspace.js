'use strict';
const mongoose = require('mongoose');
const MarketWorkspace = mongoose.model('MarketWorkspace');
const User = mongoose.model('User');
const Organization = mongoose.model('Organization');
const Workspace = mongoose.model('Workspace');
const Application = mongoose.model('Application');
const commonUtils = require('../../../../helper/commonUtils');
const { resStatusCode } = require('../../../../helper/constant');
const workspaceUtils = require("../../workspace/workspaceUtils");
const organizationUtils = require("../../organization/organizationUtils");
const _ = require('lodash');

const detailWorkspacesTemplates = (req, res) => {

    if (req.params.id !== '') {
        MarketWorkspace.findById(req.params.id).populate('categories').populate({ 'path': 'owner', 'select': '_id firstName lastName' }).exec((err, doc) => {
            if (err) {
                const response = commonUtils.genErrorResponse(resStatusCode.error.internalServerError, req.t('ERROR'), err);
                return res.status(400).json(response);
            } else {
                if (doc.owner !== '') {
                    User.findById(doc.owner, (err, user) => {

                        Workspace.findById(doc.workspace_id, {
                            slug: 1,
                            name: 1,
                            _id: 1,
                            organization_id: 1
                        }, async (err, workspace) => {
                            if (workspace) {
                                workspace = workspace.toObject();
                                if (req.userInfo.isSuperAdmin === true) {
                                    workspace.role = 'admin';
                                } else {
                                    let role = await workspaceUtils.findWorkspaceRole({ workspace_id: workspace._id, user_id: req.userInfo._id }, { role: 1 })
                                    if (role != null || !_.isEmpty(role)) {
                                        workspace.role = role.role;
                                    } else {
                                        workspace.role = '';
                                    }
                                }
                                Organization.findById(workspace.organization_id, {
                                    slug: 1,
                                    name: 1,
                                    _id: 1,
                                    shortid: 1,
                                    avatar: 1
                                }, async (err, org) => {
                                    org = org.toObject();
                                    if (req.userInfo.isSuperAdmin === true) {
                                        org.role = 'admin';
                                    } else {
                                        const orgRole = await organizationUtils.findOrganizationRole({ user_id: req.userInfo._id, organization_id: org._id }, { role: 1, _id: 0 });
                                        //     item = item.toObject();
                                        if (orgRole) {
                                            org.role = orgRole.role;
                                        } else {
                                            org.role = "";
                                        }
                                    }
                                    Application.find({
                                        'workspace_id': doc.clone == true ? doc._id : doc.workspace_id
                                    }, (err, apps) => {
                                        const response = commonUtils.genSuccessResponse(resStatusCode.success, req.t('SUCCESS'), {
                                            data: doc,
                                            workspace: workspace,
                                            organization: org,
                                            applications: apps && apps.length > 0 ? apps : []
                                        });
                                        return res.status(response.statusCode).json(response)
                                    });
                                });

                            } else {
                                const response = commonUtils.genSuccessResponse(resStatusCode.success, req.t('SUCCESS'), { data: doc });
                                return res.status(response.statusCode).json(response);
                            }
                        })

                    });
                } else {
                    const response = commonUtils.genSuccessResponse(resStatusCode.success, req.t('SUCCESS'), { data: doc });
                    return res.status(response.statusCode).json(response);
                }
            }
        });
    }
};

module.exports = detailWorkspacesTemplates;
