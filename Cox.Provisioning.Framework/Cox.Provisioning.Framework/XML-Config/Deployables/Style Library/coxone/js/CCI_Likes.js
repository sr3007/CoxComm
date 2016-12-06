var listGuid;
var listItemId;
var itemKey;
var context;

//Method to get likes of list id and item id passed.
function getLikes(listId, itemId, key) {
    listGuid = listId;
    listItemId = itemId;
    itemKey = key;

    //copy value to global variables.
    listGuid = listId;
    listItemId = itemId;
    context = new SP.ClientContext(_spPageContextInfo.siteAbsoluteUrl + "/" + CCI_Common.GetConfig('NewsPageLibrarySourceSite'));
    var list = context.get_web().get_lists().getById(listId);
    var item = list.getItemById(itemId);
    /*
            var camlQuery = new SP.CamlQuery();
            camlQuery.set_viewXml('<View><Query><Where><Eq><FieldRef Name=\'ID\'/>' +
                '<Value Type=\'Counter\'>' + itemId + '</Value></Eq></Where></Query><RowLimit>1</RowLimit></View>');
            this.collListItem = list.getItems(camlQuery);
    */
    context.load(item, "LikedBy", "ID", "LikesCount");
    //context.load(collListItem);
    context.executeQueryAsync(
        function () {
            var likeDisplay = true;
            var $v_0 = item.get_item('LikedBy');
            var likesCountInfo = item.get_item('LikesCount');
            if (!SP.ScriptHelpers.isNullOrUndefined($v_0)) {
                for (var $v_1 = 0, $v_2 = $v_0.length; $v_1 < $v_2; $v_1++) {
                    var $v_3 = $v_0[$v_1];
                    if ($v_3.get_lookupId() === _spPageContextInfo.userId) {
                        likeDisplay = false;
                    }
                }
            }
            else
                likesCountInfo = 0;

            //Change for keys.
            ChangeLikeText(likeDisplay, likesCountInfo, "NewsGrid");
            ChangeLikeText(likeDisplay, likesCountInfo, "newsarticle");
            ChangeLikeText(likeDisplay, likesCountInfo, "TrendingNews");
            ChangeLikeText(likeDisplay, likesCountInfo, "RecommendedNews");
            ChangeLikeText(likeDisplay, likesCountInfo, "newsrollup");
            ChangeLikeText(likeDisplay, likesCountInfo, "CarouselNews");
        },
        Function.createDelegate(this, this.onQueryFailed));
}

//On successfully retrieving likes.
function onQuerySucceeded(sender, args) {
    var likeDisplay = true;
    var result = '';
    var listItemEnumerator = collListItem.getEnumerator();
    while (listItemEnumerator.moveNext()) {
        var oListItem = listItemEnumerator.get_current();
        var likesCountInfo = oListItem.get_item('LikesCount');
        var members = oListItem.get_item('LikedBy');

        if (members != null) {
            for (i = 0; i < members.length; i++) {
                var member = members[i];
                if (member.get_email().trim().toLowerCase() === _spPageContextInfo.userLoginName) {
                    //display unlike  
                    likeDisplay = false;
                }
                result += member.get_lookupValue() + '\n';
            }
        }
    }
    ChangeLikeText(likeDisplay, likesCountInfo);
}

//On Failure
function onQueryFailed(sender, args) {
    alert('Failed to get likes. Error:' + args.get_message());
    CCI_Common.LogException(_spPageContextInfo.userId, 'Likes App', _spPageContextInfo.siteAbsoluteUrl, args.get_message());
}

//Change the likes based on like/unlike status.
function ChangeLikeText(like, count, key) {
    var likebuttonid = key + "likebutton" + listItemId;
    var likecountid = key + "likecount" + listItemId;

    if (like) {
        //$("a.LikeButton").text('Like');
        $("#" + likebuttonid).text('Like');
    }
    else {
        $("#" + likebuttonid).text('Unlike');
    }
    //var htmlstring = "(" + String(count) + ") " + "<img alt=\"\" src=\"/_layouts/15/images/LikeFull.11x11x32.png\" />";
    //var htmlstring1 = "(" + String(count) + ") " + "<img alt=\"\" src=\"/_layouts/15/images/formatmap16x16.png\" />";
    var htmlstring = String(count);
    var htmlstring1 = String(count);
    if (count > 0) {
        //$(".likecount").html(htmlstring)
        $("#" + likecountid).html(htmlstring)
    }
    else {
        $("#" + likecountid).html(htmlstring1);
    }
}

//Set the item id as liked/unliked.
function LikePage(listId, itemId, key) {
    listGuid = listId;
    listItemId = itemId;
    itemKey = key;
    var like = false;
    var likeButtonText = $("#" + itemKey + "likebutton" + itemId).text();
    if (listGuid.indexOf("{") > -1)
        listGuid = listGuid.substring(1, listGuid.length - 1);

    context = new SP.ClientContext(_spPageContextInfo.siteAbsoluteUrl + "/" + CCI_Common.GetConfig('NewsPageLibrarySourceSite'));

    if (likeButtonText != "") {
        if (likeButtonText == "Like")
            like = true;

        EnsureScriptFunc('reputation.js', 'Microsoft.Office.Server.ReputationModel.Reputation', function () {
            Microsoft.Office.Server.ReputationModel.Reputation.setLike(context, listGuid, listItemId, like);
            context.executeQueryAsync(
                function () {
                    ExecuteOrDelayUntilScriptLoaded(function () { getLikes(listGuid, listItemId, itemKey) }, "sp.js");
                }, function (sender, args) {
                    // Do something if error
                    CCI_Common.LogException(_spPageContextInfo.userId, 'Likes App', _spPageContextInfo.siteAbsoluteUrl, args.get_message());
                });
        });
    }
}