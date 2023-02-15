
const mongoose = require('mongoose');
const mongoUtils = require('../../../helper/mongoUtils');
const { OrganizationModel, OrganizationRoleModel, WorkspaceModel, MarketWorkspaceModel } = require('../../../helper/models');
const { ObjectId } = mongoose.Types;
const OrganizationUtils = {}
OrganizationUtils.addOrganization = (data) => {
  const OrganizationData = new OrganizationModel(data);
  return OrganizationData.save();
}
OrganizationUtils.deleteOrganization = (data) => OrganizationModel.deleteOne(data)
OrganizationUtils.findOrganizations = (data, fields = {}) => OrganizationModel.find(data, fields);
OrganizationUtils.findOrganization = (data, fields = {}) => OrganizationModel.findOne(data, fields);
OrganizationUtils.updateOrganization = (cond, data) => OrganizationModel.findOneAndUpdate(cond, data);
OrganizationUtils.findOrganizationsLimit = async (cond, data, page) => {
  const pagination = await mongoUtils.paginationCount(OrganizationModel, cond);
  const OrganizationsList = await mongoUtils.findQuery(OrganizationModel, cond, data, page, { createdAt: -1 });
  return { OrganizationsList, pagination }
}
OrganizationUtils.updateOrganizationOrder = (query,data) => {
  OrganizationModel.findOneAndUpdate(query,data,(err, res) =>{
    if(err){
      return err;
    }else{
      return res;
    }
 });
 }
OrganizationUtils.addOrganizationRole = (data) => {
  const OrganizationRoleData = new OrganizationRoleModel(data);
  return OrganizationRoleData.save();
}
OrganizationUtils.addRoles = (query,data,options) => {
 return  OrganizationRoleModel.findOneAndUpdate(query,data,options,async (err, res)=> {
  
    if(err){
      return err;
    }else{
      return res;
    }
 });
 }
OrganizationUtils.findOrganizationRole = (data, fields = {}) => OrganizationRoleModel.findOne(data, fields);
OrganizationUtils.findOrganizationRoles = (data, fields = {}) => OrganizationRoleModel.find(data, fields);
OrganizationUtils.findOrganizationRoleCount = (data = {}) => OrganizationRoleModel.countDocuments(data);

OrganizationUtils.updateOrganizationRole = (cond, data) => OrganizationRoleModel.findOneAndUpdate(cond, data);

OrganizationUtils.findWorkspace = (data, fields) => WorkspaceModel.findOne(data, fields);
OrganizationUtils.findMarketWorkspace = (data, fields) => MarketWorkspaceModel.findOne(data, fields);
module.exports = OrganizationUtils
