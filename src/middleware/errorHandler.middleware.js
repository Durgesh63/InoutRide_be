const errorHandler = (err, req, res, next) => {
  // Log the full error details (including the stack trace) to the console or a log file
  console.error(err);

  // Prepare the response object, excluding the stack trace
  const response = {
    statusCode: err.statusCode || 500,
    message: err.message || "Internal Server Error",
    success: false,
    errors: err.errors || [],
  };

  // Send the response to the client
  res.status(response.statusCode).json(response);
};

module.exports = errorHandler;
