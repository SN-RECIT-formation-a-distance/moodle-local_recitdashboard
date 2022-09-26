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
// along with Moodle.  If not, see <http://www.gnu.org/licenses/>.

/**
 * RÉCIT Dashboard 
 * 
 * @package   local_recitdashboard
 * @copyright 2019 RÉCIT 
 * @license   {@link http://www.gnu.org/licenses/gpl-3.0.html} GNU GPL v3 or later
 */
export class Cookies
{   
    /**
    * @static
    * @param {type} id
    * @param {type} value
    * @param {type} minutesExpire
    * @returns {void}
    */
    static set(id, value, minutesExpire) {
        let d = new Date();
        d.setTime(d.getTime() + (minutesExpire*60*1000));
        let expires = "expires="+d.toUTCString();
        document.cookie = id + "=" + value + "; " + expires;
    };

    static get = function (id, defaultValue) {
        let result = defaultValue;
        let name = id + "=";
        let ca = document.cookie.split(';');
        for(let i=0; i < ca.length; i++) {
            let c = ca[i];
            while (c.charAt(0) === ' ') 
                c = c.substring(1);

            if (c.indexOf(name) === 0) 
                result = c.substring(name.length, c.length);
        }

        switch(typeof defaultValue){            
            case 'boolean':
                result = result === 'true';
                break;
            case 'number':
                result = parseFloat(result);
                break;
            case 'object':
                result = (defaultValue instanceof Date ? new Date(result) : result);
                break;
            default:
                result = result.toString();
        }

        return result;
    };
};