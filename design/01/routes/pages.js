var express = require('express');
var router = express.Router();

/* GET members page. */
router.get('/members', function(req, res, next) {
  res.render('pages/members', { title: 'Express' });
});

/* GET notifications page. */
router.get('/notifications', function(req, res, next) {
  res.render('pages/notifications', { title: 'Express' });
});

/* GET starter page. */
router.get('/starter', function(req, res, next) {
  res.render('pages/starter', { title: 'Express' });
});

/* GET timeline page. */
router.get('/timeline', function(req, res, next) {
  res.render('pages/timeline', { title: 'Express' });
});

/* GET /faq/faq-accordion page. */
router.get('/faq/faq-accordion', function(req, res, next) {
  res.render('pages/faq/faq-accordion', { title: 'Express' });
});

/* GET /faq/faq-tab page. */
router.get('/faq/faq-tab', function(req, res, next) {
  res.render('pages/faq/faq-tab', { title: 'Express' });
});

/* GET /landing/alternate page. */
router.get('/landing/alternate', function(req, res, next) {
  res.render('pages/landing/alternate', { title: 'Express' });
});

/* GET /landing/default page. */
router.get('/landing/default', function(req, res, next) {
  res.render('pages/landing/default', { title: 'Express' });
});

/* GET /pricing/pricing-column page. */
router.get('/pricing/pricing-column', function(req, res, next) {
  res.render('pages/pricing/pricing-column', { title: 'Express' });
});

/* GET /pricing/pricing-grid page. */
router.get('/pricing/pricing-grid', function(req, res, next) {
  res.render('pages/pricing/pricing-grid', { title: 'Express' });
});

/* GET /errors/403 page. */
router.get('/errors/403', function(req, res, next) {
  res.render('pages/errors/403', { title: 'Express' });
});

/* GET /errors/404 page. */
router.get('/errors/404', function(req, res, next) {
  res.render('pages/errors/404', { title: 'Express' });
});

/* GET /errors/500 page. */
router.get('/errors/500', function(req, res, next) {
  res.render('pages/errors/500', { title: 'Express' });
});

/* GET /authentication/card/2FA page. */
router.get('/authentication/card/2FA', function(req, res, next) {
  res.render('pages/authentication/card/2FA', { title: 'Express' });
});

/* GET /authentication/card/forgot-password page. */
router.get('/authentication/card/forgot-password', function(req, res, next) {
  res.render('pages/authentication/card/forgot-password', { title: 'Express' });
});

/* GET /authentication/card/lock-screen page. */
router.get('/authentication/card/lock-screen', function(req, res, next) {
  res.render('pages/authentication/card/lock-screen', { title: 'Express' });
});

/* GET /authentication/card/reset-password page. */
router.get('/authentication/card/reset-password', function(req, res, next) {
  res.render('pages/authentication/card/reset-password', { title: 'Express' });
});

/* GET /authentication/card/sign-in page. */
router.get('/authentication/card/sign-in', function(req, res, next) {
  res.render('pages/authentication/card/sign-in', { title: 'Express' });
});

/* GET /authentication/card/sign-out page. */
router.get('/authentication/card/sign-out', function(req, res, next) {
  res.render('pages/authentication/card/sign-out', { title: 'Express' });
});

/* GET /authentication/card/sign-up page. */
router.get('/authentication/card/sign-up', function(req, res, next) {
  res.render('pages/authentication/card/sign-up', { title: 'Express' });
});

/* GET /authentication/simple/2FA page. */
router.get('/authentication/simple/2FA', function(req, res, next) {
  res.render('pages/authentication/simple/2FA', { title: 'Express' });
});

/* GET /authentication/simple/forgot-password page. */
router.get('/authentication/simple/forgot-password', function(req, res, next) {
  res.render('pages/authentication/simple/forgot-password', { title: 'Express' });
});

/* GET /authentication/simple/lock-screen page. */
router.get('/authentication/simple/lock-screen', function(req, res, next) {
  res.render('pages/authentication/simple/lock-screen', { title: 'Express' });
});

/* GET /authentication/simple/reset-password page. */
router.get('/authentication/simple/reset-password', function(req, res, next) {
  res.render('pages/authentication/simple/reset-password', { title: 'Express' });
});

/* GET /authentication/simple/sign-in page. */
router.get('/authentication/simple/sign-in', function(req, res, next) {
  res.render('pages/authentication/simple/sign-in', { title: 'Express' });
});

/* GET /authentication/simple/sign-out page. */
router.get('/authentication/simple/sign-out', function(req, res, next) {
  res.render('pages/authentication/simple/sign-out', { title: 'Express' });
});

/* GET /authentication/simple/sign-up page. */
router.get('/authentication/simple/sign-up', function(req, res, next) {
  res.render('pages/authentication/simple/sign-up', { title: 'Express' });
});

/* GET /authentication/split/2FA page. */
router.get('/authentication/split/2FA', function(req, res, next) {
  res.render('pages/authentication/split/2FA', { title: 'Express' });
});

/* GET /authentication/split/forgot-password page. */
router.get('/authentication/split/forgot-password', function(req, res, next) {
  res.render('pages/authentication/split/forgot-password', { title: 'Express' });
});

/* GET /authentication/split/lock-screen page. */
router.get('/authentication/split/lock-screen', function(req, res, next) {
  res.render('pages/authentication/split/lock-screen', { title: 'Express' });
});

/* GET /authentication/split/reset-password page. */
router.get('/authentication/split/reset-password', function(req, res, next) {
  res.render('pages/authentication/split/reset-password', { title: 'Express' });
});

/* GET /authentication/split/sign-in page. */
router.get('/authentication/split/sign-in', function(req, res, next) {
  res.render('pages/authentication/split/sign-in', { title: 'Express' });
});

/* GET /authentication/split/sign-out page. */
router.get('/authentication/split/sign-out', function(req, res, next) {
  res.render('pages/authentication/split/sign-out', { title: 'Express' });
});

/* GET /authentication/split/sign-up page. */
router.get('/authentication/split/sign-up', function(req, res, next) {
  res.render('pages/authentication/split/sign-up', { title: 'Express' });
});

module.exports = router;
