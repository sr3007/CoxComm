//App Controller
var grpUsers = [];
        var uniqueUsers = [];
        var groupId;
        var roleDefinitionId;
        var usersList = "";

var appWP = angular.module('app', []);

appWP.factory('SGUserGroupService', function($q){
        return {
            getSPUsers: function (grpName) {
                var deferred = $q.defer();
                var reqUri = _spPageContextInfo.siteAbsoluteUrl + "/_api/web/sitegroups/getByName('" + grpName + "')/users";
                jQuery.ajax({
                    url: reqUri,
                    type: "GET",
                    async: false,
                    headers: {
                        "accept": "application/json;odata=verbose",
                    },
                    success: function (data) {
                        deferred.resolve(data);
                    },
                    error: function (jqxr, errorCode, errorThrown) {
                        deferred.reject(jqxr.responseText);
                    }
                });
                return deferred.promise;
            },
        };
    });


    appWP.controller('appCtrlr', function($scope, $timeout, SGUserGroupService){
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

            //var myResult = SGUserGroupService.getSPUsers("CCI4");

            getAllSPGroups();

			//getData();	
			//Update the weburl property
			//This is to demo passing in a Web URL to the people picker via the pp-web-url attribute.
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
		
		//Get SPGroups
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
                    console.log("Success");
					vm.existingGroups = data.d.results;
                },
                error: function (jqxr, errorCode, errorThrown) {
                    //alert(jqxr.responseText);
                    
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
            else{ //selected existing group
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
                      //loopThroughUsersGroups();
                  }
              },
              error: function (jqxr, errorCode, errorThrown) { //Group doesn't exist
                  //alert(jqxr.responseText);
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

                  loopThroughUsersGroups().done(
                      function(spUniqueUsers){
                          if(typeof(spUniqueUsers) != "undefined" && spUniqueUsers.length > 0){
                              AddUsersToGroup(spUniqueUsers);
                          }
                      }
                  );
                  //loopThroughUsersGroups();
                  //AddUsersToGroup();
              },
              error: function (jqxr, errorCode, errorThrown) {
                  $scope.$apply(function () {
                      $scope.statusMessages += jqxr.responseText + "<br />";
                  });
              }
          });
      }

	  //Loop through each user/group
	  function loopThroughUsersGroups(){
          var finalUsersToAdd = $.Deferred();

		  if(vm.data.mu != null && vm.data.mu.results.length > 0){
			  grpUsers = [];
			  uniqueUsers = [];
			  for(var count = 0;count<vm.data.mu.results.length;count++){
				 if((vm.data.mu.results[count].Name).includes("|")){
					 //SPUser
					grpUsers.push(vm.data.mu.results[count].Name + ";;;" + vm.data.mu.results[count].Title);
				 }
				 else{
					 //SPGroup
                     GetSPGUsers(vm.data.mu.results[count].Name).done(
                         function(spGrpUsers){
                             if(typeof(spGrpUsers) != "undefined" && spGrpUsers.d.results.length > 0){
                                 for(var userCount = 0; userCount < spGrpUsers.d.results.length; userCount++){
								    grpUsers.push(spGrpUsers.d.results[userCount].LoginName + ";;;" + spGrpUsers.d.results[userCount].Title);
							    }
                             }
                         }
                     );
				 }
			  }
			  //Unique Users
			  if(grpUsers.length > 0){
				  $.each(grpUsers, function (i, el) {
                	if ($.inArray(el, uniqueUsers) === -1) uniqueUsers.push(el);
              	});
			  }
              finalUsersToAdd.resolve(uniqueUsers);
		  }
          return finalUsersToAdd;
	  }
      function getUniqueUsers(){
          //Unique Users
			  if(grpUsers.length > 0){
				  $.each(grpUsers, function (i, el) {
                	if ($.inArray(el, uniqueUsers) === -1) uniqueUsers.push(el);
              	});
			  }
      }

      function GetSPGUsers(spGroup){
          var usersFromSPG = $.Deferred();
          jQuery.ajax({
                      url: _spPageContextInfo.siteAbsoluteUrl + "/_api/web/sitegroups/getByName('" + spGroup + "')/users",
                      type: "GET",
                      headers: {
                          "accept": "application/json;odata=verbose",
                          "content-type": "application/json;odata=verbose"
                      },
                      success: function (data) {
						  usersFromSPG.resolve(data);
                      },
                      error: function (jqxr, errorCode, errorThrown) {
                          usersFromSPG.reject(jqxr.responseText);
                      }
                  	});
         
          return usersFromSPG;
      }

      function GetUsersFromSPGroup(spGrp){
          var groupUrl = _spPageContextInfo.siteAbsoluteUrl + "/_api/web/sitegroups/getByName('" + spGrp + "')/users";
          var thisGroupUsers = [];

					 jQuery.ajax({
                      url: groupUrl,
                      type: "GET",
                      headers: {
                          "accept": "application/json;odata=verbose",
                          "content-type": "application/json;odata=verbose"
                      },
                      success: function (data) {
						  if(data.d.results.length > 0){
                              for(var userCount = 0; userCount < data.d.results.length; userCount++){
								thisGroupUsers.push(data.d.results[userCount].LoginName + ";;;" + data.d.results[userCount].Title);
							  }
                              return thisGroupUsers;
						  }
                      },
                      error: function (jqxr, errorCode, errorThrown) {
						  console.log("Error Loop - " + jqxr.responseText);
                      }
                  	});

                    //return thisGroupUsers;
      }

      //Add users to newly created SPGroup
      function AddUsersToGroup(spuUsers)
      {
          usersList = "";
          
          var url = _spPageContextInfo.siteAbsoluteUrl + "/_api/web/sitegroups/getByName('" + $scope.newGrpName + "')/users";
          for (var userCount = 0; userCount < spuUsers.length; userCount++)
          {
              if (spuUsers[userCount].startsWith("i:0#")) {
                  usersList += spuUsers[userCount].split(";;;")[0] + ";;";
                  $scope.usersToAdd.push("  " + spuUsers[userCount].split(";;;")[1]);

                  jQuery.ajax({
                      url: url,
                      type: "POST",
                      data: "{ '__metadata':{ 'type': 'SP.User' }, 'LoginName':'" + spuUsers[userCount].split(";;;")[0] + "' }",
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
              $scope.safeApply(function () {
                  $scope.hideUsersList = true;
                  $scope.statusMessages += "<b>" + $scope.usersToAdd.length + "</b> Users have been added to the group<br />";
                  $scope.statusMessages += "<b>Completed</b><br />";
              });
          }
      }
               
		function getPresence(userId, userTitle) {
			if (userId && userTitle) {
				return '<span class="ms-noWrap"><span class="ms-spimn-presenceLink"><span class="ms-spimn-presenceWrapper ms-imnImg ms-spimn-imgSize-10x10"><img class="ms-spimn-img ms-spimn-presence-disconnected-10x10x32" src="'+service.webAbsoluteUrl+'/_layouts/15/images/spimn.png?rev=23"  alt="" /></span></span><span class="ms-noWrap ms-imnSpan"><span class="ms-spimn-presenceLink"><img class="ms-hide" src="'+service.webAbsoluteUrl+'/_layouts/15/images/blank.gif?rev=23"  alt="" /></span><a class="ms-subtleLink" onclick="GoToLinkOrDialogNewWindow(this);return false;" href="'+service.webAbsoluteUrl+'/_layouts/15/userdisp.aspx?ID=' + userId + '">' + userTitle + '</a></span></span>';
			}
			return '<span></span>';
		}

    });

