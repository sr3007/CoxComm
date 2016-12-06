//var appWP = angular.module('appWidgetPreferences', ['ui.bootstrap', 'ngSanitize']);
//Service
appWP.factory('exService', function ($log) {
    var listItemID = "";
    var selectedControlsJSON = "";
    var myPreferences = "";
    var userSelected = false;

    return {
        getEmpID: function () {
            return CCI_Common.GetUserProfilePropertyValue("CCI-PS-EMPLID");
        },
        setJSON: function (selectedJSON) {
            selectedControlsJSON = selectedJSON;
        },
        getJSON: function () {
            return selectedControlsJSON;
        },
        getPreferences: function () {
            var reqUri;

            if (typeof (this.GetConfig("myHR Widget Preferences")) != "undefined") {
                reqUri = _spPageContextInfo.webAbsoluteUrl + "/_api/web/lists(guid'" + this.GetConfig("myHR Widget Preferences") + "')/items?$filter=UserID eq '" + _spPageContextInfo.userLoginName + "'";
            }
            else {
                reqUri = _spPageContextInfo.webAbsoluteUrl + "/_api/web/lists/getbytitle('Widget Preferences')/items?$filter=UserID eq '" + _spPageContextInfo.userLoginName + "'";
            }

            jQuery.ajax({
                url: reqUri,
                type: "GET",
                async: false,
                headers: {
                    "accept": "application/json;odata=verbose",
                },
                success: function (data) {
                    if (data.d.results.length == 1) {
                        myPreferences = data.d.results[0].Preferences;
                        //listItemID = data.d.results[0].ID;
                        return myPreferences;
                    }
                    else {
                        $log.info("Check Preferences list for user - " + _spPageContextInfo.userLoginName);
                    }
                },
                error: function (jqxr, errorCode, errorThrown) {
                    CCI_Common.LogException(_spPageContextInfo.userLoginName, "CCI-myHR_WidgetPreferences.js--getPreferences", _spPageContextInfo.serverRequestPath, jqxr.responseText);
                }
            });
            return myPreferences;
        },
        getNextPayDay: function () {
            var deferred = $.Deferred();

            var today = new Date();

            var requestUri = _spPageContextInfo.webAbsoluteUrl + "/_api/Web/Lists(guid'" + this.GetConfig("PayDay") + "')/Items?";
            requestUri += "$select=PayDay";
            requestUri += "&$filter=PayDay ge datetime'" + today.toISOString() + "'";
            requestUri += "&$orderby=PayDay asc";

            jQuery.ajax({
                url: requestUri,
                type: "GET",
                headers: {
                    "accept": "application/json;odata=verbose",
                    "content-type": "application/json;odata=verbose",
                },
                success: function (data) {
                    if (data.d.results.length > 0) {
                        deferred.resolve(data.d.results[0].PayDay);
                    }
                    else {
                        deferred.resolve("");
                    }
                },
                error: function (jqxr, errorCode, errorThrown) {
                    CCI_Common.LogException(_spPageContextInfo.userLoginName, "CCI-myHR_WidgetPreferences.js--getNextPayDay", _spPageContextInfo.serverRequestPath, jqxr.responseText);
                    deferred.reject("error");
                }
            });
            return deferred.promise();
        },

        //Get 'Value' from Config list
        GetConfig: function (configKey) {
            if (window.sessionStorage.getItem("myHRConfigData") != null) {
                var myHRConfigData = [];
                myHRConfigData = JSON.parse(window.sessionStorage.getItem("myHRConfigData"));
                if (myHRConfigData.length > 0) {
                    for (var count = 0; count < myHRConfigData.length; count++) {
                        if (myHRConfigData[count].Key === configKey) {
                            return myHRConfigData[count].Value;
                            break;
                        }
                    }
                }
                return "";
            }
            else {
                this.GetConfigUsingREST().then(
                    function (hrConfigData) {
                        if (typeof (Storage) !== "undefined") {
                            //Browser supports Local Storage
                            window.sessionStorage.setItem("myHRConfigData", JSON.stringify(hrConfigData));

                            if (window.sessionStorage.getItem("myHRConfigData") != null) {
                                var myHRConfigData = [];
                                myHRConfigData = JSON.parse(window.sessionStorage.getItem("myHRConfigData"));
                                if (myHRConfigData.length > 0) {
                                    for (var count = 0; count < myHRConfigData.length; count++) {
                                        if (myHRConfigData[count].Key === configKey) {
                                            return myHRConfigData[count].Value;
                                            break;
                                        }
                                    }
                                }
                                return "";
                            }
                            else {
                                return "";
                            }
                        }
                });
            }
        },

        //Get Config list values
        GetConfigUsingREST: function () {
            var deferred = $.Deferred();

            var configListUri = _spPageContextInfo.webAbsoluteUrl + "/_api/web/lists/getbytitle('Config')/items?";
            configListUri += "$select=Key,Value";
            //configListUri += "&$filter=Key eq '" + configKey + "'";
            jQuery.ajax({
                url: configListUri,
                type: "GET",
                async: false,
                contentType: "application/json;odata=nometadata",
                headers: {
                    "Accept": "application/json;odata=nometadata"
                },
                success: function (data) {
                    if (data.value.length >= 1) {
                        deferred.resolve(data.value);
                    }
                    else {
                        deferred.resolve("");
                    }
                },
                error: function (error) {
                    CCI_Common.LogException(_spPageContextInfo.userLoginName, "CCI-myHR_WidgetPreferences.js.GetConfigUsingREST", _spPageContextInfo.serverRequestPath, JSON.stringify(error));
                    deferred.reject(error);
                }
            });
            return deferred.promise();
        }
    };
});

appWP.factory('JobFamilyService', function ($log) {
    var selectedSubFamily = "";

    return {
        setJSON: function (selectedSF) {
            selectedSubFamily = selectedSF;
        },
        getJSON: function () {
            return selectedSubFamily;
        }
    };
});

appWP.controller('ModalDemoCtrl', function ($scope, $rootScope, $sce, $modal, $log, exService) {

    init();

    
    function init() {
        if (window.$) { //Wait till jQuery loads
            //Check for Preferences in Widget Preferences list
            var currentPref = exService.getPreferences();
            if (typeof (currentPref) != "undefined" && currentPref != null && currentPref != "") {
                //Display widgets
                var wdgtsToDisplay = JSON.parse(currentPref);
                if (wdgtsToDisplay.selections.length > 0) {
                    LoadControls(wdgtsToDisplay);
                }
            }
            else { //Initial load
                var defaultPref = {
                    "selections": [
                        { "chkCtrl": "chkPTO", "ddlCtrl": "ddlPTO", "ddlCtrlValue": "1" },
                        { "chkCtrl": "chkPQV", "ddlCtrl": "ddlPQV", "ddlCtrlValue": "2" },
                        { "chkCtrl": "chkICGoals", "ddlCtrl": "ddlICGoals", "ddlCtrlValue": "3" },
                        { "chkCtrl": "chkCFW", "ddlCtrl": "ddlCFW", "ddlCtrlValue": "4" }
                    ]
                };
                LoadDefaultControls(defaultPref);
            }
        }
        else {
            // wait 50 milliseconds and try again.
            window.setTimeout(init, 50);
        }
    }

    $scope.open = function (size) {
        var modalInstance = $modal.open({
            templateUrl: 'WidgetPreferences.html',
            controller: 'ModalInstanceCtrl',
            size: size,
            resolve: {
                
            }
        });


        modalInstance.result.then(function () {
            var currentPref = exService.getJSON();
            if (typeof (currentPref) != "undefined" && currentPref != "") {
                LoadControls(currentPref);
            }
        }, function () {
            //$log.info('Modal dismissed at: ' + new Date());
        });
    };
    
    //Load controls
    //Check current preferences
    function LoadControls(currentPreferences) {
        //var ctrlsToPopulate = JSON.parse(currentPreferences);
        $scope.firstTemplate = "";
        $scope.secondTemplate = "";
        $scope.thirdTemplate = "";
        $scope.fourthTemplate = "";

        if (currentPreferences.selections.length > 0) {
            /*var ctrlsToPopulate = currentPreferences.selections.sort(function (a, b) {
                return parseInt(a.ddlCtrlValue) - parseInt(b.ddlCtrlValue);
            });*/
            for (var count = 0; count < currentPreferences.selections.length; count++) {
                switch (JSON.parse(currentPreferences.selections[count])["chkCtrl"]) {
                    case "chkICGoals":
                        switch (JSON.parse(currentPreferences.selections[count])["ddlCtrlValue"]) {
                            case "1":
                                $scope.firstTemplate = "ICGoals.html";
                                break;
                            case "2":
                                $scope.secondTemplate = "ICGoals.html";
                                break;
                            case "3":
                                $scope.thirdTemplate = "ICGoals.html";
                                break;
                            case "4":
                                $scope.fourthTemplate = "ICGoals.html";
                                break;
                        }
                        break;
                    case "chkPQV":
                        switch (JSON.parse(currentPreferences.selections[count])["ddlCtrlValue"]) {
                            case "1":
                                $scope.firstTemplate = "PayrollQuickView.html";
                                break;
                            case "2":
                                $scope.secondTemplate = "PayrollQuickView.html";
                                break;
                            case "3":
                                $scope.thirdTemplate = "PayrollQuickView.html";
                                break;
                            case "4":
                                $scope.fourthTemplate = "PayrollQuickView.html";
                                break;
                        }
                        break;
                    case "chkPTO":
                        switch (JSON.parse(currentPreferences.selections[count])["ddlCtrlValue"]) {
                            case "1":
                                $scope.firstTemplate = "PTO.html";
                                break;
                            case "2":
                                $scope.secondTemplate = "PTO.html";
                                break;
                            case "3":
                                $scope.thirdTemplate = "PTO.html";
                                break;
                            case "4":
                                $scope.fourthTemplate = "PTO.html";
                                break;
                        }
                        break;
                    case "chkCFW":
                        switch (JSON.parse(currentPreferences.selections[count])["ddlCtrlValue"]) {
                            case "1":
                                $scope.firstTemplate = "CFW.html";
                                break;
                            case "2":
                                $scope.secondTemplate = "CFW.html";
                                break;
                            case "3":
                                $scope.thirdTemplate = "CFW.html";
                                break;
                            case "4":
                                $scope.fourthTemplate = "CFW.html";
                                break;
                        }
                        break;
                }
            }
        }
    }

    function LoadDefaultControls(currentPreferences) {
        //var ctrlsToPopulate = JSON.parse(currentPreferences);
        $scope.firstTemplate = "";
        $scope.secondTemplate = "";
        $scope.thirdTemplate = "";
        $scope.fourthTemplate = "";

        if (currentPreferences.selections.length > 0) {
            /*var ctrlsToPopulate = currentPreferences.selections.sort(function (a, b) {
                return parseInt(a.ddlCtrlValue) - parseInt(b.ddlCtrlValue);
            });*/
            for (var count = 0; count < currentPreferences.selections.length; count++) {
                switch (currentPreferences.selections[count]["chkCtrl"]) {
                    case "chkICGoals":
                        switch (currentPreferences.selections[count]["ddlCtrlValue"]) {
                            case "1":
                                $scope.firstTemplate = "ICGoals.html";
                                break;
                            case "2":
                                $scope.secondTemplate = "ICGoals.html";
                                break;
                            case "3":
                                $scope.thirdTemplate = "ICGoals.html";
                                break;
                            case "4":
                                $scope.fourthTemplate = "ICGoals.html";
                                break;
                        }
                        break;
                    case "chkPQV":
                        switch (currentPreferences.selections[count]["ddlCtrlValue"]) {
                            case "1":
                                $scope.firstTemplate = "PayrollQuickView.html";
                                break;
                            case "2":
                                $scope.secondTemplate = "PayrollQuickView.html";
                                break;
                            case "3":
                                $scope.thirdTemplate = "PayrollQuickView.html";
                                break;
                            case "4":
                                $scope.fourthTemplate = "PayrollQuickView.html";
                                break;
                        }
                        break;
                    case "chkPTO":
                        switch (currentPreferences.selections[count]["ddlCtrlValue"]) {
                            case "1":
                                $scope.firstTemplate = "PTO.html";
                                break;
                            case "2":
                                $scope.secondTemplate = "PTO.html";
                                break;
                            case "3":
                                $scope.thirdTemplate = "PTO.html";
                                break;
                            case "4":
                                $scope.fourthTemplate = "PTO.html";
                                break;
                        }
                        break;
                    case "chkCFW":
                        switch (currentPreferences.selections[count]["ddlCtrlValue"]) {
                            case "1":
                                $scope.firstTemplate = "CFW.html";
                                break;
                            case "2":
                                $scope.secondTemplate = "CFW.html";
                                break;
                            case "3":
                                $scope.thirdTemplate = "CFW.html";
                                break;
                            case "4":
                                $scope.fourthTemplate = "CFW.html";
                                break;
                        }
                        break;
                }
            }
        }
    }
});

//Model window
appWP.controller('ModalInstanceCtrl', function ($scope, $modalInstance, $log, exService) {

    $scope.orderNumbers = ["1", "2", "3", "4"];
    $scope.DisplaySave = true;

    $scope.checkUniqueOrder = function () {
        var orderCounter = {};
        var c;
        var allOrder = [
            ((typeof ($scope.chkPTO) == "undefined" || $scope.chkPTO == false)) ? 0 : $scope.ddlPTO,
            ((typeof ($scope.chkPQV) == "undefined" || $scope.chkPQV == false)) ? 0 : $scope.ddlPQV,
            ((typeof ($scope.chkICGoals) == "undefined" || $scope.chkICGoals == false)) ? 0 : $scope.ddlICGoals,
            ((typeof ($scope.chkCFW) == "undefined" || $scope.chkCFW == false)) ? 0 : $scope.ddlCFW
        ];
        for (var i = 0; i <= 4; i++) {
            if (allOrder[i] > 0) {
                c = orderCounter[allOrder[i]] = (orderCounter[allOrder[i]] || 0) + 1;
                if (c > 1) {
                    break;
                }
            }
        }
        if (c > 1) {
            $scope.safeApply(function () {
                $scope.UniqueOrderMessage = exService.GetConfig("Unique Order Message");
                $scope.DisplaySave = false;
            });
        }
        else {
            $scope.safeApply(function () {
                $scope.UniqueOrderMessage = "";
                $scope.DisplaySave = true;
            });
        }

        /*
        switch (changedDDL) {
            case "ICGoals":
                switch ($scope.ddlICGoals) {
                    case "1":
                      /*  if ($scope.chkPQV && $scope.ddlPQV == "1") {
                            $scope.ddlPQV = "2";
                            if ($scope.chkPTO && $scope.ddlPTO == "2") {
                                $scope.ddlPTO = "3";
                                if ($scope.chkCFW && $scope.ddlCFW == "3") {
                                    $scope.ddlCFW = 4;
                                }
                            } else if ($scope.chkCFW && $scope.ddlCFW == "2") {
                                $scope.ddlCFW = "3";
                                if ($scope.chkPTO && $scope.ddlPTO == "3") {
                                    $scope.ddlPTO = 4;
                                }
                            }
                        } else if ($scope.chkPTO && $scope.chkPTO == "1") {
                            $scope.chkPTO = "2";
                            if ($scope.chkCFW && $scope.ddlCFW == "2") {
                                $scope.ddlCFW = "3";
                                if ($scope.chkPQV && $scope.ddlPQV == "3") {
                                    $scope.ddlPQV = 4;
                                }
                            } else if ($scope.chkPQV && $scope.ddlPQV == "2") {
                                $scope.ddlPQV = "3";
                                if ($scope.chkCFW && $scope.ddlCFW == "3") {
                                    $scope.ddlCFW = 4;
                                }
                            }
                        } else if ($scope.chkCFW && $scope.ddlCFW == "1") {
                            $scope.chkCFW = "2";
                            if ($scope.chkPQV && $scope.ddlPQV == "2") {
                                $scope.ddlPQV = "3";
                                if ($scope.chkPTO && $scope.ddlPTO == "3") {
                                    $scope.ddlPTO = 4;
                                }
                            } else if ($scope.chkPTO && $scope.ddlPTO == "2") {
                                $scope.ddlPTO = "3";
                                if ($scope.chkPQV && $scope.ddlPQV == "3") {
                                    $scope.ddlPQV = 4;
                                }
                            }
                        }
                        break;
                    case "2":
                        break;
                    case "3":
                        break;
                    case "4":
                        break;
                }
                break;
            case "PQV":
                switch ($scope.ddlPQV) {
                    case "1":
                        break;
                    case "2":
                        break;
                    case "3":
                        break;
                    case "4":
                        break;
                }
                break;
            case "PTO":
                switch ($scope.ddlPTO) {
                    case "1":
                        break;
                    case "2":
                        break;
                    case "3":
                        break;
                    case "4":
                        break;
                }
                break;
            case "CFW":
                switch ($scope.ddlCFW) {
                    case "1":
                        break;
                    case "2":
                        break;
                    case "3":
                        break;
                    case "4":
                        break;
                }
                break;
        }*/
    };

    $scope.safeApply = function (fn) {
        var phase = this.$root.$$phase;
        if (phase == '$apply' || phase == '$digest') {
            if (fn && (typeof (fn) === 'function')) {
                fn();
            }
        } else {
            this.$apply(fn);
        }
    };


    GetPreferences(); //Get preferences from SPList
    if (typeof (exService.myPreferences) != "undefined" && exService.myPreferences != null && exService.myPreferences != "") {
        //Pre populate controls
        var ctrlsToPopulate = JSON.parse(exService.myPreferences);
        if (ctrlsToPopulate.selections.length > 0) {
            for (var count = 0; count < ctrlsToPopulate.selections.length; count++) {
                switch (JSON.parse(ctrlsToPopulate.selections[count])["chkCtrl"]) {
                    case "chkICGoals": //IC Goals
                        $scope.chkICGoals = true;
                        if (parseInt(JSON.parse(ctrlsToPopulate.selections[count])["ddlCtrlValue"]) > 0) {
                            $scope.ddlICGoals = JSON.parse(ctrlsToPopulate.selections[count])["ddlCtrlValue"];
                            $scope.orderNumbers = ["1", "2", "3", "4"];
                        }
                        break;
                    case "chkPQV": //Paycheck Quick View
                        $scope.chkPQV = true;
                        if (parseInt(JSON.parse(ctrlsToPopulate.selections[count])["ddlCtrlValue"]) > 0) {
                            $scope.ddlPQV = JSON.parse(ctrlsToPopulate.selections[count])["ddlCtrlValue"];
                            $scope.orderNumbers = ["1", "2", "3", "4"];
                        }
                        break;
                    case "chkPTO": //Paid Time Off
                        $scope.chkPTO = true;
                        if (parseInt(JSON.parse(ctrlsToPopulate.selections[count])["ddlCtrlValue"]) > 0) {
                            $scope.ddlPTO = JSON.parse(ctrlsToPopulate.selections[count])["ddlCtrlValue"];
                            $scope.orderNumbers = ["1", "2", "3", "4"];
                        }
                        break;
                    case "chkCFW": //Career Framework
                        $scope.chkCFW = true;
                        if (parseInt(JSON.parse(ctrlsToPopulate.selections[count])["ddlCtrlValue"]) > 0) {
                            $scope.ddlCFW = JSON.parse(ctrlsToPopulate.selections[count])["ddlCtrlValue"];
                            $scope.orderNumbers = ["1", "2", "3", "4"];
                        }
                        break;
                }
            }
        }
        //$scope.chkICGoals = true;
    }
    else { //All select by default
        $scope.chkPTO = true;
        $scope.ddlPTO = "1";
        $scope.chkPQV = true;
        $scope.ddlPQV = "2";
        $scope.chkICGoals = true;
        $scope.ddlICGoals = "3";
        $scope.chkCFW = true;
        $scope.ddlCFW = "4";
    }

    
    $scope.ok = function () {
        //Get Selected Checkboxes and associated DDLs and build JSON
        var userFinalSelection = {
            selections: []
        };

        var userSelected = false; //Will become true if user makes any selection. If false, nothing will be updated.

        if (typeof (this.chkICGoals) != "undefined" && this.chkICGoals != false) {
            var orderICGoals = typeof (this.ddlICGoals) != "undefined" ? this.ddlICGoals : 0;
            var chkGoalsSelection = new Selection("chkICGoals", "ddlICGoals", orderICGoals);
            userFinalSelection.selections.push(JSON.stringify(chkGoalsSelection));
            userSelected = true;
        }
        if (typeof (this.chkPQV) != "undefined" && this.chkPQV != false) {
            var orderPQV = typeof (this.ddlPQV) != "undefined" ? this.ddlPQV : 0;
            var chkPQVSelection = new Selection("chkPQV", "ddlPQV", orderPQV);
            userFinalSelection.selections.push(JSON.stringify(chkPQVSelection));
            userSelected = true;
        }
        if (typeof (this.chkPTO) != "undefined" && this.chkPTO != false) {
            var orderPTO = typeof (this.ddlPTO) != "undefined" ? this.ddlPTO : 0;
            var chkPTOSelection = new Selection("chkPTO", "ddlPTO", orderPTO);
            userFinalSelection.selections.push(JSON.stringify(chkPTOSelection));
            userSelected = true;
        }
        if (typeof (this.chkCFW) != "undefined" && this.chkCFW != false) {
            var orderCFW = typeof (this.ddlCFW) != "undefined" ? this.ddlCFW : 0;
            var chkCFWSelection = new Selection("chkCFW", "ddlCFW", orderCFW);
            userFinalSelection.selections.push(JSON.stringify(chkCFWSelection));
            userSelected = true;
        }
        if (this.chkICGoals == false || this.chkPQV == false || this.chkPTO == false || this.chkCFW == false) {
            userSelected = true;
        }

        if (userSelected) {
            exService.setJSON(userFinalSelection);

            if (exService.getJSON() != null && exService.getJSON() != "") {
                ManagePreferences();
            }
        }
        
        $modalInstance.close();
    };

    //To build JSONs
    function Selection(chkCtrlName, ddlCtrlName, ddlCtrlValue) {
        this.chkCtrl = chkCtrlName;
        this.ddlCtrl = ddlCtrlName;
        this.ddlCtrlValue = ddlCtrlValue;
    }

    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };

    //Manage (Add/Update) preferences
    function ManagePreferences() {
        if (exService.myPreferences != null && exService.myPreferences != "") { //If Preferences exists in SPList
            UpdateWPListREST(exService.listItemID);
        }
        else {
            //add new
            AddtoWPListREST();
        }
    }
    //Add to 'Widget Preferences' list
    function AddtoWPListREST() {
        var url = _spPageContextInfo.webAbsoluteUrl + "/_api/web/lists(guid'" + exService.GetConfig("myHR Widget Preferences") + "')/items"
        jQuery.ajax({
            url: url,
            type: "POST",
            data: JSON.stringify({
                '__metadata': { 'type': 'SP.Data.WPListItem' },  ///_api/web/lists/getbytitle('Widget Preferences')/ListItemEntityTypeFullName
                'UserID': _spPageContextInfo.userLoginName,
                'Preferences': JSON.stringify(exService.getJSON())
            }),
            headers: {
                "accept": "application/json;odata=verbose",
                "content-type": "application/json;odata=verbose",
                "X-RequestDigest": $("#__REQUESTDIGEST").val()
            },
            success: function (d) {
                exService.myPreferences = exService.getJSON();
            },
            error: function (error) {
                CCI_Common.LogException(_spPageContextInfo.userLoginName, "CCI-myHR_WidgetPreferences.js--AddtoWPListREST", _spPageContextInfo.serverRequestPath, JSON.stringify(error));
            }
        });
    }

    //Update 'Widget Preferences' list
    function UpdateWPListREST(itemID) {
        var url = _spPageContextInfo.webAbsoluteUrl + "/_api/web/lists(guid'" + exService.GetConfig("myHR Widget Preferences") + "')/items(" + itemID + ")"
        jQuery.ajax({
            url: url,
            type: "POST",
            data: JSON.stringify({
                '__metadata': { 'type': 'SP.Data.WPListItem' },  ///_api/web/lists/getbytitle('Widget Preferences')/ListItemEntityTypeFullName
                'UserID': _spPageContextInfo.userLoginName,
                'Preferences': JSON.stringify(exService.getJSON())
            }),
            headers: {
                "accept": "application/json;odata=verbose",
                "content-type": "application/json;odata=verbose",
                "X-RequestDigest": $("#__REQUESTDIGEST").val(),
                "IF-MATCH": "*",
                "X-HTTP-Method":"MERGE"
            },
            success: function (data) {
                exService.myPreferences = exService.getJSON();
            },
            error: function (error) {
                CCI_Common.LogException(_spPageContextInfo.userLoginName, "CCI-myHR_WidgetPreferences.js--UpdateWPListREST", _spPageContextInfo.serverRequestPath, JSON.stringify(error));
            }
        });
    }

    //Get saved preferences from SPList
    function GetPreferences()
    {
        jQuery.ajax({
            url: _spPageContextInfo.webAbsoluteUrl + "/_api/web/lists(guid'" + exService.GetConfig("myHR Widget Preferences") + "')/items?$filter=UserID eq '" + _spPageContextInfo.userLoginName + "'",
            type: "GET",
            async: false,
            headers: {
                "accept": "application/json;odata=verbose",
            },
            success: function (data) {
                if (data.d.results.length == 1) {
                    exService.myPreferences = data.d.results[0].Preferences;
                    exService.listItemID = data.d.results[0].ID;
                }
                else {
                    $log.info("Check Preferences list for user - " + _spPageContextInfo.userLoginName);
                }
            },
            error: function (jqxr, errorCode, errorThrown) {
                CCI_Common.LogException(_spPageContextInfo.userLoginName, "CCI-myHR_WidgetPreferences.js--GetPreferences", _spPageContextInfo.serverRequestPath, jqxr.responseText);
            }
        });
    }
});

//Paycheck Quick View
appWP.controller('ctrlmyHRPayrollQuickView', function ($scope, exService) {

    function GetListItems() { 
        var requestUri = _spPageContextInfo.webAbsoluteUrl + "/_api/Web/Lists(guid'" + exService.GetConfig("myHR PQV") + "')/Items?";
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
                    //$scope.nextPayDay = exService.getNextPayDay();
                });
            },
            error: function (jqxr, errorCode, errorThrown) {
                CCI_Common.LogException(_spPageContextInfo.userLoginName, "CCI-myHR_WidgetPreferences.js--GetListItems", _spPageContextInfo.serverRequestPath, jqxr.responseText);
            }
        });
    }

    init();

    function init() {
        if (exService.getEmpID().startsWith("Error") ||  exService.getEmpID() == "") { //Contractor - No Employee ID
            $scope.displayPQV = false;
            $scope.NonEmpMessage = exService.GetConfig("PQV Non-Emp Message");

            /*//
            $scope.displayPQV = true;
            exService.getNextPayDay().then(
            function (nextPayDay) {
                $scope.nextPayDay = nextPayDay;
                GetListItems();
            });*/
        }
        else { //User with Emp ID
            $scope.displayPQV = true;
            exService.getNextPayDay().then(
            function (nextPayDay) {
                $scope.nextPayDay = nextPayDay;
                GetListItems();
            });
        }
    }
});

//IC Goals
appWP.controller('ctrlmyHRICGoals', function ($scope, $http, $location, exService) {
    
    $scope.displayICGoals = true;
    $scope.ICGoals = [];

    //Current Year
    $scope.CurrentYearICGoalsHeadings = [];
    $scope.CurrentYearICGoalsContent = [];
    $scope.CurrentYearH1 = false;
    $scope.CurrentYearH2 = false;
    $scope.CurrentYearEmpty = false;

    //Prior Year
    $scope.PriorYearICGoalsHeadings = [];
    $scope.PriorYearICGoalsContent = [];
    $scope.PriorYearH1 = false;
    $scope.PriorYearH2 = false;
    $scope.PriorYearEmpty = false;

    //Results
    //Prior Year
    $scope.ResultsICGoalsHeadings = [];
    $scope.ResultsICGoalsContent = [];
    $scope.ResultsH1 = false;
    $scope.ResultsH2 = false;
    $scope.ResultsEmpty = false;

    $scope.requestUri = exService.GetConfig("myHR ICG REST");

    $scope.ICGFAQs = function () {
        $location.path(_spPageContextInfo.siteAbsoluteUrl +  '/Pages/FAQ.aspx?Category=myHRDashboard');
    };

    $scope.safeApply = function (fn) {
        var phase = this.$root.$$phase;
        if (phase == '$apply' || phase == '$digest') {
            if (fn && (typeof (fn) === 'function')) {
                fn();
            }
        } else {
            this.$apply(fn);
        }
    };

    $scope.ICGoalCurrentYear = function () {
        $('.ICGoalPriorYearDetails').slideUp();
        $('.ICGoalResults').slideUp();
        $('.ICGoalCurrentYearDetails').slideToggle();
        $('.ICGoalsResultsEmpty').slideUp();
        $('.ICGoalsPriorYearEmpty').slideUp();
        $('.ICGoalsCurrentYearEmpty').slideToggle();

        GetICData(exService.GetConfig("myHR IC Current Year")).then(
            function (currentYearData) {
                //currentYearData = "{\"table1\":[{\"NAME\":\"John DoeC\",\"AS_OF_DATE\":\"2016-08-21T00:00:00\",\"EMPLID\":\"00101236\",\"VC_PLAN_ID\":\"CCIICPLAN\",\"VC_PAYOUT_PRD_ID\":\"2016\",\"PRD_BGN_DT\":\"2016-01-01T00:00:00\",\"PRD_END_DT\":\"2016-05-31T00:00:00\",\"DESCR\":\"CORP - SUPPLY CHAIN\",\"JOBCODE_DESCR\":\"Dir, Area Fulfillment Center\",\"CC_TARGET_PCT\":20.0,\"ANNUAL_RT\":128388.72},{\"NAME\":\"John Doe\",\"AS_OF_DATE\":\"2016-08-21T00:00:00\",\"EMPLID\":\"00101236\",\"VC_PLAN_ID\":\"CCIICPLAN\",\"VC_PAYOUT_PRD_ID\":\"2016\",\"PRD_BGN_DT\":\"2016-06-01T00:00:00\",\"PRD_END_DT\":\"2016-12-31T00:00:00\",\"DESCR\":\"CORP - SUPPLY CHAIN\",\"JOBCODE_DESCR\":\"Exec Dir, Regl Supply Chain Op\",\"CC_TARGET_PCT\":30.0,\"ANNUAL_RT\":161758.74}],\"table2\":[{\"NAME\":\"John Doe\",\"AS_OF_DATE\":\"2016-08-21T00:00:00\",\"EMPLID\":\"00101236\",\"VC_PLAN_ID\":\"CCIICPLAN\",\"VC_PAYOUT_PRD_ID\":\"2016\",\"PRD_BGN_DT\":\"2016-06-01T00:00:00\",\"PRD_END_DT\":\"2016-12-31T00:00:00\",\"DESCR\":\"CORP - SUPPLY CHAIN\",\"JOBCODE_DESCR\":\"Exec Dir, Regl Supply Chain Op\",\"CC_TARGET_PCT\":30.0,\"ANNUAL_RT\":161758.74,\"DESCR50\":\"CCI Consolidated Free Cash Flow (FCF)\",\"DESCR100\":\"Total Company: OCF + LTIP Exp - CapEx - LTIP Paymts +/- Chg in Work Captl - Cash Int - Cash Taxes\",\"VC_WEIGHT_PERCENT\":40.0},{\"NAME\":\"John Doe\",\"AS_OF_DATE\":\"2016-08-21T00:00:00\",\"EMPLID\":\"00101236\",\"VC_PLAN_ID\":\"CCIICPLAN\",\"VC_PAYOUT_PRD_ID\":\"2016\",\"PRD_BGN_DT\":\"2016-01-01T00:00:00\",\"PRD_END_DT\":\"2016-05-31T00:00:00\",\"DESCR\":\"CORP - SUPPLY CHAIN\",\"JOBCODE_DESCR\":\"Dir, Area Fulfillment Center\",\"CC_TARGET_PCT\":20.0,\"ANNUAL_RT\":128388.72,\"DESCR50\":\"CCI Consolidated Free Cash Flow (FCF)\",\"DESCR100\":\"Total Company: OCF + LTIP Exp - CapEx - LTIP Paymts +/- Chg in Work Captl - Cash Int - Cash Taxes\",\"VC_WEIGHT_PERCENT\":40.0},{\"NAME\":\"John Doe\",\"AS_OF_DATE\":\"2016-08-21T00:00:00\",\"EMPLID\":\"00101236\",\"VC_PLAN_ID\":\"CCIICPLAN\",\"VC_PAYOUT_PRD_ID\":\"2016\",\"PRD_BGN_DT\":\"2016-01-01T00:00:00\",\"PRD_END_DT\":\"2016-05-31T00:00:00\",\"DESCR\":\"CORP - SUPPLY CHAIN\",\"JOBCODE_DESCR\":\"Dir, Area Fulfillment Center\",\"CC_TARGET_PCT\":20.0,\"ANNUAL_RT\":128388.72,\"DESCR50\":\"CCI Consolidated Operating Cash Flow (OCF)\",\"DESCR100\":\"CCI Consolidated Annual Operating Cash Flow (OCF)\",\"VC_WEIGHT_PERCENT\":30.0},{\"NAME\":\"John Doe\",\"AS_OF_DATE\":\"2016-08-21T00:00:00\",\"EMPLID\":\"00101236\",\"VC_PLAN_ID\":\"CCIICPLAN\",\"VC_PAYOUT_PRD_ID\":\"2016\",\"PRD_BGN_DT\":\"2016-06-01T00:00:00\",\"PRD_END_DT\":\"2016-12-31T00:00:00\",\"DESCR\":\"CORP - SUPPLY CHAIN\",\"JOBCODE_DESCR\":\"Exec Dir, Regl Supply Chain Op\",\"CC_TARGET_PCT\":30.0,\"ANNUAL_RT\":161758.74,\"DESCR50\":\"CCI Consolidated Operating Cash Flow (OCF)\",\"DESCR100\":\"CCI Consolidated Annual Operating Cash Flow (OCF)\",\"VC_WEIGHT_PERCENT\":30.0},{\"NAME\":\"John Doe\",\"AS_OF_DATE\":\"2016-08-21T00:00:00\",\"EMPLID\":\"00101236\",\"VC_PLAN_ID\":\"CCIICPLAN\",\"VC_PAYOUT_PRD_ID\":\"2016\",\"PRD_BGN_DT\":\"2016-01-01T00:00:00\",\"PRD_END_DT\":\"2016-05-31T00:00:00\",\"DESCR\":\"CORP - SUPPLY CHAIN\",\"JOBCODE_DESCR\":\"Dir, Area Fulfillment Center\",\"CC_TARGET_PCT\":20.0,\"ANNUAL_RT\":128388.72,\"DESCR50\":\"MBO\",\"DESCR100\":\"Function Specific MBO\",\"VC_WEIGHT_PERCENT\":10.0},{\"NAME\":\"John Doe\",\"AS_OF_DATE\":\"2016-08-21T00:00:00\",\"EMPLID\":\"00101236\",\"VC_PLAN_ID\":\"CCIICPLAN\",\"VC_PAYOUT_PRD_ID\":\"2016\",\"PRD_BGN_DT\":\"2016-06-01T00:00:00\",\"PRD_END_DT\":\"2016-12-31T00:00:00\",\"DESCR\":\"CORP - SUPPLY CHAIN\",\"JOBCODE_DESCR\":\"Exec Dir, Regl Supply Chain Op\",\"CC_TARGET_PCT\":30.0,\"ANNUAL_RT\":161758.74,\"DESCR50\":\"CCI Consolidated Revenue / PSU Combination\",\"DESCR100\":\"CCI Consolidated Annual Revenue\",\"VC_WEIGHT_PERCENT\":10.0},{\"NAME\":\"John Doe\",\"AS_OF_DATE\":\"2016-08-21T00:00:00\",\"EMPLID\":\"00101236\",\"VC_PLAN_ID\":\"CCIICPLAN\",\"VC_PAYOUT_PRD_ID\":\"2016\",\"PRD_BGN_DT\":\"2016-06-01T00:00:00\",\"PRD_END_DT\":\"2016-12-31T00:00:00\",\"DESCR\":\"CORP - SUPPLY CHAIN\",\"JOBCODE_DESCR\":\"Exec Dir, Regl Supply Chain Op\",\"CC_TARGET_PCT\":30.0,\"ANNUAL_RT\":161758.74,\"DESCR50\":\"MBO\",\"DESCR100\":\"Function Specific MBO\",\"VC_WEIGHT_PERCENT\":10.0},{\"NAME\":\"John Doe\",\"AS_OF_DATE\":\"2016-08-21T00:00:00\",\"EMPLID\":\"00101236\",\"VC_PLAN_ID\":\"CCIICPLAN\",\"VC_PAYOUT_PRD_ID\":\"2016\",\"PRD_BGN_DT\":\"2016-06-01T00:00:00\",\"PRD_END_DT\":\"2016-12-31T00:00:00\",\"DESCR\":\"CORP - SUPPLY CHAIN\",\"JOBCODE_DESCR\":\"Exec Dir, Regl Supply Chain Op\",\"CC_TARGET_PCT\":30.0,\"ANNUAL_RT\":161758.74,\"DESCR50\":\"CCI Consolidated Brand NPS\",\"DESCR100\":\"CCI Consolidated Full-year Brand Net Promoter Score\",\"VC_WEIGHT_PERCENT\":10.0},{\"NAME\":\"John Doe\",\"AS_OF_DATE\":\"2016-08-21T00:00:00\",\"EMPLID\":\"00101236\",\"VC_PLAN_ID\":\"CCIICPLAN\",\"VC_PAYOUT_PRD_ID\":\"2016\",\"PRD_BGN_DT\":\"2016-01-01T00:00:00\",\"PRD_END_DT\":\"2016-05-31T00:00:00\",\"DESCR\":\"CORP - SUPPLY CHAIN\",\"JOBCODE_DESCR\":\"Dir, Area Fulfillment Center\",\"CC_TARGET_PCT\":20.0,\"ANNUAL_RT\":128388.72,\"DESCR50\":\"CCI Consolidated Brand NPS\",\"DESCR100\":\"CCI Consolidated Full-year Brand Net Promoter Score\",\"VC_WEIGHT_PERCENT\":10.0},{\"NAME\":\"John Doe\",\"AS_OF_DATE\":\"2016-08-21T00:00:00\",\"EMPLID\":\"00101236\",\"VC_PLAN_ID\":\"CCIICPLAN\",\"VC_PAYOUT_PRD_ID\":\"2016\",\"PRD_BGN_DT\":\"2016-01-01T00:00:00\",\"PRD_END_DT\":\"2016-05-31T00:00:00\",\"DESCR\":\"CORP - SUPPLY CHAIN\",\"JOBCODE_DESCR\":\"Dir, Area Fulfillment Center\",\"CC_TARGET_PCT\":20.0,\"ANNUAL_RT\":128388.72,\"DESCR50\":\"CCI Consolidated Revenue / PSU Combination\",\"DESCR100\":\"CCI Consolidated Annual Revenue\",\"VC_WEIGHT_PERCENT\":10.0}]}";
                if (currentYearData != "") {
                    $scope.safeApply(function () {
                        $scope.CurrentYearH1 = false;
                        $scope.CurrentYearH2 = false;
                        $scope.CurrentYearICGoalsHeadings = JSON.parse(currentYearData).table1;
                        $scope.CurrentYearICGoalsContent = JSON.parse(currentYearData).table2;
                        if (typeof ($scope.CurrentYearICGoalsHeadings[0]) != "undefined") {
                            $scope.CurrentYearH1 = true;
                            $scope.CurrentYearEmpty = false;
                        }
                        else {
                            $scope.CurrentYearEmpty = true;
                            $scope.NonEmpMessage = exService.GetConfig("IC Response Empty");
                        }

                        if (typeof ($scope.CurrentYearICGoalsHeadings[1]) != "undefined") {
                            $scope.CurrentYearH2 = true;
                        }
                    });
                }
                else {
                    $scope.CurrentYearH1 = false;
                    $scope.CurrentYearH2 = false;
                    $scope.CurrentYearEmpty = true;
                    $scope.NonEmpMessage = exService.GetConfig("IC Response Empty");
                }
            }
        );

        if (!exService.getEmpID().startsWith("Error") && exService.getEmpID() != "") {
            
        }
        else {
            //EMP ID is empty
            $scope.displayTable = false;

            /*//
            var currentYearData = "{\"table1\":[{\"NAME\":\"John DoeC\",\"AS_OF_DATE\":\"2016-08-21T00:00:00\",\"EMPLID\":\"00101236\",\"VC_PLAN_ID\":\"CCIICPLAN\",\"VC_PAYOUT_PRD_ID\":\"2016\",\"PRD_BGN_DT\":\"2016-01-01T00:00:00\",\"PRD_END_DT\":\"2016-05-31T00:00:00\",\"DESCR\":\"CORP - SUPPLY CHAIN\",\"JOBCODE_DESCR\":\"Dir, Area Fulfillment Center\",\"CC_TARGET_PCT\":20.0,\"ANNUAL_RT\":128388.72},{\"NAME\":\"John Doe\",\"AS_OF_DATE\":\"2016-08-21T00:00:00\",\"EMPLID\":\"00101236\",\"VC_PLAN_ID\":\"CCIICPLAN\",\"VC_PAYOUT_PRD_ID\":\"2016\",\"PRD_BGN_DT\":\"2016-06-01T00:00:00\",\"PRD_END_DT\":\"2016-12-31T00:00:00\",\"DESCR\":\"CORP - SUPPLY CHAIN\",\"JOBCODE_DESCR\":\"Exec Dir, Regl Supply Chain Op\",\"CC_TARGET_PCT\":30.0,\"ANNUAL_RT\":161758.74}],\"table2\":[{\"NAME\":\"John Doe\",\"AS_OF_DATE\":\"2016-08-21T00:00:00\",\"EMPLID\":\"00101236\",\"VC_PLAN_ID\":\"CCIICPLAN\",\"VC_PAYOUT_PRD_ID\":\"2016\",\"PRD_BGN_DT\":\"2016-06-01T00:00:00\",\"PRD_END_DT\":\"2016-12-31T00:00:00\",\"DESCR\":\"CORP - SUPPLY CHAIN\",\"JOBCODE_DESCR\":\"Exec Dir, Regl Supply Chain Op\",\"CC_TARGET_PCT\":30.0,\"ANNUAL_RT\":161758.74,\"DESCR50\":\"CCI Consolidated Free Cash Flow (FCF)\",\"DESCR100\":\"Total Company: OCF + LTIP Exp - CapEx - LTIP Paymts +/- Chg in Work Captl - Cash Int - Cash Taxes\",\"VC_WEIGHT_PERCENT\":40.0},{\"NAME\":\"John Doe\",\"AS_OF_DATE\":\"2016-08-21T00:00:00\",\"EMPLID\":\"00101236\",\"VC_PLAN_ID\":\"CCIICPLAN\",\"VC_PAYOUT_PRD_ID\":\"2016\",\"PRD_BGN_DT\":\"2016-01-01T00:00:00\",\"PRD_END_DT\":\"2016-05-31T00:00:00\",\"DESCR\":\"CORP - SUPPLY CHAIN\",\"JOBCODE_DESCR\":\"Dir, Area Fulfillment Center\",\"CC_TARGET_PCT\":20.0,\"ANNUAL_RT\":128388.72,\"DESCR50\":\"CCI Consolidated Free Cash Flow (FCF)\",\"DESCR100\":\"Total Company: OCF + LTIP Exp - CapEx - LTIP Paymts +/- Chg in Work Captl - Cash Int - Cash Taxes\",\"VC_WEIGHT_PERCENT\":40.0},{\"NAME\":\"John Doe\",\"AS_OF_DATE\":\"2016-08-21T00:00:00\",\"EMPLID\":\"00101236\",\"VC_PLAN_ID\":\"CCIICPLAN\",\"VC_PAYOUT_PRD_ID\":\"2016\",\"PRD_BGN_DT\":\"2016-01-01T00:00:00\",\"PRD_END_DT\":\"2016-05-31T00:00:00\",\"DESCR\":\"CORP - SUPPLY CHAIN\",\"JOBCODE_DESCR\":\"Dir, Area Fulfillment Center\",\"CC_TARGET_PCT\":20.0,\"ANNUAL_RT\":128388.72,\"DESCR50\":\"CCI Consolidated Operating Cash Flow (OCF)\",\"DESCR100\":\"CCI Consolidated Annual Operating Cash Flow (OCF)\",\"VC_WEIGHT_PERCENT\":30.0},{\"NAME\":\"John Doe\",\"AS_OF_DATE\":\"2016-08-21T00:00:00\",\"EMPLID\":\"00101236\",\"VC_PLAN_ID\":\"CCIICPLAN\",\"VC_PAYOUT_PRD_ID\":\"2016\",\"PRD_BGN_DT\":\"2016-06-01T00:00:00\",\"PRD_END_DT\":\"2016-12-31T00:00:00\",\"DESCR\":\"CORP - SUPPLY CHAIN\",\"JOBCODE_DESCR\":\"Exec Dir, Regl Supply Chain Op\",\"CC_TARGET_PCT\":30.0,\"ANNUAL_RT\":161758.74,\"DESCR50\":\"CCI Consolidated Operating Cash Flow (OCF)\",\"DESCR100\":\"CCI Consolidated Annual Operating Cash Flow (OCF)\",\"VC_WEIGHT_PERCENT\":30.0},{\"NAME\":\"John Doe\",\"AS_OF_DATE\":\"2016-08-21T00:00:00\",\"EMPLID\":\"00101236\",\"VC_PLAN_ID\":\"CCIICPLAN\",\"VC_PAYOUT_PRD_ID\":\"2016\",\"PRD_BGN_DT\":\"2016-01-01T00:00:00\",\"PRD_END_DT\":\"2016-05-31T00:00:00\",\"DESCR\":\"CORP - SUPPLY CHAIN\",\"JOBCODE_DESCR\":\"Dir, Area Fulfillment Center\",\"CC_TARGET_PCT\":20.0,\"ANNUAL_RT\":128388.72,\"DESCR50\":\"MBO\",\"DESCR100\":\"Function Specific MBO\",\"VC_WEIGHT_PERCENT\":10.0},{\"NAME\":\"John Doe\",\"AS_OF_DATE\":\"2016-08-21T00:00:00\",\"EMPLID\":\"00101236\",\"VC_PLAN_ID\":\"CCIICPLAN\",\"VC_PAYOUT_PRD_ID\":\"2016\",\"PRD_BGN_DT\":\"2016-06-01T00:00:00\",\"PRD_END_DT\":\"2016-12-31T00:00:00\",\"DESCR\":\"CORP - SUPPLY CHAIN\",\"JOBCODE_DESCR\":\"Exec Dir, Regl Supply Chain Op\",\"CC_TARGET_PCT\":30.0,\"ANNUAL_RT\":161758.74,\"DESCR50\":\"CCI Consolidated Revenue / PSU Combination\",\"DESCR100\":\"CCI Consolidated Annual Revenue\",\"VC_WEIGHT_PERCENT\":10.0},{\"NAME\":\"John Doe\",\"AS_OF_DATE\":\"2016-08-21T00:00:00\",\"EMPLID\":\"00101236\",\"VC_PLAN_ID\":\"CCIICPLAN\",\"VC_PAYOUT_PRD_ID\":\"2016\",\"PRD_BGN_DT\":\"2016-06-01T00:00:00\",\"PRD_END_DT\":\"2016-12-31T00:00:00\",\"DESCR\":\"CORP - SUPPLY CHAIN\",\"JOBCODE_DESCR\":\"Exec Dir, Regl Supply Chain Op\",\"CC_TARGET_PCT\":30.0,\"ANNUAL_RT\":161758.74,\"DESCR50\":\"MBO\",\"DESCR100\":\"Function Specific MBO\",\"VC_WEIGHT_PERCENT\":10.0},{\"NAME\":\"John Doe\",\"AS_OF_DATE\":\"2016-08-21T00:00:00\",\"EMPLID\":\"00101236\",\"VC_PLAN_ID\":\"CCIICPLAN\",\"VC_PAYOUT_PRD_ID\":\"2016\",\"PRD_BGN_DT\":\"2016-06-01T00:00:00\",\"PRD_END_DT\":\"2016-12-31T00:00:00\",\"DESCR\":\"CORP - SUPPLY CHAIN\",\"JOBCODE_DESCR\":\"Exec Dir, Regl Supply Chain Op\",\"CC_TARGET_PCT\":30.0,\"ANNUAL_RT\":161758.74,\"DESCR50\":\"CCI Consolidated Brand NPS\",\"DESCR100\":\"CCI Consolidated Full-year Brand Net Promoter Score\",\"VC_WEIGHT_PERCENT\":10.0},{\"NAME\":\"John Doe\",\"AS_OF_DATE\":\"2016-08-21T00:00:00\",\"EMPLID\":\"00101236\",\"VC_PLAN_ID\":\"CCIICPLAN\",\"VC_PAYOUT_PRD_ID\":\"2016\",\"PRD_BGN_DT\":\"2016-01-01T00:00:00\",\"PRD_END_DT\":\"2016-05-31T00:00:00\",\"DESCR\":\"CORP - SUPPLY CHAIN\",\"JOBCODE_DESCR\":\"Dir, Area Fulfillment Center\",\"CC_TARGET_PCT\":20.0,\"ANNUAL_RT\":128388.72,\"DESCR50\":\"CCI Consolidated Brand NPS\",\"DESCR100\":\"CCI Consolidated Full-year Brand Net Promoter Score\",\"VC_WEIGHT_PERCENT\":10.0},{\"NAME\":\"John Doe\",\"AS_OF_DATE\":\"2016-08-21T00:00:00\",\"EMPLID\":\"00101236\",\"VC_PLAN_ID\":\"CCIICPLAN\",\"VC_PAYOUT_PRD_ID\":\"2016\",\"PRD_BGN_DT\":\"2016-01-01T00:00:00\",\"PRD_END_DT\":\"2016-05-31T00:00:00\",\"DESCR\":\"CORP - SUPPLY CHAIN\",\"JOBCODE_DESCR\":\"Dir, Area Fulfillment Center\",\"CC_TARGET_PCT\":20.0,\"ANNUAL_RT\":128388.72,\"DESCR50\":\"CCI Consolidated Revenue / PSU Combination\",\"DESCR100\":\"CCI Consolidated Annual Revenue\",\"VC_WEIGHT_PERCENT\":10.0}]}";
            if (currentYearData != "") {
                $scope.safeApply(function () {
                    $scope.CurrentYearH1 = false;
                    $scope.CurrentYearH2 = false;
                    $scope.CurrentYearICGoalsHeadings = JSON.parse(currentYearData).table1;
                    $scope.CurrentYearICGoalsContent = JSON.parse(currentYearData).table2;
                    if (typeof ($scope.CurrentYearICGoalsHeadings[0]) != "undefined") {
                        $scope.CurrentYearH1 = true;
                    }

                    if (typeof ($scope.CurrentYearICGoalsHeadings[1]) != "undefined") {
                        $scope.CurrentYearH2 = true;
                    }
                });
            }*/
        }
    };

    //var currentYear = "{"table1":[{"NAME":"John Doe","AS_OF_DATE":"2016-08-21T00:00:00","EMPLID":"00101236","VC_PLAN_ID":"CCIICPLAN","VC_PAYOUT_PRD_ID":"2016","PRD_BGN_DT":"2016-01-01T00:00:00","PRD_END_DT":"2016-05-31T00:00:00","DESCR":"CORP - SUPPLY CHAIN","JOBCODE_DESCR":"Dir, Area Fulfillment Center","CC_TARGET_PCT":20.0,"ANNUAL_RT":128388.72},{"NAME":"John Doe","AS_OF_DATE":"2016-08-21T00:00:00","EMPLID":"00101236","VC_PLAN_ID":"CCIICPLAN","VC_PAYOUT_PRD_ID":"2016","PRD_BGN_DT":"2016-06-01T00:00:00","PRD_END_DT":"2016-12-31T00:00:00","DESCR":"CORP - SUPPLY CHAIN","JOBCODE_DESCR":"Exec Dir, Regl Supply Chain Op","CC_TARGET_PCT":30.0,"ANNUAL_RT":161758.74}],"table2":[{"NAME":"John Doe","AS_OF_DATE":"2016-08-21T00:00:00","EMPLID":"00101236","VC_PLAN_ID":"CCIICPLAN","VC_PAYOUT_PRD_ID":"2016","PRD_BGN_DT":"2016-06-01T00:00:00","PRD_END_DT":"2016-12-31T00:00:00","DESCR":"CORP - SUPPLY CHAIN","JOBCODE_DESCR":"Exec Dir, Regl Supply Chain Op","CC_TARGET_PCT":30.0,"ANNUAL_RT":161758.74,"DESCR50":"CCI Consolidated Free Cash Flow (FCF)","DESCR100":"Total Company: OCF + LTIP Exp - CapEx - LTIP Paymts +/- Chg in Work Captl - Cash Int - Cash Taxes","VC_WEIGHT_PERCENT":40.0},{"NAME":"John Doe","AS_OF_DATE":"2016-08-21T00:00:00","EMPLID":"00101236","VC_PLAN_ID":"CCIICPLAN","VC_PAYOUT_PRD_ID":"2016","PRD_BGN_DT":"2016-01-01T00:00:00","PRD_END_DT":"2016-05-31T00:00:00","DESCR":"CORP - SUPPLY CHAIN","JOBCODE_DESCR":"Dir, Area Fulfillment Center","CC_TARGET_PCT":20.0,"ANNUAL_RT":128388.72,"DESCR50":"CCI Consolidated Free Cash Flow (FCF)","DESCR100":"Total Company: OCF + LTIP Exp - CapEx - LTIP Paymts +/- Chg in Work Captl - Cash Int - Cash Taxes","VC_WEIGHT_PERCENT":40.0},{"NAME":"John Doe","AS_OF_DATE":"2016-08-21T00:00:00","EMPLID":"00101236","VC_PLAN_ID":"CCIICPLAN","VC_PAYOUT_PRD_ID":"2016","PRD_BGN_DT":"2016-01-01T00:00:00","PRD_END_DT":"2016-05-31T00:00:00","DESCR":"CORP - SUPPLY CHAIN","JOBCODE_DESCR":"Dir, Area Fulfillment Center","CC_TARGET_PCT":20.0,"ANNUAL_RT":128388.72,"DESCR50":"CCI Consolidated Operating Cash Flow (OCF)","DESCR100":"CCI Consolidated Annual Operating Cash Flow (OCF)","VC_WEIGHT_PERCENT":30.0},{"NAME":"John Doe","AS_OF_DATE":"2016-08-21T00:00:00","EMPLID":"00101236","VC_PLAN_ID":"CCIICPLAN","VC_PAYOUT_PRD_ID":"2016","PRD_BGN_DT":"2016-06-01T00:00:00","PRD_END_DT":"2016-12-31T00:00:00","DESCR":"CORP - SUPPLY CHAIN","JOBCODE_DESCR":"Exec Dir, Regl Supply Chain Op","CC_TARGET_PCT":30.0,"ANNUAL_RT":161758.74,"DESCR50":"CCI Consolidated Operating Cash Flow (OCF)","DESCR100":"CCI Consolidated Annual Operating Cash Flow (OCF)","VC_WEIGHT_PERCENT":30.0},{"NAME":"John Doe","AS_OF_DATE":"2016-08-21T00:00:00","EMPLID":"00101236","VC_PLAN_ID":"CCIICPLAN","VC_PAYOUT_PRD_ID":"2016","PRD_BGN_DT":"2016-01-01T00:00:00","PRD_END_DT":"2016-05-31T00:00:00","DESCR":"CORP - SUPPLY CHAIN","JOBCODE_DESCR":"Dir, Area Fulfillment Center","CC_TARGET_PCT":20.0,"ANNUAL_RT":128388.72,"DESCR50":"MBO","DESCR100":"Function Specific MBO","VC_WEIGHT_PERCENT":10.0},{"NAME":"John Doe","AS_OF_DATE":"2016-08-21T00:00:00","EMPLID":"00101236","VC_PLAN_ID":"CCIICPLAN","VC_PAYOUT_PRD_ID":"2016","PRD_BGN_DT":"2016-06-01T00:00:00","PRD_END_DT":"2016-12-31T00:00:00","DESCR":"CORP - SUPPLY CHAIN","JOBCODE_DESCR":"Exec Dir, Regl Supply Chain Op","CC_TARGET_PCT":30.0,"ANNUAL_RT":161758.74,"DESCR50":"CCI Consolidated Revenue / PSU Combination","DESCR100":"CCI Consolidated Annual Revenue","VC_WEIGHT_PERCENT":10.0},{"NAME":"John Doe","AS_OF_DATE":"2016-08-21T00:00:00","EMPLID":"00101236","VC_PLAN_ID":"CCIICPLAN","VC_PAYOUT_PRD_ID":"2016","PRD_BGN_DT":"2016-06-01T00:00:00","PRD_END_DT":"2016-12-31T00:00:00","DESCR":"CORP - SUPPLY CHAIN","JOBCODE_DESCR":"Exec Dir, Regl Supply Chain Op","CC_TARGET_PCT":30.0,"ANNUAL_RT":161758.74,"DESCR50":"MBO","DESCR100":"Function Specific MBO","VC_WEIGHT_PERCENT":10.0},{"NAME":"John Doe","AS_OF_DATE":"2016-08-21T00:00:00","EMPLID":"00101236","VC_PLAN_ID":"CCIICPLAN","VC_PAYOUT_PRD_ID":"2016","PRD_BGN_DT":"2016-06-01T00:00:00","PRD_END_DT":"2016-12-31T00:00:00","DESCR":"CORP - SUPPLY CHAIN","JOBCODE_DESCR":"Exec Dir, Regl Supply Chain Op","CC_TARGET_PCT":30.0,"ANNUAL_RT":161758.74,"DESCR50":"CCI Consolidated Brand NPS","DESCR100":"CCI Consolidated Full-year Brand Net Promoter Score","VC_WEIGHT_PERCENT":10.0},{"NAME":"John Doe","AS_OF_DATE":"2016-08-21T00:00:00","EMPLID":"00101236","VC_PLAN_ID":"CCIICPLAN","VC_PAYOUT_PRD_ID":"2016","PRD_BGN_DT":"2016-01-01T00:00:00","PRD_END_DT":"2016-05-31T00:00:00","DESCR":"CORP - SUPPLY CHAIN","JOBCODE_DESCR":"Dir, Area Fulfillment Center","CC_TARGET_PCT":20.0,"ANNUAL_RT":128388.72,"DESCR50":"CCI Consolidated Brand NPS","DESCR100":"CCI Consolidated Full-year Brand Net Promoter Score","VC_WEIGHT_PERCENT":10.0},{"NAME":"John Doe","AS_OF_DATE":"2016-08-21T00:00:00","EMPLID":"00101236","VC_PLAN_ID":"CCIICPLAN","VC_PAYOUT_PRD_ID":"2016","PRD_BGN_DT":"2016-01-01T00:00:00","PRD_END_DT":"2016-05-31T00:00:00","DESCR":"CORP - SUPPLY CHAIN","JOBCODE_DESCR":"Dir, Area Fulfillment Center","CC_TARGET_PCT":20.0,"ANNUAL_RT":128388.72,"DESCR50":"CCI Consolidated Revenue / PSU Combination","DESCR100":"CCI Consolidated Annual Revenue","VC_WEIGHT_PERCENT":10.0}]}"
    //var priorYear = "{"table1":[{"NAME":"John Doe","AS_OF_DATE":"2016-08-21T00:00:00","EMPLID":"00102846","VC_PLAN_ID":"CCIICPLAN","VC_PAYOUT_PRD_ID":"2016","PRD_BGN_DT":"2016-01-01T00:00:00","PRD_END_DT":"2016-12-31T00:00:00","DESCR":"CORP - MARKETING/SALES","JOBCODE_DESCR":"Sr Mgr,3rd Party Retail - Corp","CC_TARGET_PCT":15.0,"ANNUAL_RT":119888.0}],"table2":[{"NAME":"John Doe","AS_OF_DATE":"2016-08-21T00:00:00","EMPLID":"00102846","VC_PLAN_ID":"CCIICPLAN","VC_PAYOUT_PRD_ID":"2016","PRD_BGN_DT":"2016-01-01T00:00:00","PRD_END_DT":"2016-12-31T00:00:00","DESCR":"CORP - MARKETING/SALES","JOBCODE_DESCR":"Sr Mgr,3rd Party Retail - Corp","CC_TARGET_PCT":15.0,"ANNUAL_RT":119888.0,"DESCR50":"CCI Consolidated Free Cash Flow (FCF)","DESCR100":"Total Company: OCF + LTIP Exp - CapEx - LTIP Paymts +/- Chg in Work Captl - Cash Int - Cash Taxes","VC_WEIGHT_PERCENT":30.0},{"NAME":"John Doe","AS_OF_DATE":"2016-08-21T00:00:00","EMPLID":"00102846","VC_PLAN_ID":"CCIICPLAN","VC_PAYOUT_PRD_ID":"2016","PRD_BGN_DT":"2016-01-01T00:00:00","PRD_END_DT":"2016-12-31T00:00:00","DESCR":"CORP - MARKETING/SALES","JOBCODE_DESCR":"Sr Mgr,3rd Party Retail - Corp","CC_TARGET_PCT":15.0,"ANNUAL_RT":119888.0,"DESCR50":"CCI Consolidated Operating Cash Flow (OCF)","DESCR100":"CCI Consolidated Annual Operating Cash Flow (OCF)","VC_WEIGHT_PERCENT":20.0},{"NAME":"John Doe","AS_OF_DATE":"2016-08-21T00:00:00","EMPLID":"00102846","VC_PLAN_ID":"CCIICPLAN","VC_PAYOUT_PRD_ID":"2016","PRD_BGN_DT":"2016-01-01T00:00:00","PRD_END_DT":"2016-12-31T00:00:00","DESCR":"CORP - MARKETING/SALES","JOBCODE_DESCR":"Sr Mgr,3rd Party Retail - Corp","CC_TARGET_PCT":15.0,"ANNUAL_RT":119888.0,"DESCR50":"Cox Residential Consolidated Revenue","DESCR100":"Cox Residential Consolidated Annual Revenue","VC_WEIGHT_PERCENT":20.0},{"NAME":"John Doe","AS_OF_DATE":"2016-08-21T00:00:00","EMPLID":"00102846","VC_PLAN_ID":"CCIICPLAN","VC_PAYOUT_PRD_ID":"2016","PRD_BGN_DT":"2016-01-01T00:00:00","PRD_END_DT":"2016-12-31T00:00:00","DESCR":"CORP - MARKETING/SALES","JOBCODE_DESCR":"Sr Mgr,3rd Party Retail - Corp","CC_TARGET_PCT":15.0,"ANNUAL_RT":119888.0,"DESCR50":"Cox Residential Consolidated PSUs","DESCR100":"Cox Residential Consolidated Annual PSU","VC_WEIGHT_PERCENT":20.0},{"NAME":"John Doe","AS_OF_DATE":"2016-08-21T00:00:00","EMPLID":"00102846","VC_PLAN_ID":"CCIICPLAN","VC_PAYOUT_PRD_ID":"2016","PRD_BGN_DT":"2016-01-01T00:00:00","PRD_END_DT":"2016-12-31T00:00:00","DESCR":"CORP - MARKETING/SALES","JOBCODE_DESCR":"Sr Mgr,3rd Party Retail - Corp","CC_TARGET_PCT":15.0,"ANNUAL_RT":119888.0,"DESCR50":"MBO","DESCR100":"Function Specific MBO","VC_WEIGHT_PERCENT":10.0}]}";
    //var results = "{"table1":[{"NAME":"John Doe","AS_OF_DATE":"2016-08-21T00:00:00","EMPLID":"00102846","VC_PLAN_ID":"CCIICPLAN","VC_PAYOUT_PRD_ID":"2016","PRD_BGN_DT":"2016-01-01T00:00:00","PRD_END_DT":"2016-12-31T00:00:00","DESCR":"CORP - MARKETING/SALES","JOBCODE_DESCR":"Sr Mgr,3rd Party Retail - Corp","CC_TARGET_PCT":15.0,"ANNUAL_RT":119888.0,"VC_AWARD_VALUE":17983.20,"VC_PERF_FACTOR":100.0,"PRORATE_FACTOR":1.0,"VC_CALC_AWARD":17983.20}],"table2":[{"NAME":"John Doe","AS_OF_DATE":"2016-08-21T00:00:00","EMPLID":"00102846","VC_PLAN_ID":"CCIICPLAN","VC_PAYOUT_PRD_ID":"2016","PRD_BGN_DT":"2016-01-01T00:00:00","PRD_END_DT":"2016-12-31T00:00:00","DESCR":"CORP - MARKETING/SALES","JOBCODE_DESCR":"Sr Mgr,3rd Party Retail - Corp","CC_TARGET_PCT":15.0,"ANNUAL_RT":119888.0,"DESCR50":"CCI Consolidated Free Cash Flow (FCF)","DESCR100":"Total Company: OCF + LTIP Exp - CapEx - LTIP Paymts +/- Chg in Work Captl - Cash Int - Cash Taxes","VC_WEIGHT_PERCENT":30.0,"VC_AWARD_VALUE":17983.20,"VC_PCT_ATTAINED":100.0,"CC_WEIGHTED_RESULT":30.0},{"NAME":"John Doe","AS_OF_DATE":"2016-08-21T00:00:00","EMPLID":"00102846","VC_PLAN_ID":"CCIICPLAN","VC_PAYOUT_PRD_ID":"2016","PRD_BGN_DT":"2016-01-01T00:00:00","PRD_END_DT":"2016-12-31T00:00:00","DESCR":"CORP - MARKETING/SALES","JOBCODE_DESCR":"Sr Mgr,3rd Party Retail - Corp","CC_TARGET_PCT":15.0,"ANNUAL_RT":119888.0,"DESCR50":"CCI Consolidated Operating Cash Flow (OCF)","DESCR100":"CCI Consolidated Annual Operating Cash Flow (OCF)","VC_WEIGHT_PERCENT":20.0,"VC_AWARD_VALUE":17983.20,"VC_PCT_ATTAINED":100.0,"CC_WEIGHTED_RESULT":20.0},{"NAME":"John Doe","AS_OF_DATE":"2016-08-21T00:00:00","EMPLID":"00102846","VC_PLAN_ID":"CCIICPLAN","VC_PAYOUT_PRD_ID":"2016","PRD_BGN_DT":"2016-01-01T00:00:00","PRD_END_DT":"2016-12-31T00:00:00","DESCR":"CORP - MARKETING/SALES","JOBCODE_DESCR":"Sr Mgr,3rd Party Retail - Corp","CC_TARGET_PCT":15.0,"ANNUAL_RT":119888.0,"DESCR50":"Cox Residential Consolidated Revenue","DESCR100":"Cox Residential Consolidated Annual Revenue","VC_WEIGHT_PERCENT":20.0,"VC_AWARD_VALUE":17983.20,"VC_PCT_ATTAINED":100.0,"CC_WEIGHTED_RESULT":20.0},{"NAME":"John Doe","AS_OF_DATE":"2016-08-21T00:00:00","EMPLID":"00102846","VC_PLAN_ID":"CCIICPLAN","VC_PAYOUT_PRD_ID":"2016","PRD_BGN_DT":"2016-01-01T00:00:00","PRD_END_DT":"2016-12-31T00:00:00","DESCR":"CORP - MARKETING/SALES","JOBCODE_DESCR":"Sr Mgr,3rd Party Retail - Corp","CC_TARGET_PCT":15.0,"ANNUAL_RT":119888.0,"DESCR50":"Cox Residential Consolidated PSUs","DESCR100":"Cox Residential Consolidated Annual PSU","VC_WEIGHT_PERCENT":20.0,"VC_AWARD_VALUE":17983.20,"VC_PCT_ATTAINED":100.0,"CC_WEIGHTED_RESULT":20.0},{"NAME":"John Doe","AS_OF_DATE":"2016-08-21T00:00:00","EMPLID":"00102846","VC_PLAN_ID":"CCIICPLAN","VC_PAYOUT_PRD_ID":"2016","PRD_BGN_DT":"2016-01-01T00:00:00","PRD_END_DT":"2016-12-31T00:00:00","DESCR":"CORP - MARKETING/SALES","JOBCODE_DESCR":"Sr Mgr,3rd Party Retail - Corp","CC_TARGET_PCT":15.0,"ANNUAL_RT":119888.0,"DESCR50":"MBO","DESCR100":"Function Specific MBO","VC_WEIGHT_PERCENT":10.0,"VC_AWARD_VALUE":17983.20,"VC_PCT_ATTAINED":100.0,"CC_WEIGHTED_RESULT":10.0}]}";

    $scope.ICGoalPriorYear = function () {
        $('.ICGoalPriorYearDetails').slideToggle();
        $('.ICGoalResults').slideUp();
        $('.ICGoalCurrentYearDetails').slideUp();
        $('.ICGoalsResultsEmpty').slideUp();
        $('.ICGoalsPriorYearEmpty').slideToggle();
        $('.ICGoalsCurrentYearEmpty').slideUp();

        GetICData(exService.GetConfig("myHR IC Prior Year")).then(
            function (priorYearData) {
                //priorYearData = "{\"table1\":[{\"NAME\":\"John DoeP\",\"AS_OF_DATE\":\"2016-08-21T00:00:00\",\"EMPLID\":\"00102846\",\"VC_PLAN_ID\":\"CCIICPLAN\",\"VC_PAYOUT_PRD_ID\":\"2016\",\"PRD_BGN_DT\":\"2016-01-01T00:00:00\",\"PRD_END_DT\":\"2016-12-31T00:00:00\",\"DESCR\":\"CORP - MARKETING/SALES\",\"JOBCODE_DESCR\":\"Sr Mgr,3rd Party Retail - Corp\",\"CC_TARGET_PCT\":15.0,\"ANNUAL_RT\":119888.0}],\"table2\":[{\"NAME\":\"John Doe\",\"AS_OF_DATE\":\"2016-08-21T00:00:00\",\"EMPLID\":\"00102846\",\"VC_PLAN_ID\":\"CCIICPLAN\",\"VC_PAYOUT_PRD_ID\":\"2016\",\"PRD_BGN_DT\":\"2016-01-01T00:00:00\",\"PRD_END_DT\":\"2016-12-31T00:00:00\",\"DESCR\":\"CORP - MARKETING/SALES\",\"JOBCODE_DESCR\":\"Sr Mgr,3rd Party Retail - Corp\",\"CC_TARGET_PCT\":15.0,\"ANNUAL_RT\":119888.0,\"DESCR50\":\"CCI Consolidated Free Cash Flow (FCF)\",\"DESCR100\":\"Total Company: OCF + LTIP Exp - CapEx - LTIP Paymts +/- Chg in Work Captl - Cash Int - Cash Taxes\",\"VC_WEIGHT_PERCENT\":30.0},{\"NAME\":\"John Doe\",\"AS_OF_DATE\":\"2016-08-21T00:00:00\",\"EMPLID\":\"00102846\",\"VC_PLAN_ID\":\"CCIICPLAN\",\"VC_PAYOUT_PRD_ID\":\"2016\",\"PRD_BGN_DT\":\"2016-01-01T00:00:00\",\"PRD_END_DT\":\"2016-12-31T00:00:00\",\"DESCR\":\"CORP - MARKETING/SALES\",\"JOBCODE_DESCR\":\"Sr Mgr,3rd Party Retail - Corp\",\"CC_TARGET_PCT\":15.0,\"ANNUAL_RT\":119888.0,\"DESCR50\":\"CCI Consolidated Operating Cash Flow (OCF)\",\"DESCR100\":\"CCI Consolidated Annual Operating Cash Flow (OCF)\",\"VC_WEIGHT_PERCENT\":20.0},{\"NAME\":\"John Doe\",\"AS_OF_DATE\":\"2016-08-21T00:00:00\",\"EMPLID\":\"00102846\",\"VC_PLAN_ID\":\"CCIICPLAN\",\"VC_PAYOUT_PRD_ID\":\"2016\",\"PRD_BGN_DT\":\"2016-01-01T00:00:00\",\"PRD_END_DT\":\"2016-12-31T00:00:00\",\"DESCR\":\"CORP - MARKETING/SALES\",\"JOBCODE_DESCR\":\"Sr Mgr,3rd Party Retail - Corp\",\"CC_TARGET_PCT\":15.0,\"ANNUAL_RT\":119888.0,\"DESCR50\":\"Cox Residential Consolidated Revenue\",\"DESCR100\":\"Cox Residential Consolidated Annual Revenue\",\"VC_WEIGHT_PERCENT\":20.0},{\"NAME\":\"John Doe\",\"AS_OF_DATE\":\"2016-08-21T00:00:00\",\"EMPLID\":\"00102846\",\"VC_PLAN_ID\":\"CCIICPLAN\",\"VC_PAYOUT_PRD_ID\":\"2016\",\"PRD_BGN_DT\":\"2016-01-01T00:00:00\",\"PRD_END_DT\":\"2016-12-31T00:00:00\",\"DESCR\":\"CORP - MARKETING/SALES\",\"JOBCODE_DESCR\":\"Sr Mgr,3rd Party Retail - Corp\",\"CC_TARGET_PCT\":15.0,\"ANNUAL_RT\":119888.0,\"DESCR50\":\"Cox Residential Consolidated PSUs\",\"DESCR100\":\"Cox Residential Consolidated Annual PSU\",\"VC_WEIGHT_PERCENT\":20.0},{\"NAME\":\"John Doe\",\"AS_OF_DATE\":\"2016-08-21T00:00:00\",\"EMPLID\":\"00102846\",\"VC_PLAN_ID\":\"CCIICPLAN\",\"VC_PAYOUT_PRD_ID\":\"2016\",\"PRD_BGN_DT\":\"2016-01-01T00:00:00\",\"PRD_END_DT\":\"2016-12-31T00:00:00\",\"DESCR\":\"CORP - MARKETING/SALES\",\"JOBCODE_DESCR\":\"Sr Mgr,3rd Party Retail - Corp\",\"CC_TARGET_PCT\":15.0,\"ANNUAL_RT\":119888.0,\"DESCR50\":\"MBO\",\"DESCR100\":\"Function Specific MBO\",\"VC_WEIGHT_PERCENT\":10.0}]}";
                if (priorYearData != "") {
                    $scope.safeApply(function () {
                        $scope.PriorYearH1 = false;
                        $scope.PriorYearH2 = false;
                        $scope.PriorYearICGoalsHeadings = JSON.parse(priorYearData).table1;
                        $scope.PriorYearICGoalsContent = JSON.parse(priorYearData).table2;
                        if (typeof ($scope.PriorYearICGoalsHeadings[0]) != "undefined") {
                            $scope.PriorYearH1 = true;
                        }
                        else {
                            $scope.PriorYearEmpty = true;
                            $scope.NonEmpMessage = exService.GetConfig("IC Response Empty");
                        }

                        if (typeof ($scope.PriorYearICGoalsHeadings[1]) != "undefined") {
                            $scope.PriorYearH2 = true;
                        }
                    });
                }
                else {
                    $scope.PriorYearH1 = false;
                    $scope.PriorYearH2 = false;
                    $scope.PriorYearEmpty = true;
                    $scope.NonEmpMessage = exService.GetConfig("IC Response Empty");
                }
            }
            );

        if (!exService.getEmpID().startsWith("Error") && exService.getEmpID() != "") {
            
        }
        else {
            //EMP ID is empty
            $scope.displayTable = false;

            /*//
            var priorYearData = "{\"table1\":[{\"NAME\":\"John DoeP\",\"AS_OF_DATE\":\"2016-08-21T00:00:00\",\"EMPLID\":\"00102846\",\"VC_PLAN_ID\":\"CCIICPLAN\",\"VC_PAYOUT_PRD_ID\":\"2016\",\"PRD_BGN_DT\":\"2016-01-01T00:00:00\",\"PRD_END_DT\":\"2016-12-31T00:00:00\",\"DESCR\":\"CORP - MARKETING/SALES\",\"JOBCODE_DESCR\":\"Sr Mgr,3rd Party Retail - Corp\",\"CC_TARGET_PCT\":15.0,\"ANNUAL_RT\":119888.0}],\"table2\":[{\"NAME\":\"John Doe\",\"AS_OF_DATE\":\"2016-08-21T00:00:00\",\"EMPLID\":\"00102846\",\"VC_PLAN_ID\":\"CCIICPLAN\",\"VC_PAYOUT_PRD_ID\":\"2016\",\"PRD_BGN_DT\":\"2016-01-01T00:00:00\",\"PRD_END_DT\":\"2016-12-31T00:00:00\",\"DESCR\":\"CORP - MARKETING/SALES\",\"JOBCODE_DESCR\":\"Sr Mgr,3rd Party Retail - Corp\",\"CC_TARGET_PCT\":15.0,\"ANNUAL_RT\":119888.0,\"DESCR50\":\"CCI Consolidated Free Cash Flow (FCF)\",\"DESCR100\":\"Total Company: OCF + LTIP Exp - CapEx - LTIP Paymts +/- Chg in Work Captl - Cash Int - Cash Taxes\",\"VC_WEIGHT_PERCENT\":30.0},{\"NAME\":\"John Doe\",\"AS_OF_DATE\":\"2016-08-21T00:00:00\",\"EMPLID\":\"00102846\",\"VC_PLAN_ID\":\"CCIICPLAN\",\"VC_PAYOUT_PRD_ID\":\"2016\",\"PRD_BGN_DT\":\"2016-01-01T00:00:00\",\"PRD_END_DT\":\"2016-12-31T00:00:00\",\"DESCR\":\"CORP - MARKETING/SALES\",\"JOBCODE_DESCR\":\"Sr Mgr,3rd Party Retail - Corp\",\"CC_TARGET_PCT\":15.0,\"ANNUAL_RT\":119888.0,\"DESCR50\":\"CCI Consolidated Operating Cash Flow (OCF)\",\"DESCR100\":\"CCI Consolidated Annual Operating Cash Flow (OCF)\",\"VC_WEIGHT_PERCENT\":20.0},{\"NAME\":\"John Doe\",\"AS_OF_DATE\":\"2016-08-21T00:00:00\",\"EMPLID\":\"00102846\",\"VC_PLAN_ID\":\"CCIICPLAN\",\"VC_PAYOUT_PRD_ID\":\"2016\",\"PRD_BGN_DT\":\"2016-01-01T00:00:00\",\"PRD_END_DT\":\"2016-12-31T00:00:00\",\"DESCR\":\"CORP - MARKETING/SALES\",\"JOBCODE_DESCR\":\"Sr Mgr,3rd Party Retail - Corp\",\"CC_TARGET_PCT\":15.0,\"ANNUAL_RT\":119888.0,\"DESCR50\":\"Cox Residential Consolidated Revenue\",\"DESCR100\":\"Cox Residential Consolidated Annual Revenue\",\"VC_WEIGHT_PERCENT\":20.0},{\"NAME\":\"John Doe\",\"AS_OF_DATE\":\"2016-08-21T00:00:00\",\"EMPLID\":\"00102846\",\"VC_PLAN_ID\":\"CCIICPLAN\",\"VC_PAYOUT_PRD_ID\":\"2016\",\"PRD_BGN_DT\":\"2016-01-01T00:00:00\",\"PRD_END_DT\":\"2016-12-31T00:00:00\",\"DESCR\":\"CORP - MARKETING/SALES\",\"JOBCODE_DESCR\":\"Sr Mgr,3rd Party Retail - Corp\",\"CC_TARGET_PCT\":15.0,\"ANNUAL_RT\":119888.0,\"DESCR50\":\"Cox Residential Consolidated PSUs\",\"DESCR100\":\"Cox Residential Consolidated Annual PSU\",\"VC_WEIGHT_PERCENT\":20.0},{\"NAME\":\"John Doe\",\"AS_OF_DATE\":\"2016-08-21T00:00:00\",\"EMPLID\":\"00102846\",\"VC_PLAN_ID\":\"CCIICPLAN\",\"VC_PAYOUT_PRD_ID\":\"2016\",\"PRD_BGN_DT\":\"2016-01-01T00:00:00\",\"PRD_END_DT\":\"2016-12-31T00:00:00\",\"DESCR\":\"CORP - MARKETING/SALES\",\"JOBCODE_DESCR\":\"Sr Mgr,3rd Party Retail - Corp\",\"CC_TARGET_PCT\":15.0,\"ANNUAL_RT\":119888.0,\"DESCR50\":\"MBO\",\"DESCR100\":\"Function Specific MBO\",\"VC_WEIGHT_PERCENT\":10.0}]}";
            if (priorYearData != "") {
                $scope.safeApply(function () {
                    $scope.PriorYearH1 = false;
                    $scope.PriorYearH2 = false;
                    $scope.PriorYearICGoalsHeadings = JSON.parse(priorYearData).table1;
                    $scope.PriorYearICGoalsContent = JSON.parse(priorYearData).table2;
                    if (typeof ($scope.PriorYearICGoalsHeadings[0]) != "undefined") {
                        $scope.PriorYearH1 = true;
                    }

                    if (typeof ($scope.PriorYearICGoalsHeadings[1]) != "undefined") {
                        $scope.PriorYearH2 = true;
                    }
                });
            }*/
        }
        
    }

    //Executes on click on 'Results'
    $scope.ICGoalResults = function () {
        $('.ICGoalPriorYearDetails').slideUp();
        $('.ICGoalResults').slideToggle();
        $('.ICGoalCurrentYearDetails').slideUp();
        $('.ICGoalsResultsEmpty').slideToggle();
        $('.ICGoalsPriorYearEmpty').slideUp();
        $('.ICGoalsCurrentYearEmpty').slideUp();

        GetICData(exService.GetConfig("myHR IC Results")).then(
            function (resultsData) {
                //priorYearData = "{\"table1\":[{\"NAME\":\"John DoeP\",\"AS_OF_DATE\":\"2016-08-21T00:00:00\",\"EMPLID\":\"00102846\",\"VC_PLAN_ID\":\"CCIICPLAN\",\"VC_PAYOUT_PRD_ID\":\"2016\",\"PRD_BGN_DT\":\"2016-01-01T00:00:00\",\"PRD_END_DT\":\"2016-12-31T00:00:00\",\"DESCR\":\"CORP - MARKETING/SALES\",\"JOBCODE_DESCR\":\"Sr Mgr,3rd Party Retail - Corp\",\"CC_TARGET_PCT\":15.0,\"ANNUAL_RT\":119888.0}],\"table2\":[{\"NAME\":\"John Doe\",\"AS_OF_DATE\":\"2016-08-21T00:00:00\",\"EMPLID\":\"00102846\",\"VC_PLAN_ID\":\"CCIICPLAN\",\"VC_PAYOUT_PRD_ID\":\"2016\",\"PRD_BGN_DT\":\"2016-01-01T00:00:00\",\"PRD_END_DT\":\"2016-12-31T00:00:00\",\"DESCR\":\"CORP - MARKETING/SALES\",\"JOBCODE_DESCR\":\"Sr Mgr,3rd Party Retail - Corp\",\"CC_TARGET_PCT\":15.0,\"ANNUAL_RT\":119888.0,\"DESCR50\":\"CCI Consolidated Free Cash Flow (FCF)\",\"DESCR100\":\"Total Company: OCF + LTIP Exp - CapEx - LTIP Paymts +/- Chg in Work Captl - Cash Int - Cash Taxes\",\"VC_WEIGHT_PERCENT\":30.0},{\"NAME\":\"John Doe\",\"AS_OF_DATE\":\"2016-08-21T00:00:00\",\"EMPLID\":\"00102846\",\"VC_PLAN_ID\":\"CCIICPLAN\",\"VC_PAYOUT_PRD_ID\":\"2016\",\"PRD_BGN_DT\":\"2016-01-01T00:00:00\",\"PRD_END_DT\":\"2016-12-31T00:00:00\",\"DESCR\":\"CORP - MARKETING/SALES\",\"JOBCODE_DESCR\":\"Sr Mgr,3rd Party Retail - Corp\",\"CC_TARGET_PCT\":15.0,\"ANNUAL_RT\":119888.0,\"DESCR50\":\"CCI Consolidated Operating Cash Flow (OCF)\",\"DESCR100\":\"CCI Consolidated Annual Operating Cash Flow (OCF)\",\"VC_WEIGHT_PERCENT\":20.0},{\"NAME\":\"John Doe\",\"AS_OF_DATE\":\"2016-08-21T00:00:00\",\"EMPLID\":\"00102846\",\"VC_PLAN_ID\":\"CCIICPLAN\",\"VC_PAYOUT_PRD_ID\":\"2016\",\"PRD_BGN_DT\":\"2016-01-01T00:00:00\",\"PRD_END_DT\":\"2016-12-31T00:00:00\",\"DESCR\":\"CORP - MARKETING/SALES\",\"JOBCODE_DESCR\":\"Sr Mgr,3rd Party Retail - Corp\",\"CC_TARGET_PCT\":15.0,\"ANNUAL_RT\":119888.0,\"DESCR50\":\"Cox Residential Consolidated Revenue\",\"DESCR100\":\"Cox Residential Consolidated Annual Revenue\",\"VC_WEIGHT_PERCENT\":20.0},{\"NAME\":\"John Doe\",\"AS_OF_DATE\":\"2016-08-21T00:00:00\",\"EMPLID\":\"00102846\",\"VC_PLAN_ID\":\"CCIICPLAN\",\"VC_PAYOUT_PRD_ID\":\"2016\",\"PRD_BGN_DT\":\"2016-01-01T00:00:00\",\"PRD_END_DT\":\"2016-12-31T00:00:00\",\"DESCR\":\"CORP - MARKETING/SALES\",\"JOBCODE_DESCR\":\"Sr Mgr,3rd Party Retail - Corp\",\"CC_TARGET_PCT\":15.0,\"ANNUAL_RT\":119888.0,\"DESCR50\":\"Cox Residential Consolidated PSUs\",\"DESCR100\":\"Cox Residential Consolidated Annual PSU\",\"VC_WEIGHT_PERCENT\":20.0},{\"NAME\":\"John Doe\",\"AS_OF_DATE\":\"2016-08-21T00:00:00\",\"EMPLID\":\"00102846\",\"VC_PLAN_ID\":\"CCIICPLAN\",\"VC_PAYOUT_PRD_ID\":\"2016\",\"PRD_BGN_DT\":\"2016-01-01T00:00:00\",\"PRD_END_DT\":\"2016-12-31T00:00:00\",\"DESCR\":\"CORP - MARKETING/SALES\",\"JOBCODE_DESCR\":\"Sr Mgr,3rd Party Retail - Corp\",\"CC_TARGET_PCT\":15.0,\"ANNUAL_RT\":119888.0,\"DESCR50\":\"MBO\",\"DESCR100\":\"Function Specific MBO\",\"VC_WEIGHT_PERCENT\":10.0}]}";
                if (resultsData != "") {
                    $scope.safeApply(function () {
                        $scope.ResultsH1 = false;
                        $scope.ResultsH2 = false;
                        $scope.ResultsICGoalsHeadings = JSON.parse(resultsData).table1;
                        $scope.ResultsICGoalsContent = JSON.parse(resultsData).table2;
                        if (typeof ($scope.ResultsICGoalsHeadings[0]) != "undefined") {
                            $scope.ResultsH1 = true;
                        }
                        else {
                            $scope.ResultsEmpty = true;
                            $scope.NonEmpMessage = exService.GetConfig("IC Response Empty");
                        }

                        if (typeof ($scope.ResultsICGoalsHeadings[1]) != "undefined") {
                            $scope.ResultsH2 = true;
                        }
                    });
                }
                else {
                    $scope.ResultsH1 = false;
                    $scope.ResultsH2 = false;
                    $scope.ResultsEmpty = true;
                    $scope.NonEmpMessage = exService.GetConfig("IC Response Empty");
                }

            }
        );

        if (!exService.getEmpID().startsWith("Error") && exService.getEmpID() != "") { //Employee
            
        }
        else {
            //EMP ID is empty
            $scope.displayTable = false;

           /* //

            var resultsData = "{\"table1\":[{\"NAME\":\"John Doe\",\"AS_OF_DATE\":\"2016-08-21T00:00:00\",\"EMPLID\":\"00102846\",\"VC_PLAN_ID\":\"CCIICPLAN\",\"VC_PAYOUT_PRD_ID\":\"2016\",\"PRD_BGN_DT\":\"2016-01-01T00:00:00\",\"PRD_END_DT\":\"2016-12-31T00:00:00\",\"DESCR\":\"CORP - MARKETING/SALES\",\"JOBCODE_DESCR\":\"Sr Mgr,3rd Party Retail - Corp\",\"CC_TARGET_PCT\":15.0,\"ANNUAL_RT\":119888.0,\"VC_AWARD_VALUE\":17983.20,\"VC_PERF_FACTOR\":100.0,\"PRORATE_FACTOR\":1.0,\"VC_CALC_AWARD\":17983.20}],\"table2\":[{\"NAME\":\"John Doe\",\"AS_OF_DATE\":\"2016-08-21T00:00:00\",\"EMPLID\":\"00102846\",\"VC_PLAN_ID\":\"CCIICPLAN\",\"VC_PAYOUT_PRD_ID\":\"2016\",\"PRD_BGN_DT\":\"2016-01-01T00:00:00\",\"PRD_END_DT\":\"2016-12-31T00:00:00\",\"DESCR\":\"CORP - MARKETING/SALES\",\"JOBCODE_DESCR\":\"Sr Mgr,3rd Party Retail - Corp\",\"CC_TARGET_PCT\":15.0,\"ANNUAL_RT\":119888.0,\"DESCR50\":\"CCI Consolidated Free Cash Flow (FCF)\",\"DESCR100\":\"Total Company: OCF + LTIP Exp - CapEx - LTIP Paymts +/- Chg in Work Captl - Cash Int - Cash Taxes\",\"VC_WEIGHT_PERCENT\":30.0,\"VC_AWARD_VALUE\":17983.20,\"VC_PCT_ATTAINED\":100.0,\"CC_WEIGHTED_RESULT\":30.0},{\"NAME\":\"John Doe\",\"AS_OF_DATE\":\"2016-08-21T00:00:00\",\"EMPLID\":\"00102846\",\"VC_PLAN_ID\":\"CCIICPLAN\",\"VC_PAYOUT_PRD_ID\":\"2016\",\"PRD_BGN_DT\":\"2016-01-01T00:00:00\",\"PRD_END_DT\":\"2016-12-31T00:00:00\",\"DESCR\":\"CORP - MARKETING/SALES\",\"JOBCODE_DESCR\":\"Sr Mgr,3rd Party Retail - Corp\",\"CC_TARGET_PCT\":15.0,\"ANNUAL_RT\":119888.0,\"DESCR50\":\"CCI Consolidated Operating Cash Flow (OCF)\",\"DESCR100\":\"CCI Consolidated Annual Operating Cash Flow (OCF)\",\"VC_WEIGHT_PERCENT\":20.0,\"VC_AWARD_VALUE\":17983.20,\"VC_PCT_ATTAINED\":100.0,\"CC_WEIGHTED_RESULT\":20.0},{\"NAME\":\"John Doe\",\"AS_OF_DATE\":\"2016-08-21T00:00:00\",\"EMPLID\":\"00102846\",\"VC_PLAN_ID\":\"CCIICPLAN\",\"VC_PAYOUT_PRD_ID\":\"2016\",\"PRD_BGN_DT\":\"2016-01-01T00:00:00\",\"PRD_END_DT\":\"2016-12-31T00:00:00\",\"DESCR\":\"CORP - MARKETING/SALES\",\"JOBCODE_DESCR\":\"Sr Mgr,3rd Party Retail - Corp\",\"CC_TARGET_PCT\":15.0,\"ANNUAL_RT\":119888.0,\"DESCR50\":\"Cox Residential Consolidated Revenue\",\"DESCR100\":\"Cox Residential Consolidated Annual Revenue\",\"VC_WEIGHT_PERCENT\":20.0,\"VC_AWARD_VALUE\":17983.20,\"VC_PCT_ATTAINED\":100.0,\"CC_WEIGHTED_RESULT\":20.0},{\"NAME\":\"John Doe\",\"AS_OF_DATE\":\"2016-08-21T00:00:00\",\"EMPLID\":\"00102846\",\"VC_PLAN_ID\":\"CCIICPLAN\",\"VC_PAYOUT_PRD_ID\":\"2016\",\"PRD_BGN_DT\":\"2016-01-01T00:00:00\",\"PRD_END_DT\":\"2016-12-31T00:00:00\",\"DESCR\":\"CORP - MARKETING/SALES\",\"JOBCODE_DESCR\":\"Sr Mgr,3rd Party Retail - Corp\",\"CC_TARGET_PCT\":15.0,\"ANNUAL_RT\":119888.0,\"DESCR50\":\"Cox Residential Consolidated PSUs\",\"DESCR100\":\"Cox Residential Consolidated Annual PSU\",\"VC_WEIGHT_PERCENT\":20.0,\"VC_AWARD_VALUE\":17983.20,\"VC_PCT_ATTAINED\":100.0,\"CC_WEIGHTED_RESULT\":20.0},{\"NAME\":\"John Doe\",\"AS_OF_DATE\":\"2016-08-21T00:00:00\",\"EMPLID\":\"00102846\",\"VC_PLAN_ID\":\"CCIICPLAN\",\"VC_PAYOUT_PRD_ID\":\"2016\",\"PRD_BGN_DT\":\"2016-01-01T00:00:00\",\"PRD_END_DT\":\"2016-12-31T00:00:00\",\"DESCR\":\"CORP - MARKETING/SALES\",\"JOBCODE_DESCR\":\"Sr Mgr,3rd Party Retail - Corp\",\"CC_TARGET_PCT\":15.0,\"ANNUAL_RT\":119888.0,\"DESCR50\":\"MBO\",\"DESCR100\":\"Function Specific MBO\",\"VC_WEIGHT_PERCENT\":10.0,\"VC_AWARD_VALUE\":17983.20,\"VC_PCT_ATTAINED\":100.0,\"CC_WEIGHTED_RESULT\":10.0}]}";
            if (resultsData != "") {
                $scope.safeApply(function () {
                    $scope.ResultsH1 = false;
                    $scope.ResultsH2 = false;
                    $scope.ResultsICGoalsHeadings = JSON.parse(resultsData).table1;
                    $scope.ResultsICGoalsContent = JSON.parse(resultsData).table2;
                    if (typeof ($scope.ResultsICGoalsHeadings[0]) != "undefined") {
                        $scope.ResultsH1 = true;
                    }

                    if (typeof ($scope.ResultsICGoalsHeadings[1]) != "undefined") {
                        $scope.ResultsH2 = true;
                    }
                });
            }*/
        }

    }

    /*
    function GetICData(restUrl) {
        var deferred = $.Deferred();

        if (restUrl != "") {
            deferred.resolve("test");
        }
        else {
            deferred.reject("error");
        }

        return deferred.promise();
    }*/

    
    function GetICData(icRESTUri) {
        var deferred = $.Deferred();

        jQuery.ajax({
            url: encodeURI(icRESTUri + "?value=" + exService.getEmpID()),
            type: "GET",
            crossDomain: true,
            headers: {
                "accept": "application/json;odata=verbose",
            },
            success: function (data) {
                if (data.Value != "" && typeof (JSON.parse(data.Value).table1) !== "undefined") {
                    deferred.resolve(data.Value);
                }
                else {
                    deferred.resolve("");
                }
            },
            error: function (error) {
                CCI_Common.LogException(_spPageContextInfo.userLoginName, "CCI-myHR_WidgetPreferences.js--GetICData--REST Url: " + icRESTUri, _spPageContextInfo.serverRequestPath, JSON.stringify(error));
                deferred.reject(error);
            }
        });
        return deferred.promise();
    }

    init();

    function init() {
        if (exService.getEmpID().startsWith("Error") ||  exService.getEmpID() == "") { //Contractor
            $scope.AppHeading = exService.GetConfig("IC Title");
            $scope.displayICGoals = false;
            $scope.NonEmpMessage = exService.GetConfig("IC Goals Non-Emp Message");

            /*
            //
            $scope.displayICGoals = true;

            $scope.ICFAQUrl = exService.GetConfig("IC - FAQ Url");
            $scope.ICPayoutUrl = exService.GetConfig("IC - Payout Calculation Url");
            $scope.ICPlanUrl = exService.GetConfig("IC - Plan Document Url");

            if (exService.GetConfig("Display IC Goals Current Year").toLowerCase() == "true") {
                $scope.displayCurrentYear = true;
            }
            else {
                $scope.displayCurrentYear = false;
            }
            if (exService.GetConfig("Display IC Goals Prior Year").toLowerCase() == "true") {
                $scope.displayPriorYear = true;
            }
            else {
                $scope.displayPriorYear = false;
            }
            if (exService.GetConfig("Display IC Goals Results").toLowerCase() == "true") {
                $scope.displayResults = true;
            }
            else {
                $scope.displayResults = false;
            }*/
        }
        else { //Employee
            $scope.AppHeading = exService.GetConfig("IC Title");
            $scope.displayICGoals = true;

            $scope.ICFAQUrl = exService.GetConfig("IC - FAQ Url");
            $scope.ICPayoutUrl = exService.GetConfig("IC - Payout Calculation Url");
            $scope.ICPlanUrl = exService.GetConfig("IC - Plan Document Url");

            if (exService.GetConfig("Display IC Goals Current Year").toLowerCase() == "true") {
                $scope.displayCurrentYear = true;
                $scope.CurrentYearTitle = exService.GetConfig("IC Current Year Title");
            }
            else {
                $scope.displayCurrentYear = false;
            }
            if (exService.GetConfig("Display IC Goals Prior Year").toLowerCase() == "true") {
                $scope.displayPriorYear = true;
                $scope.PriorYearTitle = exService.GetConfig("IC Prior Year Title");
            }
            else {
                $scope.displayPriorYear = false;
            }
            if (exService.GetConfig("Display IC Goals Results").toLowerCase() == "true") {
                $scope.displayResults = true;
                $scope.ResultsTitle = exService.GetConfig("IC Results Title");
            }
            else {
                $scope.displayResults = false;
            }
        }
/*
        var content = "{ \"Table\": [ { \"EMPLID\": \"00607432\", \"EMPL_RCD\": 0.0, \"VC_PLAN_ID\": \"CCIICPLAN\", \"VC_PAYOUT_PRD_ID\": \"2016\", \"GB_GROUP_ID\": \"ICCORPMKTGSAL\", \"VC_GOAL_ID\": \"MBO\", \"PRD_BGN_DT\": \"2016-01-01T00:00:00\", \"PRD_END_DT\": \"2016-12-31T00:00:00\", \"NAME\": \"Test User1\", \"AS_OF_DATE\": \"2016-07-17T00:00:00\", \"VC_AWARD_VALUE\": 17983.20, \"JOBCODE\": \"SA0361\", \"JOBCODE_DESCR\": \"Sr Mgr,3rd Party Retail - Corp\", \"CC_TARGET_PCT\": 15.0, \"ANNUAL_RT\": 119888.0, \"DESCR\": \"CORP - MARKETING/SALES\", \"VC_PERF_FACTOR\": 1.0, \"DESCR50\": \"MBO\", \"DESCR100\": \"Function Specific MBO\", \"VC_PCT_ATTAINED\": 100.0, \"VC_WEIGHT_PERCENT\": 10.0, \"CC_WEIGHTED_RESULT\": 10.0, \"PRORATE_FACTOR\": 1.0, \"VC_CALC_AWARD\": 17983.20, \"CC_VC_CURRENT\": \"Y\", \"CC_VC_PRIOR\": \"N\", \"CC_VC_RESULTS\": \"N\" }, { \"EMPLID\": \"00607432\", \"EMPL_RCD\": 0.0, \"VC_PLAN_ID\": \"CCIICPLAN\", \"VC_PAYOUT_PRD_ID\": \"2016\", \"GB_GROUP_ID\": \"ICCORPMKTGSAL\", \"VC_GOAL_ID\": \"FCF\", \"PRD_BGN_DT\": \"2016-01-01T00:00:00\", \"PRD_END_DT\": \"2016-12-31T00:00:00\", \"NAME\": \"Test User1\", \"AS_OF_DATE\": \"2016-07-17T00:00:00\", \"VC_AWARD_VALUE\": 17983.20, \"JOBCODE\": \"SA0361\", \"JOBCODE_DESCR\": \"Sr Mgr,3rd Party Retail - Corp\", \"CC_TARGET_PCT\": 15.0, \"ANNUAL_RT\": 119888.0, \"DESCR\": \"CORP - MARKETING/SALES\", \"VC_PERF_FACTOR\": 1.0, \"DESCR50\": \"CCI Consolidated Free Cash Flow (FCF)\", \"DESCR100\": \"Total Company: OCF + LTIP Exp - CapEx - LTIP Paymts +/- Chg in Work Captl - Cash Int - Cash Taxes\", \"VC_PCT_ATTAINED\": 100.0, \"VC_WEIGHT_PERCENT\": 30.0, \"CC_WEIGHTED_RESULT\": 30.0, \"PRORATE_FACTOR\": 1.0, \"VC_CALC_AWARD\": 17983.20, \"CC_VC_CURRENT\": \"Y\", \"CC_VC_PRIOR\": \"N\", \"CC_VC_RESULTS\": \"N\" }, { \"EMPLID\": \"00607432\", \"EMPL_RCD\": 0.0, \"VC_PLAN_ID\": \"CCIICPLAN\", \"VC_PAYOUT_PRD_ID\": \"2016\", \"GB_GROUP_ID\": \"ICCORPMKTGSAL\", \"VC_GOAL_ID\": \"CONS OCF\", \"PRD_BGN_DT\": \"2016-01-01T00:00:00\", \"PRD_END_DT\": \"2016-12-31T00:00:00\", \"NAME\": \"Test User1\", \"AS_OF_DATE\": \"2016-07-17T00:00:00\", \"VC_AWARD_VALUE\": 17983.20, \"JOBCODE\": \"SA0361\", \"JOBCODE_DESCR\": \"Sr Mgr,3rd Party Retail - Corp\", \"CC_TARGET_PCT\": 15.0, \"ANNUAL_RT\": 119888.0, \"DESCR\": \"CORP - MARKETING/SALES\", \"VC_PERF_FACTOR\": 1.0, \"DESCR50\": \"CCI Consolidated Operating Cash Flow (OCF)\", \"DESCR100\": \"CCI Consolidated Annual Operating Cash Flow (OCF)\", \"VC_PCT_ATTAINED\": 100.0, \"VC_WEIGHT_PERCENT\": 20.0, \"CC_WEIGHTED_RESULT\": 20.0, \"PRORATE_FACTOR\": 1.0, \"VC_CALC_AWARD\": 17983.20, \"CC_VC_CURRENT\": \"Y\", \"CC_VC_PRIOR\": \"N\", \"CC_VC_RESULTS\": \"N\" }, { \"EMPLID\": \"00607432\", \"EMPL_RCD\": 0.0, \"VC_PLAN_ID\": \"CCIICPLAN\", \"VC_PAYOUT_PRD_ID\": \"2016\", \"GB_GROUP_ID\": \"ICCORPMKTGSAL\", \"VC_GOAL_ID\": \"RESCON PSU\", \"PRD_BGN_DT\": \"2016-01-01T00:00:00\", \"PRD_END_DT\": \"2016-12-31T00:00:00\", \"NAME\": \"Test User1\", \"AS_OF_DATE\": \"2016-07-17T00:00:00\", \"VC_AWARD_VALUE\": 17983.20, \"JOBCODE\": \"SA0361\", \"JOBCODE_DESCR\": \"Sr Mgr,3rd Party Retail - Corp\", \"CC_TARGET_PCT\": 15.0, \"ANNUAL_RT\": 119888.0, \"DESCR\": \"CORP - MARKETING/SALES\", \"VC_PERF_FACTOR\": 1.0, \"DESCR50\": \"Cox Residential Consolidated PSUs\", \"DESCR100\": \"Cox Residential Consolidated Annual PSU\", \"VC_PCT_ATTAINED\": 100.0, \"VC_WEIGHT_PERCENT\": 20.0, \"CC_WEIGHTED_RESULT\": 20.0, \"PRORATE_FACTOR\": 1.0, \"VC_CALC_AWARD\": 17983.20, \"CC_VC_CURRENT\": \"Y\", \"CC_VC_PRIOR\": \"N\", \"CC_VC_RESULTS\": \"N\" }, { \"EMPLID\": \"00607432\", \"EMPL_RCD\": 0.0, \"VC_PLAN_ID\": \"CCIICPLAN\", \"VC_PAYOUT_PRD_ID\": \"2016\", \"GB_GROUP_ID\": \"ICCORPMKTGSAL\", \"VC_GOAL_ID\": \"RESCON REV\", \"PRD_BGN_DT\": \"2016-01-01T00:00:00\", \"PRD_END_DT\": \"2016-12-31T00:00:00\", \"NAME\": \"Test User1\", \"AS_OF_DATE\": \"2016-07-17T00:00:00\", \"VC_AWARD_VALUE\": 17983.20, \"JOBCODE\": \"SA0361\", \"JOBCODE_DESCR\": \"Sr Mgr,3rd Party Retail - Corp\", \"CC_TARGET_PCT\": 15.0, \"ANNUAL_RT\": 119888.0, \"DESCR\": \"CORP - MARKETING/SALES\", \"VC_PERF_FACTOR\": 1.0, \"DESCR50\": \"Cox Residential Consolidated Revenue\", \"DESCR100\": \"Cox Residential Consolidated Annual Revenue\", \"VC_PCT_ATTAINED\": 100.0, \"VC_WEIGHT_PERCENT\": 20.0, \"CC_WEIGHTED_RESULT\": 20.0, \"PRORATE_FACTOR\": 1.0, \"VC_CALC_AWARD\": 17983.20, \"CC_VC_CURRENT\": \"Y\", \"CC_VC_PRIOR\": \"N\", \"CC_VC_RESULTS\": \"N\" } ] }";
        $scope.ICGoals = JSON.parse(content).Table;

        var newContent = "{\"table1\":[{\"NAME\":\"John Doe\",\"AS_OF_DATE\":\"2016-08-21T00:00:00\",\"EMPLID\":\"00101999\",\"VC_PLAN_ID\":\"CCIICPLAN\",\"VC_PAYOUT_PRD_ID\":\"2016\",\"PRD_BGN_DT\":\"2016-01-01T00:00:00\",\"PRD_END_DT\":\"2016-05-31T00:00:00\",\"DESCR\":\"CORP - SUPPLY CHAIN\",\"JOBCODE_DESCR\":\"Dir, Area Fulfillment Center\",\"CC_TARGET_PCT\":20.0,\"ANNUAL_RT\":128388.72},{\"NAME\":\"John Doe\",\"AS_OF_DATE\":\"2016-08-21T00:00:00\",\"EMPLID\":\"00101999\",\"VC_PLAN_ID\":\"CCIICPLAN\",\"VC_PAYOUT_PRD_ID\":\"2016\",\"PRD_BGN_DT\":\"2016-06-01T00:00:00\",\"PRD_END_DT\":\"2016-12-31T00:00:00\",\"DESCR\":\"CORP - SUPPLY CHAIN\",\"JOBCODE_DESCR\":\"Exec Dir, Regl Supply Chain Op\",\"CC_TARGET_PCT\":30.0,\"ANNUAL_RT\":161758.74}],\"table2\":[{\"NAME\":\"John Doe\",\"AS_OF_DATE\":\"2016-08-21T00:00:00\",\"EMPLID\":\"00101999\",\"VC_PLAN_ID\":\"CCIICPLAN\",\"VC_PAYOUT_PRD_ID\":\"2016\",\"PRD_BGN_DT\":\"2016-06-01T00:00:00\",\"PRD_END_DT\":\"2016-12-31T00:00:00\",\"DESCR\":\"CORP - SUPPLY CHAIN\",\"JOBCODE_DESCR\":\"Exec Dir, Regl Supply Chain Op\",\"CC_TARGET_PCT\":30.0,\"ANNUAL_RT\":161758.74,\"DESCR50\":\"CCI Consolidated Free Cash Flow (FCF)\",\"DESCR100\":\"Total Company: OCF + LTIP Exp - CapEx - LTIP Paymts +/- Chg in Work Captl - Cash Int - Cash Taxes\",\"VC_WEIGHT_PERCENT\":40.0},{\"NAME\":\"John Doe\",\"AS_OF_DATE\":\"2016-08-21T00:00:00\",\"EMPLID\":\"00101999\",\"VC_PLAN_ID\":\"CCIICPLAN\",\"VC_PAYOUT_PRD_ID\":\"2016\",\"PRD_BGN_DT\":\"2016-01-01T00:00:00\",\"PRD_END_DT\":\"2016-05-31T00:00:00\",\"DESCR\":\"CORP - SUPPLY CHAIN\",\"JOBCODE_DESCR\":\"Dir, Area Fulfillment Center\",\"CC_TARGET_PCT\":20.0,\"ANNUAL_RT\":128388.72,\"DESCR50\":\"CCI Consolidated Free Cash Flow (FCF)\",\"DESCR100\":\"Total Company: OCF + LTIP Exp - CapEx - LTIP Paymts +/- Chg in Work Captl - Cash Int - Cash Taxes\",\"VC_WEIGHT_PERCENT\":40.0},{\"NAME\":\"John Doe\",\"AS_OF_DATE\":\"2016-08-21T00:00:00\",\"EMPLID\":\"00101999\",\"VC_PLAN_ID\":\"CCIICPLAN\",\"VC_PAYOUT_PRD_ID\":\"2016\",\"PRD_BGN_DT\":\"2016-01-01T00:00:00\",\"PRD_END_DT\":\"2016-05-31T00:00:00\",\"DESCR\":\"CORP - SUPPLY CHAIN\",\"JOBCODE_DESCR\":\"Dir, Area Fulfillment Center\",\"CC_TARGET_PCT\":20.0,\"ANNUAL_RT\":128388.72,\"DESCR50\":\"CCI Consolidated Operating Cash Flow (OCF)\",\"DESCR100\":\"CCI Consolidated Annual Operating Cash Flow (OCF)\",\"VC_WEIGHT_PERCENT\":30.0},{\"NAME\":\"John Doe\",\"AS_OF_DATE\":\"2016-08-21T00:00:00\",\"EMPLID\":\"00101999\",\"VC_PLAN_ID\":\"CCIICPLAN\",\"VC_PAYOUT_PRD_ID\":\"2016\",\"PRD_BGN_DT\":\"2016-06-01T00:00:00\",\"PRD_END_DT\":\"2016-12-31T00:00:00\",\"DESCR\":\"CORP - SUPPLY CHAIN\",\"JOBCODE_DESCR\":\"Exec Dir, Regl Supply Chain Op\",\"CC_TARGET_PCT\":30.0,\"ANNUAL_RT\":161758.74,\"DESCR50\":\"CCI Consolidated Operating Cash Flow (OCF)\",\"DESCR100\":\"CCI Consolidated Annual Operating Cash Flow (OCF)\",\"VC_WEIGHT_PERCENT\":30.0},{\"NAME\":\"John Doe\",\"AS_OF_DATE\":\"2016-08-21T00:00:00\",\"EMPLID\":\"00101999\",\"VC_PLAN_ID\":\"CCIICPLAN\",\"VC_PAYOUT_PRD_ID\":\"2016\",\"PRD_BGN_DT\":\"2016-01-01T00:00:00\",\"PRD_END_DT\":\"2016-05-31T00:00:00\",\"DESCR\":\"CORP - SUPPLY CHAIN\",\"JOBCODE_DESCR\":\"Dir, Area Fulfillment Center\",\"CC_TARGET_PCT\":20.0,\"ANNUAL_RT\":128388.72,\"DESCR50\":\"MBO\",\"DESCR100\":\"Function Specific MBO\",\"VC_WEIGHT_PERCENT\":10.0},{\"NAME\":\"John Doe\",\"AS_OF_DATE\":\"2016-08-21T00:00:00\",\"EMPLID\":\"00101999\",\"VC_PLAN_ID\":\"CCIICPLAN\",\"VC_PAYOUT_PRD_ID\":\"2016\",\"PRD_BGN_DT\":\"2016-06-01T00:00:00\",\"PRD_END_DT\":\"2016-12-31T00:00:00\",\"DESCR\":\"CORP - SUPPLY CHAIN\",\"JOBCODE_DESCR\":\"Exec Dir, Regl Supply Chain Op\",\"CC_TARGET_PCT\":30.0,\"ANNUAL_RT\":161758.74,\"DESCR50\":\"CCI Consolidated Revenue / PSU Combination\",\"DESCR100\":\"CCI Consolidated Annual Revenue\",\"VC_WEIGHT_PERCENT\":10.0},{\"NAME\":\"John Doe\",\"AS_OF_DATE\":\"2016-08-21T00:00:00\",\"EMPLID\":\"00101999\",\"VC_PLAN_ID\":\"CCIICPLAN\",\"VC_PAYOUT_PRD_ID\":\"2016\",\"PRD_BGN_DT\":\"2016-06-01T00:00:00\",\"PRD_END_DT\":\"2016-12-31T00:00:00\",\"DESCR\":\"CORP - SUPPLY CHAIN\",\"JOBCODE_DESCR\":\"Exec Dir, Regl Supply Chain Op\",\"CC_TARGET_PCT\":30.0,\"ANNUAL_RT\":161758.74,\"DESCR50\":\"MBO\",\"DESCR100\":\"Function Specific MBO\",\"VC_WEIGHT_PERCENT\":10.0},{\"NAME\":\"John Doe\",\"AS_OF_DATE\":\"2016-08-21T00:00:00\",\"EMPLID\":\"00101999\",\"VC_PLAN_ID\":\"CCIICPLAN\",\"VC_PAYOUT_PRD_ID\":\"2016\",\"PRD_BGN_DT\":\"2016-06-01T00:00:00\",\"PRD_END_DT\":\"2016-12-31T00:00:00\",\"DESCR\":\"CORP - SUPPLY CHAIN\",\"JOBCODE_DESCR\":\"Exec Dir, Regl Supply Chain Op\",\"CC_TARGET_PCT\":30.0,\"ANNUAL_RT\":161758.74,\"DESCR50\":\"CCI Consolidated Brand NPS\",\"DESCR100\":\"CCI Consolidated Full-year Brand Net Promoter Score\",\"VC_WEIGHT_PERCENT\":10.0},{\"NAME\":\"John Doe\",\"AS_OF_DATE\":\"2016-08-21T00:00:00\",\"EMPLID\":\"00101999\",\"VC_PLAN_ID\":\"CCIICPLAN\",\"VC_PAYOUT_PRD_ID\":\"2016\",\"PRD_BGN_DT\":\"2016-01-01T00:00:00\",\"PRD_END_DT\":\"2016-05-31T00:00:00\",\"DESCR\":\"CORP - SUPPLY CHAIN\",\"JOBCODE_DESCR\":\"Dir, Area Fulfillment Center\",\"CC_TARGET_PCT\":20.0,\"ANNUAL_RT\":128388.72,\"DESCR50\":\"CCI Consolidated Brand NPS\",\"DESCR100\":\"CCI Consolidated Full-year Brand Net Promoter Score\",\"VC_WEIGHT_PERCENT\":10.0},{\"NAME\":\"John Doe\",\"AS_OF_DATE\":\"2016-08-21T00:00:00\",\"EMPLID\":\"00101999\",\"VC_PLAN_ID\":\"CCIICPLAN\",\"VC_PAYOUT_PRD_ID\":\"2016\",\"PRD_BGN_DT\":\"2016-01-01T00:00:00\",\"PRD_END_DT\":\"2016-05-31T00:00:00\",\"DESCR\":\"CORP - SUPPLY CHAIN\",\"JOBCODE_DESCR\":\"Dir, Area Fulfillment Center\",\"CC_TARGET_PCT\":20.0,\"ANNUAL_RT\":128388.72,\"DESCR50\":\"CCI Consolidated Revenue / PSU Combination\",\"DESCR100\":\"CCI Consolidated Annual Revenue\",\"VC_WEIGHT_PERCENT\":10.0}]}"
        //var icCurrent = "{"table1":[{"NAME":"John Doe","AS_OF_DATE":"2016-08-21T00:00:00","EMPLID":"00101236","VC_PLAN_ID":"CCIICPLAN","VC_PAYOUT_PRD_ID":"2016","PRD_BGN_DT":"2016-01-01T00:00:00","PRD_END_DT":"2016-05-31T00:00:00","DESCR":"CORP - SUPPLY CHAIN","JOBCODE_DESCR":"Dir, Area Fulfillment Center","CC_TARGET_PCT":20.0,"ANNUAL_RT":128388.72},{"NAME":"John Doe","AS_OF_DATE":"2016-08-21T00:00:00","EMPLID":"00101236","VC_PLAN_ID":"CCIICPLAN","VC_PAYOUT_PRD_ID":"2016","PRD_BGN_DT":"2016-06-01T00:00:00","PRD_END_DT":"2016-12-31T00:00:00","DESCR":"CORP - SUPPLY CHAIN","JOBCODE_DESCR":"Exec Dir, Regl Supply Chain Op","CC_TARGET_PCT":30.0,"ANNUAL_RT":161758.74}],"table2":[{"NAME":"John Doe","AS_OF_DATE":"2016-08-21T00:00:00","EMPLID":"00101236","VC_PLAN_ID":"CCIICPLAN","VC_PAYOUT_PRD_ID":"2016","PRD_BGN_DT":"2016-06-01T00:00:00","PRD_END_DT":"2016-12-31T00:00:00","DESCR":"CORP - SUPPLY CHAIN","JOBCODE_DESCR":"Exec Dir, Regl Supply Chain Op","CC_TARGET_PCT":30.0,"ANNUAL_RT":161758.74,"DESCR50":"CCI Consolidated Free Cash Flow (FCF)","DESCR100":"Total Company: OCF + LTIP Exp - CapEx - LTIP Paymts +/- Chg in Work Captl - Cash Int - Cash Taxes","VC_WEIGHT_PERCENT":40.0},{"NAME":"John Doe","AS_OF_DATE":"2016-08-21T00:00:00","EMPLID":"00101236","VC_PLAN_ID":"CCIICPLAN","VC_PAYOUT_PRD_ID":"2016","PRD_BGN_DT":"2016-01-01T00:00:00","PRD_END_DT":"2016-05-31T00:00:00","DESCR":"CORP - SUPPLY CHAIN","JOBCODE_DESCR":"Dir, Area Fulfillment Center","CC_TARGET_PCT":20.0,"ANNUAL_RT":128388.72,"DESCR50":"CCI Consolidated Free Cash Flow (FCF)","DESCR100":"Total Company: OCF + LTIP Exp - CapEx - LTIP Paymts +/- Chg in Work Captl - Cash Int - Cash Taxes","VC_WEIGHT_PERCENT":40.0},{"NAME":"John Doe","AS_OF_DATE":"2016-08-21T00:00:00","EMPLID":"00101236","VC_PLAN_ID":"CCIICPLAN","VC_PAYOUT_PRD_ID":"2016","PRD_BGN_DT":"2016-01-01T00:00:00","PRD_END_DT":"2016-05-31T00:00:00","DESCR":"CORP - SUPPLY CHAIN","JOBCODE_DESCR":"Dir, Area Fulfillment Center","CC_TARGET_PCT":20.0,"ANNUAL_RT":128388.72,"DESCR50":"CCI Consolidated Operating Cash Flow (OCF)","DESCR100":"CCI Consolidated Annual Operating Cash Flow (OCF)","VC_WEIGHT_PERCENT":30.0},{"NAME":"John Doe","AS_OF_DATE":"2016-08-21T00:00:00","EMPLID":"00101236","VC_PLAN_ID":"CCIICPLAN","VC_PAYOUT_PRD_ID":"2016","PRD_BGN_DT":"2016-06-01T00:00:00","PRD_END_DT":"2016-12-31T00:00:00","DESCR":"CORP - SUPPLY CHAIN","JOBCODE_DESCR":"Exec Dir, Regl Supply Chain Op","CC_TARGET_PCT":30.0,"ANNUAL_RT":161758.74,"DESCR50":"CCI Consolidated Operating Cash Flow (OCF)","DESCR100":"CCI Consolidated Annual Operating Cash Flow (OCF)","VC_WEIGHT_PERCENT":30.0},{"NAME":"John Doe","AS_OF_DATE":"2016-08-21T00:00:00","EMPLID":"00101236","VC_PLAN_ID":"CCIICPLAN","VC_PAYOUT_PRD_ID":"2016","PRD_BGN_DT":"2016-01-01T00:00:00","PRD_END_DT":"2016-05-31T00:00:00","DESCR":"CORP - SUPPLY CHAIN","JOBCODE_DESCR":"Dir, Area Fulfillment Center","CC_TARGET_PCT":20.0,"ANNUAL_RT":128388.72,"DESCR50":"MBO","DESCR100":"Function Specific MBO","VC_WEIGHT_PERCENT":10.0},{"NAME":"John Doe","AS_OF_DATE":"2016-08-21T00:00:00","EMPLID":"00101236","VC_PLAN_ID":"CCIICPLAN","VC_PAYOUT_PRD_ID":"2016","PRD_BGN_DT":"2016-06-01T00:00:00","PRD_END_DT":"2016-12-31T00:00:00","DESCR":"CORP - SUPPLY CHAIN","JOBCODE_DESCR":"Exec Dir, Regl Supply Chain Op","CC_TARGET_PCT":30.0,"ANNUAL_RT":161758.74,"DESCR50":"CCI Consolidated Revenue / PSU Combination","DESCR100":"CCI Consolidated Annual Revenue","VC_WEIGHT_PERCENT":10.0},{"NAME":"John Doe","AS_OF_DATE":"2016-08-21T00:00:00","EMPLID":"00101236","VC_PLAN_ID":"CCIICPLAN","VC_PAYOUT_PRD_ID":"2016","PRD_BGN_DT":"2016-06-01T00:00:00","PRD_END_DT":"2016-12-31T00:00:00","DESCR":"CORP - SUPPLY CHAIN","JOBCODE_DESCR":"Exec Dir, Regl Supply Chain Op","CC_TARGET_PCT":30.0,"ANNUAL_RT":161758.74,"DESCR50":"MBO","DESCR100":"Function Specific MBO","VC_WEIGHT_PERCENT":10.0},{"NAME":"John Doe","AS_OF_DATE":"2016-08-21T00:00:00","EMPLID":"00101236","VC_PLAN_ID":"CCIICPLAN","VC_PAYOUT_PRD_ID":"2016","PRD_BGN_DT":"2016-06-01T00:00:00","PRD_END_DT":"2016-12-31T00:00:00","DESCR":"CORP - SUPPLY CHAIN","JOBCODE_DESCR":"Exec Dir, Regl Supply Chain Op","CC_TARGET_PCT":30.0,"ANNUAL_RT":161758.74,"DESCR50":"CCI Consolidated Brand NPS","DESCR100":"CCI Consolidated Full-year Brand Net Promoter Score","VC_WEIGHT_PERCENT":10.0},{"NAME":"John Doe","AS_OF_DATE":"2016-08-21T00:00:00","EMPLID":"00101236","VC_PLAN_ID":"CCIICPLAN","VC_PAYOUT_PRD_ID":"2016","PRD_BGN_DT":"2016-01-01T00:00:00","PRD_END_DT":"2016-05-31T00:00:00","DESCR":"CORP - SUPPLY CHAIN","JOBCODE_DESCR":"Dir, Area Fulfillment Center","CC_TARGET_PCT":20.0,"ANNUAL_RT":128388.72,"DESCR50":"CCI Consolidated Brand NPS","DESCR100":"CCI Consolidated Full-year Brand Net Promoter Score","VC_WEIGHT_PERCENT":10.0},{"NAME":"John Doe","AS_OF_DATE":"2016-08-21T00:00:00","EMPLID":"00101236","VC_PLAN_ID":"CCIICPLAN","VC_PAYOUT_PRD_ID":"2016","PRD_BGN_DT":"2016-01-01T00:00:00","PRD_END_DT":"2016-05-31T00:00:00","DESCR":"CORP - SUPPLY CHAIN","JOBCODE_DESCR":"Dir, Area Fulfillment Center","CC_TARGET_PCT":20.0,"ANNUAL_RT":128388.72,"DESCR50":"CCI Consolidated Revenue / PSU Combination","DESCR100":"CCI Consolidated Annual Revenue","VC_WEIGHT_PERCENT":10.0}]}"
        $scope.CurrentYearICGoalsHeadings = JSON.parse(newContent).table1;
        $scope.CurrentYearICGoalsContent = JSON.parse(newContent).table2;

        if (typeof ($scope.CurrentYearICGoalsHeadings[0]) != "undefined") {
            $scope.CurrentYearH1 = true;
        }

        if (typeof ($scope.CurrentYearICGoalsHeadings[1]) != "undefined") {
            $scope.CurrentYearH2 = true;
        }*/
    }
});

//PTO
appWP.controller('ctrlmyHRPTO', function ($scope, $http, exService) {
    var defaultPos;
    $scope.PTOHeading="Paid Time Off";
    $scope.PTOUri = exService.GetConfig("myHR PTO REST");
    if (!exService.getEmpID().startsWith("Error") && exService.getEmpID() != "") {
        $scope.PTOEmpId = exService.getEmpID();
    }
    
    $scope.PTOForEmp = [];

    function GetPTO() {
        var deferred = $.Deferred();

        if ($scope.PTOUri != "" && $scope.PTOEmpId != "") {
            jQuery.ajax({
                url: $scope.PTOUri + "?value=" + exService.getEmpID(),
                type: "GET",
                crossDomain: true,
                headers: {
                    "accept": "application/json;odata=verbose",
                },
                success: function (data) {
                    if (typeof (JSON.parse(data.Value).Table) !== "undefined" && JSON.parse(data.Value).Table.length > 0) {
                        deferred.resolve(data.Value);
                    }
                    else {
                        $scope.displayPTO = false;
                        $scope.AppHeading = "Issue with JSON";
                        deferred.resolve("");
                    }
                },
                error: function (error) {
                    CCI_Common.LogException(_spPageContextInfo.userLoginName, "CCI-myHR_WidgetPreferences.js--GetPTO", _spPageContextInfo.serverRequestPath, JSON.stringify(error));
                    deferred.reject(error);
                }
            });
        }
        else {
            deferred.resolve("");
        }
        return deferred.promise();
    }

    $scope.safeApply = function (fn) {
        var phase = this.$root.$$phase;
        if (phase == '$apply' || phase == '$digest') {
            if (fn && (typeof (fn) === 'function')) {
                fn();
            }
        } else {
            this.$apply(fn);
        }
    };

    init();
    function init(){
        if (!exService.getEmpID().startsWith("Error") && exService.getEmpID() != "") {
            $scope.displayPTO = true;
            $scope.disableToday = true;
            //GetPTO();

            exService.getNextPayDay().then(
                function (nextPayDay) {
                    if (nextPayDay != "") {
                        $scope.nextPayDay = nextPayDay;
                    }
                });

            GetPTO().then(
                function (ptoData) {
                    if (ptoData != "") {
                        //Get Current User Location
                        //If California, then hide 'Carry Over' - CLIENT WANTS TO REVISIT THIS LATER
                     /*   var currentUserLocation = CCI_Common.GetUserProfilePropertyValue("Location");
                        if (typeof (currentUserLocation) != "undefined" && !currentUserLocation.startsWith("Error"))
                        {
                            if (currentUserLocation.trim().toLowerCase() == "california") {
                                $scope.displayCarryOver = true;
                            }
                            else {
                                $scope.displayCarryOver = false;
                            }
                        }*/

                        $scope.displayPTO = true;

                        $scope.PTOHelp = exService.GetConfig("PTO Help");
                        $scope.PTOHeading = exService.GetConfig("PTO Title");
                        $scope.PTODisclaimer = exService.GetConfig("PTO Disclaimer Text");
                        $scope.PTOPolicyText = exService.GetConfig("PTO Policy Text");
                        $scope.PTOPolicyUrl = exService.GetConfig("PTO Policy Url");
                        $scope.PTOHolidayText = exService.GetConfig("PTO Holiday Schedule Text");
                        $scope.PTOHolidayUrl = exService.GetConfig("PTO Holiday Schedule Url");

                        $scope.PTOForEmp = JSON.parse(ptoData).Table;

                        $scope.DateBalanceAsOf = $scope.PTOForEmp[0].ACCRUAL_PROC_DT;
                        //$scope.PTOForEmp[0].MAX_HOURS
                        //Earned YTD
                        $scope.EarnedYTD = ($scope.PTOForEmp[0].HRS_EARNED_YTD / $scope.PTOForEmp[0].MAX_HOURS) * 100;
                        $scope.TakenYTD = ($scope.PTOForEmp[0].HRS_TAKEN_YTD / $scope.PTOForEmp[0].MAX_HOURS) * 100;
                        $scope.BalanceYTD = ($scope.PTOForEmp[0].CC_HRS_YTD_BALANCE / $scope.PTOForEmp[0].MAX_HOURS) * 100;

                        var currentMonth = new Date().getMonth();
                        var todaysDate = new Date().getDate();
                        if (todaysDate > 15) {
                            defaultPos = (currentMonth * 2) + 1;
                        }
                        else {
                            defaultPos = currentMonth * 2;
                        }

                        var sliderEarnedYTD = ($scope.PTOForEmp[0].HRS_EARNED_YTD.toString().indexOf(".") > 0) ? parseFloat($scope.PTOForEmp[0].HRS_EARNED_YTD.toString()).toFixed(2) : $scope.PTOForEmp[0].HRS_EARNED_YTD.toString();
                        var sliderTakenYTD = ($scope.PTOForEmp[0].HRS_TAKEN_YTD.toString().indexOf(".") > 0) ? parseFloat($scope.PTOForEmp[0].HRS_TAKEN_YTD.toString()).toFixed(2) : $scope.PTOForEmp[0].HRS_TAKEN_YTD.toString();
                        var sliderBalanceYTD = ($scope.PTOForEmp[0].CC_HRS_YTD_BALANCE.toString().indexOf(".") > 0) ? parseFloat($scope.PTOForEmp[0].CC_HRS_YTD_BALANCE.toString()).toFixed(2) : $scope.PTOForEmp[0].CC_HRS_YTD_BALANCE.toString();

                        loadSlider($scope.PTOForEmp[0].MAX_HOURS, ($scope.PTOForEmp[0].MAX_HOURS / 23) * defaultPos);

                        loadHighChart($scope.EarnedYTD, $scope.TakenYTD, $scope.BalanceYTD, sliderEarnedYTD, sliderTakenYTD, sliderBalanceYTD);
                    }
                    else {
                        $scope.safeApply(function () {
                            $scope.displayPTO = false;
                            $scope.PTOHeading = exService.GetConfig("PTO Title");
                            $scope.NonEmpMessage = exService.GetConfig("PTO Empty Response Message");
                        });
                    }
            });
        }
        else {
            //$scope.displayPTO = false;
            //$scope.NonEmpMessage = exService.GetConfig("PTO Non-Emp Message");
            loadHighChart(0, 0, 0, 0, 0, 0);
            $scope.disableToday = true;

            /*//
            $scope.displayPTO = true;
            $scope.disableToday = true;

            exService.getNextPayDay().then(
                function (nextPayDay) {
                    if (nextPayDay != "") {
                        $scope.nextPayDay = nextPayDay;
                    }
                });

            var content = "{ \"Table\": [ { \"EMPLID\": \"00102846\", \"ACCRUAL_PROC_DT\": \"2016-07-19T00:00:00\", \"HRS_EARNED_YTD\": 149.3310, \"HRS_TAKEN_YTD\": 0.0, \"HRS_ADJUST_YTD\": 0.0, \"HRS_CARRYOVER\": 0.0, \"CC_HRS_YTD_BALANCE\": 85, \"MAX_HOURS\": 256.0 } ] }";
            //var content = "";
            if (content != "") {
                $scope.PTOHelp = exService.GetConfig("PTO Help");
                $scope.PTOHeading = exService.GetConfig("PTO Title");
                $scope.PTODisclaimer = exService.GetConfig("PTO Disclaimer Text");
                $scope.PTOPolicyText = exService.GetConfig("PTO Policy Text");
                $scope.PTOPolicyUrl = exService.GetConfig("PTO Policy Url");
                $scope.PTOHolidayText = exService.GetConfig("PTO Holiday Schedule Text");
                $scope.PTOHolidayUrl = exService.GetConfig("PTO Holiday Schedule Url");
                $scope.PTOForEmp = JSON.parse(content).Table;

                $scope.DateBalanceAsOf = $scope.PTOForEmp[0].ACCRUAL_PROC_DT;

                $scope.EarnedYTD = ($scope.PTOForEmp[0].HRS_EARNED_YTD / $scope.PTOForEmp[0].MAX_HOURS) * 100;
                $scope.TakenYTD = ($scope.PTOForEmp[0].HRS_TAKEN_YTD / $scope.PTOForEmp[0].MAX_HOURS) * 100;
                $scope.BalanceYTD = ($scope.PTOForEmp[0].CC_HRS_YTD_BALANCE / $scope.PTOForEmp[0].MAX_HOURS) * 100;

                var currentMonth = new Date().getMonth();
                var todaysDate = new Date().getDate();
                if (todaysDate > 15) {
                    defaultPos = (currentMonth * 2) + 1;
                }
                else {
                    defaultPos = currentMonth * 2;
                }

                //parseFloat($scope.PTOForEmp[0].HRS_EARNED_YTD.toString()).toFixed(2)
                var sliderEarnedYTD = ($scope.PTOForEmp[0].HRS_EARNED_YTD.toString().indexOf(".") > 0) ? parseFloat($scope.PTOForEmp[0].HRS_EARNED_YTD.toString()).toFixed(2) : $scope.PTOForEmp[0].HRS_EARNED_YTD.toString();
                var sliderTakenYTD = ($scope.PTOForEmp[0].HRS_TAKEN_YTD.toString().indexOf(".") > 0) ? parseFloat($scope.PTOForEmp[0].HRS_TAKEN_YTD.toString()).toFixed(2) : $scope.PTOForEmp[0].HRS_TAKEN_YTD.toString();
                var sliderBalanceYTD = ($scope.PTOForEmp[0].CC_HRS_YTD_BALANCE.toString().indexOf(".") > 0) ? parseFloat($scope.PTOForEmp[0].CC_HRS_YTD_BALANCE.toString()).toFixed(2) : $scope.PTOForEmp[0].CC_HRS_YTD_BALANCE.toString();

                loadSlider($scope.PTOForEmp[0].MAX_HOURS, ($scope.PTOForEmp[0].MAX_HOURS / 23) * defaultPos);

                loadHighChart($scope.EarnedYTD, $scope.TakenYTD, $scope.BalanceYTD, sliderEarnedYTD, sliderTakenYTD, sliderBalanceYTD);
            }
            else {
                $scope.PTOHeading = "Paid Time Off:  Error connecting to PeopleSoft. Please try again.";
                $scope.displayPTO = false;
            }*/
        }
    }

    $scope.PTOToday = function () {
        loadSlider($scope.PTOForEmp[0].MAX_HOURS, ($scope.PTOForEmp[0].MAX_HOURS / 23) * defaultPos);

        $scope.safeApply(function () {
            $scope.disableToday = true;
            $scope.DateBalanceAsOf = $scope.PTOForEmp[0].ACCRUAL_PROC_DT;

            $scope.EarnedYTD = ($scope.PTOForEmp[0].HRS_EARNED_YTD / $scope.PTOForEmp[0].MAX_HOURS) * 100;
            $scope.TakenYTD = ($scope.PTOForEmp[0].HRS_TAKEN_YTD / $scope.PTOForEmp[0].MAX_HOURS) * 100;
            $scope.BalanceYTD = ($scope.PTOForEmp[0].CC_HRS_YTD_BALANCE / $scope.PTOForEmp[0].MAX_HOURS) * 100;
        });

        var sliderEarnedYTD = ($scope.PTOForEmp[0].HRS_EARNED_YTD.toString().indexOf(".") > 0) ? parseFloat($scope.PTOForEmp[0].HRS_EARNED_YTD.toString()).toFixed(2) : $scope.PTOForEmp[0].HRS_EARNED_YTD.toString();
        var sliderTakenYTD = ($scope.PTOForEmp[0].HRS_TAKEN_YTD.toString().indexOf(".") > 0) ? parseFloat($scope.PTOForEmp[0].HRS_TAKEN_YTD.toString()).toFixed(2) : $scope.PTOForEmp[0].HRS_TAKEN_YTD.toString();
        var sliderBalanceYTD = ($scope.PTOForEmp[0].CC_HRS_YTD_BALANCE.toString().indexOf(".") > 0) ? parseFloat($scope.PTOForEmp[0].CC_HRS_YTD_BALANCE.toString()).toFixed(2) : $scope.PTOForEmp[0].CC_HRS_YTD_BALANCE.toString();

        loadHighChart($scope.EarnedYTD, $scope.TakenYTD, $scope.BalanceYTD, sliderEarnedYTD, sliderTakenYTD, sliderBalanceYTD);
    }

    function loadSlider(maxValue, loadValue) {
        var highChart;

        /* SLider Code*/
        // set up an array to hold the months
        var months = ["J", '', "F", '', "M", '', "A", '', "M", '', "J", '', "J", '', "A", '', "S", '', "O", '', "N", '', "D", ''];

      /*  //$(".slider-range")
        //$("#ptoSlider")
            // activate the slider with options
            .slider({
                value: loadValue,
                //min: 0,
                //max: months.length - 1,
                max: maxValue,
                
                step: maxValue / 23,
                values: [loadValue],
                //value: activeMonth*2
                range: true,

                slide: function (event, ui) {
                    if (ui.value < 200) {
                        return false;
                    }
                }
            })*/

        $("#ptoSlider")
            // activate the slider with options
            .slider({
                min: 0,
                max: maxValue,
                value: loadValue,
                step: maxValue / 23,
                //values: [loadValue],

                slide: function (event, ui) {
                    var defaultPos;
                    var currentMonth = new Date().getMonth();
                    var todaysDate = new Date().getDate();
                    if (todaysDate > 15) {
                        defaultPos = (currentMonth * 2) + 1;
                    }
                    else {
                        defaultPos = currentMonth * 2;
                    }

                    var newPos = Math.round((ui.value / (maxValue / 23)));  //Current click position - Math.round((ui.value / (256/23)))

                    if (defaultPos >= newPos) {
                        return false;
                    }
                },

                change: function (event, ui) {
                    var defaultPos;
                    var currentMonth = new Date().getMonth();
                    var todaysDate = new Date().getDate();
                    if (todaysDate > 15) {
                        defaultPos = (currentMonth * 2) + 1;
                    }
                    else {
                        defaultPos = currentMonth * 2;
                    }

                    var newPos = Math.round((ui.value / (maxValue / 23)));  //Current click position - Math.round((ui.value / (256/23)))

                    if (defaultPos < newPos) {
                        GetPTO().then(
                        function (ptoData) {
                            //ptoData = "{ \"Table\": [ { \"EMPLID\": \"00102846\", \"ACCRUAL_PROC_DT\": \"2016-07-19T00:00:00\", \"HRS_EARNED_YTD\": 149.3310, \"HRS_TAKEN_YTD\": 0.0, \"HRS_ADJUST_YTD\": 0.0, \"HRS_CARRYOVER\": 0.0, \"CC_HRS_YTD_BALANCE\": 85, \"MAX_HOURS\": 256.0 } ] }";
                            $scope.PTOForEmp = JSON.parse(ptoData).Table;

                            var newMonth;
                            var newDay = newPos % 2 == 0 ? 1 : 15;
                            var newYear = new Date().getFullYear();

                            //Get Month
                            switch (newPos.toString()) {
                                case "0":
                                case "1":
                                    newMonth = "0"; //Jan
                                    break;
                                case "2":
                                case "3":
                                    newMonth = "1";
                                    break;
                                case "4":
                                case "5":
                                    newMonth = "2";
                                    break;
                                case "6":
                                case "7":
                                    newMonth = "3";
                                    break;
                                case "8":
                                case "9":
                                    newMonth = "4";
                                    break;
                                case "10":
                                case "11":
                                    newMonth = "5";
                                    break;
                                case "12":
                                case "13":
                                    newMonth = "6";
                                    break;
                                case "14":
                                case "15":
                                    newMonth = "7";
                                    break;
                                case "16":
                                case "17":
                                    newMonth = "8";
                                    break;
                                case "18":
                                case "19":
                                    newMonth = "9";
                                    break;
                                case "20":
                                case "21":
                                    newMonth = "10";
                                    break;
                                case "22":
                                case "23":
                                    newMonth = "11";
                                    break;
                            }

                            $scope.DateBalanceAsOf = new Date(newYear, parseInt(newMonth), newDay);

                            $scope.EarnedYTD = (($scope.PTOForEmp[0].HRS_EARNED_YTD + ((newPos - defaultPos) * ($scope.PTOForEmp[0].MAX_HOURS / 24))) / $scope.PTOForEmp[0].MAX_HOURS) * 100;
                            $scope.TakenYTD = (($scope.PTOForEmp[0].HRS_TAKEN_YTD + ((newPos - defaultPos) * ($scope.PTOForEmp[0].MAX_HOURS / 24))) / $scope.PTOForEmp[0].MAX_HOURS) * 100;
                            $scope.BalanceYTD = (($scope.PTOForEmp[0].CC_HRS_YTD_BALANCE + ((newPos - defaultPos) * ($scope.PTOForEmp[0].MAX_HOURS / 24))) / $scope.PTOForEmp[0].MAX_HOURS) * 100;

                            if (newPos >= defaultPos) {
                                $scope.safeApply(function () {
                                    $scope.disableToday = false;
                                });

                                var sliderEarnedYTD = (($scope.PTOForEmp[0].HRS_EARNED_YTD + ((newPos - defaultPos) * ($scope.PTOForEmp[0].MAX_HOURS / 24))).toString().indexOf(".") > 0) ? parseFloat($scope.PTOForEmp[0].HRS_EARNED_YTD.toString()).toFixed(2) : $scope.PTOForEmp[0].HRS_EARNED_YTD.toString();
                                var sliderTakenYTD = (($scope.PTOForEmp[0].HRS_TAKEN_YTD + ((newPos - defaultPos) * ($scope.PTOForEmp[0].MAX_HOURS / 24))).toString().indexOf(".") > 0) ? parseFloat($scope.PTOForEmp[0].HRS_TAKEN_YTD.toString()).toFixed(2) : $scope.PTOForEmp[0].HRS_TAKEN_YTD.toString();
                                var sliderBalanceYTD = (($scope.PTOForEmp[0].CC_HRS_YTD_BALANCE + ((newPos - defaultPos) * ($scope.PTOForEmp[0].MAX_HOURS / 24))).toString().indexOf(".") > 0) ? parseFloat($scope.PTOForEmp[0].CC_HRS_YTD_BALANCE.toString()).toFixed(2) : $scope.PTOForEmp[0].CC_HRS_YTD_BALANCE.toString();

                                //var sliderEarnedYTD = parseFloat(($scope.PTOForEmp[0].HRS_EARNED_YTD + ((newPos - defaultPos) * ($scope.PTOForEmp[0].MAX_HOURS / 24))).toString()).toFixed(2);
                                //var sliderTakenYTD = parseFloat(($scope.PTOForEmp[0].HRS_TAKEN_YTD + ((newPos - defaultPos) * ($scope.PTOForEmp[0].MAX_HOURS / 24))).toString()).toFixed(2);
                                //var sliderBalanceYTD = parseFloat(($scope.PTOForEmp[0].CC_HRS_YTD_BALANCE + ((newPos - defaultPos) * ($scope.PTOForEmp[0].MAX_HOURS / 24))).toString()).toFixed(2);

                                //Current_Value + (new position - default position) * (Total/24)
                                loadHighChart($scope.EarnedYTD, $scope.TakenYTD, $scope.BalanceYTD, sliderEarnedYTD, sliderTakenYTD, sliderBalanceYTD);
                            }
                        });
                    }
                } 
            })

            // add pips with the labels set to "months"
            .slider("pips", {
                rest: "label",
                labels: months
            })

   /*         .on("slide", function (event, ui) {
                var defaultPos;
                var currentMonth = new Date().getMonth();
                var todaysDate = new Date().getDate();
                if (todaysDate > 15) {
                    defaultPos = (currentMonth * 2) + 1;
                }
                else {
                    defaultPos = currentMonth * 2;
                }

                var newPos = Math.round((ui.value / (256 / 23)));  //Current click position - Math.round((ui.value / (256/23)))

                if (defaultPos >= newPos) {
                    return false;
                }
            })

          // and whenever the slider changes, lets echo out the month
            .on("slidechange", function (e, ui) {
                GetPTO().then(
                function (ptoData) {
                    ptoData = "{ \"Table\": [ { \"EMPLID\": \"00102846\", \"ACCRUAL_PROC_DT\": \"2016-07-19T00:00:00\", \"HRS_EARNED_YTD\": 149.3310, \"HRS_TAKEN_YTD\": 0.0, \"HRS_ADJUST_YTD\": 0.0, \"HRS_CARRYOVER\": 0.0, \"CC_HRS_YTD_BALANCE\": 85, \"MAX_HOURS\": 256.0 } ] }";
                    $scope.PTOForEmp = JSON.parse(ptoData).Table;

                    var defaultPos;
                    var currentMonth = new Date().getMonth();
                    var todaysDate = new Date().getDate();
                    if (todaysDate > 15) {
                        defaultPos = (currentMonth * 2) + 1;
                    }
                    else {
                        defaultPos = currentMonth * 2;
                    }

                    var newPos = Math.round((ui.value / (256 / 23)));  //Current click position - Math.round((ui.value / (256/23)))

                    var newMonth;
                    var newDay = newPos % 2 == 0 ? 1 : 15;
                    var newYear = new Date().getFullYear();

                    //Get Month
                    switch (newPos.toString()) {
                        case "0":
                        case "1":
                            newMonth = "0"; //Jan
                            break;
                        case "2":
                        case "3":
                            newMonth = "1";
                            break;
                        case "4":
                        case "5":
                            newMonth = "2";
                            break;
                        case "6":
                        case "7":
                            newMonth = "3";
                            break;
                        case "8":
                        case "9":
                            newMonth = "4";
                            break;
                        case "10":
                        case "11":
                            newMonth = "5";
                            break;
                        case "12":
                        case "13":
                            newMonth = "6";
                            break;
                        case "14":
                        case "15":
                            newMonth = "7";
                            break;
                        case "16":
                        case "17":
                            newMonth = "8";
                            break;
                        case "18":
                        case "19":
                            newMonth = "9";
                            break;
                        case "20":
                        case "21":
                            newMonth = "10";
                            break;
                        case "22":
                        case "23":
                            newMonth = "11";
                            break;
                    }

                    $scope.DateBalanceAsOf = new Date(newYear, parseInt(newMonth), newDay);

                    $scope.EarnedYTD = (($scope.PTOForEmp[0].HRS_EARNED_YTD + ((newPos - defaultPos) * ($scope.PTOForEmp[0].MAX_HOURS / 24))) / $scope.PTOForEmp[0].MAX_HOURS) * 100;
                    $scope.TakenYTD = (($scope.PTOForEmp[0].HRS_TAKEN_YTD + ((newPos - defaultPos) * ($scope.PTOForEmp[0].MAX_HOURS / 24))) / $scope.PTOForEmp[0].MAX_HOURS) * 100;
                    $scope.BalanceYTD = (($scope.PTOForEmp[0].CC_HRS_YTD_BALANCE+ ((newPos - defaultPos) * ($scope.PTOForEmp[0].MAX_HOURS / 24))) / $scope.PTOForEmp[0].MAX_HOURS) * 100;

                    if (newPos >= defaultPos) {
                        $scope.safeApply(function () {
                            $scope.disableToday = false;
                        });

                        var sliderEarnedYTD = ($scope.PTOForEmp[0].HRS_EARNED_YTD + ((newPos - defaultPos) * ($scope.PTOForEmp[0].MAX_HOURS / 24))).toString().split(".")[0];
                        var sliderTakenYTD = ($scope.PTOForEmp[0].HRS_TAKEN_YTD + ((newPos - defaultPos) * ($scope.PTOForEmp[0].MAX_HOURS / 24))).toString().split(".")[0];
                        var sliderBalanceYTD = ($scope.PTOForEmp[0].CC_HRS_YTD_BALANCE + ((newPos - defaultPos) * ($scope.PTOForEmp[0].MAX_HOURS / 24))).toString().split(".")[0];

                        //Current_Value + (new position - default position) * (Total/24)
                        loadHighChart($scope.EarnedYTD, $scope.TakenYTD, $scope.BalanceYTD, sliderEarnedYTD, sliderTakenYTD, sliderBalanceYTD);
                    }
                });
            });*/
    }

    function loadHighChart(earnedYTD, takenYTD, balanceYTD, hrsEarned, hrsTaken, hrsBalance) {
        if (!Highcharts.theme) {
            Highcharts.setOptions({
                chart: {
                    backgroundColor: '#fff'
                },
                colors: ['#2759A8', '#F5812D', '#0F8A45'],
                title: {
                    style: {
                        color: 'silver'
                    }
                },
                tooltip: {
                    style: {
                        color: 'silver'
                    }
                }
            });
        }

        //Highcharts.chart('HRptoGraph', {
        var highChart = $('#HRptoGraph').highcharts({
            chart: {
                type: 'solidgauge',
                marginTop: 0
            },

            title: {
                text: '',
                style: {
                    fontSize: '24px'
                }
            },
            credits: {
                enabled: false
            },

            tooltip: {
                borderWidth: 0,
                backgroundColor: 'none',
                shadow: false,
                style: {
                    fontSize: '12px'
                },
                //pointFormat: '<span style="font-size:2em; color: {point.color}; font-weight: bold">{point.hrsToDisplay}</span><br><span style="font-size:2em; color: {point.color}; font-weight: bold">hrs</span>',
                pointFormat: '<span style="font-size:17px; color: {point.color}; font-weight: bold;text-align: center;">{point.hrsToDisplay}</span><br><span style="font-size:17px; color: {point.color}; font-weight: bold">hrs</span>',
                positioner: function (labelWidth, labelHeight) {
                    return {
                        //x: 150 - labelWidth / 2,
                        x: 123,
                        y: 120
                    };
                }
            },

            pane: {
                startAngle: 0,
                endAngle: 360,
                background: [{ // Track for Move
                    outerRadius: '112%',
                    innerRadius: '88%',
                    backgroundColor: Highcharts.Color(Highcharts.getOptions().colors[0]).setOpacity(0.3).get(),
                    borderWidth: 0
                }, { // Track for Exercise
                    outerRadius: '87%',
                    innerRadius: '63%',
                    backgroundColor: Highcharts.Color(Highcharts.getOptions().colors[1]).setOpacity(0.3).get(),
                    borderWidth: 0
                }, { // Track for Stand
                    outerRadius: '62%',
                    innerRadius: '38%',
                    backgroundColor: Highcharts.Color(Highcharts.getOptions().colors[2]).setOpacity(0.3).get(),
                    borderWidth: 0
                }]
            },

            yAxis: {
                min: 0,
                max: 100,
                lineWidth: 0,
                tickPositions: []
            },

            plotOptions: {
                solidgauge: {
                    borderWidth: '28px',
                    dataLabels: {
                        enabled: false
                    },
                    linecap: 'round',
                    stickyTracking: false
                }
            },

            series: [{
                name: 'Earned YTD',
                borderColor: Highcharts.getOptions().colors[0],
                data: [{
                    color: Highcharts.getOptions().colors[0],
                    radius: '100%',
                    innerRadius: '100%',
                    y: earnedYTD,
                    hrsToDisplay: hrsEarned
                }]
            }, {
                name: 'Taken YTD',
                borderColor: Highcharts.getOptions().colors[1],
                data: [{
                    color: Highcharts.getOptions().colors[1],
                    radius: '75%',
                    innerRadius: '75%',
                    y: takenYTD,
                    hrsToDisplay: hrsTaken
                }]
            }, {
                name: 'YTD Balance',
                borderColor: Highcharts.getOptions().colors[2],
                data: [{
                    color: Highcharts.getOptions().colors[2],
                    radius: '50%',
                    innerRadius: '50%',
                    y: balanceYTD,
                    hrsToDisplay: hrsBalance
                }]
            }]
        },
        /**
         * In the chart load callback, add icons on top of the circular shapes
         */
        function callback() {

            // Move icon
            /* this.renderer.path(['M', -8, 0, 'L', 8, 0, 'M', 0, -8, 'L', 8, 0, 0, 8])
                  .attr({
                      'stroke': '#303030',
                      'stroke-linecap': 'round',
                      'stroke-linejoin': 'round',
                      'stroke-width': 2,
                      'zIndex': 10
                  })
                  .translate(190, 26)
                  .add(this.series[2].group);
      */
            // Exercise icon
            /* this.renderer.path(['M', -8, 0, 'L', 8, 0, 'M', 0, -8, 'L', 8, 0, 0, 8, 'M', 8, -8, 'L', 16, 0, 8, 8])
                .attr({
                    'stroke': '#303030',
                    'stroke-linecap': 'round',
                    'stroke-linejoin': 'round',
                    'stroke-width': 2,
                    'zIndex': 10
                })
                .translate(190, 61)
                .add(this.series[2].group);
    
            // Stand icon
            this.renderer.path(['M', 0, 8, 'L', 0, -8, 'M', -8, 0, 'L', 0, -8, 8, 0])
                .attr({
                    'stroke': '#303030',
                    'stroke-linecap': 'round',
                    'stroke-linejoin': 'round',
                    'stroke-width': 2,
                    'zIndex': 10
                })
                .translate(190, 96)
                .add(this.series[2].group);
                */
        });
        var defaultChart = $('#HRptoGraph').highcharts(),
    		point = defaultChart.series[2].points[0];
        point.onMouseOver(); // Show the hover marker
        defaultChart.tooltip.refresh(point); // Show the tooltip
        defaultChart.tooltip.hide = function () { };

    }
});

//Career Framework
appWP.controller('ctrlmyHRCFW', function ($scope, $http, exService) {
    $scope.CareerFrameworkMyJob = function () {
        $('.MyJobFamilies').slideUp();
        $('.MyJobDisplay').slideToggle();
    };

    $scope.CareerFrameworkFamilies = function () {
        $('.MyJobFamilies').slideToggle();
        $('.MyJobDisplay').slideUp();
    };

    init();

    function init() {
        if (exService.getEmpID().startsWith("Error") ||  exService.getEmpID() == "") { //Contractor
            $scope.displayCFW = false;
            $scope.NonEmpMessage = exService.GetConfig("CFW Non-Emp Message");
        }
        else { //Employee
            $scope.displayCFW = true;
        }
    }
 });

//Job Families
appWP.controller('ctrlmyHRCFWJobFamilies', function ($scope, $http, $modal, exService, JobFamilyService) {

    $scope.displayTable = true;
    $scope.JobFamilyHeading = "Job Families Display";
    $scope.JobFamily = [];

    $scope.JFHeadings = [];
    $scope.JFSubHeadings = [];
    $scope.JFCareerLevel = [];
    $scope.JFSDesc = [];
    $scope.JFAccountability = [];

    $scope.JFHeadingUrl = exService.GetConfig("myHR Job Family Heading");
    $scope.JFSubHeadingUrl = exService.GetConfig("myHR Job Family SubHeading");
    $scope.JFCareerLevelUrl = exService.GetConfig("myHR Job Family CareerLevel");
    $scope.JFSDescUrl = exService.GetConfig("myHR Job Sub Family Description");
    $scope.JFAccountabilityUrl = exService.GetConfig("myHR Job Family Accountability");

    init();

    function init() {
        var JobFamily = {
            JFJSON: []
        };

        var JobSF = {
            JSFJSON: []
        };

        if ($scope.JFHeadingUrl != "") {
            GetJobFamilyContent($scope.JFHeadingUrl).then( //Job Family Headings
                function (jfHeadings) {
                    if (jfHeadings != "") {
                        $scope.JFHeadings = jfHeadings;
                        //$scope.JFHeadings = "{  \"Table\": [    {      \"DESCR\": \"Admin Support\"    },    {      \"DESCR\": \"Corp Engineering\"    },    {      \"DESCR\": \"Corporate Affairs\"    },    {      \"DESCR\": \"Customer Care\"    },    {      \"DESCR\": \"Finance & Accounting\"    },    {      \"DESCR\": \"Flare\"    },    {      \"DESCR\": \"General Management\"    },    {      \"DESCR\": \"Hospitality\"    },    {      \"DESCR\": \"Human Resources\"    },    {      \"DESCR\": \"Information Technology\"    },    {      \"DESCR\": \"Intern/Co-op\"    },    {      \"DESCR\": \"Local Origination\"    },    {      \"DESCR\": \"Marketing\"    },    {      \"DESCR\": \"Operations Support\"    },    {      \"DESCR\": \"Process, Change Mgt & Analysis\"    },    {      \"DESCR\": \"Production\"    },    {      \"DESCR\": \"Project Management\"    },    {      \"DESCR\": \"Sales\"    },    {      \"DESCR\": \"Sales Operations\"    },    {      \"DESCR\": \"Strategy & Product Mgmt\"    },    {      \"DESCR\": \"Technical Operations\"    },    {      \"DESCR\": \"Technology - Analysis\"    },    {      \"DESCR\": \"Technology - Architecture\"    },    {      \"DESCR\": \"Technology - Billing Ops\"    },    {      \"DESCR\": \"Technology - Development\"    },    {      \"DESCR\": \"Technology - Engineering & Ops\"    },    {      \"DESCR\": \"Technology - Ent Release Mgmt\"    },    {      \"DESCR\": \"Technology - IT Operations\"    },    {      \"DESCR\": \"Technology - Management\"    },    {      \"DESCR\": \"Technology - Network Srvc Mgmt\"    },    {      \"DESCR\": \"Technology - Platform Admin\"    },    {      \"DESCR\": \"Technology - Principal\"    },    {      \"DESCR\": \"Technology - Quality\"    },    {      \"DESCR\": \"Technology - Relationship Mgmt\"    },    {      \"DESCR\": \"Technology - Security\"    },    {      \"DESCR\": \"Technology - Voice Ntwrk Plan\"    },    {      \"DESCR\": \"Vendor Mgmt\"    },    {      \"DESCR\": \"Vivre Health\"    }  ]}";
                        if ($scope.JFSubHeadingUrl != "") { //Job Family Sub Headings REST end point is not empty
                            angular.forEach(JSON.parse($scope.JFHeadings).Table, function (value, key) { //Loop through Job Family Headings
                                GetJobFamilyContent($scope.JFSubHeadingUrl + "?JobSubFamily=" + value.DESCR + "").then( //Job Family Sub Headings
                                    function (jfSubHeadings) {
                                        if (jfSubHeadings != "") {
                                            $scope.JFSubHeadings = jfSubHeadings;
                                            //console.log("Heading - " + value.DESCR + "--Sub Heading: " + $scope.JFSubHeadings)
                                            //$scope.JFSubHeadings = "{  \"Table\": [    {      \"DESCR1\": \"Account Services\"    },    {      \"DESCR1\": \"Communications/Knowledge Mgmt\"    },    {      \"DESCR1\": \"Customer Advocate\"    },    {      \"DESCR1\": \"Customer Care\"    },    {      \"DESCR1\": \"Customer Contact Management\"    },    {      \"DESCR1\": \"Customer Resolution\"    },    {      \"DESCR1\": \"Forecasting & Scheduling\"    },    {      \"DESCR1\": \"Generalist\"    },    {      \"DESCR1\": \"Outsource\"    },    {      \"DESCR1\": \"Quality\"    },    {      \"DESCR1\": \"Retail Sales and Service\"    },    {      \"DESCR1\": \"Retail Service\"    },    {      \"DESCR1\": \"Technical Support\"    },    {      \"DESCR1\": \"eCare\"    }  ]}";
                                            if ($scope.JFCareerLevelUrl != "" && $scope.JFSDescUrl != "" && $scope.JFAccountabilityUrl != "") {
                                                angular.forEach(JSON.parse($scope.JFSubHeadings).Table, function (shValue, shKey) { //Loop through each Job Sub Item
                                                    /*  GetJobFamilyContent($scope.JFSDescUrl + "?value=" + shValue.DESCR1 + "").then( //Job Sub Family Description
                                                          function (jfDesc) {
                                                              if (jfDesc != "") {
                                                                  $scope.JFSDesc = jfDesc;
                                                                  $scope.JFSDesc = "{  \"Table\": [  \"Desc here\"    ]}";
                                                                  GetJobFamilyContent($scope.JFCareerLevelUrl + "?JobSubFamily=" + shValue.DESCR1 + "").then( //Job Sub Family Career Level
                                                                      function (jfCareerLevel) {
                                                                          if (jfCareerLevel != "") {
                                                                              $scope.JFCareerLevel = jfCareerLevel;
                                                                              $scope.JFCareerLevel = "{  \"Table\": [    {      \"DESCR\": \"Executive\",      \"DESCRSHORT\": \"Exec\"    },    {      \"DESCR\": \"Management\",      \"DESCRSHORT\": \"Mgmnt\"    },    {      \"DESCR\": \"Officer\",      \"DESCRSHORT\": \"Officer\"    },    {      \"DESCR\": \"Professional/Technical\",      \"DESCRSHORT\": \"Prof/Tech\"    },    {      \"DESCR\": \"Service/ Support\",      \"DESCRSHORT\": \"Svc Supp\"    }  ]}";
                                                                          }
                                                                      }
                                                                   )
                                                              }
                                                           }
                                                        )*/

                                                    var jfSubData = new JobFamilySubDetails(shValue.DESCR1);
                                                    JobSF.JSFJSON.push(jfSubData);

                                                });
                                            }
                                            else { //REST is empty
                                                $scope.displayTable = false;
                                                $scope.JobFamilyHeading = "Career Level/Description/Accountability REST end point is not valid/Empty";
                                            }
                                        }
                                        else {
                                            var finalUrl = $scope.JFSubHeadingUrl + "?JobSubFamily=" + value.DESCR + "";
                                            console.log("URL - " + encodeURI(finalUrl) + " - Heading - " + value.DESCR + "--Sub Heading: - ");
                                        }
                                        var jfData = new JobFamilyJSON(value.DESCR, JobSF.JSFJSON);
                                        JobFamily.JFJSON.push(jfData); //Pushing into JSON
                                        JobSF = {
                                            JSFJSON: []
                                        };
                                    }

                                )

                                
                            }); ////Loop through Job Family Headings - Got Job Family Sub headings
                        }
                        else { //Job Family Sub Headings
                            $scope.displayTable = false;
                            $scope.JobFamilyHeading = "Job Family Sub Headings REST Url is not valid/Empty";
                        }
                    }
                    else { //Job Family Heading values are empty
                        $scope.JobFamilyHeading = "Job Family Heading REST returns empty value";
                    }
                },
                function (error) { //Error getting Job Family Headers
                    $scope.JobFamilyHeading = "Error getting Job Family Heading REST values";
                }
            ); // End of Job Family Headings
        }
        else { //Job Family Headings
            $scope.displayTable = false;
            $scope.JobFamilyHeading = "Job Family Headings REST Url is not valid/Empty";
        }

        //var jfMainHeadings = "{  \"Table\": [    {      \"DESCR\": \"Admin Support\"    },    {      \"DESCR\": \"Corp Engineering\"    },    {      \"DESCR\": \"Corporate Affairs\"    },    {      \"DESCR\": \"Customer Care\"    },    {      \"DESCR\": \"Finance & Accounting\"    },    {      \"DESCR\": \"Flare\"    },    {      \"DESCR\": \"General Management\"    },    {      \"DESCR\": \"Hospitality\"    },    {      \"DESCR\": \"Human Resources\"    },    {      \"DESCR\": \"Information Technology\"    },    {      \"DESCR\": \"Intern/Co-op\"    },    {      \"DESCR\": \"Local Origination\"    },    {      \"DESCR\": \"Marketing\"    },    {      \"DESCR\": \"Operations Support\"    },    {      \"DESCR\": \"Process, Change Mgt & Analysis\"    },    {      \"DESCR\": \"Production\"    },    {      \"DESCR\": \"Project Management\"    },    {      \"DESCR\": \"Sales\"    },    {      \"DESCR\": \"Sales Operations\"    },    {      \"DESCR\": \"Strategy & Product Mgmt\"    },    {      \"DESCR\": \"Technical Operations\"    },    {      \"DESCR\": \"Technology - Analysis\"    },    {      \"DESCR\": \"Technology - Architecture\"    },    {      \"DESCR\": \"Technology - Billing Ops\"    },    {      \"DESCR\": \"Technology - Development\"    },    {      \"DESCR\": \"Technology - Engineering & Ops\"    },    {      \"DESCR\": \"Technology - Ent Release Mgmt\"    },    {      \"DESCR\": \"Technology - IT Operations\"    },    {      \"DESCR\": \"Technology - Management\"    },    {      \"DESCR\": \"Technology - Network Srvc Mgmt\"    },    {      \"DESCR\": \"Technology - Platform Admin\"    },    {      \"DESCR\": \"Technology - Principal\"    },    {      \"DESCR\": \"Technology - Quality\"    },    {      \"DESCR\": \"Technology - Relationship Mgmt\"    },    {      \"DESCR\": \"Technology - Security\"    },    {      \"DESCR\": \"Technology - Voice Ntwrk Plan\"    },    {      \"DESCR\": \"Vendor Mgmt\"    },    {      \"DESCR\": \"Vivre Health\"    }  ]}";
        //$scope.JFHeadings = JSON.parse(jfMainHeadings).Table;

        $scope.JobFamily = JobFamily.JFJSON;

        $scope.JobFamilyHeading = "Job Families Display";
    }

    $scope.openJFDetails = function (clickedItem) {
        JobFamilyService.setJSON(clickedItem.target.innerText);
        var modalInstance = $modal.open({
            templateUrl: 'CFWJobFamilyDetails.html',
            controller: 'JobFamiliesModalInstanceCtrl'
        });
        modalInstance.result.then(function () {
           /* var currentPref = exService.getJSON();
            if (typeof (currentPref) != "undefined" && currentPref != "") {
                LoadControls(currentPref);
            }*/
        }, function () {
            //$log.info('Modal dismissed at: ' + new Date());
        });
    };
/*
    function GetJobFamilyContent(restUrl) {
        var deferred = $.Deferred();

        if (restUrl != "") {
            deferred.resolve("test");
        }
        else {
            deferred.reject("error");
        }

        return deferred.promise();
    }
    */
    //Execute Job Family REST Urls
    function GetJobFamilyContent(restUrl) {
        //console.log(restUrl);
        var endPointUri = encodeURI(restUrl);
        var deferred = $.Deferred();

        jQuery.ajax({
            url: endPointUri.replace("&", "%26"),
            type: "GET",
            crossDomain: true,
            headers: {
                "accept": "application/json;odata=verbose",
            },
            success: function (data) {
                if (data.Value != "" && typeof (JSON.parse(data.Value).Table) !== "undefined" && JSON.parse(data.Value).Table.length > 0) {
                    deferred.resolve(data.Value);
                }
                else {
                    deferred.resolve("");
                 }
            },
            error: function (error) {
                CCI_Common.LogException(_spPageContextInfo.userLoginName, "CCI-myHR_WidgetPreferences.js--GetJobFamilyContent--REST Url: " + restUrl, _spPageContextInfo.serverRequestPath, JSON.stringify(error));
                deferred.reject(error);
            }
        });
        return deferred.promise();
    }
    

    function JobFamilyJSON(jfHeading, jfSubDetails) {
        this.JobFamilyHeading = jfHeading;
        this.JobFamilySubDetails = jfSubDetails;
    }

    function JobFamilySubDetails(jfSubName) {
        this.JobFamilySubName = jfSubName;
        //this.JobFamilySubCL = jfSubCL;
        //this.JobFamilySubDesc = jfSubDesc;
    }
});

//Job Families Modal Controller
appWP.controller('JobFamiliesModalInstanceCtrl', function ($scope, $modalInstance, $log, exService, JobFamilyService) {
    
    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };

    var JFCareerLevelUrl = exService.GetConfig("myHR Job Family CareerLevel");
    var JFSDescUrl = exService.GetConfig("myHR Job Sub Family Description");
    var JFAccountabilityUrl = exService.GetConfig("myHR Job Family Accountability");

    $scope.JFAccountability = [];
    $scope.selectedSF = JobFamilyService.getJSON();

    init();
    function init() {
        if (typeof ($scope.selectedSF) != "undefined" && $scope.selectedSF != "") {
            var JFAccountability = {
                JFAcc: []
            };
            $scope.JFAccountability = JFAccountability.JFAcc;

            if (JFCareerLevelUrl != "") {
                GetJobFamilyContent(JFCareerLevelUrl + "?JobSubFamily=" + $scope.selectedSF + "").then(
                    function (jfCL) {
                        if (jfCL != "") {
                            //jfCL = "{  \"Table\": [    {      \"DESCR\": \"Executive\",      \"DESCRSHORT\": \"Exec\"    },    {      \"DESCR\": \"Management\",      \"DESCRSHORT\": \"Mgmnt\"    },    {      \"DESCR\": \"Officer\",      \"DESCRSHORT\": \"Officer\"    },    {      \"DESCR\": \"Professional/Technical\",      \"DESCRSHORT\": \"Prof/Tech\"    },    {      \"DESCR\": \"Service/ Support\",      \"DESCRSHORT\": \"Svc Supp\"    }  ]}";
                            $scope.JFCL = jfCL;
                            angular.forEach(JSON.parse($scope.JFCL).Table, function (clValue, clKey) {
                                GetJobFamilyContent(JFAccountabilityUrl + "?JobSubFamily=" + $scope.selectedSF + "&CareerLevel=" + clValue.DESCR).then(
                                    function (jfAcc) {
                                        if (jfAcc != "") {
                                            //jfAcc = "{  \"Table\": [    {      \"COMMENTS\": \"Manages customer service functions such as telephone support, customer correspondence and/or research functions to ensure smooth and effective delivery of service;\",      \"DESCR\": \"Executive\",      \"DESCR1\": \"Account Services\",      \"DESCRSHORT\": \"Exec\",      \"CC_SUB_FAMILY\": \"ACTSVC\",      \"CC_CAREER_GROUP\": \"EXEC\",      \"PRINT_COL\": 1.0    },    {      \"COMMENTS\": \"Develops, implements, and improves procedures through identification of operational, sales and technological processes that are having an impact on customer satisfaction and call center efficiency.\",      \"DESCR\": \"Executive\",      \"DESCR1\": \"Account Services\",      \"DESCRSHORT\": \"Exec\",      \"CC_SUB_FAMILY\": \"ACTSVC\",      \"CC_CAREER_GROUP\": \"EXEC\",      \"PRINT_COL\": 2.0    },    {      \"COMMENTS\": \"Administers, coordinates and directs customer service operations and policies;\",      \"DESCR\": \"Executive\",      \"DESCR1\": \"Account Services\",      \"DESCRSHORT\": \"Exec\",      \"CC_SUB_FAMILY\": \"ACTSVC\",      \"CC_CAREER_GROUP\": \"EXEC\",      \"PRINT_COL\": 3.0    },    {      \"COMMENTS\": \"Assists customer service representatives with complex customer service issues; approves special prices concessions, quotes, bid allowance, adjustments or other special requests;\",      \"DESCR\": \"Executive\",      \"DESCR1\": \"Account Services\",      \"DESCRSHORT\": \"Exec\",      \"CC_SUB_FAMILY\": \"ACTSVC\",      \"CC_CAREER_GROUP\": \"EXEC\",      \"PRINT_COL\": 4.0    },    {      \"COMMENTS\": \"Handles escalated and unresolved calls;\",      \"DESCR\": \"Executive\",      \"DESCR1\": \"Account Services\",      \"DESCRSHORT\": \"Exec\",      \"CC_SUB_FAMILY\": \"ACTSVC\",      \"CC_CAREER_GROUP\": \"EXEC\",      \"PRINT_COL\": 5.0    },    {      \"COMMENTS\": \"Monitors and evaluates the quality of inbound and outbound telephone calls;\",      \"DESCR\": \"Executive\",      \"DESCR1\": \"Account Services\",      \"DESCRSHORT\": \"Exec\",      \"CC_SUB_FAMILY\": \"ACTSVC\",      \"CC_CAREER_GROUP\": \"EXEC\",      \"PRINT_COL\": 6.0    },    {      \"COMMENTS\": \"Develops, reviews, and maintains department budget to ensure cost effective operations;\",      \"DESCR\": \"Executive\",      \"DESCR1\": \"Account Services\",      \"DESCRSHORT\": \"Exec\",      \"CC_SUB_FAMILY\": \"ACTSVC\",      \"CC_CAREER_GROUP\": \"EXEC\",      \"PRINT_COL\": 7.0    },    {      \"COMMENTS\": \"Partners with other managers to develop effective departmental and system strategies;\",      \"DESCR\": \"Executive\",      \"DESCR1\": \"Account Services\",      \"DESCRSHORT\": \"Exec\",      \"CC_SUB_FAMILY\": \"ACTSVC\",      \"CC_CAREER_GROUP\": \"EXEC\",      \"PRINT_COL\": 8.0    },    {      \"COMMENTS\": \"Supervises staff; responsible for coaching, training, and developing subordinate staff.  Assigns work, sets completion dates, reviews work and manager performance in accordance with organizational policies, procedures, and performance manager processes.\",      \"DESCR\": \"Executive\",      \"DESCR1\": \"Account Services\",      \"DESCRSHORT\": \"Exec\",      \"CC_SUB_FAMILY\": \"ACTSVC\",      \"CC_CAREER_GROUP\": \"EXEC\",      \"PRINT_COL\": 9.0    },    {      \"COMMENTS\": \"Facilitates resolution of highest level of escalated or sensitive customer complaints through verbal or written contact with customers using broad discretion;\",      \"DESCR\": \"Executive\",      \"DESCR1\": \"Account Services\",      \"DESCRSHORT\": \"Exec\",      \"CC_SUB_FAMILY\": \"ACTSVC\",      \"CC_CAREER_GROUP\": \"EXEC\",      \"PRINT_COL\": 10.0    },    {      \"COMMENTS\": \"Provides advanced customer support;\",      \"DESCR\": \"Executive\",      \"DESCR1\": \"Account Services\",      \"DESCRSHORT\": \"Exec\",      \"CC_SUB_FAMILY\": \"ACTSVC\",      \"CC_CAREER_GROUP\": \"EXEC\",      \"PRINT_COL\": 11.0    },    {      \"COMMENTS\": \"Negotiates with customers to resolve issues while maintaining positive business relationships.\",      \"DESCR\": \"Executive\",      \"DESCR1\": \"Account Services\",      \"DESCRSHORT\": \"Exec\",      \"CC_SUB_FAMILY\": \"ACTSVC\",      \"CC_CAREER_GROUP\": \"EXEC\",      \"PRINT_COL\": 12.0    },    {      \"COMMENTS\": \"Acts as a liaison with various departments to ensure customer complaints are resolved satisfactorily.\",      \"DESCR\": \"Executive\",      \"DESCR1\": \"Account Services\",      \"DESCRSHORT\": \"Exec\",      \"CC_SUB_FAMILY\": \"ACTSVC\",      \"CC_CAREER_GROUP\": \"EXEC\",      \"PRINT_COL\": 13.0    }  ]}";
                                            JFAccountability.JFAcc.push(JSON.parse(jfAcc).Table);

                                            //GetJobFamilyContent($scope.JFSDescUrl + "?value=" + shValue.DESCR1 + "").then( //Job Sub Family Description

                                            $scope.safeApply(function () {
                                                $scope.JFAccountability = JFAccountability.JFAcc;
                                            });
                                        }
                                    }
                                )
                                
                            });
                            
                        }
                    }
                )
            }
            
        }
    }
    /*
    function GetJobFamilyContent(restUrl) {
        var deferred = $.Deferred();

        if (restUrl != "") {
            deferred.resolve("test");
        }
        else {
            deferred.reject("error");
        }

        return deferred.promise();
    }
     */
    
    //Execute Job Family REST Urls
    function GetJobFamilyContent(restUrl) {
        var deferred = $.Deferred();

        jQuery.ajax({
            url: encodeURI(restUrl),
            type: "GET",
            crossDomain: true,
            headers: {
                "accept": "application/json;odata=verbose",
            },
            success: function (data) {
                if (data.Value != "" && typeof (JSON.parse(data.Value).Table) !== "undefined" && JSON.parse(data.Value).Table.length > 0) {
                    deferred.resolve(data.Value);
                }
                else {
                    deferred.resolve("");
                 }
            },
            error: function (error) {
                CCI_Common.LogException(_spPageContextInfo.userLoginName, "CCI-myHR_WidgetPreferences.js--GetJobFamilyContent--REST Url: " + restUrl, _spPageContextInfo.serverRequestPath, JSON.stringify(error));
                deferred.reject(error);
            }
        });
        return deferred.promise();
    }

    $scope.safeApply = function (fn) {
        var phase = this.$root.$$phase;
        if (phase == '$apply' || phase == '$digest') {
            if (fn && (typeof (fn) === 'function')) {
                fn();
            }
        } else {
            this.$apply(fn);
        }
    };
    
   
});

