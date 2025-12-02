var express = require('express');
var router = express.Router();

/* GET combo-nav-slim page. */
router.get('/combo-nav-slim', function(req, res, next) {
  res.render('demo/combo-nav-slim', { title: 'Express' });
});

/* GET combo-nav page. */
router.get('/combo-nav', function(req, res, next) {
  res.render('demo/combo-nav', { title: 'Express' });
});

/* GET dark-mode page. */
router.get('/dark-mode', function(req, res, next) {
  res.render('demo/dark-mode', { title: 'Express' });
});

/* GET darknav page. */
router.get('/darknav', function(req, res, next) {
  res.render('demo/darknav', { title: 'Express' });
});

/* GET dual-nav page. */
router.get('/dual-nav', function(req, res, next) {
  res.render('demo/dual-nav', { title: 'Express' });
});

/* GET horizontal-slim page. */
router.get('/horizontal-slim', function(req, res, next) {
  res.render('demo/horizontal-slim', { title: 'Express' });
});

/* GET navbar-top-slim page. */
router.get('/navbar-top-slim', function(req, res, next) {
  res.render('demo/navbar-top-slim', { title: 'Express' });
});

/* GET navbar-top page. */
router.get('/navbar-top', function(req, res, next) {
  res.render('demo/navbar-top', { title: 'Express' });
});

/* GET sidenav-collapse page. */
router.get('/sidenav-collapse', function(req, res, next) {
  res.render('demo/sidenav-collapse', { title: 'Express' });
});

/* GET topnav-slim page. */
router.get('/topnav-slim', function(req, res, next) {
  res.render('demo/topnav-slim', { title: 'Express' });
});

/* GET vertical-sidenav page. */
router.get('/vertical-sidenav', function(req, res, next) {
  res.render('demo/vertical-sidenav', { title: 'Express' });
});

module.exports = router;
