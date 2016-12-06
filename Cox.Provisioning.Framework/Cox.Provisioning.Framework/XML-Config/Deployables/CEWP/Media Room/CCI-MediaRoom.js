
'use strict';

var DivData = "";
var videosCounter = 0;
var videoFiles = [];
var videoNumber = 0;
var TotalItemsToDisplay = 0;
var loadMoreCliked = false;
var filterDataFlag = false;

/*---------------- Document ready method-----------------*/
$(document).ready(function () {
    //document.write("<script type='text/javascript' src='/sites/CoxOne/SiteAssets/CoxOne/js/underscore.js'><" + "/script>");
    TotalItemsToDisplay = Number(CCI_Common.GetConfig("MediaRoomInitialItemsToDisplay"));//10;	
    $("#mediaRoomCointainerData").empty();
    GetVimeoVideos();



});
/*--------------End of Document ready method--------------*/

function loadCoxMediaRoom() {
    filterDataFlag = true;
    GetVimeoVideos();


}
function to_date(o) {
    var parts = o.uploadDate.split('-');
    o.startDate = new Date(parts[0], parts[1] - 1, parts[2]);
    return o;
}
function desc_start_time(o) {
    return -o.uploadDate;
}
// This function will return the Sorted data according to user preference

function filterVideosData(videos, property, order) {
    var filteredVideos = [];


    if (property == "date") {
        //by default dates will come in  Desscending Order

        var filteredVideos = _.sortBy(videos, function (o) { return o.timeStamp; });

        if (order == 'Desc') {
            filteredVideos.reverse();
        }
        return filteredVideos;
    }
    else if (property == "views") {
        var filteredVideos = _.sortBy(videos, function (o) { return o.videoPlayCount; });

        if (order == 'Desc') {
            filteredVideos.reverse();
        }
        return filteredVideos;

    }
    else if (property == "comments") {
        var filteredVideos = _.sortBy(videos, function (o) { return o.commentsCount; });

        if (order == 'Desc') {
            filteredVideos.reverse();
        }
        return filteredVideos;
    }
    else if (property == "likes") {
        var filteredVideos = _.sortBy(videos, function (o) { return o.likesCount; });

        if (order == 'Desc') {
            filteredVideos.reverse();
        }
        return filteredVideos;
    }
}
function showThumbs(videos) {

    var videos = _.sortBy(videos, function (o) { return o.timeStamp; });
    if (filterDataFlag == true) {
        $("#mediaRoomCointainerData").empty();
        videoNumber = 0;
        var property = document.getElementById("SortProperties").value;
        var order = document.getElementById("SortOrder").value;
        videos = filterVideosData(videos, property, order);
    }

    $("#loadMoreMediaRoom").hide();
    if (videos.length < TotalItemsToDisplay) {
        TotalItemsToDisplay = videos.length;
    }

    DivData = "";
    for (var i = 0; i < TotalItemsToDisplay ; i++) {
        videosCounter = i;
        ArrangeGridTiles(videos);
    }

    videoFiles = videos;

    $("#mediaRoomCointainerData").append(DivData);
    $("#loadMoreMediaRoom").show();

}


function ArrangeGridTiles(videos) {

    videoNumber++;

    if (videoNumber == 1) {
        DivData += "<div class=\"mediaRoom mediaRoommainHeading\">" + //need to close extra div
                      "<h2 class=\"panel-title mob_accordian\">";
    }
    else {
        if (videoNumber == 2) {
            DivData += "<div class=\"panel panel-default\">" +
                           "<div class=\"product_box clearfix\">" +
                               "<div id=\"videoItems\" class=\"row\">";
        }

        DivData += "<div class=\"col-sm-4 pro_item comon-space \">" +
                         "<div class=\"item_box\">" +
                             "<h3 class=\"mob_accordian\">";



    }


    var trimchar = videos[0].videoUrl;
    var dots = "...";
    var limitTitle = '20'; //Title Charecter length
    var limitDesc = '60'; //Title Charecter length
    var videoTitle = videos[0].videoTitle;
    var videoDescription = videos[0].videoDescription == null ? "" : videos[0].videoDescription;
    var page = trimchar.substring(trimchar.lastIndexOf('/') + 1);
    var page2 = 'https://player.vimeo.com/video/' + page

    var div = document.createElement('div');
    //Checking length of the title//
    /*  if (videoTitle.length > limitTitle) {
          // you can also use substr instead of substring
          videoTitle = videoTitle.substring(0, limitTitle) + dots;
      }*/

    var newContent = document.createTextNode(videoTitle);

    div.setAttribute('class', 'videoHead');
    div.appendChild(newContent);

    DivData += videoTitle;

    if (videoNumber == 1) {

        DivData += "</h2>" +
                   "<div class=\"row panel panel-default\">" +
                       "<div class=\"col-sm-12\">" +
                           "<div class=\"row\">" +
                               "<div class=\"col-md-7 col-sm-7 col-xs-12\">" +
                                   "<div class=\"mediaRoomItemsvideo Videoslider\">" +
                                      "<iframe src='" + page2 + "' frameborder=\"0\" allowfullscreen=\"true\" webkitallowfullscreen=\"true\"/>" +
                                   "</div>" +
                               "</div>" +
                               "<div class=\"col-md-5 col-sm-5 col-xs-12\">" +
                                       "<div class=\"slidecontent\">" +
                                          "<div class=\"caption_dis\">" +
                                                "<p style=\"font-size: 20px;color: #2757A7;font-weight: bold;margin: 0 0 10px\">" + videoTitle + "</p>" +
                                           "</div>" +
                                           "<div class=\"caption_dis\">" +
                                               "<p>" + videoDescription + "</p>" +
                                           "</div>" +
                                       "</div>" +
                                   "</div>" +
                               "</div>" +
                           "</div>" +
                       "</div>";
    }
    else {
        DivData += "</h3><div class=\"mediaRoomItemsvideo\">";
        DivData += "<iframe src='" + page2 + "' frameborder=\"0\" allowfullscreen=\"true\" webkitallowfullscreen=\"true\" />";
        DivData += "</div></div></div>"; // repeating row divs closing 
        if (loadMoreCliked == true && videoNumber == TotalItemsToDisplay) {

            $('#videoItems').append(DivData);

        }
        if (videoNumber == TotalItemsToDisplay) {
            DivData += "</div></div></div>";
        }
    }
    if (videoNumber == TotalItemsToDisplay) {
        DivData += "</div>"; // closing Div for mediaRoom mediaRoommainHeading
    }
    if (videos.length > 0) {
        videos.splice($.inArray(videos[0], videos), 1);
        videoFiles = videos;
    }
    else {

    }

}

function ShowMoreMedia() {
    loadMoreCliked = true;
    DivData = "";

    var ItemsToDisplay = Number(CCI_Common.GetConfig("MediaRoomLoadItemsToDisplay"));
    if (ItemsToDisplay >= videoFiles.length) {
        ItemsToDisplay = videoFiles.length;// ItemsToDisplay = Number(CCI_Common.GetConfig("MediaRoomLoadItemsToDisplay"));
    }

    TotalItemsToDisplay = ItemsToDisplay + videoNumber; // This will be used for clicking load more videos 
    for (var i = 0; i < ItemsToDisplay ; i++) {

        ArrangeGridTiles(videoFiles);
    }

    // $("#mediaRoomCointainerData").append(DivData);
    if (videoFiles.length == 0) {
        $("#loadMoreMediaRoom").hide(); // hiding if there are no items to load
    } else {
        $("#loadMoreMediaRoom").show();
    }
}


function GetVimeoVideos() {
    var videos = [];
    var videoTitle;
    var videoUrl;
    var videoPlayCount;
    var uploadDate;
    var videoDescription;
    var commentsCount;
    var likesCount;
    var url = CCI_Common.GetConfig("MediaRoomWebserviceUri");//"https://catl0dv255.corp.cox.com/cci_RestProxy/Api/Vimeo/GetData?uri=https://api.vimeo.com/me/videos?fields=uri,name,stats";				


    jQuery.ajax({
        url: url,
        type: "GET",
        headers: {
            "accept": "application/json;odata=verbose",
        },
        success: function (VideosWithMD) {


        },
        error: function (jqXhr, textStatus, errorThrown) {

            var VideosWithMD = "{\"Value\":[{\"total\":610,\"page\":1,\"per_page\":25,\"paging\":{\"next\":\"/me/videos?fields=uri%2Cname%2Cstats&page=2\",\"previous\":null,\"first\":\"/me/videos?fields=uri%2Cname%2Cstats&page=1\",\"last\":\"/me/videos?fields=uri%2Cname%2Cstats&page=25\"},\"data\":[{\"uri\":\"/videos/191994362\",\"name\":\"Real Talk with Steve Necessary\",\"stats\":{\"plays\":9}},{\"uri\":\"/videos/191969538\",\"name\":\"Congratulations on 500k Contour Customers Feat./ Steve Necessary\",\"stats\":{\"plays\":21}},{\"uri\":\"/videos/191804659\",\"name\":\"Officer Compliance w/ Jenn Hightower\",\"stats\":{\"plays\":2}},{\"uri\":\"/videos/189622928\",\"name\":\"IMG_2436\",\"stats\":{\"plays\":7}},{\"uri\":\"/videos/188171976\",\"name\":\"2016 Exec Forum Opening Video\",\"stats\":{\"plays\":9}},{\"uri\":\"/videos/188171917\",\"name\":\"Jason Dorsey Generational Differences\",\"stats\":{\"plays\":15}},{\"uri\":\"/videos/188160065\",\"name\":\"Jennifer Aaker- Power of Empathy\",\"stats\":{\"plays\":1}},{\"uri\":\"/videos/188160052\",\"name\":\"Jennifer Aaker- Power of Humor\",\"stats\":{\"plays\":5}},{\"uri\":\"/videos/188160039\",\"name\":\"Jennifer Aaker- Power of Purpose\",\"stats\":{\"plays\":4}},{\"uri\":\"/videos/188159997\",\"name\":\"Persuasion and the Power of Story- Jennifer Aaker (Future of StoryTelling 2013)\",\"stats\":{\"plays\":7}},{\"uri\":\"/videos/187989087\",\"name\":\"Day in the Life - Neolonie Edwards\",\"stats\":{\"plays\":1102}},{\"uri\":\"/videos/187839081\",\"name\":\"Elevator+Maestro's\",\"stats\":{\"plays\":19}},{\"uri\":\"/videos/187713480\",\"name\":\"Executive Forum Streaming Meeting - Oct 17, 2016\",\"stats\":{\"plays\":44}},{\"uri\":\"/videos/187338492\",\"name\":\"Operating Principles Intro\",\"stats\":{\"plays\":0}},{\"uri\":\"/videos/186297092\",\"name\":\"Cox Homelife Vignette V3\",\"stats\":{\"plays\":66}},{\"uri\":\"/videos/185983260\",\"name\":\"CB Welcome to iCare\",\"stats\":{\"plays\":7}},{\"uri\":\"/videos/185983238\",\"name\":\"Residential Welcome to iCareâ€™\",\"stats\":{\"plays\":25}},{\"uri\":\"/videos/185943956\",\"name\":\"FSA Day In The Life\",\"stats\":{\"plays\":31}},{\"uri\":\"/videos/185706067\",\"name\":\"Cox One Teaser Video\",\"stats\":{\"plays\":22}},{\"uri\":\"/videos/185373195\",\"name\":\"Cox Values - 2016\",\"stats\":{\"plays\":0}},{\"uri\":\"/videos/184735063\",\"name\":\"Hi5 Video â€“ Brandi Salazar-Fox\",\"stats\":{\"plays\":24}},{\"uri\":\"/videos/184520601\",\"name\":\"Hi5 Video - Stephanie Longo 3\",\"stats\":{\"plays\":27}},{\"uri\":\"/videos/184513932\",\"name\":\"Hi5 Video - Jama Berryhill\",\"stats\":{\"plays\":62}},{\"uri\":\"/videos/184392998\",\"name\":\"Hi5 Video - Kimberly Brown\",\"stats\":{\"plays\":14}},{\"uri\":\"/videos/184392729\",\"name\":\"Hi5 Video - Rob Brown\",\"stats\":{\"plays\":0}}]}]}";
            var updatedVideos = "{\"Value\":[{\"total\":615,\"page\":1,\"per_page\":25,\"paging\":{\"next\":\"/me/videos?fields=uri%2Cname%2Cstats%2Ccreated_time%2Cmetadata&page=2\",\"previous\":null,\"first\":\"/me/videos?fields=uri%2Cname%2Cstats%2Ccreated_time%2Cmetadata&page=1\",\"last\":\"/me/videos?fields=uri%2Cname%2Cstats%2Ccreated_time%2Cmetadata&page=25\"},\"data\":[{\"uri\":\"/videos/193549308\",\"name\":\"Human Resources - End of Year Message from Len Barlik\",\"created_time\":\"2016-11-29T15:13:53+00:00\",\"stats\":{\"plays\":0},\"metadata\":{\"connections\":{\"comments\":{\"uri\":\"/videos/193549308/comments\",\"options\":[\"GET\",\"POST\"],\"total\":0},\"credits\":{\"uri\":\"/videos/193549308/credits\",\"options\":[\"GET\",\"POST\"],\"total\":1},\"likes\":{\"uri\":\"/videos/193549308/likes\",\"options\":[\"GET\"],\"total\":0},\"pictures\":{\"uri\":\"/videos/193549308/pictures\",\"options\":[\"GET\",\"POST\"],\"total\":1},\"texttracks\":{\"uri\":\"/videos/193549308/texttracks\",\"options\":[\"GET\",\"POST\"],\"total\":0},\"related\":{\"uri\":\"/me/videos?fields=uri,name,stats,created_time,metadata&offset=1\",\"options\":[\"GET\"]}},\"interactions\":{\"watchlater\":{\"added\":false,\"added_time\":null,\"uri\":\"/users/12226765/watchlater/193549308\"}}}},{\"uri\":\"/videos/193393198\",\"name\":\"Officer Compliance - w/ Jenn Hightower\",\"created_time\":\"2016-11-28T16:43:06+00:00\",\"stats\":{\"plays\":0},\"metadata\":{\"connections\":{\"comments\":{\"uri\":\"/videos/193393198/comments\",\"options\":[\"GET\",\"POST\"],\"total\":0},\"credits\":{\"uri\":\"/videos/193393198/credits\",\"options\":[\"GET\",\"POST\"],\"total\":1},\"likes\":{\"uri\":\"/videos/193393198/likes\",\"options\":[\"GET\"],\"total\":0},\"pictures\":{\"uri\":\"/videos/193393198/pictures\",\"options\":[\"GET\",\"POST\"],\"total\":3},\"texttracks\":{\"uri\":\"/videos/193393198/texttracks\",\"options\":[\"GET\",\"POST\"],\"total\":0},\"related\":{\"uri\":\"/me/videos?fields=uri,name,stats,created_time,metadata&offset=2\",\"options\":[\"GET\"]}},\"interactions\":{\"watchlater\":{\"added\":false,\"added_time\":null,\"uri\":\"/users/12226765/watchlater/193393198\"}}}},{\"uri\":\"/videos/193388067\",\"name\":\"Near Future\",\"created_time\":\"2016-11-28T16:12:00+00:00\",\"stats\":{\"plays\":1},\"metadata\":{\"connections\":{\"comments\":{\"uri\":\"/videos/193388067/comments\",\"options\":[\"GET\",\"POST\"],\"total\":0},\"credits\":{\"uri\":\"/videos/193388067/credits\",\"options\":[\"GET\",\"POST\"],\"total\":1},\"likes\":{\"uri\":\"/videos/193388067/likes\",\"options\":[\"GET\"],\"total\":0},\"pictures\":{\"uri\":\"/videos/193388067/pictures\",\"options\":[\"GET\",\"POST\"],\"total\":2},\"texttracks\":{\"uri\":\"/videos/193388067/texttracks\",\"options\":[\"GET\",\"POST\"],\"total\":0},\"related\":{\"uri\":\"/me/videos?fields=uri,name,stats,created_time,metadata&offset=3\",\"options\":[\"GET\"]}},\"interactions\":{\"watchlater\":{\"added\":false,\"added_time\":null,\"uri\":\"/users/12226765/watchlater/193388067\"}}}},{\"uri\":\"/videos/193387057\",\"name\":\"NearFuture COX logo&slogan\",\"created_time\":\"2016-11-28T16:06:25+00:00\",\"stats\":{\"plays\":0},\"metadata\":{\"connections\":{\"comments\":{\"uri\":\"/videos/193387057/comments\",\"options\":[\"GET\",\"POST\"],\"total\":0},\"credits\":{\"uri\":\"/videos/193387057/credits\",\"options\":[\"GET\",\"POST\"],\"total\":1},\"likes\":{\"uri\":\"/videos/193387057/likes\",\"options\":[\"GET\"],\"total\":0},\"pictures\":{\"uri\":\"/videos/193387057/pictures\",\"options\":[\"GET\",\"POST\"],\"total\":1},\"texttracks\":{\"uri\":\"/videos/193387057/texttracks\",\"options\":[\"GET\",\"POST\"],\"total\":0},\"related\":{\"uri\":\"/me/videos?fields=uri,name,stats,created_time,metadata&offset=4\",\"options\":[\"GET\"]}},\"interactions\":{\"watchlater\":{\"added\":false,\"added_time\":null,\"uri\":\"/users/12226765/watchlater/193387057\"}}}},{\"uri\":\"/videos/193386934\",\"name\":\"NearFuture COX logo&slogan\",\"created_time\":\"2016-11-28T16:05:45+00:00\",\"stats\":{\"plays\":0},\"metadata\":{\"connections\":{\"comments\":{\"uri\":\"/videos/193386934/comments\",\"options\":[\"GET\",\"POST\"],\"total\":0},\"credits\":{\"uri\":\"/videos/193386934/credits\",\"options\":[\"GET\",\"POST\"],\"total\":1},\"likes\":{\"uri\":\"/videos/193386934/likes\",\"options\":[\"GET\"],\"total\":0},\"pictures\":{\"uri\":\"/videos/193386934/pictures\",\"options\":[\"GET\",\"POST\"],\"total\":1},\"texttracks\":{\"uri\":\"/videos/193386934/texttracks\",\"options\":[\"GET\",\"POST\"],\"total\":0},\"related\":{\"uri\":\"/me/videos?fields=uri,name,stats,created_time,metadata&offset=5\",\"options\":[\"GET\"]}},\"interactions\":{\"watchlater\":{\"added\":false,\"added_time\":null,\"uri\":\"/users/12226765/watchlater/193386934\"}}}},{\"uri\":\"/videos/191994362\",\"name\":\"Real Talk with Steve Necessary\",\"created_time\":\"2016-11-17T16:56:39+00:00\",\"stats\":{\"plays\":11},\"metadata\":{\"connections\":{\"comments\":{\"uri\":\"/videos/191994362/comments\",\"options\":[\"GET\",\"POST\"],\"total\":0},\"credits\":{\"uri\":\"/videos/191994362/credits\",\"options\":[\"GET\",\"POST\"],\"total\":1},\"likes\":{\"uri\":\"/videos/191994362/likes\",\"options\":[\"GET\"],\"total\":0},\"pictures\":{\"uri\":\"/videos/191994362/pictures\",\"options\":[\"GET\",\"POST\"],\"total\":2},\"texttracks\":{\"uri\":\"/videos/191994362/texttracks\",\"options\":[\"GET\",\"POST\"],\"total\":0},\"related\":{\"uri\":\"/me/videos?fields=uri,name,stats,created_time,metadata&offset=6\",\"options\":[\"GET\"]}},\"interactions\":{\"watchlater\":{\"added\":false,\"added_time\":null,\"uri\":\"/users/12226765/watchlater/191994362\"}}}},{\"uri\":\"/videos/191969538\",\"name\":\"Congratulations on 500k Contour Customers Feat./ Steve Necessary\",\"created_time\":\"2016-11-17T14:25:08+00:00\",\"stats\":{\"plays\":27},\"metadata\":{\"connections\":{\"comments\":{\"uri\":\"/videos/191969538/comments\",\"options\":[\"GET\",\"POST\"],\"total\":0},\"credits\":{\"uri\":\"/videos/191969538/credits\",\"options\":[\"GET\",\"POST\"],\"total\":1},\"likes\":{\"uri\":\"/videos/191969538/likes\",\"options\":[\"GET\"],\"total\":0},\"pictures\":{\"uri\":\"/videos/191969538/pictures\",\"options\":[\"GET\",\"POST\"],\"total\":1},\"texttracks\":{\"uri\":\"/videos/191969538/texttracks\",\"options\":[\"GET\",\"POST\"],\"total\":0},\"related\":{\"uri\":\"/me/videos?fields=uri,name,stats,created_time,metadata&offset=7\",\"options\":[\"GET\"]}},\"interactions\":{\"watchlater\":{\"added\":false,\"added_time\":null,\"uri\":\"/users/12226765/watchlater/191969538\"}}}},{\"uri\":\"/videos/191804659\",\"name\":\"Officer Compliance w/ Jenn Hightower\",\"created_time\":\"2016-11-16T14:39:47+00:00\",\"stats\":{\"plays\":3},\"metadata\":{\"connections\":{\"comments\":{\"uri\":\"/videos/191804659/comments\",\"options\":[\"GET\",\"POST\"],\"total\":0},\"credits\":{\"uri\":\"/videos/191804659/credits\",\"options\":[\"GET\",\"POST\"],\"total\":1},\"likes\":{\"uri\":\"/videos/191804659/likes\",\"options\":[\"GET\"],\"total\":0},\"pictures\":{\"uri\":\"/videos/191804659/pictures\",\"options\":[\"GET\",\"POST\"],\"total\":1},\"texttracks\":{\"uri\":\"/videos/191804659/texttracks\",\"options\":[\"GET\",\"POST\"],\"total\":0},\"related\":{\"uri\":\"/me/videos?fields=uri,name,stats,created_time,metadata&offset=8\",\"options\":[\"GET\"]}},\"interactions\":{\"watchlater\":{\"added\":false,\"added_time\":null,\"uri\":\"/users/12226765/watchlater/191804659\"}}}},{\"uri\":\"/videos/189622928\",\"name\":\"IMG_2436\",\"created_time\":\"2016-10-31T12:50:51+00:00\",\"stats\":{\"plays\":7},\"metadata\":{\"connections\":{\"comments\":{\"uri\":\"/videos/189622928/comments\",\"options\":[\"GET\",\"POST\"],\"total\":0},\"credits\":{\"uri\":\"/videos/189622928/credits\",\"options\":[\"GET\",\"POST\"],\"total\":1},\"likes\":{\"uri\":\"/videos/189622928/likes\",\"options\":[\"GET\"],\"total\":0},\"pictures\":{\"uri\":\"/videos/189622928/pictures\",\"options\":[\"GET\",\"POST\"],\"total\":1},\"texttracks\":{\"uri\":\"/videos/189622928/texttracks\",\"options\":[\"GET\",\"POST\"],\"total\":0},\"related\":{\"uri\":\"/me/videos?fields=uri,name,stats,created_time,metadata&offset=9\",\"options\":[\"GET\"]}},\"interactions\":{\"watchlater\":{\"added\":false,\"added_time\":null,\"uri\":\"/users/12226765/watchlater/189622928\"}}}},{\"uri\":\"/videos/188171976\",\"name\":\"2016 Exec Forum Opening Video\",\"created_time\":\"2016-10-20T16:43:35+00:00\",\"stats\":{\"plays\":10},\"metadata\":{\"connections\":{\"comments\":{\"uri\":\"/videos/188171976/comments\",\"options\":[\"GET\",\"POST\"],\"total\":0},\"credits\":{\"uri\":\"/videos/188171976/credits\",\"options\":[\"GET\",\"POST\"],\"total\":1},\"likes\":{\"uri\":\"/videos/188171976/likes\",\"options\":[\"GET\"],\"total\":0},\"pictures\":{\"uri\":\"/videos/188171976/pictures\",\"options\":[\"GET\",\"POST\"],\"total\":1},\"texttracks\":{\"uri\":\"/videos/188171976/texttracks\",\"options\":[\"GET\",\"POST\"],\"total\":0},\"related\":{\"uri\":\"/me/videos?fields=uri,name,stats,created_time,metadata&offset=10\",\"options\":[\"GET\"]}},\"interactions\":{\"watchlater\":{\"added\":false,\"added_time\":null,\"uri\":\"/users/12226765/watchlater/188171976\"}}}},{\"uri\":\"/videos/188171917\",\"name\":\"Jason Dorsey Generational Differences\",\"created_time\":\"2016-10-20T16:43:10+00:00\",\"stats\":{\"plays\":15},\"metadata\":{\"connections\":{\"comments\":{\"uri\":\"/videos/188171917/comments\",\"options\":[\"GET\",\"POST\"],\"total\":0},\"credits\":{\"uri\":\"/videos/188171917/credits\",\"options\":[\"GET\",\"POST\"],\"total\":1},\"likes\":{\"uri\":\"/videos/188171917/likes\",\"options\":[\"GET\"],\"total\":0},\"pictures\":{\"uri\":\"/videos/188171917/pictures\",\"options\":[\"GET\",\"POST\"],\"total\":1},\"texttracks\":{\"uri\":\"/videos/188171917/texttracks\",\"options\":[\"GET\",\"POST\"],\"total\":0},\"related\":{\"uri\":\"/me/videos?fields=uri,name,stats,created_time,metadata&offset=11\",\"options\":[\"GET\"]}},\"interactions\":{\"watchlater\":{\"added\":false,\"added_time\":null,\"uri\":\"/users/12226765/watchlater/188171917\"}}}},{\"uri\":\"/videos/188160065\",\"name\":\"Jennifer Aaker- Power of Empathy\",\"created_time\":\"2016-10-20T15:28:56+00:00\",\"stats\":{\"plays\":2},\"metadata\":{\"connections\":{\"comments\":{\"uri\":\"/videos/188160065/comments\",\"options\":[\"GET\",\"POST\"],\"total\":0},\"credits\":{\"uri\":\"/videos/188160065/credits\",\"options\":[\"GET\",\"POST\"],\"total\":1},\"likes\":{\"uri\":\"/videos/188160065/likes\",\"options\":[\"GET\"],\"total\":0},\"pictures\":{\"uri\":\"/videos/188160065/pictures\",\"options\":[\"GET\",\"POST\"],\"total\":1},\"texttracks\":{\"uri\":\"/videos/188160065/texttracks\",\"options\":[\"GET\",\"POST\"],\"total\":0},\"related\":{\"uri\":\"/me/videos?fields=uri,name,stats,created_time,metadata&offset=12\",\"options\":[\"GET\"]}},\"interactions\":{\"watchlater\":{\"added\":false,\"added_time\":null,\"uri\":\"/users/12226765/watchlater/188160065\"}}}},{\"uri\":\"/videos/188160052\",\"name\":\"Jennifer Aaker- Power of Humor\",\"created_time\":\"2016-10-20T15:28:53+00:00\",\"stats\":{\"plays\":6},\"metadata\":{\"connections\":{\"comments\":{\"uri\":\"/videos/188160052/comments\",\"options\":[\"GET\",\"POST\"],\"total\":0},\"credits\":{\"uri\":\"/videos/188160052/credits\",\"options\":[\"GET\",\"POST\"],\"total\":1},\"likes\":{\"uri\":\"/videos/188160052/likes\",\"options\":[\"GET\"],\"total\":0},\"pictures\":{\"uri\":\"/videos/188160052/pictures\",\"options\":[\"GET\",\"POST\"],\"total\":1},\"texttracks\":{\"uri\":\"/videos/188160052/texttracks\",\"options\":[\"GET\",\"POST\"],\"total\":0},\"related\":{\"uri\":\"/me/videos?fields=uri,name,stats,created_time,metadata&offset=13\",\"options\":[\"GET\"]}},\"interactions\":{\"watchlater\":{\"added\":false,\"added_time\":null,\"uri\":\"/users/12226765/watchlater/188160052\"}}}},{\"uri\":\"/videos/188160039\",\"name\":\"Jennifer Aaker- Power of Purpose\",\"created_time\":\"2016-10-20T15:28:51+00:00\",\"stats\":{\"plays\":4},\"metadata\":{\"connections\":{\"comments\":{\"uri\":\"/videos/188160039/comments\",\"options\":[\"GET\",\"POST\"],\"total\":0},\"credits\":{\"uri\":\"/videos/188160039/credits\",\"options\":[\"GET\",\"POST\"],\"total\":1},\"likes\":{\"uri\":\"/videos/188160039/likes\",\"options\":[\"GET\"],\"total\":0},\"pictures\":{\"uri\":\"/videos/188160039/pictures\",\"options\":[\"GET\",\"POST\"],\"total\":1},\"texttracks\":{\"uri\":\"/videos/188160039/texttracks\",\"options\":[\"GET\",\"POST\"],\"total\":0},\"related\":{\"uri\":\"/me/videos?fields=uri,name,stats,created_time,metadata&offset=14\",\"options\":[\"GET\"]}},\"interactions\":{\"watchlater\":{\"added\":false,\"added_time\":null,\"uri\":\"/users/12226765/watchlater/188160039\"}}}},{\"uri\":\"/videos/188159997\",\"name\":\"Persuasion and the Power of Story- Jennifer Aaker (Future of StoryTelling 2013)\",\"created_time\":\"2016-10-20T15:28:39+00:00\",\"stats\":{\"plays\":8},\"metadata\":{\"connections\":{\"comments\":{\"uri\":\"/videos/188159997/comments\",\"options\":[\"GET\",\"POST\"],\"total\":0},\"credits\":{\"uri\":\"/videos/188159997/credits\",\"options\":[\"GET\",\"POST\"],\"total\":1},\"likes\":{\"uri\":\"/videos/188159997/likes\",\"options\":[\"GET\"],\"total\":0},\"pictures\":{\"uri\":\"/videos/188159997/pictures\",\"options\":[\"GET\",\"POST\"],\"total\":1},\"texttracks\":{\"uri\":\"/videos/188159997/texttracks\",\"options\":[\"GET\",\"POST\"],\"total\":0},\"related\":{\"uri\":\"/me/videos?fields=uri,name,stats,created_time,metadata&offset=15\",\"options\":[\"GET\"]}},\"interactions\":{\"watchlater\":{\"added\":false,\"added_time\":null,\"uri\":\"/users/12226765/watchlater/188159997\"}}}},{\"uri\":\"/videos/187989087\",\"name\":\"Day in the Life - Neolonie Edwards\",\"created_time\":\"2016-10-19T14:09:34+00:00\",\"stats\":{\"plays\":1204},\"metadata\":{\"connections\":{\"comments\":{\"uri\":\"/videos/187989087/comments\",\"options\":[\"GET\",\"POST\"],\"total\":0},\"credits\":{\"uri\":\"/videos/187989087/credits\",\"options\":[\"GET\",\"POST\"],\"total\":1},\"likes\":{\"uri\":\"/videos/187989087/likes\",\"options\":[\"GET\"],\"total\":0},\"pictures\":{\"uri\":\"/videos/187989087/pictures\",\"options\":[\"GET\",\"POST\"],\"total\":2},\"texttracks\":{\"uri\":\"/videos/187989087/texttracks\",\"options\":[\"GET\",\"POST\"],\"total\":0},\"related\":{\"uri\":\"/me/videos?fields=uri,name,stats,created_time,metadata&offset=16\",\"options\":[\"GET\"]}},\"interactions\":{\"watchlater\":{\"added\":false,\"added_time\":null,\"uri\":\"/users/12226765/watchlater/187989087\"}}}},{\"uri\":\"/videos/187839081\",\"name\":\"Elevator+Maestro's\",\"created_time\":\"2016-10-18T15:13:11+00:00\",\"stats\":{\"plays\":21},\"metadata\":{\"connections\":{\"comments\":{\"uri\":\"/videos/187839081/comments\",\"options\":[\"GET\",\"POST\"],\"total\":0},\"credits\":{\"uri\":\"/videos/187839081/credits\",\"options\":[\"GET\",\"POST\"],\"total\":1},\"likes\":{\"uri\":\"/videos/187839081/likes\",\"options\":[\"GET\"],\"total\":0},\"pictures\":{\"uri\":\"/videos/187839081/pictures\",\"options\":[\"GET\",\"POST\"],\"total\":1},\"texttracks\":{\"uri\":\"/videos/187839081/texttracks\",\"options\":[\"GET\",\"POST\"],\"total\":0},\"related\":{\"uri\":\"/me/videos?fields=uri,name,stats,created_time,metadata&offset=17\",\"options\":[\"GET\"]}},\"interactions\":{\"watchlater\":{\"added\":false,\"added_time\":null,\"uri\":\"/users/12226765/watchlater/187839081\"}}}},{\"uri\":\"/videos/187713480\",\"name\":\"Executive Forum Streaming Meeting - Oct 17, 2016\",\"created_time\":\"2016-10-17T19:20:54+00:00\",\"stats\":{\"plays\":44},\"metadata\":{\"connections\":{\"comments\":{\"uri\":\"/videos/187713480/comments\",\"options\":[\"GET\",\"POST\"],\"total\":0},\"credits\":{\"uri\":\"/videos/187713480/credits\",\"options\":[\"GET\",\"POST\"],\"total\":1},\"likes\":{\"uri\":\"/videos/187713480/likes\",\"options\":[\"GET\"],\"total\":0},\"pictures\":{\"uri\":\"/videos/187713480/pictures\",\"options\":[\"GET\",\"POST\"],\"total\":2},\"texttracks\":{\"uri\":\"/videos/187713480/texttracks\",\"options\":[\"GET\",\"POST\"],\"total\":0},\"related\":{\"uri\":\"/me/videos?fields=uri,name,stats,created_time,metadata&offset=18\",\"options\":[\"GET\"]}},\"interactions\":{\"watchlater\":{\"added\":false,\"added_time\":null,\"uri\":\"/users/12226765/watchlater/187713480\"}}}},{\"uri\":\"/videos/187338492\",\"name\":\"Operating Principles Intro\",\"created_time\":\"2016-10-14T13:25:20+00:00\",\"stats\":{\"plays\":0},\"metadata\":{\"connections\":{\"comments\":{\"uri\":\"/videos/187338492/comments\",\"options\":[\"GET\",\"POST\"],\"total\":0},\"credits\":{\"uri\":\"/videos/187338492/credits\",\"options\":[\"GET\",\"POST\"],\"total\":1},\"likes\":{\"uri\":\"/videos/187338492/likes\",\"options\":[\"GET\"],\"total\":0},\"pictures\":{\"uri\":\"/videos/187338492/pictures\",\"options\":[\"GET\",\"POST\"],\"total\":1},\"texttracks\":{\"uri\":\"/videos/187338492/texttracks\",\"options\":[\"GET\",\"POST\"],\"total\":0},\"related\":{\"uri\":\"/me/videos?fields=uri,name,stats,created_time,metadata&offset=19\",\"options\":[\"GET\"]}},\"interactions\":{\"watchlater\":{\"added\":false,\"added_time\":null,\"uri\":\"/users/12226765/watchlater/187338492\"}}}},{\"uri\":\"/videos/186297092\",\"name\":\"Cox Homelife Vignette V3\",\"created_time\":\"2016-10-10T17:16:40+00:00\",\"stats\":{\"plays\":67},\"metadata\":{\"connections\":{\"comments\":{\"uri\":\"/videos/186297092/comments\",\"options\":[\"GET\",\"POST\"],\"total\":0},\"credits\":{\"uri\":\"/videos/186297092/credits\",\"options\":[\"GET\",\"POST\"],\"total\":1},\"likes\":{\"uri\":\"/videos/186297092/likes\",\"options\":[\"GET\"],\"total\":0},\"pictures\":{\"uri\":\"/videos/186297092/pictures\",\"options\":[\"GET\",\"POST\"],\"total\":2},\"texttracks\":{\"uri\":\"/videos/186297092/texttracks\",\"options\":[\"GET\",\"POST\"],\"total\":0},\"related\":{\"uri\":\"/me/videos?fields=uri,name,stats,created_time,metadata&offset=20\",\"options\":[\"GET\"]}},\"interactions\":{\"watchlater\":{\"added\":false,\"added_time\":null,\"uri\":\"/users/12226765/watchlater/186297092\"}}}},{\"uri\":\"/videos/185983260\",\"name\":\"CB Welcome to iCare\",\"created_time\":\"2016-10-07T16:13:25+00:00\",\"stats\":{\"plays\":7},\"metadata\":{\"connections\":{\"comments\":{\"uri\":\"/videos/185983260/comments\",\"options\":[\"GET\",\"POST\"],\"total\":0},\"credits\":{\"uri\":\"/videos/185983260/credits\",\"options\":[\"GET\",\"POST\"],\"total\":1},\"likes\":{\"uri\":\"/videos/185983260/likes\",\"options\":[\"GET\"],\"total\":0},\"pictures\":{\"uri\":\"/videos/185983260/pictures\",\"options\":[\"GET\",\"POST\"],\"total\":1},\"texttracks\":{\"uri\":\"/videos/185983260/texttracks\",\"options\":[\"GET\",\"POST\"],\"total\":0},\"related\":{\"uri\":\"/me/videos?fields=uri,name,stats,created_time,metadata&offset=21\",\"options\":[\"GET\"]}},\"interactions\":{\"watchlater\":{\"added\":false,\"added_time\":null,\"uri\":\"/users/12226765/watchlater/185983260\"}}}},{\"uri\":\"/videos/185983238\",\"name\":\"Residential Welcome to iCareâ€™\",\"created_time\":\"2016-10-07T16:13:13+00:00\",\"stats\":{\"plays\":26},\"metadata\":{\"connections\":{\"comments\":{\"uri\":\"/videos/185983238/comments\",\"options\":[\"GET\",\"POST\"],\"total\":0},\"credits\":{\"uri\":\"/videos/185983238/credits\",\"options\":[\"GET\",\"POST\"],\"total\":1},\"likes\":{\"uri\":\"/videos/185983238/likes\",\"options\":[\"GET\"],\"total\":0},\"pictures\":{\"uri\":\"/videos/185983238/pictures\",\"options\":[\"GET\",\"POST\"],\"total\":1},\"texttracks\":{\"uri\":\"/videos/185983238/texttracks\",\"options\":[\"GET\",\"POST\"],\"total\":0},\"related\":{\"uri\":\"/me/videos?fields=uri,name,stats,created_time,metadata&offset=22\",\"options\":[\"GET\"]}},\"interactions\":{\"watchlater\":{\"added\":false,\"added_time\":null,\"uri\":\"/users/12226765/watchlater/185983238\"}}}},{\"uri\":\"/videos/185943956\",\"name\":\"FSA Day In The Life\",\"created_time\":\"2016-10-07T11:17:27+00:00\",\"stats\":{\"plays\":34},\"metadata\":{\"connections\":{\"comments\":{\"uri\":\"/videos/185943956/comments\",\"options\":[\"GET\",\"POST\"],\"total\":0},\"credits\":{\"uri\":\"/videos/185943956/credits\",\"options\":[\"GET\",\"POST\"],\"total\":1},\"likes\":{\"uri\":\"/videos/185943956/likes\",\"options\":[\"GET\"],\"total\":0},\"pictures\":{\"uri\":\"/videos/185943956/pictures\",\"options\":[\"GET\",\"POST\"],\"total\":1},\"texttracks\":{\"uri\":\"/videos/185943956/texttracks\",\"options\":[\"GET\",\"POST\"],\"total\":0},\"related\":{\"uri\":\"/me/videos?fields=uri,name,stats,created_time,metadata&offset=23\",\"options\":[\"GET\"]}},\"interactions\":{\"watchlater\":{\"added\":false,\"added_time\":null,\"uri\":\"/users/12226765/watchlater/185943956\"}}}},{\"uri\":\"/videos/185706067\",\"name\":\"Cox One Teaser Video\",\"created_time\":\"2016-10-05T20:21:48+00:00\",\"stats\":{\"plays\":22},\"metadata\":{\"connections\":{\"comments\":{\"uri\":\"/videos/185706067/comments\",\"options\":[\"GET\",\"POST\"],\"total\":0},\"credits\":{\"uri\":\"/videos/185706067/credits\",\"options\":[\"GET\",\"POST\"],\"total\":1},\"likes\":{\"uri\":\"/videos/185706067/likes\",\"options\":[\"GET\"],\"total\":0},\"pictures\":{\"uri\":\"/videos/185706067/pictures\",\"options\":[\"GET\",\"POST\"],\"total\":3},\"texttracks\":{\"uri\":\"/videos/185706067/texttracks\",\"options\":[\"GET\",\"POST\"],\"total\":0},\"related\":{\"uri\":\"/me/videos?fields=uri,name,stats,created_time,metadata&offset=24\",\"options\":[\"GET\"]}},\"interactions\":{\"watchlater\":{\"added\":false,\"added_time\":null,\"uri\":\"/users/12226765/watchlater/185706067\"}}}},{\"uri\":\"/videos/185373195\",\"name\":\"Cox Values - 2016\",\"created_time\":\"2016-10-03T19:39:40+00:00\",\"stats\":{\"plays\":0},\"metadata\":{\"connections\":{\"comments\":{\"uri\":\"/videos/185373195/comments\",\"options\":[\"GET\",\"POST\"],\"total\":0},\"credits\":{\"uri\":\"/videos/185373195/credits\",\"options\":[\"GET\",\"POST\"],\"total\":1},\"likes\":{\"uri\":\"/videos/185373195/likes\",\"options\":[\"GET\"],\"total\":0},\"pictures\":{\"uri\":\"/videos/185373195/pictures\",\"options\":[\"GET\",\"POST\"],\"total\":1},\"texttracks\":{\"uri\":\"/videos/185373195/texttracks\",\"options\":[\"GET\",\"POST\"],\"total\":0},\"related\":{\"uri\":\"/me/videos?fields=uri,name,stats,created_time,metadata&offset=25\",\"options\":[\"GET\"]}},\"interactions\":{\"watchlater\":{\"added\":false,\"added_time\":null,\"uri\":\"/users/12226765/watchlater/185373195\"}}}}]}]}";


            if (JSON.parse(updatedVideos).Value.length > 0) {
                if (JSON.parse(updatedVideos).Value[0].data.length > 0) {
                    for (var count = 0; count < JSON.parse(updatedVideos).Value[0].data.length; count++) {
                        videoTitle = JSON.parse(updatedVideos).Value[0].data[count].name;
                        videoDescription = JSON.parse(updatedVideos).Value[0].data[count].description;
                        videoUrl = JSON.parse(updatedVideos).Value[0].data[count].uri;
                        videoPlayCount = JSON.parse(updatedVideos).Value[0].data[0].stats.plays;
                        // Convertting to time stamp
                        var timeStamp = (new Date(JSON.parse(updatedVideos).Value[0].data[0].created_time)).getTime();
                        uploadDate = JSON.parse(updatedVideos).Value[0].data[0].created_time;
                        commentsCount = JSON.parse(updatedVideos).Value[0].data[0].metadata.connections.comments.total;
                        likesCount = JSON.parse(updatedVideos).Value[0].data[0].metadata.connections.likes.total;
                        var video = { videoTitle: videoTitle, videoUrl: videoUrl, videoPlayCount: videoPlayCount, videoDescription: videoDescription, uploadDate: uploadDate, commentsCount: commentsCount, likesCount: likesCount, timeStamp: timeStamp };
                        videos.push(video);
                    }
                    showThumbs(videos);
                }

            }
            else {

            }
        }
    });

}


