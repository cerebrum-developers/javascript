
const { MarketWorkspaceModel,PredefinedWorkspaceModel, MarketCommentModel, OrganizationFollowModel} = require('../../../helper/models')
const marketWorkspaceUtils = {};
marketWorkspaceUtils.addMarketWorkspace = (data) => {
  const marketWorkspaceData = new MarketWorkspaceModel(data);
  return marketWorkspaceData.save();
}

marketWorkspaceUtils.deleteMarketWorkspace = (data) => MarketWorkspaceModel.deleteOne(data);
marketWorkspaceUtils.findCategories = (data, fields = {}) => MarketWorkspaceModel.find(data, fields);
marketWorkspaceUtils.findMarketWorkspace = (data, fields = {}) => MarketWorkspaceModel.findOne(data, fields).populate({
  path: 'owner',
  'select': '_id  firstName lastName email',
}).populate({
  path: 'workspace_id',
  'select': '_id  organization_id',
});
marketWorkspaceUtils.updateMarketWorkspace = (cond, data) => MarketWorkspaceModel.findOneAndUpdate(cond, data);
marketWorkspaceUtils.countWorkspace = (data, fields = {}) => MarketWorkspaceModel.countDocuments(data);

marketWorkspaceUtils.addMarketComment = (data) => {
  const marketCommentData = new MarketCommentModel(data);
  return marketCommentData.save();
}
marketWorkspaceUtils.updateMarketComment = (cond, data) => MarketCommentModel.findOneAndUpdate(cond, data);

marketWorkspaceUtils.addOrgFollow = (data) => {
  const orgFolloweData = new OrganizationFollowModel(data);
  return orgFolloweData.save();
}
marketWorkspaceUtils.updateOrgFollow = (cond, data) => OrganizationFollowModel.findOneAndUpdate(cond, data);
marketWorkspaceUtils.deleteOrgFollow = (data) => OrganizationFollowModel.deleteOne(data);
marketWorkspaceUtils.findOneFollow = (data, fields = {}) => OrganizationFollowModel.findOne(data, fields);
marketWorkspaceUtils.findAllFollow = (data, fields = {}) => OrganizationFollowModel.find(data, fields);

module.exports = marketWorkspaceUtils
