// This file is part of Moodle - http://moodle.org/
//
// Moodle is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// Moodle is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with Moodle. If not, see <http://www.gnu.org/licenses/>.

/**
 * RÉCIT Dashboard 
 * 
 * @package   local_recitdashboard
 * @copyright 2019 RÉCIT 
 * @license   {@link http://www.gnu.org/licenses/gpl-3.0.html} GNU GPL v3 or later
 */

import packageJson from "../../package.json";
import { $glVars } from "./common";


export class Options
{
    static appVersion(){ return packageJson.version; }

    static getGateway(addSesskey){
        let result = `${M.cfg.wwwroot}/local/recitdashboard/WebApi.php`;

        if(addSesskey){
            result += `?sesskey=${M.cfg.sesskey}`;
        }

        return result;
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