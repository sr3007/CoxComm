<%@ Page language="C#"   Inherits="Microsoft.SharePoint.Publishing.PublishingLayoutPage,Microsoft.SharePoint.Publishing,Version=15.0.0.0,Culture=neutral,PublicKeyToken=71e9bce111e9429c" meta:progid="SharePoint.WebPartPage.Document" %>
<%@ Register Tagprefix="SharePointWebControls" Namespace="Microsoft.SharePoint.WebControls" Assembly="Microsoft.SharePoint, Version=15.0.0.0, Culture=neutral, PublicKeyToken=71e9bce111e9429c" %> <%@ Register Tagprefix="WebPartPages" Namespace="Microsoft.SharePoint.WebPartPages" Assembly="Microsoft.SharePoint, Version=15.0.0.0, Culture=neutral, PublicKeyToken=71e9bce111e9429c" %> <%@ Register Tagprefix="PublishingWebControls" Namespace="Microsoft.SharePoint.Publishing.WebControls" Assembly="Microsoft.SharePoint.Publishing, Version=15.0.0.0, Culture=neutral, PublicKeyToken=71e9bce111e9429c" %> <%@ Register Tagprefix="PublishingNavigation" Namespace="Microsoft.SharePoint.Publishing.Navigation" Assembly="Microsoft.SharePoint.Publishing, Version=15.0.0.0, Culture=neutral, PublicKeyToken=71e9bce111e9429c" %>

<asp:Content ContentPlaceholderID="PlaceHolderPageTitle" runat="server">
	<SharePointWebControls:FieldValue id="PageTitle" FieldName="Title" runat="server"/>
</asp:Content>
<asp:Content ContentPlaceholderID="PlaceHolderPageTitleInTitleArea" runat="server">
    <SharePointWebControls:FieldValue FieldName="Title" runat="server"/>
</asp:Content>
<asp:Content ContentPlaceholderID="PlaceHolderMain" runat="server">
<style>
	@media (max-width: 767px){
		#DeltaPlaceHolderMain{margin-top: 5px !important;}
	}
	#DeltaPlaceHolderMain .col-sm-12.clearfix:before{margin-top: 0px !important;}
	.box_accordian {height: auto;}
</style>
		<div class="row" id="SearchDetails">
			<div class="col-md-3">
				<div class="panel panel-default clearfix">
					<WebPartPages:WebPartZone id="xd65ad140d6204281af26f07310222a11" runat="server" title="App Zone 1"><ZoneTemplate></ZoneTemplate></WebPartPages:WebPartZone>
				</div>	
			</div>	
			<div class="col-md-9">
				<div class="panel panel-default clearfix">
					<WebPartPages:WebPartZone id="x7bd250ccc7fa476ab976f3b3d3af90d1" runat="server" title="App Zone 2"><ZoneTemplate></ZoneTemplate></WebPartPages:WebPartZone>
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

