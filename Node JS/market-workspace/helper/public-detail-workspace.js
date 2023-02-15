'use strict';
const mongoose = require('mongoose');
const MarketWorkspace = mongoose.model('MarketWorkspace');
const User = mongoose.model('User');
const Organization = mongoose.model('Organization');
const Workspace = mongoose.model('Workspace');
const Application = mongoose.model('Application');
const commonUtils = require('../../../../helper/commonUtils');
const { resStatusCode } = require('../../../../helper/constant');
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
                                Organization.findById(workspace.organization_id, {
                                    slug: 1,
                                    name: 1,
                                    _id: 1,
                                    shortid: 1,
                                    avatar: 1
                                }, async (err, org) => {
                                    org = org.toObject();
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
