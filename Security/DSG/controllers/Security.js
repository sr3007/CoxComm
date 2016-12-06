// JavaScript source code

var usersFromUPA = [];
var uniqueUPAUsers = [];

var CCI_Security = {
    spGroupName: null,

    CreateSPGroupJSOM: function () {
        spGroupName = 'CustomGroup' + Date.now();
        // Get the current client context instance.
        var clientContext = SP.ClientContext.get_current();
        var currentWeb = clientContext.get_web();

        var groupCollection = clientContext.get_web().get_siteGroups();

        // Create Group information for a Group
        var newGroup = new SP.GroupCreationInformation();
        newGroup.set_title(spGroupName);
        newGroup.set_description('Created with JSOM');

        //add  group
        oNewGroup = currentWeb.get_siteGroups().add(newGroup);

        //Get Role Definition by name - return SP.RoleDefinition object
        var rdRead = currentWeb.get_roleDefinitions().getByName('Read');

        // Create a new RoleDefinitionBindingCollection.
        var collRead = SP.RoleDefinitionBindingCollection.newObject(clientContext);

        // Add the role to the collection.
        collRead.add(rdRead);

        // Get the RoleAssignmentCollection for the target web.
        var assignments = currentWeb.get_roleAssignments();

        // assign the group to the new RoleDefinitionBindingCollection.
        var roleAssignmentRead = assignments.add(oNewGroup, collRead);

        clientContext.load(oNewGroup);
        //clientContext.executeQueryAsync(Function.createDelegate(this, createGroupSuccess), Function.createDelegate(this, this.createGroupFailed));
        clientContext.executeQueryAsync(function () { alert("Success"); }, function (sender, args) {
            alert(args.get_message() + '\n' + args.get_stackTrace())
        });
    },

    CreateSPGroupREST: function (groupName) {
        var url = _spPageContextInfo.siteAbsoluteUrl + "/_api/web/sitegroups";
        jQuery.ajax({
            url: url,
            type: "POST",
            data: "{ '__metadata':{ 'type': 'SP.Group' }, 'Title':'" + groupName + "' }",
            headers: {
                "accept": "application/json;odata=verbose",
                "content-type": "application/json;odata=verbose",
                "X-RequestDigest": $("#__REQUESTDIGEST").val()
            },
            success: function (data) {
                //AddUsersToGroupREST(groupName);
                return "Success";
            },
            error: function (jqxr, errorCode, errorThrown) {
                alert(jqxr.responseText);
            }
        });
    },

    AddUsersToGroupREST: function (groupName) {
        if (typeof (uniqueUPAUsers) !== "undefined" && uniqueUPAUsers != null && uniqueUPAUsers.length > 0) {
            for (var userId = 0; userId < uniqueUPAUsers.length; userId++)
            {
                jQuery.ajax({
                    url: _spPageContextInfo.siteAbsoluteUrl + "/_api/web/sitegroups/getByName('" + groupName + "')/users",
                    type: "POST",
                    data: "{ '__metadata':{ 'type': 'SP.User' }, 'LoginName':'" + uniqueUPAUsers[userId] + "' }",
                    headers: {
                        "accept": "application/json;odata=verbose",
                        "content-type": "application/json;odata=verbose",
                        "X-RequestDigest": $("#__REQUESTDIGEST").val()
                    },
                    success: function (data) {
                        Alert("User Added successfully");
                    },
                    error: function (jqxr, errorCode, errorThrown) {
                        alert(jqxr.responseText);
                    }
                });
            }
        }
    },

    CheckWhetherSPGroupExists: function (groupName) {
        var url = _spPageContextInfo.siteAbsoluteUrl + "/_api/web/sitegroups/getbyname('" + groupName + "')";
        jQuery.ajax({
            url: url,
            type: "GET",
            headers: {
                "accept": "application/json;odata=verbose",
                "content-type": "application/json;odata=verbose"
            },
            success: function (data) {
                return "Group Exists";
            },
            error: function (jqxr, errorCode, errorThrown) {
                alert(jqxr.responseText);
                //return true;
            }
        });
    },
    
    GetUsersFromUPA: function (query, groupName) {
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

                    for (var i = 0; i < results.length; i++) {
                        for (var keys = 0; keys < results[i].Cells.results.length; keys++) {
                            if (results[i].Cells.results[keys]["Key"] != null && typeof (results[i].Cells.results[keys]["Key"] != "undefined")) {
                                if (results[i].Cells.results[keys]["Key"] == "AccountName") {
                                    var accountName = results[i].Cells.results[keys].Value;
                                    if (accountName != null && typeof (accountName) !== "undefined") {
                                        var accName = accountName.split("|");
                                        usersFromUPA.push(accName[accName.length - 1]);
                                        break;
                                    }
                                }
                            }
                        }
                    }
                    //Unique Used Ids
                    $.each(usersFromUPA, function (i, el) {
                        if ($.inArray(el, uniqueUPAUsers) === -1) uniqueUPAUsers.push(el);
                    });
                    alert("User Count - " + uniqueUPAUsers.length);
                    CCI_Security.CreateSPGroupREST(groupName);
                }
                else {
                    alert("No Results found");
                }
            },
            error: function (jqxr, errorCode, errorThrown) {
                alert("Failed: " + jqxr.responseText);
            }
        });
    }

}