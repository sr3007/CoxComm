//Dynamic Security Groups

var groupName;
var usersFromUPA = [];
var uniqueUPAUsers = [];
//Check whether current user have 'Manage Permissions' & 'Manage Web' permission
function CheckPermissionOnWeb() {
    context = new SP.ClientContext.get_current();
    web = context.get_web();
    this._currentUser = web.get_currentUser();
    context.load(this._currentUser);
    context.load(web, 'EffectiveBasePermissions');
    context.executeQueryAsync(Function.createDelegate(this, this.onUserHavePermission),
      Function.createDelegate(this, this.onUserPermissionFailure));
}


function onUserHavePermission(sender, args) {
    if (web.get_effectiveBasePermissions().has(SP.PermissionKind.managePermissions) && web.get_effectiveBasePermissions().has(SP.PermissionKind.manageWeb)) {
        CreateGroupJSOM();
    }
    else {
        alert(this._currentUser + ' doesn\'t have enough permissions to create Dynamic Security Groups');
    }
}

function onUserPermissionFailure(sender, args) {
    alert('Error to validate current User Permissions: ' + args.get_message() + '\n' + args.get_stackTrace());
}

function BuildQuery()
{
    var query = _spPageContextInfo.webAbsoluteUrl + "/_api/search/query?";
    query += "querytext='srikanth'&";
    //People Search - Default ID of Local People Results - b09a7990-05ea-4af9-81ef-edfab16c4e31
    query += "sourceid='b09a7990-05ea-4af9-81ef-edfab16c4e31'";
    //RowLimit - Default rowlimit is 10
    query += "&RowLimit=1000";
    //Select Properties
    query += "&selectproperties='AccountName'";

    return query;
}

function getUsersFromUPA()
{
    jQuery.ajax(
        {
            url: BuildQuery(),
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
                }
                else {
                    alert("No Results found");
                }
                //Unique Used Ids
                $.each(usersFromUPA, function (i, el) {
                    if ($.inArray(el, uniqueUPAUsers) === -1) uniqueUPAUsers.push(el);
                });
            },
            error: function (jqxr, errorCode, errorThrown) {
                alert("Failed: " + jqxr.responseText);
            }
        });
}


function GetUserAccountNameFromUserProfile() {
    var userAccountNames = [];

    Results = {
        url: '',

        init: function (element) {
            Results.url = BuildQuery();
        },

        load: function () {
            $.ajax(
                    {
                        url: Results.url,
                        method: "GET",
                        headers: {
                            "accept": "application/json;odata=verbose",
                        },
                        success: Results.onSuccess,
                        error: Results.onError
                    }
                );
        },

        onSuccess: function (data) {
            if (data.d.query.PrimaryQueryResult != null) {
                var results = data.d.query.PrimaryQueryResult.RelevantResults.Table.Rows.results;

                for (var i = 0; i < results.length; i++) {
                    for (var keys = 0; keys < results[i].Cells.results.length; keys++)
                    {
                        if (results[i].Cells.results[keys]["Key"] != null && typeof (results[i].Cells.results[keys]["Key"] != "undefined")) {
                            if (results[i].Cells.results[keys]["Key"] == "AccountName") {
                                var accountName = results[i].Cells.results[keys].Value;
                                if (accountName != null && typeof (accountName) !== "undefined")
                                {
                                    var accName = accountName.split("|");
                                    if (typeof(userAccountNames) !== "undefined" && userAccountNames.length > 0) {
                                        userAccountNames[userAccountNames.length - 1] = accName[accName.length - 1];
                                    }
                                    else {
                                        userAccountNames[0] = accName[accName.length - 1];
                                    }
                                    break;
                                }
                            }
                        }
                    }
                }
            }
            else {
                alert("No Results found");
            }
            return userAccountNames;
        },

        onError: function (err) {
            alert(JSON.stringify(err));
        }
    }

    //Results.init($('#resultsDiv'));
    Results.init();
    var users = Results.load();
    return users;

}

//*****************IMCOMPLETE******************
function GetUsersFromUserProfle()
{
    var url = _spPageContextInfo.siteAbsoluteUrl + "_api/search/query?querytext='srikanth,";
    jQuery.ajax({
        url: url,
        type: "GET",
        headers: {
            "accept": "application/json;odata=verbose"
        },
        success: function (data) {
            alert("DSG has been updated")
        },
        error: function (jqxr, errorCode, errorThrown) {
            alert(jqxr.responseText);
        }
    });
    /*
    SP.SOD.executeFunc("SP.js", "SP.ClientContext", function () {
        SP.SOD.executeFunc("SP.Search.js", "Microsoft.SharePoint.Client.Search.Query.KeywordQuery", function () {
            var sContext = SP.ClientContext.get_current();
            var keywordQuery = new Microsoft.SharePoint.Client.Search.Query.KeywordQuery(sContext);
            keywordQuery.set_trimDuplicates(false);
            keywordQuery.set_queryText("*");
            var searchExecutor = new Microsoft.SharePoint.Client.Search.Query.SearchExecutor(sContext);
            results = searchExecutor.executeQuery(keywordQuery);
            sContext.executeQueryAsync(
                function () {
                    d.resolve(results);
                },
                function (err) {
                    d.reject(null);
                }
            );
        });
    });

   
    var clientContext = SP.ClientContext.get_current();
    var keywordQuery = new Microsoft.SharePoint.Client.Search.Query.KeywordQuery(clientContext);
    keywordQuery.set_queryText("srikanth");
    var searchExecutor = new Microsoft.SharePoint.Client.Search.Query.SearchExecutor(clientContext);
    var results = searchExecutor.executeQuery(keywordQuery);
    context.executeQueryAsync(onSearchQuerySuccess, onSearchQueryError);*/
}

function onSearchQuerySuccess()
{
    alert("Search Success");
}

function onSearchQueryError()
{
    alert("Search failed");
}

//Create SharePoint Security Group
function CreateGroupJSOM()
{
    groupName = 'CustomGroup' + Date.now();
    // Get the current client context instance.
    var clientContext = SP.ClientContext.get_current();
    var currentWeb = clientContext.get_web();

    var groupCollection = clientContext.get_web().get_siteGroups();

     // Create Group information for a Group
    var newGroup = new SP.GroupCreationInformation();
    newGroup.set_title(groupName);
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
    clientContext.executeQueryAsync(Function.createDelegate(this, createGroupSuccess), Function.createDelegate(this, this.createGroupFailed));
}

function createGroupSuccess()
{
    //Add New Group info to 'Dynamic Security Groups' List 
    AddtoDSGListJSOM();

    //Get Users' Account Name
    //GetUserAccountNameFromUserProfile();
    getUsersFromUPA();
    AddUsersToSPGroup();
    
}

function AddUsersToSPGroup()
{
    if (typeof (uniqueUPAUsers) !== "undefined" && uniqueUPAUsers != null && uniqueUPAUsers.length > 0) {

    }
}



function createGroupFailed(sender, args)
{
    alert('Unable to create new group - ' + args.get_message() + '\n' + args.get_stackTrace());
}

function AddtoDSGList()
{
    var url = _spPageContextInfo.siteAbsoluteUrl + "/_api/web/Lists/getbytitle('Dynamic Security Groups')/items";
    jQuery.ajax({
        url: url,
        type: "POST",
        data: "",
        headers: {
            "accept": "application/json;odata=verbose",
            "content-type": "application/json;odata=verbose",
            "X-RequestDigest": $("#__REQUESTDIGEST").val()
        },
        success: function (data) { alert("DSG has been updated")},
        error: function (jqxr, errorCode, errorThrown) {
            alert(jqxr.responseText);
        }
    });

}

//Update 'Dynamic Security Groups' list with new group info
function AddtoDSGListJSOM()
{
    var clientContext = SP.ClientContext.get_current();
    var currentWeb = clientContext.get_web();

    var oList = currentWeb.get_lists().getByTitle('Dynamic Security Groups');

    var itemCreateInfo = new SP.ListItemCreationInformation();
    this.oListItem = oList.addItem(itemCreateInfo);
    oListItem.set_item('GroupName', groupName);
    oListItem.set_item('GroupDescription', 'Hello World!');
    oListItem.set_item('GroupUsers', 'Hello World!');
    oListItem.update();

    clientContext.load(oListItem);
    clientContext.executeQueryAsync(
        Function.createDelegate(this, this.onAddingNewDSGItemSucceeded),
        Function.createDelegate(this, this.onAddingNewDSGItemFailed)
    );
}
function onAddingNewDSGItemSucceeded() {
    alert('New Dynamic Security Group Item created: ' + oListItem.get_id());
}

function onAddingNewDSGItemFailed(sender, args) {
    alert('New Dynamic Security Groups list item creation failed. ' + args.get_message() +
        '\n' + args.get_stackTrace());
}