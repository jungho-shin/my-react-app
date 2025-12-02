var express = require('express');
var router = express.Router();
var db = require('../../lib/db');

/* Create privacypolicies. */
router.post('/', function(req, res, next) {
    if (req.body.title == '' || req.body.title == null || req.body.title == undefined || req.body.title == 0 || req.body.title == NaN) {
        return res.status(400).json({result: 'NG', message: "'title' cannot be null"});
    } else if (req.body.contents == '' || req.body.contents == null || req.body.contents == undefined || req.body.contents == 0 || req.body.contents == NaN) {
        return res.status(400).json({result: 'NG', message: "'contents' cannot be null"});
    } else {
        var query = `INSERT INTO privacypolicies (title, contents) VALUES(?, ?)`;
        db.query(query, [req.body.title, req.body.contents], function (error, results, fields) {
            if (error) throw error;
    
            return res.redirect(req.get('referer'));
        });
    }
});

/* GET privacypolicies. */
router.get('/', function(req, res, next) {
    var query = `SELECT * FROM privacypolicies WHERE delete_date IS NULL`;
    db.query(query, [], function (error, results, fields) {
        if (error) throw error;

        return res.status(200).json({result: results});
    });
});

/* Update privacypolicies. */
router.put('/', function(req, res, next) {
    if (req.body.id == '' || req.body.id == null || req.body.id == undefined || req.body.id == 0 || req.body.id == NaN) {
        return res.status(400).json({result: 'NG', message: "'id' cannot be null"});
    }

    var updateColCnt = 0;
    var query = `UPDATE privacypolicies SET`;

    if (req.body.title) {
        query = query + ` title="` + req.body.title + `"`;
        updateColCnt++;
    }

    if (req.body.contents) {
        if (updateColCnt == 0) {
            query = query + ` contents="` + req.body.contents + `"`;
        } else {
            query = query + `, contents="` + req.body.contents + `"`;
        }
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

/* Delete privacypolicies */
router.delete('/', function(req, res, next) {
    if (req.body.id == '' || req.body.id == null || req.body.id == undefined || req.body.id == 0 || req.body.id == NaN) {
        return res.status(400).json({result: 'NG', message: "'id' cannot be null"});
    } else {
        var query = `UPDATE privacypolicies SET delete_date = CURRENT_TIMESTAMP WHERE delete_date IS NULL AND id=?`;
        db.query(query, [req.body.id, req.body.name], function (error, results, fields) {
            if (error) throw error;
    
            return res.status(200).json({result: 'OK'});
        });
    }
});

module.exports = router;
