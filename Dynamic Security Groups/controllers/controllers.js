
//App Controller
(function () {
   'use strict';
   var controllerId = 'appCtrlr';
   var query = "";
   var usersFromUPA = [];
   var uniqueUPAUsers = [];
   var usersList = "";
   var groupId;
   var roleDefinitionId;
   var selectedCriteriaJSON;
   var userAccountName = "";

   angular.module('app').controller(controllerId, ['$scope','$route','$location','$routeParams', appCtrlr]);

   function appCtrlr($scope, $route) {
      var vm = this;			
      vm.data = [];				
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

      $scope.groupName = "CCI-";

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
      }];

       //Options for Date Columns
      $scope.compareOptionsForDate = [{
          id: "==",
          name: "Equal to"
      }, {
          id: "!=",
          name: "Not equal to"
      }, {
          id: ">",
          name: "Greater than"
      }, {
          id: ">=",
          name: "Greater than or equal to"
      }, {
          id: "<",
          name: "Less than"
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

      /*$scope.dateHireDate = new Date();
      $scope.dateJobEntry = new Date();
      $scope.dateLastStart = new Date();
      $scope.dateRehire = new Date();
      $scope.dateService = new Date();*/
      $scope.dateHireDate = "";
      $scope.dateJobEntry = "";
      $scope.dateLastStart = "";
      $scope.dateRehire = "";
      $scope.dateService = "";

      $scope.statusMessages = "";

      

      $scope.reloadWithTemplates = function () {
          parseJSON();
      };

      $scope.myFunc = function () {
          //ExecuteOrDelayUntilScriptLoaded(function () { CreateGroupJSOM(); }, "sp.js");
          $scope.$apply(function () {
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
                  $scope.$apply(function () {
                      $scope.statusMessages = "SharePoint security group <b>'" + grpName + "'</b> already exists. Please enter different name and try again. <br />";

                  });
              },
              error: function (jqxr, errorCode, errorThrown) {
                  //alert(jqxr.responseText);
                  $scope.$apply(function () {
                      $scope.statusMessages = "Checking user profile for the users matching the selected criteria <br />";
                  });
                  getUsersFromUPA();
                  //CreateSPGroupREST();
              }
          });
      }

       //Executes query to get users from User Profile Service
      function getUsersFromUPA() {
          usersFromUPA = [];
          uniqueUPAUsers = [];
          query = BuildQuery();
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
                      }
                  },
                  error: function (jqxr, errorCode, errorThrown) {
                        $scope.$apply(function () {
                            $scope.statusMessages += "Failed to get users from User Profile. Error: " + jqxr.responseText + "<br />";
                        });
                  }
              });
          }
          else {
              $scope.$apply(function () {
                  $scope.statusMessages += "Query empty<br />";
              });
          }
          
      }

       //Build Search Query based on the user selection criteria
      function BuildQuery()
      {
          selectedCriteriaJSON = "{\"securityFilters\":[";

          query = _spPageContextInfo.webAbsoluteUrl + "/_api/search/query?querytext='";
          var queryAnd = "";
          var queryOr = "";

          //Auto Allowance Level
          if (vm.termsAutoAllowanceLevel.length > 0)
          {
              var selectedValues = "";

              selectedCriteriaJSON += "{\"title\":\"Auto Allowance Level\",";
              for (var i = 0; i < vm.termsAutoAllowanceLevel.length; i++)
              {
                  selectedValues += vm.termsAutoAllowanceLevel[i].Name + ";";
                  if ($scope.aalSelectedOption == "==") {
                      if ($scope.aalAndOr == "And") {
                          queryAnd += " CCIPAutoAllowanceLevel:" + vm.termsAutoAllowanceLevel[i].Name + " AND ";
                      } else if ($scope.aalAndOr == "Or") {
                          queryOr += "CCIPAutoAllowanceLevel:" + vm.termsAutoAllowanceLevel[i].Name + " OR ";
                      }
                  }
                  else {
                      if ($scope.aalAndOr == "And") {
                          queryAnd += "CCIPAutoAllowanceLevel<>" + vm.termsAutoAllowanceLevel[i].Name + " AND ";
                      } else if ($scope.aalAndOr == "Or") {
                          queryOr += "CCIPAutoAllowanceLevel<>" + vm.termsAutoAllowanceLevel[i].Name + " OR ";
                      }
                  }
              }
              
              if ($scope.aalAndOr == "And") {
                  selectedCriteriaJSON += "\"AndOr\":\"And\",";
              }
              if ($scope.aalAndOr == "Or") {
                  selectedCriteriaJSON += "\"AndOr\":\"Or\",";
              }
              if ($scope.aalSelectedOption == "==") {
                  selectedCriteriaJSON += "\"selectedOption\":\"Equal to\",";
              }
              else {
                  selectedCriteriaJSON += "\"selectedOption\":\"Not equal to\",";
              }
              selectedCriteriaJSON += "\"selectedValue\":\"" + selectedValues + "\"},";
          }

          //Business Unit
          if (vm.termsBusinessUnit.length > 0) {
              var selectedValues = "";

              selectedCriteriaJSON += "{\"title\":\"Business Unit\",";
              for (var i = 0; i < vm.termsBusinessUnit.length; i++) {
                  selectedValues += vm.termsBusinessUnit[i].Name + ";";

                  if ($scope.buSelectedOption == "==") {
                      for (var i = 0; i < vm.termsBusinessUnit.length; i++) {
                          if ($scope.buAndOr == "And") {
                              queryAnd += "CCIPBusinessUnit:" + vm.termsBusinessUnit[i].Name + " AND ";
                          } else if ($scope.buAndOr == "Or") {
                              queryOr += "CCIPBusinessUnit:" + vm.termsBusinessUnit[i].Name + " OR ";
                          }
                      }
                  }
                  else {
                      for (var i = 0; i < vm.termsBusinessUnit.length; i++) {
                          if ($scope.buAndOr == "And") {
                              queryAnd += "CCIPBusinessUnit<>" + vm.termsBusinessUnit[i].Name + " AND ";
                          } else if ($scope.buAndOr == "Or") {
                              queryOr += "CCIPBusinessUnit<>" + vm.termsBusinessUnit[i].Name + " OR ";
                          }
                      }
                  }
              }
              
              if ($scope.buAndOr == "And") {
                  selectedCriteriaJSON += "\"AndOr\":\"And\",";
              }
              if ($scope.buAndOr == "Or") {
                  selectedCriteriaJSON += "\"AndOr\":\"Or\",";
              }
              if ($scope.buSelectedOption == "==") {
                  selectedCriteriaJSON += "\"selectedOption\":\"Equal to\",";
              }
              else {
                  selectedCriteriaJSON += "\"selectedOption\":\"Not equal to\",";
              }
              selectedCriteriaJSON += "\"selectedValue\":\"" + selectedValues + "\"},";
          }

          //Career Level
          if (vm.termsCareerLevel.length > 0) {
              if ($scope.clSelectedOption == "==") {
                  for (var i = 0; i < vm.termsCareerLevel.length; i++) {
                      if ($scope.clAndOr == "And") {
                          queryAnd += "CCIPCareerLevel:" + vm.termsCareerLevel[i].Name + " AND ";
                      } else if ($scope.clAndOr == "Or") {
                          queryOr += "CCIPCareerLevel:" + vm.termsCareerLevel[i].Name + " OR ";
                      }
                  }
              }
              else {
                  for (var i = 0; i < vm.termsCareerLevel.length; i++) {
                      if ($scope.clAndOr == "And") {
                          queryAnd += "CCIPCareerLevel<>" + vm.termsCareerLevel[i].Name + " AND ";
                      } else if ($scope.clAndOr == "Or") {
                          queryOr += "CCIPCareerLevel<>" + vm.termsCareerLevel[i].Name + " OR ";
                      }
                  }
              }
          }

          //Commissioned
          if (vm.termsCommissioned.length > 0) {
              if ($scope.commissionedSelectedOption == "==") {
                  for (var i = 0; i < vm.termsCommissioned.length; i++) {
                      if ($scope.comAndOr == "And") {
                          queryAnd += "CCIPCommissioned:" + vm.termsCommissioned[i].Name + " AND ";
                      } else if ($scope.comAndOr == "Or") {
                          queryOr += "CCIPCommissioned:" + vm.termsCommissioned[i].Name + " OR ";
                      }
                  }
              }
              else {
                  for (var i = 0; i < vm.termsCommissioned.length; i++) {
                      if ($scope.comAndOr == "And") {
                          queryAnd += "CCIPCommissioned<>" + vm.termsCommissioned[i].Name + " AND ";
                      } else if ($scope.comAndOr == "Or") {
                          queryOr += "CCIPCommissioned<>" + vm.termsCommissioned[i].Name + " OR ";
                      }
                  }
              }
          }

          //Department
          if (vm.termsDepartment.length > 0) {
              if ($scope.deptSelectedOption == "==") {
                  for (var i = 0; i < vm.termsDepartment.length; i++) {
                      if ($scope.deptAndOr == "And") {
                          queryAnd += "CCIPDept:" + vm.termsDepartment[i].Name + " AND ";
                      } else if ($scope.deptAndOr == "Or") {
                          queryOr += "CCIPDept:" + vm.termsDepartment[i].Name + " OR ";
                      }
                  }
              }
              else {
                  for (var i = 0; i < vm.termsDepartment.length; i++) {
                      if ($scope.deptAndOr == "And") {
                          queryAnd += "CCIPDept<>" + vm.termsDepartment[i].Name + " AND ";
                      } else if ($scope.deptAndOr == "Or") {
                          queryOr += "CCIPDept<>" + vm.termsDepartment[i].Name + " OR ";
                      }
                  }
              }
          }

          //FLSA Status
          if (vm.termsFLSAStatus.length > 0) {
              if ($scope.flsaSelectedOption == "==") {
                  for (var i = 0; i < vm.termsFLSAStatus.length; i++) {
                      if ($scope.flsaAndOr == "And") {
                          queryAnd += "CCIPFLSAStatus:" + vm.termsFLSAStatus[i].Name + " AND ";
                      } else if ($scope.flsaAndOr == "Or") {
                          queryOr += "CCIPFLSAStatus:" + vm.termsFLSAStatus[i].Name + " OR ";
                      }
                  }
              }
              else {
                  for (var i = 0; i < vm.termsFLSAStatus.length; i++) {
                      if ($scope.flsaAndOr == "And") {
                          queryAnd += "CCIPFLSAStatus<>" + vm.termsFLSAStatus[i].Name + " AND ";
                      } else if ($scope.flsaAndOr == "Or") {
                          queryOr += "CCIPFLSAStatus<>" + vm.termsFLSAStatus[i].Name + " OR ";
                      }
                  }
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

          selectedCriteriaJSON = selectedCriteriaJSON.slice(0, selectedCriteriaJSON.lastIndexOf(","));
          selectedCriteriaJSON += "]}";
          return query;
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
                  $scope.$apply(function () {
                      $scope.statusMessages += "Created SharePoint security group <b>'" + $scope.groupName + "'</b><br />";
                  });
                  //AddUsersToGroup();
                  //AddtoDSGListJSOM();
                  GetGroupID();
              },
              error: function (jqxr, errorCode, errorThrown) {
                  alert(jqxr.responseText);
                  $scope.$apply(function () {
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
                  $scope.$apply(function () {
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
                  $scope.$apply(function () {
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
                  $scope.$apply(function () {
                      $scope.statusMessages += "Assigned Read permissions to the Group - <b>'" + $scope.groupName + "'</b><br />";
                  });
                  AddUsersToGroup();
                  //AddtoDSGListJSOM();
                  AddtoDSGListREST(usersList);
              },
              error: function (jqxr, errorCode, errorThrown) {
                  alert(jqxr.responseText);
                  $scope.$apply(function () {
                      $scope.statusMessages += jqxr.responseText + "<br />";
                  });
              }
          });
      }

       //Add users to newly created SPGroup
      function AddUsersToGroup()
      {
          usersList = "";
          
          var url = _spPageContextInfo.siteAbsoluteUrl + "/_api/web/sitegroups/getByName('" + $scope.groupName + "')/users";
          for (var userCount = 0; userCount < uniqueUPAUsers.length; userCount++)
          {
              if (uniqueUPAUsers[userCount].startsWith("i:0#")) {
                  usersList += uniqueUPAUsers[userCount].split(";;;")[0] + ";;";
                  $scope.usersToAdd.push("  " + uniqueUPAUsers[userCount].split(";;;")[1]);

                  jQuery.ajax({
                      url: url,
                      type: "POST",
                      data: "{ '__metadata':{ 'type': 'SP.User' }, 'LoginName':'" + uniqueUPAUsers[userCount].split(";;;")[0] + "' }",
                      headers: {
                          "accept": "application/json;odata=verbose",
                          "content-type": "application/json;odata=verbose",
                          "X-RequestDigest": $("#__REQUESTDIGEST").val()
                      },
                      success: function (data) {
                          if ($scope.usersToAdd.length > 0)
                          {
                              /*$scope.$apply(function () {
                                  $scope.hideUsersList = true;
                                  $scope.statusMessages += "<b>" + $scope.usersToAdd.length + "</b> Users have been added to the group<br />";
                              });*/
                          }
                      },
                      error: function (jqxr, errorCode, errorThrown) {
                          $scope.$apply(function () {
                              //$scope.statusMessages += jqxr.responseText + "<br />";
                          });
                      }
                  });
              }
          }
          if ($scope.usersToAdd.length > 0) {
              $scope.$apply(function () {
                  $scope.hideUsersList = true;
                  $scope.statusMessages += "<b>" + $scope.usersToAdd.length + "</b> Users have been added to the group<br />";
                  $scope.statusMessages += "<b>Completed</b><br />";
              });
          }
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
          oListItem.set_item('GroupUsers', usersList);
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
      function AddtoDSGListREST(users) {
          var url = _spPageContextInfo.siteAbsoluteUrl + "/_api/web/lists/getbytitle('Dynamic Security Groups')/items"
          jQuery.ajax({
              url: url,
              type: "POST",
              data: JSON.stringify({
                  '__metadata': { 'type': 'SP.Data.DSGListItem' },  ///_api/web/lists/getbytitle('Dynamic Security Groups')/ListItemEntityTypeFullName
                  'GroupName': $scope.groupName,
                  'GroupDescription': query,
                  'GroupUsers': users
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
