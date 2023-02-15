const express = require('express')
const multipart = require('connect-multiparty')
const organizationRouter = express.Router()
const multipartMiddleware = multipart()
const organizationController = require('./organizationController');
const organizationMiddleware = require('./organizationMiddleware');
const organizationValidation = require('./organizationValidation');
const middleware = require('../../../helper/middleware')
const addOrgMiddleware = [
  multipartMiddleware,
  organizationValidation.validateaddOrg,
  middleware.reqValidator,
  middleware.isAuthenticatedUser,
  organizationMiddleware.duplicateNameValidator,
  organizationController.addOrganization
]
organizationRouter.post('/addOrganization', addOrgMiddleware)
const editOrgMiddleware = [
  multipartMiddleware,
  organizationValidation.validateEditOrg,
  middleware.reqValidator,
  middleware.isAuthenticatedUser,
  organizationMiddleware.findOrganizationById,
  organizationController.editOrganization
]
organizationRouter.post('/editOrganization', editOrgMiddleware)
const getOrgMiddleware = [
  middleware.reqValidator,
  middleware.isAuthenticatedUser,
  organizationController.getOrganizations
]
organizationRouter.get('/getOrganizations', getOrgMiddleware)
const onboardingMiddleware = [
  multipartMiddleware,
  organizationValidation.validateOrganization,
  middleware.reqValidator,
  middleware.isAuthenticatedUser,
  // organizationMiddleware.duplicateNameValidator,
  organizationController.onboarding
];
organizationRouter.post('/onboarding', onboardingMiddleware)

const inviteUsers = [
  organizationValidation.validateAssignUsers,
  middleware.reqValidator,
  middleware.isAuthenticatedUser,
  organizationMiddleware.findSeats,
  organizationMiddleware.findOrganizationById,
  organizationMiddleware.findMainActivityOfOrganisationCreated,
  organizationController.inviteUsers
]
organizationRouter.post('/invite-users', inviteUsers)

const getOrganizationMembers = [
  middleware.reqValidator,
  // middleware.isAuthenticatedUser,
  organizationController.getOrganizationMembers
]
organizationRouter.get('/:id/members', getOrganizationMembers);

const getAllMembersEmployeesOfOrgsAndWS = [
  middleware.reqValidator,
  middleware.isAuthenticatedUser,
  organizationController.getAllMembersEmployeesOfOrgsAndWS
]
organizationRouter.get('/getAllMembersEmployeesOfOrgsAndWS', getAllMembersEmployeesOfOrgsAndWS);

const getAllMembersEmployeesOfOrgAndWS = [
  middleware.reqValidator,
  middleware.isAuthenticatedUser,
  organizationController.getAllMembersEmployeesOfOrgAndWS
]
organizationRouter.get('/:id/getAllMembersEmployeesOfOrgAndWS', getAllMembersEmployeesOfOrgAndWS);

const getAllMembersOfWS = [
  middleware.reqValidator,
  middleware.isAuthenticatedUser,
  organizationController.getAllMembersOfWS
]
organizationRouter.get('/:id/getAllMembersOfWS', getAllMembersOfWS);

const getOrganizationEmployees = [
  middleware.reqValidator,
  middleware.isAuthenticatedUser,
  organizationMiddleware.findSeats,
  organizationController.getOrganizationEmployees
]
organizationRouter.get('/:id/employees', getOrganizationEmployees);
const editOrganizationRole = [
  multipartMiddleware,
  organizationValidation.validateRole,
  middleware.reqValidator,
  middleware.isAuthenticatedUser,
  organizationMiddleware.findOrganizationRole,
  organizationController.editOrganizationRole
]
organizationRouter.put('/editOrganizationRole', editOrganizationRole)
const userList = [
  middleware.reqValidator,
  middleware.isAuthenticatedUser,
  organizationController.getUserList,
];
organizationRouter.get('/:id/getUserList', userList);
const leaveOrganization = [
  middleware.reqValidator,
  middleware.isAuthenticatedUser,
  organizationController.leaveOrganization
];
organizationRouter.delete('/:id/leave-organization', leaveOrganization);
const removeUsers = [
  organizationValidation.validateAssignUsers,
  middleware.reqValidator,
  middleware.isAuthenticatedUser,
  organizationMiddleware.findOrganizationById,
  organizationController.removeUsers
]
organizationRouter.post('/remove-users', removeUsers)
const orderChange = [
  middleware.reqValidator,
  middleware.isAuthenticatedUser,
  organizationController.changeOrder
];
organizationRouter.post('/changeOrder', orderChange);

const getOrgProfileMiddleware = [
  middleware.reqValidator,
  // middleware.isAuthenticatedUser,
  organizationController.getOrgProfile
]
organizationRouter.get('/getOrgProfile/:marketWorkspaceId', getOrgProfileMiddleware)

const getAllOrganizationMiddleware = [
  middleware.reqValidator,
  middleware.isAuthenticatedUser,
  organizationController.getAllOrganization
]
organizationRouter.get('/getAllOrganization', getAllOrganizationMiddleware)

const getAllOrganizationWithWorkspaceMiddleware = [
  middleware.reqValidator,
  middleware.isAuthenticatedUser,
  organizationController.getAllOrganizationWithWorkspace
]
organizationRouter.get('/getAllOrganizationWithWorkspace', getAllOrganizationWithWorkspaceMiddleware)

const updateBannerMiddleware = [
  multipartMiddleware,
  middleware.reqValidator,
  middleware.isAuthenticatedUser,
  organizationMiddleware.findOrganizationById,
  organizationController.orgBannerIng
]
organizationRouter.post('/orgBannerIng', updateBannerMiddleware)
const getOrgDetailMiddleware = [
  middleware.reqValidator,
  middleware.isAuthenticatedUser,
  organizationController.getOrgDetail
]
organizationRouter.get('/:id/getOrgDetail', getOrgDetailMiddleware)
const getOrgSeatMiddleware = [
  middleware.reqValidator,
  middleware.isAuthenticatedUser,
  organizationController.getOrgSeat
]
organizationRouter.get('/:id/getOrgSeat', getOrgSeatMiddleware)

const getOrgFilesSizeMiddleware = [
  middleware.reqValidator,
  middleware.isAuthenticatedUser,
  organizationController.getOrgFilesSize
]
organizationRouter.get('/:id/size', getOrgFilesSizeMiddleware)

const getAllWorkspacesMiddleware = [
  middleware.reqValidator,
  middleware.isAuthenticatedUser,
  organizationController.getAllWorkspaces
]
organizationRouter.get('/getAllWorkspaces', getAllWorkspacesMiddleware)

const storePaidWorkspacesMiddleware = [
  middleware.reqValidator,
  middleware.isAuthenticatedUser,
  organizationController.storePaidWorkspaces
]
organizationRouter.post('/storePaidWorkspaces', storePaidWorkspacesMiddleware)


module.exports = organizationRouter
