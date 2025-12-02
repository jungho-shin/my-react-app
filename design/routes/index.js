var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

/* GET /changelog page. */
router.get('/changelog', function(req, res, next) {
  res.render('changelog', { title: 'Express' });
});

/* GET /showcase page. */
router.get('/showcase', function(req, res, next) {
  res.render('showcase', { title: 'Express' });
});

module.exports = router;
