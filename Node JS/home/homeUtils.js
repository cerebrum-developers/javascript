
const { HomeModel,ActivitiesModel,ApplicationCommentModel,MainActivitiesModel} = require('../../../helper/models')
const homeUtils = {};
homeUtils.addHome = (data) => {
  const homeData = new HomeModel(data);
  return homeData.save();
}
homeUtils.deleteHome = (data) => HomeModel.deleteOne(data);
homeUtils.findCategories = (data, fields = {}) => HomeModel.find(data, fields);
homeUtils.findActivity = (data, fields = {}) => ActivitiesModel.findOne(data, fields).populate({ path: 'organization_id',
select: '_id slug',});
homeUtils.updateHome = (cond, data) => HomeModel.findOneAndUpdate(cond, data);
homeUtils.findComment = (data, fields = {}) => ApplicationCommentModel.findOne(data, fields);
homeUtils.findMainActivity = (data, fields = {}) => MainActivitiesModel.findOne(data, fields).populate({ path: 'organization_id',
select: '_id slug',});
homeUtils.findMainAllActivity = (data, fields = {}) => MainActivitiesModel.find(data, fields);
module.exports = homeUtils
