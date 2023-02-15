const { organizationType } = require('../../../helper/constant')

const organizationValidation = {}
organizationValidation.validateaddOrg = (req, res, next) => {
  req.validations = {
    name: {
      rules: [{
        type: 'notEmpty',
        msg: 'REQ_ORG_NAME'
      }]
    }
  }
  next()
}

organizationValidation.validateEditOrg = (req, res, next) => {
  req.validations = {
    organization_id: {
      rules: [{
        type: 'notEmpty',
        msg: 'REQ_ORG_ID'
      }]
    },
    name: {
      rules: [{
        type: 'notEmpty',
        msg: 'REQ_ORG_NAME'
      }]
    }
  }
  next()
}
organizationValidation.validateRole = (req, res, next) => {
  req.validations = {
    organization_id: {
      rules: [{
        type: 'notEmpty',
        msg: 'REQ_ORG_ID'
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
organizationValidation.validateOrganization = (req, res, next) => {

  req.validations = {
    type: {
      rules: [{
        type: 'notEmpty',
        msg: 'REQ_ORG_TYPE'
      },
      {
        type: 'isValidEnum',
        options: { aEnum: organizationType },
        msg: 'REQ_VALID_ORG_TYPE',
      }]
    },
    name: {
      rules: [{
        type: 'notEmpty',
        msg: 'REQ_ORG_NAME'
      }]
    },
    industryId: {
      rules: [{
        type: 'notEmpty',
        msg: 'REQ_INDUSTRY_ID'
      }]
    },
    categoryId: {
      rules: [{
        type: 'notEmpty',
        msg: 'REQ_CATEGORY_ID'
      }]
    },
    size: {
      rules: [{
        type: 'notEmpty',
        msg: 'REQ_ORG_SIZE'
      }]
    }
  }

  next()
}
organizationValidation.validateAssignUsers = (req, res, next) => {
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

module.exports = organizationValidation
