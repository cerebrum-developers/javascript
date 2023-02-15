const express = require('express');
const marketWorkspaceRouter = express.Router();
const marketWorkspaceController = require('./market-workspaceController');
const marketWorkspaceMiddleware = require('./market-workspaceMiddleware');
const marketWorkspaceValidation = require('./market-workspaceValidation');
const middleware = require('../../../helper/middleware');
const multipart = require('connect-multiparty')
const multipartMiddleware = multipart()
const addMarketWorkspaceMiddleware = [
  multipartMiddleware,
  marketWorkspaceValidation.validateAddWorkspace,
  middleware.reqValidator,
  middleware.isAuthenticatedUser,
  marketWorkspaceMiddleware.findWorkspace,
  marketWorkspaceController.addMarketWorkspace,
];
marketWorkspaceRouter.post('/save', addMarketWorkspaceMiddleware);
const getMarketWorkspaceMiddleware = [
  marketWorkspaceValidation.validateGetWorkspace,
  middleware.reqValidator,
  middleware.isAuthenticatedUser,
  marketWorkspaceMiddleware.findCategory,
  marketWorkspaceController.getMarketWorkspaces,
];
marketWorkspaceRouter.post('/market-workspaces', getMarketWorkspaceMiddleware);
const getWpMarketWorkspaceMiddleware = [
  marketWorkspaceValidation.validateGetWorkspace,
  middleware.reqValidator,
  marketWorkspaceMiddleware.findCategory,
  marketWorkspaceController.getMarketWorkspaces,
];
marketWorkspaceRouter.post('/wp-market-workspaces', getWpMarketWorkspaceMiddleware);
const approvalMiddleware = [
  marketWorkspaceValidation.validateWorkspace,
  middleware.reqValidator,
  middleware.isAuthenticatedUser,
  marketWorkspaceMiddleware.findMarketWorkspace,
  marketWorkspaceController.workspaceApproval,
];
marketWorkspaceRouter.post('/workspace-approval', approvalMiddleware);
const detailMarketWorkspaceMiddleware = [
  middleware.reqValidator,
  middleware.isAuthenticatedUser,
  marketWorkspaceController.detailMarketWorkspace,
];
marketWorkspaceRouter.get('/:id/detail', detailMarketWorkspaceMiddleware);

const publicDetailMarketWorkspaceMiddleware = [
  middleware.reqValidator,
  marketWorkspaceController.publicDetailMarketWorkspace,
];
marketWorkspaceRouter.get('/:id/publicDetail', publicDetailMarketWorkspaceMiddleware);

const editMarketWorkspaceMiddleware = [
  multipartMiddleware,
  middleware.reqValidator,
  middleware.isAuthenticatedUser,
  marketWorkspaceMiddleware.findDetail,
  marketWorkspaceController.editMarketWorkspace,
];
marketWorkspaceRouter.post('/:id/edit', editMarketWorkspaceMiddleware);

const addMarketCommentMiddleware = [
  middleware.reqValidator,
  middleware.isAuthenticatedUser,
  marketWorkspaceController.addComment,
];
marketWorkspaceRouter.post('/add/comment', addMarketCommentMiddleware);

const editMarketCommentMiddleware = [
  middleware.reqValidator,
  middleware.isAuthenticatedUser,
  marketWorkspaceController.editComment,
];
marketWorkspaceRouter.post('/edit/:commentId/comment', editMarketCommentMiddleware);

const getMarketCommentMiddleware = [
  middleware.reqValidator,
  // middleware.isAuthenticatedUser,
  marketWorkspaceController.getAllComment,
];
marketWorkspaceRouter.get('/getAllComment/:marketDetailsId', getMarketCommentMiddleware);

const addRatingmarketMiddleware = [
  middleware.reqValidator,
  middleware.isAuthenticatedUser,
  marketWorkspaceController.addRatingonMarketPlace,
];
marketWorkspaceRouter.post('/add-rating-on-market-place/:marketId', addRatingmarketMiddleware);

const overallRatingMiddleware = [
  middleware.reqValidator,
  // middleware.isAuthenticatedUser,
  marketWorkspaceController.overallRating,
];
marketWorkspaceRouter.get('/overallRating/:marketId', overallRatingMiddleware);

const cloneWorkspaceMiddleware = [
  middleware.reqValidator,
  middleware.isAuthenticatedUser,
  marketWorkspaceController.cloneWorkspaceByChooseOption,
];
marketWorkspaceRouter.post('/clone-workspace-by-choose-option', cloneWorkspaceMiddleware);

const cloneWorkspaceByNameMiddleware = [
  middleware.reqValidator,
  middleware.isAuthenticatedUser,
  marketWorkspaceController.cloneWorkspaceByName,
];
marketWorkspaceRouter.post('/clone-workspace-by-name', cloneWorkspaceByNameMiddleware);

const followOrgMiddleware = [
  middleware.reqValidator,
  middleware.isAuthenticatedUser,
  marketWorkspaceController.followOrg,
];
marketWorkspaceRouter.post('/followOrg', followOrgMiddleware);

const getFollowOrgMiddleware = [
  middleware.reqValidator,
  middleware.isAuthenticatedUser,
  marketWorkspaceController.getFollowOrg,
];
marketWorkspaceRouter.post('/getFollowOrg', getFollowOrgMiddleware);

module.exports = marketWorkspaceRouter
