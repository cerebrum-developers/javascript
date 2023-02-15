const organizationUtils = require('./organizationUtils')
const userUtils = require("../user/userUtils");
const commonUtils = require('../../../helper/commonUtils')
const { resStatusCode } = require('../../../helper/constant')
const { MainActivitiesModel } = require('../../../helper/models');
const organizationMiddleware = {}
const _ = require('lodash');

organizationMiddleware.duplicateNameValidator = async (req, res, next) => {
  try {
    if (req.body.name) {
      const data = await organizationUtils.findOrganization({ name: req.body.name });
      if (!data) {
        return next();
      }
      const response = await commonUtils.genErrorResponse(resStatusCode.error.duplicateFound, req.t('ERR_ORG_EXIST'));
      return res.status(response.statusCode).json(response);
    }
    return next()
  } catch (err) {
    const response = await commonUtils.genErrorResponse(resStatusCode.error.internalServerError, req.t('ERROR'), err);
    return res.status(response.statusCode).json(response);
  }
}

organizationMiddleware.findOrganizationById = async (req, res, next) => {
  try {
    const data = await organizationUtils.findOrganization({ _id: req.body.organization_id });
    if (data) {
      req.orgInfo = data;
      return next();
    }
    const response = await commonUtils.genErrorResponse(resStatusCode.error.badRequest, req.t('ERR_VALID_ORGID'));
    return res.status(response.statusCode).json(response);
  } catch (err) {
    const response = await commonUtils.genErrorResponse(resStatusCode.error.internalServerError, req.t('ERROR'), err);
    return res.status(response.statusCode).json(response);
  }
}
organizationMiddleware.findOrganizationRole = async (req, res, next) => {
  try {
    const data = await organizationUtils.findOrganizationRole({ organization_id: req.body.organization_id, user_id: req.body.user_id });
    if (data) {
      req.roleInfo = data;
      return next();
    }
    const response = await commonUtils.genErrorResponse(resStatusCode.error.badRequest, req.t('INVALID_ERR'));
    return res.status(response.statusCode).json(response);
  } catch (err) {
    const response = await commonUtils.genErrorResponse(resStatusCode.error.internalServerError, req.t('ERROR'), err);
    return res.status(response.statusCode).json(response);
  }
}

organizationMiddleware.findMainActivityOfOrganisationCreated = async (req, res, next) => {
  try {
    const { organization_id, user_id } = req.body;
    const data = await MainActivitiesModel.findOne({ organization_id: organization_id, activity_sub_type: "CREATED_ORGANIZATION" }, { _id: 2 });
    if (data) {
      req.mainActivityId = data._id;
      return next();
    }
    const response = await commonUtils.genErrorResponse(resStatusCode.error.badRequest, req.t('INVALID_ERR'));
    return res.status(response.statusCode).json(response);
  } catch (err) {
    const response = await commonUtils.genErrorResponse(resStatusCode.error.internalServerError, req.t('ERROR'), err);
    return res.status(response.statusCode).json(response);
  }
}
organizationMiddleware.findSeats = async (req, res, next) => {
  try {
    const data = await userUtils.findSubscription({ organization_id: req.params.id ,couponId:{$ne:null}}, { couponId: 1 });
  
    if (data && !_.isEmpty(data)) {
      let couponId = data.couponId;
      let couponData = await userUtils.findCoupon({ couponId: couponId }, { seats_per_coupon: 1 })
     
      req.seats = couponData.seats_per_coupon;
      return next();
    } else {
      req.seats = 0;
      return next();
    }

  } catch (err) {
    const response = await commonUtils.genErrorResponse(resStatusCode.error.internalServerError, req.t('ERROR'), err);
    return res.status(response.statusCode).json(response);
  }
}

module.exports = organizationMiddleware
