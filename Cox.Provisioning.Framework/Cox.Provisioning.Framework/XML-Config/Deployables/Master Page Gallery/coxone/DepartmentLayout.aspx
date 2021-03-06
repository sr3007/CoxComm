<%@ Page language="C#"   Inherits="Microsoft.SharePoint.Publishing.PublishingLayoutPage,Microsoft.SharePoint.Publishing,Version=15.0.0.0,Culture=neutral,PublicKeyToken=71e9bce111e9429c" meta:progid="SharePoint.WebPartPage.Document" %>
<%@ Register Tagprefix="SharePointWebControls" Namespace="Microsoft.SharePoint.WebControls" Assembly="Microsoft.SharePoint, Version=15.0.0.0, Culture=neutral, PublicKeyToken=71e9bce111e9429c" %> <%@ Register Tagprefix="WebPartPages" Namespace="Microsoft.SharePoint.WebPartPages" Assembly="Microsoft.SharePoint, Version=15.0.0.0, Culture=neutral, PublicKeyToken=71e9bce111e9429c" %> <%@ Register Tagprefix="PublishingWebControls" Namespace="Microsoft.SharePoint.Publishing.WebControls" Assembly="Microsoft.SharePoint.Publishing, Version=15.0.0.0, Culture=neutral, PublicKeyToken=71e9bce111e9429c" %> <%@ Register Tagprefix="PublishingNavigation" Namespace="Microsoft.SharePoint.Publishing.Navigation" Assembly="Microsoft.SharePoint.Publishing, Version=15.0.0.0, Culture=neutral, PublicKeyToken=71e9bce111e9429c" %>

<asp:Content ContentPlaceholderID="PlaceHolderPageTitle" runat="server">
	<SharePointWebControls:FieldValue id="PageTitle" FieldName="Title" runat="server"/>
</asp:Content>
<asp:Content ContentPlaceholderID="PlaceHolderPageTitleInTitleArea" runat="server">
    <SharePointWebControls:FieldValue FieldName="Title" runat="server"/>
</asp:Content>
<asp:Content ContentPlaceholderID="PlaceHolderMain" runat="server">	
		<div class="row HRdepartment">			
			<div class="col-md-5 col-md-push-3 departmentHeader">
				<div class="row mob_accordian accord">
					<div class="col-md-12">
						<h2 class="panel-title">HR Home</h2>
					</div>
				</div>
				<div class="row box_accordian space_warp">
					<div class="col-md-12">
						<div class="row">
							<div class="col-md-12">
								<div class="panel panel-default clearfix">
									<div class="article-content">
										<!--<h4>Human Resources</h4>-->
										<PublishingWebControls:RichHtmlField FieldName="PublishingPageContent" HasInitialFocus="True" MinimumEditHeight="400px" runat="server"/>
									</div>
								</div>
							</div>
						</div>
						<div class="row">
							<div class="col-md-12">
								<div class="panel panel-default clearfix">
									<div class="article-content">
										<!--<h4>Leadership Vision</h4>-->
										<PublishingWebControls:RichHtmlField FieldName="PublishingImageCaption" HasInitialFocus="False" MinimumEditHeight="400px" runat="server"/>
									</div>
								</div>
							</div>
						</div>
						<div class="row">
							<div class="col-md-12">
								<div class="panel panel-default clearfix department">
									<WebPartPages:WebPartZone id="x584d8650ffa54643bd4f8ea5ec80a78c" runat="server" title="App Zone 1"><ZoneTemplate></ZoneTemplate></WebPartPages:WebPartZone>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
			<div class="col-md-4 col-md-push-3 middle">
				<div class="panel panel-default clearfix">
					<WebPartPages:WebPartZone id="x24ba5369dc204483bacc032b2a2f1e37" runat="server" title="App Zone 2"><ZoneTemplate></ZoneTemplate></WebPartPages:WebPartZone>
				</div>
			</div>
			<div class="col-md-3 col-md-pull-9 departmentHeader">
				<div class="row mob_accordian">
					<div class="col-md-12">
						<h2 class="panel-title">Department Navigation</h2>
					</div>
				</div>
				<div class="row box_accordian">
					<div class="col-md-12">
						<div class="panel panel-default clearfix">					
							<WebPartPages:WebPartZone id="xd65ad140d6204281af26f07310222a11" runat="server" title="App Zone 3"><ZoneTemplate></ZoneTemplate></WebPartPages:WebPartZone>					
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
