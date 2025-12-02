var express = require('express');
var router = express.Router();

/* GET /social/feed page. */
router.get('/social/feed', function(req, res, next) {
  res.render('apps/social/feed', { title: 'Express' });
});

/* GET /social/profile page. */
router.get('/social/profile', function(req, res, next) {
  res.render('apps/social/profile', { title: 'Express' });
});

/* GET /social/settings page. */
router.get('/social/settings', function(req, res, next) {
  res.render('apps/social/settings', { title: 'Express' });
});

/* GET /e-commerce/admin/add-product page. */
router.get('/e-commerce/admin/add-product', function(req, res, next) {
  res.render('apps/e-commerce/admin/add-product', { title: 'Express' });
});

/* GET /e-commerce/admin/products page. */
router.get('/e-commerce/admin/products', function(req, res, next) {
  res.render('apps/e-commerce/admin/products', { title: 'Express' });
});

/* GET /e-commerce/admin/customers page. */
router.get('/e-commerce/admin/customers', function(req, res, next) {
  res.render('apps/e-commerce/admin/customers', { title: 'Express' });
});

/* GET /e-commerce/admin/customer-details page. */
router.get('/e-commerce/admin/customer-details', function(req, res, next) {
  res.render('apps/e-commerce/admin/customer-details', { title: 'Express' });
});

/* GET /e-commerce/admin/orders page. */
router.get('/e-commerce/admin/orders', function(req, res, next) {
  res.render('apps/e-commerce/admin/orders', { title: 'Express' });
});

/* GET /e-commerce/admin/order-details page. */
router.get('/e-commerce/admin/order-details', function(req, res, next) {
  res.render('apps/e-commerce/admin/order-details', { title: 'Express' });
});

/* GET /e-commerce/admin/refund page. */
router.get('/e-commerce/admin/refund', function(req, res, next) {
  res.render('apps/e-commerce/admin/refund', { title: 'Express' });
});

/* GET /e-commerce/landing/cart page. */
router.get('/e-commerce/landing/cart', function(req, res, next) {
  res.render('apps/e-commerce/landing/cart', { title: 'Express' });
});

/* GET /e-commerce/landing/checkout page. */
router.get('/e-commerce/landing/checkout', function(req, res, next) {
  res.render('apps/e-commerce/landing/checkout', { title: 'Express' });
});

/* GET /e-commerce/landing/favourite-stores page. */
router.get('/e-commerce/landing/favourite-stores', function(req, res, next) {
  res.render('apps/e-commerce/landing/favourite-stores', { title: 'Express' });
});

/* GET /e-commerce/landing/homepage page. */
router.get('/e-commerce/landing/homepage', function(req, res, next) {
  res.render('apps/e-commerce/landing/homepage', { title: 'Express' });
});

/* GET /e-commerce/landing/invoice page. */
router.get('/e-commerce/landing/invoice', function(req, res, next) {
  res.render('apps/e-commerce/landing/invoice', { title: 'Express' });
});

/* GET /e-commerce/landing/order-tracking page. */
router.get('/e-commerce/landing/order-tracking', function(req, res, next) {
  res.render('apps/e-commerce/landing/order-tracking', { title: 'Express' });
});

/* GET /e-commerce/landing/product-details page. */
router.get('/e-commerce/landing/product-details', function(req, res, next) {
  res.render('apps/e-commerce/landing/product-details', { title: 'Express' });
});

/* GET /e-commerce/landing/products-filter page. */
router.get('/e-commerce/landing/products-filter', function(req, res, next) {
  res.render('apps/e-commerce/landing/products-filter', { title: 'Express' });
});

/* GET /e-commerce/landing/profile page. */
router.get('/e-commerce/landing/profile', function(req, res, next) {
  res.render('apps/e-commerce/landing/profile', { title: 'Express' });
});

/* GET /e-commerce/landing/shipping-info page. */
router.get('/e-commerce/landing/shipping-info', function(req, res, next) {
  res.render('apps/e-commerce/landing/shipping-info', { title: 'Express' });
});

/* GET /e-commerce/landing/wishlist page. */
router.get('/e-commerce/landing/wishlist', function(req, res, next) {
  res.render('apps/e-commerce/landing/wishlist', { title: 'Express' });
});

/* GET /crm/add-contact page. */
router.get('/crm/add-contact', function(req, res, next) {
  res.render('apps/crm/add-contact', { title: 'Express' });
});

/* GET /crm/analytics page. */
router.get('/crm/analytics', function(req, res, next) {
  res.render('apps/crm/analytics', { title: 'Express' });
});

/* GET /crm/deal-details page. */
router.get('/crm/deal-details', function(req, res, next) {
  res.render('apps/crm/deal-details', { title: 'Express' });
});

/* GET /crm/deals page. */
router.get('/crm/deals', function(req, res, next) {
  res.render('apps/crm/deals', { title: 'Express' });
});

/* GET /crm/lead-details page. */
router.get('/crm/lead-details', function(req, res, next) {
  res.render('apps/crm/lead-details', { title: 'Express' });
});

/* GET /crm/leads page. */
router.get('/crm/leads', function(req, res, next) {
  res.render('apps/crm/leads', { title: 'Express' });
});

/* GET /crm/reports-details page. */
router.get('/crm/reports-details', function(req, res, next) {
  res.render('apps/crm/reports-details', { title: 'Express' });
});

/* GET /crm/reports page. */
router.get('/crm/reports', function(req, res, next) {
  res.render('apps/crm/reports', { title: 'Express' });
});

/* GET /project-management/create-new page. */
router.get('/project-management/create-new', function(req, res, next) {
  res.render('apps/project-management/create-new', { title: 'Express' });
});

/* GET /project-management/project-board-view page. */
router.get('/project-management/project-board-view', function(req, res, next) {
  res.render('apps/project-management/project-board-view', { title: 'Express' });
});

/* GET /project-management/project-card-view page. */
router.get('/project-management/project-card-view', function(req, res, next) {
  res.render('apps/project-management/project-card-view', { title: 'Express' });
});

/* GET /project-management/project-details page. */
router.get('/project-management/project-details', function(req, res, next) {
  res.render('apps/project-management/project-details', { title: 'Express' });
});

/* GET /project-management/project-list-view page. */
router.get('/project-management/project-list-view', function(req, res, next) {
  res.render('apps/project-management/project-list-view', { title: 'Express' });
});

/* GET /project-management/todo-list page. */
router.get('/project-management/todo-list', function(req, res, next) {
  res.render('apps/project-management/todo-list', { title: 'Express' });
});

/* GET /calendar page. */
router.get('/calendar', function(req, res, next) {
  res.render('apps/calendar', { title: 'Express' });
});

/* GET /chat page. */
router.get('/chat', function(req, res, next) {
  res.render('apps/chat', { title: 'Express' });
});

/* GET /email/compose page. */
router.get('/email/compose', function(req, res, next) {
  res.render('apps/email/compose', { title: 'Express' });
});

/* GET /email/email-detail page. */
router.get('/email/email-detail', function(req, res, next) {
  res.render('apps/email/email-detail', { title: 'Express' });
});

/* GET /email/inbox page. */
router.get('/email/inbox', function(req, res, next) {
  res.render('apps/email/inbox', { title: 'Express' });
});

/* GET /events/create-an-event page. */
router.get('/events/create-an-event', function(req, res, next) {
  res.render('apps/events/create-an-event', { title: 'Express' });
});

/* GET /events/event-detail page. */
router.get('/events/event-detail', function(req, res, next) {
  res.render('apps/events/event-detail', { title: 'Express' });
});

/* GET /kanban/boards page. */
router.get('/kanban/boards', function(req, res, next) {
  res.render('apps/kanban/boards', { title: 'Express' });
});

/* GET /kanban/create-kanban-board page. */
router.get('/kanban/create-kanban-board', function(req, res, next) {
  res.render('apps/kanban/create-kanban-board', { title: 'Express' });
});

/* GET /kanban/kanban page. */
router.get('/kanban/kanban', function(req, res, next) {
  res.render('apps/kanban/kanban', { title: 'Express' });
});

module.exports = router;
