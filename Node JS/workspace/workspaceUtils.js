const moment = require('moment')
const mongoose = require('mongoose')

const mongoUtils = require('../../../helper/mongoUtils')
const {  WorkspaceModel,WorkspaceRoleModel } = require('../../../helper/models')

const WorkspaceUtils = {}

const { ObjectId } = mongoose.Types;

WorkspaceUtils.addWorkspace = (data) => {
  const workspaceData = new WorkspaceModel(data);
  return workspaceData.save();
}

WorkspaceUtils.findWorkspaces = (data, fields = {}) => WorkspaceModel.find(data, fields).sort( { 'displayOrder': 1 });

WorkspaceUtils.findWorkspace = (data, fields = {}) => WorkspaceModel.findOne(data, fields);
WorkspaceUtils.findWorkspacePopulate = (data, fields = {}) => WorkspaceModel.findOne(data, fields).populate( { path: 'organization_id',
'select': 'name'
});

WorkspaceUtils.updateWorkspace = (cond, data) => WorkspaceModel.findOneAndUpdate(cond, data);
WorkspaceUtils.updateWorkspaceOrder = (query,data) => {
  WorkspaceModel.findOneAndUpdate(query,data,(err, res) =>{
    if(err){
      return err;
    }else{
      return res;
    }
 });
 }
 WorkspaceUtils.addRoles = (query,data,options) => {
  WorkspaceRoleModel.findOneAndUpdate(query,data,options,function(err, res) {
    if(err){
      return err;
    }else{
      return res;
    }
 });
 }
WorkspaceUtils.addWorkspaceRole = (data) => {
  const workspaceRoleData = new WorkspaceRoleModel(data);
  return workspaceRoleData.save();
}
WorkspaceUtils.findWorkspaceRole = (data, fields = {}) => WorkspaceRoleModel.findOne(data, fields);
WorkspaceUtils.findWorkspaceRoles = (data, fields = {}) => WorkspaceRoleModel.find(data, fields);
WorkspaceUtils.updateWorkspaceRole = (cond, data) => WorkspaceRoleModel.findOneAndUpdate(cond, data);
// WorkspaceUtils.findWorkspaceRolesPopulate  = (data, fields = {}) => WorkspaceRoleModel.find(data, fields);
WorkspaceUtils.deleteWorkspaceRole = (data) => WorkspaceRoleModel.deleteOne(data);

module.exports = WorkspaceUtils
