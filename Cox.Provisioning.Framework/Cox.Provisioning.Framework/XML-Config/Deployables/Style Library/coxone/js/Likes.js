var listGuid;
var listItemId;
var itemKey;
var context = SP.ClientContext.get_current();

function getLikes(listId, itemId, key) {
    listGuid = listId;
    listItemId = itemId;
    itemKey = key;
    
        //copy value to global variables.
        listGuid = listId;
        listItemId = itemId;
        context = SP.ClientContext.get_current();
        var list = context.get_web().get_lists().getById(listId);
        var item = list.getItemById(itemId);

        var camlQuery = new SP.CamlQuery();
        camlQuery.set_viewXml('<View><Query><Where><Eq><FieldRef Name=\'ID\'/>' +
            '<Value Type=\'Counter\'>' + itemId + '</Value></Eq></Where></Query><RowLimit>1</RowLimit></View>');
        this.collListItem = list.getItems(camlQuery);
        context.load(collListItem);
        context.executeQueryAsync(
            function(){
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
                            //  alert(result);
                        }
                    }
                }
                //Change for keys.
                ChangeLikeText(likeDisplay, likesCountInfo, "newsarticle");
                ChangeLikeText(likeDisplay, likesCountInfo, "TrendingNews");
                ChangeLikeText(likeDisplay, likesCountInfo, "RecommendedNews");
                ChangeLikeText(likeDisplay, likesCountInfo, "NewsGrid");
                ChangeLikeText(likeDisplay, likesCountInfo, "CarouselNews");
            },
            Function.createDelegate(this, this.onQueryFailed));
    }

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

    function onQueryFailed(sender, args) {
        alert('Failed to get likes. Error:' + args.get_message());
    }

    

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
        var htmlstring = "(" + String(count) + ") " + "<i class='fa fa-thumbs-up'></i>";
        var htmlstring1 = "(" + String(count) + ") " + "<i class='fa fa-thumbs-up'></i>";
        if (count > 0)
        {
            //$(".likecount").html(htmlstring)
            $("#" + likecountid).html(htmlstring)
        }
        else
        {
                //$(".likecount").html(htmlstring1);
                $("#" + likecountid).html(htmlstring1);
        }
    }

    function LikePage(listId, itemId, key)
    {
        listGuid = listId;
        listItemId = itemId;
        itemKey = key;
        var like = false;
        var likeButtonText = $("#" + itemKey + "likebutton" + itemId).text();
        if(listGuid.indexOf("{") > -1)
            listGuid = listGuid.substring(1,listGuid.length-1);
        //alert(listGuid);
        //alert(listItemId);

        if (likeButtonText != "")
        {
            if (likeButtonText == "Like")
                like = true;
            //alert(like);
            EnsureScriptFunc('reputation.js', 'Microsoft.Office.Server.ReputationModel.Reputation', function () {
                Microsoft.Office.Server.ReputationModel.Reputation.setLike(context, listGuid, listItemId, like);
                context.executeQueryAsync(
                    function () {
                        //getLikes(listGuid, listItemId);
                        ExecuteOrDelayUntilScriptLoaded(function () { getLikes(listGuid, listItemId, itemKey) }, "sp.js");
                    }, function (sender, args) {
                        // Do something if error
                    });
            });
        }
    }