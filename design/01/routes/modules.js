var express = require('express');
var router = express.Router();

/* GET /components/carousel/bootstrap page. */
router.get('/components/carousel/bootstrap', function(req, res, next) {
  res.render('modules/components/carousel/bootstrap', { title: 'Express' });
});

/* GET /components/carousel/swiper page. */
router.get('/components/carousel/swiper', function(req, res, next) {
  res.render('modules/components/carousel/swiper', { title: 'Express' });
});

/* GET /components/navs-and-tabs/navbar page. */
router.get('/components/navs-and-tabs/navbar', function(req, res, next) {
  res.render('modules/components/navs-and-tabs/navbar', { title: 'Express' });
});

/* GET /components/navs-and-tabs/navs page. */
router.get('/components/navs-and-tabs/navs', function(req, res, next) {
  res.render('modules/components/navs-and-tabs/navs', { title: 'Express' });
});

/* GET /components/navs-and-tabs/tabs page. */
router.get('/components/navs-and-tabs/tabs', function(req, res, next) {
  res.render('modules/components/navs-and-tabs/tabs', { title: 'Express' });
});

/* GET /components/accordion page. */
router.get('/components/accordion', function(req, res, next) {
  res.render('modules/components/accordion', { title: 'Express' });
});

/* GET /components/alerts page. */
router.get('/components/alerts', function(req, res, next) {
  res.render('modules/components/alerts', { title: 'Express' });
});

/* GET /components/avatar page. */
router.get('/components/avatar', function(req, res, next) {
  res.render('modules/components/avatar', { title: 'Express' });
});

/* GET /components/badge page. */
router.get('/components/badge', function(req, res, next) {
  res.render('modules/components/badge', { title: 'Express' });
});

/* GET /components/breadcrumb page. */
router.get('/components/breadcrumb', function(req, res, next) {
  res.render('modules/components/breadcrumb', { title: 'Express' });
});

/* GET /components/button page. */
router.get('/components/button', function(req, res, next) {
  res.render('modules/components/button', { title: 'Express' });
});

/* GET /components/calendar page. */
router.get('/components/calendar', function(req, res, next) {
  res.render('modules/components/calendar', { title: 'Express' });
});

/* GET /components/card page. */
router.get('/components/card', function(req, res, next) {
  res.render('modules/components/card', { title: 'Express' });
});

/* GET /components/chat-widget page. */
router.get('/components/chat-widget', function(req, res, next) {
  res.render('modules/components/chat-widget', { title: 'Express' });
});

/* GET /components/collapse page. */
router.get('/components/collapse', function(req, res, next) {
  res.render('modules/components/collapse', { title: 'Express' });
});

/* GET /components/dropdown page. */
router.get('/components/dropdown', function(req, res, next) {
  res.render('modules/components/dropdown', { title: 'Express' });
});

/* GET /components/list-group page. */
router.get('/components/list-group', function(req, res, next) {
  res.render('modules/components/list-group', { title: 'Express' });
});

/* GET /components/modal page. */
router.get('/components/modal', function(req, res, next) {
  res.render('modules/components/modal', { title: 'Express' });
});

/* GET /components/offcanvas page. */
router.get('/components/offcanvas', function(req, res, next) {
  res.render('modules/components/offcanvas', { title: 'Express' });
});

/* GET /components/pagination page. */
router.get('/components/pagination', function(req, res, next) {
  res.render('modules/components/pagination', { title: 'Express' });
});

/* GET /components/placeholder page. */
router.get('/components/placeholder', function(req, res, next) {
  res.render('modules/components/placeholder', { title: 'Express' });
});

/* GET /components/popovers page. */
router.get('/components/popovers', function(req, res, next) {
  res.render('modules/components/popovers', { title: 'Express' });
});

/* GET /components/progress-bar page. */
router.get('/components/progress-bar', function(req, res, next) {
  res.render('modules/components/progress-bar', { title: 'Express' });
});

/* GET /components/scrollspy page. */
router.get('/components/scrollspy', function(req, res, next) {
  res.render('modules/components/scrollspy', { title: 'Express' });
});

/* GET /components/sortable page. */
router.get('/components/sortable', function(req, res, next) {
  res.render('modules/components/sortable', { title: 'Express' });
});

/* GET /components/spinners page. */
router.get('/components/spinners', function(req, res, next) {
  res.render('modules/components/spinners', { title: 'Express' });
});

/* GET /components/toast page. */
router.get('/components/toast', function(req, res, next) {
  res.render('modules/components/toast', { title: 'Express' });
});

/* GET /components/tooltips page. */
router.get('/components/tooltips', function(req, res, next) {
  res.render('modules/components/tooltips', { title: 'Express' });
});

/* GET /echarts/bar-charts page. */
router.get('/echarts/bar-charts', function(req, res, next) {
  res.render('modules/echarts/bar-charts', { title: 'Express' });
});

/* GET /echarts/candlestick-charts page. */
router.get('/echarts/candlestick-charts', function(req, res, next) {
  res.render('modules/echarts/candlestick-charts', { title: 'Express' });
});

/* GET /echarts/gauge-chart page. */
router.get('/echarts/gauge-chart', function(req, res, next) {
  res.render('modules/echarts/gauge-chart', { title: 'Express' });
});

/* GET /echarts/geo-map page. */
router.get('/echarts/geo-map', function(req, res, next) {
  res.render('modules/echarts/geo-map', { title: 'Express' });
});

/* GET /echarts/heatmap-charts page. */
router.get('/echarts/heatmap-charts', function(req, res, next) {
  res.render('modules/echarts/heatmap-charts', { title: 'Express' });
});

/* GET /echarts/how-to-use page. */
router.get('/echarts/how-to-use', function(req, res, next) {
  res.render('modules/echarts/how-to-use', { title: 'Express' });
});

/* GET /echarts/line-charts page. */
router.get('/echarts/line-charts', function(req, res, next) {
  res.render('modules/echarts/line-charts', { title: 'Express' });
});

/* GET /echarts/pie-charts page. */
router.get('/echarts/pie-charts', function(req, res, next) {
  res.render('modules/echarts/pie-charts', { title: 'Express' });
});

/* GET /echarts/radar-charts page. */
router.get('/echarts/radar-charts', function(req, res, next) {
  res.render('modules/echarts/radar-charts', { title: 'Express' });
});

/* GET /echarts/scatter-charts page. */
router.get('/echarts/scatter-charts', function(req, res, next) {
  res.render('modules/echarts/scatter-charts', { title: 'Express' });
});

/* GET /forms/advance/advance-select page. */
router.get('/forms/advance/advance-select', function(req, res, next) {
  res.render('modules/forms/advance/advance-select', { title: 'Express' });
});

/* GET /forms/advance/date-picker page. */
router.get('/forms/advance/date-picker', function(req, res, next) {
  res.render('modules/forms/advance/date-picker', { title: 'Express' });
});

/* GET /forms/advance/editor page. */
router.get('/forms/advance/editor', function(req, res, next) {
  res.render('modules/forms/advance/editor', { title: 'Express' });
});

/* GET /forms/advance/emoji-button page. */
router.get('/forms/advance/emoji-button', function(req, res, next) {
  res.render('modules/forms/advance/emoji-button', { title: 'Express' });
});

/* GET /forms/advance/file-uploader page. */
router.get('/forms/advance/file-uploader', function(req, res, next) {
  res.render('modules/forms/advance/file-uploader', { title: 'Express' });
});

/* GET /forms/advance/rating page. */
router.get('/forms/advance/rating', function(req, res, next) {
  res.render('modules/forms/advance/rating', { title: 'Express' });
});

/* GET /forms/basic/checks page. */
router.get('/forms/basic/checks', function(req, res, next) {
  res.render('modules/forms/basic/checks', { title: 'Express' });
});

/* GET /forms/basic/floating-labels page. */
router.get('/forms/basic/floating-labels', function(req, res, next) {
  res.render('modules/forms/basic/floating-labels', { title: 'Express' });
});

/* GET /forms/basic/form-control page. */
router.get('/forms/basic/form-control', function(req, res, next) {
  res.render('modules/forms/basic/form-control', { title: 'Express' });
});

/* GET /forms/basic/input-group page. */
router.get('/forms/basic/input-group', function(req, res, next) {
  res.render('modules/forms/basic/input-group', { title: 'Express' });
});

/* GET /forms/basic/layout page. */
router.get('/forms/basic/layout', function(req, res, next) {
  res.render('modules/forms/basic/layout', { title: 'Express' });
});

/* GET /forms/basic/range page. */
router.get('/forms/basic/range', function(req, res, next) {
  res.render('modules/forms/basic/range', { title: 'Express' });
});

/* GET /forms/basic/select page. */
router.get('/forms/basic/select', function(req, res, next) {
  res.render('modules/forms/basic/select', { title: 'Express' });
});

/* GET /forms/validation page. */
router.get('/forms/validation', function(req, res, next) {
  res.render('modules/forms/validation', { title: 'Express' });
});

/* GET /forms/wizard page. */
router.get('/forms/wizard', function(req, res, next) {
  res.render('modules/forms/wizard', { title: 'Express' });
});

/* GET /icons/feather page. */
router.get('/icons/feather', function(req, res, next) {
  res.render('modules/icons/feather', { title: 'Express' });
});

/* GET /icons/font-awesome page. */
router.get('/icons/font-awesome', function(req, res, next) {
  res.render('modules/icons/font-awesome', { title: 'Express' });
});

/* GET /icons/unicons page. */
router.get('/icons/unicons', function(req, res, next) {
  res.render('modules/icons/unicons', { title: 'Express' });
});

/* GET /tables/advance-tables page. */
router.get('/tables/advance-tables', function(req, res, next) {
  res.render('modules/tables/advance-tables', { title: 'Express' });
});

/* GET /tables/basic-tables page. */
router.get('/tables/basic-tables', function(req, res, next) {
  res.render('modules/tables/basic-tables', { title: 'Express' });
});

/* GET /tables/bulk-select page. */
router.get('/tables/bulk-select', function(req, res, next) {
  res.render('modules/tables/bulk-select', { title: 'Express' });
});

/* GET /utilities/background page. */
router.get('/utilities/background', function(req, res, next) {
  res.render('modules/utilities/background', { title: 'Express' });
});

/* GET /utilities/borders page. */
router.get('/utilities/borders', function(req, res, next) {
  res.render('modules/utilities/borders', { title: 'Express' });
});

/* GET /utilities/colors page. */
router.get('/utilities/colors', function(req, res, next) {
  res.render('modules/utilities/colors', { title: 'Express' });
});

/* GET /utilities/display page. */
router.get('/utilities/display', function(req, res, next) {
  res.render('modules/utilities/display', { title: 'Express' });
});

/* GET /utilities/flex page. */
router.get('/utilities/flex', function(req, res, next) {
  res.render('modules/utilities/flex', { title: 'Express' });
});

/* GET /utilities/float page. */
router.get('/utilities/float', function(req, res, next) {
  res.render('modules/utilities/float', { title: 'Express' });
});

/* GET /utilities/grid page. */
router.get('/utilities/grid', function(req, res, next) {
  res.render('modules/utilities/grid', { title: 'Express' });
});

/* GET /utilities/interactions page. */
router.get('/utilities/interactions', function(req, res, next) {
  res.render('modules/utilities/interactions', { title: 'Express' });
});

/* GET /utilities/opacity page. */
router.get('/utilities/opacity', function(req, res, next) {
  res.render('modules/utilities/opacity', { title: 'Express' });
});

/* GET /utilities/overflow page. */
router.get('/utilities/overflow', function(req, res, next) {
  res.render('modules/utilities/overflow', { title: 'Express' });
});

/* GET /utilities/position page. */
router.get('/utilities/position', function(req, res, next) {
  res.render('modules/utilities/position', { title: 'Express' });
});

/* GET /utilities/shadows page. */
router.get('/utilities/shadows', function(req, res, next) {
  res.render('modules/utilities/shadows', { title: 'Express' });
});

/* GET /utilities/sizing page. */
router.get('/utilities/sizing', function(req, res, next) {
  res.render('modules/utilities/sizing', { title: 'Express' });
});

/* GET /utilities/spacing page. */
router.get('/utilities/spacing', function(req, res, next) {
  res.render('modules/utilities/spacing', { title: 'Express' });
});

/* GET /utilities/stacks page. */
router.get('/utilities/stacks', function(req, res, next) {
  res.render('modules/utilities/stacks', { title: 'Express' });
});

/* GET /utilities/typography page. */
router.get('/utilities/typography', function(req, res, next) {
  res.render('modules/utilities/typography', { title: 'Express' });
});

/* GET /utilities/vertical-align page. */
router.get('/utilities/vertical-align', function(req, res, next) {
  res.render('modules/utilities/vertical-align', { title: 'Express' });
});

/* GET /utilities/visibility page. */
router.get('/utilities/visibility', function(req, res, next) {
  res.render('modules/utilities/visibility', { title: 'Express' });
});

module.exports = router;
