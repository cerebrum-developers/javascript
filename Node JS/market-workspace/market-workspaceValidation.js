const marketWorkspaceValidation = {}


marketWorkspaceValidation.validateAddWorkspace = (req, res, next) => {
  req.validations = {
    title: {
      rules: [{
        type: 'notEmpty',
        msg: 'REQ_TITLE'
      }]
    },
    description: {
      rules: [{
        type: 'notEmpty',
        msg: 'REQ_DESCRIPTION'
      }]
    },
    workspace_id: {
      rules: [{
        type: 'notEmpty',
        msg: 'REQ_WS_ID'
      }]
    },
    image: {
      rules: [{
        type: 'notEmpty',
        msg: 'REQ_BANNER'
      }]
    }
  }
  next()
}
marketWorkspaceValidation.validateGetWorkspace = (req, res, next) => {
  req.validations = {
 
    format: {
      rules: [{
        type: 'notEmpty',
        msg: 'REQ_FORMAT'
      }]
    },
    type: {
      rules: [{
        type: 'notEmpty',
        msg: 'REQ_TYPE'
      }]
    }
  }
  next()
}
marketWorkspaceValidation.validateWorkspace = (req, res, next) => {
  req.validations = {
    workspace_id: {
      rules: [{
        type: 'notEmpty',
        msg: 'REQ_WS_ID'
      }]
    },
    type: {
      rules: [{
        type: 'notEmpty',
        msg: 'REQ_TYPE'
      }]
    }
  }
  next()
}
module.exports = marketWorkspaceValidation
