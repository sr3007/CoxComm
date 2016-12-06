<%@ Page language="C#"   Inherits="Microsoft.SharePoint.Publishing.PublishingLayoutPage,Microsoft.SharePoint.Publishing,Version=15.0.0.0,Culture=neutral,PublicKeyToken=71e9bce111e9429c" meta:progid="SharePoint.WebPartPage.Document" %>
<%@ Register Tagprefix="SharePointWebControls" Namespace="Microsoft.SharePoint.WebControls" Assembly="Microsoft.SharePoint, Version=15.0.0.0, Culture=neutral, PublicKeyToken=71e9bce111e9429c" %> <%@ Register Tagprefix="WebPartPages" Namespace="Microsoft.SharePoint.WebPartPages" Assembly="Microsoft.SharePoint, Version=15.0.0.0, Culture=neutral, PublicKeyToken=71e9bce111e9429c" %> <%@ Register Tagprefix="PublishingWebControls" Namespace="Microsoft.SharePoint.Publishing.WebControls" Assembly="Microsoft.SharePoint.Publishing, Version=15.0.0.0, Culture=neutral, PublicKeyToken=71e9bce111e9429c" %> <%@ Register Tagprefix="PublishingNavigation" Namespace="Microsoft.SharePoint.Publishing.Navigation" Assembly="Microsoft.SharePoint.Publishing, Version=15.0.0.0, Culture=neutral, PublicKeyToken=71e9bce111e9429c" %>

<asp:Content ContentPlaceholderID="PlaceHolderPageTitle" runat="server">
	<SharePointWebControls:FieldValue id="PageTitle" FieldName="Title" runat="server"/>
</asp:Content>
<asp:Content ContentPlaceholderID="PlaceHolderPageTitleInTitleArea" runat="server">
    <SharePointWebControls:FieldValue FieldName="Title" runat="server"/>
</asp:Content>

<asp:Content ContentPlaceholderID="PlaceHolderMain" runat="server">
<style type="text/css" >
.ms-webpart-chrome-title .ms-webpart-titleText{color: #5B5D5C !important;font-size: 18px !important;}
#DeltaPlaceHolderMain{margin-top: 0px !important; }
.ms-webpart-chrome-title {background: transparent;border: none;}
#Navbreadcrumb{display:none !important;}
#Hometoggle .flexInfo {display: flex;flex-direction: row;}
.order1{order:1}
@media (max-width: 767px){
#Hometoggle .flexInfo {display: flex;flex-direction: column;}
.order1{order:1}
.order2{order:2}
}
@media (max-width: 767px){
	.custom-box-warp.mobile-custom-space .panel-title.mob_accordian {margin-bottom: 0px;background: none;color: #5B5D5C;font-size: 18px;}
}
</style>
		<div class="row" id="Hometoggle">
			<div class="col-xs-12" style="position:relative">
				<div class="row">
					<div class="col-md-12">
						<div id="NewsNotification" class="panel panel-default clearfix">
							<WebPartPages:WebPartZone id="NewsNotification" runat="server" title="App Zone 1"><ZoneTemplate></ZoneTemplate></WebPartPages:WebPartZone>
						</div>
					</div>					
				</div>	
				<div class="row" style="position:relative">
					<div class="col-md-12">
						<div id="NewsFeatured" class="row">
							<div class="col-md-12 ms-webpart-chrome-title mob_accordian accord">
								<h2 class="ms-webpart-titleText">Top Stories</h2>								
							</div>
							<div class="box_accordian space_warp">
								<div class="col-md-8">
									<div class="panel panel-default clearfix">									
										<WebPartPages:WebPartZone id="NewsCarousel" runat="server" title="App Zone 2"><ZoneTemplate></ZoneTemplate></WebPartPages:WebPartZone>
									</div>
								</div>
								<div class="col-md-4">
									<div id="WeatherBanner" class="panel panel-default clearfix">
										<WebPartPages:WebPartZone id="WeatherBanner" runat="server" title="App Zone 6"><ZoneTemplate></ZoneTemplate></WebPartPages:WebPartZone>
									</div>
									<div id="NewsBanner" class="panel panel-default clearfix">
										<WebPartPages:WebPartZone id="NewsBanner" runat="server" title="App Zone 7"><ZoneTemplate></ZoneTemplate></WebPartPages:WebPartZone>
									</div>
								</div>
							</div>
						</div>
					</div>					
					<div class="col-md-12">
						<div class="row" style="position:relative">					
							<div class="col-md-8 col-md-pull-0">
								<div id="NewsGrid" class="panel panel-default clearfix">
									<WebPartPages:WebPartZone id="NewsGrid" runat="server" title="App Zone 3"><ZoneTemplate></ZoneTemplate></WebPartPages:WebPartZone>
								</div>
							</div>
							<div class="col-md-4 col-md-push-0">
								<div id="videos" class="row">
									<div class="col-md-12 ms-webpart-chrome-title mob_accordian">
										<h2 class="ms-webpart-titleText">Videos</h2>								
									</div>
									<div class="box_accordian">
										<div class="col-md-12">
											<div class="panel panel-default clearfix">
												<WebPartPages:WebPartZone id="VideosFeed" runat="server" title="App Zone 8"><ZoneTemplate></ZoneTemplate></WebPartPages:WebPartZone>
											</div>
										</div>
									</div>
								</div>
								<div id="socialmedia" class="row">
									<div class="col-md-12 ms-webpart-chrome-title mob_accordian">
										<h2 class="ms-webpart-titleText">Social Feed</h2>								
									</div>
									<div class="box_accordian">
										<div class="col-md-12">
											<div class="panel panel-default clearfix">
												<WebPartPages:WebPartZone id="socilmedia" runat="server" title="App Zone 9"><ZoneTemplate></ZoneTemplate></WebPartPages:WebPartZone>
											</div>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
					<div class="col-md-12">
						<div class="row flexInfo" style="position:relative">
							<div class="col-md-4 order2">
								<div id="MyOpinion" class="row">
									<div class="col-md-12 ms-webpart-chrome-title mob_accordian">
										<h2 class="ms-webpart-titleText">my Opinion</h2>								
									</div>
									<div class="box_accordian">
										<div class="col-md-12">
											<div class="panel panel-default clearfix">
												<WebPartPages:WebPartZone id="MyOpinion" runat="server" title="App Zone 4"><ZoneTemplate></ZoneTemplate></WebPartPages:WebPartZone>
											</div>
										</div>
									</div>
								</div>
							</div>
							<div class="col-md-4 order1">
								<div id="ProductInfo" class="row">
									<div class="col-md-12 ms-webpart-chrome-title mob_accordian">
										<h2 class="ms-webpart-titleText">Product Information</h2>								
									</div>
									<div class="box_accordian">
										<div class="col-md-12">
											<div class="panel panel-default clearfix">
												<WebPartPages:WebPartZone id="ProductInfo" runat="server" title="App Zone 5"><ZoneTemplate></ZoneTemplate></WebPartPages:WebPartZone>
											</div>
										</div>
									</div>
								</div>
							</div>							
						</div>
					</div>
				</div>
			</div>	
		</div>
</asp:Content>


<asp:Content ContentPlaceholderID="PageTitleZone" runat="server">	
	<WebPartPages:webpartzone id="xPageTitleZone0000000000000000000" runat="server" title="PageTitleZone"><ZoneTemplate></ZoneTemplate></WebPartPages:webpartzone>	
</asp:Content>
<asp:Content ContentPlaceholderID="SidebarZone" runat="server">	
	<WebPartPages:webpartzone id="xSidebarZone000000000000000000000" runat="server" title="SidebarZone"><ZoneTemplate></ZoneTemplate></WebPartPages:webpartzone>	
</asp:Content>