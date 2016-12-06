'use strict';

angular.module('SPApp.services',[])
.factory('userService', ['$q', function ($q) {
    var getSPGUsers = function (grpName) {
        var d = $q.defer();

        var reqUri = _spPageContextInfo.siteAbsoluteUrl + "/_api/web/sitegroups/getByName('" + grpName + "')/users";
                jQuery.ajax({
                    url: reqUri,
                    type: "GET",
                    async: false,
                    headers: {
                        "accept": "application/json;odata=verbose",
                    },
                    success: function (data) {
                        d.resolve(data);
                    },
                    error: function (jqxr, errorCode, errorThrown) {
                        d.reject(jqxr.responseText);
                    }
                });
        return d.promise;
    };

    return {
        getSPGUsers: getSPGUsers
    };
}]);