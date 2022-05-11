const Ajv = require('ajv')
const addFormats = require("ajv-formats")

const ajv = new Ajv({
  allErrors: true,
  coerceTypes: true
})
addFormats(ajv)
module.exports = function (schema, whichValidate = 'body') {
  const ajvValidator = ajv.compile(schema)
  if (!['body', 'query', 'both'].includes(whichValidate)) throw new Error('Invalid typeOf validation')
  return async (req, res, next) => {
    try {
      let obj
      switch (whichValidate) {
        case 'body':
          obj = req.body
          break
        case 'query':
          obj = req.query
          break
        case 'both':
          obj = Object.assign({}, req.body, req.query)
          break
        default:
          console.warn('Invalid Obj to validate in path: ', req.url)
          obj = {}
          break
      }
      if (!ajvValidator(obj)) {
        res.status(400).send( {
          error: ajvValidator.errors
        });
        return
      } else {
        return next()
      }
    } catch (error) {
      console.error('Validator middleware error: ', error)
    }
  }
}
