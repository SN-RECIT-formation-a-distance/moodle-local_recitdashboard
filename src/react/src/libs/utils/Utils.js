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
//////////////////////////////////////////////////
// Note: the "export *" will only export the classes marked with "export" in their definition
//////////////////////////////////////////////////

export * from './WebApi';
export * from './Cookies';

export class JsNx{
    /**
     * Return the array item at the indicated index. If it not exists, then return the default value.
     * @param {number} index
     * @param {*} default value
     * @returns {*}
     */
    static at(arr, index, defaultValue){
        if(JsNx.exists(arr, index)){
            return arr[index];
        }
        else{
            return defaultValue;
        }
    };

    /**
     * Check if the index exists in the array.
     * @param {number} index
     * @returns {boolean}
     */
    static exists(arr, index){
        if(typeof arr[index] === "undefined"){
            return false;
        }
        else{
            return true;
        }
    };

    /**
     * Return the array item (an object) according to the property and value indicated. If it not exists, then return the default value.
     * @param {string} property
     * @param {*} property value
     * @param {*} default value
     * @returns {*}
     */
    static getItem(arr, prop, value, defaultValue){ 
        for(let item of arr){
            if(JsNx.get(item, prop, null) === value){return item; }
        }  

        return defaultValue;
    };

    /**
     * Add the item to the array only if it does not exists
     * @param {*} item
     * @returns {boolean}
     */
    static singlePush = function(arr, item){
        if(!arr.includes(item)){
            arr.push(item);
            return true;
        }
        else{
            return false;
        }
    };
    /**
     * Remove an element from the array. If the element does not exists then do nothing.
     * @param {number} index
     * @returns {object}
     */
    static remove(arr, index){
        let result = [];
        
        if(JsNx.exists(arr, index)){
            result = arr.splice(index,1);
        }
        
        return (result.length > 0 ? result[0] : null);
    };

    /**
     * Remove an element from the array according to the property and value indicated.
     * @param {string} property
     * @param {*} property value
     * @returns {object}
     */
    static removeItem = function(arr, prop, value){
        let index = JsNx.getItemIndex(arr, prop, value, -1);
        return JsNx.remove(arr, index);
    };

    /**
     * Return the array item (an object) index according to the property and value indicated. 
     * @param {string} property
     * @param {*} property value
     * @returns {number}
     */
    static getItemIndex = function(arr, prop, value){
        for(let i = 0; i < arr.length; i++){
            let item = arr[i];
            
            if(JsNx.get(item, prop, null) === value){ return i }
        }
        return -1;
    };

    /**
    * Get the property value. If it not exists, then return the default value.
    * @param {string} prop
    * @param {*} defaultValue
    * @returns {*}
    */
    static get = function(obj, prop, defaultValue){  
        let props = prop.split('.');
        let result = (typeof defaultValue === "undefined" ? null : defaultValue);

        if(typeof obj[prop] === "function"){
            result = obj[prop]();
        }
        else if((props.length === 1) && (obj.hasOwnProperty(props[0]))){
            result = obj[props[0]];
        }
        else if((props.length === 2) && (obj[props[0]].hasOwnProperty(props[1]))){
            result = obj[props[0]][props[1]];
        }
    
        return result;
    };

    /*
    * @description Deep clone the object and return a new one
    * @returns {Object}
    */
    static clone = function(obj){
        if(obj instanceof Date){
            return new Date(obj.valueOf());
        }

        let result = Object.create(obj.__proto__);
        
        for(let prop in obj){
            if(Array.isArray(obj[prop])){
                switch(typeof JsNx.at(obj[prop], 0,null)){
                    case "object":
                        result[prop] = JsNx.copy(obj[prop], 2);
                        break;
                    default:
                        result[prop] = JsNx.copy(obj[prop]);
                }
            }
            else if((typeof obj[prop] === "object") && (obj[prop] !== null)){
                result[prop] = JsNx.clone(obj[prop]);
            }
            else{
                result[prop] = obj[prop];
            }
        }
        return result;   
    };

    static copy = function(arr, level){
        level = level || 0;
        
        switch(level){
            case 1:
                return JSON.parse(JSON.stringify(arr)); //  Array of literal-structures (array, object) ex: [[], {}];
            case 2:
                //return jQuery.extend(this); // Array of prototype-objects (function). The jQuery technique can be used to deep-copy all array-types. ex: [function () {}, function () {}];
                let result = [];
                for(let item of arr){
                    result.push((item !== null ? JsNx.clone(item) : null));
                }
                return result;
            default:
                return arr.slice(); // Array of literal-values (boolean, number, string) ex:  [true, 1, "true"]
        }
    };
}

export default class Utils{
    static version = 1.0;

    // this is necessary in order to handle with timezone
    static dateParse(strDate){
       // return Moment(strDate).toDate();
    }

    static dateFormat(date){
        let d = new Date(parseInt(date)*1000)
        return d.toLocaleString()
    }

    static formatMoney(value){
        return "$ " + parseFloat(value).toFixed(2);
    }

    static getUrlVars(){
        var vars, uri;

        vars = {};
    
        uri = decodeURI(window.location.href);
    
        var parts = uri.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m,key,value) {
            vars[key] = value;
        });
        
        return vars;
    }
}

export class UtilsMoodle
{
    static rolesL1 = ['ad', 'mg', 'cc', 'et'];
    static rolesL2 = ['ad', 'mg', 'cc', 'et', 'tc'];
    static rolesL3 = ['sd', 'gu', 'fp', ''];

    static checkRoles(roles, r1){
        let r2 = roles;
        let a = new Set(r1);
        let b = new Set(r2);
        let intersection = new Set([...a].filter(x => b.has(x)));
        return intersection.size > 0;
    }

    static wwwRoot(){
        return M.cfg.wwwroot;
    };

    static getActivityIconUrl(moduleName){
        //src="http://devserver/shared/moodle/theme/image.php?theme=recit&component=lesson&rev=1576685339&image=icon"
        return `${M.cfg.wwwroot}/theme/image.php?theme=${M.cfg.theme}&component=${moduleName}&rev=${M.cfg.themerev}&image=icon`;
    }
}

export class UtilsString
{
    static checkEmail(email) {
        email = email || "";

        if(email.length === 0){ return true;}

        //var filter = /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;
        let filter = /^([a-zA-Z0-9_.-])+@(([a-zA-Z0-9-])+\.)+([a-zA-Z0-9]{2,4})+$/;
        let emails = email.split(",");
        for(let e of emails){
            if(!filter.test(e.trim())){
                return false;
            }
        }
    
        return true;
    }

    static slice(str, end){
        if(str.length > end){
            return `${str.slice(0, end)}...`;
        }
        else{
            return str;
        }
    }
}

export class UtilsDateTime
{
    static nbMinSinceSundayToDate(nbMinSinceSunday){
        nbMinSinceSunday = parseInt(nbMinSinceSunday,10);
        if(nbMinSinceSunday === 0){
            return null;
        }
        let hour = Math.trunc((nbMinSinceSunday % 1440) / 60);
        let minutes = nbMinSinceSunday % 60;
        return new Date(0,0,0, hour, minutes, 0);
    }
    
    static dateToNbMinSinceSunday(weekDay, date){
        if(date instanceof Date){
            return (date.getHours() * 60) + date.getMinutes() + (weekDay * 1440); // 1440 = minutes in a day
        }
        else{
            return 0;
        }
    }
    
    /**
    * Transform the shift minutes to the time string
    * @param {type} time 
    * @param {type} separator
    * @returns {ScheduleShift.minutesToTime.result}
    */
    static minutesToTime(time, separator) {
        separator = separator || ":";

        let hour, min, result, offsetDays;

        if((time >= 0) && (time <= 23)){
            hour = time;
            min = 0;
        }
        else{
            hour = Math.trunc(time / 60); // extract the hour
            offsetDays = Math.trunc(hour / 24);
            min = time - (hour * 60); // extract the minutes
            hour -= (offsetDays * 24);
        }

        result = hour.toString().nxLpad("0", 2) + separator + min.toString().nxLpad("0", 2);
        return result;
    };
    
    /**
     * Transform the time in string to minutes
     * @param {string} - hh:mm
     * @return {number} - The number of minutes 
     */
    static timeToMin = function (time) { 
        var hour, minutes;

        if (time.length !== 5) {
            return 0;
        }

        hour = parseInt(time.substring(0, 2),10);
        minutes = parseInt(time.substring(3, 5),10);

        return (hour * 60) + minutes;
    };

    static format(date){
        let str = ['Jan', 'Feb', 'Mar', 'Apr', 'May', "Jun", 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
        return `${date.getFullYear()} ${str[date.getMonth()]} ${date.getDate()}`;
    }
};

export class UtilsTreeStruct
{
    /**
     * Apply a user supplied function to every node of the tree and return its result
     * @param {Array} - tree
     * @param {string} - proNodes The property name of the children nodes 
     * @param {function} - callback The callback function
     * @returns void
     */
    static treeWalk(tree, propNodes, callback){
        let i, node;
        
        for(i = 0; i < tree.length; i++){
            node = tree[i];
            if((node.hasOwnProperty(propNodes)) && (node[propNodes].length > 0)){
                callback(node);
                UtilsTreeStruct.treeWalk(node[propNodes], propNodes, callback);
            }
            else{
                callback(node);        
            }
        }
    }
    
    /**
     * Get the parent node 
     * @param {Array} - tree
     * @param {string} - proNodes - The property name of the children nodes 
     * @param {function} - callback - The callback function. It needs to return true or false
     * @param * - default value
     * @returns * - the parent node or the default value
     */
    static getParentNode(rootNode, propNodes, callback, defaultValue){
        let i, node;
        let result = defaultValue;

        // there is no parent node
        if(callback(rootNode)){ return result;} 

        let nodes = rootNode.nxGet(propNodes);

        for(i = 0; i < nodes.length; i++){
            node = nodes[i];

            if(node.nxGet(propNodes).length > 0){                
                if(callback(node)){return rootNode; }

                result = UtilsTreeStruct.getParentNode(node, propNodes, callback, defaultValue);
            }
            else if(callback(node)){return rootNode; }           
        }

        return result;
    }
    
    /**
     * Get a node from the tree
     * @param {Array} - tree
     * @param {string} - proNodes - The property name of the children nodes 
     * @param {function} - callback - The callback function. It needs to return true or false
     * @param * - default value
     * @returns * - the node or the default value
     */
    static getNode(tree, propNodes, callback, defaultValue){
        let i, node, result;
        
        for(i = 0; i < tree.length; i++){
            node = tree[i];
            
            if(callback(node)){
                return node;
            }
            
            if((node.hasOwnProperty(propNodes)) && (node[propNodes].length > 0)){
                result = UtilsTreeStruct.getNode(node[propNodes], propNodes, callback, defaultValue);
                if(result !== null){
                    return result;
                }
            }
            else if((typeof node[propNodes] === "function") && (node[propNodes]().length > 0)){
                result = UtilsTreeStruct.getNode(node[propNodes], propNodes, callback, defaultValue);
                if(result !== null){
                    return result;
                }
            }
        }
        return defaultValue;
    }
    
     /**
     * Remove a node from the tree
     * @param {Array} - tree
     * @param {string} - proNodes - The property name of the children nodes 
     * @param {function} - callback - The callback function. It needs to return true or false
     * @returns {boolean} - True if the node was found. False otherwise.
     */
    static removeNode(tree, propNodes, callback){
        let i, node;
        
        for(i = 0; i < tree.length; i++){
            node = tree[i];
            
            if(callback(node)){
                tree.splice(i, 1);
                return true;
            }
            
            if((node.hasOwnProperty(propNodes)) && (node[propNodes].length > 0)){
                if(UtilsTreeStruct.removeNode(node[propNodes], propNodes, callback)){
                    return true;
                }
            }
            else if((typeof node[propNodes] === "function") && (node[propNodes]().length > 0)){
                if(UtilsTreeStruct.removeNode(node[propNodes](), propNodes, callback)){
                    return true;
                }
            }
        }
        return false;
    }
    
    /*static removeNode(tree, propNodes, callback){
        let i, node;
        
        for(i = 0; i < tree.length; i++){
            node = tree[i];
            
            if((node.hasOwnProperty(propNodes)) && (node[propNodes].length > 0)){
                if(callback(node)){
                    tree.splice(i, 1);
                    return true;
                }
                
                return UtilsTreeStruct.removeNode(node[propNodes], propNodes, callback);
            }
            else{
                if(callback(node)){
                    tree.splice(i, 1);
                    return true;
                }
            }
        }
        return false;
    }*/
}
/*
export class CSV {
    static download_csv(csv, filename) {
        var csvFile;
        var downloadLink;
    
        // CSV FILE
        csvFile = new Blob([csv], {type: "text/csv"});
    
        // Download link
        downloadLink = document.createElement("a");
    
        // File name
        downloadLink.download = filename;
    
        // We have to create a link to the file
        downloadLink.href = window.URL.createObjectURL(csvFile);
    
        // Make sure that the link is not displayed
        downloadLink.style.display = "none";
    
        // Add the link to your DOM
        document.body.appendChild(downloadLink);
    
        // Lanzamos
        downloadLink.click();
    }
    
    static export_table_to_csv(table, filename) {
        var csv = [];
        var rows = document.querySelectorAll("#"+table+" tr");
        var header = document.querySelectorAll("#"+table+" th");
        var headers = [];
        for (var i = 0; i < header.length; i++) {
            headers.push(header[i].innerText.replace('\n','').replace(',',';'));
        }
        csv.push(headers.join(","));
        
        for (var i = 0; i < rows.length; i++) {
            var row = [], cols = rows[i].querySelectorAll("td");
            
            for (var j = 0; j < cols.length; j++){
                let text = cols[j].innerText;
                if (text.length == 0) text = cols[j].firstElementChild.getAttribute("title")
                row.push(text);
            }
            
            csv.push(row.join(","));		
        }
    
        // Download CSV
        CSV.download_csv(csv.join("\n"), filename);
    }
}*/