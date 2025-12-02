var express = require('express');
var router = express.Router();
var db = require('../../lib/db');

/* Create country. */
router.post('/', function(req, res, next) {
    if (req.body.name == '' || req.body.name == null || req.body.name == undefined || req.body.name == 0 || req.body.name == NaN) {
        return res.status(400).json({result: 'NG', message: "'name' cannot be null"});
    } else if (req.body.code2 == '' || req.body.code2 == null || req.body.code2 == undefined || req.body.code2 == 0 || req.body.code2 == NaN) {
        return res.status(400).json({result: 'NG', message: "'code2' cannot be null"});
    } else if (req.body.code3 == '' || req.body.code3 == null || req.body.code3 == undefined || req.body.code3 == 0 || req.body.code3 == NaN) {
        return res.status(400).json({result: 'NG', message: "'code3' cannot be null"});
    } else if (req.body.numeric_code == '' || req.body.numeric_code == null || req.body.numeric_code == undefined || req.body.numeric_code == 0 || req.body.numeric_code == NaN) {
        return res.status(400).json({result: 'NG', message: "'numeric_code' cannot be null"});
    } else {
        var query = `INSERT INTO country (name, code2, code3, numeric_code) VALUES(?, ?, ?, ?)`;
        db.query(query, [req.body.name, req.body.code2, req.body.code3, req.body.numeric_code], function (error, results, fields) {
            if (error) throw error;
    
            return res.status(200).json({result: 'OK'});
        });
    }
});

/* GET country. */
router.get('/', function(req, res, next) {
    var query = `SELECT * FROM country WHERE delete_date IS NULL`;
    db.query(query, [], function (error, results, fields) {
        if (error) throw error;

        return res.status(200).json({result: results});
    });
});

/* Update country. */
router.put('/', function(req, res, next) {
    if (req.body.id == '' || req.body.id == null || req.body.id == undefined || req.body.id == 0 || req.body.id == NaN) {
        return res.status(400).json({result: 'NG', message: "'id' cannot be null"});
    }

    var updateColCnt = 0;
    var query = `UPDATE country SET`;

    if (req.body.name) {
        query = query + ` name="` + req.body.name + `"`;
        updateColCnt++;
    }

    if (req.body.code2) {
        if (updateColCnt == 0) {
            query = query + ` code2="` + req.body.code2 + `"`;
        } else {
            query = query + `, code2="` + req.body.code2 + `"`;
        }
        updateColCnt++;
    }

    if (req.body.code3) {
        if (updateColCnt == 0) {
            query = query + ` code3="` + req.body.code3 + `"`;
        } else {
            query = query + `, code3="` + req.body.code3 + `"`;
        }
        updateColCnt++;
    }

    if (req.body.numeric_code) {
        if (updateColCnt == 0) {
            query = query + ` numeric_code="` + req.body.numeric_code + `"`;
        } else {
            query = query + `, numeric_code="` + req.body.numeric_code + `"`;
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

/* Delete country */
router.delete('/', function(req, res, next) {
    if (req.body.id == '' || req.body.id == null || req.body.id == undefined || req.body.id == 0 || req.body.id == NaN) {
        return res.status(400).json({result: 'NG', message: "'id' cannot be null"});
    } else {
        var query = `UPDATE country SET delete_date = CURRENT_TIMESTAMP WHERE delete_date IS NULL AND id=?`;
        db.query(query, [req.body.id, req.body.name], function (error, results, fields) {
            if (error) throw error;
    
            return res.status(200).json({result: 'OK'});
        });
    }
});

module.exports = router;
