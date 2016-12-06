//App Controller
(function () {
    'use strict';
    var controllerId = 'appCtrlr';
	var grpUsers = [];
    var uniqueUsers = [];
	var groupId;
	var roleDefinitionId;
    var usersList = "";
    var failedUserCount = 0;

    angular.module('app').controller(controllerId, ['$scope', '$timeout', appCtrlr]);

    function appCtrlr($scope, $timeout) {
		var vm = this;
		vm.webUrl = null;
		vm.data = {
			su:null,
			mu:null
		};
		vm.groupSelected = "";
		vm.existingGroups = [];			
		vm.getPresence = getPresence;
		var service = function () {		
			this.webAbsoluteUrl = _spPageContextInfo.webAbsoluteUrl;
			this.webRelativeUrl = _spPageContextInfo.webServerRelativeUrl;
			this.currentUserId = _spPageContextInfo.userId;
			this.webAppUrl = document.location.origin || document.location.href.substring(0, document.location.href.indexOf(document.location.pathname));		
		}
         
         $scope.usersToAdd = [];
         $scope.originalUsersToAdd = [];

		init();

		function init() {
            getAllSPGroups();

			//Update the weburl property
			$timeout(function(){
				var s = new service;
				vm.webUrl = s.webAppUrl;
				if (!$scope.$root.$$phase) {
					$scope.$apply();
				}				 
			 },500);
		};

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

        function GetSPUsersFromSPGrp(grpName){
            var deferred = $.Deferred();
            $.ajax({
                url: _spPageContextInfo.siteAbsoluteUrl + "/_api/web/sitegroups/getByName('" + grpName + "')/users",
                type: "GET",
                headers: {
                    "Accept": "application/json; odata=verbose",
                    "Content-Type": "application/json; odata=verbose"
                },
                success: function (data) {
                    deferred.resolve(data);
                },
                error: function (error) {
                    deferred.reject(error);
                }
            });
            return deferred.promise();
        }
       
		//Get Dynamic SPGroups to load the DDL
        function getAllSPGroups() {
            var groupsUri = _spPageContextInfo.webAbsoluteUrl + "/_api/web/lists/getbytitle('Dynamic Security Groups')/items";
            jQuery.ajax({
                url: groupsUri,
                type: "GET",
                headers: {
                    "accept": "application/json;odata=verbose",
                    "content-type": "application/json;odata=verbose"
                },
                success: function (data) {
					vm.existingGroups = data.d.results;
                },
                error: function (jqxr, errorCode, errorThrown) {
                    console.log(jqxr.responseText);
                }
            });
        }

		//Submit button click
		$scope.btnSubmitClick = function () {
			$scope.safeApply(function () {
              $scope.hideUsersList = false;
          	});
			//$scope.hideUsersList = false;
            $scope.usersToAdd = angular.copy($scope.originalUsersToAdd);

            //Check if new group or existingGroup
			if(vm.groupSelected == "--Create New Super Group--"){
				checkForGroup($scope.newGrpName, true); 
			}
			else { //selected existing group
			    $scope.existingGroup = vm.groupSelected;
                checkForGroup(vm.groupSelected, false); 
            }
        }

		

	  //Check whether SPGroup exists or not
      function checkForGroup(grpName, isNew) {
          var url = _spPageContextInfo.siteAbsoluteUrl + "/_api/web/sitegroups/getbyname('" + grpName + "')";
          jQuery.ajax({
              url: url,
              type: "GET",
              headers: {
                  "accept": "application/json;odata=verbose",
                  "content-type": "application/json;odata=verbose"
              },
              success: function (data) { //Group exists
				  if(isNew == true){ 
	                  $scope.safeApply(function () {
    	                  $scope.statusMessages = "SharePoint security group <b>'" + grpName + "'</b> already exists. Please enter different name and try again. <br />";
        	          });
				  }
                  else{ //Selected existing group - Add users to group
                      $scope.safeApply(function () {
    	                  $scope.statusMessages = "Adding users to group <b>'" + grpName + "'</b>. <br />";
                      });

                      GetUsersAndUsersFromSPGroups().then(
                      function (allUsers) {
                          if (typeof (allUsers) != "undefined" && allUsers.length > 0) {
                              uniqueUsers = [];
                              $.each(allUsers, function (i, el) {
                                  if ($.inArray(el, uniqueUsers) === -1) uniqueUsers.push(el);
                              });
                              if (uniqueUsers.length > 0) {
                                  AddUsersToGroup(uniqueUsers);
                              }
                          }
                      },
                      function (error) {

                      }
                  );
                  }
              },
              error: function (jqxr, errorCode, errorThrown) { //Group doesn't exist
                  if(isNew == true){
                     $scope.safeApply(function () {
                        $scope.statusMessages = "Compiling users... <br />";
                    });
				  //Create New Group
				  CreateSPGroupREST();
                 }
              }
          });
      }

	   //Create SPGroup
      function CreateSPGroupREST()
      {
          var url = _spPageContextInfo.siteAbsoluteUrl + "/_api/web/sitegroups";
          jQuery.ajax({
              url: url,
              type: "POST",
              data: "{ '__metadata':{ 'type': 'SP.Group' }, 'Title':'" + $scope.newGrpName + "' }",
              headers: {
                  "accept": "application/json;odata=verbose",
                  "content-type": "application/json;odata=verbose",
                  "X-RequestDigest": $("#__REQUESTDIGEST").val()
              },
              success: function (data) {
                  $scope.$apply(function () {
                      $scope.statusMessages += "Created SharePoint security group <b>'" + $scope.newGrpName + "'</b><br />";
                  });
                  GetGroupID();
              },
              error: function (jqxr, errorCode, errorThrown) {
                  $scope.$apply(function () {
                      $scope.statusMessages += "Group creation error: " + jqxr.responseText + " <br />";
                  });
              }
          });
      }

	   //Get newly created SPGroup ID
      function GetGroupID()
      {
          var url = _spPageContextInfo.siteAbsoluteUrl + "/_api/web/sitegroups/getByName('" + $scope.newGrpName + "')/Id";
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
                      $scope.statusMessages += "Assigned Read permissions to the Group - <b>'" + $scope.newGrpName + "'</b><br />";
                  });

                  GetUsersAndUsersFromSPGroups().then(
                      function(allUsers){
                          if(typeof(allUsers) != "undefined" && allUsers.length > 0){
                              uniqueUsers = [];
                              $.each(allUsers, function (i, el) {
                                 if ($.inArray(el, uniqueUsers) === -1) uniqueUsers.push(el);
                              });
                              if(uniqueUsers.length > 0){
                                  AddUsersToGroup(uniqueUsers);
                              }
                          }
                      },
                      function(error){

                      }
                  );
              },
              error: function (jqxr, errorCode, errorThrown) {
                  $scope.$apply(function () {
                      $scope.statusMessages += jqxr.responseText + "<br />";
                  });
              }
          });
      }

      function GetUsersAndUsersFromSPGroups(){
          var def = $.Deferred();
          
          if (vm.data.mu != null && vm.data.mu.results.length > 0) {
              $scope.Input = JSON.stringify(vm.data.mu);
			  grpUsers = [];
			  uniqueUsers = [];
              var counter = 0;
			  for(var count = 0;count<vm.data.mu.results.length;count++){
				 if((vm.data.mu.results[count].Name).includes("|")){
                    counter++;
					 //SPUser
					grpUsers.push(vm.data.mu.results[count].Name + ";;;" + vm.data.mu.results[count].Title);
                    
                    if(counter == vm.data.mu.results.length){
                        def.resolve(grpUsers);
                    }
				 }
				 else{
					 //SPGroup
                     GetSPUsersFromSPGrp(vm.data.mu.results[count].Name).then(
                        function(spGrpUsers){
                            counter++;
                            if(typeof(spGrpUsers) != "undefined" && spGrpUsers.d.results.length > 0){
                                for(var userCount = 0; userCount < spGrpUsers.d.results.length; userCount++){
								    grpUsers.push(spGrpUsers.d.results[userCount].LoginName + ";;;" + spGrpUsers.d.results[userCount].Title);
							    }
                            }
                            if(counter == vm.data.mu.results.length){
                               def.resolve(grpUsers);
                            }
                        },
                        function(error){
                            counter = -100;
                        }
                    );
				 }
			  }
           /*   if(counter == vm.data.mu.results.length){
                  def.resolve(grpUsers);
              }
              else{
                  def.reject(grpUsers);
              }*/
		  }
          return def.promise();
      }

      //Add users to newly created SPGroup
      function AddUsersToGroup(spuUsers)
      {
          usersList = "";
          var failedUser = "";

          AddAllUsersToSPG(spuUsers).then(
              function(){
                  if ($scope.usersToAdd.length > 0) {
                      AddtoDSGListREST(spuUsers);
                    $scope.safeApply(function () {
                        $scope.hideUsersList = true;
                        if(failedUserCount > 0){
                            var finalCount = parseInt($scope.usersToAdd.length) - parseInt(failedUserCount);
                            $scope.statusMessages += "<b>" + finalCount + "</b> Users have been added to the group<br />";
                        }
                        else{
                            $scope.statusMessages += "<b>" + $scope.usersToAdd.length + "</b> Users have been added to the group<br />";
                        }
                        $scope.statusMessages += "<b>Completed</b><br />";
                    });
                }
              },
              function(error){

              }
          );
      }
               
      function AddAllUsersToSPG(uniqueSPUsers){
          var deferred = $.Deferred();

          var failedUser = "";
          failedUserCount = 0;
          var counter = 0;
          var grpName;

          if (typeof ($scope.newGrpName) != "undefined") {
              grpName = $scope.newGrpName;
          }
          else if (typeof ($scope.existingGroup) != "undefined") {
              grpName = $scope.existingGroup;
          }

          var url = _spPageContextInfo.siteAbsoluteUrl + "/_api/web/sitegroups/getByName('" + grpName + "')/users";
          for (var userCount = 0; userCount < uniqueSPUsers.length; userCount++)
          {
              if (uniqueSPUsers[userCount].startsWith("i:0#")) {
                  usersList += uniqueSPUsers[userCount].split(";;;")[0] + ";;";
                  $scope.usersToAdd.push("  " + uniqueSPUsers[userCount].split(";;;")[1]);
                  failedUser = uniqueSPUsers[userCount].split(";;;")[0];

                  jQuery.ajax({
                      url: url,
                      type: "POST",
                      data: "{ '__metadata':{ 'type': 'SP.User' }, 'LoginName':'" + uniqueSPUsers[userCount].split(";;;")[0] + "' }",
                      headers: {
                          "accept": "application/json;odata=verbose",
                          "content-type": "application/json;odata=verbose",
                          "X-RequestDigest": $("#__REQUESTDIGEST").val()
                      },
                      success: function (data) {
                          counter++;
                          if(failedUserCount == 0 && counter == uniqueSPUsers.length){
                              deferred.resolve();
                          }
                          else if(failedUserCount > 0 && ((failedUserCount + counter) == uniqueSPUsers.length)){
                              deferred.resolve();
                          }
                      },
                      error: function (jqxr, errorCode, errorThrown) {
                          failedUserCount++;
                          console.log("Error adding user to SPGroup - ERROR: " + jqxr.responseText);
                      }
                  });
              }
          }
          return deferred.promise();
      }

        //Add/Update 'Dynamic Security Groups' list
      function AddtoDSGListREST(usersList) {
          var grpName;
          var isNew;
          var users = "";
          if (usersList.length > 0) {
              for (var count = 0; count < usersList.length; count++) {
                  users += usersList[count].split(";;;")[0] + ";";
              }
          }

          if (typeof ($scope.newGrpName) != "undefined") {
              grpName = $scope.newGrpName;
              isNew = true;
          }
          else if (typeof ($scope.existingGroup) != "undefined") {
              grpName = $scope.existingGroup;
              isNew = false;
          }

          if (isNew == true) {
              var url = _spPageContextInfo.webAbsoluteUrl + "/_api/web/lists(guid'" + CCI_Common.GetConfig("Dynamic Security Groups") + "')/items"
              jQuery.ajax({
                  url: url,
                  type: "POST",
                  data: JSON.stringify({
                      '__metadata': { 'type': 'SP.Data.DSGListItem' },  ///_api/web/lists/getbytitle('Dynamic Security Groups')/ListItemEntityTypeFullName
                      'GroupName': grpName,
                      'SG': users
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
          else {

              GetExistingGroupItem(grpName).then(
                  function (data) {
                      if (data != null && data.d.results.length > 0) {
                          var existingSG;
                          if (data.d.results[0].SG != null) {
                              existingSG = data.d.results[0].SG + users;
                          }
                          else {
                              existingSG = users
                          }
                          var url = _spPageContextInfo.webAbsoluteUrl + "/_api/web/lists(guid'" + CCI_Common.GetConfig("Dynamic Security Groups") + "')/items(" + data.d.results[0].ID + ")";
                          jQuery.ajax({
                              url: url,
                              type: "POST",
                              data: JSON.stringify({
                                  '__metadata': { 'type': 'SP.Data.DSGListItem' },  ///_api/web/lists/getbytitle('Dynamic Security Groups')/ListItemEntityTypeFullName
                                  'SG': existingSG
                              }),
                              headers: {
                                  "accept": "application/json;odata=verbose",
                                  "content-type": "application/json;odata=verbose",
                                  "X-RequestDigest": $("#__REQUESTDIGEST").val(),
                                  "X-HTTP-Method": "MERGE",
                                  "If-Match": "*"
                              },
                              success: function (d) {
                                  console.log("Updated DSG");
                              },
                              error: function (error) {
                                  console.log("Failed to update DSG - " + JSON.stringify(error));
                              }
                          });
                      }
              });
              
          }
          
      }

      function GetExistingGroupItem(groupName) {
          var deferred = $.Deferred();

          $.ajax({
              url: _spPageContextInfo.webAbsoluteUrl + "/_api/web/lists(guid'" + CCI_Common.GetConfig("Dynamic Security Groups") + "')/items?$filter=GroupName eq '" + groupName + "'",
              type: "GET",
              headers: {
                  "Accept": "application/json; odata=verbose",
                  "Content-Type": "application/json; odata=verbose"
              },
              success: function (data) {
                  deferred.resolve(data);
              },
              error: function (error) {
                  deferred.reject(error);
              }
          });

          return deferred.promise();
      }

    	function getPresence(userId, userTitle) {
			if (userId && userTitle) {
				return '<span class="ms-noWrap"><span class="ms-spimn-presenceLink"><span class="ms-spimn-presenceWrapper ms-imnImg ms-spimn-imgSize-10x10"><img class="ms-spimn-img ms-spimn-presence-disconnected-10x10x32" src="'+service.webAbsoluteUrl+'/_layouts/15/images/spimn.png?rev=23"  alt="" /></span></span><span class="ms-noWrap ms-imnSpan"><span class="ms-spimn-presenceLink"><img class="ms-hide" src="'+service.webAbsoluteUrl+'/_layouts/15/images/blank.gif?rev=23"  alt="" /></span><a class="ms-subtleLink" onclick="GoToLinkOrDialogNewWindow(this);return false;" href="'+service.webAbsoluteUrl+'/_layouts/15/userdisp.aspx?ID=' + userId + '">' + userTitle + '</a></span></span>';
			}
			return '<span></span>';
		}
	}
})();
