class ApiErrors extends Error{
    constructor(statusCode, message = 'some thing is wrong', error = [], stack = ''){
        super(message)
        this.statusCode = statusCode,
        this.message = message,
        this.data = null,
        this.success = false,
        this.error = error
    }
}

export {ApiErrors}