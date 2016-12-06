'use strict';

//Variables
var hostUrl = '/' + window.location.pathname.split('/')[1] + '/' + window.location.pathname.split('/')[2] + '/';
var scriptbase = _spPageContextInfo.webServerRelativeUrl + "/_layouts/15/";

/*---------------- Document ready method-----------------*/
$(document).ready(function () 
{
    $.getScript(scriptbase + "SP.js", function () {
        $("#ctl00_ctl39_g_ba1b88b5_501f_4e3b_b461_edea82fdb0fe_ctl00_toolBarTbl_RightRptControls_ctl01_ctl00_diidIOSaveItem").val('Vote Now');
        redirectmyOpinionAlreadyResponded();
    });
});
/*--------------End of Document ready method--------------*/

/*---------------- Main method to check already voted or not-----------------*/
function redirectmyOpinionAlreadyResponded()
{
     var evt = arguments[0];
    var url = arguments[1];

    //Read survey 'my Opinion' for current user to find out if he has already voted
    readSurveyVotes(function(votesCount){
        if(votesCount > 0) {
            // window.alert('You have already voted to this survey.');
            console.log('You have already voted to this survey.');
            var url = "summary.aspx";
            location.href = url;
            console.log(location.href);
        }
        else {
            console.log('Proceed to vote');
        }
    });
}
/*----------------End of Main method to check already voted or not-----------------*/

/*---------------- Method to fetch voting result-----------------*/
function readSurveyVotes(cbSurveyResult)
{
    var context = new SP.ClientContext.get_current();
    var web = context.get_web();
    var list = web.get_lists().getByTitle("my Opinion");
    var viewXml = '<View><Where><Eq><FieldRef Name="Author"/><Value Type="Integer"><UserID Type="Integer"/></Value></Eq></Where></View>';
    var query = new SP.CamlQuery();
    query.set_viewXml(viewXml);
    var items = list.getItems(query);
    context.load(items);
    context.add_requestSucceeded(onLoaded);
    context.add_requestFailed(onFailure);
    context.executeQueryAsync();
    function onLoaded() {
        var voteCount = items.get_count();
        cbSurveyResult(voteCount)
    }
    function onFailure() {
        console.log("error: cbSurveyResult");
        cbSurveyResult(null);
    }
}
/*----------------End of method to fetch voting result-----------------*/