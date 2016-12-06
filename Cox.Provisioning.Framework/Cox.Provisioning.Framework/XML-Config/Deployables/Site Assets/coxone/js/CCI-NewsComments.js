<script>
var rangeFrom= null;
var rangeTo =null;
var $liList = null;
var minPage = null;
var maxPage = null;
var currentPage = null;
var pageSize = null;

function showCurrentPage() {
    rangeFrom = (currentPage - 1) * 5;
    rangeTo = (currentPage) * 5;
    $liList = $('.ms-comm-postList>li').hide();
    $liList.slice(rangeFrom, rangeTo).show();
}
function showMoreLessIcon(){
    minPage = 1;
    maxPage = -1;
    currentPage = 1;
    pageSize = 5;
    if($('.ms-comm-postList>li').length > 5){
        var id = $('.ms-comm-postList').closest('ul').attr('id');
                
        $('.ms-comm-postList').append("<div class='showhide'><span id='prev' style='display:none'>Show Less</span><span id='next' style='display:none'>Show More</span></div>")
    }
    maxPage = parseInt($('.ms-comm-postList>li').length / pageSize) + 1;
    showCurrentPage();
    $('#next').show();
    $( '#next' ).on( "click", function() {
        if (currentPage < maxPage) {
            currentPage++;
            showCurrentPage();
            if (currentPage >= maxPage){
                $('#prev').show();
                $('#next').hide();
            }
        }
    });
    $( '#prev' ).on( "click", function() {
        if (currentPage > minPage) {
            currentPage--;
            showCurrentPage();
            if (currentPage <= minPage){
                $('#next').show();
                $('#prev').hide();
            }
        }
    });
}

$(document).ready(function () {
    showMoreLessIcon();

    $(window).load(function(){
        //window.setTimeout(function(){
        $('.ms-comm-postReplyButton').attr('onclick','myfunc()');
        //}, 3000);
    });     
     
});

function myfunc()
{
    window.setTimeout(function(){
        //alert('called...');
        var commentcount = parseInt($('.ms-comm-statsInline .ms-comm-reputationNumbers').first("span").text());
        //alert(commentcount);
        commentcount++;
        reload(commentcount);
    }, 3000);
}

function reload(count){

    //window.setTimeout(function(){		
    showMoreLessIcon();     
    //alert(getURLParameters('ListItemId'));
    var listitemid = getURLParameters('ListItemId');
    $('.ms-comm-postReplyButton').attr('onclick','myfunc()');                                            
    //changeCommentsCount('lnkViewComments',count);
    window.parent.$("#lnkViewComments" + listitemid).text('Add/View Comments (' + count + ')');
    //location.reload();
    //}, 3000);
}

function getURLParameters(paramName)
{
    var sURL = window.document.URL.toString();
    if (sURL.indexOf("?") > 0)
    {
        var arrParams = sURL.split("?");
        var arrURLParams = arrParams[1].split("&");
        var arrParamNames = new Array(arrURLParams.length);
        var arrParamValues = new Array(arrURLParams.length);

        var i = 0;
        for (i = 0; i<arrURLParams.length; i++)
        {
            var sParam =  arrURLParams[i].split("=");
            arrParamNames[i] = sParam[0];
            if (sParam[1] != "")
                arrParamValues[i] = unescape(sParam[1]);
            else
                arrParamValues[i] = "No Value";
        }

        for (i=0; i<arrURLParams.length; i++)
        {
            if (arrParamNames[i] == paramName)
            {
                //alert("Parameter:" + arrParamValues[i]);
                return arrParamValues[i];
            }
        }
        return "No Parameters Found";
    }
}



</script>
<style>
.ms-comm-postReplyTextBox{
    width:96%;
}
.ms-comm-postMainContainer .ms-comm-postReplyTextBox {
    width: 89%;
}
.ms-comm-forumContainer .ms-comm-postList:last-child{border-bottom: 1px solid #d8d8d8;}
.showhide{text-align: center;}

.discussionframe{width:100%;height:500px;}
</style>