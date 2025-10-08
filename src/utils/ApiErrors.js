class ApiErrors extends Error{
    constructor(statusCode, message = 'somethis is wrong', error = [], stack = ''){
        super(massege)
        this.statusCode = statusCode,
        this.message = message,
        this.data = null,
        this.success = false,
        this.error = error
    }
}

export {ApiErrors}