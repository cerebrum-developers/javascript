const express = require('express')
const multipart = require('connect-multiparty')

const workspaceRouter = express.Router()
const multipartMiddleware = multipart()
const workspaceController = require('./workspaceController');
const workspaceMiddleware = require('./workspaceMiddleware');
const workspaceValidation = require('./workspaceValidation');
const middleware = require('../../../helper/middleware')

const addWorkspace = [
  workspaceValidation.validateaddWorkspace,
  middleware.reqValidator,
  middleware.isAuthenticatedUser,
  workspaceMiddleware.duplicateWsNameValidator,
  workspaceController.addWorkspace
];
workspaceRouter.post('/addWorkspace', addWorkspace);

const editWorkspace = [
  workspaceValidation.validateEditWorkspace,
  middleware.reqValidator,
  middleware.isAuthenticatedUser,
  workspaceMiddleware.duplicateOrgWsNameValidator,
  workspaceMiddleware.findWorkspaceByIdValidator,
  workspaceMiddleware.findMainActivityOfWorkspaceCreated,
  workspaceController.editWorkspace
];
workspaceRouter.post('/editWorkspace', editWorkspace);
const getWSMiddleware = [
  workspaceValidation.validateWorkspaceByOrganizationId,
  middleware.reqValidator,
  middleware.isAuthenticatedUser,
  workspaceController.getWorkspaces
]
workspaceRouter.post('/getWorkspaces', getWSMiddleware)

const getPaidWSMiddleware = [
  middleware.isAuthenticatedUser,
  workspaceController.getPaidWorkspaces
]
workspaceRouter.get('/getPaidWorkspaces', getPaidWSMiddleware)

const getPaidWorkspaceMiddleware = [
  middleware.isAuthenticatedUser,
  workspaceController.getPaidWorkspace
]
workspaceRouter.get('/getPaidWorkspace/:id', getPaidWorkspaceMiddleware)

const deletePaidWSMiddleware = [
  middleware.isAuthenticatedUser,
  workspaceController.deletePaidWorkspaces
]
workspaceRouter.get('/deletePaidWorkspaces/:id', deletePaidWSMiddleware)

const getUserWorkspacesMiddleware = [
  middleware.reqValidator,
  middleware.isAuthenticatedUser,
  workspaceController.getUserWorkspaces
]
workspaceRouter.get('/:id/user-workspaces', getUserWorkspacesMiddleware);

const getWorkspaceMembers = [
  middleware.reqValidator,
  middleware.isAuthenticatedUser,
  workspaceController.getWorkspaceMembers
]
workspaceRouter.get('/:id/user-management', getWorkspaceMembers);

const getWorkspaceOrganizationUsers = [
  middleware.reqValidator,
  middleware.isAuthenticatedUser,
  workspaceController.getWorkspaceOrganizationUsers
]
workspaceRouter.get('/:id/organization-users', getWorkspaceOrganizationUsers);
const orderChange = [
  workspaceValidation.validateWorkspaceByOrganizationId,
  middleware.reqValidator,
  middleware.isAuthenticatedUser,
  workspaceMiddleware.findWorkspaceById,
  workspaceController.changeOrder
];
workspaceRouter.post('/changeOrder', orderChange);
const getOrganizationWorkspaces = [
  middleware.reqValidator,
  middleware.isAuthenticatedUser,
  workspaceController.getOrganizationWorkspaces
]
workspaceRouter.get('/:id/workspaces', getOrganizationWorkspaces);
const getPredefineWorkSpace = [
  middleware.reqValidator,
  middleware.isAuthenticatedUser,
  workspaceController.getPredefineWorkSpace
]
workspaceRouter.get('/predefine-workspaces', getPredefineWorkSpace);
const assignusers = [
  workspaceValidation.valiDateAssignUser,
  middleware.reqValidator,
  middleware.isAuthenticatedUser,
  workspaceMiddleware.validateAssignUserWorkspace,
  workspaceMiddleware.findMainActivityOfWorkspaceCreated,
  workspaceController.assignUsers
]
workspaceRouter.post('/assign-users', assignusers);
const deleteWorkspace = [
  middleware.reqValidator,
  middleware.isAuthenticatedUser,
  workspaceController.deleteWorkspace
];
workspaceRouter.delete('/:id', deleteWorkspace);

const leaveWorkspace = [
  middleware.reqValidator,
  middleware.isAuthenticatedUser,
  workspaceController.leaveWorkspace
];
workspaceRouter.delete('/leave/:id', leaveWorkspace);

const getSharedWSMiddleware = [
  middleware.reqValidator,
  middleware.isAuthenticatedUser,
  workspaceController.getSharedWorkspaces
]
workspaceRouter.post('/getSharedWorkspaces', getSharedWSMiddleware);
const editWorkspaceRole = [
  multipartMiddleware,
  workspaceValidation.validateRole,
  middleware.reqValidator,
  middleware.isAuthenticatedUser,
  workspaceMiddleware.findWorkspaceRole,
  workspaceController.editWorkspaceRole
]
workspaceRouter.put('/editWorkspaceRole', editWorkspaceRole);
const removeUsers = [
  workspaceValidation.validateRemoveWs,
  middleware.reqValidator,
  middleware.isAuthenticatedUser,
  workspaceMiddleware.findWorkspaceByWorskpaceId,
  workspaceController.removeUsers
]
workspaceRouter.post('/remove-users', removeUsers)
module.exports = workspaceRouter
