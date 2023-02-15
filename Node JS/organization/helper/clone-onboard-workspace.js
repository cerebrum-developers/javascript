'use strict';
const mongoose = require('mongoose');

const _ = require('lodash');
const async = require('async');
const { ObjectId } = mongoose.Types;
const commonUtils = require('../../../../helper/commonUtils');
const { resStatusCode, activity_type } = require('../../../../helper/constant');
let shortid = require('shortid');
const Workspace = mongoose.model('Workspace');
const WorkspaceRole = mongoose.model('WorkspaceRole');
const Application = mongoose.model('Application');
const Field = mongoose.model('Field');
const Record = mongoose.model('Record');
const View = mongoose.model('view');
const Cell = mongoose.model('Cell');
const sendNotification = require('../../../../helper/send-notification');
const activityTemplate = require('../../../../helper/activity');
let Activity = require('../../../../helper/logActivity');
let mainActivity = require('../../../../helper/mainActivity');
let subActivity = require('../../../../helper/subActivity');
let PredefinedWorkspace = mongoose.model('PredefinedWorkspace');

const cloneExistsWorkspace = function (req, res) {
    const userId = req.userInfo._id;
    const org_id = req.organizationData._id;


    if (org_id) {
        const callbackFn = async (error, result) => {
            const response = commonUtils.genSuccessResponse(resStatusCode.success, req.t('SUCCESS_ONBOARDING'));
            return res.status(response.statusCode).json(response);
        };
        PredefinedWorkspace.findOne({ categoryId: req.body.categoryId }, function (err, workspaceIds) {
            if (workspaceIds && !_.isEmpty(workspaceIds)) {
                let i = 0;

                // find workspaces from workspace ids
                Workspace.find({
                    _id: {
                        $in: workspaceIds.workspaces
                    }
                }, function (err, workspaces) {

                    if (workspaces && workspaces.length > 0) {
                        Application.find({
                            workspace_id: {
                                $in: workspaceIds.workspaces
                            }
                        }, function (err, applications) {

                            Field.find({
                                workspace_id: {
                                    $in: workspaceIds.workspaces
                                }
                            }, function (err, fields) {
                                // clone of workspace starts 
                                async.whilst(function () {
                                    return i < workspaces.length;
                                },
                                    function (next) {
                                        // save workspace
                                        const workspace = new Workspace();
                                        workspace.shortid = shortid.generate();
                                        workspace.name = workspaces[i].name;
                                        workspace.fname = workspaces[i].fname;
                                        workspace.organization_id = org_id;
                                        workspace.owner = userId;
                                        workspace.displayOrder = i,
                                            workspace.save(function (err, data) {
                                                if (err) {
                                                    next(err);
                                                }
                                                // Activity create workspace
                                                const activityText = activityTemplate.addActivityTemplate(req.userInfo.firstName + '' + req.userInfo.lastName, workspaces[i].name, 'Workspace');

                                                mainActivity.logMainActivity(req.userInfo._id, org_id, data._id, null, null, null, activityText, 'activity', activity_type.createdWorkspace, "", "", '', new Array()).then(function () {

                                                    // save workspace role
                                                    const workspaceRole = new WorkspaceRole();
                                                    const workspaceId = data._id;
                                                    workspaceRole.user_id = userId;
                                                    workspaceRole.workspace_id = data._id;
                                                    workspaceRole.role = 'admin';
                                                    workspaceRole.email = req.userInfo.email;
                                                    workspaceRole.status = 'active';

                                                    workspaceRole.save(function (err, data) {

                                                        if (applications && applications.length > 0) {
                                                            const currentApplications = applications.filter(app => app.workspace_id.toString() === workspaces[i]._id.toString());

                                                            if (currentApplications && currentApplications.length > 0) {
                                                                const savedApplications = [];
                                                                const applicationIds = [];

                                                                for (let i = 0; i < currentApplications.length; i++) {
                                                                    const newItem = new Application();
                                                                    newItem.owner = userId;
                                                                    newItem.workspace_id = workspaceId;
                                                                    newItem.organization_id = org_id;
                                                                    newItem.view_mode = currentApplications[i].view_mode;
                                                                    newItem.name = currentApplications[i].name;
                                                                    newItem.description = currentApplications[i].description;
                                                                    newItem.displayOrder = currentApplications[i].displayOrder;
                                                                    newItem.createdAt = new Date();
                                                                    newItem.updatedAt = new Date();
                                                                    newItem.columnId = '';
                                                                    newItem.rowId = '';
                                                                    let slugName = '';
                                                                    if (newItem.name.indexOf(' ') > -1) {
                                                                        slugName = newItem.name.split(' ').join('-') + '-clone-' + shortid.generate() + '-1';
                                                                    } else {
                                                                        slugName = newItem.name + '-clone-' + shortid.generate() + '-1';
                                                                    }
                                                                    newItem.slug = slugName;
                                                                    savedApplications.push(newItem);
                                                                    applicationIds.push(currentApplications[i]._id);
                                                                }

                                                                if (savedApplications.length > 0) {
                                                                    //const savedWs = [];

                                                                    Application.collection.insertMany(savedApplications, function (err, newApps) {
                                                                        if (err) {
                                                                            const response = commonUtils.genErrorResponse(resStatusCode.error.internalServerError, req.t('ERROR'), err);
                                                                            return res.status(400).json(response);
                                                                        }

                                                                        newApps = newApps && newApps['ops'] && newApps['ops'].length > 0 ? newApps['ops'] : [];
                                                                        if (newApps.length > 0) {
                                                                            let app = currentApplications && currentApplications.length > 0 ? currentApplications.map(role => role._id) : [];

                                                                            View.find({ application_id: { $in: app } }, function (err, views) {
                                                                                const savedViews = [];
                                                                                for (let i = 0; i < applicationIds.length; i++) {
                                                                                    const tempViews = views.filter(field => field.application_id.toString() === applicationIds[i].toString());
                                                                                    if (tempViews && tempViews.length > 0) {
                                                                                        const currentFieldApp = currentApplications.filter(app => app._id.toString() === tempViews[0].application_id.toString())[0];
                                                                                        const newViewApp = newApps.filter(app => app.item_name === currentFieldApp.item_name && app.name === currentFieldApp.name)[0];
                                                                                        for (let j = 0; j < tempViews.length; j++) {
                                                                                            const newViewObj = new View();
                                                                                            newViewObj.application_id = newViewApp._id;
                                                                                            newViewObj.filters = tempViews[j].filters
                                                                                            newViewObj.name = tempViews[j].name;
                                                                                            newViewObj.createdAt = new Date();
                                                                                            newViewObj.updatedAt = new Date();
                                                                                            savedViews.push(newViewObj);
                                                                                        }
                                                                                    }
                                                                                }

                                                                                if (savedViews.length > 0) {
                                                                                    View.collection.insertMany(savedViews, function (errField, view) {
                                                                                        const savedFields = [];
                                                                                        for (let i = 0; i < applicationIds.length; i++) {
                                                                                            const tempFields = fields.filter(field => field.application_id.toString() === applicationIds[i].toString());
                                                                                            if (tempFields && tempFields.length > 0) {

                                                                                                const currentFieldApp = currentApplications.filter(app => app._id.toString() === tempFields[0].application_id.toString())[0];
                                                                                                const newFieldApp = newApps.filter(app => app.item_name === currentFieldApp.item_name && app.name === currentFieldApp.name)[0];
                                                                                                for (let j = 0; j < tempFields.length; j++) {
                                                                                                    const newFieldObj = new Field();
                                                                                                    newFieldObj.organization_id = org_id;
                                                                                                    newFieldObj.application_id = newFieldApp._id;
                                                                                                    newFieldObj.workspace_id = workspaceId;
                                                                                                    newFieldObj.type = tempFields[j].type;
                                                                                                    newFieldObj.index = tempFields[j].index;
                                                                                                    newFieldObj.label = tempFields[j].label;
                                                                                                    newFieldObj.uniqueId = tempFields[j].uniqueId;
                                                                                                    newFieldObj.icon = tempFields[j].icon;
                                                                                                    newFieldObj.options = tempFields[j].options;
                                                                                                    newFieldObj.createdAt = new Date();
                                                                                                    newFieldObj.updatedAt = new Date();
                                                                                                    savedFields.push(newFieldObj);
                                                                                                }
                                                                                            }
                                                                                        }
                                                                                        if (savedFields.length > 0) {
                                                                                            Field.collection.insertMany(savedFields, function (errField, field) {
                                                                                                if (errField) {
                                                                                                    const response = commonUtils.genErrorResponse(resStatusCode.error.internalServerError, req.t('ERROR'), errField);
                                                                                                    return res.status(400).json(response);
                                                                                                }

                                                                                                i++;
                                                                                                next();

                                                                                                // } else {
                                                                                                //     const response = commonUtils.genErrorResponse(resStatusCode.error.internalServerError, req.t('ERROR'), errField);
                                                                                                //     return res.status(400).json(response);
                                                                                                // }
                                                                                            });
                                                                                        } else {
                                                                                            i++;
                                                                                            next();
                                                                                        }
                                                                                    })
                                                                                } else {
                                                                                    i++;
                                                                                    next();
                                                                                }
                                                                            })

                                                                        } else {
                                                                            i++;
                                                                            next();
                                                                        }
                                                                    });
                                                                }
                                                            } else {
                                                                i++;
                                                                next();
                                                            }
                                                        } else {
                                                            i++;
                                                            next();
                                                        }
                                                    });
                                                });
                                            });
                                    },
                                    function (err, data) {
                                        if (err) {
                                            const response = commonUtils.genErrorResponse(resStatusCode.error.internalServerError, req.t('ERROR'), err);
                                            return res.status(400).json(response);
                                        } else {
                                            const response = commonUtils.genSuccessResponse(resStatusCode.success, req.t('SUCCESS_ONBOARDING'));
                                            return res.status(response.statusCode).json(response);
                                        }
                                    });
                            });

                        });
                    }
                });

            } else {
                const response = commonUtils.genSuccessResponse(resStatusCode.success, req.t('SUCCESS_ONBOARDING'));
                return res.status(response.statusCode).json(response);
            }
        })
    };
};
module.exports = cloneExistsWorkspace;