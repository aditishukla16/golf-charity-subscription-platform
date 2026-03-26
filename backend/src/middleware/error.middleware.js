export const notFoundHandler = (_req, res) => {
  res.status(404).json({ message: 'Endpoint not found.' });
};

export const errorHandler = (err, _req, res, _next) => {
  // eslint-disable-next-line no-console
  console.error(err);
  const status = err.status || 500;
  res.status(status).json({ message: err.message || 'Unexpected server error.' });
};
