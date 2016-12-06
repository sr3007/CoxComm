// JavaScript source code
var allGroupsCollection = [];
var currentgrouplength;
var checkGroupCounter = 0;

$(document).ready(function () {
    
   
	yam.getLoginStatus(
  function(response) {
    if (response.authResponse) {
      //alert("logged in");
        console.dir(response); //print user information to the console
		var myyammerGroups = [];
		yam.platform.request({
        url: "groups.json?mine=1",     //this is one of many REST endpoints that are available
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
					// alert(myyammergroup[0]);
					// alert(myyammergroup[1]);
                    myyammerGroups[k] = myyammergroup;
		  }
		  
		  currentgrouplength = allGroupsCollection.length;

			/* 	if (currentgrouplength <= 0) {
                    currentgrouplength = currentgrouplength ;
                }
				else{
					 currentgrouplength = currentgrouplength + 1;
				} */
		 
		  if (myyammerGroups.length > 0) {
		      allGroupsCollection[currentgrouplength] = myyammerGroups;
		  }
		  
		  getCommunityGroups();

			//renderAllgroups(allGroupsCollection);
            //alert(myyammerGroups.length);
			//	renderYammerGroups(myyammerGroups, "#yammerul");
		   
		  // renderYammerGroups(MyYammerGroups, "#yammerul");
		  
		  //alert("The request was successful.");
          
        },
        error: function (user) {
          //alert("There was an error with the request.");
        }
      });
      }
    else {
        var myerrorYammerGroups = [];
        var myerrorYammerGroup = [];
        myerrorYammerGroup[0] = "YammerLoginError";
        myerrorYammerGroup[1] = "https://www.yammer.com";
        myerrorYammerGroup[2] = "Yammer Groups";
        myerrorYammerGroups[0] = myerrorYammerGroup;
        currentgrouplength = allGroupsCollection.length;

        if (myerrorYammerGroups.length > 0) {
            allGroupsCollection[currentgrouplength] = myerrorYammerGroups;
        }
        
        getCommunityGroups();
            
    
    }

    //$.getScript(scriptbase + "SP.UserProfiles.js", function () {

    //    $.getScript(scriptbase + "SP.RequestExecutor.js", getCommunityGroups);
    //    //$.getScript(scriptbase + "SP.RequestExecutor.js", getTeamGroups);
    //    //$.getScript(scriptbase + "SP.RequestExecutor.js", renderAllgroups(allGroupsCollection));

    //});
  }
 
);
	
});

	function getCommunityGroups() {
	
	 var myCommunityGroups = [];
	 var siteUrl;
	 var searchSubMenuResultsHtml = "";
	  siteUrl = _spPageContextInfo.siteAbsoluteUrl;
	  
        var url = siteUrl + "/_api/search/query?querytext='path:\"" + siteUrl + "\" contentclass:STS_Web  WebTemplate=COMMUNITY' ";
      
           $.ajax({
            method: 'GET',
            url: url,
            dataType: 'json',
            success: function (data) {
                var results = data.PrimaryQueryResult.RelevantResults.Table.Rows.results
                //alert(results);
                $.each(data.PrimaryQueryResult.RelevantResults.Table.Rows, function (index, row) {
                    var mygroup = [];
					//alert(row.Cells[3].Value);
					
                    mygroup[0] = row.Cells[3].Value;
                    mygroup[1] = row.Cells[6].Value;
					mygroup[2] = "Community Sites";
					
                    myCommunityGroups[index] = mygroup;
                });
				
                currentgrouplength = allGroupsCollection.length;
                if (myCommunityGroups.length>0){
				    allGroupsCollection[currentgrouplength] = myCommunityGroups;
                }
				getTeamGroups();
            }
           });
}


    function getTeamGroups() {
	
	 var myTeamgroups = [];
	 var siteUrl;
	 var searchSubMenuResultsHtml = "";
	  siteUrl = _spPageContextInfo.siteAbsoluteUrl;
	  
        var url = siteUrl + "/_api/search/query?querytext='path:\"" + siteUrl + "\" contentclass:STS_Web  WebTemplate:STS' ";
        $.ajax({
            method: 'GET',
            url: url,
            dataType: 'json',
            success: function (data) {
                $.each(data.PrimaryQueryResult.RelevantResults.Table.Rows, function (index, row) {
                    var mygroup = [];
					//alert(row.Cells[3].Value);
					
                    mygroup[0] = row.Cells[3].Value;
                    mygroup[1] = row.Cells[6].Value;
					mygroup[2] = "Team Sites";
                    myTeamgroups[index] = mygroup;
                });
				
                currentgrouplength = allGroupsCollection.length;
                if (myTeamgroups.length>0){
                    allGroupsCollection[currentgrouplength] = myTeamgroups;
                }
                renderAllgroups(allGroupsCollection);
                //renderYammerGroups(myTeamgroups, "#teamul");	
            }
        });
}

	

	function renderAllgroups(mygroups) {

	    var iCounter;
	    var iCounter1;
	    var divClassname;
		var ulID="ulid";
		var divId;
		var strDiv;
		var topdiv1;
		var groupHeadingName=[];
		var groupTitle;
		var viewMorePagelink;
		var standrardItemCounter = 4;
		var checkYammerLogin=0;
		
	    if (mygroups.length >= 0) {
	        iCounter = mygroups.length;
	    }
		
		

	    if (iCounter==1){
	        divClassname= 'col-sm-12';
		}

	    if (iCounter==2){
	        divClassname= 'col-sm-6';
	    }

	    if (iCounter==3){
	        divClassname= 'col-sm-4';
	    }

		divId=divClassname;
			
		/* for (var k = 0; k < iCounter; k++) {
	        
			var HeadingGroup = mygroups[k];
			
		} */
		
			
		/* strDiv ="<div class="+ divClassname+" id="+ divId +"><h2 class=\"dropdown-header\">"+ ulID + "</h2><ul class=\"check_side_area\" id="+ ulID +">	</ul></div>";
		topdiv1 = $(".GroupMenu").append(strDiv); */
		var checkcounter=0;	
		mygroups.reverse();

		for (var k = 0; k < iCounter; k++) {
	        var mygroup = mygroups[k];
	        var icounter2 = mygroup.length;
	        for (var p = 0; p < icounter2; p++) {
                groupHeadingName[k] = mygroup[p][2];
			    break;
			}
			
	        if (icounter2>0){
			groupTitle=groupHeadingName[k];
			
			strDiv ="<div class="+ divClassname+" id="+ divId +"><h2 class=\"dropdown-header\">"+ groupTitle + "</h2><ul class=\"check_side_area\" id="+ ulID +">	</ul></div>";
			topdiv1 = $(".GroupMenu").append(strDiv);

			siteUrl = _spPageContextInfo.siteAbsoluteUrl;
			var delveSiteUrl = siteUrl + "/_layouts/15/me.aspx" + "?v=work&p=" + _spPageContextInfo.userLoginName;
			
			if (groupTitle.indexOf('Yammer') >= 0) {
			    viewMorePagelink = "https://www.yammer.com";
			}

			if (groupTitle.indexOf('Team') >= 0) {
			    viewMorePagelink = delveSiteUrl;
			}

			if (groupTitle.indexOf('Community') >= 0) {
			    viewMorePagelink = delveSiteUrl;
			}
			
		
	        if (mygroup.length >= 0) {
	            iCounter1 = mygroup.length;
	        }

	       
	        for (var j = 0; j < iCounter1; j++) {
	          
	            if (mygroup[j][0].indexOf('YammerLoginError') >= 0) {
	                checkYammerLogin = 1;
	                resultsHtml = "<li> Please login to <a href='" + mygroup[j][1] + "' target=_blank >Yammer</a></li>";
	            }
	            else {
	                checkYammerLogin = 0;
	                resultsHtml = "<li> <a href='" + mygroup[j][1] + "' target=_blank> " + mygroup[j][0] + "</a></li>";
	            }

	            $("#" + ulID).append(resultsHtml);
	            if (j >= standrardItemCounter) {
	                break;
	            }
	        }

	        if (iCounter1 > 0) {
	            if (checkYammerLogin==0){
	                resultsHtml = "<li> <a href='" + viewMorePagelink + "' target=_blank > " + "View All" + "</a></li>";
	                $("#" + ulID).append(resultsHtml);
	            }
	        }

			ulID = ulID+k;
			divId=divClassname+k;
			checkcounter=k+1;
			
		
	        }
	    }

	  
	}




