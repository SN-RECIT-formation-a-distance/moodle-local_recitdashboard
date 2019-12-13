import packageJson from "../../package.json";
//import {$i18n} from "./i18n.js";

export class Options
{
    static appVersion(){ return packageJson.version; }

    static appTitle(){
        return "RÉCIT Tableau de bord | " + this.appVersion();
    }

    static versionHistory = [
        {version: "0.1.0", description: "", timestamp: '2019-11-04'},
    ]

    static getGateway(){
        return `${M.cfg.wwwroot}/local/recitcommon/php/RecitApi.php`;
    }
    
}