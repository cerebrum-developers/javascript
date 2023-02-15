'use strict';
const async = require('async');

const mongoose = require('mongoose');
const commonUtils = require('../../../../helper/commonUtils');
const { resStatusCode, activity_type } = require('../../../../helper/constant');
const ObjectID = require('mongodb').ObjectID;
const User = mongoose.model('User');
const _ = require('lodash');
const organizationUtils = require("../../organization/organizationUtils");
const userUtils = require("../../user/userUtils");
const marketUtils = require("../../market-workspace/market-workspaceUtils")
const workspaceUtils = require("../../workspace/workspaceUtils");
let digestTemplate = require("../../../../templates/digest.html")
const getCommentOnActivity = async () => {
  User.find({ _id: { $ne: null } }, {
    email: 1, firstName: 1, lastName: 1, avatar: 1,
    isSetUpAccountData: 1
  }).exec(async (err, users) => {

    _.map(users, async (user, key) => {
      if (user.isSetUpAccountData && user.isSetUpAccountData.tabEmailNotification.dailyDigest && !_.isEmpty(user.isSetUpAccountData.tabEmailNotification.dailyDigest)) {
        let matchCondition = {};
        let organizations_ids = [];
        let workspace_ids = [];
        let mainUser = _.clone(user);
        let subUser = _.clone(user)
        //  if (key == 0) {
        let user_ids = [user._id]
        let follow = await marketUtils.findAllFollow({ user_id: user._id, followType: "organization" }, { organization_id: 1 })
        for (let i = 0; i < follow.length; i++) {
          organizations_ids.push(ObjectID(follow[i].organization_id));
        }
        // let userlist = await marketUtils.findAllFollow({ user_id: user._id, followType: "people" }, { following: 1 });
        // for (let i = 0; i < userlist.length; i++) {
        //   user_ids.push(ObjectID(userlist[i].following));
        // }
        let org = await organizationUtils.findOrganizationRoles({ user_id: { $in: user_ids } }, { organization_id: 1 })
        for (let i = 0; i < org.length; i++) {
          organizations_ids.push(ObjectID(org[i].organization_id));
        }
        organizations_ids = _.uniqWith(organizations_ids, _.isEqual);
        let roles = await workspaceUtils.findWorkspaceRoles({ user_id: user._id }, { workspace_id: 1 })
        for (let i = 0; i < roles.length; i++) {
          workspace_ids.push(ObjectID(roles[i].workspace_id));
        }
        user_ids = _.compact(user_ids);
        let subMatch = commonUtils.getSubQuery(organizations_ids, workspace_ids, user_ids, matchCondition);
        let mainMatch = commonUtils.getMainQuery(organizations_ids, workspace_ids, user_ids, matchCondition);

        //  console.log('Home page query start ' + new Date().getTime())

        let getSubActivitiesData = (next) => {
          return commonUtils.getSubActivities(subUser, subMatch, (err, subRes) => {
            next(null, subRes)
          });
        }
        let getMainActivitiesData = async (callback) => {
          return commonUtils.getMainActivities(mainUser, mainMatch, (err, mainRes) => {
            callback(null, mainRes)
          });
        }
        let mapData = async (error, result) => {
          // console.log('err',error)

          // if (error) {
          //   const response = await commonUtils.genErrorResponse(resStatusCode.error.notFound, request.t('ERROR'));
          //   return res.status(response.statusCode).json(response);
          // }
          const mergedActivities = _.concat(result.sub, result.main);
          if (mergedActivities && mergedActivities.length > 0) {


            let sortedActivities = mergedActivities.sort((a, b) => {
              return new Date(a.createdAt) - new Date(b.createdAt);
            });
            sortedActivities = _.compact(sortedActivities);
            let resultArr = _(sortedActivities)
              .groupBy(x => x.main_activity_id)
              .map((value, key) => ({ type: key, list: value, text: [] }))
              .value();

            let finalArr = [];
            await Promise.all(resultArr.map(async (activity, key) => {
              let list = activity.list;
              resultArr[key].text = [];
              resultArr[key].wsName = "";

              await Promise.all(_.map(list, async (notifications, index) => {
                let userName = '';
                let applicationName = '';
                let workspaceName = '';
                let organizationName = '';
                let taskName = '';
                let name = notifications.workspaceName && !_.isEmpty(notifications.workspaceName) ? notifications.workspaceName : (notifications.organizationName && !_.isEmpty(notifications.organizationName) ? notifications.organizationName : "Post")
                if (index == 0) {
                  resultArr[key].wsName = name;
                  resultArr[key].user = notifications.user;
                }
                if (notifications.activity_sub_type === activity_type.updatedRecord) {
                  userName = notifications.user.name ? notifications.user.name : null;
                  applicationName = notifications.applicationName ? notifications.applicationName : null;
                  notifications.activity_text = notifications.activity_text.replace('[user-name]', '<strong>' + userName + '</strong>');
                  notifications.activity_text = notifications.activity_text.replace('[substance-name]', '<strong>' + applicationName + '</strong>');
                  resultArr[key].text.push('<p style="color: #525252; font-size:12px; text-align:left; text-transform: inherit;font-weight: 400;font-family: Arial, Helvetica, sans-serif;margin: 0; line-height: 18px;">' + notifications.activity_text + '</p>');
                } else if (notifications.activity_sub_type === activity_type.commentedOnApp || notifications.activity_sub_type === activity_type.commentedOnActivity) {
                  let userIds = [];
                  let stringUsers = {};
                  let stringUpdateUsers = {};
                  let regex = /\{\{[^\}]*\}\}/g;
                  if (notifications.comment && notifications.comment !== '') {

                    let getUserPromise = notifications.comment.match(regex);
                    if (getUserPromise && getUserPromise.length) {
                      let refinedUserId = getUserPromise.map(user => {
                        return user.replace('{{', '').replace('}}', '');
                      });
                      if (refinedUserId && refinedUserId.length) {
                        userIds = _.concat(userIds, refinedUserId);
                      }
                    }
                    if (userIds.length > 0) {
                      let usersData = await userUtils.findUsers({
                        _id: {
                          $in: userIds
                        }
                      }, { firstName: 1, lastName: 1, avatar: 1 });

                      usersData.forEach((user) => {

                        let name = user.firstName + ' ' + user.lastName;
                        stringUpdateUsers['{{' + user.id + '}}'] = '@' + name;

                        let imgUrl = '';
                        if (user.avatar && user.avatar !== '') {
                          imgUrl = process.env.MEDIA_URL + '/' + user.avatar;
                        } else {
                          imgUrl = process.env.USER_URL;
                        }
                        stringUsers['{{' + user.id + '}}'] = '<div contenteditable="false" class="client-name"><img src="' + imgUrl + '" style="border: 1px solid #d6d6d6;width: 16px; height: 16px; border-radius: 100%; object-fit: cover; object-position: center;margin-right: 6px;"> ' + name + '</div>&nbsp;'
                      });
                      let regex = /\{\{[^\}]*\}\}/g;
                      let getUserPromise = notifications.comment.match(regex);

                      if (getUserPromise && getUserPromise.length) {
                        getUserPromise.map(user => {
                          return notifications.comment = notifications.comment.replace(user, stringUsers[user]);
                        });
                      }
                    }
                    notifications.comment = notifications.comment;
                  }
                  userName = notifications.user.name ? notifications.user.name : null;
                  notifications.activity_text = notifications.activity_text.replace('[user-name]', '<strong>' + userName + '</strong>');
                  resultArr[key].text.push('<p style="color: #525252; font-size:12px; text-align:left; text-transform: inherit;font-weight: 400;font-family: Arial, Helvetica, sans-serif;margin: 0; line-height: 18px;">' + userName + ' added a comment : ' + notifications.comment + '</p>');

                } else if (notifications.activity_sub_type === activity_type.invitedUser) {
                  userName = notifications.user.name ? notifications.user.name : null;
                  workspaceName = notifications.workspaceName ? notifications.workspaceName : '';
                  organizationName = notifications.organizationName ? notifications.organizationName : '';
                  let invitedUserName = notifications.invited_user.name ? notifications.invited_user.name : null;
                  notifications.activity_text = notifications.activity_text.replace('[user-name]', '<strong>' + userName + '</strong>');
                  notifications.activity_text = notifications.activity_text.replace('[invitation-name]', '<strong>' + invitedUserName + '</strong>');
                  notifications.activity_text = notifications.activity_text.replace('[substance-name]', !_.isEmpty(workspaceName) ? '<strong>' + workspaceName + '</strong>' : '<strong>' + organizationName + '</strong>');
                  resultArr[key].text.push('<p style="color: #525252; font-size:12px; text-align:left; text-transform: inherit;font-weight: 400;font-family: Arial, Helvetica, sans-serif;margin: 0; line-height: 18px;">' + notifications.activity_text + '</p>');
                } else if (notifications.activity_sub_type === activity_type.updatedApp) {
                  userName = notifications.user.name ? notifications.user.name : null;
                  applicationName = notifications.applicationName ? notifications.applicationName : null;
                  notifications.activity_text = notifications.activity_text.replace('[user-name]', '<strong>' + userName + '</strong>');
                  notifications.activity_text = notifications.activity_text.replace('[substance-name]', '<strong>' + applicationName + '</strong>');
                  resultArr[key].text.push('<p style="color: #525252; font-size:12px; text-align:left; text-transform: inherit;font-weight: 400;font-family: Arial, Helvetica, sans-serif;margin: 0; line-height: 18px;">' + notifications.activity_text + '</p>');
                } else if (notifications.activity_sub_type === activity_type.createdApp) {
                  userName = notifications.user.name ? notifications.user.name : null;
                  applicationName = notifications.applicationName ? notifications.applicationName : null;
                  notifications.activity_text = notifications.activity_text.replace('[user-name]', '<strong>' + userName + '</strong>');
                  notifications.activity_text = notifications.activity_text.replace('[substance-name]', '<strong>' + applicationName + '</strong>');
                  resultArr[key].text.push('<p style="color: #525252; font-size:12px; text-align:left; text-transform: inherit;font-weight: 400;font-family: Arial, Helvetica, sans-serif;margin: 0; line-height: 18px;">' + notifications.activity_text + '</p>');
                } if (notifications.activity_sub_type === activity_type.createdRecord) {
                  userName = notifications.user.name ? notifications.user.name : null;
                  applicationName = notifications.applicationName ? notifications.applicationName : null;
                  notifications.activity_text = notifications.activity_text.replace('[user-name]', '<strong>' + userName + '</strong>');
                  notifications.activity_text = notifications.activity_text.replace('[substance-name]', '<strong>' + applicationName + '</strong>');
                  resultArr[key].text.push('<p style="color: #525252; font-size:12px; text-align:left; text-transform: inherit;font-weight: 400;font-family: Arial, Helvetica, sans-serif;margin: 0; line-height: 18px;">' + notifications.activity_text + '</p>');
                }
                else if (notifications.activity_sub_type === activity_type.createdTask) {
                  userName = notifications.user.name ? notifications.user.name : null;
                  taskName = notifications.task.title ? notifications.task.title : null;
                  notifications.activity_text = notifications.activity_text.replace('[user-name]', '<strong>' + userName + '</strong>');
                  notifications.activity_text = notifications.activity_text.replace('[task-name]', '<strong>' + workspaceName + ' - ' + taskName + '</strong>');
                  resultArr[key].text.push('<p style="color: #525252; font-size:12px; text-align:left; text-transform: inherit;font-weight: 400;font-family: Arial, Helvetica, sans-serif;margin: 0; line-height: 18px;">' + notifications.activity_text + '</p>');
                }
                else if (notifications.activity_sub_type === activity_type.updatedTask) {
                  userName = notifications.user.name ? notifications.user.name : null;
                  taskName = notifications.task.title ? notifications.task.title : null;
                  notifications.activity_text = notifications.activity_text.replace('[user-name]', '<strong>' + userName + '</strong>');
                  notifications.activity_text = notifications.activity_text.replace('[task-name]', '<strong>' + workspaceName + ' - ' + taskName + '</strong>');
                  resultArr[key].text.push('<p style="color: #525252; font-size:12px; text-align:left; text-transform: inherit;font-weight: 400;font-family: Arial, Helvetica, sans-serif;margin: 0; line-height: 18px;">' + notifications.activity_text + '</p>');
                } else if (notifications.activity_sub_type === activity_type.commentedOnTask) {
                  let userIds = [];
                  let stringUsers = {};
                  let stringUpdateUsers = {};
                  let regex = /\{\{[^\}]*\}\}/g;
                  if (notifications.comment && notifications.comment !== '') {
                    let getUserPromise = notifications.comment.match(regex);
                    if (getUserPromise && getUserPromise.length) {
                      let refinedUserId = getUserPromise.map(user => {
                        return user.replace('{{', '').replace('}}', '');
                      });
                      if (refinedUserId && refinedUserId.length) {
                        userIds = _.concat(userIds, refinedUserId);
                      }
                    }
                    if (userIds.length > 0) {
                      let usersData = await userUtils.findUsers({
                        _id: {
                          $in: userIds
                        }
                      }, { firstName: 1, lastName: 1, avatar: 1 });
                      usersData.forEach((user) => {
                        let name = user.firstName + ' ' + user.lastName;
                        stringUpdateUsers['{{' + user.id + '}}'] = '@' + name;

                        let imgUrl = '';
                        if (user.avatar && user.avatar !== '') {
                          imgUrl = process.env.MEDIA_URL + '/' + user.avatar;
                        } else {
                          imgUrl = process.env.USER_URL;
                        }
                        stringUsers['{{' + user.id + '}}'] = '<div contenteditable="false" class="client-name"><img src="' + imgUrl + '" style="width: 30px;height: auto;object-fit: contain;">' + name + '</div>&nbsp;'
                      });
                      let regex = /\{\{[^\}]*\}\}/g;
                      let getUserPromise = notifications.comment.match(regex);

                      if (getUserPromise && getUserPromise.length) {
                        getUserPromise.map(user => {
                          return notifications.comment = notifications.comment.replace(user, stringUsers[user]);
                        });
                      }
                    }
                    notifications.comment = notifications.comment;

                  }
                  userName = notifications.user.name ? notifications.user.name : null;
                  taskName = notifications.task.title ? notifications.task.title : null;
                  notifications.activity_text = notifications.activity_text.replace('[user-name]', '<strong>' + userName + '</strong>');
                  notifications.activity_text = notifications.activity_text.replace('[task-name]', '<strong>' + workspaceName + ' - ' + taskName + '</strong>');
                  resultArr[key].text.push('<p style="color: #525252; font-size:12px; text-align:left; text-transform: inherit;font-weight: 400;font-family: Arial, Helvetica, sans-serif;margin: 0; line-height: 18px;">' + userName + ' added a comment : ' + notifications.comment + '</p>');
                } else if (notifications.activity_sub_type === activity_type.createdPost) {
                  userName = notifications.user.name ? notifications.user.name : null;
                  notifications.activity_text = notifications.activity_text.replace('[user-name]', '<strong>' + userName + '</strong>');
                  resultArr[key].text.push('<p style="color: #525252; font-size:12px; text-align:left; text-transform: inherit;font-weight: 400;font-family: Arial, Helvetica, sans-serif;margin: 0; line-height: 18px;">' + notifications.activity_text + '</p>');
                } else if (notifications.activity_sub_type === activity_type.createdOrganization) {
                  userName = notifications.user.name ? notifications.user.name : null;
                  organizationName = notifications.organizationName ? notifications.organizationName : null;
                  notifications.activity_text = notifications.activity_text.replace('[user-name]', '<strong>' + userName + '</strong>');
                  notifications.activity_text = notifications.activity_text.replace('[substance-name]', '<strong>' + organizationName + '</strong>');
                  resultArr[key].text.push('<p style="color: #525252; font-size:12px; text-align:left; text-transform: inherit;font-weight: 400;font-family: Arial, Helvetica, sans-serif;margin: 0; line-height: 18px;">' + notifications.activity_text + '</p>');
                } else if (notifications.activity_sub_type === activity_type.createdWorkspace || notifications.activity_sub_type === activity_type.updatedWorkspace) {
                  userName = notifications.user.name ? notifications.user.name : null;
                  workspaceName = notifications.workspaceName ? notifications.workspaceName : '';
                  notifications.activity_text = notifications.activity_text.replace('[user-name]', '<strong>' + userName + '</strong>');
                  notifications.activity_text = notifications.activity_text.replace('[substance-name]', '<strong>' + workspaceName + '</strong>');
                  resultArr[key].text.push('<p style="color: #525252; font-size:12px; text-align:left; text-transform: inherit;font-weight: 400;font-family: Arial, Helvetica, sans-serif;margin: 0; line-height: 18px;">' + notifications.activity_text + '</p>');
                }
                delete resultArr[key].list;
                delete resultArr[key].type;
              }))
            }))

            let finalRes = _(resultArr)
              .groupBy(x => x.wsName)
              .map((value, key) => ({ type: key, list: value }))
              .value();
            finalRes.map(async (activity, key) => {
              let list = activity.list;
              finalRes[key].str = [];
              //resultArr[key].wsName = "";

              await Promise.all(_.map(list, async (notifications, index) => {

                if (index == 0) {

                  finalRes[key].user = notifications.user;
                }
                finalRes[key].str.push(notifications.text.join(" "))
                delete finalRes[key].list;
              }))
              finalRes[key].str = _.compact(finalRes[key].str).join(" ")
            })
            let mainCOntent = _.map(finalRes, (item) => {
              let avatar = item.user.avatar ? process.env.MEDIA_URL + '/' + item.user.avatar : process.env.LOGO_URL;
              let string = "";
              if (item.str && item.str.length) {
                string = _.map(item.str, (result) => {
                  return result;
                }).join(" ")
              }

              return (
                '<tr>' +
                '<td style="text-align: left; padding-bottom: 15px; padding-top: 24px;">' +
                '<label style="color: #525252; font-size:16px; text-align:left; text-transform: inherit;font-weight: 400;font-family: Arial, Helvetica, sans-serif;margin: 0; line-height: 24px;">' +
                item.type +
                '</label>' +
                '<div style="display: flex;align-items: center;">' +
                '<img src="' + avatar + '" style="border: 1px solid #D6D6D6; width: 16px; height: 16px; border-radius: 100%; object-fit: cover; object-position: center;  margin-right: 6px;">' +
                '<div style="display: inline-block;">' +
                string.toString() +
                '</div>' +
                '</div>' +
                '</td>' +
                '</tr>'
              )
            }).join(" ");
            let avatar = user.avatar ? process.env.MEDIA_URL + '/' + user.avatar : process.env.LOGO_URL;
            let commentBody = digestTemplate.replace('{URL}', process.env.SITE_URL);
            commentBody = commentBody.replace('{NAME}', user.firstName + ' ' + user.lastName);
            commentBody = commentBody.replace('{AVATAR}', avatar);
            commentBody = commentBody.replace('{CONTENT}', mainCOntent);
            commonUtils.sendMail(user.email, commentBody, 'Voxxi Daily Digest');
          };
        }
        async.parallel({
          'sub': getSubActivitiesData,
          'main': getMainActivitiesData

        }, mapData);
        // }
      }
    })
  })


};
module.exports = getCommentOnActivity;