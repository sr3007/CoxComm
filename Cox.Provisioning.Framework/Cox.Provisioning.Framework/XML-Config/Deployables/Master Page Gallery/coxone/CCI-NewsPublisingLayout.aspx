<%-- SPG:

This HTML file has been associated with a SharePoint Page Layout (.aspx file) carrying the same name.  While the files remain associated, you will not be allowed to edit the .aspx file, and any rename, move, or deletion operations will be reciprocated.

To build the page layout directly from this HTML file, simply fill in the contents of content placeholders.  Use the Snippet Generator at https://mod174499.sharepoint.com/sites/CoxOne/_layouts/15/ComponentHome.aspx?Url=https%3A%2F%2Fmod174499%2Esharepoint%2Ecom%2Fsites%2FCoxOne%2F%5Fcatalogs%2Fmasterpage%2FCCI%2DNewsPublisingLayout%2Easpx to create and customize additional content placeholders and other useful SharePoint entities, then copy and paste them as HTML snippets into your HTML code.   All updates to this file within content placeholders will automatically sync to the associated page layout.

 --%>
<%@Page language="C#" Inherits="Microsoft.SharePoint.Publishing.PublishingLayoutPage, Microsoft.SharePoint.Publishing, Version=16.0.0.0, Culture=neutral, PublicKeyToken=71e9bce111e9429c" %>
<%@Register TagPrefix="SharePoint" Namespace="Microsoft.SharePoint.WebControls" Assembly="Microsoft.SharePoint, Version=16.0.0.0, Culture=neutral, PublicKeyToken=71e9bce111e9429c"%>
<%@Register TagPrefix="Publishing" Namespace="Microsoft.SharePoint.Publishing.WebControls" Assembly="Microsoft.SharePoint.Publishing, Version=16.0.0.0, Culture=neutral, PublicKeyToken=71e9bce111e9429c"%>
<%@Register TagPrefix="PageFieldTextField" Namespace="Microsoft.SharePoint.WebControls" Assembly="Microsoft.SharePoint, Version=16.0.0.0, Culture=neutral, PublicKeyToken=71e9bce111e9429c"%>
<%@Register TagPrefix="PageFieldRichHtmlField" Namespace="Microsoft.SharePoint.Publishing.WebControls" Assembly="Microsoft.SharePoint.Publishing, Version=16.0.0.0, Culture=neutral, PublicKeyToken=71e9bce111e9429c"%>
<%@Register TagPrefix="PageFieldRichImageField" Namespace="Microsoft.SharePoint.Publishing.WebControls" Assembly="Microsoft.SharePoint.Publishing, Version=16.0.0.0, Culture=neutral, PublicKeyToken=71e9bce111e9429c"%>
<%@Register TagPrefix="PageFieldNoteField" Namespace="Microsoft.SharePoint.WebControls" Assembly="Microsoft.SharePoint, Version=16.0.0.0, Culture=neutral, PublicKeyToken=71e9bce111e9429c"%>
<%@Register TagPrefix="PageFieldBooleanField" Namespace="Microsoft.SharePoint.WebControls" Assembly="Microsoft.SharePoint, Version=16.0.0.0, Culture=neutral, PublicKeyToken=71e9bce111e9429c"%>
<%@Register TagPrefix="PageFieldUrlField" Namespace="Microsoft.SharePoint.WebControls" Assembly="Microsoft.SharePoint, Version=16.0.0.0, Culture=neutral, PublicKeyToken=71e9bce111e9429c"%>
<%@Register TagPrefix="PageFieldDateTimeField" Namespace="Microsoft.SharePoint.WebControls" Assembly="Microsoft.SharePoint, Version=16.0.0.0, Culture=neutral, PublicKeyToken=71e9bce111e9429c"%>
<%@Register TagPrefix="PageFieldTaxonomyFieldControl" Namespace="Microsoft.SharePoint.Taxonomy" Assembly="Microsoft.SharePoint.Taxonomy, Version=16.0.0.0, Culture=neutral, PublicKeyToken=71e9bce111e9429c"%>
<asp:Content runat="server" ContentPlaceHolderID="PlaceHolderFormDigest">
            <SharePoint:FormDigest runat="server" />
        </asp:Content><asp:Content runat="server" ContentPlaceHolderID="PlaceHolderPageTitle">
        </asp:Content><asp:Content runat="server" ContentPlaceHolderID="PlaceHolderAdditionalPageHead">
            
            
            
            <Publishing:EditModePanel runat="server" id="editmodestyles">
                <SharePoint:CssRegistration name="&lt;% $SPUrl:~sitecollection/Style Library/~language/Themable/Core Styles/editmode15.css %&gt;" After="&lt;% $SPUrl:~sitecollection/Style Library/~language/Themable/Core Styles/pagelayouts15.css %&gt;" runat="server">
                </SharePoint:CssRegistration>
            </Publishing:EditModePanel>
            <style type="text/css">
             <!--
            .editmode .ms-formfieldvaluecontainer {border: none;margin-bottom: 0px;}
		    .editmode .ms-formfieldvaluecontainer input[type=text] {height: 10px;}  
		    .editmode .edit-mode-panel,.editmode #s4-workspace{background:#fff;}
		    .editmode .edit-mode-panel div.ms-rte-border-field {margin: 0px 5px;padding: 5px;border: 1px solid #ccc !important;border-radius: 5px;min-height: 100px;width: 400px;}  
		    .editmode .edit-mode-panel .ms-rtestate-field p {margin-bottom: 0px;}   
		    .editmode .edit-mode-panel .ms-rtestate-field p:last-child {margin-bottom: 10px;}
		    h1, h2, h3, h4, h5, h6, .h1, .h2, .h3, .h4, .h5, .h6{color: rgb(53, 53, 55);}
		    .editmode .edit-mode-panel h3.ms-standardheader.Abstract {margin-top: 10px;}
		    .editmode .edit-mode-panel .ms-taxonomy .ms-taxonomy-browser-button{    margin-right: 30px;}
		    .editmode .edit-mode-panel> table h3.section-Header {padding-top: 30px;font-size: 20px;font-weight: 700;}
		    .editmode .edit-mode-panel [data-name="EditModePanelShowInRead"] .panel:first-child {padding: 10px;}
		    .editmode .TitleInput .ms-formfieldvaluecontainer input[type=text] {width: 386px;}
			.editmode .edit-mode-panel .Thumbnail .ms-formfieldvaluecontainer.ms-rte-border-field {border: 0 !important;min-height: auto;margin-left: 0px;padding-left: 0px;width: 412px;}
			.editmode .edit-mode-panel .Thumbnail span[id*=RichImageField]>div {text-align: left;}
			.editmode .edit-mode-panel .Thumbnail span[id*=RichImageField]>div a {color: #008DCD;}
			.editmode .edit-mode-panel td .ms-formfieldcontainer {float: left;}
			.editmode .edit-mode-panel i.fa.fa-info-circle {color: #ccc;font-size: 20px;margin-top: 5px;}
			.editmode .edit-mode-panel .Learn input[type=text], .LearnLink input[type=text] {width: 384px;}
			.editmode .edit-mode-panel .LearnLink td:last-child>h3 {float: left;margin-top: 8px;margin-right: 10px;}
			.editmode .edit-mode-panel input[id*=DateTimeFieldDate] {padding: 12px;width: 140px;}
			.editmode .edit-mode-panel .ms-standardheader{font-size: 13px;}
			.editmode .edit-mode-panel .Comments h3{margin-top:10px;font-size: 13px;} 
			.editmode .edit-mode-panel tr.Thumbnail td:first-child h3 {margin-top: 10px;}	
			#Newsarticle .col-md-9>.panel {padding: 10px;}
		    -->
            </style>
            
        </asp:Content><asp:Content runat="server" ContentPlaceHolderID="PlaceHolderSiteName">
            <SharePoint:SPLinkButton runat="server" NavigateUrl="~site/" id="onetidProjectPropertyTitle1">
            <SharePoint:ProjectProperty Property="Title" runat="server" />
            
            </SharePoint:SPLinkButton>
        </asp:Content><asp:Content runat="server" ContentPlaceHolderID="PlaceHolderSearchArea">
            <div id="searchInputBox">
                <SharePoint:DelegateControl runat="server" ControlId="SmallSearchInputBox" />
                
            </div>
        </asp:Content><asp:Content runat="server" ContentPlaceHolderID="PlaceHolderLeftNavBar">
            <div>
            </div>
            <div>
            </div>
            <div>
            </div>
            <div>
            </div>
            <div>
            </div>
            <div>
            </div>
        </asp:Content><asp:Content runat="server" ContentPlaceHolderID="PlaceHolderPageTitleInTitleArea">
            <SharePoint:SPTitleBreadcrumb runat="server" RenderCurrentNodeAsLink="true" SiteMapProvider="SPContentMapProvider" WelcomePageUsesWebTitle="false">
            <PATHSEPARATORTEMPLATE>
            <SharePoint:ClusteredDirectionalSeparatorArrow runat="server" />
            </PATHSEPARATORTEMPLATE>
            </SharePoint:SPTitleBreadcrumb>
            <script>//<![CDATA[
						var currentUser;
						var userGroups;
			
			            $(document).ready(function(){
			            //some code      
			            //alert('JQuery Loaded!!!');   
							CheckCurrentUserMembership();
							//alert(CCI_Common.GetConfig('COXONENationalGroup'));
							//alert($('input[title="Title"]').val());
							$('input[title="CCI-NewsHeadLine Required Field"]').val($('input[title="Title"]').val());
							$('input[title="Title"]').parentsUntil('tbody').hide();
							$('input[title="CCI-NewsHeadLine Required Field"]').on('input', function() {
								var dInput = this.value;
								$('input[title="Title"]').val(dInput);
							});
							$('.ms-formfieldlabelcontainer').hide();
							$('.ms-formdescription').hide();
							$('input[title="Description"]').hide();
			            });

function CheckCurrentUserMembership() {

    var clientContext = new SP.ClientContext.get_current();
    currentUser = clientContext.get_web().get_currentUser();
    clientContext.load(this.currentUser);

    userGroups = this.currentUser.get_groups();
    clientContext.load(this.userGroups);
    clientContext.executeQueryAsync(OnQuerySucceeded);
}

function OnQuerySucceeded() {
         var isMember = 'Not Member';
         var groupsEnumerator = userGroups.getEnumerator();
          while (groupsEnumerator.moveNext()) {
             var group= groupsEnumerator.get_current();               
             if(group.get_title() == CCI_Common.GetConfig('COXONELocalGroup')) {
                 isMember = 'Local';
                 break;
             }
             if(group.get_title() == CCI_Common.GetConfig('COXONENationalGroup')) {
                 isMember = 'National';
                 break;
             }
          }

          OnResult(isMember);
}

function OnQueryFailed() {
          OnResult('Failed.');
}

function OnResult(result)
{
//alert(result);
if(result === 'Local')
{
$('#divTypeNational').hide();
}
if(result === 'National')
{
$("#divTypeNational").on("click",function(event) {
    var target = $(event.target);
    //if (target.is('input:checkbox')) return;

    var checkbox = $(this).find("input[type='checkbox']");
	if(checkbox.prop("checked"))
	{
		$('#divLocations').hide();
		$('#divLocationLable').hide();
	}
	else
	{
		$('#divLocations').show();		
		$('#divLocationLable').show();
	}
});
}
}
			
			//]]></script>

        </asp:Content><asp:Content runat="server" ContentPlaceHolderID="PlaceHolderMain">
			<div data-name="EditModePanelShowInEdit">
			    
			    
			    <Publishing:EditModePanel runat="server" CssClass="edit-mode-panel">
			        
				    
            <table border="0" cellspacing="0">
            <!--<tr>
            	<td colspan="2"><div class="ms-formfieldlabel"><h2>Edit New Article</h2></div></td>
            </tr>-->
            <tr>
            	<td>
            		<H3 class="ms-standardheader">
						<nobr>Title</nobr>
					</H3>
            	</td>
            	<td valign="top" class="TitleInput" colspan="5">
            		<div>
		                
		                
		                <PageFieldTextField:TextField FieldName="fa564e0f-0c70-4ab9-b863-0177e6ddd247" runat="server">
		                    
		                </PageFieldTextField:TextField>
		                
		            </div>
				</td>
            </tr>
            <tr>
            	<td>
            		<H3 class="ms-standardheader">
						<nobr>Headline</nobr>
					</H3>
            	</td>
            	<td class="TitleInput" colspan="5">
		             <div>
		                
		                
		                <PageFieldTextField:TextField FieldName="c8140bca-e410-4786-b922-89edbc3ad65b" runat="server">
		                    							
		                </PageFieldTextField:TextField>
		                		
						<a><i class="fa fa-info-circle" aria-hidden="true"></i></a>
		            </div>
				</td>
            </tr>
            <tr>
						<td>
							<H3 class="ms-standardheader">
								<nobr>Byline</nobr>
							</H3>
						</td>
						<td colspan="5">
							<div>
				                
				                
				                <PageFieldTextField:TextField FieldName="bdd70c7d-0b79-4999-9ec9-0e3fd8300e77" runat="server">
				                    
				                </PageFieldTextField:TextField>
				                
								<a><i class="fa fa-info-circle" aria-hidden="true"></i></a>
				            </div>
						</td>
			</tr>
			<tr>
						<td valign="top">
							<H3 class="ms-standardheader">
								<nobr>Article Body</nobr>
							</H3>
						</td>
						<td valign="top" colspan="5">
							<div>
				                
				                
				                <PageFieldRichHtmlField:RichHtmlField FieldName="f55c4d88-1f2e-4ad9-aaa8-819af4ee7ee8" runat="server">
				                    
				                </PageFieldRichHtmlField:RichHtmlField>
				                
				            </div>
						</td>
			</tr>
			<tr>
				<td colspan="6"><h3 class="section-Header">Summary Information</h3></td>
			</tr>
			<tr class="Thumbnail">
						<td valign="top">
							<H3 class="ms-standardheader">
								<nobr>Thumbnail</nobr>
							</H3>
						</td>
						<td valign="top" colspan="5">
							<div>
				                
				                
				                <PageFieldRichImageField:RichImageField FieldName="1cf5d76e-d117-4e0c-b46a-9d8ae4803768" runat="server">
				                    
				                </PageFieldRichImageField:RichImageField>
				                
								<a><i class="fa fa-info-circle" aria-hidden="true"></i></a>
				            </div>
						</td>
			</tr>
			<tr>
						<td valign="top">
							<H3 class="ms-standardheader Abstract">
								<nobr>Abstract</nobr>
							</H3>
						</td>
						<td valign="top" colspan="5">
							<div>
				                
				                
				                <PageFieldNoteField:NoteField FieldName="e357446e-3b91-4a35-8ef5-a1a5e06b71d2" runat="server">
				                    
				                </PageFieldNoteField:NoteField>
				                
								<a><i class="fa fa-info-circle" aria-hidden="true"></i></a>
				            </div>
						</td>
			</tr>
			<tr>
						<td>
							<H3 class="ms-standardheader">
								<nobr>Feature (Corousal)</nobr>
							</H3>
						</td>
						<td valign="top" colspan="5">
							<div>
				                
				                
				                <PageFieldBooleanField:BooleanField FieldName="d5789c5a-f497-4edd-97d1-4089212ffb09" runat="server">
				                    
				                </PageFieldBooleanField:BooleanField>
				                
				            </div>
						</td>
			</tr>
			<tr class="Learn">
						<td>
							<H3 class="ms-standardheader">
								<nobr>Learn More Link</nobr>
							</H3>
						</td>
						<td valign="top" colspan="5">
							<div>
				                
				                
				                <PageFieldUrlField:UrlField FieldName="0c32169c-9d28-4525-b4a0-35ddf5fc58c0" runat="server">
				                    
				                </PageFieldUrlField:UrlField>
				                
								<a><i class="fa fa-info-circle" aria-hidden="true"></i></a>
				            </div>
						</td>
			</tr>
			<tr class="LearnLink">
						<td>
							<H3 class="ms-standardheader">
								<nobr>Link Text <br />(corousal only)</nobr>
							</H3>
						</td>
						<td valign="top" colspan="2">
							<div>
				                
				                
				                <PageFieldTextField:TextField FieldName="94807cbf-c474-474f-8102-7a7aceffb338" runat="server">
				                    
				                </PageFieldTextField:TextField>
				                
								<a><i class="fa fa-info-circle" aria-hidden="true"></i></a>
				            </div>
						</td>
						<td colspan="2">
							<H3 class="ms-standardheader">
								<nobr>Hide Learn More</nobr>
							</H3>
							<div>
				                
				                
				                <PageFieldBooleanField:BooleanField FieldName="8d6c4a65-39c7-4553-a1f1-b30b53523850" runat="server">
				                    
				                </PageFieldBooleanField:BooleanField>
				                
				            </div>
						</td>

			</tr>
			<tr>
				<td colspan="6"><h3 class="section-Header">Publishing Information</h3></td>
			</tr>
			<tr>
				<td>
							<H3 class="ms-standardheader">
								<nobr>Publish On</nobr>
							</H3>
						</td>
				<td>
						<div>
			                
			                
			                <PageFieldDateTimeField:DateTimeField FieldName="0dc5253a-fe8e-4fe9-8d1a-723357945f2c" runat="server">
			                    
			                </PageFieldDateTimeField:DateTimeField>
			                
			            </div>				
	            </td>
	            <td>
							<H3 class="ms-standardheader">
								<nobr>Expires On</nobr>
							</H3>
						</td>
						<td valign="top">
							<div>
				                
				                
				                <PageFieldDateTimeField:DateTimeField FieldName="9095f990-1e62-4d1a-8b29-335e6fcb7188" runat="server">
				                    
				                </PageFieldDateTimeField:DateTimeField>
				                
				            </div>		
						</td>
				<td>
							<H3 class="ms-standardheader">
								<nobr>Supress Learn More</nobr>
							</H3>
						</td>
						<td>
							<div>
				                
				                
				                <PageFieldBooleanField:BooleanField FieldName="0c39f165-2fd8-4e69-9534-b52d121ce277" runat="server">
				                    
				                </PageFieldBooleanField:BooleanField>
				                
				            </div>
						</td>

			</tr>
			<tr>
				<td>
							<H3 class="ms-standardheader">
								<nobr>Supress in Trending Articles</nobr>
							</H3>
						</td>
				<td>
							<div>
				                
				                
				                <PageFieldBooleanField:BooleanField FieldName="1e295712-fae7-4d63-b3d3-5c9bec649f18" runat="server">
				                    
				                </PageFieldBooleanField:BooleanField>
				                
				            </div>
	            </td>
	            <td>
							<H3 class="ms-standardheader">
								<nobr>National</nobr>
							</H3>
						</td>
						<td valign="top">
							<div id="divTypeNational">
				                
				                
				                <PageFieldBooleanField:BooleanField FieldName="8b3494b0-72fc-46b2-ad9a-98711c756762" runat="server">
				                    
				                </PageFieldBooleanField:BooleanField>
				                
				            </div>
						</td>
				<td>
							<H3 class="ms-standardheader">
								<nobr>Do Not Archive</nobr>
							</H3>
						</td>
						<td valign="top">
							<div>
				                
				                
				                <PageFieldBooleanField:BooleanField FieldName="eba68525-26a0-4c78-9146-7589c7a34162" runat="server">
				                    
				                </PageFieldBooleanField:BooleanField>
				                
				            </div>
						</td>

			</tr>
			<tr>
				<td colspan="6"><h3 class="section-Header">Tagging Information</h3></td>
			</tr>
			<tr>
				<td>
					<H3 class="ms-standardheader">
						<nobr>Company</nobr>
					</H3>
				</td>
				<td>
					<div>
		                
		                
		                <PageFieldTaxonomyFieldControl:TaxonomyFieldControl FieldName="373ef8f5-fa2c-491e-bc74-d7f9fe066f59" runat="server">
		                    
		                </PageFieldTaxonomyFieldControl:TaxonomyFieldControl>
		                
		            </div>
				</td>
				<td>
					<H3 class="ms-standardheader">
						<nobr>Divisions</nobr>
					</H3>
				</td>
				<td colspan="3">
					<div>
		                
		                
		                <PageFieldTaxonomyFieldControl:TaxonomyFieldControl FieldName="0e0e4eb5-569f-4719-9cff-cf74bf85b973" runat="server">
		                    
		                </PageFieldTaxonomyFieldControl:TaxonomyFieldControl>
		                
		            </div>
				</td>
			</tr>
			<tr>
				<td>
					<H3 class="ms-standardheader">
						<nobr>Product</nobr>
					</H3>
				</td>
				<td>
					<div>
		                
		                
		                <PageFieldTaxonomyFieldControl:TaxonomyFieldControl FieldName="1fd9021c-93fa-4c39-8473-dc10663899cc" runat="server">
		                    
		                </PageFieldTaxonomyFieldControl:TaxonomyFieldControl>
		                
		            </div>
				</td>
				<td>
					<div id="divLocationLable">
					<H3 class="ms-standardheader">
						<nobr>Locations</nobr>
					</H3>
					</div>
				</td>
				<td colspan="3">
					<div id="divLocations">
		                
		                
		                <PageFieldTaxonomyFieldControl:TaxonomyFieldControl FieldName="c2d96589-6611-42ba-b92a-c9c8867627f8" runat="server">
		                    
		                </PageFieldTaxonomyFieldControl:TaxonomyFieldControl>
		                
		            </div>
				</td>
			</tr>
			<tr>
				<td>
					<H3 class="ms-standardheader">
						<nobr>Departments</nobr>
					</H3>
				</td>
				<td>
					<div>
		                
		                
		                <PageFieldTaxonomyFieldControl:TaxonomyFieldControl FieldName="5caa3bc0-78ef-4dee-94db-4dfa6173aa58" runat="server">
		                    
		                </PageFieldTaxonomyFieldControl:TaxonomyFieldControl>
		                
		            </div>
				</td>
				<td>
					<H3 class="ms-standardheader">
						<nobr>Topics</nobr>
					</H3>
				</td>
				<td colspan="3">
					<div>
		                
		                
		                <PageFieldTaxonomyFieldControl:TaxonomyFieldControl FieldName="ee810cbf-661e-4d65-9d88-050b168eac08" runat="server">
		                    
		                </PageFieldTaxonomyFieldControl:TaxonomyFieldControl>
		                
		            </div>
				</td>
			</tr>
			<tr>
				<td>
					<H3 class="ms-standardheader">
						<nobr>Industry News</nobr>
					</H3>
				</td>
				<td>
					 <div>
		                
		                
		                <PageFieldTaxonomyFieldControl:TaxonomyFieldControl FieldName="7772ca5b-3ded-4944-90b6-008945581720" runat="server">
		                    
		                </PageFieldTaxonomyFieldControl:TaxonomyFieldControl>
		                
		            </div>
				</td>
				<td>
					<H3 class="ms-standardheader">
						<nobr>COE</nobr>
					</H3>
				</td>
				<td colspan="3">
					<div>
		                
		                
		                <PageFieldTaxonomyFieldControl:TaxonomyFieldControl FieldName="C4BA2AAB-00D1-496B-812A-5B3AF3DCB3FE" runat="server">
		                    
		                </PageFieldTaxonomyFieldControl:TaxonomyFieldControl>
		                
		            </div>
				</td>
			</tr>
			<tr>
				<td>
					<H3 class="ms-standardheader">
						<nobr>Tags</nobr>
					</H3>
				</td>
				<td colspan="5">
					 <div>
		                
		                
		                <PageFieldTaxonomyFieldControl:TaxonomyFieldControl FieldName="338bcb93-ee06-4f43-8cb3-e0be1e7056fd" runat="server">
		                    
		                </PageFieldTaxonomyFieldControl:TaxonomyFieldControl>
		                
		            </div>
				</td>
			</tr>
			<tr valign="top" class="Comments">
				<td>
					<H3 class="ms-standardheader">
						<nobr>Internal Comments</nobr>
					</H3>
				</td>
				<td colspan="5">
		            <div>
						
						
						<PageFieldNoteField:NoteField FieldName="7b740403-8036-4d4d-9314-e7c0d46b776d" runat="server">
							
						</PageFieldNoteField:NoteField>
						
						<a><i class="fa fa-info-circle" aria-hidden="true"></i></a>
					</div>
				</td>
			</tr>

			</table>

			        
			    </Publishing:EditModePanel>
			    
			</div>        	
			<div data-name="EditModePanelShowInRead">
			    
			    
			    <Publishing:EditModePanel runat="server" PageDisplayMode="Display">
			        
			        <div class="row" id="Newsarticle">
						<div class="col-md-9">
							<div class="panel panel-default clearfix">
								<div class="row news_box top-new-box">
									<div class="box_accordian padd_comon">
										<div class="share_like_row">
											<div class="left_side">

												<h3>
													<div>
														
														
														<PageFieldTextField:TextField FieldName="c8140bca-e410-4786-b922-89edbc3ad65b" runat="server">
															
														</PageFieldTextField:TextField>
														
													</div>
												</h3>
												<div>
												<h5>
													<div>
														
														
														<PageFieldTextField:TextField FieldName="bdd70c7d-0b79-4999-9ec9-0e3fd8300e77" runat="server">
															
														</PageFieldTextField:TextField>
														
													</div>
												</h5></div>
											</div>
										</div>
										<div class="content_row">
											<p>
												Here comes my content row!!!
											</p>
										</div>
									</div>
								</div>
								<div>
									
									
									<PageFieldRichHtmlField:RichHtmlField FieldName="f55c4d88-1f2e-4ad9-aaa8-819af4ee7ee8" runat="server">
										
									</PageFieldRichHtmlField:RichHtmlField>
									
								</div>
							</div>
						</div>
						<!--
						<div class="col-md-4">
							<div class="panel panel-default clearfix">
								Recommended and
								Trending
							</div>	
						</div>					
						-->
					</div>
			        
			    </Publishing:EditModePanel>
			    
			</div>
        </asp:Content>