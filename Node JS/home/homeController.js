const _ = require('lodash');
const mongoose = require('mongoose');
const organizationUtils = require('../organization/organizationUtils');
const workspaceUtils = require('../workspace/workspaceUtils');
const userUtils = require('../user/userUtils');
const commentTemplate = require('../../../templates/activity-comment.html');

const commonUtils = require('../../../helper/commonUtils');
const { resStatusCode, pictureTypes, activity_type } = require('../../../helper/constant');
const activityTemplate = require('../../../helper/activity');
const fs = require('fs');
let Activity = require('../../../helper/logActivity');
let mainActivity = require('../../../helper/mainActivity');
let subActivity = require('../../../helper/subActivity');
const subActivities = mongoose.model('subActivities');
const activityHelper = require("./helper/activity");
const subActivityHelper = require("./helper/more-acitivity");
const likeHelper = require("./helper/activity_like");
const commentLikeHelper = require("./helper/comment_like");
const ApplicationComment = mongoose.model('Applicationcomment');
const ActivityModel = mongoose.model('Activities');
const mainActivityModel = mongoose.model('mainActivities');

const ShareActivity = mongoose.model('ShareActivity');
const User = mongoose.model('User');
const homeContoller = {}
const { ObjectId } = mongoose.Types;
const sendNotification = require('../../../helper/send-notification');
let { google } = require('googleapis');
const credentials = require("../../../config/credentials.json");
const scopes = ['https://www.googleapis.com/auth/calendar'];
const homeHelper = require("../home/helper/activity_home");
const shareHelper = require("../home/helper/activity_share");
const searchPostHelper = require("../home/helper/search-post");
const deletePostHelper = require("../home/helper/delete-post");
const deleteSharePostHelper = require("../home/helper/delete-share");
const digestHelper = require("../home/helper/digest");

const io = require("socket.io-client");
const socketUrl = `${process.env.SOCKET_URL}?authorization=${process.env.ADMIN_TOKEN}`;

function authorize(credentials, token, callback) {

  const { client_secret, client_id, redirect_uris } = credentials.installed;
  const oAuth2Client = new google.auth.OAuth2(
    client_id, client_secret, redirect_uris[0]);

  let finalToken = {
    "access_token": token.access_token,
    "expires_in": token.expires_in,
    "refresh_token": token.refresh_token,
    "scope": ['https://www.googleapis.com/auth/calendar.readonly',
      'https://www.googleapis.com/auth/calendar'],
    "token_type": "Bearer"
  }
  oAuth2Client.setCredentials(finalToken);

  callback(oAuth2Client);

}

homeContoller.addPost = async (req, res) => {
  try {
    let rich_link = req.body.urlData && !_.isEmpty(req.body.urlData) ? JSON.parse(req.body.urlData) : [];
    let comment_text = '';
    let fname;
    let avatar;
    let userIds = [];
    let orgId = null;
    if (req.wsInfo) {
      orgId = req.wsInfo.organization_id._id;
      fname = req.wsInfo.organization_id.slug;
    } else if (req.orgInfo) {
      orgId = req.orgInfo._id;
      fname = req.orgInfo.fname;
    } else {
      fname = 'post-avatar';
    }

    if(orgId){
      const orgUserRole = await organizationUtils.findOrganizationRoles({ organization_id: ObjectId(orgId), user_id: ObjectId(req.userInfo._id), isEmployee: true }, { role: 1 });

      // if(orgUserRole && orgUserRole[0] && orgUserRole[0].role && orgUserRole[0].role === 'light_member' && !req.body.workspace_id){
        if(true === false){
        const response = {
          statusCode : 400,
          success: false, 
          message: "Access denied for Light Member"
        }
        return res.status(400).json(response)
      }
    }


    if (req.body.comment && req.body.comment !== '' || !_.isEmpty(req.files)) {
      if (req.body.comment && req.body.comment != '') {
        commentText = req.body.comment.split('{{');
        commentText = commentText.filter(e => e.includes('}}'));
        commentText.forEach(e => {
          userIds.push(ObjectId(e.split('}}')[0]));
          splitText = e.split('}}')[1];
        });
      }
      comment_text = req.body.comment ? req.body.comment : '';
      if (req.files.avatar) {
        const configData = {
          owner: req.userInfo._id,
          fname,
          thumbTypes: []
        };
        let attachmentData = [];
        for (let i = 0; i < req.files.avatar.length; i++) {

          if (req.files.avatar[i].name === "blob") {
            req.files.avatar[i].name = req.body.fileName ? req.body.fileName : 'file.jpg';
          }
          attachmentData.push(await commonUtils.uploadFile(req.files.avatar[i], pictureTypes.postImg, configData));
        }
        avatar = attachmentData.length ? attachmentData : [];
      } else {
        avatar = [];
      }
      const activityText = activityTemplate.addPostTemplate(req.userInfo.firstName + ' ' + req.userInfo.lastName, 'added');
      // const logActivityPromise = Activity.logActivity(req.userInfo._id, orgId, req.wsInfo ? req.wsInfo._id : null, null, null, null, activityText, 'activity', activity_type.createdPost, "", "", '', avatar, undefined, comment_text, rich_link);
      const mainActivityPromise = mainActivity.logMainActivity(req.userInfo._id, orgId, req.wsInfo ? req.wsInfo._id : null, null, null, null, activityText, 'activity', activity_type.createdPost, "", "", '', avatar, undefined, comment_text, rich_link);
      mainActivityPromise.then(function (result) {
        let notificationText = activityTemplate.addPostTemplateNotification(req.userInfo.firstName + ' ' + req.userInfo.lastName, 'added');
        const notificationPromise = Activity.logActivity(req.userInfo._id, orgId, req.wsInfo ? req.wsInfo._id : null, null, null, null, notificationText, 'notification', activity_type.createdPost, '', '', '', "", result._id, "");
        // Update notification count for user who created the post
        const socket = io(socketUrl);
        socket.on("connect", () => {
          socket.emit("getNotificationCount", [req.userInfo._id]);
          socket.disconnect();
        });
        notificationPromise.then((action) => {

          if (userIds.length > 0) {
            let mentionedText = activityTemplate.addNotificationOnMentionedOnPost('mentioned');
            const notificationPromise = Activity.logActivity(req.userInfo._id, orgId, req.wsInfo ? req.wsInfo._id : null, null, null, null, mentionedText, 'notification', activity_type.mentionedPost, '', '', userIds, "", result._id, "");

            notificationPromise.then((action) => {
              // Update notification count for user who created the post
              const socket = io(socketUrl);
              socket.on("connect", () => {
                socket.emit("getNotificationCount", userIds);
                socket.disconnect();
              });
              if (action) {
                User.find({
                  _id: {
                    $in: userIds
                  }
                }, {
                  email: 1,
                  firstName: 1,
                  lastName: 1,
                  isSetUpAccountData: 1,
                  fcmToken: 1
                }, (err, users) => {
                  mentionedText = mentionedText.replace('[user-name]', req.userInfo.firstName + ' ' + req.userInfo.lastName);
                  let tokens = [];
                  let soundTokens = [];
                  for (let i = 0; i < users.length; i++) {
                    if (users[i] && users[i].isSetUpAccountData.tabEmailNotification &&
                      users[i].isSetUpAccountData.tabEmailNotification.recMessageNotification &&
                      users[i].isSetUpAccountData.tabEmailNotification.onScreenNotification) {
                      const emailPermissions = users[i].isSetUpAccountData.tabEmailNotification.recMessageNotification.map(per => per.children);
                      const notificationPermissions = users[i].isSetUpAccountData.tabEmailNotification.onScreenNotification.map(per => per.children);
                      if (emailPermissions.indexOf(1) > -1 || emailPermissions.indexOf('1') > -1) {
                        if (notificationPermissions.indexOf(1) > -1 || notificationPermissions.indexOf('1') > -1) {
                          if (notificationPermissions.indexOf(0) > -1 || notificationPermissions.indexOf('0') > -1) {

                            soundTokens.push(users[i].fcmToken);
                          } else {
                            tokens.push(users[i].fcmToken);
                          }
                        }
                      }
                    }
                  }
                  soundTokens = _.compact(soundTokens);
                  if (soundTokens.length > 0) {
                    const notificationInfo = '[' + req.userInfo.firstName + ' ' + req.userInfo.lastName + ']  mentioned you on post'
                    const notificationData = {
                      title: 'Notification',
                      body: notificationInfo,
                      params: {},
                    };
                    sendNotification(soundTokens, notificationData);
                  }
                  tokens = _.compact(tokens);
                  if (tokens.length > 0) {
                    const notificationInfo = '[' + req.userInfo.firstName + ' ' + req.userInfo.lastName + '] updated ' + applicationName
                    const notificationData = {
                      title: 'Notification',
                      body: notificationInfo,
                      params: {},
                    };
                    sendNotification(tokens, notificationData);
                  }

                });
              }
            });
            req.params.id = result._id;
            homeHelper(req, res);
          } else {
            req.params.id = result._id;
            homeHelper(req, res);
          }

        })

      });
    } else {
      const response = commonUtils.genErrorResponse(resStatusCode.error.notFound, req.t('ERROR'), 'Please add commnet or media');
      return res.status(response.statusCode).json(response);
    }
  } catch (err) {
    const response = await commonUtils.genErrorResponse(resStatusCode.error.internalServerError, req.t('ERROR'), err);
    console.log('errerrerrerr',err)
    return res.status(response.statusCode).json(response);
  }
}

homeContoller.addActivityComment = async (req, res) => {
  try {
    let data = req.body;
    const activitycomments = new ApplicationComment();
    let fname = req.activityInfo.organization_id != null ? req.activityInfo.organization_id.slug : 'comment-avatar';
    let mentionedUserIds = [];
    let avatar;
    let commentText = '';
    if (_.isEmpty(req.body.comment) && _.isEmpty(req.files.avatar)) {
      const response = commonUtils.genSuccessResponse(resStatusCode.success, 'Please enter comment');
      return res.status(response.statusCode).json(response);
    } else {
      if (req.body.comment && req.body.comment != '') {
        commentText = req.body.comment.split('{{');
        commentText = commentText.filter(e => e.includes('}}'));
        commentText.forEach(e => mentionedUserIds.push((e.split('}}')[0])));
      };
      let stringUsers = {};
      let comment_for_update = '';
      if (req.files.avatar) {

        const configData = {
          owner: req.userInfo._id,
          fname,
          thumbTypes: []
        };
        let attachmentData = [];
        for (let i = 0; i < req.files.avatar.length; i++) {
          attachmentData.push(await commonUtils.uploadFile(req.files.avatar[i], pictureTypes.commentImg, configData));
        }
        avatar = attachmentData.length ? attachmentData : [];
      } else {
        avatar = [];
      }
      activitycomments.activity_id = data.activity_id ? data.activity_id : null;
      activitycomments.parentId = data.parentId ? data.parentId : null;
      activitycomments.user_id = req.userInfo._id;
      activitycomments.comment = data.comment ? data.comment : '';
      activitycomments.image = avatar;
      activitycomments.comment_rich_link = data.comment_rich_link ? data.comment_rich_link : "";
      activitycomments.record_id = req.activityInfo.record_id;
      activitycomments.application_id = req.activityInfo.application_id;
      activitycomments.save(function (err, docs) {
        if (!err) {
          // ActivityModel.findOne({
          //   '_id': docs.activity_id
          // }, function (errFindWorkspace, activityWorkspaceId) {
          //   if (!errFindWorkspace) {
          let activityText = activityTemplate.addCommentActivityTemplate(req.userInfo.firstName + ' ' + req.userInfo.lastName, 'commented');
          let logActivityPromise = subActivity.logSubActivity(req.activityInfo._id, req.userInfo._id,
            req.activityInfo.organization_id,
            req.activityInfo.workspace_id, req.activityInfo.application_id,
            req.activityInfo.record_id, null,
            activityText, 'comment',
            req.activityInfo.record_id != null ? activity_type.commentedOnApp : activity_type.commentedOnActivity, "", "", '', "",
            data.activity_id, data.comment ? data.comment : '');
          logActivityPromise.then(async (result) => {
            if (result) {
              let notificationText = activityTemplate.addNotificationOnUserComment('commented');
              let notificationActivityPromise = Activity.logActivity(req.userInfo._id,
                req.activityInfo.organization_id,
                req.activityInfo.workspace_id, req.activityInfo.application_id,
                req.activityInfo.record_id, null,
                notificationText, 'notification', req.activityInfo.record_id != null ? activity_type.commentedOnApp : activity_type.commentedOnActivity, "", "", '', "", data.activity_id, data.comment ? data.comment : '');
              notificationActivityPromise.then(async () => {
                // Update notification count for user who created the post
                const socket = io(socketUrl);
                socket.on("connect", () => {
                  socket.emit("getNotificationCount", [req.userInfo._id]);
                  socket.disconnect();
                });
                let roles;
                if (req.activityInfo.workspace_id && req.activityInfo.workspace_id != null) {
                  roles = await workspaceUtils.findWorkspaceRoles({ workspace_id: req.activityInfo.workspace_id, user_id: { $ne: null } }, { user_id: 1 })
                } else {
                  roles = await organizationUtils.findOrganizationRoles({ organization_id: req.activityInfo.workspace_id, user_id: { $ne: null } }, { user_id: 1 })
                }

                let userIds = roles && roles.length > 0 ? roles.map(role => role.user_id) : [];

                userIds = userIds.filter(user => user.toString() !== req.userInfo._id.toString());

                const userIdArray = userIds.map(each => ObjectId(each));
                const mentionedUserIdsArray = mentionedUserIds.map(each => ObjectId(each));

                User.find({
                  _id: {
                    $in: [...userIdArray, ...mentionedUserIdsArray]
                  }
                }, {
                  email: 1,
                  firstName: 1,
                  lastName: 1,
                  isSetUpAccountData: 1,
                  fcmToken: 1
                }, function (err, users) {
                  users.forEach((user) => {
                    let name = user.firstName + ' ' + user.lastName;
                    let imgUrl = '';
                    if (user.avatar && user.avatar !== '') {
                      imgUrl = process.env.MEDIA_URL + '/' + user.avatar;
                    } else {
                      imgUrl = process.env.USER_URL;
                    }
                    stringUsers['{{' + user.id + '}}'] = '<label style="color: #525252; font-size: 14px; font-weight: 400;font-family: Arial, Helvetica, sans-serif; display: inline-block; background-color: #D0F0FD; border-radius: 20px; padding:2px 5px 2px 6px; position: relative;">' +
                      '<img src="' + imgUrl + '" style="margin-right: 5px;margin-top: 2px;float:left;width: 16px; height: 16px; border-radius: 100%; position: absolute; left: 2px;top: 4px;"> ' + name + ' </label>';
                  });
                  if (req.body.comment && req.body.comment != '') {
                    comment_for_update = req.body.comment;
                    // eslint-disable-next-line no-useless-escape
                    let regex = /\{\{[^\}]*\}\}/g;

                    let getUserPromise = req.body.comment.match(regex);
                    if (getUserPromise && getUserPromise.length) {
                      getUserPromise.map(user => {
                        comment_for_update = comment_for_update.replace(user, stringUsers[user]);
                      });
                    }
                  };
                  notificationText = notificationText.replace('[user-name]', (req.userInfo.firstName + ' ' + req.userInfo.lastName));
                  //   notificationText += ' - ' + ws.name;
                  let tokens = [];
                  let soundTokens = [];
                  let soundMentionedTokens = [];
                  let mentionedTokens = [];
                  const emails = [];
                  let mentionedEmails = [];
                  const mentionedUsers = users.filter(user => mentionedUserIds.includes(user._id.toString()));
                  users = users.filter(user => userIds.includes(user._id.toString()));
                  for (let i = 0; i < users.length; i++) {
                    if (users[i] && users[i].isSetUpAccountData.tabEmailNotification &&
                      users[i].isSetUpAccountData.tabEmailNotification.recMessageNotification &&
                      users[i].isSetUpAccountData.tabEmailNotification.onScreenNotification) {
                      const emailPermissions = users[i].isSetUpAccountData.tabEmailNotification.recMessageNotification.map(per => per.children);
                      const notificationPermissions = users[i].isSetUpAccountData.tabEmailNotification.onScreenNotification.map(per => per.children);
                      if (emailPermissions.indexOf(4) > -1 || emailPermissions.indexOf('1') > -1) {
                        if (notificationPermissions.indexOf(1) > -1 || notificationPermissions.indexOf('1') > -1) {
                          if (notificationPermissions.indexOf(0) > -1 || notificationPermissions.indexOf('0') > -1) {
                            soundTokens.push(users[i].fcmToken);
                          } else {
                            tokens.push(users[i].fcmToken);
                          }
                        }
                        emails.push(users[i].email);
                      }
                    }
                  }
                  if (emails.length > 0) {
                    let avatar = req.userInfo.avatar ? process.env.MEDIA_URL + '/' + req.userInfo.avatar : process.env.LOGO_URL;
                    let commentBody = commentTemplate.replace('{URL}', process.env.SITE_URL);
                    commentBody = commentBody.replace('{NAME}', req.userInfo.firstName + ' ' + req.userInfo.lastName);
                    commentBody = commentBody.replace('{AVATAR}', avatar);
                    commentBody = commentBody.replace('{COMMENT}', comment_for_update);
                    commentBody = commentBody.replace('{TYPE}', 'added');
                    commonUtils.sendMail(emails, commentBody, req.t('COMMENT_ADD_SUBJECT'));
                  }
                  soundTokens = _.compact(soundTokens);
                  if (soundTokens.length > 0) {
                    const notificationInfo = '[' + req.userInfo.firstName + ' ' + req.userInfo.lastName + '] added comment on  post';
                    const notificationData = {
                      title: 'Notification',
                      body: notificationInfo,
                      params: {},
                    };
                    sendNotification(soundTokens, notificationData);
                  }
                  tokens = _.compact(tokens);

                  if (tokens.length > 0) {
                    const notificationInfo = '[' + req.userInfo.firstName + ' ' + req.userInfo.lastName + '] added comment on  post';
                    const notificationData = {
                      title: 'Notification',
                      body: notificationInfo,
                      params: {},
                    };
                    sendNotification(tokens, notificationData);
                  }
                  if (mentionedUsers.length > 0) {
                    let mentionedText = activityTemplate.addNotificationOnMentionedOnApp('mentioned');
                    const notificationPromise = Activity.logActivity(req.userInfo._id,
                      req.activityInfo.organization_id,
                      req.activityInfo.workspace_id, req.activityInfo.application_id,
                      req.activityInfo.record_id, null, mentionedText, 'notification',
                      req.activityInfo.record_id != null ? activity_type.mentionedApp : activity_type.mentionedActivity,
                      '', '', mentionedUserIdsArray, '', data.activity_id);
                    notificationPromise.then(function () {
                      // Update notification count for user who created the post

                      for (let i = 0; i < mentionedUsers.length; i++) {
                        if (mentionedUsers[i] && mentionedUsers[i].isSetUpAccountData.tabEmailNotification &&
                          mentionedUsers[i].isSetUpAccountData.tabEmailNotification.recMessageNotification &&
                          mentionedUsers[i].isSetUpAccountData.tabEmailNotification.onScreenNotification) {
                          const emailPermissions = mentionedUsers[i].isSetUpAccountData.tabEmailNotification.recMessageNotification.map(per => per.children);

                          const notificationPermissions = mentionedUsers[i].isSetUpAccountData.tabEmailNotification.onScreenNotification.map(per => per.children);
                          if (emailPermissions.indexOf(2) > -1 || emailPermissions.indexOf('2') > -1) {

                            if (notificationPermissions.indexOf(1) > -1 || notificationPermissions.indexOf('1') > -1) {
                              if (notificationPermissions.indexOf(0) > -1 || notificationPermissions.indexOf('0') > -1) {
                                soundMentionedTokens.push(mentionedUsers[i].fcmToken);
                              } else {
                                mentionedTokens.push(mentionedUsers[i].fcmToken);
                              }
                            }
                            mentionedEmails.push(mentionedUsers[i].email);
                          }
                        }
                      }
                      mentionedEmails = mentionedEmails.filter(e => !emails.includes(e));

                      if (mentionedEmails.length > 0) {
                        let avatar = req.userInfo.avatar ? process.env.MEDIA_URL + '/' + req.userInfo.avatar : process.env.LOGO_URL;
                        let commentBody = commentTemplate.replace('{URL}', process.env.SITE_URL);
                        commentBody = commentBody.replace('{NAME}', req.userInfo.firstName + ' ' + req.userInfo.lastName);
                        commentBody = commentBody.replace('{AVATAR}', avatar);
                        commentBody = commentBody.replace('{COMMENT}', comment_for_update);
                        commentBody = commentBody.replace('{TYPE}', 'added');
                        commonUtils.sendMail(mentionedEmails, commentBody, req.t('COMMENT_ADD_SUBJECT'));
                      }
                      soundMentionedTokens = _.compact(soundMentionedTokens);
                      if (soundMentionedTokens.length > 0) {
                        const notificationInfo = '[' + req.userInfo.firstName + ' ' + req.userInfo.lastName + '] added comment on  post';
                        const notificationData = {
                          title: 'Notification',
                          body: notificationInfo,
                          params: {},
                        };
                        sendNotification(soundMentionedTokens, notificationData);
                      }
                      mentionedTokens = _.compact(mentionedTokens);

                      if (mentionedTokens.length > 0) {
                        const notificationInfo = '[' + req.userInfo.firstName + ' ' + req.userInfo.lastName + '] added comment on  post';
                        const notificationData = {
                          title: 'Notification',
                          body: notificationInfo,
                          params: {},
                        };
                        sendNotification(mentionedTokens, notificationData);
                      }
                      const socket = io(socketUrl);
                      socket.on("connect", () => {
                        socket.emit("getNotificationCount", mentionedUserIdsArray);
                        socket.disconnect();
                      });
                    });
                  }
                  const response = commonUtils.genSuccessResponse(resStatusCode.success, req.t('SUCCESS'), activitycomments);
                  return res.status(response.statusCode).json(response);

                });
              })
            } else {
              const response = commonUtils.genErrorResponse(resStatusCode.error.internalServerError, req.t('ERROR'));
              return res.status(response.statusCode).json(response);
            }
          });
        } else {
          const response = commonUtils.genErrorResponse(resStatusCode.error.internalServerError, req.t('ERROR'));
          return res.status(response.statusCode).json(response);
        }
      });
      // } else {
      //   const response = commonUtils.genErrorResponse(resStatusCode.error.internalServerError, req.t('ERROR'));
      //   return res.status(response.statusCode).json(response);
      // }
      // });
    }

  } catch (err) {
    const response = commonUtils.genErrorResponse(resStatusCode.error.internalServerError, req.t('ERROR'), err);
    return res.status(response.statusCode).json(response);
  }
}
homeContoller.getActivities = async (req, res) => {
  try {
    activityHelper(req, res);
  } catch (err) {
    const response = commonUtils.genErrorResponse(resStatusCode.error.internalServerError, req.t('ERROR'), err);
    return res.status(response.statusCode).json(response);
  }
}
homeContoller.getAllComments = async (req, res) => {
  try {
    const queryString = req.query;
    let limit = parseInt(queryString.limit);
    let skip = parseInt(queryString.skip);
    let query;
    if (!_.isEmpty(queryString.record_id)) {
      query = { parentId: null, record_id: ObjectId(queryString.record_id) };
    }
    else {
      query = { parentId: null, activity_id: ObjectId(req.params.id) };
    }
    ApplicationComment.aggregate([{
      $match: query
    },

    {
      $graphLookup: {
        from: "applicationcomments",
        startWith: "$_id",
        connectFromField: "_id",
        connectToField: "parentId",
        depthField: "depth",
        as: "children",
        maxDepth: 0,
      }
    },
    { $sort: { createdAt: -1 } },
    {
      $lookup:
      {
        from: "users",
        localField: "user_id",
        foreignField: "_id",
        as: "user"
      }
    },
    {
      $unwind: {
        preserveNullAndEmptyArrays: true,
        path: '$user'
      }
    },
    {
      $project: {
        _id: 1,
        comment: "$comment",
        image: "$image",
        record_id: '$record_id',
        comment_rich_link: "$comment_rich_link",
        parentId: "$parentId",
        activity_id: '$activity_id',
        user_id: '$user_id',
        likeUsers: '$likeUsers',
        createdAt: '$createdAt',
        updatedAt: '$updatedAt',
        username: { '$concat': ["$user.firstName", " ", "$user.lastName"] },
        user_avatar: "$user.avatar",
        isShow: "$_id",
        totalComments: { $size: "$children" }
      }
    },
    { "$skip": skip },
    { "$limit": limit }
    ]).exec((err, comment) => {
      if (comment && comment.length) {
        let commentData = [];
        let userIds = [];
        let stringUsers = {};
        let stringUpdateUsers = {};
        comment.forEach((comm, key) => {
          if (!_.isEmpty(comm.image)) {
            comm.image.forEach((img) => {
              let src =
                img.attachment.type === "img"
                  ? img.attachment.path
                  : img.thumbs.length
                    ? img.thumbs[0].thumbPath
                    : "";
              img.attachment.srcPath = src;
            })
          }
          let like = _.find(comm.likeUsers, ObjectId(req.userInfo._id));
          comment[key].isLiked = like && !_.isEmpty(like) ? 'true' : 'false'
          comment[key].comment_for_update = comm.comment;
          if (comm.comment && comm.comment !== '') {
            let regex = /\{\{[^\}]*\}\}/g;
            let getUserPromise = comm.comment.match(regex);
            if (getUserPromise && getUserPromise.length) {
              let refinedUserId = getUserPromise.map(user => {
                return user.replace('{{', '').replace('}}', '');
              });
              if (refinedUserId && refinedUserId.length) {
                userIds = _.concat(userIds, refinedUserId);
              }
            }
          }
        });

        User.find({
          _id: {
            $in: userIds
          }
        }, 'firstName lastName avatar', (err, users) => {
          if (!err) {
            users.forEach((user) => {
              let name = user.firstName + ' ' + user.lastName;
              stringUpdateUsers['{{' + user.id + '}}'] = '@' + name;
            });
            users.forEach((user) => {
              let name = user.firstName + ' ' + user.lastName;
              let imgUrl = '';
              if (user.avatar && user.avatar !== '') {
                imgUrl = process.env.MEDIA_URL + '/' + user.avatar;
              } else {
                imgUrl = process.env.USER_URL;
              }
              stringUsers['{{' + user.id + '}}'] = '<div [contenteditable]="false" class="client-name"><img src="' + imgUrl + '">' + name + '</div>'

            });
            comment.forEach((comm, key) => {
              //comment[key].comment_for_update = comment[key].comment;
              // eslint-disable-next-line no-useless-escape
              let regex = /\{\{[^\}]*\}\}/g;
              if (comm.comment && comm.comment !== null) {
                let getUserPromise = comm.comment.match(regex);
                if (getUserPromise && getUserPromise.length) {
                  getUserPromise.map(user => {
                    // comment[key].comment_for_update = comment[key].comment_for_update.replace(user, stringUpdateUsers[user]);
                    comment[key].comment = comment[key].comment.replace(user, stringUsers[user]);
                    return;
                  });
                }
              }
            });
            const mergedActivities = _.union(comment);
            // const sortedActivities = mergedActivities.sort((a, b) => {
            //   return new Date(a.createdAt) - new Date(b.createdAt);
            // });
            const response = commonUtils.genSuccessResponse(resStatusCode.success, req.t('SUCCESS'), mergedActivities);
            return res.status(response.statusCode).json(response);
          }

        });
      } else {
        const response = commonUtils.genSuccessResponse(resStatusCode.success, req.t('SUCCESS'), []);
        return res.status(response.statusCode).json(response);
      }

    })
  } catch (err) {
    const response = commonUtils.genErrorResponse(resStatusCode.error.internalServerError, req.t('ERROR'), err);
    return res.status(response.statusCode).json(response);
  }
}
homeContoller.getCommentDetail = async (req, res) => {
  try {
    const queryString = req.query;
    let limit = 10;
    let skip = queryString.skip ? parseInt(queryString.skip) : 0;
    let query = { parentId: ObjectId(req.params.id) }

    ApplicationComment.aggregate([
      {
        $graphLookup: {
          from: "applicationcomments",
          startWith: "$_id",
          connectFromField: "_id",
          connectToField: "parentId",
          as: "comments",
          maxDepth: 0,
          depthField: "comments"
        }
      },
      //  { $sort: { "$createdAt": -1 } },
      {
        $lookup:
        {
          from: "users",
          localField: "user_id",
          foreignField: "_id",
          as: "user"
        }
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
          path: '$comments'
        }
      },
      {
        $lookup:
        {
          from: "users",
          localField: "comments.user_id",
          foreignField: "_id",
          as: "usercomment"
        }
      },
      {
        $unwind: {
          preserveNullAndEmptyArrays: true,
          path: '$usercomment'
        }
      },

      { '$match': query },

      {
        $project: {
          "_id": 1,
          "parentId": 1,
          "activity_id": 1,
          "record_id": 1,
          "comment": 1,
          "image": 1,
          "user_id": 1,
          "createdAt": 1,
          "likeUsers": 1,
          'username': { '$concat': ["$user.firstName", " ", "$user.lastName"] },
          'user_avatar': "$user.avatar",
          "comment_rich_link": 1,
          "comments._id": 1,
          "comments.user_id": 1,
          "comments.username": { '$concat': ["$usercomment.firstName", " ", "$usercomment.lastName"] },
          "comments.user_avatar": 1,
          "comments.comment": 1,
          "comments.createdAt": 1,
          "comments.image": 1,
          "comments.activity_id": 1,
          "comments.record_id": 1,
          "comments.parentId": 1,
          "comments.isShow": "$comments._id",
          "comments.likeUsers": 1,
          "comments.comment_rich_link": 1
        }
      },
      { '$match': { "parentId": { $ne: null } } },
      {
        $sort: {
          _id: 1,
          "comments.createdAt": -1
        }
      },
      {
        $group: {
          _id: "$_id",
          activity_id: { $first: "$activity_id" },
          record_id: { $first: "$record_id" },
          comment: { $first: "$comment" },
          parentId: { $first: "$parentId" },
          image: { $first: "$image" },
          likeUsers: { $first: "$likeUsers" },
          comment_rich_link: { $first: "$comment_rich_link" },
          username: { $first: "$username" },
          user_avatar: { $first: "$user_avatar" },
          user_id: { $first: "$user_id" },
          createdAt: { $first: "$createdAt" },
          isShow: { $first: "$_id" },
          comments: { $push: "$comments" }
        }
      },

      {
        $addFields: {
          comments: {
            $reduce: {
              input: "$comments",
              initialValue: {
                currentLevel: -1,
                currentLevelEmployees: [],
                previousLevelEmployees: []
              },
              in: {
                $let: {
                  vars: {
                    prev: {
                      $cond: [
                        { $eq: ["$$value.currentLevel", "$$this.level"] },
                        "$$value.previousLevelEmployees",
                        "$$value.currentLevelEmployees"
                      ]
                    },
                    current: {
                      $cond: [
                        { $eq: ["$$value.currentLevel", "$$this.level"] },
                        "$$value.currentLevelEmployees",
                        []
                      ]
                    }
                  },
                  in: {
                    currentLevel: "$$this.level",
                    previousLevelEmployees: "$$prev",
                    currentLevelEmployees: {
                      $concatArrays: [
                        "$$current",
                        [
                          {
                            $mergeObjects: [
                              "$$this",
                              { comments: { $filter: { input: "$$prev", as: "e", cond: { $eq: ["$$e.parentId", "$$this._id"] } } } }
                            ]
                          }
                        ]
                      ]
                    }
                  }
                }
              }
            }
          }
        }
      },
      {
        $addFields: { comments: "$comments.currentLevelEmployees" }
      }


    ]).exec((err, comment) => {
      if (comment && comment.length) {
        let commentData = [];
        let userIds = [];
        let stringUsers = {};
        let stringUpdateUsers = {};
        comment.forEach((comm, key) => {
          if (!_.isEmpty(comm.image)) {
            comm.image.forEach((img) => {
              let src =
                img.attachment.type === "img"
                  ? img.attachment.path
                  : img.thumbs.length
                    ? img.thumbs[0].thumbPath
                    : "";
              img.attachment.srcPath = src;
            })
          }
          if (!_.isEmpty(comm.comments)) {
            comm.comments.forEach((sub) => {
              if (sub.image && !_.isEmpty(sub.image)) {
                sub.image.forEach((img) => {
                  let src =
                    img.attachment.type === "img"
                      ? img.attachment.path
                      : img.thumbs.length
                        ? img.thumbs[0].thumbPath
                        : "";
                  img.attachment.srcPath = src;
                })
              }
            })
          }
          let like = _.find(comm.likeUsers, ObjectId(req.userInfo._id));
          comment[key].isLiked = like && !_.isEmpty(like) ? 'true' : 'false'
          comment[key].comment_for_update = comm.comment;
          if (comm.comment && comm.comment !== '') {
            let regex = /\{\{[^\}]*\}\}/g;
            let getUserPromise = comm.comment.match(regex);
            if (getUserPromise && getUserPromise.length) {
              let refinedUserId = getUserPromise.map(user => {
                return user.replace('{{', '').replace('}}', '');
              });
              if (refinedUserId && refinedUserId.length) {
                userIds = _.concat(userIds, refinedUserId);
              }
            }
          }
          comment[key].comments.forEach((subcomm, index) => {
            let like = _.find(subcomm.likeUsers, ObjectId(req.userInfo._id));
            subcomm.isLiked = like && !_.isEmpty(like) ? 'true' : 'false'
            subcomm.comment_for_update = subcomm.comment;
            if (subcomm.comment && subcomm.comment !== '') {
              let regex = /\{\{[^\}]*\}\}/g;
              let getUserPromise = subcomm.comment.match(regex);
              if (getUserPromise && getUserPromise.length) {
                let refinedUserId = getUserPromise.map(user => {
                  return user.replace('{{', '').replace('}}', '');
                });
                if (refinedUserId && refinedUserId.length) {
                  userIds = _.concat(userIds, refinedUserId);
                }
              }
            }
          })
        });

        User.find({
          _id: {
            $in: userIds
          }
        }, 'firstName lastName avatar', (err, users) => {
          if (!err) {
            users.forEach((user) => {
              let name = user.firstName + ' ' + user.lastName;
              stringUpdateUsers['{{' + user.id + '}}'];  //= '@' + name;
            });
            users.forEach((user) => {
              let name = user.firstName + ' ' + user.lastName;
              let imgUrl = '';
              if (user.avatar && user.avatar !== '') {
                imgUrl = process.env.MEDIA_URL + '/' + user.avatar;
              } else {
                imgUrl = process.env.USER_URL;
              }
              stringUsers['{{' + user.id + '}}'] = '<div [contenteditable]="false" class="client-name"><img src="' + imgUrl + '">' + name + '</div>'

            });
            comment.forEach((comm, key) => {
              // comment[key].comment_for_update = comment[key].comment;
              // eslint-disable-next-line no-useless-escape
              let regex = /\{\{[^\}]*\}\}/g;
              if (comm.comment && comm.comment !== null) {
                let getUserPromise = comm.comment.match(regex);
                if (getUserPromise && getUserPromise.length) {
                  getUserPromise.map(user => {
                    // comment[key].comment_for_update = comment[key].comment_for_update;
                    comment[key].comment = comment[key].comment.replace(user, stringUsers[user]);
                    return;
                  });
                }
              }
              comment[key].comments.forEach((subcomm, index) => {

                if (subcomm.comment && subcomm.comment !== null) {
                  let getUserPromise = subcomm.comment.match(regex);
                  if (getUserPromise && getUserPromise.length) {
                    getUserPromise.map(user => {
                      // subcomm.comment_for_update = subcomm.comment_for_update.replace(user, stringUpdateUsers[user]);
                      subcomm.comment = subcomm.comment.replace(user, stringUsers[user]);
                      return;
                    });
                  }
                }
              })
            });
            const mergedActivities = _.union(comment);
            const sortedActivities = mergedActivities.sort((a, b) => {
              return new Date(a.createdAt) - new Date(b.createdAt);
            });
            const response = commonUtils.genSuccessResponse(resStatusCode.success, req.t('SUCCESS'), sortedActivities);
            return res.status(response.statusCode).json(response);
          }

        });
      } else {
        const response = commonUtils.genSuccessResponse(resStatusCode.success, req.t('SUCCESS'), []);
        return res.status(response.statusCode).json(response);
      }
    })
  } catch (err) {
    const response = commonUtils.genErrorResponse(resStatusCode.error.internalServerError, req.t('ERROR'), err);
    return res.status(response.statusCode).json(response);
  }
}
homeContoller.getComment = async (req, res) => {
  try {
    const queryString = req.query;
    let query = { _id: ObjectId(req.params.id) }
    ApplicationComment.find(query).exec((err, users) => {
      const response = commonUtils.genSuccessResponse(resStatusCode.success, req.t('SUCCESS'), users[0]);
      return res.status(response.statusCode).json(response);
    })
  } catch (err) {
    const response = commonUtils.genErrorResponse(resStatusCode.error.internalServerError, req.t('ERROR'), err);
    return res.status(response.statusCode).json(response);
  }
}
homeContoller.editPost = async (req, res) => {
  try {
    let rich_link = req.body.urlData && !_.isEmpty(req.body.urlData) ? JSON.parse(req.body.urlData) : [];
    let comment_text = '';
    let mentionedUserIds = [];
    let attachmentData = [];
    let fname;
    let avatar;
    let imgData = {};
    let activity = req.activity;
    if (activity.workspace_id && activity.workspace_id != null) {
      fname = activity.workspace_id.organization_id.slug;
    } else if (activity.organization_id && !_.isEmpty(activity.organization_id)) {
      fname = activity.organization_id.slug;
    } else {
      fname = 'post-avatar';
    }
    const configData = {
      owner: req.userInfo._id,
      fname,
      thumbTypes: []
    };
    if (_.isEmpty(req.body.comment) && _.isEmpty(req.files) && _.isEmpty(req.body.attachmentData)) {

      const response = await commonUtils.genErrorResponse(resStatusCode.error.notFound, req.t('ERROR'), 'Please add commnet or media');
      return res.status(response.statusCode).json(response);
    } else {
      comment_text = req.body.comment;
      let attachmentData = req.body.attachmentData ? JSON.parse(req.body.attachmentData) : [];
      if (req.body.type !== "remove") {
        if (req.files && req.files.avatar) {
          for (let i = 0; i < req.files.avatar.length; i++) {
            attachmentData.push(await commonUtils.uploadFile(req.files.avatar[i], pictureTypes.postImg, configData));
          }
        }
      } else {
        const data = JSON.parse(req.body.attachmentData);
        await Promise.all(_.map(data.toRemove, async (removeData) => {
          await commonUtils.deleteFile(removeData);
        }))
        attachmentData = data.toSave;
        if (req.files && req.files.avatar) {
          for (let i = 0; i < req.files.avatar.length; i++) {
            attachmentData.push(await commonUtils.uploadFile(req.files.avatar[i], pictureTypes.postImg, configData));
          }
        }
      }
      if (attachmentData) {
        avatar = attachmentData.length ? attachmentData : [];
      }
      //const activityText = activityTemplate.addPostTemplate(req.userInfo.firstName + ' ' + req.userInfo.lastName, 'edited');
      let updateArr = {
        avatar: avatar,
        comment: comment_text,
        comment_rich_link: rich_link
      }
      await mainActivityModel.findByIdAndUpdate({ _id: req.params.id }, updateArr);

      if (req.activity.activity_sub_type == 'CREATED_POST') {
        req.params.id = activity._id;
        homeHelper(req, res);
      } else {
        req.params.post_id = req.activity.post_id;
        shareHelper(req, res)
      }
    }
  } catch (err) {
    const response = commonUtils.genErrorResponse(resStatusCode.error.internalServerError, req.t('ERROR'), err);
    return res.status(response.statusCode).json(response);
  }
}
homeContoller.deletePost = async (req, res) => {
  try {
    let callbackFn = async (error) => {
      if (error) {
        const response = await commonUtils.genErrorResponse(resStatusCode.error.internalServerError, req.t('ERROR'), err);
        return res.status(response.statusCode).json(response);
      }
      const response = commonUtils.genSuccessResponse(resStatusCode.success, req.t('POST_DELETE_SUCCESS'));
      return res.status(response.statusCode).json(response);
    };
    deletePostHelper(req, res, callbackFn);

    // await ApplicationComment.deleteMany(
    //   { activity_id: req.params.id }, async (error) => {
    //     if (error) {
    //       const response = commonUtils.genErrorResponse(resStatusCode.error.internalServerError, req.t('ERROR'), error);
    //       return res.status(response.statusCode).json(response);
    //     } else {
    //       ActivityModel.deleteMany({
    //         $or: [{
    //           _id: req.params.id
    //         },
    //         {
    //           activity_id: req.params.id
    //         }, {
    //           post_id: req.params.id
    //         }]
    //       }, (err) => {
    //         ShareActivity.deleteMany({
    //           activity_id: req.params.id
    //         },async (error) => {
    //           const response = commonUtils.genSuccessResponse(resStatusCode.success, req.t('POST_DELETE_SUCCESS'));
    //           return res.status(response.statusCode).json(response)
    //         })

    //       });
    //     }
    //   })
  } catch (err) {
    const response = commonUtils.genErrorResponse(resStatusCode.error.internalServerError, req.t('ERROR'), err);
    return res.status(response.statusCode).json(response);
  }
}
homeContoller.deleteSharedPost = async (req, res) => {
  try {
    let callbackFn = async (error) => {
      if (error) {
        const response = await commonUtils.genErrorResponse(resStatusCode.error.internalServerError, req.t('ERROR'), err);
        return res.status(response.statusCode).json(response);
      }
      const response = commonUtils.genSuccessResponse(resStatusCode.success, req.t('POST_DELETE_SUCCESS'));
      return res.status(response.statusCode).json(response);
    };
    deleteSharePostHelper(req, res, callbackFn);

    // await ApplicationComment.deleteMany(
    //   { activity_id: req.params.id }, async (error) => {
    //     if (error) {
    //       const response = commonUtils.genErrorResponse(resStatusCode.error.internalServerError, req.t('ERROR'), error);
    //       return res.status(response.statusCode).json(response);
    //     } else {
    //       ActivityModel.deleteMany({
    //         $or: [{
    //           _id: req.params.id
    //         },
    //         {
    //           activity_id: req.params.id
    //         }, {
    //           post_id: req.params.id
    //         }]
    //       }, (err) => {
    //         ShareActivity.deleteMany({
    //           activity_id: req.params.id
    //         },async (error) => {
    //           const response = commonUtils.genSuccessResponse(resStatusCode.success, req.t('POST_DELETE_SUCCESS'));
    //           return res.status(response.statusCode).json(response)
    //         })

    //       });
    //     }
    //   })
  } catch (err) {
    const response = commonUtils.genErrorResponse(resStatusCode.error.internalServerError, req.t('ERROR'), err);
    return res.status(response.statusCode).json(response);
  }
}
homeContoller.getSubActivity = async (req, res) => {
  try {
    subActivityHelper(req, res);
  } catch (err) {
    const response = commonUtils.genErrorResponse(resStatusCode.error.internalServerError, req.t('ERROR'), err);
    return res.status(response.statusCode).json(response);
  }
}

homeContoller.getCalenderDetail = async (req, res) => {
  try {
    const tokenData = await userUtils.findauthToken({ user_id: req.userInfo._id, "platform": "calendar" });
 
    if (tokenData) {
      // Authorize a client with credentials, then call the Google Calendar API.
      authorize(credentials, tokenData.token, listEvents);
      async function listEvents(auth) {
        const calendar = google.calendar({ version: 'v3', auth });
        await calendar.events.list({
          calendarId: tokenData.email
        }, async (err, data) => {

          if (err) {
            const response = await commonUtils.genErrorResponse(resStatusCode.error.internalServerError, req.t('ERROR'), err);
            return res.status(response.statusCode).json(response);
          }
          const events = data.data.items;
          if (events.length) {
            const response = await commonUtils.genSuccessResponse(resStatusCode.success, req.t('SUCCESS'), events);
            return res.status(response.statusCode).json(response)
          } else {
            const response = await commonUtils.genSuccessResponse(resStatusCode.success, req.t('SUCCESS'));
            return res.status(response.statusCode).json(response)
          }

        });

      }
    }

  } catch (err) {
    const response = await commonUtils.genErrorResponse(resStatusCode.error.internalServerError, req.t('ERROR'), err);
    return res.status(response.statusCode).json(response);
  }
}

homeContoller.addLikes = async (req, res) => {
  try {
    likeHelper(req, res);
  } catch (err) {
    const response = commonUtils.genErrorResponse(resStatusCode.error.internalServerError, req.t('ERROR'), err);
    return res.status(response.statusCode).json(response);
  }
}
homeContoller.commentLikes = async (req, res) => {
  try {
    commentLikeHelper(req, res);
  } catch (err) {
    const response = commonUtils.genErrorResponse(resStatusCode.error.internalServerError, req.t('ERROR'), err);
    return res.status(response.statusCode).json(response);
  }
}
homeContoller.deleteComment = async (req, res) => {
  try {
    await ApplicationComment.findById({ _id: req.params.id }, async (err, comment) => {
      if (comment.parentId != null) {
        var ids = [];
        ids.push(ObjectId(req.params.id));
        await ApplicationComment.find({ parentId: ObjectId(req.params.id) }, async (error, children) => {
          for (let i = 0; i < children.length; i++) {
            ids.push(ObjectId(children[i]._id));
          }
          await ApplicationComment.deleteMany({ _id: { $in: ids } }, async (error) => {
            if (error) {
              const response = commonUtils.genErrorResponse(resStatusCode.error.internalServerError, req.t('ERROR'), error);
              return res.status(response.statusCode).json(response);
            } else {
              const response = commonUtils.genSuccessResponse(resStatusCode.success, req.t('COMMENT_DELETE_SUCCESS'));
              return res.status(response.statusCode).json(response)
            }
          });
        })
      } else {
        var ids = [];
        ids.push(ObjectId(req.params.id));
        await ApplicationComment.find({ parentId: ObjectId(req.params.id) }, async (error, children) => {
          for (let i = 0; i < children.length; i++) {
            ids.push(ObjectId(children[i]._id));
          }
          await ApplicationComment.find({ parentId: { $in: ids } }, async (error, sub) => {
            for (let i = 0; i < sub.length; i++) {
              ids.push(ObjectId(sub[i]._id));
            }
            await ApplicationComment.deleteMany({ _id: { $in: ids } }, async (error) => {
              if (error) {
                const response = commonUtils.genErrorResponse(resStatusCode.error.internalServerError, req.t('ERROR'), error);
                return res.status(response.statusCode).json(response);
              } else {
                await ApplicationComment.deleteOne({ _id: req.params.id }, async (error) => {
                  const response = commonUtils.genSuccessResponse(resStatusCode.success, req.t('COMMENT_DELETE_SUCCESS'));
                  return res.status(response.statusCode).json(response)
                })
              }
            });
          })
        })
      }
    })
  } catch (err) {
    const response = commonUtils.genErrorResponse(resStatusCode.error.internalServerError, req.t('ERROR'), err);
    return res.status(response.statusCode).json(response);
  }
}
homeContoller.editComment = async (req, res) => {
  try {

    let comment_text = '';
    let fname;
    let avatar;
    let commentInfo = req.commentInfo;
    fname = req.commentInfo.activity_id.organization_id != null ? req.commentInfo.activity_id.organization_id.slug : 'comment-avatar';
    const configData = {
      owner: req.userInfo._id,
      fname,
      thumbTypes: []
    };
    if (req.body.comment && req.body.comment !== '' || !_.isEmpty(req.files) || req.body.attachmentData && req.body.attachmentData !== '') {
      comment_text = req.body.comment ? req.body.comment : commentInfo.comment;
      let attachmentData = req.body.attachmentData ? JSON.parse(req.body.attachmentData) : [];
      if (req.body.type !== "remove") {
        if (req.files && req.files.avatar) {
          for (let i = 0; i < req.files.avatar.length; i++) {
            attachmentData.push(await commonUtils.uploadFile(req.files.avatar[i], pictureTypes.commentImg, configData));
          }
        }
      } else {
        const data = JSON.parse(req.body.attachmentData);
        await Promise.all(_.map(data.toRemove, async (removeData) => {
          await commonUtils.deleteFile(removeData);
        }));
        attachmentData = data.toSave;
      }
      if (attachmentData) {
        avatar = attachmentData.length ? attachmentData : [];
      }
      let updateArr = {
        image: avatar,
        comment: comment_text,
        last_updated_by: req.userInfo._id
      }
      await ApplicationComment.findByIdAndUpdate({ _id: req.params.id }, updateArr);
      const response = commonUtils.genSuccessResponse(resStatusCode.success, req.t('COMMENT_EDIT_SUCCESS'));
      return res.status(response.statusCode).json(response);
    } else {
      const response = await commonUtils.genErrorResponse(resStatusCode.error.notFound, req.t('ERROR'), 'Please add commnet or media');
      return res.status(response.statusCode).json(response);
    }
  } catch (err) {
    const response = commonUtils.genErrorResponse(resStatusCode.error.internalServerError, req.t('ERROR'), err);
    return res.status(response.statusCode).json(response);
  }
}
homeContoller.sharePost = async (req, res) => {
  try {
    let post_id = req.body.activity_id;
    let rich_link = req.body.urlData && !_.isEmpty(req.body.urlData) ? JSON.parse(req.body.urlData) : [];
    let comment_text = '';
    let userIds = [];
    let orgId = null;
    let avatar = [];
    if (req.body.comment && req.body.comment !== '' || !_.isEmpty(req.files)) {
      if (req.body.comment && req.body.comment != '') {
        commentText = req.body.comment.split('{{');
        commentText = commentText.filter(e => e.includes('}}'));
        commentText.forEach(e => {
          userIds.push(ObjectId(e.split('}}')[0]));
          splitText = e.split('}}')[1];
        });
      }
      comment_text = req.body.comment ? req.body.comment : '';

      const activityText = activityTemplate.addShareTemplate(req.userInfo.firstName + ' ' + req.userInfo.lastName, 'shared');
      const logActivityPromise = mainActivity.logMainActivity(req.userInfo._id, req.activityInfo.organization_id, req.activityInfo.workspace_id, null, null, null, activityText, 'activity', activity_type.sharedPost, "", "", '', avatar, undefined, comment_text, rich_link, post_id);
      logActivityPromise.then(function (result) {
        var shares = new ShareActivity();
        shares.activity_id = post_id;
        shares.user_id = req.userInfo._id;
        shares.save(function (err) {

          let notificationText = activityTemplate.addShareTemplateNotification(req.userInfo.firstName + ' ' + req.userInfo.lastName, 'added');
          const notificationPromise = Activity.logActivity(req.userInfo._id, req.activityInfo.organization_id, req.activityInfo.workspace_id, null, null, null, notificationText, 'notification', activity_type.sharedPost, '', '', '', "", result._id, "", "", post_id);
          notificationPromise.then((action) => {
            // Update notification count for user who created the post
            const socket = io(socketUrl);
            socket.on("connect", () => {
              socket.emit("getNotificationCount", [req.userInfo._id]);
              socket.disconnect();
            });
            if (userIds.length > 0) {
              let mentionedText = activityTemplate.addNotificationOnMentionedOnShare('mentioned');
              const notificationPromise = Activity.logActivity(req.userInfo._id, req.activityInfo.organization_id, req.activityInfo.workspace_id, null, null, null, mentionedText, 'notification', activity_type.mentionedSharedPost, '', '', userIds, "", result._id, "", "", post_id);
              notificationPromise.then((action) => {
                if (action) {
                  // Update notification count for user who created the post
                  const socket = io(socketUrl);
                  socket.on("connect", () => {
                    socket.emit("getNotificationCount", userIds);
                    socket.disconnect();
                  });
                  User.find({
                    _id: {
                      $in: userIds
                    }
                  }, {
                    email: 1,
                    firstName: 1,
                    lastName: 1,
                    isSetUpAccountData: 1,
                    fcmToken: 1
                  }, (err, users) => {
                    mentionedText = mentionedText.replace('[user-name]', req.userInfo.firstName + ' ' + req.userInfo.lastName);
                    let tokens = [];
                    let soundTokens = [];
                    for (let i = 0; i < users.length; i++) {
                      if (users[i] && users[i].isSetUpAccountData.tabEmailNotification &&
                        users[i].isSetUpAccountData.tabEmailNotification.recMessageNotification &&
                        users[i].isSetUpAccountData.tabEmailNotification.onScreenNotification) {
                        const emailPermissions = users[i].isSetUpAccountData.tabEmailNotification.recMessageNotification.map(per => per.children);
                        const notificationPermissions = users[i].isSetUpAccountData.tabEmailNotification.onScreenNotification.map(per => per.children);
                        if (emailPermissions.indexOf(1) > -1 || emailPermissions.indexOf('1') > -1) {
                          if (notificationPermissions.indexOf(1) > -1 || notificationPermissions.indexOf('1') > -1) {
                            if (notificationPermissions.indexOf(0) > -1 || notificationPermissions.indexOf('0') > -1) {

                              soundTokens.push(users[i].fcmToken);
                            } else {
                              tokens.push(users[i].fcmToken);
                            }
                          }
                        }
                      }
                    }
                    soundTokens = _.compact(soundTokens);
                    if (soundTokens.length > 0) {
                      const notificationInfo = '[' + req.userInfo.firstName + ' ' + req.userInfo.lastName + ']  mentioned you on post';
                      const notificationData = {
                        title: 'Notification',
                        body: notificationInfo,
                        params: {},
                      };
                      sendNotification(soundTokens, notificationData);
                    }
                    tokens = _.compact(tokens);
                    if (tokens.length > 0) {
                      const notificationInfo = '[' + req.userInfo.firstName + ' ' + req.userInfo.lastName + '] updated ' + applicationName
                      const notificationData = {
                        title: 'Notification',
                        body: notificationInfo,
                        params: {},
                      };
                      sendNotification(tokens, notificationData);
                    }

                  });
                }
              });
              req.params.id = result._id;
              req.params.post_id = post_id;
              shareHelper(req, res)
              // const response = commonUtils.genSuccessResponse(resStatusCode.created, req.t('POST_ADD_SUCCESS'), result);
              // return res.status(response.statusCode).json(response);
            } else {
              req.params.id = result._id;
              req.params.post_id = post_id;
              shareHelper(req, res);
            }

          })
        })
      });
    } else {
      const response = commonUtils.genErrorResponse(resStatusCode.error.notFound, req.t('ERROR'), 'Please add commnet or media');
      return res.status(response.statusCode).json(response);
    }
  } catch (err) {
    const response = await commonUtils.genErrorResponse(resStatusCode.error.internalServerError, req.t('ERROR'), err);
    return res.status(response.statusCode).json(response);
  }
}
homeContoller.getSearchPost = async (req, res) => {
  try {
    searchPostHelper(req, res);
  } catch (err) {
    const response = commonUtils.genErrorResponse(resStatusCode.error.internalServerError, req.t('ERROR'), err);
    return res.status(response.statusCode).json(response);
  }
}
homeContoller.sendDailyDigest = async (req, res) => {
  try {
    digestHelper();
  } catch (err) {
    const response = commonUtils.genErrorResponse(resStatusCode.error.internalServerError, req.t('ERROR'), err);
    return res.status(response.statusCode).json(response);
  }
}
module.exports = homeContoller
