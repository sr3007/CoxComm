'use strict';

//Variables
var hostUrl = '/' + window.location.pathname.split('/')[1] + '/' + window.location.pathname.split('/')[2] + '/';
var scriptbase = _spPageContextInfo.webServerRelativeUrl + "/_layouts/15/";
var PreferredName;
var userProfileProperties;
var surveyconfigValue = null;
var surveyReturnString = '';


/*---------------- Document ready method-----------------*/
$(document).ready(function () {
    $.getScript(scriptbase + "SP.js", function () {
        $(".ms-ButtonHeightWidth").val('Vote Now');
        if ($("#myOpinioniFrame").context.URL.indexOf('summary.aspx') < 0) {
            $.getScript(scriptbase + "SP.UserProfiles.js", getUserPropertiesmyOpinion);
        }
    });
});
/*--------------End of Document ready method--------------*/

/*---------------- Main method to check already voted or not-----------------*/
function redirectmyOpinionAlreadyResponded()
{
    //Read survey 'my Opinion' for current user to find out if he has already voted
    readSurveyVotes(function (votesCount) {
        if (votesCount != null) {
            if (votesCount > 0) {
                console.log('You have already voted to this survey.');
                var url = "summary.aspx";
                var url = surveyReturnString.substring(surveyReturnString.indexOf('|') + 1, surveyReturnString.lastIndexOf('/') + 1) + "summary.aspx";
                $("#myOpinioniFrame").attr("src", ".." + url);
            }
            else {
                var url = surveyReturnString.substring(surveyReturnString.indexOf('|') + 1);
                $("#myOpinioniFrame").attr("src", ".." + url);
                console.log('Proceed to vote');
            }
        }
        else
        {
            $("#myOpinioniFrame").attr("src", "");
            var msg = 'There are no active Survey or multiple active Survey.';
            CCI_Common.LogException(_spPageContextInfo.userLoginName, "myOpinion:", _spPageContextInfo.serverRequestPath, msg);
            console.log(msg);
        }
    });
}
/*----------------End of Main method to check already voted or not-----------------*/

/*---------------- Method to fetch voting result-----------------*/
function readSurveyVotes(cbSurveyResult)
{
    var context = new SP.ClientContext.get_current();
    var web = context.get_web();
    surveyReturnString = GetSurveyConfig();
    var myOpinionGUID = surveyReturnString.substring(0, surveyReturnString.indexOf('|'));
    var list = web.get_lists().getById(myOpinionGUID);
    var viewXml = "<View><Query><Where><Eq><FieldRef Name='Author'/><Value Type='User'>" + PreferredName + "</Value></Eq></Where></Query></View>";
    var query = new SP.CamlQuery();
    query.set_viewXml(viewXml);
    var items = list.getItems(query);
    context.load(items);
    context.executeQueryAsync(onSurveyLoaded, onSurveyFailure);
    function onSurveyLoaded() {
        var voteCount = items.get_count();
        cbSurveyResult(voteCount)
    }
    function onSurveyFailure() {
        //console.log("error: cbSurveyResult");
        console.log("cbSurveyResult - null");
        cbSurveyResult(null);
    }
}
/*----------------End of method to fetch voting result-----------------*/


/*--------------Method used to get user profile properties--------------*/

function getUserPropertiesmyOpinion() {
    var clientContext = new SP.ClientContext.get_current();
    var peopleManager = new SP.UserProfiles.PeopleManager(clientContext);
    userProfileProperties = peopleManager.getMyProperties();
    clientContext.load(userProfileProperties);
    clientContext.executeQueryAsync(onSurveyRequestSuccess, onSurveyRequestFail);
}

function onSurveyRequestSuccess() {
    //console.log(userProfileProperties.get_userProfileProperties()['WorkEmail']);
    console.log(userProfileProperties.get_userProfileProperties()['PreferredName']);
    //console.log(userProfileProperties.get_userProfileProperties()['WorkPhone']);
    //console.log(userProfileProperties.get_userProfileProperties()['Location']);
    //console.log(userProfileProperties.get_userProfileProperties()['Department']);

    PreferredName = userProfileProperties.get_userProfileProperties()['PreferredName'];
    redirectmyOpinionAlreadyResponded();
}

function onSurveyRequestFail(sender, args)
{
    CCI_Common.LogException(_spPageContextInfo.userLoginName, "myOpinion:", _spPageContextInfo.serverRequestPath, JSON.stringify(args.get_message()));
    console.log(args.get_message());
}
/*--------------End of Method used to get user profile properties--------------*/

/*---------------- Get Survey configuration method-----------------*/
//function GetSurveyConfig(configKey) {
function GetSurveyConfig() {
        var configListUri = _spPageContextInfo.siteAbsoluteUrl + "/_api/web/lists/getbytitle('CCI-SurveyConfig')/items?";
        configListUri += "$select=CCI_x002d_Value&$select=CCI_x002d_ListURL";
        configListUri += "&$filter=CCI_x002d_Status eq 'Active'";
        jQuery.ajax({
            url: configListUri,
            type: "GET",
            async: false,
            contentType: "application/json;odata=nometadata",
            headers: {
                "Accept": "application/json;odata=nometadata"
            },

            //contentType: "application/json;odata=verbose",

            //headers: {
            //    "accept": "application/json;odata=verbose",
            //},

            success: function (data) {
                if (data.value.length == 1) {
                    if (typeof (data.value[0]) !== "undefined") {
                        surveyconfigValue = data.value[0].CCI_x002d_Value + '|' + data.value[0].CCI_x002d_ListURL;
                        //console.log("surveyconfigValue-1 " + surveyconfigValue);
                    }
                    else {
                        surveyconfigValue = "";
                        //console.log("surveyconfigValue-2 " + surveyconfigValue);
                        //console.log(data.value[0]);
                        //console.log(data.value[1]);
                    }
                }
                else {
                    surveyconfigValue = "";
                    console.log("surveyconfigValue-3 " + surveyconfigValue);
                }
            },
            error: function (error) {
                CCI_Common.LogException(_spPageContextInfo.userLoginName, "myOpinion:", _spPageContextInfo.serverRequestPath, JSON.stringify(error));
                surveyconfigValue = "";
                console.log("data.value[0] : " + JSON.stringify(error));
            }
        });
        if (surveyconfigValue!= null) {
            return surveyconfigValue;
        }
        else {
            return "";
        }
    }
/*--------------End of Method used to get Survey configuration method--------------*/