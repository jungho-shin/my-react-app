var ajax = {
    _call: function (method, url, data, success_callback, fail_callback , customHeader) {
        console.log('method : ', method);
        $.ajax({
            url: url,
            type: method.toUpperCase(),
            dataType: 'JSON',
            data: data
        })

        .done(function(result, textStatus, jqXHR) {
            if (success_callback) {
                success_callback(result, textStatus, jqXHR);
            } else {
                console.log("========== ajax success ==========");
                console.log('status : ', textStatus);
            }
        })

        .fail(function(result, textStatus, jqXHR) {
            if (fail_callback) {
                fail_callback(result, textStatus, jqXHR);
            } else {
                console.log("========== ajax fail ==========");
                console.log('status : ', textStatus);
            }
        })

        .always(function() {
            console.log("========== ajax always ==========");
        });
    },

    post: function (url, data, success_callback, fail_callback , customHeader) {
        this._call("post", url, data, success_callback, fail_callback, customHeader);
    },
    
    get: function (url, data, success_callback, fail_callback, customHeader) {
        this._call("get", url, data, success_callback, fail_callback, customHeader);
    },
    
    put: function(url, data, success_callback, fail_callback , customHeader) {
        this._call("put", url, data, success_callback, fail_callback, customHeader);
    },
    
    del: function(url, data, success_callback, fail_callback , customHeader) {
        this._call("delete", url, data, success_callback, fail_callback, customHeader);
    }
}