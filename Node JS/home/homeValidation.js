const userValidation = {}


userValidation.validateAddPost = (req, res, next) => {
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
userValidation.validateAddComment = (req, res, next) => {
  req.validations = {
    activity_id: {
      rules: [{
        type: 'notEmpty',
        msg: 'REQ_ACTIVITY_ID'
      }]
    }
  }
  next()
}
userValidation.validateCalender = (req, res, next) => {
  req.validations = {
    email: {
      rules: [{
        type: 'notEmpty',
        msg: 'REQ_EMAIL'
      }]
    }
  }
  next()
}
userValidation.validateAddCalender = (req, res, next) => {
  req.validations = {
    email: {
      rules: [{
        type: 'notEmpty',
        msg: 'REQ_EMAIL'
      }]
    }
  }
  next()
}
module.exports = userValidation
