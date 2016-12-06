// JavaScript source code

var appPay = angular.module('myHRPayrollQuickView', [])
.controller('ctrlmyHRPayrollQuickView', function ($scope) {

    function GetListItems() { 
        var requestUri = _spPageContextInfo.siteAbsoluteUrl + "/_api/Web/Lists/GetByTitle('Paycheck Quick View')/Items?";
        requestUri += "$select=Title,ImageUrl,Position,LinkUrl,Description";
        requestUri += "&$filter=DisplayInApp eq 1";

        jQuery.ajax({
            url: requestUri,
            type: "GET",
            headers: {
                "accept": "application/json;odata=verbose",
                "content-type": "application/json;odata=verbose",
            },
            success: function (data) {
                $scope.$apply(function () {
                    $scope.itemDetails = data.d.results;
                });
            },
            error: function (jqxr, errorCode, errorThrown) {
                console.log(JSON.stringify(error));
            }
        });
    }

    init();

    function init() {
        GetListItems();
    }
});

