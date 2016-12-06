
var myHRngApp = angular.module('myHRCommonApp', [])
.controller('ctrlmyHRICGoals', function ($scope, $http) {
    $scope.AppHeading = "My Current Year IC Goals";
    $scope.displayTable = true;
    $scope.ICGoals = [];

    $scope.empId = CCI_Common.GetUserProfilePropertyValue("CCI-PS-EMPLID");
    $scope.requestUri = CCI_Common.GetConfig("myHR ICG REST");

    $scope.empId = "00140892";

    function GetICGoals() {
        if ($scope.requestUri != "" && $scope.empId != "") {
            jQuery.ajax({
                url: $scope.requestUri + "?value=" + $scope.empId,
                type: "GET",
                crossDomain: true,
                headers: {
                    "accept": "application/json;odata=verbose",
                },
                success: function (data) {
                    if (typeof (JSON.parse(data.Value).Table) !== "undefined" && JSON.parse(data.Value).Table.length > 0) {
                        $scope.$apply(function () {
                            $scope.ICGoals = JSON.parse(data.Value).Table;
                        });
                    }
                    else {
                        $scope.displayTable = false;
                        $scope.AppHeading = "Issue with JSON";
                    }
                },
                error: function (error) {
                    CCI_Common.LogException(_spPageContextInfo.userLoginName, "CCI-myHR_ICGoals.js--GetICGoals", _spPageContextInfo.serverRequestPath, JSON.stringify(error));
                }
            });
        }

    }

    init();

    function init() {
        if (!$scope.empId.startsWith("Error") && $scope.requestUri != "") {
            GetICGoals();
        }
        else {
            $scope.displayTable = false;
            $scope.AppHeading = "Not Valid";
        }

        var content = "{ \"Table\": [ { \"EMPLID\": \"00607432\", \"EMPL_RCD\": 0.0, \"VC_PLAN_ID\": \"CCIICPLAN\", \"VC_PAYOUT_PRD_ID\": \"2016\", \"GB_GROUP_ID\": \"ICCORPMKTGSAL\", \"VC_GOAL_ID\": \"MBO\", \"PRD_BGN_DT\": \"2016-01-01T00:00:00\", \"PRD_END_DT\": \"2016-12-31T00:00:00\", \"NAME\": \"Test User1\", \"AS_OF_DATE\": \"2016-07-17T00:00:00\", \"VC_AWARD_VALUE\": 17983.20, \"JOBCODE\": \"SA0361\", \"JOBCODE_DESCR\": \"Sr Mgr,3rd Party Retail - Corp\", \"CC_TARGET_PCT\": 15.0, \"ANNUAL_RT\": 119888.0, \"DESCR\": \"CORP - MARKETING/SALES\", \"VC_PERF_FACTOR\": 1.0, \"DESCR50\": \"MBO\", \"DESCR100\": \"Function Specific MBO\", \"VC_PCT_ATTAINED\": 100.0, \"VC_WEIGHT_PERCENT\": 10.0, \"CC_WEIGHTED_RESULT\": 10.0, \"PRORATE_FACTOR\": 1.0, \"VC_CALC_AWARD\": 17983.20, \"CC_VC_CURRENT\": \"Y\", \"CC_VC_PRIOR\": \"N\", \"CC_VC_RESULTS\": \"N\" }, { \"EMPLID\": \"00607432\", \"EMPL_RCD\": 0.0, \"VC_PLAN_ID\": \"CCIICPLAN\", \"VC_PAYOUT_PRD_ID\": \"2016\", \"GB_GROUP_ID\": \"ICCORPMKTGSAL\", \"VC_GOAL_ID\": \"FCF\", \"PRD_BGN_DT\": \"2016-01-01T00:00:00\", \"PRD_END_DT\": \"2016-12-31T00:00:00\", \"NAME\": \"Test User1\", \"AS_OF_DATE\": \"2016-07-17T00:00:00\", \"VC_AWARD_VALUE\": 17983.20, \"JOBCODE\": \"SA0361\", \"JOBCODE_DESCR\": \"Sr Mgr,3rd Party Retail - Corp\", \"CC_TARGET_PCT\": 15.0, \"ANNUAL_RT\": 119888.0, \"DESCR\": \"CORP - MARKETING/SALES\", \"VC_PERF_FACTOR\": 1.0, \"DESCR50\": \"CCI Consolidated Free Cash Flow (FCF)\", \"DESCR100\": \"Total Company: OCF + LTIP Exp - CapEx - LTIP Paymts +/- Chg in Work Captl - Cash Int - Cash Taxes\", \"VC_PCT_ATTAINED\": 100.0, \"VC_WEIGHT_PERCENT\": 30.0, \"CC_WEIGHTED_RESULT\": 30.0, \"PRORATE_FACTOR\": 1.0, \"VC_CALC_AWARD\": 17983.20, \"CC_VC_CURRENT\": \"Y\", \"CC_VC_PRIOR\": \"N\", \"CC_VC_RESULTS\": \"N\" }, { \"EMPLID\": \"00607432\", \"EMPL_RCD\": 0.0, \"VC_PLAN_ID\": \"CCIICPLAN\", \"VC_PAYOUT_PRD_ID\": \"2016\", \"GB_GROUP_ID\": \"ICCORPMKTGSAL\", \"VC_GOAL_ID\": \"CONS OCF\", \"PRD_BGN_DT\": \"2016-01-01T00:00:00\", \"PRD_END_DT\": \"2016-12-31T00:00:00\", \"NAME\": \"Test User1\", \"AS_OF_DATE\": \"2016-07-17T00:00:00\", \"VC_AWARD_VALUE\": 17983.20, \"JOBCODE\": \"SA0361\", \"JOBCODE_DESCR\": \"Sr Mgr,3rd Party Retail - Corp\", \"CC_TARGET_PCT\": 15.0, \"ANNUAL_RT\": 119888.0, \"DESCR\": \"CORP - MARKETING/SALES\", \"VC_PERF_FACTOR\": 1.0, \"DESCR50\": \"CCI Consolidated Operating Cash Flow (OCF)\", \"DESCR100\": \"CCI Consolidated Annual Operating Cash Flow (OCF)\", \"VC_PCT_ATTAINED\": 100.0, \"VC_WEIGHT_PERCENT\": 20.0, \"CC_WEIGHTED_RESULT\": 20.0, \"PRORATE_FACTOR\": 1.0, \"VC_CALC_AWARD\": 17983.20, \"CC_VC_CURRENT\": \"Y\", \"CC_VC_PRIOR\": \"N\", \"CC_VC_RESULTS\": \"N\" }, { \"EMPLID\": \"00607432\", \"EMPL_RCD\": 0.0, \"VC_PLAN_ID\": \"CCIICPLAN\", \"VC_PAYOUT_PRD_ID\": \"2016\", \"GB_GROUP_ID\": \"ICCORPMKTGSAL\", \"VC_GOAL_ID\": \"RESCON PSU\", \"PRD_BGN_DT\": \"2016-01-01T00:00:00\", \"PRD_END_DT\": \"2016-12-31T00:00:00\", \"NAME\": \"Test User1\", \"AS_OF_DATE\": \"2016-07-17T00:00:00\", \"VC_AWARD_VALUE\": 17983.20, \"JOBCODE\": \"SA0361\", \"JOBCODE_DESCR\": \"Sr Mgr,3rd Party Retail - Corp\", \"CC_TARGET_PCT\": 15.0, \"ANNUAL_RT\": 119888.0, \"DESCR\": \"CORP - MARKETING/SALES\", \"VC_PERF_FACTOR\": 1.0, \"DESCR50\": \"Cox Residential Consolidated PSUs\", \"DESCR100\": \"Cox Residential Consolidated Annual PSU\", \"VC_PCT_ATTAINED\": 100.0, \"VC_WEIGHT_PERCENT\": 20.0, \"CC_WEIGHTED_RESULT\": 20.0, \"PRORATE_FACTOR\": 1.0, \"VC_CALC_AWARD\": 17983.20, \"CC_VC_CURRENT\": \"Y\", \"CC_VC_PRIOR\": \"N\", \"CC_VC_RESULTS\": \"N\" }, { \"EMPLID\": \"00607432\", \"EMPL_RCD\": 0.0, \"VC_PLAN_ID\": \"CCIICPLAN\", \"VC_PAYOUT_PRD_ID\": \"2016\", \"GB_GROUP_ID\": \"ICCORPMKTGSAL\", \"VC_GOAL_ID\": \"RESCON REV\", \"PRD_BGN_DT\": \"2016-01-01T00:00:00\", \"PRD_END_DT\": \"2016-12-31T00:00:00\", \"NAME\": \"Test User1\", \"AS_OF_DATE\": \"2016-07-17T00:00:00\", \"VC_AWARD_VALUE\": 17983.20, \"JOBCODE\": \"SA0361\", \"JOBCODE_DESCR\": \"Sr Mgr,3rd Party Retail - Corp\", \"CC_TARGET_PCT\": 15.0, \"ANNUAL_RT\": 119888.0, \"DESCR\": \"CORP - MARKETING/SALES\", \"VC_PERF_FACTOR\": 1.0, \"DESCR50\": \"Cox Residential Consolidated Revenue\", \"DESCR100\": \"Cox Residential Consolidated Annual Revenue\", \"VC_PCT_ATTAINED\": 100.0, \"VC_WEIGHT_PERCENT\": 20.0, \"CC_WEIGHTED_RESULT\": 20.0, \"PRORATE_FACTOR\": 1.0, \"VC_CALC_AWARD\": 17983.20, \"CC_VC_CURRENT\": \"Y\", \"CC_VC_PRIOR\": \"N\", \"CC_VC_RESULTS\": \"N\" } ] }";
        $scope.ICGoals = JSON.parse(content).Table;
    }
})

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

            }
        });
    }

    init();

    function init() {
        GetListItems();
    }
});
