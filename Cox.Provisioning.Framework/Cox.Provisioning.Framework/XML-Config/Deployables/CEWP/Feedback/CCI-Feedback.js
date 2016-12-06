'use strict';

var hostUrl = '/' + window.location.pathname.split('/')[1] + '/' + window.location.pathname.split('/')[2] + '/';
var scriptbase = _spPageContextInfo.webServerRelativeUrl + "/_layouts/15/";

var FeedbackListKey = "CCIFeedback";
var FeedbackTopicsListKey = "CCIFeedbackTopics";
var FeedbackGUID = "";
var FeedbackTopicsGUID = "";

//List Columns
var col_Title = "Title";
var col_Name = "CCI_x002d_Name";
var col_Email = "CCI_x002d_Email";
var col_Comment = "CCI_x002d_FeedBackComment";
var col_Topic = "CCI_x002d_Topic";
var col_Topics = "CCI_x002d_FeedbackTopic";
var col_Anonymous = "CCI_x002d_Anonymous";
var col_EmailTopicOwner = "CCI_x002d_EmailTopicOwner";
var col_DispFormLink = "CCI_x002d_DispFormLink";
var col_SourceLink = "CCI_x002d_SourceLink";
var contextFeedback;
var FeedbackList;
var FeedbackTopicsList;
var FBuser;
var FBusername;
var FBuseremail;
var btndata;
var hostweb;
var oListItem;


/*---------------- Document ready method-----------------*/
$(document).ready(function () {
    // $.getScript(scriptbase + "SP.js", function () {
    $.getScript(scriptbase + "SP.UserProfiles.js", function () {
        // $.getScript(scriptbase + "Reputation.js", function () {
        $.getScript(scriptbase + "SP.RequestExecutor.js", loadCoxFeedback);
        //});
    });
    //});
});
/*--------------End of Document ready method--------------*/


/*---------------- Main method for Feedback-----------------*/
function loadCoxFeedback() {
    $("#feedback").empty();

    var divdata = "<div id=\"feedback-form\" style='display:none;' class=\"col-xs-4 col-md-4 panel panel-default\">" +
                "<b>We welcome your feedback!</b>" +
                "<div class=\"form-group\">" +
                    "Name:<input class=\"form-control\" id=\"Name\" name=\"Name\" autofocus=autofocus placeholder=\"Your Name\" type=\"text\" />" +
                "</div>" +
                "<div class=\"form-group\">" +
                    "Email:<input class=\"form-control\" id=\"Email\" name=\"Email\" autofocus=autofocus placeholder=\"Your e-mail\" type=\"email\"/>" +
                "</div>" +
                "<div class=\"form-group\">" +
                    "Comments / Notes:<textarea class=\"form-control\" id=\"Body\" name=\"Body\" placeholder=\"Please write your feedback here...\" rows=\"5\"></textarea>" +
                "</div>" +
                "<div class=\"form-group\">" +
                    "Topic:<select class=\"form-control\" id=\"Topic\" name=\"Topic\">" +
                    "</select>" +
                "</div>" +
                "<div class=\"form-group\">" +
                    "Anonymous <input id=\"Isanonymous\" name=\"Isanonymous\" type=\"checkbox\" onclick=\"FieldValueRemove()\"/>" +
                "</div>" +
            "<button class=\"btn btn-primary pull-right\" id=\"btnFeedbackSubmit\" type=\"button\" onclick=\"CloseFeedbackPopup()\">Cancel</button>&nbsp;&nbsp;" +
                "<button class=\"btn btn-primary pull-right\" id=\"btnFeedbackSubmit\" type=\"button\" onclick=\"addFeedbackListItem()\">Send</button>&nbsp;&nbsp;" +
        "</div>" +
        "<div id=\"feedback-tab\">Feedback</div>";
    $("#feedback").append(divdata);

    //$("#feedback-tab").click(function () {
    //    $("#feedback-form").toggle();
    //});
//////////////////////////////////////////////////////////////////
    var $userfeedback = $('#feedback-form');
    var Feedbacktimer;
    $("#feedback-tab").click(function () {
        StartFeedbackTimers();
    });
    function StartFeedbackTimers() {
        if ($userfeedback.is(':hidden')) {
            Feedbacktimer = setTimeout(function () {
                $('#feedback-form').hide();
            }, 5000);
        }
        $userfeedback.toggle();
    }

    // Reset Feedbacktimer
    function ResetFeedbackTimers() {
        //alert("hi");
        clearTimeout(Feedbacktimer);
        if ($userfeedback.is(':visible')) {
            Feedbacktimer = setTimeout(function () {
                $('#feedback-form').hide();
            }, 5000);
        }
    }
    $('#feedback-form').mousemove(function (event) {
        ResetFeedbackTimers();
    });
    $('#feedback-form').keypress(function (event) {
        ResetFeedbackTimers();
    });
/////////////////////////////////////////////////////////////////
    contextFeedback = new SP.ClientContext(_spPageContextInfo.siteAbsoluteUrl);
    hostweb = contextFeedback.get_web();
    FBuser = hostweb.get_currentUser();
    //user = contextFeedback.get_web().get_currentUser();
   
    //FeedbackList = hostweb.get_lists().getByTitle(FeedbackListName);


    FeedbackGUID = CCI_Common.GetConfig(FeedbackListKey);
    //console.log("Feedback GUID: " + FeedbackGUID);
    FeedbackList = hostweb.get_lists().getById(FeedbackGUID);


    FeedbackTopicsGUID = CCI_Common.GetConfig(FeedbackTopicsListKey);
    //console.log("FeedbackTopics GUID: " + FeedbackTopicsGUID);
    FeedbackTopicsList = hostweb.get_lists().getById(FeedbackTopicsGUID);

    contextFeedback.load(FBuser);
    contextFeedback.load(FeedbackList);
    contextFeedback.load(FeedbackTopicsList);
    contextFeedback.executeQueryAsync(onGetResourcesFeedbackSuccess, onGetResourcesFeedbackFail);
}

function onGetResourcesFeedbackSuccess() {
    $('#Topic').empty();
    $("#Name").prop("disabled", false);
    $("#Email").prop("disabled", false);

    FBusername = FBuser.get_title();
    FBuseremail = FBuser.get_email();
    $("#Name").val(FBusername);
    $("#Email").val(FBuseremail);

    $.ajax({

        //url: hostUrl + "_api/web/lists/GetByTitle('" + FeedbackTopicsListName + "')/items",
        url: hostUrl + "_api/web/lists/GetByID('" + FeedbackTopicsGUID + "')/items",
        type: 'GET',
        headers: {
            'accept': 'application/json;odata=verbose',
        },
        success: function (data) {
            $.each(data.d.results, function (index, item) {
                $('#Topic').append('<option value="' + item.ID + '=' + item.CCI_x002d_Email + '">' + item.CCI_x002d_FeedbackTopic + '</option>');
            });
        },
        error: function (error) {
            console.log("Feedback: " + JSON.stringify(error));
        }

    });
}

// This function is executed if the above call fails
function onGetResourcesFeedbackFail(sender, args) {
    console.log('Failed to load resources error:' + args.get_message());
    CCI_Common.LogException(_spPageContextInfo.userLoginName, "Feedback:", _spPageContextInfo.serverRequestPath, JSON.stringify(args.get_message()));
}
/*--------------End of Main method--------------*/

/*---------------- Method to check valid email-----------------*/
function ValidateEmail(email) {
    var expr = /^([\w-\.]+)@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.)|(([\w-]+\.)+))([a-zA-Z]{2,4}|[0-9]{1,3})(\]?)$/;
    return expr.test(email);
}
/*--------------End of method for valid email--------------*/

/*---------------- Method to add New Feedback-----------------*/
function addFeedbackListItem() {
    // var clientContext = new SP.ClientContext(siteUrl);
    //FeedbackList = hostweb.get_lists().getByTitle(FeedbackListName);

    var flagFeedback = 1;
    if ($("#Body").val().trim().length == 0) {
        flagFeedback = 0;
        alert("Please provide the comment");
    }
    if (!$("#Isanonymous").prop("checked")) {
        if ($("#Name").val().trim().length == 0) {
            flagFeedback = 0;
            alert("Name should not be blank");
        }
        if (!ValidateEmail($("#Email").val())) {
            flagFeedback = 0;
            alert("Invalid email address");
        }
    }

    if (flagFeedback == 1) {
        var currentURL = window.location.href;
        var itemCreateInfo = new SP.ListItemCreationInformation();
        oListItem = FeedbackList.addItem(itemCreateInfo);
        oListItem.set_item(col_Name, $("#Name").val());
        oListItem.set_item(col_Email, $("#Email").val());
        oListItem.set_item(col_Comment, $("#Body").val() + "<br/>" + "Source page: " + currentURL);
        oListItem.set_item(col_Topic, $("#Topic option:selected").val().split('=')[0] + ';#' + $("#Topic option:selected").text());
        oListItem.set_item(col_EmailTopicOwner, $("#Topic option:selected").val().split('=')[1]);
        oListItem.set_item(col_DispFormLink, currentURL.substring(0, currentURL.indexOf('/sites')) + hostUrl + 'Lists/CCI-Feedback/DispForm.aspx?ID=');
        oListItem.set_item(col_SourceLink, currentURL);

        if ($("#Isanonymous").prop("checked")) {
            oListItem.set_item(col_Anonymous, "true");
        }
        else {
            oListItem.set_item(col_Anonymous, "false");
        }
        oListItem.update();

        contextFeedback.load(oListItem);
        contextFeedback.executeQueryAsync(
            Function.createDelegate(this, onQuerySucceeded),
            Function.createDelegate(this, onQueryFailed)
        );
    }
}

function CloseFeedbackPopup() {
    $("#feedback-form").toggle();
    $("#Body").val('');
}

function onQuerySucceeded() {
    $("#feedback-form").toggle();
    alert("Thanks for your feedback!");
    //SendFeedbackEmail();  -- commented as we are using SP designer workflow to send email
    console.log('Feedback Item created: ' + oListItem.get_id());
    $("#Body").val('');
}

function onQueryFailed(sender, args) {
    console.log('Feedback Request failed. ' + args.get_message() +
        '\n' + args.get_stackTrace());
    CCI_Common.LogException(_spPageContextInfo.userLoginName, "Feedback:", _spPageContextInfo.serverRequestPath, JSON.stringify(args.get_message()));

}
/*--------------End of method for New Feedback--------------*/

function FieldValueRemove() {
    if ($("#Isanonymous").prop("checked")) {
        $("#Name").val('');
        $("#Email").val('');
        $("#Name").prop("disabled", true);
        $("#Email").prop("disabled", true);
    }
    else {
        $("#Name").prop("disabled", false);
        $("#Email").prop("disabled", false);
        $("#Name").val(FBusername);
        $("#Email").val(FBuseremail);
    }
}

/*---------------- Method to send email-----------------*/
function SendFeedbackEmail() {
    var sitetemplateurl = _spPageContextInfo.webServerRelativeUrl + "/_api/SP.Utilities.Utility.SendEmail";
    var name = $("#Name").val();
    if (name.trim().length == 0) {
        name = "Anonymous";
    }
    var from = $("#Email").val();

    if (from.trim().length == 0) {
        from = "Anonymous";
    }
    //var msg = 'From: ' + name + '<br/><br/>' + 'Email: ' + from + '<br/><br/><br/>' + $("#mymessage").val();
    var msg = 'From: ' + name + '<br/><br/>' + 'Email: ' + from + '<br/><br/><br/>' + 'Topic: ' + $("#Topic option:selected").text() + '<br/><br/>Comment: ' + $("#Body").val() + '<br/><br/>' +
        '<a href="' + window.location.href.substring(0, window.location.href.indexOf('/sites')) + hostUrl + 'Lists/CCI-Feedback/DispForm.aspx?ID=' + oListItem.get_id() + '">Click here</a> to see the details.';
    $("#Body").val('');

    $.ajax({
        contentType: 'application/json',
        url: sitetemplateurl,
        type: "POST",
        data: JSON.stringify({
            'properties': {
                '__metadata': { 'type': 'SP.Utilities.EmailProperties' },
                'From': from,
                'To': { 'results': [$("#Topic option:selected").val().split('=')[1]] },
                'Body': msg,
                'Subject': 'Feeback from: ' + name
            }
        }),
        headers: {
            "Accept": "application/json;odata=verbose",
            "content-type": "application/json;odata=verbose",
            "X-RequestDigest": $("#__REQUESTDIGEST").val()
        },
        success: function (data) {
            //alert('Message sent successfully !!!');
        },
        error: function (err) {
            console.log(JSON.stringify(err));
            CCI_Common.LogException(_spPageContextInfo.userLoginName, "Feedback:", _spPageContextInfo.serverRequestPath, JSON.stringify(err));
        }
    });
}
/*---------------- End of method to send email-----------------*/



