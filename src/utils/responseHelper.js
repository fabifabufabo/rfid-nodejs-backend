module.exports = {
    createResponse: (status, message, data = null) => {
        return {
            status,
            message,
            data
        };
    }
};