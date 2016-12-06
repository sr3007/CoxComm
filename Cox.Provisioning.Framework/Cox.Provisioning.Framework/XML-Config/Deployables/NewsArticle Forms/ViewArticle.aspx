	<xsl:template name="dvt_1.body">
		<xsl:param name="Rows"/>
		<!--<tr>
			<td class="ms-toolbar" nowrap="nowrap">
				<table>
					<tr>
						<td width="99%" class="ms-toolbar" nowrap="nowrap"><IMG SRC="/_layouts/15/images/blank.gif" width="1" height="18"/></td>
						<td class="ms-toolbar" nowrap="nowrap" align="right">
							<SharePoint:GoBackButton runat="server" ControlMode="Display" id="gobackbutton1"/>
						</td>
					</tr>
				</table>
			</td>
		</tr>-->
		<tr>
			<td class="ms-toolbar" nowrap="nowrap">
				<SharePoint:FormToolBar runat="server" ControlMode="Display"/>
				<SharePoint:ItemValidationFailedMessage runat="server" ControlMode="Display"/>
			</td>
		</tr>
		<xsl:for-each select="$Rows">
			<xsl:call-template name="dvt_1.rowview"/>
		</xsl:for-each>
		<tr>
			<td class="ms-toolbar" nowrap="nowrap" align="right">
				<table>
					<tr>
						<td class="ms-descriptiontext" nowrap="nowrap">
							<SharePoint:CreatedModifiedInfo ControlMode="Display" runat="server"/>
						</td>
						<td width="99%" class="ms-toolbar" nowrap="nowrap"><IMG SRC="/_layouts/15/images/blank.gif" width="1" height="18"/></td>
						<td class="ms-toolbar" nowrap="nowrap" align="right">
							<SharePoint:GoBackButton runat="server" ControlMode="Display" id="gobackbutton2"/>
						</td>
					</tr>
				</table>
			</td>
		</tr>
	</xsl:template>
	<xsl:template name="dvt_1.rowview">
		<tr>
			<td>
				<table border="0" cellspacing="0" class="NewArticletableHeading">
					<tr>
						<td valign="top" class="ms-formlabel HeadingHeadline">
							<H3 class="ms-standardheader">
								<nobr>Headline</nobr>
							</H3>
						</td>
						<td valign="top" class="ms-formbody HeadingContent">
							<xsl:value-of select="@CCI_x002d_NewsHeadLine"/>
						</td>
					</tr>
					<tr>
						<td valign="top" class="ms-formlabel HeadingHeadline">
							<H3 class="ms-standardheader">
								<nobr>Byline</nobr>
							</H3>
						</td>
						<td valign="top" class="ms-formbody HeadingContent">
							<xsl:value-of select="@CCI_x002d_Byline"/>
						</td>
					</tr>
					<tr>
						<td valign="top" class="ms-formlabel HeadingHeadline">
							<H3 class="ms-standardheader">
								<nobr>Body - WYSIWYG</nobr>
							</H3>
						</td>
						<td valign="top" class="ms-formbody HeadingContent">
							<xsl:value-of select="@CCI_x002d_Body" disable-output-escaping="yes"/>
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
							<xsl:value-of select="@CCI_x002d_NewsArticleImage" disable-output-escaping="yes"/>
						</td>
					</tr>
					<tr>
						<td valign="top" class="ms-formlabel HeadingHeadline">
							<H3 class="ms-standardheader">
								<nobr>Description for Apps</nobr>
							</H3>
						</td>
						<td valign="top" class="ms-formbody HeadingContent">
							<xsl:value-of select="@CCI_x002d_Description"/>
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
							<xsl:choose>
								<xsl:when test="@CCI_x002d_FeaturedArticle='1' or msxsl:string-compare(string(@CCI_x002d_FeaturedArticle),'Yes','','i')=0 or msxsl:string-compare(string(@CCI_x002d_FeaturedArticle),'True','','i')=0">Yes</xsl:when>
								<xsl:otherwise>No</xsl:otherwise>
							</xsl:choose>
						</td> 
						<td valign="top" class="ms-formlabel HeadingHeadline">
							<H3 class="ms-standardheader">
								<nobr>Do Not Archive</nobr>
							</H3>
						</td>
						<td valign="top" class="ms-formbody HeadingContent">
							<xsl:choose>
								<xsl:when test="@CCI_x002d_DoNotArchive='1' or msxsl:string-compare(string(@CCI_x002d_DoNotArchive),'Yes','','i')=0 or msxsl:string-compare(string(@CCI_x002d_DoNotArchive),'True','','i')=0">Yes</xsl:when>
								<xsl:otherwise>No</xsl:otherwise>
							</xsl:choose>
						</td>
						<td valign="top" class="ms-formlabel HeadingHeadline">
							<H3 class="ms-standardheader">
								<nobr>Trending Suppression</nobr>
							</H3>
						</td>
						<td valign="top" class="ms-formbody HeadingContent">
							<xsl:choose>
								<xsl:when test="@CCI_x002d_TrendingSuppression='1' or msxsl:string-compare(string(@CCI_x002d_TrendingSuppression),'Yes','','i')=0 or msxsl:string-compare(string(@CCI_x002d_TrendingSuppression),'True','','i')=0">Yes</xsl:when>
								<xsl:otherwise>No</xsl:otherwise>
							</xsl:choose>
						</td>
						<td valign="top" class="ms-formlabel HeadingHeadline">
							<H3 class="ms-standardheader">
								<nobr>Type National</nobr>
							</H3>
						</td>
						<td valign="top" class="ms-formbody HeadingContent">
							<xsl:choose>
								<xsl:when test="@CCI_x002d_TypeNational='1' or msxsl:string-compare(string(@CCI_x002d_TypeNational),'Yes','','i')=0 or msxsl:string-compare(string(@CCI_x002d_TypeNational),'True','','i')=0">Yes</xsl:when>
								<xsl:otherwise>No</xsl:otherwise>
							</xsl:choose>
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
							<a href="{substring-before(@CCI_x002d_LearnMoreLink, ', ')}">
								<xsl:value-of select="substring-after(@CCI_x002d_LearnMoreLink, ', ')"/>
							</a>
						</td>
						<td valign="top" class="ms-formlabel HeadingHeadline" style="margin-left: 50px;float: left;">
							<H3 class="ms-standardheader">
								<nobr>News Published Date</nobr>
							</H3>
						</td>
						<td valign="top" class="ms-formbody HeadingContent contentcal">
							<xsl:value-of select="@CCI_x002d_NewsPublishedDate"/>
						</td>
						<td valign="top" class="ms-formlabel HeadingHeadline headingCal">
							<H3 class="ms-standardheader">
								<nobr>Expires</nobr>
							</H3>
						</td>
						<td valign="top" class="ms-formbody HeadingContent contentcal">
							<xsl:value-of select="@Expires"/>						
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
							<xsl:value-of select="@CCI_x002d_LearnMoreTitle"/>
						</td>
						<td valign="top" class="ms-formlabel HeadingHeadline HeadingHeadtext">
							<H3 class="ms-standardheader">
								<nobr>Suppress Learn More</nobr>
							</H3>
						</td>
						<td valign="top" class="ms-formbody HeadingContent headingContentinput">
							<xsl:choose>
								<xsl:when test="@CCI_x002d_SuppressLearnMore='1' or msxsl:string-compare(string(@CCI_x002d_SuppressLearnMore),'Yes','','i')=0 or msxsl:string-compare(string(@CCI_x002d_SuppressLearnMore),'True','','i')=0">Yes</xsl:when>
								<xsl:otherwise>No</xsl:otherwise>
							</xsl:choose>
						</td>
						<td valign="top" class="ms-formlabel HeadingHeadline pull-left">
							<H3 class="ms-standardheader">
								<nobr>Hide Learn More</nobr>
							</H3>
						</td>
						<td valign="top" class="ms-formbody HeadingContent headingContentinput">
							<xsl:choose>
								<xsl:when test="@CCI_x002d_HideLearnMore='1' or msxsl:string-compare(string(@CCI_x002d_HideLearnMore),'Yes','','i')=0 or msxsl:string-compare(string(@CCI_x002d_HideLearnMore),'True','','i')=0">Yes</xsl:when>
								<xsl:otherwise>No</xsl:otherwise>
							</xsl:choose>
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
							<xsl:value-of select="@CCI_x002d_COE"/>
						</td>
						<td valign="top" class="ms-formlabel HeadingHeadline">
							<H3 class="ms-standardheader">
								<nobr>Departments</nobr>
							</H3>
						</td>
						<td  valign="top" class="ms-formbody HeadingContent">
							<xsl:value-of select="@CCI_x002d_Departments"/>
						</td>
					</tr>
					<tr>
						<td valign="top" class="ms-formlabel HeadingHeadline">
							<H3 class="ms-standardheader">
								<nobr>Division</nobr>
							</H3>
						</td>
						<td valign="top" class="ms-formbody HeadingContent">
							<xsl:value-of select="@CCI_x002d_Division"/>
						</td>
						<td valign="top" class="ms-formlabel HeadingHeadline">
							<H3 class="ms-standardheader">
								<nobr>Industry</nobr>
							</H3>
						</td>
						<td valign="top" class="ms-formbody HeadingContent">
							<xsl:value-of select="@CCI_x002d_Industry"/>
						</td>
					</tr>
					<tr>
						<td valign="top" class="ms-formlabel HeadingHeadline">
							<H3 class="ms-standardheader">
								<nobr>Locations</nobr>
							</H3>
						</td>
						<td valign="top" class="ms-formbody HeadingContent">
							<xsl:value-of select="@CCI_x002d_Locations"/>
						</td>
						<td valign="top" class="ms-formlabel HeadingHeadline">
							<H3 class="ms-standardheader">
								<nobr>Product</nobr>
							</H3>
						</td>
						<td  valign="top" class="ms-formbody HeadingContent">
							<xsl:value-of select="@CCI_x002d_Product"/>
						</td>
					</tr>
					<tr>
						<td valign="top" class="ms-formlabel HeadingHeadline">
							<H3 class="ms-standardheader">
								<nobr>Topics</nobr>
							</H3>
						</td>
						<td valign="top" class="ms-formbody HeadingContent">
							<xsl:value-of select="@CCI_x002d_Topics"/>
						</td>					
						<td valign="top" class="ms-formlabel HeadingHeadline">
							<H3 class="ms-standardheader">
								<nobr>Companies</nobr>
							</H3>
						</td>
						<td valign="top" class="ms-formbody HeadingContent">
							<xsl:value-of select="@CCI_x002d_Companies"/>
						</td>
					</tr>
					<tr>
						<td valign="top" class="ms-formlabel HeadingHeadline">
							<H3 class="ms-standardheader">
								<nobr>Tags</nobr>
							</H3>
						</td>
						<td valign="top" class="ms-formbody HeadingContent">
							<xsl:value-of select="@CCI_x002d_NewsTags"/>
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
							<xsl:value-of select="@CCI_x002d_NewsComments"/>
						</td>
					</tr>
				</table>
				<table border="0" cellspacing="0" class="MetadataContent4 lastItemmargin">
					<tr id="idAttachmentsRow">
						<td nowrap="true" valign="top" class="ms-formlabel HeadingHeadline">
							<SharePoint:FieldLabel ControlMode="Display" FieldName="Attachments" runat="server"/>
						</td>
						<td valign="top" class="ms-formbody HeadingContent">
							<SharePoint:FormField runat="server" id="AttachmentsField" ControlMode="Display" FieldName="Attachments" __designer:bind="{ddwrt:DataBind('u','AttachmentsField','Value','ValueChanged','ID',ddwrt:EscapeDelims(string(@ID)),'@Attachments')}"/>
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
	<xsl:template name="dvt_1.empty">
		<xsl:variable name="dvt_ViewEmptyText">There are no items to show in this view.</xsl:variable>
		<table border="0" width="100%">
			<tr>
				<td class="ms-vb">
					<xsl:value-of select="$dvt_ViewEmptyText"/>
				</td>
			</tr>
		</table>
	</xsl:template>
</xsl:stylesheet>	</Xsl>
