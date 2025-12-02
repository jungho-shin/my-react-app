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

// API routes
app.use('/api/country', apiCountryRouter);
app.use('/api/datatypes', apiDataTypesRouter);
app.use('/api/timeunits', apiTimeUnitsRouter);
app.use('/api/schedules', apiSchedulesRouter);
app.use('/api/taskstatus', apiTaskStatusRouter);
app.use('/api/privacypolicies', apiPrivacyPoliciesRouter);

// Serve React build files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'build')));
  
  // Serve React app for all non-API routes
  app.get('*', function(req, res, next) {
    // Skip API routes
    if (req.path.startsWith('/api')) {
      return next();
    }
    res.sendFile(path.join(__dirname, 'build', 'index.html'));
  });
} else {
  // Development: Keep old routes for reference (optional)
  app.use('/', indexRouter);
  app.use('/users', usersRouter);
  app.use('/dashboard', dashboardRouter);
  app.use('/apps', appsRouter);
  app.use('/pages', pagesRouter);
  app.use('/demo', demoRouter);
  app.use('/modules', modulesRouter);
  app.use('/documentation', documentationRouter);
}

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  // In production, let React Router handle 404s
  if (process.env.NODE_ENV === 'production' && !req.path.startsWith('/api')) {
    return res.sendFile(path.join(__dirname, 'build', 'index.html'));
  }
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  if (process.env.NODE_ENV === 'production' && !req.path.startsWith('/api')) {
    res.sendFile(path.join(__dirname, 'build', 'index.html'));
  } else {
    res.render('error');
  }
});

module.exports = app;
