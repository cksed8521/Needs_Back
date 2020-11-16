const HttpException = require('./HttpException')
module.exports =  class AuthorizationException extends HttpException {
    code = 401;
    message = 'Authorization failed';
}