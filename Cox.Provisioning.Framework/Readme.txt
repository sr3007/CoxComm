Things to configure before starting to deploy the artifacts.
1.)Setup app.config values
	a.)DeployXMLConfigTo:- set the sitecollection url where all the artifacts needs to be provisioned.
		Note:-Make sure to verify that its not the demo/production/UAT/testing url only it needs to be 
	b.)UserName:- Set the site collection administrator username.
	c.)Password:- Set the password for the site collection administrator password.
2.)Setup parameters in the Provisioning Config XML for pnp:Parameters
	  Sample Values
	  같같같같같같�
	  <pnp:Parameter Key="O365TenantName">corpcg</pnp:Parameter>
      <pnp:Parameter Key="CodeProvidedParam" Required="true"/>
      <pnp:Parameter Key="YammerNetwork">cox.com</pnp:Parameter>
      <pnp:Parameter Key="lcid">1033</pnp:Parameter>
      <pnp:Parameter Key="CompanyName">COX Inc.</pnp:Parameter>
      <pnp:Parameter Key="sitecollectiontermstoreid">4a05331c553e437ea6751c3ff54e5d5a</pnp:Parameter>
      <pnp:Parameter Key="AdminUserNameID">i:0#.f|membership|t@corpcg.onmicrosoft.com</pnp:Parameter>
      <pnp:Parameter Key="BaseCoxSiteColumnGroup">COXOne.SiteColumns.Group</pnp:Parameter>
      <pnp:Parameter Key="SourceID">http://schemas.microsoft.com/sharepoint/v3</pnp:Parameter>

Note:-
=====
When the file is added in the Deployable folder to any relative location set the file property "Copy to Output Directory" as "Copy always".


XML configuration options
=========================
1.)<pnp:File>
Attibute	Type		Description												Example
Src			xsd:string	The Src of the File, required attribute.				Deployables\masterpages\coxone.master
Folder		xsd:string	The TargetFolder of the File, required attribute.		{masterpagecatalog}/coxone   or  {site}/Style%20Library/
Overwrite	xsd:boolean	The Overwrite flag for the File, optional attribute.	true
Level		FileLevel	The Level status for the File, optional attribute.		Published

Sample Item Display Template example
====================================
1.)Sample for Item Display Template
<pnp:File Src="Deployables\DisplayTemplates\NotificationWP\CCI-Item_COXONE_Note.js" Folder="{site}/_catalogs/masterpage/Display Templates/Content Web Parts" Overwrite="true" Level="Published">
          <pnp:Properties>
            <pnp:Property Key="Title" Value="COXONE Item Note" />
            <pnp:Property Key="ContentTypeId" Value="{contenttypeid:Item Display Template}" />
            <pnp:Property Key="MasterPageDescription" Value="Minimal group display template for using RSWP like CSWP" />
            <pnp:Property Key="ManagedPropertyMapping" Value="'Picture URL'{Picture URL}:'PublishingImage;PictureURL;PictureThumbnailURL','Link URL'{Link URL}:'Path','Line 1'{Line 1}:'Title','Line 2'{Line 2}:'NotificationBodyOWSMTXT','Line 3'{Line 3}:'NotificationStartDateOWSDATE'" />
            <pnp:Property Key="UIVersion" Value='[15]' />
            <pnp:Property Key="TemplateHidden" Value="0" />
            <pnp:Property Key="TargetControlType" Value='["Content Web Parts","SearchResults"]' />
            <pnp:Property Key="DisplayTemplateLevel" Value="Item" />
            <pnp:Property Key="HtmlDesignAssociated" Value="1" />
          </pnp:Properties>
</pnp:File>

2.)Sample for Pagelayout
<pnp:File Src="BootstrapLandingwithrightsidebar.aspx" Folder="{masterpagecatalog}" Overwrite="true">
          <pnp:Properties>
            <pnp:Property Key="ContentTypeId" Value="{contenttypeid:Page Layout}" />
            <pnp:Property Key="PublishingPreviewImage" Value="{site}/Style Library/coxone/images/Landing with right sidebar.png, {site}/Style Library/coxone/images/Landing with right sidebar.png" />
            <pnp:Property Key="PublishingHidden" Value="False" />
            <pnp:Property Key="PublishingAssociatedContentType" Value=";#System Page Layout;#0x01010007FF3E057FA8AB4AA42FCB67B453FFC1;#" />
            <pnp:Property Key="BSN" Value="Microsoft.SharePoint.Client.FieldLookupValue" />
          </pnp:Properties>
</pnp:File>
