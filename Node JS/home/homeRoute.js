const express = require('express');
const homeRouter = express.Router();
const homeController = require('./homeController');
const homeMiddleware = require('./homeMiddleware');
const homeValidation = require('./homeValidation');
const middleware = require('../../../helper/middleware');
const multipart = require('connect-multiparty')
const multipartMiddleware = multipart()
const addPostMiddleware = [
  multipartMiddleware,
  middleware.reqValidator,
  middleware.isAuthenticatedUser,
  homeMiddleware.checkData,
  homeController.addPost
];
homeRouter.post('/addPost', addPostMiddleware);
const addCommentMiddleware = [
  multipartMiddleware,
  homeValidation.validateAddComment,
  middleware.reqValidator,
  middleware.isAuthenticatedUser,
  homeMiddleware.getActivity,
  homeController.addActivityComment
];
homeRouter.post('/addActivityComment', addCommentMiddleware);
const getActivityMiddleware = [
  middleware.reqValidator,
  middleware.isAuthenticatedUser,
  homeController.getActivities
];
homeRouter.get('/getActivities', getActivityMiddleware);
const getAllCommentsMiddleware = [
  middleware.reqValidator,
  middleware.isAuthenticatedUser,
  homeController.getAllComments
];
homeRouter.get('/:id/getAllComments', getAllCommentsMiddleware);
const getCommentsMiddleware = [
  middleware.reqValidator,
  middleware.isAuthenticatedUser,
  homeController.getCommentDetail
];
homeRouter.get('/:id/getCommentDetail', getCommentsMiddleware);
const getSingleCommentMiddleware = [
  middleware.reqValidator,
  middleware.isAuthenticatedUser,
  homeController.getComment
];
homeRouter.get('/:id/getComment', getSingleCommentMiddleware);
const editPostMiddleware = [
  multipartMiddleware,
  middleware.reqValidator,
  middleware.isAuthenticatedUser,
  homeMiddleware.getPost,
  homeController.editPost
];
homeRouter.post('/:id/editPost', editPostMiddleware);
const deletePost = [
  middleware.reqValidator,
  middleware.isAuthenticatedUser,
  homeMiddleware.getAllPost,
  homeController.deletePost
];
homeRouter.delete('/:id/deletePost', deletePost);
const deleteSharedPost = [
  middleware.reqValidator,
  middleware.isAuthenticatedUser,
  homeMiddleware.getPost,
  homeController.deleteSharedPost
];
homeRouter.delete('/:id/deleteSharedPost', deleteSharedPost);
const getSubActivityMiddleware = [
  middleware.reqValidator,
  middleware.isAuthenticatedUser,
  homeMiddleware.getPost,
  homeController.getSubActivity
];
homeRouter.get('/:id/getSubActivity', getSubActivityMiddleware);
const getCalenderMiddleware = [
  homeValidation.validateCalender,
  middleware.reqValidator,
  middleware.isAuthenticatedUser,
  homeController.getCalenderDetail
];
homeRouter.post('/getCalenderDetail', getCalenderMiddleware);

const addLikeMiddleware = [
  middleware.reqValidator,
  middleware.isAuthenticatedUser,
  homeController.addLikes
];
homeRouter.get('/:activity_id/likes', addLikeMiddleware);
const addCommentLikeMiddleware = [
  middleware.reqValidator,
  middleware.isAuthenticatedUser,
  homeController.commentLikes
];
homeRouter.get('/:commentId/commentLikes', addCommentLikeMiddleware);
const deleteComment = [
  middleware.reqValidator,
  middleware.isAuthenticatedUser,
  homeController.deleteComment
];
homeRouter.delete('/:id/deleteComment', deleteComment);
const editCommentMiddleware = [
  multipartMiddleware,
  middleware.reqValidator,
  middleware.isAuthenticatedUser,
  homeMiddleware.getComment,
  homeController.editComment
];
homeRouter.post('/:id/editComment', editCommentMiddleware);
const sharePostMiddleware = [
  multipartMiddleware,
  middleware.reqValidator,
  middleware.isAuthenticatedUser,
  homeMiddleware.getShareActivity,
  homeMiddleware.findMainActivityOfPostCreated,
  homeController.sharePost
];
homeRouter.post('/sharePost', sharePostMiddleware);
const getSearchPostMiddleware = [
  middleware.reqValidator,
  middleware.isAuthenticatedUser,
  homeController.getSearchPost
];
homeRouter.get('/getSearchPost', getSearchPostMiddleware);
const sendDailyDigest = [
  middleware.reqValidator,
  homeController.sendDailyDigest
];
homeRouter.get('/sendDailyDigest', sendDailyDigest);
module.exports = homeRouter
