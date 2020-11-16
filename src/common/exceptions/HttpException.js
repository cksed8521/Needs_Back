module.exports = class HttpException {
    constructor(message = undefined, code = undefined) {
        if (new.target === HttpException) {
            throw new TypeError("Cannot construct HttpException instances directly");
        }
        if (message) {
            this.message = message;
        }
        if (code) {
            this.code = code;
        }
    }

    GetCode() {
        return this.code;
    }

    GetMessage() {
        return this.message;
    }

    GetResponse() {
        return {
            error: {
                message: this.GetMessage()
            }
        };
    }
};