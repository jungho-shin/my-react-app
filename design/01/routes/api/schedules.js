var express = require('express');
var router = express.Router();
var db = require('../../lib/db');
var collector = require('../../lib/collector');
var scheduler = require('../../lib/scheduler');


function init() {
    var query = `SELECT * FROM schedules WHERE taskstatus_id = 1 AND delete_date IS NULL`;
    db.query(query, [], function (error, results, fields) {
        if (error) throw error;

        for(const item of results) {
            console.log('id:', item.id);
            var rule = "0" + " " + item.minute + " " + item.hour + " " + item.day + " " + item.month + " " + item.week;

            scheduler.start(item.id, rule, function(){
                collector.collect(item.datatype_id);
            });
        }
    });
}

/* Create schedules. */
router.post('/', function(req, res, next) {
    if (req.body.schedule_name == '' || req.body.schedule_name == null || req.body.schedule_name == undefined || req.body.schedule_name == 0 || req.body.schedule_name == NaN) {
        return res.status(400).json({result: 'NG', message: "'schedule_name' cannot be null"});
    } else if (req.body.datatype_id == '' || req.body.datatype_id == null || req.body.datatype_id == undefined || req.body.datatype_id == 0 || req.body.datatype_id == NaN) {
        return res.status(400).json({result: 'NG', message: "'datatype_id' cannot be null"});
    } else if (req.body.minute == '' || req.body.minute == null || req.body.minute == undefined || req.body.minute == 0 || req.body.minute == NaN) {
        return res.status(400).json({result: 'NG', message: "'minute' cannot be null"});
    } else if (req.body.hour == '' || req.body.hour == null || req.body.hour == undefined || req.body.hour == 0 || req.body.hour == NaN) {
        return res.status(400).json({result: 'NG', message: "'hour' cannot be null"});
    } else if (req.body.day == '' || req.body.day == null || req.body.day == undefined || req.body.day == 0 || req.body.day == NaN) {
        return res.status(400).json({result: 'NG', message: "'day' cannot be null"});
    } else if (req.body.month == '' || req.body.month == null || req.body.month == undefined || req.body.month == 0 || req.body.month == NaN) {
        return res.status(400).json({result: 'NG', message: "'month' cannot be null"});
    } else if (req.body.week == '' || req.body.week == null || req.body.week == undefined || req.body.week == 0 || req.body.week == NaN) {
        return res.status(400).json({result: 'NG', message: "'week' cannot be null"});
    } else {
        var query = `INSERT INTO schedules (schedule_name, datatype_id, minute, hour, day, month, week) VALUES(?, ?, ?, ?, ?, ?, ?)`;
        db.query(query, [req.body.schedule_name, req.body.datatype_id, req.body.minute, req.body.hour, req.body.day, req.body.month, req.body.week], function (error, results, fields) {
            if (error) throw error;
    
            var rule = "0" + " " + req.body.minute + " " + req.body.hour + " " + req.body.day + " " + req.body.month + " " + req.body.week;

            scheduler.start(results.insertId, rule, function(){
                collector.collect(req.body.datatype_id);
            });

            return res.status(200).json({result: 'OK'});
        });
    }
});

/* GET schedules. */
router.get('/', function(req, res, next) {
    var query = `SELECT * FROM schedules WHERE delete_date IS NULL`;
    db.query(query, [], function (error, results, fields) {
        if (error) throw error;

        return res.status(200).json({result: results});
    });
});

/* Update schedules. */
router.put('/', function(req, res, next) {
    if (req.body.id == '' || req.body.id == null || req.body.id == undefined || req.body.id == 0 || req.body.id == NaN) {
        return res.status(400).json({result: 'NG', message: "'id' cannot be null"});
    }

    var updateColCnt = 0;
    var query = `UPDATE schedules SET`;

    if (req.body.schedule_name) {
        query = query + ` schedule_name="` + req.body.schedule_name + `"`;
        updateColCnt++;
    }

    if (req.body.datatype_id) {
        if (updateColCnt == 0) {
            query = query + ` datatype_id="` + req.body.datatype_id + `"`;
        } else {
            query = query + `, datatype_id="` + req.body.datatype_id + `"`;
        }
        updateColCnt++;
    }

    if (req.body.minute) {
        if (updateColCnt == 0) {
            query = query + ` minute="` + req.body.minute + `"`;
        } else {
            query = query + `, minute="` + req.body.minute + `"`;
        }
        updateColCnt++;
    }

    if (req.body.hour) {
        if (updateColCnt == 0) {
            query = query + ` hour="` + req.body.hour + `"`;
        } else {
            query = query + `, hour="` + req.body.hour + `"`;
        }
        updateColCnt++;
    }

    if (req.body.day) {
        if (updateColCnt == 0) {
            query = query + ` day="` + req.body.day + `"`;
        } else {
            query = query + `, day="` + req.body.day + `"`;
        }
        updateColCnt++;
    }

    if (req.body.month) {
        if (updateColCnt == 0) {
            query = query + ` month="` + req.body.month + `"`;
        } else {
            query = query + `, month="` + req.body.month + `"`;
        }
        updateColCnt++;
    }

    if (req.body.week) {
        if (updateColCnt == 0) {
            query = query + ` week="` + req.body.week + `"`;
        } else {
            query = query + `, week="` + req.body.week + `"`;
        }
        updateColCnt++;
    }

    if (req.body.taskstatus_id) {
        if (updateColCnt == 0) {
            query = query + ` taskstatus_id="` + req.body.taskstatus_id + `"`;
        } else {
            query = query + `, taskstatus_id="` + req.body.taskstatus_id + `"`;
        }
        updateColCnt++;
    }
    
    if (updateColCnt == 0) {
        return res.status(400).json({result: 'NG', message: "There is no information to update."});
    } else {
        query = query + ` WHERE delete_date IS NULL AND id=` + req.body.id + ";";

        db.query(query, [], function (error, results, fields) {
            if (error) throw error;
    
            if(req.body.taskstatus_id == 1) {
                var rule = "0" + " " + req.body.minute + " " + req.body.hour + " " + req.body.day + " " + req.body.month + " " + req.body.week;

                scheduler.restart(req.body.id, rule, function(){
                    collector.collect(req.body.datatype_id);
                });
            } else {
                scheduler.stop(req.body.id);
            }
    
            return res.status(200).json({result: 'OK'});
        });
    }
});

/* Delete schedules */
router.delete('/', function(req, res, next) {
    if (req.body.id == '' || req.body.id == null || req.body.id == undefined || req.body.id == 0 || req.body.id == NaN) {
        return res.status(400).json({result: 'NG', message: "'id' cannot be null"});
    } else {
        var query = `UPDATE schedules SET delete_date = CURRENT_TIMESTAMP WHERE delete_date IS NULL AND id=?`;
        db.query(query, [req.body.id, req.body.name], function (error, results, fields) {
            if (error) throw error;
    
            scheduler.stop(req.body.id);

            return res.status(200).json({result: 'OK'});
        });
    }
});

init();

module.exports = router;
