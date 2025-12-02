var createError = require('http-errors');
var express = require('express');
var favicon = require('serve-favicon');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var dashboardRouter = require('./routes/dashboard');
var appsRouter = require('./routes/apps');
var pagesRouter = require('./routes/pages');
var demoRouter = require('./routes/demo');
var modulesRouter = require('./routes/modules');
var documentationRouter = require('./routes/documentation');
var apiCountryRouter = require('./routes/api/country');
var apiDataTypesRouter = require('./routes/api/datatypes');
var apiTimeUnitsRouter = require('./routes/api/timeunits');
var apiSchedulesRouter = require('./routes/api/schedules');
var apiTaskStatusRouter = require('./routes/api/taskstatus');
var apiPrivacyPoliciesRouter = require('./routes/api/privacypolicies');

var app = express();

app.use(favicon(path.join(__dirname, 'public/images/favicons', 'favicon.ico')));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/dashboard', dashboardRouter);
app.use('/apps', appsRouter);
app.use('/pages', pagesRouter);
app.use('/demo', demoRouter);
app.use('/modules', modulesRouter);
app.use('/documentation', documentationRouter);
app.use('/api/country', apiCountryRouter);
app.use('/api/datatypes', apiDataTypesRouter);
app.use('/api/timeunits', apiTimeUnitsRouter);
app.use('/api/schedules', apiSchedulesRouter);
app.use('/api/taskstatus', apiTaskStatusRouter);
app.use('/api/privacypolicies', apiPrivacyPoliciesRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
