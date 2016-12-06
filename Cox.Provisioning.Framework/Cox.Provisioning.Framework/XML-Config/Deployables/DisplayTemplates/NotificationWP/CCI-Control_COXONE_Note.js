/* This file is currently associated to an HTML file of the same name and is drawing content from it.  Until the files are disassociated, you will not be able to move, delete, rename, or make any other changes to this file. */

function DisplayTemplate_18171d66f4094a5da00971719a69cca1(ctx) {
  var ms_outHtml=[];
  var cachePreviousTemplateData = ctx['DisplayTemplateData'];
  ctx['DisplayTemplateData'] = new Object();
  DisplayTemplate_18171d66f4094a5da00971719a69cca1.DisplayTemplateData = ctx['DisplayTemplateData'];

  ctx['DisplayTemplateData']['TemplateUrl']='~sitecollection\u002f_catalogs\u002fmasterpage\u002fDisplay Templates\u002fContent Web Parts\u002fCCI-Control_COXONE_Note.js';
  ctx['DisplayTemplateData']['TemplateType']='Base';
  ctx['DisplayTemplateData']['TargetControlType']=['Content Web Parts'];
  this.DisplayTemplateData = ctx['DisplayTemplateData'];

ms_outHtml.push('',''
);if (!$isNull(ctx.ClientControl) && !$isNull(ctx.ClientControl.shouldRenderControl) && !ctx.ClientControl.shouldRenderControl()){return "";}
ctx.ListDataJSONGroupsKey = "ResultTables";
ctx["CurrentItems"] = ctx.ListData.ResultTables[0].ResultRows;
var siteURL = SP.PageContextInfo.get_siteAbsoluteUrl();
var loadingImageURL = siteURL + "/style library/coxone/images/loading.gif";
ctx.OnPostRender = function() {
	$.getScript(siteURL + "/style library/coxone/js/slides.min.jquery.js", function(){
		$(".note-image-slider .note-slides").slides({
			preload: true,
			preloadImage: loadingImageURL,
			play: 0,
			pause: 0,
			hoverPause: true,
			animationStart: function(current){
				$('.caption').animate({
					bottom:-35
				},100);
			},
			animationComplete: function(current){
				$('.caption').animate({
					bottom:0
				},200);
			},
			slidesLoaded: function() {
				$('.caption').animate({
					bottom:0
				},200);
			}
		});
		
		$('.caption').hover(
			function(){
				$('.caption').animate({
					height:$('.caption').height($('.caption').height() + 50)
				},200);
			}, 
			function () {
				$('.caption').animate({
					height:$('.caption').height($('.caption').height() - 50)
				},200);
		});
	});
};ms_outHtml.push(''
,'    <div class="note-slider note-image-slider">'
,'        <div class="container">'
,''
,'            <div class="note-slides">'
,'                <div class="slides_container">'
,'                    ', ctx.RenderItems(ctx) ,''
,'                </div>'
,'                <a href="#" class="prev"><i class="fa fa-angle-left" style="font-size: 40px; color:#BBB"></i><!-- <img src="', siteURL ,'/style library/coxone/images/arrow-prev.png" width="24" height="43" alt="Arrow Prev"/> --></a>'
,'                <a href="#" class="next"><i class="fa fa-angle-right" style="font-size: 40px; color:#BBB"></i><!-- <img src="', siteURL ,'/style library/coxone/images/arrow-next.png" width="24" height="43" alt="Arrow Next"/> --></a>'
,'            </div>'
,'            <img src="', siteURL ,'/style library/coxone/images/example-frame.png" alt="Featured Stories" class="frame" />'
,'        </div>'
,'    </div>'
);

  ctx['DisplayTemplateData'] = cachePreviousTemplateData;
  return ms_outHtml.join('');
}
function RegisterTemplate_18171d66f4094a5da00971719a69cca1() {

if ("undefined" != typeof (Srch) &&"undefined" != typeof (Srch.U) &&typeof(Srch.U.registerRenderTemplateByName) == "function") {
  Srch.U.registerRenderTemplateByName("imageSliderControl", DisplayTemplate_18171d66f4094a5da00971719a69cca1);
}

if ("undefined" != typeof (Srch) &&"undefined" != typeof (Srch.U) &&typeof(Srch.U.registerRenderTemplateByName) == "function") {
  Srch.U.registerRenderTemplateByName("~sitecollection\u002f_catalogs\u002fmasterpage\u002fDisplay Templates\u002fContent Web Parts\u002fCCI-Control_COXONE_Note.js", DisplayTemplate_18171d66f4094a5da00971719a69cca1);
}
//
        $includeLanguageScript("~sitecollection\u002f_catalogs\u002fmasterpage\u002fDisplay Templates\u002fContent Web Parts\u002fCCI-Control_COXONE_Note.js", "~sitecollection/_catalogs/masterpage/Display Templates/Language Files/{Locale}/CustomStrings.js");
    //
}
RegisterTemplate_18171d66f4094a5da00971719a69cca1();
if (typeof(RegisterModuleInit) == "function" && typeof(Srch.U.replaceUrlTokens) == "function") {
  RegisterModuleInit(Srch.U.replaceUrlTokens("~sitecollection\u002f_catalogs\u002fmasterpage\u002fDisplay Templates\u002fContent Web Parts\u002fCCI-Control_COXONE_Note.js"), RegisterTemplate_18171d66f4094a5da00971719a69cca1);
}