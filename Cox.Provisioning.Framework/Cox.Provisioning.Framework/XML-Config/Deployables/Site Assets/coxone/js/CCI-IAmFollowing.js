<script>
	'use strict';
    
var actorPeopleGQL = "ACTOR(ME\\, action\\:1033)";
var actorDocumentGQL = "ACTOR(ME\\, action\\:1020)";
var actorSiteGQL = "ACTOR(ME\\, action\\:1061)";
var peopleCount = 0;
var documentCount = 0;
var siteCount = 0;
var searchQuery = '';
//var msOnlineObjectId = CCI_Common.GetUserProfilePropertyValue('SPS-DistinguishedName');
var msOnlineObjectId = CCI_Common.GetOtherUserProfilePropertyValue('msOnline-ObjectId', _spPageContextInfo.userLoginName);
//alert(msOnlineObjectId);
    
var htmlContent = '<div class="ms-profile-followedCountDiv"><ul class="ms-core-listMenu-root"><li id="FollowedCounts_People_ListItem" class="ms-profile-followedCountListItem"><div id="FollowedCounts_People_Count" class="ms-profile-followedCountValue ms-largeNumber"><a id="FollowedCounts_People_Link" class="ms-subtleLink ms-profile-followedCountLink" href="https://mod174499-my.sharepoint.com/_layouts/15/me.aspx?v=liveprofileworkingwith&amp;p=admin@mod174499.onmicrosoft.com" title="See the people you are following">{People}</a></div><span id="FollowedCounts_People_Label" class="ms-metadata ms-profile-followedCountLabel">people</span></li><li id="FollowedCounts_Documents_ListItem" class="ms-profile-followedCountListItem"><div id="FollowedCounts_Documents_Count" class="ms-profile-followedCountValue ms-largeNumber"><a id="FollowedCounts_Documents_Link" class="ms-subtleLink ms-profile-followedCountLink" href="https://mod174499-my.sharepoint.com/_layouts/15/me.aspx?v=liveprofiletrending&amp;p=admin@mod174499.onmicrosoft.com" title="See the documents you are following">{Document}</a></div><span id="FollowedCounts_Documents_Label" class="ms-metadata ms-profile-followedCountLabel">documents</span></li><li id="FollowedCounts_Sites_ListItem" class="ms-profile-followedCountListItem"><div id="FollowedCounts_Sites_Count" class="ms-profile-followedCountValue ms-largeNumber"><a id="FollowedCounts_Sites_Link" class="ms-subtleLink ms-profile-followedCountLink" href="https://mod174499-my.sharepoint.com/_layouts/15/me.aspx?v=work&amp;p=admin@mod174499.onmicrosoft.com" title="See the sites you are following">{Sites}</a></div><span id="FollowedCounts_Sites_Label" class="ms-metadata ms-profile-followedCountLabel">sites</span></li></ul></div>';

function loadPeople() {
    searchQuery = _spPageContextInfo.webAbsoluteUrl + "/_api/search/query?Querytext='*'&Properties='GraphQuery:" + actorPeopleGQL + 
    "'&RowLimit=1000&SelectProperties='Path,Title,Rank,ViewsLifeTime,FileType,LastModifiedTime'"

    $.ajax({
        url: searchQuery,
        method: "GET",
        headers: {"Accept": "application/json; odata=verbose"},
        success: function(data){
            if(data.d.query.PrimaryQueryResult != null)
            {
                peopleCount = data.d.query.PrimaryQueryResult.RelevantResults.Table.Rows.results.length;
            }
            var toBeReplaced = "{People}";
            var position = htmlContent.indexOf(toBeReplaced);
            htmlContent = [htmlContent.slice(0, position), peopleCount, htmlContent.slice(position)].join('');
            loadDocument();
        },
        error: function(error){
            $("#divIAmFollowing").append('Query failed. Error:' + error.get_message());
        }
    });

}

function loadDocument()
{
    searchQuery = _spPageContextInfo.webAbsoluteUrl + "/_api/search/query?Querytext='*'&Properties='GraphQuery:" + actorDocumentGQL + 
        "'&RowLimit=1000&SelectProperties='Path,Title,Rank,ViewsLifeTime,FileType,LastModifiedTime'"

    $.ajax({
        url: searchQuery,
        method: "GET",
        headers: {"Accept": "application/json; odata=verbose"},
        success: function(data){
            if(data.d.query.PrimaryQueryResult != null)
            {
                documentCount = data.d.query.PrimaryQueryResult.RelevantResults.Table.Rows.results.length;
            }
            var toBeReplaced = "{Document}";
            var position = htmlContent.indexOf(toBeReplaced);
            htmlContent = [htmlContent.slice(0, position), documentCount, htmlContent.slice(position)].join('');
            loadSites();
        },
        error: function(error){
            $("#divIAmFollowing").append('Query failed. Error:' + error.get_message());
        }
    });
}

function loadSites()
{
    searchQuery = _spPageContextInfo.webAbsoluteUrl + "/_api/search/query?Querytext='*'&Properties='GraphQuery:" + actorSiteGQL + 
    "'&RowLimit=1000&SelectProperties='Path,Title,Rank,ViewsLifeTime,FileType,LastModifiedTime'"

    $.ajax({
        url: searchQuery,
        method: "GET",
        headers: {"Accept": "application/json; odata=verbose"},
        success: function(data){
            if(data.d.query.PrimaryQueryResult != null)
            {
                siteCount = data.d.query.PrimaryQueryResult.RelevantResults.Table.Rows.results.length;
                $(data.d.query.PrimaryQueryResult.RelevantResults.Table.Rows.results).each(function(){
                    var path = keyValue(this, 'Path');
                    var title = keyValue(this, 'Title');
                    //alert(path);
                });
            }
            var toBeReplaced = "{Sites}";
            var position = htmlContent.indexOf(toBeReplaced);
            htmlContent = [htmlContent.slice(0, position), siteCount, htmlContent.slice(position)].join('');

            htmlContent = htmlContent.replace(/\{.*?\}\s?/g, '&nbsp;');
            $('#divIAmFollowing').html(htmlContent);
            //alert(_spPageContextInfo.siteAbsoluteUrl);
                
            var rootLink = _spPageContextInfo.siteAbsoluteUrl.substring(0, _spPageContextInfo.siteAbsoluteUrl.indexOf('.'));
            var mySiteHostUrl = rootLink + "-my.sharepoint.com";
            var delvePeopleUrl = mySiteHostUrl + "/_layouts/15/me.aspx" + "?v=liveprofileworkingwith&p=" + _spPageContextInfo.userLoginName;
            //var delveDocumentUrl = mySiteHostUrl + "/_layouts/15/me.aspx" + "?v=liveprofiletrending&p=" + _spPageContextInfo.userLoginName;
            var delveDocumentUrl = mySiteHostUrl + "/_layouts/15/me.aspx" + "?u=" + msOnlineObjectId + "&v=liveprofiletrending";
            var delveSiteUrl = mySiteHostUrl + "/_layouts/15/me.aspx" + "?v=work&p=" + _spPageContextInfo.userLoginName;
            document.getElementById('FollowedCounts_People_Link').href = delvePeopleUrl;
            document.getElementById('FollowedCounts_Documents_Link').href = delveDocumentUrl;
            document.getElementById('FollowedCounts_Sites_Link').href = delveSiteUrl;
                
        },
        error: function(error){
            $("#divIAmFollowing").append('Query failed. Error:' + error.get_message());
        }
    });
}
    
function keyValue(row, fldName) {
    var ret = null;
    $.each(row.Cells.results, function () {
        if (this.Key == fldName) {
            ret = this.Value;
        }
    });
    return ret;
} 

$(document).ready(function () {
    loadPeople();
});

</script>
<div id="divIAmFollowing"></div>