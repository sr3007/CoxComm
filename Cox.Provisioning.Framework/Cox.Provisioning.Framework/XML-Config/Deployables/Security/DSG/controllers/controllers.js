
//App Controller
(function () {
   'use strict';
   var controllerId = 'appCtrlr';
   var query = "";
   var usersFromUPA = [];
   var uniqueUPAUsers = [];
   var usersFromWS = [];
   var uniqueWSUsers = [];
   var usersList = "";
   var groupId;
   var roleDefinitionId;
   var selectedCriteriaJSON;
   var userAccountName = "";

   angular.module('app').controller(controllerId, ['$scope','$timeout', '$route','$location','$routeParams', appCtrlr]);
   
   function appCtrlr($scope, $timeout, $route) {
      var vm = this;
      vm.context = null;
      vm.terms = [];
      vm.termsAutoAllowanceLevel = [];
      vm.termsBusinessUnit = [];
      vm.termsCareerLevel = [];
      vm.termsCommissioned = [];
      vm.termsDepartment = [];
      vm.termsFLSAStatus = [];
      vm.termsHighlyCompensated = [];
      vm.termsJobCode = [];
      vm.termsJobFamily = [];
      vm.termsJobSubfamily = [];
      vm.termsLocation = [];
      vm.termsManagerLevel = [];
      vm.termsOperationDept = [];
      vm.termsOperationDeptSL = [];
      vm.termsRegionalBU = [];
      vm.termsRegularTemp = [];
      vm.termsTimeReportStatus = [];
      vm.termsTimeReportIndicator = [];
      vm.termsTaskGroup = [];
      vm.termsHireDate = [];
      vm.uppItems;

       //The data model for the taxonomy picker requires an array of values. Each value 
      //represents a term, and has the Id and Name properties. The Id property takes the 
       //terms TermGuid and the Name property correlates to the terms Label property.    
       //vm.businessUnitTerms = [{ Id: "a6b38a76-9cc2-4825-9773-6955b4758751", Name: "" }];
      //vm.termsAutoAllowanceLevel = [{ Id: "e33b48af-05ba-45ef-9055-50cd395f3172", Name: "AAL3" }];
      vm.loadTaxonomyPickers = true;

      //$scope.groupName = "CCI-";

      $scope.usersToAdd = [];
      $scope.originalUsersToAdd = [];

      $scope.hideUsersList = false;

       //Options for Managed Metadata Columns
      $scope.compareOptionsForMMD = [{
          id: "==",
          name: "Equal to"
      }, {
          id: "!=",
          name: "Not equal to"
      }, {
          id: ">=",
          name: "Greater than or equal to"
      }, {
          id: "<=",
          name: "Less than or equal to"
      }];

       //Options for Date Columns
      $scope.compareOptionsForDate = [{
          id: "==",
          name: "Equal to"
      }, {
          id: "!=",
          name: "Not equal to"
      }, {
          id: ">=",
          name: "Greater than or equal to"
      }, {
          id: "<=",
          name: "Less than or equal to"
      }];


       //Default to 'Equal to'
      $scope.aalSelectedOption = "==";
      $scope.buSelectedOption = "==";
      $scope.clSelectedOption = "==";
      $scope.deptSelectedOption = "==";
      $scope.commissionedSelectedOption = "==";
      $scope.flsaSelectedOption = "==";
      $scope.highlyComSelectedOption = "==";
      $scope.jobCodeSelectedOption = "==";
      $scope.jobFamilySelectedOption = "==";
      $scope.jobSubfamilySelectedOption = "==";
      $scope.locationSelectedOption = "==";
      $scope.mgrLevelSelectedOption = "==";
      $scope.oprDeptSelectedOption = "==";
      $scope.oprDeptSLSelectedOption = "==";
      $scope.regionalBUSelectedOption = "==";
      $scope.regularTempSelectedOption = "==";
      $scope.timeReportStatusSelectedOption = "==";
      $scope.timeReportIndicatorSelectedOption = "==";
      $scope.taskGroupSelectedOption = "==";
      $scope.hireDateSelectedOption = "==";
      $scope.jobEntryDateSelectedOption = "==";
      $scope.lastStartDateSelectedOption = "==";
      $scope.rehireDateSelectedOption = "==";
      $scope.serviceDateSelectedOption = "==";
     
       //Default to "And"
      $scope.aalAndOr = "And";
      $scope.buAndOr = "And";
      $scope.clAndOr = "And";
      $scope.comAndOr = "And";
      $scope.deptAndOr = "And";
      $scope.flsaAndOr = "And";
      $scope.highlyComAndOr = "And";
      $scope.jobCodeAndOr = "And";
      $scope.jobFamilyAndOr = "And";
      $scope.jobSubfamilyAndOr = "And";
      $scope.locationAndOr = "And";
      $scope.managerLevelAndOr = "And";
      $scope.oprDeptAndOr = "And";
      $scope.oprDeptSLAndOr = "And";
      $scope.regionalBUAndOr = "And";
      $scope.regularTempAndOr = "And";
      $scope.timeReportStatusAndOr = "And";
      $scope.timeReportIndicatorAndOr = "And";
      $scope.taskGroupAndOr = "And";
      $scope.hireDateAndOr = "And";
      $scope.jobEntryAndOr = "And";
      $scope.lastStartAndOr = "And";
      $scope.rehireAndOr = "And";
      $scope.serviceAndOr = "And";

      $scope.dateHireDate = "";
      $scope.dateJobEntry = "";
      $scope.dateLastStart = "";
      $scope.dateRehire = "";
      $scope.dateService = "";

      $scope.statusMessages = "";
		
		$scope.safeApply = function(fn) {
          var phase = this.$root.$$phase;
          if(phase == '$apply' || phase == '$digest') {
            if(fn && (typeof(fn) === 'function')) {
              fn();
            }
          } else {
            this.$apply(fn);
          }
        };
      

      $scope.reloadWithTemplates = function () {
          parseJSON();
      };

      function GetConfig(configKey) {
          if (window.sessionStorage.getItem("DSGConfigData") != null) {
              var DSGConfigData = [];
              DSGConfigData = JSON.parse(window.sessionStorage.getItem("DSGConfigData"));
              if (DSGConfigData.length > 0) {
                  for (var count = 0; count < DSGConfigData.length; count++) {
                      if (DSGConfigData[count].Key === configKey) {
                          return DSGConfigData[count].Value;
                          break;
                      }
                  }
              }
              return "";
          }
          else {
              GetConfigUsingREST().then(
                  function (dsgConfigData) {
                      if (typeof (Storage) !== "undefined") {
                          //Browser supports Local Storage
                          window.sessionStorage.setItem("DSGConfigData", JSON.stringify(dsgConfigData));

                          if (window.sessionStorage.getItem("DSGConfigData") != null) {
                              var DSGConfigData = [];
                              DSGConfigData = JSON.parse(window.sessionStorage.getItem("DSGConfigData"));
                              if (DSGConfigData.length > 0) {
                                  for (var count = 0; count < DSGConfigData.length; count++) {
                                      if (DSGConfigData[count].Key === configKey) {
                                          return DSGConfigData[count].Value;
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
      }

      function GetConfigUsingREST() {
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

      $scope.myFunc = function () {
          //ExecuteOrDelayUntilScriptLoaded(function () { CreateGroupJSOM(); }, "sp.js");
          $scope.safeApply(function () {
              $scope.hideUsersList = false;
          });
          $scope.hideUsersList = false;
          $scope.usersToAdd = angular.copy($scope.originalUsersToAdd);
          checkForGroup($scope.groupName);
          //parseJSON();
      };

       //Check whether SPGroups exists or not
      function checkForGroup(grpName) {
          var url = _spPageContextInfo.siteAbsoluteUrl + "/_api/web/sitegroups/getbyname('" + grpName + "')";
          jQuery.ajax({
              url: url,
              type: "GET",
              headers: {
                  "accept": "application/json;odata=verbose",
                  "content-type": "application/json;odata=verbose"
              },
              success: function (data) {
                  $scope.safeApply(function () {
                      $scope.statusMessages = "SharePoint security group <b>'" + grpName + "'</b> already exists. Please enter different name and try again. <br />";

                  });
              },
              error: function (jqxr, errorCode, errorThrown) {
                  //alert(jqxr.responseText);
                  $scope.safeApply(function () {
                      $scope.statusMessages = "Checking user profile for the users matching the selected criteria <br />";
                  });
                  getUsersFromWS();
                  //CreateSPGroupREST();
              }
          });
      }

      function getUsersFromWS() {
          usersFromWS = [];
          uniqueWSUsers = [];
          query = BuildQueryJSON();
          var restUrl = GetConfig("Get Users REST");

          if (query != "" && restUrl != "") {
              jQuery.ajax(
              {
                  url: restUrl,
                  type: "POST",
                  crossDomain: true,
                  data: query,
                  headers: {
                      "accept": "application/json;odata=verbose",
                  },
                  success: function (data) {
                    /*  data = { "Table": [{ "Email": "QAU21SER81@cox.com", "UserName": "qauser, eightyone" }, { "Email": "QAUSER85@coxcomminc.onmicrosoft.com", "UserName": "qauser, eightyfive" }] };
                      if (data != null) {
                          var results = data.Table;
                          var accountName = "";
                          var preferredName = "";
                          for (var i = 0; i < results.length; i++) {
                              accountName = results[i].Email;
                              preferredName = results[i].UserName;
                              usersFromUPA.push(accountName + ";;;" + preferredName);
                              accountName = "";
                              preferredName = "";
                          }
                          //Unique Used Ids
                          $.each(usersFromUPA, function (i, el) {
                              if ($.inArray(el, uniqueUPAUsers) === -1) uniqueUPAUsers.push(el);
                          });
                          if (typeof uniqueUPAUsers != "undefined" && uniqueUPAUsers != null && uniqueUPAUsers.length > 0) {
                              CreateSPGroupREST();
                          }

                      }*/
                      //data.Value  -----------       "{"Table":[{"Email":"xx_Ceanne.Guerra@cox.com","UserName":"Guerra, Ceanne"},{"Email":"xx_Roy.MullerII@cox.com","UserName":"Muller, Roy"},{"Email":"xx_Jessica.Carver@cox.com","UserName":"Carver, Jessica"},{"Email":"xx_Juergen.Barbusca@cox.com","UserName":"Barbusca, Juergen"},{"Email":"xx_Patricia.Thompson@cox.com","UserName":"Thompson, Patricia"},{"Email":"xx_Margaret-Hunter.Wade@cox.com","UserName":"Wade, Margaret-Hunter"},{"Email":"xx_Eric.Wagner2@cox.com","UserName":"Wagner, Eric"},{"Email":"xx_MyMy.Lu@cox.com","UserName":"Lu, My"},{"Email":"xx_Sharon.Bethea@cox.com","UserName":"Bethea, Sharon"},{"Email":"xx_Autumn.VanDenBerg@cox.com","UserName":"Van Den Berg, Autumn"},{"Email":"xx_Sarah.Buck@cox.com","UserName":"Buck, Sarah"},{"Email":"xx_Cam.Johnson@cox.com","UserName":"Johnson, Cameron"},{"Email":"QAUSER81@cox.com","UserName":"qauser, eightyone"},{"Email":"xx_Kirsten.Mclaughlin@cox.com","UserName":"McLaughlin, Kirsten"}]}"
                    if (data != null && data.Value != "" && JSON.parse(data.Value).Table.length > 0) {
                          var results = JSON.parse(data.Value).Table;
                          var accountName = "";
                          var preferredName = "";
                          for (var i = 0; i < results.length; i++) {
                              accountName = results[i].Email;
                              preferredName = results[i].UserName;
                              usersFromUPA.push(accountName + ";;;" + preferredName);
                              accountName = "";
                              preferredName = "";
                          }
                          //Unique Used Ids
                          $.each(usersFromUPA, function (i, el) {
                              if ($.inArray(el, uniqueUPAUsers) === -1) uniqueUPAUsers.push(el);
                          });
                          if (typeof uniqueUPAUsers != "undefined" && uniqueUPAUsers != null && uniqueUPAUsers.length > 0) {
                              CreateSPGroupREST();
                          }

                      }
                      else {
                          $scope.safeApply(function () {
                              $scope.statusMessages += "No users found. <br />";
                          });
                          //AddtoDSGListREST("");
                      }
          /*            if (data.d.query.PrimaryQueryResult != null) {
                          var results = data.d.query.PrimaryQueryResult.RelevantResults.Table.Rows.results;
                          if (results.length > 0) {
                              var accountName = "";
                              var preferredName = "";
                              for (var i = 0; i < results.length; i++) {
                                  for (var keys = 0; keys < results[i].Cells.results.length; keys++) {
                                      if (results[i].Cells.results[keys]["Key"] != null && typeof (results[i].Cells.results[keys]["Key"] != "undefined")) {
                                          if (results[i].Cells.results[keys]["Key"] == "AccountName") {
                                              accountName = results[i].Cells.results[keys].Value;
                                          }
                                          if (results[i].Cells.results[keys]["Key"] == "PreferredName") {
                                              preferredName = results[i].Cells.results[keys].Value;
                                          }
                                          if (accountName != "" && typeof (accountName) !== "undefined" && preferredName != "" && typeof (preferredName) !== "undefined") {
                                              usersFromUPA.push(accountName + ";;;" + preferredName);
                                              accountName = "";
                                              preferredName = "";
                                              break;
                                          }

                                      }
                                  }
                              }
                              //Unique Used Ids
                              $.each(usersFromUPA, function (i, el) {
                                  if ($.inArray(el, uniqueUPAUsers) === -1) uniqueUPAUsers.push(el);
                              });
                              if (typeof uniqueUPAUsers != "undefined" && uniqueUPAUsers != null && uniqueUPAUsers.length > 0) {
                                  CreateSPGroupREST();
                              }
                          }
                          else {
                              $scope.$apply(function () {
                                  $scope.statusMessages += "No users found. <br />";
                              });
                              AddtoDSGListREST("");

                          }
                      }
                      else {
                          $scope.$apply(function () {
                              $scope.statusMessages += "No users found. <br />";
                          });
                          AddtoDSGListREST("");
                      } */
                  },
                  error: function (jqxr, errorCode, errorThrown) {
                      $scope.safeApply(function () {
                          $scope.statusMessages += "Failed to get users from User Profile. Error: " + jqxr.responseText + "<br />";
                      });
                      var data = { "Table": [{ "Email": "QAUS23ER81@cox.com", "UserName": "qauser, eightyone" }, { "Email": "QAUSER85@coxcomminc.onmicrosoft.com", "UserName": "qauser, eightyfive" }, { "Email": "QAUSER81@coxcomminc.onmicrosoft.com", "UserName": "qauser, eightyone" }, { "Email": "QAUSER73@coxcomminc.onmicrosoft.com", "UserName": "qauser, seventythree" }, { "Email": "QAUS23ER81@coxcomminc.onmicrosoft.com", "UserName": "qauser, eightyone" }] };
                      if (data != null) {
                          var results = data.Table;
                          var accountName = "";
                          var preferredName = "";
                          for (var i = 0; i < results.length; i++) {
                              accountName = results[i].Email;
                              preferredName = results[i].UserName;
                              usersFromUPA.push(accountName + ";;;" + preferredName);
                              accountName = "";
                              preferredName = "";
                          }
                          //Unique Used Ids
                          $.each(usersFromUPA, function (i, el) {
                              if ($.inArray(el, uniqueUPAUsers) === -1) uniqueUPAUsers.push(el);
                          });
                          if (typeof uniqueUPAUsers != "undefined" && uniqueUPAUsers != null && uniqueUPAUsers.length > 0) {
                              CreateSPGroupREST();
                          }

                      }
                  }
              });
          }
          else {
              $scope.safeApply(function () {
                  $scope.statusMessages += "Query/REST URL is not valid<br />";
              });
          }
      }

       //Executes query to get users from User Profile Service
      function getUsersFromUPA() {
          usersFromUPA = [];
          uniqueUPAUsers = [];
          query = BuildQueryJSON();
          //query = BuildQueryREST();
          if (query.length > 0) {
              jQuery.ajax(
              {
                  url: query,
                  method: "GET",
                  async: false,
                  headers: {
                      "accept": "application/json;odata=verbose",
                  },
                  success: function (data) {
                      if (data.d.query.PrimaryQueryResult != null) {
                          var results = data.d.query.PrimaryQueryResult.RelevantResults.Table.Rows.results;
                          if (results.length > 0) {
                              var accountName = "";
                              var preferredName = "";
                              for (var i = 0; i < results.length; i++) {
                                  for (var keys = 0; keys < results[i].Cells.results.length; keys++) {
                                      if (results[i].Cells.results[keys]["Key"] != null && typeof (results[i].Cells.results[keys]["Key"] != "undefined")) {
                                          if (results[i].Cells.results[keys]["Key"] == "AccountName") {
                                              accountName = results[i].Cells.results[keys].Value;
                                          }
                                          if (results[i].Cells.results[keys]["Key"] == "PreferredName") {
                                              preferredName = results[i].Cells.results[keys].Value;
                                          }
                                          if (accountName != "" && typeof (accountName) !== "undefined" && preferredName != "" && typeof (preferredName) !== "undefined") {
                                              usersFromUPA.push(accountName + ";;;" + preferredName);
                                              accountName = "";
                                              preferredName = "";
                                              break;
                                          }

                                      }
                                  }
                              }
                              //Unique Used Ids
                              $.each(usersFromUPA, function (i, el) {
                                  if ($.inArray(el, uniqueUPAUsers) === -1) uniqueUPAUsers.push(el);
                              });
                              if (typeof uniqueUPAUsers != "undefined" && uniqueUPAUsers != null && uniqueUPAUsers.length > 0) {
                                  CreateSPGroupREST();
                              }
                          }
                          else {
                              $scope.safeApply(function () {
                                  $scope.statusMessages += "No users found. <br />";
                              });
                              AddtoDSGListREST("");

                          }
                      }
                      else {
                          $scope.safeApply(function () {
                              $scope.statusMessages += "No users found. <br />";
                          });
                          AddtoDSGListREST("");
                      }
                  },
                  error: function (jqxr, errorCode, errorThrown) {
                      $scope.safeApply(function () {
                            $scope.statusMessages += "Failed to get users from User Profile. Error: " + jqxr.responseText + "<br />";
                        });
                  }
              });
          }
          else {
              $scope.safeApply(function () {
                  $scope.statusMessages += "Query empty<br />";
              });
          }
          
      }

       //Build Search Query based on the user selection criteria
      function BuildQueryJSON() {
          var userFinalSelection = {
              selections: []
          };

          var queryAnd = "";
          var queryOr = "";

          //Auto Allowance Level - CCI-PS-AUTO-ALLOWANCE-LEVEL
          if (vm.termsAutoAllowanceLevel.length > 0) {
              var selectedValues = "";
              var rdoSelection = "";
              var ddlSelection = "";

              var qryFS = "";
              if ($scope.aalSelectedOption == "==") {
                  ddlSelection = "==";
                  if (vm.termsAutoAllowanceLevel.length == 1) {
                      qryFS += "CCI-PS-AUTO-ALLOWANCE-LEVEL='" + vm.termsAutoAllowanceLevel[0].Name + "'";
                  }
                  else {
                      qryFS += " (";
                      for (var i = 0; i < vm.termsAutoAllowanceLevel.length; i++) {
                          qryFS += "CCI-PS-AUTO-ALLOWANCE-LEVEL='" + vm.termsAutoAllowanceLevel[i].Name + "' OR ";
                      }
                      qryFS = qryFS.slice(0, qryFS.lastIndexOf(" OR "));
                      qryFS += ") ";
                  }
              }
              else { //Not equal to
                  ddlSelection = "!=";

                  if (vm.termsAutoAllowanceLevel.length == 1) {
                      qryFS += "CCI-PS-AUTO-ALLOWANCE-LEVEL<>'" + vm.termsAutoAllowanceLevel[0].Name + "'";
                  }
                  else {
                      qryFS += " (";
                      for (var i = 0; i < vm.termsAutoAllowanceLevel.length; i++) {
                          qryFS += "CCI-PS-AUTO-ALLOWANCE-LEVEL<>'" + vm.termsAutoAllowanceLevel[i].Name + "' OR ";
                      }
                      qryFS = qryFS.slice(0, qryFS.lastIndexOf(" OR "));
                      qryFS += ") ";
                  }
              }
              if ($scope.aalAndOr == "And") {
                  rdoSelection = "And";
                  queryAnd += qryFS + " AND ";
              } else if ($scope.aalAndOr == "Or") {
                  rdoSelection = "Or";
                  queryOr += qryFS + " OR ";
              }

              var userSelection = new QuerySelection("CCI-PS-AUTO-ALLOWANCE-LEVEL", ddlSelection, selectedValues, rdoSelection, "MMD");
              userFinalSelection.selections.push(JSON.stringify(userSelection));
          }

          //Business Unit - business_unit
          if (vm.termsBusinessUnit.length > 0) {
              var selectedValues = "";
              var rdoSelection = "";
              var ddlSelection = "";

              var qryFS = "";
              if ($scope.buSelectedOption == "==") {
                  ddlSelection = "==";
                  if (vm.termsBusinessUnit.length == 1) {
                      qryFS += "business_unit='" + vm.termsBusinessUnit[0].Name + "'";
                  }
                  else {
                      qryFS += " (";
                      for (var i = 0; i < vm.termsBusinessUnit.length; i++) {
                          qryFS += "business_unit='" + vm.termsBusinessUnit[i].Name + "' OR ";
                      }
                      qryFS = qryFS.slice(0, qryFS.lastIndexOf(" OR "));
                      qryFS += ") ";
                  }
              }
              else { //Not equal to
                  ddlSelection = "!=";

                  if (vm.termsBusinessUnit.length == 1) {
                      qryFS += "business_unit<>'" + vm.termsBusinessUnit[0].Name + "'";
                  }
                  else {
                      qryFS += " (";
                      for (var i = 0; i < vm.termsBusinessUnit.length; i++) {
                          qryFS += "business_unit<>'" + vm.termsBusinessUnit[i].Name + "' OR ";
                      }
                      qryFS = qryFS.slice(0, qryFS.lastIndexOf(" OR "));
                      qryFS += ") ";
                  }
              }
              if ($scope.buAndOr == "And") {
                  rdoSelection = "And";
                  queryAnd += qryFS + " AND ";
              } else if ($scope.buAndOr == "Or") {
                  rdoSelection = "Or";
                  queryOr += qryFS + " OR ";
              }

              var userSelection = new QuerySelection("business_unit", ddlSelection, selectedValues, rdoSelection, "MMD");
              userFinalSelection.selections.push(JSON.stringify(userSelection));
          }

          //Career Level - cc_career_lvl
          if (vm.termsCareerLevel.length > 0) {
              var selectedValues = "";
              var rdoSelection = "";
              var ddlSelection = "";

              var qryCL = "";
              if ($scope.clSelectedOption == "==") {
                  ddlSelection = "==";
                  if (vm.termsCareerLevel.length == 1) {
                      qryCL += "cc_career_lvl='" + vm.termsCareerLevel[0].Name + "'";
                  }
                  else {
                      /*qryCL += " (";
                      for (var i = 0; i < vm.termsCareerLevel.length; i++) {
                          qryCL += "cc_career_lvl='" + vm.termsCareerLevel[i].Name + "' OR ";
                      }
                      qryCL = qryCL.slice(0, qryCL.lastIndexOf(" OR "));
                      qryCL += ") ";*/
                      qryCL += " (cc_career_lvl IN(";
                      for (var i = 0; i < vm.termsCareerLevel.length; i++) {
                          qryCL += "'" + vm.termsCareerLevel[i].Name + "',  ";
                      }
                      qryCL = qryCL.slice(0, qryCL.lastIndexOf(", "));
                      qryCL += ")) ";
                  }
              }
              else { //Not equal to
                  ddlSelection = "!=";

                  if (vm.termsCareerLevel.length == 1) {
                      qryCL += "cc_career_lvl<>'" + vm.termsCareerLevel[0].Name + "'";
                  }
                  else {
                      qryCL += " (";
                      for (var i = 0; i < vm.termsCareerLevel.length; i++) {
                          qryCL += "cc_career_lvl<>'" + vm.termsCareerLevel[i].Name + "' OR ";
                      }
                      qryCL = qryCL.slice(0, qryCL.lastIndexOf(" OR "));
                      qryCL += ") ";
                  }
              }
              if ($scope.clAndOr == "And") {
                  rdoSelection = "And";
                  queryAnd += qryCL + " AND ";
              } else if ($scope.clAndOr == "Or") {
                  rdoSelection = "Or";
                  queryOr += qryCL + " OR ";
              }

              var userSelection = new QuerySelection("cc_career_lvl", ddlSelection, selectedValues, rdoSelection, "MMD");
              userFinalSelection.selections.push(JSON.stringify(userSelection));
          }

          //Commissioned - CCI-PS-COMMISSIONED
          if (vm.termsCommissioned.length > 0) {
              var selectedValues = "";
              var rdoSelection = "";
              var ddlSelection = "";

              var qryFS = "";
              if ($scope.commissionedSelectedOption == "==") {
                  ddlSelection = "==";
                  if (vm.termsCommissioned.length == 1) {
                      qryFS += "CCI-PS-COMMISSIONED='" + vm.termsCommissioned[0].Name + "'";
                  }
                  else {
                      qryFS += " (";
                      for (var i = 0; i < vm.termsCommissioned.length; i++) {
                          qryFS += "CCI-PS-COMMISSIONED='" + vm.termsCommissioned[i].Name + "' OR ";
                      }
                      qryFS = qryFS.slice(0, qryFS.lastIndexOf(" OR "));
                      qryFS += ") ";
                  }
              }
              else { //Not equal to
                  ddlSelection = "!=";

                  if (vm.termsCommissioned.length == 1) {
                      qryFS += "CCI-PS-COMMISSIONED<>'" + vm.termsCommissioned[0].Name + "'";
                  }
                  else {
                      qryFS += " (";
                      for (var i = 0; i < vm.termsCommissioned.length; i++) {
                          qryFS += "CCI-PS-COMMISSIONED<>'" + vm.termsCommissioned[i].Name + "' OR ";
                      }
                      qryFS = qryFS.slice(0, qryFS.lastIndexOf(" OR "));
                      qryFS += ") ";
                  }
              }
              if ($scope.comAndOr == "And") {
                  rdoSelection = "And";
                  queryAnd += qryFS + " AND ";
              } else if ($scope.comAndOr == "Or") {
                  rdoSelection = "Or";
                  queryOr += qryFS + " OR ";
              }

              var userSelection = new QuerySelection("CCI-PS-COMMISSIONED", ddlSelection, selectedValues, rdoSelection, "MMD");
              userFinalSelection.selections.push(JSON.stringify(userSelection));
          }

          //Department - tcdepartment
          if (vm.termsDepartment.length > 0) {
              var selectedValues = "";
              var rdoSelection = "";
              var ddlSelection = "";

              var qryFS = "";
              if ($scope.deptSelectedOption == "==") {
                  ddlSelection = "==";
                  if (vm.termsDepartment.length == 1) {
                      qryFS += "tcdepartment='" + vm.termsDepartment[0].Name + "'";
                  }
                  else {
                      qryFS += " (";
                      for (var i = 0; i < vm.termsDepartment.length; i++) {
                          qryFS += "tcdepartment='" + vm.termsDepartment[i].Name + "' OR ";
                      }
                      qryFS = qryFS.slice(0, qryFS.lastIndexOf(" OR "));
                      qryFS += ") ";
                  }
              }
              else { //Not equal to
                  ddlSelection = "!=";

                  if (vm.termsDepartment.length == 1) {
                      qryFS += "tcdepartment<>'" + vm.termsDepartment[0].Name + "'";
                  }
                  else {
                      qryFS += " (";
                      for (var i = 0; i < vm.termsDepartment.length; i++) {
                          qryFS += "tcdepartment<>'" + vm.termsDepartment[i].Name + "' OR ";
                      }
                      qryFS = qryFS.slice(0, qryFS.lastIndexOf(" OR "));
                      qryFS += ") ";
                  }
              }
              if ($scope.deptAndOr == "And") {
                  rdoSelection = "And";
                  queryAnd += qryFS + " AND ";
              } else if ($scope.deptAndOr == "Or") {
                  rdoSelection = "Or";
                  queryOr += qryFS + " OR ";
              }

              var userSelection = new QuerySelection("tcdepartment", ddlSelection, selectedValues, rdoSelection, "MMD");
              userFinalSelection.selections.push(JSON.stringify(userSelection));
          }

          //FLSA Status - flsa_status
          if (vm.termsFLSAStatus.length > 0) {
              var selectedValues = "";
              var rdoSelection = "";
              var ddlSelection = "";

              var qryFS = "";
              if ($scope.flsaSelectedOption == "==") {
                  ddlSelection = "==";
                  if (vm.termsFLSAStatus.length == 1) {
                      qryFS += "flsa_status='" + vm.termsFLSAStatus[0].Name + "'";
                  }
                  else {
                      qryFS += " (";
                      for (var i = 0; i < vm.termsFLSAStatus.length; i++) {
                          qryFS += "flsa_status='" + vm.termsFLSAStatus[i].Name + "' OR ";
                      }
                      qryFS = qryFS.slice(0, qryFS.lastIndexOf(" OR "));
                      qryFS += ") ";
                  }
              }
              else { //Not equal to
                  ddlSelection = "!=";

                  if (vm.termsFLSAStatus.length == 1) {
                      qryFS += "flsa_status<>'" + vm.termsFLSAStatus[0].Name + "'";
                  }
                  else {
                      qryFS += " (";
                      for (var i = 0; i < vm.termsFLSAStatus.length; i++) {
                          qryFS += "flsa_status<>'" + vm.termsFLSAStatus[i].Name + "' OR ";
                      }
                      qryFS = qryFS.slice(0, qryFS.lastIndexOf(" OR "));
                      qryFS += ") ";
                  }
              }
              if ($scope.flsaAndOr == "And") {
                  rdoSelection = "And";
                  queryAnd += qryFS + " AND ";
              } else if ($scope.flsaAndOr == "Or") {
                  rdoSelection = "Or";
                  queryOr += qryFS + " OR ";
              }

              var userSelection = new QuerySelection("flsa_status", ddlSelection, selectedValues, rdoSelection, "MMD");
              userFinalSelection.selections.push(JSON.stringify(userSelection));
          }

          //Highly Compensated - empl_class
          if (vm.termsHighlyCompensated.length > 0) {
              var selectedValues = "";
              var rdoSelection = "";
              var ddlSelection = "";

              var qryFS = "";
              if ($scope.highlyComSelectedOption == "==") {
                  ddlSelection = "==";
                  if (vm.termsHighlyCompensated.length == 1) {
                      qryFS += "empl_class='" + vm.termsHighlyCompensated[0].Name + "'";
                  }
                  else {
                      qryFS += " (";
                      for (var i = 0; i < vm.termsHighlyCompensated.length; i++) {
                          qryFS += "empl_class='" + vm.termsHighlyCompensated[i].Name + "' OR ";
                      }
                      qryFS = qryFS.slice(0, qryFS.lastIndexOf(" OR "));
                      qryFS += ") ";
                  }
              }
              else { //Not equal to
                  ddlSelection = "!=";

                  if (vm.termsHighlyCompensated.length == 1) {
                      qryFS += "empl_class<>'" + vm.termsHighlyCompensated[0].Name + "'";
                  }
                  else {
                      qryFS += " (";
                      for (var i = 0; i < vm.termsHighlyCompensated.length; i++) {
                          qryFS += "empl_class<>'" + vm.termsHighlyCompensated[i].Name + "' OR ";
                      }
                      qryFS = qryFS.slice(0, qryFS.lastIndexOf(" OR "));
                      qryFS += ") ";
                  }
              }
              if ($scope.highlyComAndOr == "And") {
                  rdoSelection = "And";
                  queryAnd += qryFS + " AND ";
              } else if ($scope.highlyComAndOr == "Or") {
                  rdoSelection = "Or";
                  queryOr += qryFS + " OR ";
              }

              var userSelection = new QuerySelection("empl_class", ddlSelection, selectedValues, rdoSelection, "MMD");
              userFinalSelection.selections.push(JSON.stringify(userSelection));
          }

          //Job Code - jobcode_descr
          if (vm.termsJobCode.length > 0) {
              var selectedValues = "";
              var rdoSelection = "";
              var ddlSelection = "";

              var qryFS = "";
              if ($scope.jobCodeSelectedOption == "==") {
                  ddlSelection = "==";
                  if (vm.termsJobCode.length == 1) {
                      qryFS += "jobcode_descr='" + vm.termsJobCode[0].Name + "'";
                  }
                  else {
                      qryFS += " (";
                      for (var i = 0; i < vm.termsJobCode.length; i++) {
                          qryFS += "jobcode_descr='" + vm.termsJobCode[i].Name + "' OR ";
                      }
                      qryFS = qryFS.slice(0, qryFS.lastIndexOf(" OR "));
                      qryFS += ") ";
                  }
              }
              else { //Not equal to
                  ddlSelection = "!=";

                  if (vm.termsJobCode.length == 1) {
                      qryFS += "jobcode_descr<>'" + vm.termsJobCode[0].Name + "'";
                  }
                  else {
                      qryFS += " (";
                      for (var i = 0; i < vm.termsJobCode.length; i++) {
                          qryFS += "jobcode_descr<>'" + vm.termsJobCode[i].Name + "' OR ";
                      }
                      qryFS = qryFS.slice(0, qryFS.lastIndexOf(" OR "));
                      qryFS += ") ";
                  }
              }
              if ($scope.jobCodeAndOr == "And") {
                  rdoSelection = "And";
                  queryAnd += qryFS + " AND ";
              } else if ($scope.jobCodeAndOr == "Or") {
                  rdoSelection = "Or";
                  queryOr += qryFS + " OR ";
              }

              var userSelection = new QuerySelection("jobcode_descr", ddlSelection, selectedValues, rdoSelection, "MMD");
              userFinalSelection.selections.push(JSON.stringify(userSelection));
          }

          //Job Family - job_family
          if (vm.termsJobFamily.length > 0) {
              var selectedValues = "";
              var rdoSelection = "";
              var ddlSelection = "";

              var qryFS = "";
              if ($scope.jobFamilySelectedOption == "==") {
                  ddlSelection = "==";
                  if (vm.termsJobFamily.length == 1) {
                      qryFS += "job_family='" + vm.termsJobFamily[0].Name + "'";
                  }
                  else {
                      qryFS += " (";
                      for (var i = 0; i < vm.termsJobFamily.length; i++) {
                          qryFS += "job_family='" + vm.termsJobFamily[i].Name + "' OR ";
                      }
                      qryFS = qryFS.slice(0, qryFS.lastIndexOf(" OR "));
                      qryFS += ") ";
                  }
              }
              else { //Not equal to
                  ddlSelection = "!=";

                  if (vm.termsJobFamily.length == 1) {
                      qryFS += "job_family<>'" + vm.termsJobFamily[0].Name + "'";
                  }
                  else {
                      qryFS += " (";
                      for (var i = 0; i < vm.termsJobFamily.length; i++) {
                          qryFS += "job_family<>'" + vm.termsJobFamily[i].Name + "' OR ";
                      }
                      qryFS = qryFS.slice(0, qryFS.lastIndexOf(" OR "));
                      qryFS += ") ";
                  }
              }
              if ($scope.jobFamilyAndOr == "And") {
                  rdoSelection = "And";
                  queryAnd += qryFS + " AND ";
              } else if ($scope.jobFamilyAndOr == "Or") {
                  rdoSelection = "Or";
                  queryOr += qryFS + " OR ";
              }

              var userSelection = new QuerySelection("job_family", ddlSelection, selectedValues, rdoSelection, "MMD");
              userFinalSelection.selections.push(JSON.stringify(userSelection));
          }

          //Job Subfamily - cc_sub_family
          if (vm.termsJobSubfamily.length > 0) {
              var selectedValues = "";
              var rdoSelection = "";
              var ddlSelection = "";

              var qryFS = "";
              if ($scope.jobSubfamilySelectedOption == "==") {
                  ddlSelection = "==";
                  if (vm.termsJobSubfamily.length == 1) {
                      qryFS += "cc_sub_family='" + vm.termsJobSubfamily[0].Name + "'";
                  }
                  else {
                      qryFS += " (";
                      for (var i = 0; i < vm.termsJobSubfamily.length; i++) {
                          qryFS += "cc_sub_family='" + vm.termsJobSubfamily[i].Name + "' OR ";
                      }
                      qryFS = qryFS.slice(0, qryFS.lastIndexOf(" OR "));
                      qryFS += ") ";
                  }
              }
              else { //Not equal to
                  ddlSelection = "!=";

                  if (vm.termsJobSubfamily.length == 1) {
                      qryFS += "cc_sub_family<>'" + vm.termsJobSubfamily[0].Name + "'";
                  }
                  else {
                      qryFS += " (";
                      for (var i = 0; i < vm.termsJobSubfamily.length; i++) {
                          qryFS += "cc_sub_family<>'" + vm.termsJobSubfamily[i].Name + "' OR ";
                      }
                      qryFS = qryFS.slice(0, qryFS.lastIndexOf(" OR "));
                      qryFS += ") ";
                  }
              }
              if ($scope.jobSubfamilyAndOr == "And") {
                  rdoSelection = "And";
                  queryAnd += qryFS + " AND ";
              } else if ($scope.jobSubfamilyAndOr == "Or") {
                  rdoSelection = "Or";
                  queryOr += qryFS + " OR ";
              }

              var userSelection = new QuerySelection("cc_sub_family", ddlSelection, selectedValues, rdoSelection, "MMD");
              userFinalSelection.selections.push(JSON.stringify(userSelection));
          }

          //Location - tclocation
          if (vm.termsLocation.length > 0) {
              var selectedValues = "";
              var rdoSelection = "";
              var ddlSelection = "";

              var qryFS = "";
              if ($scope.locationSelectedOption == "==") {
                  ddlSelection = "==";
                  if (vm.termsLocation.length == 1) {
                      qryFS += "tclocation='" + vm.termsLocation[0].Name + "'";
                  }
                  else {
                      qryFS += " (";
                      for (var i = 0; i < vm.termsLocation.length; i++) {
                          qryFS += "tclocation='" + vm.termsLocation[i].Name + "' OR ";
                      }
                      qryFS = qryFS.slice(0, qryFS.lastIndexOf(" OR "));
                      qryFS += ") ";
                  }
              }
              else { //Not equal to
                  ddlSelection = "!=";

                  if (vm.termsLocation.length == 1) {
                      qryFS += "tclocation<>'" + vm.termsLocation[0].Name + "'";
                  }
                  else {
                      qryFS += " (";
                      for (var i = 0; i < vm.termsLocation.length; i++) {
                          qryFS += "tclocation<>'" + vm.termsLocation[i].Name + "' OR ";
                      }
                      qryFS = qryFS.slice(0, qryFS.lastIndexOf(" OR "));
                      qryFS += ") ";
                  }
              }
              if ($scope.locationAndOr == "And") {
                  rdoSelection = "And";
                  queryAnd += qryFS + " AND ";
              } else if ($scope.locationAndOr == "Or") {
                  rdoSelection = "Or";
                  queryOr += qryFS + " OR ";
              }

              var userSelection = new QuerySelection("tclocation", ddlSelection, selectedValues, rdoSelection, "MMD");
              userFinalSelection.selections.push(JSON.stringify(userSelection));
          }

          //Manager Level - manager_level_desc
          if (vm.termsManagerLevel.length > 0) {
              var selectedValues = "";
              var rdoSelection = "";
              var ddlSelection = "";

              var qryFS = "";
              if ($scope.mgrLevelSelectedOption == "==") {
                  ddlSelection = "==";
                  if (vm.termsManagerLevel.length == 1) {
                      qryFS += "manager_level_desc='" + vm.termsManagerLevel[0].Name + "'";
                  }
                  else {
                      qryFS += " (";
                      for (var i = 0; i < vm.termsManagerLevel.length; i++) {
                          qryFS += "manager_level_desc='" + vm.termsManagerLevel[i].Name + "' OR ";
                      }
                      qryFS = qryFS.slice(0, qryFS.lastIndexOf(" OR "));
                      qryFS += ") ";
                  }
              }
              else { //Not equal to
                  ddlSelection = "!=";

                  if (vm.termsManagerLevel.length == 1) {
                      qryFS += "manager_level_desc<>'" + vm.termsManagerLevel[0].Name + "'";
                  }
                  else {
                      qryFS += " (";
                      for (var i = 0; i < vm.termsManagerLevel.length; i++) {
                          qryFS += "manager_level_desc<>'" + vm.termsManagerLevel[i].Name + "' OR ";
                      }
                      qryFS = qryFS.slice(0, qryFS.lastIndexOf(" OR "));
                      qryFS += ") ";
                  }
              }
              if ($scope.managerLevelAndOr == "And") {
                  rdoSelection = "And";
                  queryAnd += qryFS + " AND ";
              } else if ($scope.managerLevelAndOr == "Or") {
                  rdoSelection = "Or";
                  queryOr += qryFS + " OR ";
              }

              var userSelection = new QuerySelection("manager_level_desc", ddlSelection, selectedValues, rdoSelection, "MMD");
              userFinalSelection.selections.push(JSON.stringify(userSelection));
          }

          //Operational Department - operational_dept
          if (vm.termsOperationDept.length > 0) {
              var selectedValues = "";
              var rdoSelection = "";
              var ddlSelection = "";

              var qryFS = "";
              if ($scope.oprDeptSelectedOption == "==") {
                  ddlSelection = "==";
                  if (vm.termsOperationDept.length == 1) {
                      qryFS += "operational_dept='" + vm.termsOperationDept[0].Name + "'";
                  }
                  else {
                      qryFS += " (";
                      for (var i = 0; i < vm.termsOperationDept.length; i++) {
                          qryFS += "operational_dept='" + vm.termsOperationDept[i].Name + "' OR ";
                      }
                      qryFS = qryFS.slice(0, qryFS.lastIndexOf(" OR "));
                      qryFS += ") ";
                  }
              }
              else { //Not equal to
                  ddlSelection = "!=";

                  if (vm.termsOperationDept.length == 1) {
                      qryFS += "operational_dept<>'" + vm.termsOperationDept[0].Name + "'";
                  }
                  else {
                      qryFS += " (";
                      for (var i = 0; i < vm.termsOperationDept.length; i++) {
                          qryFS += "operational_dept<>'" + vm.termsOperationDept[i].Name + "' OR ";
                      }
                      qryFS = qryFS.slice(0, qryFS.lastIndexOf(" OR "));
                      qryFS += ") ";
                  }
              }
              if ($scope.oprDeptAndOr == "And") {
                  rdoSelection = "And";
                  queryAnd += qryFS + " AND ";
              } else if ($scope.oprDeptAndOr == "Or") {
                  rdoSelection = "Or";
                  queryOr += qryFS + " OR ";
              }

              var userSelection = new QuerySelection("operational_dept", ddlSelection, selectedValues, rdoSelection, "MMD");
              userFinalSelection.selections.push(JSON.stringify(userSelection));
          }

          //Operational Department Sub ledger- oper_dept_subldg
          if (vm.termsOperationDeptSL.length > 0) {
              var selectedValues = "";
              var rdoSelection = "";
              var ddlSelection = "";

              var qryFS = "";
              if ($scope.oprDeptSLSelectedOption == "==") {
                  ddlSelection = "==";
                  if (vm.termsOperationDeptSL.length == 1) {
                      qryFS += "oper_dept_subldg='" + vm.termsOperationDeptSL[0].Name + "'";
                  }
                  else {
                      qryFS += " (";
                      for (var i = 0; i < vm.termsOperationDeptSL.length; i++) {
                          qryFS += "oper_dept_subldg='" + vm.termsOperationDeptSL[i].Name + "' OR ";
                      }
                      qryFS = qryFS.slice(0, qryFS.lastIndexOf(" OR "));
                      qryFS += ") ";
                  }
              }
              else { //Not equal to
                  ddlSelection = "!=";

                  if (vm.termsOperationDeptSL.length == 1) {
                      qryFS += "oper_dept_subldg<>'" + vm.termsOperationDeptSL[0].Name + "'";
                  }
                  else {
                      qryFS += " (";
                      for (var i = 0; i < vm.termsOperationDeptSL.length; i++) {
                          qryFS += "oper_dept_subldg<>'" + vm.termsOperationDeptSL[i].Name + "' OR ";
                      }
                      qryFS = qryFS.slice(0, qryFS.lastIndexOf(" OR "));
                      qryFS += ") ";
                  }
              }
              if ($scope.oprDeptSLAndOr == "And") {
                  rdoSelection = "And";
                  queryAnd += qryFS + " AND ";
              } else if ($scope.oprDeptSLAndOr == "Or") {
                  rdoSelection = "Or";
                  queryOr += qryFS + " OR ";
              }

              var userSelection = new QuerySelection("oper_dept_subldg", ddlSelection, selectedValues, rdoSelection, "MMD");
              userFinalSelection.selections.push(JSON.stringify(userSelection));
          }

          //Regional Business Unit - CCI-PS-REGIONAL-BUSINESS-UNIT-DESCRIPTION
          if (vm.termsRegionalBU.length > 0) {
              var selectedValues = "";
              var rdoSelection = "";
              var ddlSelection = "";

              var qryFS = "";
              if ($scope.regionalBUSelectedOption == "==") {
                  ddlSelection = "==";
                  if (vm.termsRegionalBU.length == 1) {
                      qryFS += "CCI-PS-REGIONAL-BUSINESS-UNIT-DESCRIPTION='" + vm.termsRegionalBU[0].Name + "'";
                  }
                  else {
                      qryFS += " (";
                      for (var i = 0; i < vm.termsRegionalBU.length; i++) {
                          qryFS += "CCI-PS-REGIONAL-BUSINESS-UNIT-DESCRIPTION='" + vm.termsRegionalBU[i].Name + "' OR ";
                      }
                      qryFS = qryFS.slice(0, qryFS.lastIndexOf(" OR "));
                      qryFS += ") ";
                  }
              }
              else { //Not equal to
                  ddlSelection = "!=";

                  if (vm.termsRegionalBU.length == 1) {
                      qryFS += "CCI-PS-REGIONAL-BUSINESS-UNIT-DESCRIPTION<>'" + vm.termsRegionalBU[0].Name + "'";
                  }
                  else {
                      qryFS += " (";
                      for (var i = 0; i < vm.termsRegionalBU.length; i++) {
                          qryFS += "CCI-PS-REGIONAL-BUSINESS-UNIT-DESCRIPTION<>'" + vm.termsRegionalBU[i].Name + "' OR ";
                      }
                      qryFS = qryFS.slice(0, qryFS.lastIndexOf(" OR "));
                      qryFS += ") ";
                  }
              }
              if ($scope.regionalBUAndOr == "And") {
                  rdoSelection = "And";
                  queryAnd += qryFS + " AND ";
              } else if ($scope.regionalBUAndOr == "Or") {
                  rdoSelection = "Or";
                  queryOr += qryFS + " OR ";
              }

              var userSelection = new QuerySelection("CCI-PS-REGIONAL-BUSINESS-UNIT-DESCRIPTION", ddlSelection, selectedValues, rdoSelection, "MMD");
              userFinalSelection.selections.push(JSON.stringify(userSelection));
          }

          //Regular Temp - reg_temp
          if (vm.termsRegularTemp.length > 0) {
              var selectedValues = "";
              var rdoSelection = "";
              var ddlSelection = "";

              var qryFS = "";
              if ($scope.regularTempSelectedOption == "==") {
                  ddlSelection = "==";
                  if (vm.termsRegularTemp.length == 1) {
                      qryFS += "reg_temp='" + vm.termsRegularTemp[0].Name + "'";
                  }
                  else {
                      qryFS += " (";
                      for (var i = 0; i < vm.termsRegularTemp.length; i++) {
                          qryFS += "reg_temp='" + vm.termsRegularTemp[i].Name + "' OR ";
                      }
                      qryFS = qryFS.slice(0, qryFS.lastIndexOf(" OR "));
                      qryFS += ") ";
                  }
              }
              else { //Not equal to
                  ddlSelection = "!=";

                  if (vm.termsRegularTemp.length == 1) {
                      qryFS += "reg_temp<>'" + vm.termsRegularTemp[0].Name + "'";
                  }
                  else {
                      qryFS += " (";
                      for (var i = 0; i < vm.termsRegularTemp.length; i++) {
                          qryFS += "reg_temp<>'" + vm.termsRegularTemp[i].Name + "' OR ";
                      }
                      qryFS = qryFS.slice(0, qryFS.lastIndexOf(" OR "));
                      qryFS += ") ";
                  }
              }
              if ($scope.regularTempAndOr == "And") {
                  rdoSelection = "And";
                  queryAnd += qryFS + " AND ";
              } else if ($scope.regularTempAndOr == "Or") {
                  rdoSelection = "Or";
                  queryOr += qryFS + " OR ";
              }

              var userSelection = new QuerySelection("reg_temp", ddlSelection, selectedValues, rdoSelection, "MMD");
              userFinalSelection.selections.push(JSON.stringify(userSelection));
          }

          //Time Reporting Status - time_rptg_status
          if (vm.termsTimeReportStatus.length > 0) {
              var selectedValues = "";
              var rdoSelection = "";
              var ddlSelection = "";

              var qryFS = "";
              if ($scope.timeReportStatusSelectedOption == "==") {
                  ddlSelection = "==";
                  if (vm.termsTimeReportStatus.length == 1) {
                      qryFS += "time_rptg_status='" + vm.termsTimeReportStatus[0].Name + "'";
                  }
                  else {
                      qryFS += " (";
                      for (var i = 0; i < vm.termsTimeReportStatus.length; i++) {
                          qryFS += "time_rptg_status='" + vm.termsTimeReportStatus[i].Name + "' OR ";
                      }
                      qryFS = qryFS.slice(0, qryFS.lastIndexOf(" OR "));
                      qryFS += ") ";
                  }
              }
              else { //Not equal to
                  ddlSelection = "!=";

                  if (vm.termsTimeReportStatus.length == 1) {
                      qryFS += "time_rptg_status<>'" + vm.termsTimeReportStatus[0].Name + "'";
                  }
                  else {
                      qryFS += " (";
                      for (var i = 0; i < vm.termsTimeReportStatus.length; i++) {
                          qryFS += "time_rptg_status<>'" + vm.termsTimeReportStatus[i].Name + "' OR ";
                      }
                      qryFS = qryFS.slice(0, qryFS.lastIndexOf(" OR "));
                      qryFS += ") ";
                  }
              }
              if ($scope.timeReportStatusAndOr == "And") {
                  rdoSelection = "And";
                  queryAnd += qryFS + " AND ";
              } else if ($scope.timeReportStatusAndOr == "Or") {
                  rdoSelection = "Or";
                  queryOr += qryFS + " OR ";
              }

              var userSelection = new QuerySelection("time_rptg_status", ddlSelection, selectedValues, rdoSelection, "MMD");
              userFinalSelection.selections.push(JSON.stringify(userSelection));
          }

          //Time Reporting Indicator - time_rptr_ind
          if (vm.termsTimeReportIndicator.length > 0) {
              var selectedValues = "";
              var rdoSelection = "";
              var ddlSelection = "";

              var qryFS = "";
              if ($scope.timeReportIndicatorSelectedOption == "==") {
                  ddlSelection = "==";
                  if (vm.termsTimeReportIndicator.length == 1) {
                      qryFS += "time_rptr_ind='" + vm.termsTimeReportIndicator[0].Name + "'";
                  }
                  else {
                      qryFS += " (";
                      for (var i = 0; i < vm.termsTimeReportIndicator.length; i++) {
                          qryFS += "time_rptr_ind='" + vm.termsTimeReportIndicator[i].Name + "' OR ";
                      }
                      qryFS = qryFS.slice(0, qryFS.lastIndexOf(" OR "));
                      qryFS += ") ";
                  }
              }
              else { //Not equal to
                  ddlSelection = "!=";

                  if (vm.termsTimeReportIndicator.length == 1) {
                      qryFS += "time_rptr_ind<>'" + vm.termsTimeReportIndicator[0].Name + "'";
                  }
                  else {
                      qryFS += " (";
                      for (var i = 0; i < vm.termsTimeReportIndicator.length; i++) {
                          qryFS += "time_rptr_ind<>'" + vm.termsTimeReportIndicator[i].Name + "' OR ";
                      }
                      qryFS = qryFS.slice(0, qryFS.lastIndexOf(" OR "));
                      qryFS += ") ";
                  }
              }
              if ($scope.timeReportIndicatorAndOr == "And") {
                  rdoSelection = "And";
                  queryAnd += qryFS + " AND ";
              } else if ($scope.timeReportIndicatorAndOr == "Or") {
                  rdoSelection = "Or";
                  queryOr += qryFS + " OR ";
              }

              var userSelection = new QuerySelection("time_rptr_ind", ddlSelection, selectedValues, rdoSelection, "MMD");
              userFinalSelection.selections.push(JSON.stringify(userSelection));
          }

          //Task Group - taskgroup
          if (vm.termsTaskGroup.length > 0) {
              var selectedValues = "";
              var rdoSelection = "";
              var ddlSelection = "";

              var qryFS = "";
              if ($scope.taskGroupSelectedOption == "==") {
                  ddlSelection = "==";
                  if (vm.termsTaskGroup.length == 1) {
                      qryFS += "taskgroup='" + vm.termsTaskGroup[0].Name + "'";
                  }
                  else {
                      qryFS += " (";
                      for (var i = 0; i < vm.termsTaskGroup.length; i++) {
                          qryFS += "taskgroup='" + vm.termsTaskGroup[i].Name + "' OR ";
                      }
                      qryFS = qryFS.slice(0, qryFS.lastIndexOf(" OR "));
                      qryFS += ") ";
                  }
              }
              else { //Not equal to
                  ddlSelection = "!=";

                  if (vm.termsTaskGroup.length == 1) {
                      qryFS += "taskgroup<>'" + vm.termsTaskGroup[0].Name + "'";
                  }
                  else {
                      qryFS += " (";
                      for (var i = 0; i < vm.termsTaskGroup.length; i++) {
                          qryFS += "taskgroup<>'" + vm.termsTaskGroup[i].Name + "' OR ";
                      }
                      qryFS = qryFS.slice(0, qryFS.lastIndexOf(" OR "));
                      qryFS += ") ";
                  }
              }
              if ($scope.taskGroupAndOr == "And") {
                  rdoSelection = "And";
                  queryAnd += qryFS + " AND ";
              } else if ($scope.taskGroupAndOr == "Or") {
                  rdoSelection = "Or";
                  queryOr += qryFS + " OR ";
              }

              var userSelection = new QuerySelection("taskgroup", ddlSelection, selectedValues, rdoSelection, "MMD");
              userFinalSelection.selections.push(JSON.stringify(userSelection));
          }

          //Hire Date - hire_dt
          if ($scope.dateHireDate != "") {
              var rdoSelection = "";
              var ddlSelection = "";

              var qryFS = "";

              if ($scope.hireDateSelectedOption == "==") {
                  ddlSelection = "==";
                  qryFS = "hire_dt='" + $scope.dateHireDate + "'";
              }
              else if ($scope.hireDateSelectedOption == "!=") {
                  ddlSelection = "!=";
                  qryFS = "hire_dt!='" + $scope.dateHireDate + "'";
              }
              else if ($scope.hireDateSelectedOption == ">=") {
                  ddlSelection = ">=";
                  qryFS = "hire_dt>='" + $scope.dateHireDate + "'";
              }
              else if ($scope.hireDateSelectedOption == "<=") {
                  ddlSelection = "<=";
                  qryFS = "hire_dt<='" + $scope.dateHireDate + "'";
              }

              if ($scope.hireDateAndOr == "And") {
                  rdoSelection = "And";
                  queryAnd += qryFS + " AND ";
              } else if ($scope.hireDateAndOr == "Or") {
                  rdoSelection = "Or";
                  queryOr += qryFS + " OR ";
              }

              var userSelection = new QuerySelection("hire_dt", ddlSelection, $scope.dateHireDate, rdoSelection, "Date");
              userFinalSelection.selections.push(JSON.stringify(userSelection));
          }

          //Job Entry Date
          if ($scope.dateJobEntry != "") {
              var rdoSelection = "";
              var ddlSelection = "";

              if ($scope.jobEntryDateSelectedOption == "==") {
                  ddlSelection = "==";
              }
              else if ($scope.jobEntryDateSelectedOption == "!=") {
                  ddlSelection = "!=";
              }
              else if ($scope.jobEntryDateSelectedOption == ">=") {
                  ddlSelection = ">=";
              }
              else if ($scope.jobEntryDateSelectedOption == "<=") {
                  ddlSelection = "<=";
              }

              if ($scope.jobEntryAndOr == "And") {
                  rdoSelection = "And";
              } else if ($scope.jobEntryAndOr == "Or") {
                  rdoSelection = "Or";
              }

              var userSelection = new QuerySelection("CCI-PS-JOB-ENTRY-DATE", ddlSelection, $scope.dateJobEntry, rdoSelection, "Date");
              userFinalSelection.selections.push(JSON.stringify(userSelection));
          }

          //Last Start Date
          if ($scope.dateLastStart != "") {
              var rdoSelection = "";
              var ddlSelection = "";

              if ($scope.lastStartDateSelectedOption == "==") {
                  ddlSelection = "==";
              }
              else if ($scope.lastStartDateSelectedOption == "!=") {
                  ddlSelection = "!=";
              }
              else if ($scope.lastStartDateSelectedOption == ">=") {
                  ddlSelection = ">=";
              }
              else if ($scope.lastStartDateSelectedOption == "<=") {
                  ddlSelection = "<=";
              }

              if ($scope.lastStartAndOr == "And") {
                  rdoSelection = "And";
              } else if ($scope.lastStartAndOr == "Or") {
                  rdoSelection = "Or";
              }

              var userSelection = new QuerySelection("Last Start Date", ddlSelection, $scope.dateLastStart, rdoSelection, "Date");
              userFinalSelection.selections.push(JSON.stringify(userSelection));
          }

          //Rehire Date
          if ($scope.dateRehire != "") {
              var rdoSelection = "";
              var ddlSelection = "";

              var qryFS = "";

              if ($scope.rehireDateSelectedOption == "==") {
                  ddlSelection = "==";
                  qryFS = "last_hire_dt='" + $scope.dateHireDate + "'";
              }
              else if ($scope.rehireDateSelectedOption == "!=") {
                  ddlSelection = "!=";
                  qryFS = "last_hire_dt!='" + $scope.dateHireDate + "'";
              }
              else if ($scope.rehireDateSelectedOption == ">=") {
                  ddlSelection = ">=";
                  qryFS = "last_hire_dt>='" + $scope.dateHireDate + "'";
              }
              else if ($scope.rehireDateSelectedOption == "<=") {
                  ddlSelection = "<=";
                  qryFS = "last_hire_dt<='" + $scope.dateHireDate + "'";
              }

              if ($scope.rehireAndOr == "And") {
                  rdoSelection = "And";
                  queryAnd += qryFS + " AND ";
              } else if ($scope.rehireAndOr == "Or") {
                  rdoSelection = "Or";
                  queryOr += qryFS + " OR ";
              }

              var userSelection = new QuerySelection("last_hire_dt", ddlSelection, $scope.dateRehire, rdoSelection, "Date");
              userFinalSelection.selections.push(JSON.stringify(userSelection));
          }

          //Service Date - service_dt
          if ($scope.dateService != "") {
              var rdoSelection = "";
              var ddlSelection = "";

              var qryFS = "";

              if ($scope.serviceDateSelectedOption == "==") {
                  ddlSelection = "==";
                  qryFS = "service_dt='" + $scope.dateService + "'";
              }
              else if ($scope.serviceDateSelectedOption == "!=") {
                  ddlSelection = "!=";
                  qryFS = "service_dt!='" + $scope.dateService + "'";
              }
              else if ($scope.serviceDateSelectedOption == ">=") {
                  ddlSelection = ">=";
                  qryFS = "service_dt>='" + $scope.dateService + "'";
              }
              else if ($scope.serviceDateSelectedOption == "<=") {
                  ddlSelection = "<=";
                  qryFS = "service_dt<='" + $scope.dateService + "'";
              }

              if ($scope.serviceAndOr == "And") {
                  rdoSelection = "And";
                  queryAnd += qryFS + " AND ";
              } else if ($scope.serviceAndOr == "Or") {
                  rdoSelection = "Or";
                  queryAnd += qryFS + " OR ";
              }

              var userSelection = new QuerySelection("service_dt", ddlSelection, $scope.dateService, rdoSelection, "Date");
              userFinalSelection.selections.push(JSON.stringify(userSelection));
          }

          selectedCriteriaJSON = JSON.stringify(userFinalSelection);

          queryOr = queryOr.slice(0, queryOr.lastIndexOf(" OR "));
          queryAnd = queryAnd.slice(0, queryAnd.lastIndexOf(" AND "));
          if (queryAnd.length > 0 && queryOr.length > 0) {
              query = "(" + queryAnd + ") OR (" + queryOr + ")";
          }
          else if (queryAnd.length > 0) {
              query = "(" + queryAnd + ")";
          }
          else if (queryOr.length > 0) {
              query = "(" + queryOr + ")";
          }
          else {
              return "";
          }


          //var finalQuery = { "" : + query + "" }; //"value": "( cc_career_lvl='11' OR cc_career_lvl='12')" };
          //query = { "value": "( cc_career_lvl='11' OR cc_career_lvl='12')" };

          return { "value": query };
          return query;
      }

       //Build Search Query based on the user selection criteria
      function BuildQueryREST()
      {
          var userFinalSelection = {
              selections: []
          };

          query = _spPageContextInfo.webAbsoluteUrl + "/_api/search/query?querytext='";
          var queryAnd = "";
          var queryOr = "";

          //Auto Allowance Level
          if (vm.termsAutoAllowanceLevel.length > 0)
          {
              var selectedValues = "";
              var rdoSelection = "";
              var ddlSelection = "";

              for (var i = 0; i < vm.termsAutoAllowanceLevel.length; i++)
              {
                  selectedValues += vm.termsAutoAllowanceLevel[i].Name + ";";
                  if ($scope.aalSelectedOption == "==") {
                      ddlSelection = "==";
                      if ($scope.aalAndOr == "And") {
                          rdoSelection = "And";
                          queryAnd += " CCIPAutoAllowanceLevel:" + vm.termsAutoAllowanceLevel[i].Name + " AND ";
                      } else if ($scope.aalAndOr == "Or") {
                          rdoSelection = "Or";
                          queryOr += "CCIPAutoAllowanceLevel:" + vm.termsAutoAllowanceLevel[i].Name + " OR ";
                      }
                  }
                  else {
                      ddlSelection = "!=";
                      if ($scope.aalAndOr == "And") {
                          rdoSelection = "And";
                          queryAnd += "CCIPAutoAllowanceLevel<>" + vm.termsAutoAllowanceLevel[i].Name + " AND ";
                      } else if ($scope.aalAndOr == "Or") {
                          rdoSelection = "Or";
                          queryOr += "CCIPAutoAllowanceLevel<>" + vm.termsAutoAllowanceLevel[i].Name + " OR ";
                      }
                  }
              }

              var userSelection = new QuerySelection("Auto Allowance Level", ddlSelection, selectedValues, rdoSelection);
              userFinalSelection.selections.push(JSON.stringify(userSelection));
          }

          //Business Unit
          if (vm.termsBusinessUnit.length > 0) {
              var selectedValues = "";
              var rdoSelection = "";
              var ddlSelection = "";

              var qryBU = "";
                if ($scope.buSelectedOption == "==") {
					if(vm.termsBusinessUnit.length == 1) {
						qryBU += "CCIPBusinessUnit:" + vm.termsBusinessUnit[0].Name;
					}
					else {
						qryBU += " (";
						for (var i = 0; i < vm.termsBusinessUnit.length; i++) {
							qryBU += "CCIPBusinessUnit:" + vm.termsBusinessUnit[i].Name + " OR ";
						}
						qryBU = qryBU.slice(0, qryBU.lastIndexOf(" OR "));
						qryBU += ") ";
					}
                }
                else { //Not equal to
					if(vm.termsBusinessUnit.length == 1) {
						qryBU += "CCIPBusinessUnit<>" + vm.termsBusinessUnit[0].Name;
					}
					else {
						qryBU += " (";
						for (var i = 0; i < vm.termsBusinessUnit.length; i++) {
							qryBU += "CCIPBusinessUnit<>" + vm.termsBusinessUnit[i].Name + " OR ";
						}
						qryBU = qryBU.slice(0, qryBU.lastIndexOf(" OR "));
						qryBU += ") ";
					}
                }
				if ($scope.buAndOr == "And") {
					queryAnd += qryBU + " AND ";
				} else if ($scope.buAndOr == "Or") {
					queryOr += qryBU + " OR ";
				}

              for (var i = 0; i < vm.termsBusinessUnit.length; i++) {
                  selectedValues += vm.termsBusinessUnit[i].Name + ";";
              }
          }

          //Career Level
            if (vm.termsCareerLevel.length > 0) {
				var qryCL = "";
                if ($scope.clSelectedOption == "==") {
					if(vm.termsCareerLevel.length == 1) {
						qryCL += "CCIPCareerLevel:" + vm.termsCareerLevel[0].Name;
					}
					else {
						qryCL += " (";
						for (var i = 0; i < vm.termsCareerLevel.length; i++) {
							qryCL += "CCIPCareerLevel:" + vm.termsCareerLevel[i].Name + " OR ";
						}
						qryCL = qryCL.slice(0, qryCL.lastIndexOf(" OR "));
						qryCL += ") ";
					}
                }
                else { //Not equal to
					if(vm.termsCareerLevel.length == 1) {
						qryCL += "CCIPCareerLevel<>" + vm.termsCareerLevel[0].Name;
					}
					else {
						qryCL += " (";
						for (var i = 0; i < vm.termsCareerLevel.length; i++) {
							qryCL += "CCIPCareerLevel<>" + vm.termsCareerLevel[i].Name + " OR ";
						}
						qryCL = qryCL.slice(0, qryCL.lastIndexOf(" OR "));
						qryCL += ") ";
					}
                }
				if ($scope.clAndOr == "And") {
					queryAnd += qryCL + " AND ";
				} else if ($scope.clAndOr == "Or") {
					queryOr += qryCL + " OR ";
				}
            }

          //Commissioned
          if (vm.termsCommissioned.length > 0) {
              var qryComm="";
              if ($scope.commissionedSelectedOption == "==") {
					if(vm.termsCommissioned.length == 1) {
						qryComm += "CCIPCommissioned:" + vm.termsCommissioned[0].Name;
					}
					else {
						qryComm += " (";
						for (var i = 0; i < vm.termsCommissioned.length; i++) {
							qryComm += "CCIPCommissioned:" + vm.termsCommissioned[i].Name + " OR ";
						}
						qryComm = qryComm.slice(0, qryComm.lastIndexOf(" OR "));
						qryComm += ") ";
					}
                }
                else { //Not equal to
					if(vm.termsCommissioned.length == 1) {
						qryComm += "CCIPCommissioned<>" + vm.termsCommissioned[0].Name;
					}
					else {
						qryComm += " (";
						for (var i = 0; i < vm.termsCommissioned.length; i++) {
							qryComm += "CCIPCommissioned<>" + vm.termsCommissioned[i].Name + " OR ";
						}
						qryComm = qryComm.slice(0, qryComm.lastIndexOf(" OR "));
						qryComm += ") ";
					}
                }
				if ($scope.comAndOr == "And") {
					queryAnd += qryComm + " AND ";
				} else if ($scope.comAndOr == "Or") {
					queryOr += qryComm + " OR ";
				}
          }

          //Department
          if (vm.termsDepartment.length > 0) {
              var qryDept="";
              if ($scope.deptSelectedOption == "==") {
					if(vm.termsDepartment.length == 1) {
						qryDept += "CCIPDept:" + vm.termsDepartment[0].Name;
					}
					else {
						qryDept += " (";
						for (var i = 0; i < vm.termsDepartment.length; i++) {
							qryDept += "CCIPDept:" + vm.termsDepartment[i].Name + " OR ";
						}
						qryDept = qryDept.slice(0, qryDept.lastIndexOf(" OR "));
						qryDept += ") ";
					}
                }
                else { //Not equal to
					if(vm.termsDepartment.length == 1) {
						qryDept += "CCIPDept<>" + vm.termsDepartment[0].Name;
					}
					else {
						qryDept += " (";
						for (var i = 0; i < vm.termsDepartment.length; i++) {
							qryDept += "CCIPDept<>" + vm.termsDepartment[i].Name + " OR ";
						}
						qryDept = qryDept.slice(0, qryDept.lastIndexOf(" OR "));
						qryDept += ") ";
					}
                }
				if ($scope.deptAndOr == "And") {
					queryAnd += qryDept + " AND ";
				} else if ($scope.deptAndOr == "Or") {
					queryOr += qryDept + " OR ";
				}
          }

          //FLSA Status
          if (vm.termsFLSAStatus.length > 0) {
              var qryFLSA="";
              if ($scope.flsaSelectedOption == "==") {
					if(vm.termsFLSAStatus.length == 1) {
						qryFLSA += "CCIPDept:" + vm.termsFLSAStatus[0].Name;
					}
					else {
						qryFLSA += " (";
						for (var i = 0; i < vm.termsFLSAStatus.length; i++) {
							qryFLSA += "CCIPDept:" + vm.termsFLSAStatus[i].Name + " OR ";
						}
						qryFLSA = qryFLSA.slice(0, qryFLSA.lastIndexOf(" OR "));
						qryFLSA += ") ";
					}
                }
                else { //Not equal to
					if(vm.termsFLSAStatus.length == 1) {
						qryFLSA += "CCIPDept<>" + vm.termsFLSAStatus[0].Name;
					}
					else {
						qryFLSA += " (";
						for (var i = 0; i < vm.termsFLSAStatus.length; i++) {
							qryFLSA += "CCIPDept<>" + vm.termsFLSAStatus[i].Name + " OR ";
						}
						qryFLSA = qryFLSA.slice(0, qryFLSA.lastIndexOf(" OR "));
						qryFLSA += ") ";
					}
                }
				if ($scope.flsaAndOr == "And") {
					queryAnd += qryFLSA + " AND ";
				} else if ($scope.flsaAndOr == "Or") {
					queryOr += qryFLSA + " OR ";
				}
          }

          queryOr = queryOr.slice(0, queryOr.lastIndexOf(" OR "));
          queryAnd = queryAnd.slice(0, queryAnd.lastIndexOf(" AND "));
          if (queryAnd.length > 0 && queryOr.length > 0)
          {
              query += "(" + queryAnd + ") OR (" + queryOr + ")'&sourceid='b09a7990-05ea-4af9-81ef-edfab16c4e31'&selectproperties='AccountName,PreferredName'";
          }
          else if (queryAnd.length > 0)
          {
              query += "(" + queryAnd + ")'&sourceid='b09a7990-05ea-4af9-81ef-edfab16c4e31'&selectproperties='AccountName,PreferredName'";
          }
          else if (queryOr.length > 0) {
              query += "(" + queryOr + ")'&sourceid='b09a7990-05ea-4af9-81ef-edfab16c4e31'&selectproperties='AccountName,PreferredName'";
          }
          else {
              return "";
          }
          
          //query = "https://sr0101.sharepoint.com/sites/ng/_api/search/query?querytext='(CCIPDept:IT)'&sourceid='b09a7990-05ea-4af9-81ef-edfab16c4e31'";

          return query;
      }

       //To build JSONs
      function QuerySelection(ctrlName, ddlCtrlOption, ctrlValue, rdoCtrlOption, ctrlType) {
          this.CtrlName = ctrlName;
          this.ddlCtrl = ddlCtrlOption;
          this.CtrlValue = ctrlValue;
          this.rdoCtrl = rdoCtrlOption;
          this.CtrlType = ctrlType;
      }

       //Create SPGroup
      function CreateSPGroupREST()
      {
          var url = _spPageContextInfo.siteAbsoluteUrl + "/_api/web/sitegroups";
          jQuery.ajax({
              url: url,
              type: "POST",
              data: "{ '__metadata':{ 'type': 'SP.Group' }, 'Title':'" + $scope.groupName + "' }",
              headers: {
                  "accept": "application/json;odata=verbose",
                  "content-type": "application/json;odata=verbose",
                  "X-RequestDigest": $("#__REQUESTDIGEST").val()
              },
              success: function (data) {
                  $scope.safeApply(function () {
                      $scope.statusMessages += "Created SharePoint security group <b>'" + $scope.groupName + "'</b><br />";
                  });
                  //AddUsersToGroup();
                  //AddtoDSGListJSOM();
                  GetGroupID();
              },
              error: function (jqxr, errorCode, errorThrown) {
                  alert(jqxr.responseText);
                  $scope.safeApply(function () {
                      $scope.statusMessages += jqxr.responseText + "<br />";
                  });
              }
          });
      }

       //Get newly created SPGroup ID
      function GetGroupID()
      {
          var url = _spPageContextInfo.siteAbsoluteUrl + "/_api/web/sitegroups/getByName('" + $scope.groupName + "')/Id";
          jQuery.ajax({
              url: url,
              type: "GET",
              headers: {
                  "accept": "application/json;odata=verbose",
                  "content-type": "application/json;odata=verbose",
              },
              success: function (data) {
                  groupId = data.d.Id;
                  GetRoleDefinitionId();
              },
              error: function (jqxr, errorCode, errorThrown) {
                  alert(jqxr.responseText);
                  $scope.safeApply(function () {
                      $scope.statusMessages += jqxr.responseText + "<br />";
                  });
              }
          });
      }

       //Get RoleDefinitionId for 'Read'
      function GetRoleDefinitionId()
      {
          var url = _spPageContextInfo.siteAbsoluteUrl + "/_api/web/roledefinitions/getByName('Read')/Id";
          jQuery.ajax({
              url: url,
              type: "GET",
              headers: {
                  "accept": "application/json;odata=verbose",
                  "content-type": "application/json;odata=verbose",
              },
              success: function (data) {
                  roleDefinitionId = data.d.Id;
                  SetPermissionsForGroup();
              },
              error: function (jqxr, errorCode, errorThrown) {
                  alert(jqxr.responseText);
                  $scope.safeApply(function () {
                      $scope.statusMessages += jqxr.responseText + "<br />";
                  });
              }
          });
      }

       //Set permission for newly created SPGroup
      function SetPermissionsForGroup()
      {
          var url = _spPageContextInfo.siteAbsoluteUrl + "/_api/web/roleassignments/addroleassignment(principalid=" + groupId + ", roledefid=" + roleDefinitionId + ")";
          jQuery.ajax({
              url: url,
              type: "POST",
              headers: {
                  "accept": "application/json;odata=verbose",
                  "content-type": "application/json;odata=verbose",
                  "X-RequestDigest": $("#__REQUESTDIGEST").val()
              },
              success: function (data) {
                  $scope.safeApply(function () {
                      $scope.statusMessages += "Assigned Read permissions to the Group - <b>'" + $scope.groupName + "'</b><br />";
                  });
                /*  AddUsersToGroup().then(
                      function (success) {
                          if ($scope.usersToAdd.length > 0) {
                              $scope.$apply(function () {
                                  $scope.hideUsersList = true;
                                  $scope.statusMessages += "<b>" + $scope.usersToAdd.length + "</b> Users have been added to the group<br />";
                                  $scope.statusMessages += "<b>Completed</b><br />";
                              });
                          }
                          AddtoDSGListJSOM();
                  });*/
                  AddUsersToGroup();
                  //AddtoDSGListREST();
              },
              error: function (jqxr, errorCode, errorThrown) {
                  //alert(jqxr.responseText);
                  $scope.safeApply(function () {
                      $scope.statusMessages += jqxr.responseText + "<br />";
                  });
              }
          });
      }

       //Add users to newly created SPGroup
      function AddUsersToGroup()
      {
          var deferreds = [];

          for (var userCount = 0; userCount < uniqueUPAUsers.length; userCount++) {
              deferreds.push(
                  AddUserREST(uniqueUPAUsers[userCount].split(";;;")[0]).then(
                  function (userTitle) {
                      if (userTitle != "error") {
                          $scope.usersToAdd.push("  " + userTitle);
                      }
                  })
                  /*jQuery.ajax({
                      url: _spPageContextInfo.siteAbsoluteUrl + "/_api/web/sitegroups/getByName('" + $scope.groupName + "')/users",
                      type: "POST",
                      data: "{ '__metadata': { 'type': 'SP.User' }, 'LoginName': 'i:0#.f|membership|" + uniqueUPAUsers[userCount].split(";;;")[0] + "' }",
                      headers: {
                          "accept": "application/json;odata=verbose",
                          "content-type": "application/json;odata=verbose",
                          "X-RequestDigest": $("#__REQUESTDIGEST").val()
                      },
                      success: function (data) {
                          //console.log("Added user to group");
                      },
                      error: function (jqxr, errorCode, errorThrown) {
                          
                      }
                  })*/
                  );
             
          }

          $.when.apply($, deferreds).always(function () {
              $.each(deferreds, function () {
                  this.done(function () {
                      if (arguments.length > 0) {
                          if (arguments[1] == "success") {
                              $scope.usersToAdd.push("  " + arguments[0].d.Title);
                          }
                          $scope.safeApply(function () {
                              $scope.hideUsersList = true;
                          });

                         /*AddtoDSGListREST();
                          if ($scope.usersToAdd.length > 0) {
                              $scope.safeApply(function () {
                                  $scope.hideUsersList = true;
                                  $scope.statusMessages += "<b>" + $scope.usersToAdd.length + "</b> Users have been added to the group<br />";
                                  $scope.statusMessages += "<b>Completed</b><br />";
                              });
                          }*/
                      }
                  }).fail(function () {
                      //console.log("fail");
                  }).then(function () {
                      AddtoDSGListREST();
                      if ($scope.usersToAdd.length > 0) {
                          $scope.safeApply(function () {
                              $scope.hideUsersList = true;
                              $scope.statusMessages += "<b>" + $scope.usersToAdd.length + "</b> Users have been added to the group<br />";
                              $scope.statusMessages += "<b>Completed</b><br />";
                          });
                      }
                  });
              });
          })
          //AddtoDSGListREST();

          

          /*
             $.when.apply($, deferreds).done(function () {
              for (var i = 0; i < arguments.length; i++) {
                  if (arguments[i][1] == "success") {
                        $scope.usersToAdd.push("  " + arguments[i][0].d.Title);
                  }
              }
              if (arguments.length > 0) {
                  AddtoDSGListREST();
                  if ($scope.usersToAdd.length > 0) {
                      $scope.safeApply(function () {
                            $scope.hideUsersList = true;
                            $scope.statusMessages += "<b>" + $scope.usersToAdd.length + "</b> Users have been added to the group<br />";
                            $scope.statusMessages += "<b>Completed</b><br />";
                        });
                    }
              }
          })
              .fail(function (jqXHR, status, error) {
              console.log("deferred fail"); //alert("fail");
          });

         
          
          var deferred = $.Deferred();
          for (var userCount = 0; userCount < uniqueUPAUsers.length; userCount++)
          {
              AddUserREST(uniqueUPAUsers[userCount].split(";;;")[0]).then(
                  function (userTitle) {
                      if (userTitle != "error") {
                          $scope.usersToAdd.push("  " + userTitle);
                      }

              });
          }

          deferred.resolve("done");
          return deferred.promise();*/

          //if ($scope.usersToAdd.length > 0) {
          //    $scope.$apply(function () {
          //        $scope.hideUsersList = true;
          //        $scope.statusMessages += "<b>" + $scope.usersToAdd.length + "</b> Users have been added to the group<br />";
          //        $scope.statusMessages += "<b>Completed</b><br />";
          //    });
          //}
      }

      

      function AddUserREST(userID) {
          var deferred = $.Deferred();
          var url = _spPageContextInfo.siteAbsoluteUrl + "/_api/web/sitegroups/getByName('" + $scope.groupName + "')/users";
          jQuery.ajax({
              url: url,
              type: "POST",
              data: "{ '__metadata': { 'type': 'SP.User' }, 'LoginName': 'i:0#.f|membership|" + userID + "' }",
              headers: {
                  "accept": "application/json;odata=verbose",
                  "content-type": "application/json;odata=verbose",
                  "X-RequestDigest": $("#__REQUESTDIGEST").val()
              },
              success: function (data) {
                  //$scope.usersToAdd.push("  " + data.d.Title);
                  deferred.resolve(data.d.Title);
              },
              error: function (jqxr, errorCode, errorThrown) {
                  deferred.reject("error");
              }
          });

          return deferred.promise();
      }

       //Update 'Dynamic Security Groups' list with new group info
      function AddtoDSGListJSOM() {
          var clientContext = SP.ClientContext.get_current();
          var currentWeb = clientContext.get_web();

          var oList = currentWeb.get_lists().getByTitle('Dynamic Security Groups');

          var itemCreateInfo = new SP.ListItemCreationInformation();
          var oListItem = oList.addItem(itemCreateInfo);
          oListItem.set_item('GroupName', $scope.groupName);
          oListItem.set_item('GroupDescription', query);
          //oListItem.set_item('GroupUsers', usersList);
          oListItem.update();

          clientContext.load(oListItem);
          clientContext.executeQueryAsync(function () {
              //$scope.statusMessages += "Dynamic Security Group list has been updated with new group.<br />";
          }, function (sender, args) {
              $scope.statusMessages += "Update Dynamic Security Group list failed - " + args.get_message() +
              "\n" + args.get_stackTrace() + "<br />";
          });
      }

       //Update 'Dynamic Security Groups' list
      function AddtoDSGListREST() {
          var url = _spPageContextInfo.webAbsoluteUrl + "/_api/web/lists(guid'" + CCI_Common.GetConfig("Dynamic Security Groups") + "')/items"
          jQuery.ajax({
              url: url,
              type: "POST",
              data: JSON.stringify({
                  '__metadata': { 'type': 'SP.Data.DSGListItem' },  ///_api/web/lists/getbytitle('Dynamic Security Groups')/ListItemEntityTypeFullName
                  'GroupName': $scope.groupName,
                  'DSG': query.value
                  //'GroupUsers': users
              }),
              headers: {
                  "accept": "application/json;odata=verbose",
                  "content-type": "application/json;odata=verbose",
                  "X-RequestDigest": $("#__REQUESTDIGEST").val()
              },
              success: function (d) {
                  console.log("Updated DSG");
              },
              error: function (error) {
                  console.log("Failed to update DSG - " + JSON.stringify(error));
              }
          });
      }

      function parseJSON()
      {
          vm.termsAutoAllowanceLevel = [{ Id: "b9adc2b9-5761-4ec4-9636-949982fbe4ba", Name: "AAL2" }];
          vm.loadTaxonomyPickers = true;

          $scope.$apply(function () {
              vm.termsAutoAllowanceLevel = [{ Id: "e33b48af-05ba-45ef-9055-50cd395f3172", Name: "AAL3" }];
              vm.loadTaxonomyPickers = true;
          });

          
          /* if (!$scope.$root.$$phase) {
              $scope.$apply();
          }*/

          var json = "{\"securityFilters\":[{\"title\":\"Auto Allowance Level\",\"AndOr\":\"And\",\"selectedOption\":\"Equal to\",\"value\":\"AAL3;AAL2;\"},{\"title\":\"Business Unit\",\"AndOr\":\"Or\",\"selectedOption\":\"Not equal to\",\"value\":\"Finance;\"}]}";
          var selected = JSON.parse(json);
          if (selected.securityFilters.length > 0)
          {
              for (var count = 0; count < selected.securityFilters.length; count++) {
                  switch (selected.securityFilters[count].title) {
                      case "Auto Allowance Level":
                          if (selected.securityFilters[count].AndOr == "And") {
                              $scope.aalAndOr = "And";
                          }
                          else if (selected.securityFilters[count].AndOr == "Or") {
                              $scope.aalAndOr = "Or";
                          }
                          if (selected.securityFilters[count].selectedOption == "Equal to") {
                              $scope.aalSelectedOption = "==";
                          }
                          else if (selected.securityFilters[count].selectedOption == "Not equal to") {
                              $scope.aalSelectedOption = "!=";
                          }
                          //vm.termsAutoAllowanceLevel = [{ Id: "b9adc2b9-5761-4ec4-9636-949982fbe4ba", Name: "AAL2" }];
                          //vm.loadTaxonomyPickers = true;
                          break;
                      case "Business Unit":
                          if (selected.securityFilters[count].AndOr == "And") {
                              $scope.buAndOr = "And";
                          }
                          else if (selected.securityFilters[count].AndOr == "Or") {
                              $scope.buAndOr = "Or";
                          }
                          if (selected.securityFilters[count].selectedOption == "Equal to") {
                              $scope.buSelectedOption = "==";
                          }
                          else if (selected.securityFilters[count].selectedOption == "Not equal to") {
                              $scope.buSelectedOption = "!=";
                          }
                          break;
                  }
              }
          }
          
      }
      
      init();
      function init() {			
         //init code.
          //getUPPItemsFromList();
      }

   }
})();
