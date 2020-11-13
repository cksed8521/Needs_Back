const HttpException = require('./HttpException')
module.exports =  class AuthorizationException extends HttpException {
    code = 500;
    message = 'Server error';
}