var express = require('express');
var router = express.Router();
var db = require('../../lib/db');

/* Create time unit. */
router.post('/', function(req, res, next) {
    if (req.body.name == '' || req.body.name == null || req.body.name == undefined || req.body.name == 0 || req.body.name == NaN) {
        return res.status(400).json({result: 'NG', message: "'name' cannot be null"});
    } else {
        var query = `INSERT INTO timeunits (name) VALUES(?)`;
        db.query(query, [req.body.name], function (error, results, fields) {
            if (error) throw error;
    
            return res.status(200).json({result: 'OK'});
        });
    }
});

/* GET time unit. */
router.get('/', function(req, res, next) {
    var query = `SELECT * FROM timeunits WHERE delete_date IS NULL`;
    db.query(query, [], function (error, results, fields) {
        if (error) throw error;

        return res.status(200).json({result: results});
    });
});

/* Update time unit. */
router.put('/', function(req, res, next) {
    if (req.body.id == '' || req.body.id == null || req.body.id == undefined || req.body.id == 0 || req.body.id == NaN) {
        return res.status(400).json({result: 'NG', message: "'id' cannot be null"});
    }

    var updateColCnt = 0;
    var query = `UPDATE timeunits SET`;

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

/* Delete time unit */
router.delete('/', function(req, res, next) {
    if (req.body.id == '' || req.body.id == null || req.body.id == undefined || req.body.id == 0 || req.body.id == NaN) {
        return res.status(400).json({result: 'NG', message: "'id' cannot be null"});
    } else {
        var query = `UPDATE timeunits SET delete_date = CURRENT_TIMESTAMP WHERE delete_date IS NULL AND id=?`;
        db.query(query, [req.body.id, req.body.name], function (error, results, fields) {
            if (error) throw error;
    
            return res.status(200).json({result: 'OK'});
        });
    }
});

module.exports = router;
