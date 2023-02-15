'use strict';
const mongoose = require('mongoose');
const { ObjectId } = mongoose.Types;
const async = require('async');
const { activity_type } = require('../../../../helper/constant');
let Application = mongoose.model('Application');
let Field = mongoose.model('Field');
let Record = mongoose.model('Record');
let Cell = mongoose.model('Cell');

let Activity = require('../../../../helper/logActivity');
let activityTemplate = require('../../../../helper/activity');
let Task = mongoose.model('Task');
let RecordRole = mongoose.model('recordRole');
let Workspace = mongoose.model('Workspace');
let WorkspaceRole = mongoose.model('WorkspaceRole');
let MarketWorkspace = mongoose.model('MarketWorkspace');
let ApplicationComments = mongoose.model('Applicationcomment');
// const ActivityCommentModel = mongoose.model('Activitycomments');
const subActivities = mongoose.model('subActivities');
const mainActivities = mongoose.model('mainActivities');
const ActivityModel = mongoose.model('Activities');

let deleteWorkspaceFn = (req, res, callback) => {
    let workspaceId = ObjectId(req.params.id);
    let deleteWorkspaceOnWorkspaceCollection = (callback) => {
        let query = {
            '_id': workspaceId
        };
        Workspace.findById(workspaceId, (err, workspace) => {
            if (workspace) {
                Workspace.deleteMany(query, callback);
            } else {
                callback(err)
            }
        });
    };

    let deleteWorkspaceRoleFn = (callback) => {
        WorkspaceRole.deleteMany({ 'workspace_id': workspaceId }, callback);
    };
    let deleteApplicationOnApplicationCollection = (callback) => {
        Application.find({ workspace_id: workspaceId }, (err, applications) => {
            if (applications && applications.length > 0) {
                for (let i = 0; i < applications.length; i++) {
                    Task.deleteMany({ 'application_id': applications[i]._id })
                    ApplicationComments.deleteMany({ 'application_id': applications[i]._id })
                }
                Application.deleteMany({ 'workspace_id': workspaceId }, callback);
            } else {
                callback();
            }
        })
    };
    let deleteApplicationTemplateOnFieldCollection = (callback) => {
        Field.deleteMany({ 'workspace_id': workspaceId }, callback);
    };
    let deleteRecordFn = (callback) => {
        Record.deleteMany({ 'workspace_id': workspaceId }, callback);
    };
    let deleteCellFn = (callback) => {
        Cell.deleteMany({ 'workspace_id': workspaceId }, callback);
    };
    let deleteMarketWorkspaceRoleFn = (callback) => {
        MarketWorkspace.deleteMany({ 'workspace_id': workspaceId }, callback);
    };
    let deleteRecordRoleFn = (callback) => {
        RecordRole.deleteMany({ 'workspace_id': workspaceId }, callback);
    };
    let deleteActivityFn = (callback) => {
        ActivityModel.deleteMany({ 'workspace_id': workspaceId }, callback);
    };
    let deleteMainActivityFn = (callback) => {
        mainActivities.deleteMany({ 'workspace_id': workspaceId }, callback);
    };
    let deleteSubActivityFn = (callback) => {
        subActivities.deleteMany({ 'workspace_id': workspaceId }, callback);
    };
    async.series([
        deleteWorkspaceOnWorkspaceCollection,
        deleteWorkspaceRoleFn,
        deleteApplicationOnApplicationCollection,
        deleteApplicationTemplateOnFieldCollection,
        deleteRecordFn,
        deleteCellFn,
        deleteMarketWorkspaceRoleFn,
        deleteRecordRoleFn,
        deleteActivityFn,
        deleteMainActivityFn,
        deleteSubActivityFn
    ], callback);
};

module.exports = deleteWorkspaceFn;