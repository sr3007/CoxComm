'use strict';

var subSiteName = window.location.pathname.split('/')[3];
var grpname = '';
var memberAPI = '';
var TotalItemsToDisplay = 5;
$(document).ready(function () {

    $.getScript(scriptbase + "SP.UserProfiles.js", function () {
        $.getScript(scriptbase + "SP.RequestExecutor.js", getCommunityMembersResult);
    });

});



function getCommunityMembersResult()
{
    var allGroupsCollection = [];
    var currentgrouplength;
    var CommunityMemberVal = 'myCommunityMembers';
    yam.getLoginStatus(
  function (response) {
      if (response.authResponse) {

          var CommunitymembersValue = CCI_Common.GetConfig(CommunityMemberVal);
          console.log("CommunitymembersValue: " + CommunitymembersValue);
          //CommunitymembersValue = "Accounting:Sales,Marketing:Marketing,HumanResources:Human Resources";

          var Subsitegrpnames = CommunitymembersValue.split(',');
          for (var i = 0; i < Subsitegrpnames.length; i++)
          {
              if (Subsitegrpnames[i].split(':')[0] == subSiteName)
              {
                  grpname = Subsitegrpnames[i].split(':')[1];
                  break;
              }
          }
          var myyammerGroups = [];
          yam.platform.request({
              url: "groups.json",     //this is one of many REST endpoints that are available
              method: "GET",
              data: {    //use the data object literal to specify parameters, as documented in the REST API section of this developer site
                  //"letter": "m",
                  //"page": "2",
              },
              success: function (user) { //print message response information to the console
                  console.dir(user);
                  for (var k = 0; k < user.length; k++) {
                      var myyammergroup = [];
                      myyammergroup[0] = user[k].full_name;
                      myyammergroup[1] = user[k].web_url;
                      myyammergroup[2] = "Yammer Groups";
                      myyammerGroups[k] = myyammergroup;
                      console.log(myyammergroup[0]);

                      if (myyammergroup[0].toLowerCase() == grpname.toLowerCase())
                      {
                          //memberAPI = "groups/" + user[k].id + "/members.json";

                          memberAPI = "users/in_group/" + user[k].id + ".json?sort_by=followers";
                          break;
                      }
                  }
                  currentgrouplength = allGroupsCollection.length;
                  allGroupsCollection[currentgrouplength] = myyammerGroups;
                  //console.log("Main part: " + allGroupsCollection[currentgrouplength]);

                  getCommunityMembersResultdetails();
              },
              error: function (user) {
                  //alert("There was an error with the request.");
              }
          });


          //});
      }
      else {
          var myerrorYammerGroups = [];
          var myerrorYammerGroup = [];
          myerrorYammerGroup[0] = "Need Yammer Authentication, Click here login";
          myerrorYammerGroup[1] = "https://www.yammer.com";
          myerrorYammerGroups[2] = "Yammer Groups";
          myerrorYammerGroups[0] = myerrorYammerGroup;
          currentgrouplength = allGroupsCollection.length;
          allGroupsCollection[currentgrouplength] = myerrorYammerGroups;
          console.log("else part: " + allGroupsCollection[currentgrouplength]);
      }
  }
);
}

function getCommunityMembersResultdetails()
{
    yam.platform.request({

        url: memberAPI,
        // url: "groups/8917490/members.json",
        //url: $('#yammerURLCustom').val(),
        type: 'GET',
        data: {    
        },
        success: function (user) {
            console.dir(user);
            var ulData = '';
            if (user.users.length > 5) {
                //$("#loadMoreCommunityMember").show();
            }
            else
            {
                TotalItemsToDisplay = user.users.length;
            }
            ulData += "<div class=\"CommunityMembers\">";
            //for (var i = 0; i < user.users.length; i++) {
            for (var i = 0; i < TotalItemsToDisplay; i++) {
                ulData += "<div class=\"team-row\"><div class=\"content_row\">" +
                        "<div class=\"img_data left_side_img\">" +
                            "<img src=\"" + user.users[i].mugshot_url + " \"></div>" +
                        "<a href=\"" + user.users[i].web_url + "\" target=\"_blank\"><h4 class=\"panel-sub-heading\"><strong>" + user.users[i].full_name + "</strong></h4></a>" +
                        "<p>" + user.users[i].job_title + "</p>" +
                    "</div></div>";
            }
            ulData += "</div>";
            $("#TeamsList").append(ulData);
        },
        error: function (user) {
            console.log("CommunityMember: " + JSON.stringify(user));
        }

    });
}




