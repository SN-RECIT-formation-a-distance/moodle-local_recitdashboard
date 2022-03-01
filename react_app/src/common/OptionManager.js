import { $glVars } from "./common";

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