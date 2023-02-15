const workspaceValidation = {}
workspaceValidation.validateaddWorkspace = (req, res, next) => {
  req.validations = {
    name: {
      rules: [{
        type: 'notEmpty',
        msg: 'REQ_WS_NAME'
      }]
    }
  }
  next()
}
workspaceValidation.validateEditWorkspace = (req, res, next) => {
  req.validations = {
    organization_id: {
      rules: [{
        type: 'notEmpty',
        msg: 'REQ_ORG_ID'
      }]
    },
    workspace_id: {
      rules: [{
        type: 'notEmpty',
        msg: 'REQ_WS_ID'
      }]
    },
    name: {
      rules: [{
        type: 'notEmpty',
        msg: 'REQ_WS_NAME'
      }]
    }
  }
  next()
}
workspaceValidation.validateWorkspaceByOrganizationId = (req, res, next) => {
  req.validations = {
    organization_id: {
      rules: [{
        type: 'notEmpty',
        msg: 'REQ_ORG_ID'
      }]
    }
  }
  next()
}
workspaceValidation.valiDateAssignUser = (req, res, next) => {
  req.validations = {
    organization_id: {
      rules: [{
        type: 'notEmpty',
        msg: 'REQ_ORG_ID'
      }]
    },
    workspace_id: {
      rules: [{
        type: 'notEmpty',
        msg: 'REQ_WS_ID'
      }]
    }
  }
  next()
}
workspaceValidation.validateRole = (req, res, next) => {
  req.validations = {
    workspace_id: {
      rules: [{
        type: 'notEmpty',
        msg: 'REQ_WS_ID'
      }]
    },
    user_id: {
      rules: [{
        type: 'notEmpty',
        msg: 'REQ_ID'
      }]
    },
    role: {
      rules: [{
        type: 'notEmpty',
        msg: 'REQ_ROLE'
      }]
    }
  }
  next()
}
workspaceValidation.validateRemoveWs = (req, res, next) => {
  req.validations = {
    workspace_id: {
      rules: [{
        type: 'notEmpty',
        msg: 'REQ_WS_ID'
      }]
    }
  }
  next()
}
module.exports = workspaceValidation
