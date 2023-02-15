'use strict';
const mongoose = require('mongoose');
const MarketWorkspace = mongoose.model('MarketWorkspace');
let ObjectID = require('mongodb').ObjectID;
const commonUtils = require('../../../../helper/commonUtils');
const { resStatusCode } = require('../../../../helper/constant');
const _ = require('lodash')

const getWorkspacesTemplates = (req, res) => {
  const format = req.body.format; // it can be 'all' or '3'
  let query = {};
  let limit = 0;
  let categoryId;
  if (req.body.category_id) {
    categoryId = new ObjectID(req.body.category_id);
  }
  if (req.body.type === 'market') {
    query = { 'categories': { $in: [categoryId] }, published: true, status: 'approved', clone: true };
    if (format === 'all') {
      limit = 1000000;
    } else {
      limit = 3;
    }
  } else if (req.body.type === 'profile') {
    query = { owner: req.userInfo._id };
    limit = 1000000;
  } else {

    if (req.body.keyword && req.body.keyword != "") {
      query = {
        published: true,
        status: 'pending',
        clone: false,
        title: {
          '$regex': new RegExp(req.body.keyword, 'ig'),
        },
      }
    } else {
      query = { published: true,  status: 'pending' ,clone: false,};
    }
    limit = 1000000;
  }
  MarketWorkspace.aggregate([
    { $match: query },
    {
      '$addFields': {
        'ratingAverage': { '$avg': '$usersRatings.rating' }
      }
    },
    {
      $lookup: {
        from: 'users',
        localField: 'owner',
        foreignField: '_id',
        as: 'user'
      },
    },
    {
      $lookup: {
        from: 'businesses',
        localField: 'owner',
        foreignField: 'owner',
        as: 'profile'
      },
    },
    {
      $unwind: {
        preserveNullAndEmptyArrays: true,
        path: '$user'
      }
    },
    {
      $unwind: {
        preserveNullAndEmptyArrays: true,
        path: '$profile'
      }
    },
    {
      '$sort': { ratingAverage: -1, createdAt: -1 }
    },
    { '$limit': limit },
  ]).exec((err, workspaces) => {
    if (err) {
      const response = commonUtils.genErrorResponse(resStatusCode.error.internalServerError, req.t('ERROR'), err);
      return res.status(400).json(response);
    } else {
      let notNullDefault = _.reject(workspaces, ['parentId', null]);
      const mappedWorkspaces = _.map(notNullDefault, function (data) {
        return data.parentId
      })
      const result = {
        category: req.categoryInfo ? req.categoryInfo.Title : "",
        workspaces: workspaces,
        mappedWorkspaces:mappedWorkspaces
      };
      const response = commonUtils.genSuccessResponse(resStatusCode.success, req.t('SUCCESS'), result);
      return res.status(response.statusCode).json(response);
    }
  });
};

module.exports = getWorkspacesTemplates;
