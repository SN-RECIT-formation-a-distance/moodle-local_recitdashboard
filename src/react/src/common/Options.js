import packageJson from "../../package.json";
import { $glVars } from "./common";

//import {$i18n} from "./i18n.js";

export class Options
{
    static appVersion(){ return packageJson.version; }

    static getGateway(){
        return `${M.cfg.wwwroot}/local/recitdashboard/classes/WebApi.php`;
    }
}

export class OptionManager
{
    static options = {};

    static getValue(key){
        return this.options[key];
    }

    static setValue(key, value){
        this.options[key] = value;
        
        $glVars.webApi.setUserOption(key, value, () => this.loadOptions());
    }

    static loadOptions(cb){
        $glVars.webApi.getUserOptions((result) => {
            if (result.success){
                this.options = result.data;
                if (cb){
                    cb(this.options);
                }
            }
        });

    }
    
}