using Microsoft.SharePoint.Client;
using System;
using System.Collections.Generic;
using System.Configuration;
//using System.Globalization;
using System.Linq;
//using System.Web;
using System.Web.UI;
//using System.Web.UI.WebControls;
//using System.Collections.Specialized;
//using System.Reflection;

namespace Cox.Provisioning.AsyncWeb
{
    public partial class Default : System.Web.UI.Page
    {
        protected void Page_PreInit(object sender, EventArgs e)
        {
            Uri redirectUrl;
            switch (SharePointContextProvider.CheckRedirectionStatus(Context, out redirectUrl))
            {
                case RedirectionStatus.Ok:
                    return;
                case RedirectionStatus.ShouldRedirect:
                    Response.Redirect(redirectUrl.AbsoluteUri, endResponse: true);
                    break;
                case RedirectionStatus.CanNotRedirect:
                    Response.Write("An error occurred while processing your request.");
                    Response.End();
                    break;
            }
        }

        protected void Page_Load(object sender, EventArgs e)
        {
            // define initial script, needed to render the chrome control
            string script = @"
            function chromeLoaded() {
                $('body').show();
            }

            //function callback to render chrome after SP.UI.Controls.js loads
            function renderSPChrome() {
                //Set the chrome options for launching Help, Account, and Contact pages
                var options = {
                    'appTitle': document.title,
                    'onCssLoaded': 'chromeLoaded()'
                };

                //Load the Chrome Control in the divSPChrome element of the page
                var chromeNavigation = new SP.UI.Controls.Navigation('divSPChrome', options);
                chromeNavigation.setVisible(true);
            }";

            //register script in page
            Page.ClientScript.RegisterClientScriptBlock(typeof(Default), "BasePageScript", script, true);

            // Set some default values
            //lblBasePath.Text = Request["SPHostUrl"].Substring(0, 8 + Request["SPHostUrl"].Substring(8).IndexOf("/")) + "/sites/";
            if (Request["RequestorSite"] != null)
            {
                lblBasePath.Text = Request["RequestorSite"] + "/";
            }
            else
            {
                lblBasePath.Text = Request["SPHostUrl"] + "/";
            }
            //templateSiteLink.Text = ConfigurationManager.AppSettings["TemplateSiteUrl"];
            //templateSiteLink.NavigateUrl = ConfigurationManager.AppSettings["TemplateSiteUrl"];

            var spContext = SharePointContextProvider.Current.GetSharePointContext(Context);
            using (ClientContext ctx = spContext.CreateUserClientContextForSPHost())
            {
                // Get time zones from server side
                RegionalSettings reg = ctx.Web.RegionalSettings;
                TimeZoneCollection zones = ctx.Web.RegionalSettings.TimeZones;
                ctx.Load(reg);
                ctx.Load(zones);
                ctx.ExecuteQuery();
            }

            // Set default values for the controls
            if (!Page.IsPostBack)
            {
                //RecordedPanel.Visible = false;
                //RequestPanel.Visible = true;
                processViews.ActiveViewIndex = 0;
                processViews.SetActiveView(RequestView);
                // Set template options - could also come from Azure or from some other solution, now hard coded. 
                ddlTemplate.Items.Add(new System.Web.UI.WebControls.ListItem("Community", "CommunityTemplate.xml:COMMUNITY#0"));

                ddlTemplate.SelectedIndex = 0;
            }
        }

        protected void btnCreate_Click(object sender, EventArgs e)
        {

            var spContext = SharePointContextProvider.Current.GetSharePointContext(Context);

            using (ClientContext ctx = spContext.CreateUserClientContextForSPHost())
            {
                Uri newurl = new Uri(ConfigurationManager.AppSettings["GovernanceSiteCollection"]);
                //var token = getToken(newurl.ToString());
                string realm = TokenHelper.GetRealmFromTargetUrl(newurl);
                string token = TokenHelper.GetAppOnlyAccessToken(TokenHelper.SharePointPrincipal, newurl.Authority, realm).AccessToken;
                //get the current user to set as owner
                var currUser = ctx.Web.CurrentUser;
                ctx.Load(currUser);
                ctx.ExecuteQuery();
                using (ClientContext provisioningsitectx = TokenHelper.GetClientContextWithAccessToken(newurl.ToString(), token))
                {
                    Web newcurrentWeb = provisioningsitectx.Web;
                    provisioningsitectx.Load(newcurrentWeb, w => w.Title, w => w.Description);
                    provisioningsitectx.ExecuteQuery();
                    AddRequestToQueue(provisioningsitectx, newcurrentWeb, currUser.Email);
                    Response.Write(newcurrentWeb.Title);
                    Response.Write(newcurrentWeb.Description);
                }
                
                processViews.ActiveViewIndex = 1;
                processViews.SetActiveView(RecordedView);
                // Show that the information has been recorded.
                lblTitle.Text = txtTitle.Text;
                lblUrl.Text = lblBasePath.Text + txtUrl.Text;//ResolveFutureUrl();
                lblSiteColAdmin.Text = currUser.Email;
            }
        }
        private void AddRequestToQueue(ClientContext provisioningSiteContext, Web web, string currentUserEmail)
        {
            string listName = ConfigurationManager.AppSettings["SubSiteRequests_List"];
            List list = GetListByTitle(provisioningSiteContext.Web, listName);
            var itemCreateInfo = new ListItemCreationInformation();
            Microsoft.SharePoint.Client.ListItem listItem = list.AddItem(itemCreateInfo);
            listItem["Title"] = txtTitle.Text;
            listItem["SiteName"] = txtTitle.Text;
            listItem["SiteUrl"] = txtUrl.Text;
            listItem["TemplateFileName"] = ddlTemplate.SelectedValue.Split(':')[0];
            listItem["TemplateID"] = ddlTemplate.SelectedValue.Split(':')[1];
            listItem["Description"] = txtdescription.Text;
            listItem["RequestorEmail"] = currentUserEmail;
            listItem["Status"] = "Requested";
            listItem["SiteBaseUrl"] = lblBasePath.Text;
            //listItem["SPAppWebUrl"] = Convert.ToString(Request["SPAppWebUrl"]);
            listItem["StatusMessage"] = "Request stored successfully for async process";
            listItem.Update();

            provisioningSiteContext.Web.Context.ExecuteQuery();
        }
        private List GetListByTitle(Web web, string listTitle)
        {
            ListCollection lists = web.Lists;
            IEnumerable<List> results = web.Context.LoadQuery<List>(lists.Where(list => list.Title == listTitle));
            web.Context.ExecuteQuery();
            return results.FirstOrDefault();
        }
        
        private string ResolveFutureUrl()
        {
            var tenantName = Page.Request["SPHostUrl"].ToLower().Replace("-my", "").Substring(8);
            tenantName = tenantName.Substring(0, tenantName.IndexOf("."));
            return string.Format("https://{0}/{1}/{2}", tenantName, "sites", txtUrl.Text);
        }

        protected void btnCancel_Click(object sender, EventArgs e)
        {
            if (Request["RequestorSite"] != null)
            {
                Response.Redirect(Page.Request["RequestorSite"]);
            }
            else
            {
                Response.Redirect(Page.Request["SPHostUrl"]);
            }
        }
        
    }
}