exports.generate = function (error, message, status, data) {
    var myResponse = {
        error: error,
        message: message,
        status: status,
        data: data
    }
    return myResponse;
} //this is used to generate a response so that we don't have to write this script everytime we want to.