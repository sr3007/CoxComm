/* This file is currently associated to an HTML file of the same name and is drawing content from it.  Until the files are disassociated, you will not be able to move, delete, rename, or make any other changes to this file. */

function DisplayTemplate_0f89564cedcb4f10988456187df5b6cb(ctx) {
  var ms_outHtml=[];
  var cachePreviousTemplateData = ctx['DisplayTemplateData'];
  ctx['DisplayTemplateData'] = new Object();
  DisplayTemplate_0f89564cedcb4f10988456187df5b6cb.DisplayTemplateData = ctx['DisplayTemplateData'];

  ctx['DisplayTemplateData']['TemplateUrl']='~sitecollection\u002f_catalogs\u002fmasterpage\u002fDisplay Templates\u002fContent Web Parts\u002fCCI-Item_COXONE_Note.js';
  ctx['DisplayTemplateData']['TemplateType']='Item';
  ctx['DisplayTemplateData']['TargetControlType']=['Content Web Parts', 'SearchResults'];
  this.DisplayTemplateData = ctx['DisplayTemplateData'];

  ctx['DisplayTemplateData']['ManagedPropertyMapping']={'Picture URL':['PublishingImage', 'PictureURL', 'PictureThumbnailURL'], 'Link URL':['Path'], 'Line 1':['Title'], 'Line 2':['NotificationBodyOWSMTXT'], 'Line 3':['NotificationStartDateOWSDATE']};
  var cachePreviousItemValuesFunction = ctx['ItemValues'];
  ctx['ItemValues'] = function(slotOrPropName) {
    return Srch.ValueInfo.getCachedCtxItemValue(ctx, slotOrPropName)
};

ms_outHtml.push('',''
);
            var encodedId = $htmlEncode(ctx.ClientControl.get_nextUniqueId() + "_picture3Lines_");

            var linkURL = $getItemValue(ctx, "Link URL");
            linkURL.overrideValueRenderer($urlHtmlEncode);

            var line1 = $getItemValue(ctx, "Line 1");
            var line2 = $getItemValue(ctx, "Line 2");
            var line3 = $getItemValue(ctx, "Line 3");
            var line4 = $getItemValue(ctx, "Line 4");
            var line5 = $getItemValue(ctx, "Line 5");
            var line6 = $getItemValue(ctx, "Line 6");
            var line7 = $getItemValue(ctx, "Line 7");
            var line8 = $getItemValue(ctx, "Line 8");

            var pictureURL = $getItemValue(ctx, "Picture URL");
            var pictureId = encodedId + "picture";
            var pictureMarkup = Srch.ContentBySearch.getPictureMarkup(pictureURL, 100, 100, ctx.CurrentItem, "cbs-picture3LinesImg", line1, pictureId);

            line1.overrideValueRenderer($contentLineText);
            line2.overrideValueRenderer($contentLineText);
            line3.overrideValueRenderer($contentLineText);

            var containerId = encodedId + "container";
            var pictureLinkId = encodedId + "pictureLink";
            var pictureContainerId = encodedId + "pictureContainer";
            var dataContainerId = encodedId + "dataContainer";
            var line1LinkId = encodedId + "line1Link";
            var line1Id = encodedId + "line1";
            var line2Id = encodedId + "line2";
            var line3Id = encodedId + "line3";

            var dataDisplayTemplateTitle = "ItemPicture3Lines";
            var parseDate = new Date(line3.value);
            var formattedDate1 = parseDate.format('MMM') ;
            var formattedDate2 = parseDate.format('dd') ;
            var NoOfResult= ctx.ClientControl.get_numberOfItems();
            var notiCount=0;
            if(notiCount >NoOfResult)
                {
                    notiCount=1;
                }
                else
                {
                notiCount++;
                }

            var showPaging = ctx.ClientControl.get_showPaging();

            var NoOfResult= ctx.ClientControl.get_numberOfItems();
                console.log(NoOfResult);
            if(showPaging)
            {
                var pagingInfo = ctx.ClientControl.get_pagingInfo();
                showPaging = !$isEmptyArray(pagingInfo);
                if(showPaging)
                {
                    var currentPage = null;
                    var firstPage = pagingInfo[0];
                    var lastPage = pagingInfo[pagingInfo.length - 1];

                    for (var i = 0; i< pagingInfo.length; i++)
                    {
                        var pl = pagingInfo[i];
                        if (!$isNull(pl))
                        {
                            if (pl.startItem == -1)
                            {
                                currentPage = pl;
                            }
                        }
                    }

                    var getPagingImageClassName = function(buttonClassNamePrefix, isNext, isEnabled)
                    {
                        var className = buttonClassNamePrefix;
                        className += (isNext && !Srch.U.isRTL()) || (!isNext && Srch.U.isRTL()) ? "right" : "left";
                        if(!$isNull(isEnabled) && isEnabled == false)
                        {
                            className += "-disabled";
                        }
                        return className;
                    }

                    var getPagingContainerClassName = function(buttonClassNamePrefix, isEnabled)
                    {
                        var className = buttonClassNamePrefix;
                        className += isEnabled ? "enabled" : "disabled";
                        return className;
                    }

                    var hasNextPage = lastPage.pageNumber == -2;
                    var hasPreviousPage = firstPage.pageNumber == -1;
                    var buttonClassNamePrefix = "ms-promlink-button-";
                    var nextPageContainerClassName = getPagingContainerClassName(buttonClassNamePrefix, hasNextPage);
                    var previousPageContainerClassName = getPagingContainerClassName(buttonClassNamePrefix, hasPreviousPage);
                    var nextPageImageClassName = getPagingImageClassName(buttonClassNamePrefix, true, hasNextPage);
                    var previousPageImageClassName = getPagingImageClassName(buttonClassNamePrefix, false, hasPreviousPage);

                }
              }


                var rowsPerPage = ctx.ClientControl.get_numberOfItems();
                var totalRows=Math.min(ctx.DataProvider.get_totalRows(),rowsPerPage);
                

             ms_outHtml.push(''
,''
,''
,'		'
,'         <div class="slide" data-displaytemplate="ItemSlidePicture">'
,'             <div class="row custom_space top_news_close_wrp" id="','item_'+ctx.CurrentItemIdx ,'">'
,'                 <div class="col-sm-12 box_warp">'
,'                     <div class="panel panel-default custom-box-warp clearfix top_news_box">'
,'                         <div class="cross_warp" onclick="$(\'.note-slider\').hide();">x</div>'
,'                         <div class="col-sm-1 pull-left" style="padding-top: 20px;">'
,'                             '
,'                         </div>'
,'                         <div class="col-sm-10">'
,'                             <ul class="left_icon_bx top_newes_slider">'
,''
,'                                 <li>'
,'                                     <span class="icon_img date_calender">'
,'                                         <span class="month_name">', formattedDate1 ,'</span>'
,'                                         <span class="date">', formattedDate2 ,'</span>'
,'                                     </span>'
,'                                     <h3>', line1.value ,'</h3>'
,'                                     <p>', line2.value ,'</p>'
,'                                 </li>'
,'                             </ul>'
,'                         </div>'
,'                         <div class="col-sm-1" style="padding-top: 20px; text-align: right">'
,'                             '
,'                         </div>'
,''
,'                         <div class="col-sm-12">'
);
                            if(totalRows > 1)
                                {
                            ms_outHtml.push(''
,'                             <div class="pagingwarp" style="text-align: center; ">', ctx.CurrentItemIdx+1 ,' of ', totalRows ,'</div>'
);
                                }
                             ms_outHtml.push(''
,''
,'                         </div>'
,'                     </div>'
,'                 </div>'
,'             </div>'
,'		</div>'
,''
,''
,'	'
);

  ctx['ItemValues'] = cachePreviousItemValuesFunction;
  ctx['DisplayTemplateData'] = cachePreviousTemplateData;
  return ms_outHtml.join('');
}
function RegisterTemplate_0f89564cedcb4f10988456187df5b6cb() {

if ("undefined" != typeof (Srch) &&"undefined" != typeof (Srch.U) &&typeof(Srch.U.registerRenderTemplateByName) == "function") {
  Srch.U.registerRenderTemplateByName("Item_SlideImage", DisplayTemplate_0f89564cedcb4f10988456187df5b6cb);
}

if ("undefined" != typeof (Srch) &&"undefined" != typeof (Srch.U) &&typeof(Srch.U.registerRenderTemplateByName) == "function") {
  Srch.U.registerRenderTemplateByName("~sitecollection\u002f_catalogs\u002fmasterpage\u002fDisplay Templates\u002fContent Web Parts\u002fCCI-Item_COXONE_Note.js", DisplayTemplate_0f89564cedcb4f10988456187df5b6cb);
}

}
RegisterTemplate_0f89564cedcb4f10988456187df5b6cb();
if (typeof(RegisterModuleInit) == "function" && typeof(Srch.U.replaceUrlTokens) == "function") {
  RegisterModuleInit(Srch.U.replaceUrlTokens("~sitecollection\u002f_catalogs\u002fmasterpage\u002fDisplay Templates\u002fContent Web Parts\u002fCCI-Item_COXONE_Note.js"), RegisterTemplate_0f89564cedcb4f10988456187df5b6cb);
}