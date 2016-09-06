module.exports = (req, res, next) => {
  req.app.settings.nunjucksEnv
    .addGlobal('req', req)
    .addGlobal('res', res);

  next();
}
