function createError(err, status_code) {
    const error = new Error(err)
    error.statusCode = status_code
    throw error
}

module.exports = createError