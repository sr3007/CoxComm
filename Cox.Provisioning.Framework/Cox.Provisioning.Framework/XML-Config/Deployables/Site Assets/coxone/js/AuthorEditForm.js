<style>
.Edit_FAQ { float: right;}
.Edit_FAQ a { color: #085799;}
 #sideNavBox {DISPLAY: none}
 #contentBox {MARGIN-LEFT: 5px}
</style>    
  <script type="text/javascript">
 
 function displayLayover(url) {
	 //alert(_spPageContextInfo.siteAbsoluteUrl);
	// alert(document.title);
 var Category = document.title;
 var url = _spPageContextInfo.siteAbsoluteUrl + "/Lists/CCIFAQs/FilteredFAQs.aspx?Category="+Category+"&IsDlg=1";
//var url = _spPageContextInfo.siteAbsoluteUrl + "/Lists/CCIFAQs/FilteredFAQs.aspx?Minimized=TRUE&Category="+Category+"&RootFolder=%2Fsites%2FCoxOne%2FLists%2FCCIFAQs#InplviewHash7cc936ea-6345-4b37-8b47-1d7b9476a546=ShowInGrid%3DTrue-RootFolder%3D%252Fsites%252FCoxOne%252FLists%252FCCIFAQs&IsDlg=1";
 var options = SP.UI.$create_DialogOptions();
 
 	   options.width = 1500;
	   options.height = 1300;
       options.resizable = 1
		
 options.url = url;
 
 options.dialogReturnValueCallback = Function.createDelegate(
 
 null, null);
 
 SP.UI.ModalDialog.showModalDialog(options);
 
 }
 
 </script>
<div class="Edit_FAQ"> 
<a href='javascript:displayLayover("")'>Edit FAQs <img src="../../Style Library/coxone/images/preferences Gear.png" alt="Edit FAQs"> </a></div>