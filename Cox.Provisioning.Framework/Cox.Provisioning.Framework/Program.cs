using System;
using System.Configuration;
using Microsoft.SharePoint.Client;
using System.Linq;
using OfficeDevPnP.Core.Framework.Provisioning.Connectors;
using OfficeDevPnP.Core.Framework.Provisioning.Model;
using OfficeDevPnP.Core.Framework.Provisioning.ObjectHandlers;
using OfficeDevPnP.Core.Framework.Provisioning.Providers.Xml;
using System.Security;
using System.Threading;
using System.Collections.Generic;

namespace Cox.Provisioning.Framework
{
    class Program
    {
        //const string Provisioning = "Provisioning";
        const string Completed_Template_Provisioning = "Completed Template Provisioning";
        const string Failed_Template_Provisioning = "Failed Template Provisioning";
        const string SubSite_Created = "SubSite Created";
        const string Failure_SubSite_Exists = "SubSite Already Exist";
        const string SubSite_Creation_Failed = "SubSite Creation Failed";
        //const string Start_Template_Provisioning = "Start Template Provisioning";

        //static string _newfilename = string.Empty;
        const string subsitecheck= "SubsiteCheck";
        const string Requested = "Requested";
        static string userName = string.Empty;
        static string pwdS = string.Empty;
        static string targetWebUrl = string.Empty;
        static SecureString pwd = new SecureString();
        
        static void Main(string[] args)
        {
            ConsoleColor defaultForeground = Console.ForegroundColor;
            string templateWebUrl = string.Empty;
            templateWebUrl = ConfigurationManager.AppSettings["FetchXMLConfigFrom"];
            
            if (!ConfigurationManager.AppSettings["CloudAutoDeploymentMode"].ToBoolean())
            {
                targetWebUrl = ConfigurationManager.AppSettings["TargetSiteCollectionUrl"];
                userName = ConfigurationManager.AppSettings["UserName"];
                pwdS = ConfigurationManager.AppSettings["Password"];
                foreach (char c in pwdS.ToCharArray()) pwd.AppendChar(c);
                #region "Manual Deployment Mode"
                try
                {
                    ProvisioningTemplate template;
                    var path = string.Format("{0}\\{1}\\{2}", System.IO.Directory.GetCurrentDirectory(), ConfigurationManager.AppSettings["XMLConfigRootPath"], ConfigurationManager.AppSettings["XMLConfigFileName"]);
                    XMLTemplateProvider provider = new XMLFileSystemTemplateProvider(ConfigurationManager.AppSettings["XMLConfigRootPath"], "");
                    template = provider.GetTemplate(path);
                    if (ConfigurationManager.AppSettings["ProvisionSiteCollection"].ToBoolean())
                    {
                        ApplyProvisioningTemplate(defaultForeground, targetWebUrl, userName, pwd, template);
                        if (ConfigurationManager.AppSettings["DeployConfigListGUIDs"].ToBoolean())
                        {
                            InsertConfigListGUIDs(defaultForeground, targetWebUrl, userName, pwd, template);
                        }
                    }
                    if (ConfigurationManager.AppSettings["ProvisionTaxonomy"].ToBoolean())
                    {
                        path = string.Format("{0}\\{1}\\{2}", System.IO.Directory.GetCurrentDirectory(), ConfigurationManager.AppSettings["XMLConfigRootPath"], ConfigurationManager.AppSettings["TaxonomyTemplateFile"]);
                        provider = new XMLFileSystemTemplateProvider(ConfigurationManager.AppSettings["XMLConfigRootPath"], "");
                        template = provider.GetTemplate(path);
                        ApplyProvisioningTemplate(defaultForeground, targetWebUrl, userName, pwd, template);
                    }
                    if (ConfigurationManager.AppSettings["ProvisionSubSites"].ToBoolean())
                    {
                        if (ConfigurationManager.AppSettings["Subsites"] != null)
                        { 
                            ProcessSubsites();
                        }
                    }
                }
                catch (Exception ex)
                {
                    Console.WriteLine("Error Occured.Details:{0}", ex.Message);
                }
                // Just to pause and indicate that it's all done
                Console.ForegroundColor = ConsoleColor.White;
                Console.WriteLine("We are all done. Press enter to continue.");
                Console.ReadLine();
                #endregion
            }
            else
            {
                //Automated Asynchronous Subsite Creation
                ProcessAllSubSiteRequests();
            }

        }
        private static void ProcessAllSubSiteRequests()
        {
            string olistName = ConfigurationManager.AppSettings["SubSiteRequests_List"];
            Uri site_GovernanceUrl = new Uri(ConfigurationManager.AppSettings["GovernanceSiteCollection"]);
            
            //Get the realm for the URL
            string realm = TokenHelper.GetRealmFromTargetUrl(site_GovernanceUrl);

            //Get the access token for the URL.  
            string accessToken = TokenHelper.GetAppOnlyAccessToken(
                TokenHelper.SharePointPrincipal,
                site_GovernanceUrl.Authority, realm).AccessToken;

            try
            {
                using (var ctx = TokenHelper.GetClientContextWithAccessToken(site_GovernanceUrl.ToString(), accessToken))
                {
                    //ctx.Credentials = new SharePointOnlineCredentials(userName, pwd);
                    ctx.RequestTimeout = Timeout.Infinite;
                    // Get items which are in requested status
                    List list = ctx.Web.Lists.GetByTitle(olistName);
                    CamlQuery camlQuery = new CamlQuery();

                    camlQuery.ViewXml = @"<View><Query>
                                   <Where>
                                         <Eq>
                                            <FieldRef Name='Status' />
                                            <Value Type='Text'>" + Requested + @"</Value>
                                         </Eq>    
                                   </Where>
                                </Query>
                            <RowLimit>" + Convert.ToString(ConfigurationManager.AppSettings["SubsiteRequestQueueCount"]) + @"</RowLimit></View>";
                    ListItemCollection listItems = list.GetItems(camlQuery);
                    ctx.Load(listItems);
                    ctx.ExecuteQuery();
                    if (listItems.Count > 0)
                    {
                        Auto_ProcessSubsites(listItems,ctx);
                    }
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine("Error Occured in Method-ProcessAllSubSiteRequests.Details:{0}", ex.Message);
                Console.WriteLine("Trying to create SubsiteRequests List in the configured Governance Site-{0}", site_GovernanceUrl);
                ProvisioningTemplate subsitetemplate;
                string Governance_TemplateFileName = ConfigurationManager.AppSettings["GovernanceXMLConfigFileName"];
                ConsoleColor defaultForeground = Console.ForegroundColor;
                var subsiteConfigPath = string.Format("{0}\\{1}\\{2}", System.IO.Directory.GetCurrentDirectory(), ConfigurationManager.AppSettings["XMLConfigRootPath"], Governance_TemplateFileName);
                XMLTemplateProvider subsiteprovider = new XMLFileSystemTemplateProvider(ConfigurationManager.AppSettings["XMLConfigRootPath"], "");
                subsitetemplate = subsiteprovider.GetTemplate(subsiteConfigPath);
                string errorOccuredMessage = Auto_ApplyProvisioningTemplate(defaultForeground, site_GovernanceUrl.ToString(), subsitetemplate);
                if(string.IsNullOrEmpty(errorOccuredMessage))
                {
                    Console.WriteLine("Successfully created missing SubsiteRequests list", site_GovernanceUrl);
                }
                else
                {
                    Console.WriteLine("Error while creating SubsiteRequests list.Error:-{0}", errorOccuredMessage);
                }
            }
        }
        

        private static bool ProcessSubsites()
        {
            bool processed = false;
            ConsoleColor defaultForeground = Console.ForegroundColor;
            string[] _subsiteCollection;
            _subsiteCollection = ConfigurationManager.AppSettings["Subsites"].Split(';');
            foreach (var ssite in _subsiteCollection)
            {
                if (ssite != null)
                {
                    Web newlycreatedWeb;
                    bool proceedwithProvisioning = false;
                    ProvisioningTemplate subsitetemplate;
                    string subsiteUrlName = ssite.Split(':')[0];
                    string fullsubsiteurl = targetWebUrl + subsiteUrlName;
                    string subsitetemplate_filename = ssite.Split(':')[1];
                    string subsiteTemplateID = ssite.Split(':')[2];
                    bool result = WebExists(targetWebUrl, fullsubsiteurl, subsitecheck);
                    if (!result)
                    {
                        newlycreatedWeb = CreateSubSite(targetWebUrl, subsiteUrlName, "", subsiteTemplateID, subsiteUrlName);
                        if (newlycreatedWeb != null)
                        {
                            proceedwithProvisioning = true;
                        }
                        else
                        {
                            Console.WriteLine("Skipped provisioning of site {0}.Problem while creating subsite", subsiteUrlName);
                        }
                    }
                    else
                    {
                        proceedwithProvisioning = true;
                    }
                    if (!string.IsNullOrEmpty(fullsubsiteurl) && !string.IsNullOrEmpty(subsitetemplate_filename) && proceedwithProvisioning)
                    {
                        var subsiteConfigPath = string.Format("{0}\\{1}\\{2}", System.IO.Directory.GetCurrentDirectory(), ConfigurationManager.AppSettings["XMLConfigRootPath"], subsitetemplate_filename);
                        XMLTemplateProvider subsiteprovider = new XMLFileSystemTemplateProvider(ConfigurationManager.AppSettings["XMLConfigRootPath"], "");
                        subsitetemplate = subsiteprovider.GetTemplate(subsiteConfigPath);
                        ApplyProvisioningTemplate(defaultForeground, fullsubsiteurl, userName, pwd, subsitetemplate);
                    }
                }
            }
            processed = true;
            return processed;
        }

        private static bool Auto_ProcessSubsites(ListItemCollection subsiterequests,ClientContext ctx)
        {
            bool processed = false;
            ConsoleColor defaultForeground = Console.ForegroundColor;
            foreach (ListItem ssite in subsiterequests)
            {
                if (ssite != null)
                {
                    Web newlycreatedWeb;
                    bool proceedwithProvisioning = false;
                    ProvisioningTemplate subsitetemplate;
                    string siteUrl = Convert.ToString(ssite["SiteUrl"]);
                    string fullsubsiteurl =Convert.ToString(ssite["SiteBaseUrl"]) + siteUrl;
                    string subsite_TemplateFileName = Convert.ToString(ssite["TemplateFileName"]);
                    string subsiteTemplateID = Convert.ToString(ssite["TemplateID"]);
                    bool result = Auto_WebExists(Convert.ToString(ssite["SiteBaseUrl"]), fullsubsiteurl, subsitecheck);
                    if (!result)
                    {

                        newlycreatedWeb = Auto_CreateSubSite(Convert.ToString(ssite["SiteBaseUrl"]), Convert.ToString(ssite["SiteName"]), Convert.ToString(ssite["Description"]), subsiteTemplateID,siteUrl);
                        if (newlycreatedWeb != null)
                        {
                            UpdateStatusToList(ssite.Id, SubSite_Created, "Created at " + DateTime.Now.ToString());
                            proceedwithProvisioning = true;
                        }
                        else
                        {
                            UpdateStatusToList(ssite.Id, SubSite_Creation_Failed, "Failed at " + DateTime.Now.ToString());
                            Console.WriteLine("Skipped provisioning of site {0}.Problem while creating subsite.", Convert.ToString(ssite["SiteUrl"]));
                        }
                    }
                    else
                    {
                        UpdateStatusToList(ssite.Id, Failure_SubSite_Exists, string.Format("Subsite with url already exist{0} at {1}",fullsubsiteurl, DateTime.Now.ToString()));
                        proceedwithProvisioning = false;
                    }
                    if (proceedwithProvisioning)
                    {
                        var subsiteConfigPath = string.Format("{0}\\{1}\\{2}", System.IO.Directory.GetCurrentDirectory(), ConfigurationManager.AppSettings["XMLConfigRootPath"], subsite_TemplateFileName);
                        XMLTemplateProvider subsiteprovider = new XMLFileSystemTemplateProvider(ConfigurationManager.AppSettings["XMLConfigRootPath"], "");
                        subsitetemplate = subsiteprovider.GetTemplate(subsiteConfigPath);
                        string errorOccuredMessage=Auto_ApplyProvisioningTemplate(defaultForeground, fullsubsiteurl,subsitetemplate);
                        if (string.IsNullOrEmpty(errorOccuredMessage))
                        {
                            UpdateStatusToList(ssite.Id, Completed_Template_Provisioning, "Provisioned successfully at " + DateTime.Now.ToString());
                        }
                        else
                        {
                            UpdateStatusToList(ssite.Id, Failed_Template_Provisioning, string.Format("Subsite Provisioning failed.{0}", errorOccuredMessage));
                        }
                    }
                }
            }
            processed = true;
            return processed;
        }

        private static string GetInput(string label, bool isPassword, ConsoleColor defaultForeground)
        {
            Console.ForegroundColor = ConsoleColor.Green;
            Console.WriteLine("{0} : ", label);
            Console.ForegroundColor = defaultForeground;

            string value = "";

            for (ConsoleKeyInfo keyInfo = Console.ReadKey(true); keyInfo.Key != ConsoleKey.Enter; keyInfo = Console.ReadKey(true))
            {
                if (keyInfo.Key == ConsoleKey.Backspace)
                {
                    if (value.Length > 0)
                    {
                        value = value.Remove(value.Length - 1);
                        Console.SetCursorPosition(Console.CursorLeft - 1, Console.CursorTop);
                        Console.Write(" ");
                        Console.SetCursorPosition(Console.CursorLeft - 1, Console.CursorTop);
                    }
                }
                else if (keyInfo.Key != ConsoleKey.Enter)
                {
                    if (isPassword)
                    {
                        Console.Write("*");
                    }
                    else
                    {
                        Console.Write(keyInfo.KeyChar);
                    }
                    value += keyInfo.KeyChar;

                }

            }
            Console.WriteLine("");

            return value;
        }

        private static string ApplyProvisioningTemplate(ConsoleColor defaultForeground, string webUrl, string userName, SecureString pwd, ProvisioningTemplate template)
        {
            string errorMessage = string.Empty;
            using (var ctx = new ClientContext(webUrl))
            {
                
                ctx.Credentials = new SharePointOnlineCredentials(userName, pwd);
                ctx.RequestTimeout = Timeout.Infinite;

                // Just to output the site details
                Web web = ctx.Web;
                ctx.Load(web, w => w.Title);
                ctx.ExecuteQueryRetry();

                Console.ForegroundColor = ConsoleColor.White;
                Console.WriteLine("Your site title is:" + ctx.Web.Title);
                Console.ForegroundColor = defaultForeground;
                
                ProvisioningTemplateApplyingInformation ptai
                        = new ProvisioningTemplateApplyingInformation();
                ptai.ProgressDelegate = delegate (String message, Int32 progress, Int32 total)
                {
                    Console.WriteLine("{0:00}/{1:00} - {2}", progress, total, message);
                };

                // Associate file connector for assets
                FileSystemConnector connector = new FileSystemConnector(ConfigurationManager.AppSettings["XMLConfigRootPath"], "");
                template.Connector = connector;
                
                try
                {
                    web.ApplyProvisioningTemplate(template, ptai);
                }
                catch (Exception ex)
                {
                    Console.WriteLine("Error Occured.Details:{0}", ex.Message);
                    if (!string.IsNullOrEmpty(ex.Message))
                    {
                        errorMessage = ex.Message;
                    }
                    else if (!string.IsNullOrEmpty(ex.StackTrace))
                    {
                        errorMessage = string.Format("Error Occured. Stack Trace:-{0}", ex.StackTrace);
                    }
                    else
                    {
                        errorMessage = string.Format("Error Occured.");
                    }
                }
            }
            return errorMessage;
        }

        private static string Auto_ApplyProvisioningTemplate(ConsoleColor defaultForeground, string webUrl, ProvisioningTemplate template)
        {
            string errorMessage = string.Empty;
            Uri site_uri = new Uri(webUrl);

            //Get the realm for the URL
            string realm = TokenHelper.GetRealmFromTargetUrl(site_uri);

            //Get the access token for the URL.  
            string accessToken = TokenHelper.GetAppOnlyAccessToken(
                TokenHelper.SharePointPrincipal,
                site_uri.Authority, realm).AccessToken;

            //try
            //{
                using (var ctx = TokenHelper.GetClientContextWithAccessToken(site_uri.ToString(), accessToken))
                {
                    ctx.RequestTimeout = Timeout.Infinite;

                    // Just to output the site details
                    Web web = ctx.Web;
                    ctx.Load(web, w => w.Title);
                    ctx.ExecuteQueryRetry();

                    Console.ForegroundColor = ConsoleColor.White;
                    Console.WriteLine("Your site title is:" + ctx.Web.Title);
                    Console.ForegroundColor = defaultForeground;

                    ProvisioningTemplateApplyingInformation ptai
                            = new ProvisioningTemplateApplyingInformation();
                    ptai.ProgressDelegate = delegate (String message, Int32 progress, Int32 total)
                    {
                        Console.WriteLine("{0:00}/{1:00} - {2}", progress, total, message);
                    };

                    // Associate file connector for assets
                    FileSystemConnector connector = new FileSystemConnector(ConfigurationManager.AppSettings["XMLConfigRootPath"], "");
                    template.Connector = connector;

                    try
                    {
                        web.ApplyProvisioningTemplate(template, ptai);
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine("Error Occured.Details:{0}", ex.Message);
                        if (!string.IsNullOrEmpty(ex.Message))
                        {
                            errorMessage = ex.Message;
                        }
                        else if (!string.IsNullOrEmpty(ex.StackTrace))
                        {
                            errorMessage = string.Format("Error Occured. Stack Trace:-{0}", ex.StackTrace);
                        }
                        else
                        {
                            errorMessage = string.Format("Error Occured.");
                        }
                    }
                }
            return errorMessage;
        }

        private static string InsertConfigListGUIDs(ConsoleColor defaultForeground, string webUrl, string userName, SecureString pwd, ProvisioningTemplate template)
        {
            string errorMessage = string.Empty;
            string listInternalName = string.Empty;
            Dictionary<string, string> dictionary_Lists =  new Dictionary<string, string>();

            try
            {
                using (ClientContext ctx = new ClientContext(webUrl))
                {
                    ctx.Credentials = new SharePointOnlineCredentials(userName, pwd);
                    ctx.RequestTimeout = Timeout.Infinite;
                    // Get items which are in requested status
                    foreach (var currentlist in template.Lists)
                    {
                        List list = ctx.Web.Lists.GetByTitle(currentlist.Title);
                        ctx.Load(list);
                        ctx.ExecuteQuery();
                        if(!string.IsNullOrEmpty(currentlist.Url))
                        {
                            listInternalName = currentlist.Url.Split('/')[1];
                        }
                        
                        dictionary_Lists.Add(listInternalName, list.Id.ToString().ToUpper());
                    }
                    InsertConfigListGUIDData(dictionary_Lists, ctx);
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine("Error Occured in Method-InsertConfigListGUIDs.Details:{0}", ex.Message);
            }
        
            return errorMessage;
        }

        private static bool WebExists(string siteUrl, string webUrl, string requesttype)
        {
            bool result = false;
            try
            {
                using (ClientContext sitectx = new ClientContext(siteUrl))
                {
                    sitectx.Credentials = new SharePointOnlineCredentials(userName, pwd);
                    sitectx.RequestTimeout = Timeout.Infinite;

                    result = true;

                    var web = sitectx.Web;
                    sitectx.Load(web, w => w.Webs);
                    sitectx.ExecuteQuery();
                    if (web != null)
                    {
                        result = true;
                        if (requesttype.ToLowerInvariant() == "SubsiteCheck".ToLowerInvariant())
                        {
                            var subWeb = (from w in web.Webs where w.Url.ToLowerInvariant() == webUrl.ToLowerInvariant() select w).SingleOrDefault();
                            if (subWeb != null)
                            {
                                // if found true
                                result = true;
                            }
                            else
                            {
                                result = false;
                            }
                        }
                    }
                    else
                    {
                        result = false;
                    }
                }
            }
            catch (Exception ex)
            {
                result = false;
            }
            return result;
        }

        private static bool Auto_WebExists(string siteUrl, string webUrl, string requesttype)
        {
            bool result = false;
            try
            {
                Uri site_Uri = new Uri(webUrl);

                //Get the realm for the URL
                string realm = TokenHelper.GetRealmFromTargetUrl(site_Uri);

                //Get the access token for the URL.  
                string accessToken = TokenHelper.GetAppOnlyAccessToken(
                    TokenHelper.SharePointPrincipal,
                    site_Uri.Authority, realm).AccessToken;
                
                    using (var sitectx = TokenHelper.GetClientContextWithAccessToken(site_Uri.ToString(), accessToken))
                    {
                        sitectx.RequestTimeout = Timeout.Infinite;

                    result = true;

                    var web = sitectx.Web;
                    sitectx.Load(web, w => w.Webs);
                    sitectx.ExecuteQuery();
                    if (web != null)
                    {
                        result = true;
                        if (requesttype.ToLowerInvariant() == "SubsiteCheck".ToLowerInvariant())
                        {
                            var subWeb = (from w in web.Webs where w.Url.ToLowerInvariant() == webUrl.ToLowerInvariant() select w).SingleOrDefault();
                            if (subWeb != null)
                            {
                                // if found true
                                result = true;
                            }
                            else
                            {
                                result = false;
                            }
                        }
                    }
                    else
                    {
                        result = false;
                    }
                }
            }
            catch (Exception ex)
            {
                result = false;
            }
            return result;
        }

        private static Web CreateSubSite(string siteCollectionUrl, string title, string description,string webtemplateid,string url)
        {
            Web newWeb = null;
            try
            {
                using (ClientContext sitectx = new ClientContext(siteCollectionUrl))
                {
                    sitectx.Credentials = new SharePointOnlineCredentials(userName, pwd);
                    sitectx.RequestTimeout = Timeout.Infinite;

                    var web = sitectx.Web;
                    sitectx.Load(web.Webs);
                    sitectx.ExecuteQuery();

                    // Create web creation configuration
                    var information = new WebCreationInformation()
                    {
                        WebTemplate = webtemplateid,
                        Description = description,
                        Title = title,
                        Url = url,
                        UseSamePermissionsAsParentSite = true
                    };

                    // Currently all english, could be extended to be configurable based on language pack usage
                    information.Language = 1033;

                    newWeb = web.Webs.Add(information);
                    
                    sitectx.ExecuteQuery();
                    sitectx.Load(newWeb);
                    sitectx.ExecuteQuery();
                }
                Console.ForegroundColor = ConsoleColor.White;
                Console.WriteLine("Created Subsite {0}" + newWeb.Title);
            }
            catch(Exception ex)
            {
                Console.ForegroundColor = ConsoleColor.White;
                Console.WriteLine("Error occurred while creating subsite {0} with error {1}", title, ex.Message);
            }
            return newWeb;
        }

        private static Web Auto_CreateSubSite(string siteCollectionUrl, string title, string description, string webtemplateid, string url)
        {
            Web newWeb = null;
            Uri site_Uri = new Uri(siteCollectionUrl);

            //Get the realm for the URL
            string realm = TokenHelper.GetRealmFromTargetUrl(site_Uri);

            //Get the access token for the URL.  
            string accessToken = TokenHelper.GetAppOnlyAccessToken(
                TokenHelper.SharePointPrincipal,
                site_Uri.Authority, realm).AccessToken;

            try
            {
                using (var sitectx = TokenHelper.GetClientContextWithAccessToken(site_Uri.ToString(), accessToken))
                {
                    //sitectx.Credentials = new SharePointOnlineCredentials(userName, pwd);
                    sitectx.RequestTimeout = Timeout.Infinite;

                    var web = sitectx.Web;
                    sitectx.Load(web.Webs);
                    sitectx.ExecuteQuery();

                    // Create web creation configuration
                    var information = new WebCreationInformation()
                    {
                        WebTemplate = webtemplateid,
                        Description = description,
                        Title = title,
                        Url = url,
                        UseSamePermissionsAsParentSite = true
                    };

                    // Currently all english, could be extended to be configurable based on language pack usage
                    information.Language = 1033;

                    newWeb = web.Webs.Add(information);

                    sitectx.ExecuteQuery();
                    sitectx.Load(newWeb);
                    sitectx.ExecuteQuery();
                }
                Console.ForegroundColor = ConsoleColor.White;
                Console.WriteLine("Created Subsite {0}" + newWeb.Title);
            }
            catch (Exception ex)
            {
                Console.ForegroundColor = ConsoleColor.White;
                Console.WriteLine("Error occurred while creating subsite {0} with error {1}", title, ex.Message);
            }
            return newWeb;
        }
        
        private static void UpdateStatusToList(int id, string status, string statusMessage)
        {
            string requestlistname = ConfigurationManager.AppSettings["SubSiteRequests_List"];
            
            Uri site_GovernanceUrl = new Uri(ConfigurationManager.AppSettings["GovernanceSiteCollection"]);

            //Get the realm for the URL
            string realm = TokenHelper.GetRealmFromTargetUrl(site_GovernanceUrl);

            //Get the access token for the URL.  
            string accessToken = TokenHelper.GetAppOnlyAccessToken(
                TokenHelper.SharePointPrincipal,
                site_GovernanceUrl.Authority, realm).AccessToken;

            try
            {
                using (var ctx = TokenHelper.GetClientContextWithAccessToken(site_GovernanceUrl.ToString(), accessToken))
                {
                    ctx.RequestTimeout = Timeout.Infinite;
                    List list = ctx.Web.Lists.GetByTitle(requestlistname);
                    ListItem listItem = list.GetItemById(id);
                    ctx.Load(listItem);
                    ctx.ExecuteQuery();
                    //int retrycount = 0;
                    //retrycount = Convert.ToInt32(listItem["ReTryCount"]);
                    listItem["Status"] = status;
                    listItem["StatusMessage"] = Convert.ToString(listItem["StatusMessage"]) + "::---------::" + statusMessage;
                    //if (status == Site_Creation_Failed || status == SubSite_Creation_Failed)
                    //{
                    //    listItem["ReTryCount"] = retrycount + 1;
                    //}
                    listItem.Update();
                    ctx.ExecuteQuery();
                }
            }
            catch (Exception ex)
            { }
        }

        private static void InsertConfigListGUIDData(Dictionary<string,string> dictionary_List,ClientContext ctx)
        {
            string configlistname = "Config";
            foreach (KeyValuePair<string, string> currDictionaryItem in dictionary_List)
            {
                try
                {
                        List list = ctx.Web.Lists.GetByTitle(configlistname);
                        var itemCreateInfo = new ListItemCreationInformation();
                        ListItem listItem = list.AddItem(itemCreateInfo);
                        ctx.Load(list);
                        ctx.ExecuteQuery();
                        
                        listItem["Key"] = currDictionaryItem.Key;
                        listItem["Value"] = currDictionaryItem.Value;
                        listItem["Comments"] = string.Format("List GUID for {0}",currDictionaryItem.Key);
                        
                        listItem.Update();
                        ctx.ExecuteQuery();
                }
                catch (Exception ex)
                {
                    Console.WriteLine("Error Occured while updating Config List in Method-InsertConfigListGUIDData.Details:{0}", ex.Message);
                }
            }
        }
    }
}
