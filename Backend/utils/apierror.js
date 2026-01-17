class ApiError extends Error {
    constructor(statuscode,message,errors=[]){
        super(message);
        this.statuscode=statuscode;
        this.errors=errors;
        this.isOperational=true;
        Error.captureStackTrace(this, this.constructor);
    }
}
