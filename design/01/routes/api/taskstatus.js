var express = require('express');
var router = express.Router();
var db = require('../../lib/db');

/* Create taskstatus. */
router.post('/', function(req, res, next) {
    if (req.body.name == '' || req.body.name == null || req.body.name == undefined || req.body.name == 0 || req.body.name == NaN) {
        return res.status(400).json({result: 'NG', message: "'name' cannot be null"});
    } else {
        var query = `INSERT INTO taskstatus (name) VALUES(?)`;
        db.query(query, [req.body.name], function (error, results, fields) {
            if (error) throw error;
    
            return res.status(200).json({result: 'OK'});
        });
    }
});

/* GET taskstatus. */
router.get('/', function(req, res, next) {
    var query = `SELECT * FROM taskstatus WHERE delete_date IS NULL`;
    db.query(query, [], function (error, results, fields) {
        if (error) throw error;

        return res.status(200).json({result: results});
    });
});

/* Update taskstatus. */
router.put('/', function(req, res, next) {
    if (req.body.id == '' || req.body.id == null || req.body.id == undefined || req.body.id == 0 || req.body.id == NaN) {
        return res.status(400).json({result: 'NG', message: "'id' cannot be null"});
    }

    var updateColCnt = 0;
    var query = `UPDATE taskstatus SET`;

    if (req.body.name) {
        query = query + ` name="` + req.body.name + `"`;
        updateColCnt++;
    }

    if (updateColCnt == 0) {
        return res.status(400).json({result: 'NG', message: "There is no information to update."});
    } else {
        query = query + ` WHERE delete_date IS NULL AND id=` + req.body.id + ";";

        db.query(query, [], function (error, results, fields) {
            if (error) throw error;
    
            return res.status(200).json({result: 'OK'});
        });
    }
});

/* Delete taskstatus */
router.delete('/', function(req, res, next) {
    if (req.body.id == '' || req.body.id == null || req.body.id == undefined || req.body.id == 0 || req.body.id == NaN) {
        return res.status(400).json({result: 'NG', message: "'id' cannot be null"});
    } else {
        var query = `UPDATE taskstatus SET delete_date = CURRENT_TIMESTAMP WHERE delete_date IS NULL AND id=?`;
        db.query(query, [req.body.id, req.body.name], function (error, results, fields) {
            if (error) throw error;
    
            return res.status(200).json({result: 'OK'});
        });
    }
});

module.exports = router;
