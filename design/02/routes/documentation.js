var express = require('express');
var router = express.Router();

/* GET /customization/configuration page. */
router.get('/customization/configuration', function(req, res, next) {
  res.render('documentation/customization/configuration', { title: 'Express' });
});

/* GET /customization/dark-mode page. */
router.get('/customization/dark-mode', function(req, res, next) {
  res.render('documentation/customization/dark-mode', { title: 'Express' });
});

/* GET /customization/plugin page. */
router.get('/customization/plugin', function(req, res, next) {
  res.render('documentation/customization/plugin', { title: 'Express' });
});

/* GET /customization/styling page. */
router.get('/customization/styling', function(req, res, next) {
  res.render('documentation/customization/styling', { title: 'Express' });
});

/* GET /layouts/combo-navbar page. */
router.get('/layouts/combo-navbar', function(req, res, next) {
  res.render('documentation/layouts/combo-navbar', { title: 'Express' });
});

/* GET /layouts/dual-nav page. */
router.get('/layouts/dual-nav', function(req, res, next) {
  res.render('documentation/layouts/dual-nav', { title: 'Express' });
});

/* GET /layouts/horizontal-navbar page. */
router.get('/layouts/horizontal-navbar', function(req, res, next) {
  res.render('documentation/layouts/horizontal-navbar', { title: 'Express' });
});

/* GET /layouts/vertical-navbar page. */
router.get('/layouts/vertical-navbar', function(req, res, next) {
  res.render('documentation/layouts/vertical-navbar', { title: 'Express' });
});

/* GET /design-file page. */
router.get('/design-file', function(req, res, next) {
  res.render('documentation/design-file', { title: 'Express' });
});

/* GET /getting-started page. */
router.get('/getting-started', function(req, res, next) {
  res.render('documentation/getting-started', { title: 'Express' });
});

/* GET /gulp page. */
router.get('/gulp', function(req, res, next) {
  res.render('documentation/gulp', { title: 'Express' });
});

module.exports = router;
