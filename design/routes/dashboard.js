var express = require('express');
var router = express.Router();

/* GET project-management page. */
router.get('/project-management', function(req, res, next) {
  res.render('dashboard/project-management', { title: 'Express' });
});

/* GET crm page. */
router.get('/crm', function(req, res, next) {
  res.render('dashboard/crm', { title: 'Express' });
});

module.exports = router;
