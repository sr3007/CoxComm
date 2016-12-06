<%@ Page Language="C#" AutoEventWireup="true" CodeBehind="Default.aspx.cs" Inherits="Cox.Provisioning.AsyncWeb.Default" enableViewStateMac="false" EnableEventValidation="false" %>

<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">

<html xmlns="http://www.w3.org/1999/xhtml">
<head runat="server">
    <title>Subsite Online Request Creation Form</title>
    <script type="text/javascript" src="../Scripts/jquery-1.9.1.js"></script>
    <script type="text/javascript" src="../Scripts/app.js"></script>

    <style type="text/css">
        #errmsg_phone {
            color: red;
        }
        .descriptionCSS{
            font-size:small;
        }
        .required h3:after {
            color: #e32;
            content: ' *';
            display: inline;
            font-weight: bold;
        }
    </style>
</head>
<body style="overflow: auto;">
    <form id="form1" runat="server" >
        <asp:ScriptManager ID="ScriptManager1" runat="server" EnableCdn="True" AsyncPostBackTimeout="2000" />
        <div id="divSPChrome"></div>
        <asp:UpdateProgress ID="progress" runat="server" AssociatedUpdatePanelID="update" DynamicLayout="true">
            <ProgressTemplate>
                <div id="divWaitingPanel" style="position: absolute; z-index: 3; background: rgb(255, 255, 255); width: 100%; bottom: 0px; top: 0px;">
                    <div style="top: 40%; position: absolute; left: 50%; margin-left: -150px;">
                        <img alt="Working on it" src="data:image/gif;base64,R0lGODlhEAAQAIAAAFLOQv///yH/C05FVFNDQVBFMi4wAwEAAAAh+QQFCgABACwJAAIAAgACAAACAoRRACH5BAUKAAEALAwABQACAAIAAAIChFEAIfkEBQoAAQAsDAAJAAIAAgAAAgKEUQAh+QQFCgABACwJAAwAAgACAAACAoRRACH5BAUKAAEALAUADAACAAIAAAIChFEAIfkEBQoAAQAsAgAJAAIAAgAAAgKEUQAh+QQFCgABACwCAAUAAgACAAACAoRRACH5BAkKAAEALAIAAgAMAAwAAAINjAFne8kPo5y02ouzLQAh+QQJCgABACwCAAIADAAMAAACF4wBphvID1uCyNEZM7Ov4v1p0hGOZlAAACH5BAkKAAEALAIAAgAMAAwAAAIUjAGmG8gPW4qS2rscRPp1rH3H1BUAIfkECQoAAQAsAgACAAkADAAAAhGMAaaX64peiLJa6rCVFHdQAAAh+QQJCgABACwCAAIABQAMAAACDYwBFqiX3mJjUM63QAEAIfkECQoAAQAsAgACAAUACQAAAgqMARaol95iY9AUACH5BAkKAAEALAIAAgAFAAUAAAIHjAEWqJeuCgAh+QQJCgABACwFAAIAAgACAAACAoRRADs=" style="width: 32px; height: 32px;" />
                        <span class="ms-accentText" style="font-size: 36px;">&nbsp;Working on it...</span>
                    </div>
                </div>
            </ProgressTemplate>
        </asp:UpdateProgress>
        <asp:UpdatePanel ID="update" runat="server" ChildrenAsTriggers="true">
            <ContentTemplate>
                <asp:MultiView ID="processViews" runat="server" ActiveViewIndex="0">
                    <asp:View ID="RequestView" runat="server">
                        <div style="width: 450px; margin-left: 50px;">
                            <div id="divFieldTitle" style="display: table;" >
                                <h3 class="ms-core-form-line">Give title for the Subsite</h3>
                                <div class="ms-core-form-line" >
                                    <asp:TextBox ID="txtTitle" runat="server" CssClass="ms-fullWidth"></asp:TextBox>
                                    <asp:RequiredFieldValidator ID="rfv_SiteName" runat="server" ForeColor="Red" Text="*" ControlToValidate="txtTitle" ErrorMessage="SubSite Name is required" EnableClientScript="true" SetFocusOnError="true"></asp:RequiredFieldValidator>
                                </div>
                                <h3 class="ms-core-form-line">URL name</h3>
                                <div style="float: left; white-space: nowrap; padding-bottom: 10px; width: 450px;">
                                    <div style="width: 320px; font-size: 13px; float: left; padding-top: 2px;" id="divBasePath">
                                        <asp:Label ID="lblBasePath" runat="server"></asp:Label>
                                    </div>
                                    <div style="width: 130px; float: left;" >
                                        <asp:TextBox ID="txtUrl" runat="server" CssClass="ms-fullWidth"></asp:TextBox>
                                        <asp:RequiredFieldValidator ID="rfvalidator_URL" runat="server" ForeColor="Red" Text="*" ControlToValidate="txtUrl" ErrorMessage="Site URL Required" EnableClientScript="true" SetFocusOnError="true"></asp:RequiredFieldValidator>
                                    </div>
                                </div>
                            </div>
                            <div id="divDescription">
                                <h3 class="ms-core-form-line">Description for the subsite</h3>
                                <div class="ms-core-form-line" style="text-align: right">
                                    <div class="ms-core-form-line" style="text-align: right">
                                        <asp:TextBox TextMode="MultiLine" MaxLength="3" ID="txtdescription" runat="server" CssClass="ms-fullWidth" />
                                        <asp:RequiredFieldValidator ID="rfvalidator_Description" Text="*" runat="server" ForeColor="Red" ControlToValidate="txtDescription" EnableClientScript="true" SetFocusOnError="true" ErrorMessage="Site Description Required"></asp:RequiredFieldValidator>
                                    </div>
                                </div>
                            </div>
                            <div id="divFieldTemplate" style="display: table; width: 100%;">
                                <h3 class="ms-core-form-line">Pick a template</h3>
                                <div class="ms-core-form-line">
                                    <asp:DropDownList ID="ddlTemplate" runat="server" CssClass="ms-fullWidth">
                                </asp:DropDownList>
                                </div>
                            </div>
                            <div id="divValidationSummary">
                                <asp:ValidationSummary ID="ValidationSummary" runat="server" HeaderText="Following error occurs:" ForeColor="Red" ShowMessageBox="false" DisplayMode="BulletList" ShowSummary="true" />
                            </div>
                            <div id="divButtons" style="text-align: right">
                                <asp:Button ID="btnCreate" runat="server" Text="Create" CssClass="ms-ButtonHeightWidth" OnClick="btnCreate_Click" />
                                <asp:Button ID="btnCancel" runat="server" Text="Cancel" CssClass="ms-ButtonHeightWidth" OnClick="btnCancel_Click" CausesValidation="false" />
                            </div>
                            </asp:View>
                    <asp:View ID="RecordedView" runat="server">
                        <div style="width: 450px; margin-left: 50px;">
                            <div id="divFieldTemplate_1" style="display: table; width: 100%;">
                                <h3 class="ms-core-form-line">Your request has been recorded and will be processed soon.
                                </h3>
                                <div class="ms-core-form-line">
                                    Title -
                                    <asp:Label runat="server" ID="lblTitle" />
                                    <br />
                                    URL -
                                    <asp:Label runat="server" ID="lblUrl" />
                                    <br />
                                    Subsite Requested By -
                                    <asp:Label runat="server" ID="lblSiteColAdmin" />
                                    <br />
                                    <%--<br />
                                    We will notify the provided email when the site request has been processed.
                                    <br />
                                    Notice that requester will be set as the site collection owner automatically.--%> 
                                </div>
                                <div id="divButtons_1" style="float: right;">
                                    <asp:Button ID="btnProceed" runat="server" Text="Proceed" CssClass="ms-ButtonHeightWidth" OnClick="btnCancel_Click" />
                                </div>
                            </div>
                        </div>
                        </asp:View>
                </asp:MultiView>
            </ContentTemplate>
            <Triggers>
                <asp:PostBackTrigger ControlID="btnCreate" />
            </Triggers>
        </asp:UpdatePanel>
    </form>
</body>
</html>
