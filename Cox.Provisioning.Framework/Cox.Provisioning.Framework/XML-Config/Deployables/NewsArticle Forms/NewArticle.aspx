<xsl:template name="dvt_1.body">
		<xsl:param name="Rows"/>
		<!--<tr>
			<td class="ms-toolbar" nowrap="nowrap">
				<table>
					<tr>
						<td width="99%" class="ms-toolbar" nowrap="nowrap"><IMG SRC="/_layouts/15/images/blank.gif" width="1" height="18"/></td>
						<td class="ms-toolbar" nowrap="nowrap">
							<SharePoint:SaveButton runat="server" ControlMode="New" id="savebutton1"/>
						</td>
						<td class="ms-separator"> </td>
						<td class="ms-toolbar" nowrap="nowrap" align="right">
							<SharePoint:GoBackButton runat="server" ControlMode="New" id="gobackbutton1"/>
						</td>
					</tr>
				</table>
			</td>
		</tr>-->
		<tr>
			<td class="ms-toolbar" nowrap="nowrap">
				<SharePoint:FormToolBar runat="server" ControlMode="New"/>
				<SharePoint:ItemValidationFailedMessage runat="server" ControlMode="New"/>
			</td>
		</tr>
		<xsl:call-template name="dvt_1.rowedit"/>
		<tr>
			<td class="ms-toolbar" nowrap="nowrap" align="right">
				<table>
					<tr>
						<td width="99%" class="ms-toolbar" nowrap="nowrap"><IMG SRC="/_layouts/15/images/blank.gif" width="1" height="18"/></td>
						<td class="ms-toolbar" nowrap="nowrap">
							<SharePoint:SaveButton runat="server" ControlMode="New" id="savebutton2"/>
						</td>
						<td class="ms-separator"> </td>
						<td class="ms-toolbar" nowrap="nowrap" align="right">
							<SharePoint:GoBackButton runat="server" ControlMode="New" id="gobackbutton2"/>
						</td>
					</tr>
				</table>
			</td>
		</tr>
	</xsl:template>
	
	<xsl:template name="dvt_1.rowedit">
		<xsl:param name="Pos" select="position()"/>
		<tr>
			<td>
				<table border="0" cellspacing="0" class="NewArticletableHeading">
					<tr>
						<td valign="top" class="ms-formlabel HeadingHeadline">
							<H3 class="ms-standardheader">
								<nobr>Title</nobr>
							</H3>
						</td>
						<td valign="top" class="ms-formbody HeadingContent">
							<SharePoint:FormField runat="server" id="ff0{$Pos}" ControlMode="New" FieldName="Title" __designer:bind="{ddwrt:DataBind('i',concat('ff0',$Pos),'Value','ValueChanged','ID',ddwrt:EscapeDelims(string(@ID)),'@Title')}"/>
							<script>
							$(&quot;input[title=&apos;Title&apos;]&quot;).closest(&apos;tr&apos;).hide();
							</script>
						</td>
					</tr>
					<tr>
						<td valign="top" class="ms-formlabel HeadingHeadline">
							<H3 class="ms-standardheader">
								<nobr>Headline</nobr>
							</H3>
						</td>
						<td valign="top" class="ms-formbody HeadingContent">
							<SharePoint:FormField runat="server" id="ff1{$Pos}" ControlMode="New" FieldName="CCI_x002d_NewsHeadLine" __designer:bind="{ddwrt:DataBind('i',concat('ff1',$Pos),'Value','ValueChanged','ID',ddwrt:EscapeDelims(string(@ID)),'@CCI_x002d_NewsHeadLine')}"/>
							<script>
								$(&quot;input[title=&apos;CCI-NewsHeadLine&apos;]&quot;).on(&quot;input&quot;, function() {
  var dInput = this.value;
  //console.log(dInput);
  $(&quot;input[title=&apos;Title&apos;]&quot;).val(dInput);
});
							</script>
						</td>
					</tr>
					<tr>
						<td valign="top" class="ms-formlabel HeadingHeadline">
							<H3 class="ms-standardheader">
								<nobr>Byline</nobr>
							</H3>
						</td>
						<td valign="top" class="ms-formbody HeadingContent">
							<SharePoint:FormField runat="server" id="ff4{$Pos}" ControlMode="New" FieldName="CCI_x002d_Byline" __designer:bind="{ddwrt:DataBind('i',concat('ff4',$Pos),'Value','ValueChanged','ID',ddwrt:EscapeDelims(string(@ID)),'@CCI_x002d_Byline')}"/>
						</td>
					</tr>
					<tr>
						<td valign="top" class="ms-formlabel HeadingHeadline">
							<H3 class="ms-standardheader">
								<nobr>Body - WYSIWYG</nobr>
							</H3>
						</td>
						<td valign="top" class="ms-formbody HeadingContent">
							<SharePoint:FormField runat="server" id="ff2{$Pos}" ControlMode="New" FieldName="CCI_x002d_Body" __designer:bind="{ddwrt:DataBind('i',concat('ff2',$Pos),'Value','ValueChanged','ID',ddwrt:EscapeDelims(string(@ID)),'@CCI_x002d_Body')}"/>
						</td>
					</tr>
				</table>
				<table border="0" cellspacing="0" class="PictureSection">
					<tr>
						<td valign="top" class="ms-formlabel HeadingHeadline">
							<H3 class="ms-standardheader">
								<nobr>Article Image for Apps</nobr>
							</H3>
						</td>
						<td valign="top" class="ms-formbody HeadingContent">
							<SharePoint:FormField runat="server" id="ff5{$Pos}" ControlMode="New" FieldName="CCI_x002d_NewsArticleImage" __designer:bind="{ddwrt:DataBind('i',concat('ff5',$Pos),'Value','ValueChanged','ID',ddwrt:EscapeDelims(string(@ID)),'@CCI_x002d_NewsArticleImage')}"/>
						</td>
					</tr>
					<tr>
						<td valign="top" class="ms-formlabel HeadingHeadline">
							<H3 class="ms-standardheader">
								<nobr>Description for Apps</nobr>
							</H3>
						</td>
						<td valign="top" class="ms-formbody HeadingContent">
							<SharePoint:FormField runat="server" id="ff3{$Pos}" ControlMode="New" FieldName="CCI_x002d_Description" __designer:bind="{ddwrt:DataBind('i',concat('ff3',$Pos),'Value','ValueChanged','ID',ddwrt:EscapeDelims(string(@ID)),'@CCI_x002d_Description')}"/>
						</td>
					</tr>
				</table>
				<table border="0" cellspacing="0" class="MetadataSection">
					<tr>
						<td><a href="#" onclick="javascript:showHideMetadata();">Hide App Metadata</a></td>
					</tr>
				</table>
				<table border="0" cellspacing="0" class="MetadataContent">
					<tr>
						<td valign="top" class="ms-formlabel HeadingHeadline">
							<H3 class="ms-standardheader">
								<nobr>Featured Article</nobr>
							</H3>
						</td>
						<td valign="top" class="ms-formbody HeadingContent">
							<SharePoint:FormField runat="server" id="ff6{$Pos}" ControlMode="New" FieldName="CCI_x002d_FeaturedArticle" __designer:bind="{ddwrt:DataBind('i',concat('ff6',$Pos),'Value','ValueChanged','ID',ddwrt:EscapeDelims(string(@ID)),'@CCI_x002d_FeaturedArticle')}"/>
						</td>
						<td valign="top" class="ms-formlabel HeadingHeadline">
							<H3 class="ms-standardheader">
								<nobr>Do Not Archive</nobr>
							</H3>
						</td>
						<td valign="top" class="ms-formbody HeadingContent">
							<SharePoint:FormField runat="server" id="ff7{$Pos}" ControlMode="New" FieldName="CCI_x002d_DoNotArchive" __designer:bind="{ddwrt:DataBind('i',concat('ff7',$Pos),'Value','ValueChanged','ID',ddwrt:EscapeDelims(string(@ID)),'@CCI_x002d_DoNotArchive')}"/>
						</td>
						<td valign="top" class="ms-formlabel HeadingHeadline">
							<H3 class="ms-standardheader">
								<nobr>Trending Suppression</nobr>
							</H3>
						</td>
						<td valign="top" class="ms-formbody HeadingContent">
							<SharePoint:FormField runat="server" id="ff8{$Pos}" ControlMode="New" FieldName="CCI_x002d_TrendingSuppression" __designer:bind="{ddwrt:DataBind('i',concat('ff8',$Pos),'Value','ValueChanged','ID',ddwrt:EscapeDelims(string(@ID)),'@CCI_x002d_TrendingSuppression')}"/>
						</td>
						<td valign="top" class="ms-formlabel HeadingHeadline">
							<H3 class="ms-standardheader">
								<nobr>Type National</nobr>
							</H3>
						</td>
						<td valign="top" class="ms-formbody HeadingContent">
							<SharePoint:FormField runat="server" id="ff9{$Pos}" ControlMode="New" FieldName="CCI_x002d_TypeNational" __designer:bind="{ddwrt:DataBind('i',concat('ff9',$Pos),'Value','ValueChanged','ID',ddwrt:EscapeDelims(string(@ID)),'@CCI_x002d_TypeNational')}"/>
						</td>
					</tr>
				</table>
				<table border="0" cellspacing="0" class="MetadataContent1">
					<tr>
						<td valign="top" class="ms-formlabel HeadingHeadline">
							<H3 class="ms-standardheader">
								<nobr>Learn More Link</nobr>
							</H3>
						</td>
						<td valign="top" class="ms-formbody HeadingContent">
							<SharePoint:FormField runat="server" id="ff10{$Pos}" ControlMode="New" FieldName="CCI_x002d_LearnMoreLink" __designer:bind="{ddwrt:DataBind('i',concat('ff10',$Pos),'Value','ValueChanged','ID',ddwrt:EscapeDelims(string(@ID)),'@CCI_x002d_LearnMoreLink')}"/>
						</td>
						<td valign="top" class="ms-formlabel HeadingHeadline">
							<H3 class="ms-standardheader">
								<nobr>News Published Date</nobr>
							</H3>
						</td>
						<td valign="top" class="ms-formbody HeadingContent contentcal">
							<SharePoint:FormField runat="server" id="ff12{$Pos}" ControlMode="New" FieldName="CCI_x002d_NewsPublishedDate" __designer:bind="{ddwrt:DataBind('i',concat('ff12',$Pos),'Value','ValueChanged','ID',ddwrt:EscapeDelims(string(@ID)),'@CCI_x002d_NewsPublishedDate')}"/>
						</td>
						<td valign="top" class="ms-formlabel HeadingHeadline headingCal">
							<H3 class="ms-standardheader">
								<nobr>Expires</nobr>
							</H3>
						</td>
						<td valign="top" class="ms-formbody HeadingContent contentcal">
							<SharePoint:FormField runat="server" id="ff30{$Pos}" ControlMode="New" FieldName="Expires" __designer:bind="{ddwrt:DataBind('i',concat('ff30',$Pos),'Value','ValueChanged','ID',ddwrt:EscapeDelims(string(@ID)),'@Expires')}"/>
						</td>
					</tr>
				</table>
				<table border="0" cellspacing="0" class="MetadataContent2">
					<tr>
						<td valign="top" class="ms-formlabel HeadingHeadline">
							<H3 class="ms-standardheader">
								<nobr>Learn More Title</nobr>
							</H3>
						</td>
						<td valign="top" class="ms-formbody HeadingContent headingContenttext">
							<SharePoint:FormField runat="server" id="ff15{$Pos}" ControlMode="New" FieldName="CCI_x002d_LearnMoreTitle" __designer:bind="{ddwrt:DataBind('i',concat('ff15',$Pos),'Value','ValueChanged','ID',ddwrt:EscapeDelims(string(@ID)),'@CCI_x002d_LearnMoreTitle')}"/>
						</td>
						<td valign="top" class="ms-formlabel HeadingHeadline HeadingHeadtext">
							<H3 class="ms-standardheader">
								<nobr>Suppress Learn More</nobr>
							</H3>
						</td>
						<td valign="top" class="ms-formbody HeadingContent headingContentinput">
							<SharePoint:FormField runat="server" id="ff13{$Pos}" ControlMode="New" FieldName="CCI_x002d_SuppressLearnMore" __designer:bind="{ddwrt:DataBind('i',concat('ff13',$Pos),'Value','ValueChanged','ID',ddwrt:EscapeDelims(string(@ID)),'@CCI_x002d_SuppressLearnMore')}"/>
						</td>
						<td valign="top" class="ms-formlabel HeadingHeadline pull-left">
							<H3 class="ms-standardheader">
								<nobr>Hide Learn More</nobr>
							</H3>
						</td>
						<td valign="top" class="ms-formbody HeadingContent headingContentinput">
							<SharePoint:FormField runat="server" id="ff14{$Pos}" ControlMode="New" FieldName="CCI_x002d_HideLearnMore" __designer:bind="{ddwrt:DataBind('i',concat('ff14',$Pos),'Value','ValueChanged','ID',ddwrt:EscapeDelims(string(@ID)),'@CCI_x002d_HideLearnMore')}"/>
						</td>
					</tr>
				</table>
				<table border="0" cellspacing="0" class="MetadataContent3"> 
					<tr>
						<td valign="top" class="ms-formlabel HeadingHeadline">
							<H3 class="ms-standardheader">
								<nobr>COE</nobr>
							</H3>
						</td>
						<td valign="top" class="ms-formbody HeadingContent">
							<SharePoint:FormField runat="server" id="ff16{$Pos}" ControlMode="New" FieldName="CCI_x002d_COE" __designer:bind="{ddwrt:DataBind('i',concat('ff16',$Pos),'Value','ValueChanged','ID',ddwrt:EscapeDelims(string(@ID)),'@CCI_x002d_COE')}"/>
						</td>
						<td valign="top" class="ms-formlabel HeadingHeadline">
							<H3 class="ms-standardheader">
								<nobr>Departments</nobr>
							</H3>
						</td>
						<td valign="top" class="ms-formbody HeadingContent">
							<SharePoint:FormField runat="server" id="ff17{$Pos}" ControlMode="New" FieldName="CCI_x002d_Departments" __designer:bind="{ddwrt:DataBind('i',concat('ff17',$Pos),'Value','ValueChanged','ID',ddwrt:EscapeDelims(string(@ID)),'@CCI_x002d_Departments')}"/>
						</td>
					</tr>
				</table>
				<table border="0" cellspacing="0" class="MetadataContent3">
					<tr>
						<td valign="top" class="ms-formlabel HeadingHeadline">
							<H3 class="ms-standardheader">
								<nobr>Division</nobr>
							</H3>
						</td>
						<td valign="top" class="ms-formbody HeadingContent">
							<SharePoint:FormField runat="server" id="ff18{$Pos}" ControlMode="New" FieldName="CCI_x002d_Division" __designer:bind="{ddwrt:DataBind('i',concat('ff18',$Pos),'Value','ValueChanged','ID',ddwrt:EscapeDelims(string(@ID)),'@CCI_x002d_Division')}"/>
						</td>
						<td valign="top" class="ms-formlabel HeadingHeadline">
							<H3 class="ms-standardheader">
								<nobr>Industry</nobr>
							</H3>
						</td>
						<td valign="top" class="ms-formbody HeadingContent">
							<SharePoint:FormField runat="server" id="ff19{$Pos}" ControlMode="New" FieldName="CCI_x002d_Industry" __designer:bind="{ddwrt:DataBind('i',concat('ff19',$Pos),'Value','ValueChanged','ID',ddwrt:EscapeDelims(string(@ID)),'@CCI_x002d_Industry')}"/>
						</td>
					</tr>
				</table>
				<table border="0" cellspacing="0" class="MetadataContent3">
					<tr>
						<td valign="top" class="ms-formlabel HeadingHeadline">
							<H3 class="ms-standardheader">
								<nobr>Locations</nobr>
							</H3>
						</td>
						<td valign="top" class="ms-formbody HeadingContent">
							<SharePoint:FormField runat="server" id="ff20{$Pos}" ControlMode="New" FieldName="CCI_x002d_Locations" __designer:bind="{ddwrt:DataBind('i',concat('ff20',$Pos),'Value','ValueChanged','ID',ddwrt:EscapeDelims(string(@ID)),'@CCI_x002d_Locations')}"/>
						</td>
						<td valign="top" class="ms-formlabel HeadingHeadline">
							<H3 class="ms-standardheader">
								<nobr>Product</nobr>
							</H3>
						</td>
						<td valign="top" class="ms-formbody HeadingContent">
							<SharePoint:FormField runat="server" id="ff21{$Pos}" ControlMode="New" FieldName="CCI_x002d_Product" __designer:bind="{ddwrt:DataBind('i',concat('ff21',$Pos),'Value','ValueChanged','ID',ddwrt:EscapeDelims(string(@ID)),'@CCI_x002d_Product')}"/>
						</td>
					</tr>
				</table>
				<table border="0" cellspacing="0" class="MetadataContent3">
					<tr>
						<td valign="top" class="ms-formlabel HeadingHeadline">
							<H3 class="ms-standardheader">
								<nobr>Topics</nobr>
							</H3>
						</td>
						<td valign="top" class="ms-formbody HeadingContent">
							<SharePoint:FormField runat="server" id="ff22{$Pos}" ControlMode="New" FieldName="CCI_x002d_Topics" __designer:bind="{ddwrt:DataBind('i',concat('ff22',$Pos),'Value','ValueChanged','ID',ddwrt:EscapeDelims(string(@ID)),'@CCI_x002d_Topics')}"/>
						</td>
						<td valign="top" class="ms-formlabel HeadingHeadline">
							<H3 class="ms-standardheader">
								<nobr>Companies</nobr>
							</H3>
						</td>
						<td valign="top" class="ms-formbody HeadingContent">
							<SharePoint:FormField runat="server" id="ff23{$Pos}" ControlMode="New" FieldName="CCI_x002d_Companies" __designer:bind="{ddwrt:DataBind('i',concat('ff23',$Pos),'Value','ValueChanged','ID',ddwrt:EscapeDelims(string(@ID)),'@CCI_x002d_Companies')}"/>
						</td>
					</tr>
				</table>
				<table border="0" cellspacing="0" class="MetadataContent3">
					<tr>
						<td valign="top" class="ms-formlabel HeadingHeadline">
							<H3 class="ms-standardheader">
								<nobr>Tags</nobr>
							</H3>
						</td>
						<td valign="top" class="ms-formbody HeadingContent">
							<SharePoint:FormField runat="server" id="ff24{$Pos}" ControlMode="New" FieldName="CCI_x002d_NewsTags" __designer:bind="{ddwrt:DataBind('i',concat('ff24',$Pos),'Value','ValueChanged','ID',ddwrt:EscapeDelims(string(@ID)),'@CCI_x002d_NewsTags')}"/>
							<SharePoint:FieldDescription runat="server" id="ff24description{$Pos}" FieldName="CCI_x002d_NewsTags" ControlMode="New"/>
						</td>
					</tr>
				</table>
				<table border="0" cellspacing="0" class="MetadataContent4">
					<tr>
						<td valign="top" class="ms-formlabel HeadingHeadline">
							<H3 class="ms-standardheader">
								<nobr>Comments</nobr>
							</H3>
						</td>
						<td valign="top" class="ms-formbody HeadingContent">
							<SharePoint:FormField runat="server" id="ff11{$Pos}" ControlMode="New" FieldName="CCI_x002d_NewsComments" __designer:bind="{ddwrt:DataBind('i',concat('ff11',$Pos),'Value','ValueChanged','ID',ddwrt:EscapeDelims(string(@ID)),'@CCI_x002d_NewsComments')}"/>
						</td>
					</tr>
				</table>
				<table border="0" cellspacing="0" class="MetadataContent4 lastItemmargin">
					<tr id="idAttachmentsRow">
						<td nowrap="true" valign="top" class="ms-formlabel HeadingHeadline">
							<SharePoint:FieldLabel ControlMode="New" FieldName="Attachments" runat="server"/>
						</td>
						<td valign="top" class="ms-formbody HeadingContent">
							<SharePoint:FormField runat="server" id="AttachmentsField" ControlMode="New" FieldName="Attachments" __designer:bind="{ddwrt:DataBind('i','AttachmentsField','Value','ValueChanged','ID',ddwrt:EscapeDelims(string(@ID)),'@Attachments')}"/>
							<script>
          var elm = document.getElementById(&quot;idAttachmentsTable&quot;);
          if (elm == null || elm.rows.length == 0)
          document.getElementById(&quot;idAttachmentsRow&quot;).style.display=&apos;none&apos;;
        </script>
						</td>
					</tr>
					<xsl:if test="$dvt_1_automode = '1'" ddwrt:cf_ignore="1">
						<tr>
							<td colspan="99" class="ms-vb">
								<span ddwrt:amkeyfield="ID" ddwrt:amkeyvalue="ddwrt:EscapeDelims(string(@ID))" ddwrt:ammode="view"></span>
							</td>
						</tr>
					</xsl:if>
				</table>
			</td>
		</tr>
	</xsl:template>
</xsl:stylesheet>	</Xsl>
