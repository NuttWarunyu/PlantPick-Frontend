// Standardized Response Helpers

/**
 * Success response helper
 */
function success(res, data = null, message = 'Success', statusCode = 200) {
  return res.status(statusCode).json({
    success: true,
    data,
    message
  });
}

/**
 * Error response helper
 */
function error(res, message = 'Error', statusCode = 500, errors = null) {
  const response = {
    success: false,
    message,
    data: null
  };

  if (errors) {
    response.errors = errors;
  }

  return res.status(statusCode).json(response);
}

/**
 * Paginated response helper
 */
function paginated(res, data, pagination, message = 'Success') {
  return res.json({
    success: true,
    data,
    pagination,
    message
  });
}

module.exports = {
  success,
  error,
  paginated
};

