using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.IO;
using System.Configuration;

namespace CCI_CoxOne_Security
{
    class Program
    {
        static string siteCollUrl;
        static void Main(string[] args)
        {
            LogEntry("Main", "Fetching Site Collection URL from config file");
            siteCollUrl = ConfigurationManager.AppSettings["SiteCollectionUrl"];
            if (!string.IsNullOrEmpty(siteCollUrl))
            {
                LogEntry("Main", "Site Collection Url - " + siteCollUrl);
            }
            else {
                LogEntry("Main", "Check config file for 'SiteCollectionUrl'");
            }

        }

        //Log
        public static void LogEntry(string funName, string logRow)
        {

            StreamWriter log;
            string strFileName;

            strFileName = "logs.txt";
            strFileName = strFileName.Replace(".txt", "-" + DateTime.Now.Year.ToString() + "-" + DateTime.Now.Month.ToString() + "-" + DateTime.Now.Day.ToString() + ".txt");

            if (!File.Exists(strFileName))
            {
                log = new StreamWriter(strFileName);
            }
            else
            {
                log = File.AppendText(strFileName);
            }

            // Write to the file:
            log.WriteLine(System.DateTime.Now + " " + funName + " - " + logRow + "<br />");

            // Close the stream:
            log.Close();
        }

    }
}
