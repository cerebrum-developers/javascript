'use strict';
const marketWorkspaceUtils = require('../market-workspaceUtils');

const mongoose = require('mongoose');
const { ObjectId } = mongoose.Types;
const MarketWorkspace = mongoose.model('MarketWorkspace');
const commonUtils = require('../../../../helper/commonUtils');
const { resStatusCode } = require('../../../../helper/constant');
let shortid = require('shortid');
const Workspace = mongoose.model('Workspace');
const Application = mongoose.model('Application');
const Field = mongoose.model('Field');
const Record = mongoose.model('Record');
const View = mongoose.model('view');
const Cell = mongoose.model('Cell');
const _ = require('lodash');

let approveHtml = require("../../../../templates/workspace-approve.html")
const cloneWorkspaceByName = function (req, res) {

    const userId = req.userInfo._id;
    const org_id = req.marketWorkspaceInfo.workspace_id.organization_id;
    const w_id = req.marketWorkspaceInfo.workspace_id._id;
    const m_p_id = req.marketWorkspaceInfo._id;
    if (org_id && w_id && m_p_id) {
        const callbackFn = async (error, result) => {
            let approveMailBody = approveHtml.replace('{URL}', process.env.SITE_URL);
            approveMailBody = approveMailBody.replace('{NAME}', req.marketWorkspaceInfo.owner.firstName + ' ' + req.marketWorkspaceInfo.owner.lastName);
            approveMailBody = approveMailBody.replace('{WORKSPACE}', req.marketWorkspaceInfo.title);
            commonUtils.sendMail(req.marketWorkspaceInfo.owner.email, approveMailBody, req.t('WS_APPROVE_SUBJECT'));
            await marketWorkspaceUtils.updateMarketWorkspace({ _id: req.marketWorkspaceInfo._id }, { status: "approved" });
            const response = commonUtils.genSuccessResponse(resStatusCode.success, 'Workspace Approved successfully.');
            return res.status(response.statusCode).json(response);
        };
        Workspace.findOne({ _id: w_id }, function (err, w_space) {
            if (w_space) {
                let savedWs = {};
                savedWs.owner = req.marketWorkspaceInfo.owner._id;
                savedWs.workspace_id = w_id;
                savedWs.status = 'approved';
                savedWs.title = req.marketWorkspaceInfo.title;
                savedWs.published = true;
                savedWs.description = req.marketWorkspaceInfo.description;
                savedWs.image = req.marketWorkspaceInfo.image;
                savedWs.usersRatings = req.marketWorkspaceInfo.usersRatings;
                savedWs.categories = req.marketWorkspaceInfo.categories;
                savedWs.clone = true;
                savedWs.parentId = m_p_id;
                savedWs.createdAt = new Date();
                savedWs.updatedAt = new Date();

                MarketWorkspace.collection.insertOne(savedWs, function (err, wsRes) {
                    if (err) {
                        const response = commonUtils.genErrorResponse(resStatusCode.error.internalServerError, req.t('ERROR'), err);
                        return res.status(400).json(response);
                    }

                    Application.find({ workspace_id: w_space._id }, function (err, applications) {
                        Field.find({ workspace_id: w_space._id }, function (err, fields) {

                            if (applications && applications.length > 0) {
                                const currentApplications = applications.filter(app => app.workspace_id.toString() === w_space._id.toString());

                                if (currentApplications && currentApplications.length > 0) {
                                    const savedApplications = [];
                                    const applicationIds = [];
                                    for (let i = 0; i < currentApplications.length; i++) {
                                        const newItem = new Application();
                                        newItem.owner = userId;
                                        newItem.workspace_id = wsRes['ops'][0]._id;
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
                                                                        newFieldObj.workspace_id = wsRes['ops'][0]._id;
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
                                                                    if (!errField) {
                                                                        let fieldArr = field['ops'];
                                                                        let latestField = fields.map(obj => {
                                                                            const sameObj = fieldArr.find(o => parseInt(o.uniqueId) === parseInt(obj.uniqueId));
                                                                            if (sameObj) {
                                                                                let newObj = obj.toObject();
                                                                                newObj.old_id = newObj._id
                                                                                newObj._id = sameObj._id;
                                                                                return newObj
                                                                            }

                                                                        })

                                                                        Record.find({ workspace_id: w_space._id }, function (err, records) {
                                                                            const savedRecords = [];
                                                                            for (let i = 0; i < applicationIds.length; i++) {
                                                                                const tempRecords = records.filter(field => field.application_id.toString() === applicationIds[i].toString());
                                                                                if (tempRecords && tempRecords.length > 0) {
                                                                                    const currentFieldApp = currentApplications.filter(app => app._id.toString() === tempRecords[0].application_id.toString())[0];
                                                                                    const newFieldApp = newApps.filter(app => app.item_name === currentFieldApp.item_name && app.name === currentFieldApp.name)[0];
                                                                                    for (let j = 0; j < tempRecords.length; j++) {
                                                                                        const keys = Object.keys(tempRecords[j].cells);
                                                                                        keys.forEach(key => {
                                                                                            const val = latestField.find(obj => obj.old_id.toString() === key.toString());
                                                                                            tempRecords[j].cells[val["_id"]] = tempRecords[j].cells[key];
                                                                                            delete tempRecords[j].cells[key];
                                                                                        })
                                                                                        const newRecordObj = new Record();
                                                                                        newRecordObj.organization_id = org_id;
                                                                                        newRecordObj.application_id = newFieldApp._id;
                                                                                        newRecordObj.workspace_id = wsRes['ops'][0]._id;
                                                                                        newRecordObj.cells = tempRecords[j].cells;
                                                                                        newRecordObj.shortid = tempRecords[j].shortid;
                                                                                        newRecordObj.filterObject = tempRecords[j].filterObject;
                                                                                        newRecordObj.calendarEvent = tempRecords[j].calendarEvent;
                                                                                        newRecordObj.created_by = tempRecords[j].created_by;
                                                                                        newRecordObj.last_updated_by = tempRecords[j].last_updated_by;
                                                                                        newRecordObj.createdAt = new Date();
                                                                                        newRecordObj.updatedAt = new Date();
                                                                                        savedRecords.push(newRecordObj);
                                                                                    }
                                                                                }
                                                                            }
                                                                            if (savedRecords.length > 0) {
                                                                                Record.collection.insertMany(savedRecords, function (errField, newRecords) {
                                                                                    // store cell object
                                                                                    newRecords = newRecords && newRecords['ops'] && newRecords['ops'].length > 0 ? newRecords['ops'] : [];
                                                                                    if (newRecords.length > 0) {
                                                                                        Cell.find({ workspace_id: w_space._id }, function (err, cells) {
                                                                                            const savedCells = [];
                                                                                            for (let i = 0; i < applicationIds.length; i++) {
                                                                                                const tempCells = cells.filter(field => field.application_id.toString() === applicationIds[i].toString());

                                                                                                let latestCell = tempCells.map(obj => {
                                                                                                    const sameObj = latestField.find(o => o.old_id.toString() === obj.field_id.toString());
                                                                                                    if (sameObj) {
                                                                                                    let newObj = obj.toObject();
                                                                                                    newObj.old_field_id = newObj.field_id
                                                                                                    newObj.field_id = sameObj._id;
                                                                                                    return newObj
                                                                                                    }
                                                                                                })

                                                                                                let finalRec = records.map(obj => {
                                                                                                    const sameObj = newRecords.find(o => o.shortid === obj.shortid);
                                                                                                    if (sameObj) {
                                                                                                    let newObj = obj.toObject();
                                                                                                    newObj.old_id = newObj._id
                                                                                                    newObj._id = sameObj._id;

                                                                                                    return newObj
                                                                                                    }
                                                                                                })

                                                                                                let latestCellFInal = latestCell.map(obj => {
                                                                                                    const sameObj = finalRec.find(o => o.old_id.toString() === obj.record_id.toString());
                                                                                                    if (sameObj) {
                                                                                                    obj.old_record_id = obj.record_id
                                                                                                    obj.record_id = sameObj._id;
                                                                                                    return obj
                                                                                                    }
                                                                                                })
                                                                                                if (latestCellFInal && latestCellFInal.length > 0) {

                                                                                                    const currentCellApp = currentApplications.filter(app => app._id.toString() === tempCells[0].application_id.toString())[0];
                                                                                                    const newCellApp = newApps.filter(app => app.item_name === currentCellApp.item_name && app.name === currentCellApp.name)[0];

                                                                                                    for (let j = 0; j < latestCellFInal.length; j++) {
                                                                                                        const saveCellObj = new Cell();
                                                                                                        saveCellObj.organization_id = org_id;
                                                                                                        saveCellObj.application_id = newCellApp._id;
                                                                                                        saveCellObj.workspace_id = wsRes['ops'][0]._id;
                                                                                                        saveCellObj.value = latestCellFInal[j].value;
                                                                                                        saveCellObj.field_id = latestCellFInal[j].field_id;
                                                                                                        saveCellObj.record_id = latestCellFInal[j].record_id;
                                                                                                        saveCellObj.createdAt = new Date();
                                                                                                        saveCellObj.updatedAt = new Date();
                                                                                                        savedCells.push(saveCellObj);
                                                                                                    }
                                                                                                }
                                                                                            }

                                                                                            if (savedCells.length > 0) {
                                                                                                Cell.collection.insertMany(savedCells, function (errField, field) {
                                                                                                    callbackFn(null, w_space);
                                                                                                })
                                                                                            } else {
                                                                                                callbackFn(null, w_space);
                                                                                            }

                                                                                        })
                                                                                    } else {
                                                                                        callbackFn(null, w_space)
                                                                                    }


                                                                                })
                                                                            } else {
                                                                                callbackFn(null, w_space);
                                                                            }

                                                                        })



                                                                    } else {
                                                                        const response = commonUtils.genErrorResponse(resStatusCode.error.internalServerError, req.t('ERROR'), errField);
                                                                        return res.status(400).json(response);
                                                                    }
                                                                });
                                                            } else {
                                                                callbackFn(null, w_space);
                                                            }
                                                        })
                                                    } else {
                                                        callbackFn(null, w_space);
                                                    }

                                                })






                                            } else {
                                                callbackFn(null, w_space);
                                            }
                                        });
                                    }
                                } else {
                                    callbackFn(null, w_space);
                                }
                            } else {
                                callbackFn(null, w_space);
                            }
                        });

                    });
                });
            }
        });

    }
};
module.exports = cloneWorkspaceByName;