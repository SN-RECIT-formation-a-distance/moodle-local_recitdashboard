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
import {WebApi, JsNx} from '../libs/utils/Utils';
import { Options } from './Options';

export class AppWebApi extends WebApi
{    
    constructor(){
        super(Options.getGateway());
                
        this.http.useCORS = true;
        this.sid = 0;
        this.observers = [];
        this.http.timeout = 30000; // 30 secs
    }

    addObserver(id, update, observables){
        this.observers.push({id:id, update:update, observables: observables});
    }

    removeObserver(id){
        JsNx.removeItem(this.observers, "id", id);
    }

    notifyObservers(observable){
        for(let o of this.observers){
            if(o.observables.includes(observable)){
                o.update();
            }
        }
    }
    
    getEnrolledUserList(cmId, userId, courseId, onSuccess){
        let data = {sesskey: M.cfg.sesskey, cmId: cmId, userId: userId, courseId: courseId, service: "getEnrolledUserList"};
        this.post(this.gateway, data, onSuccess);
    }
    
    getCourseSectionActivityList(enrolled, onSuccess){
        enrolled = (typeof enrolled === 'boolean' ? enrolled : true);
        let data = {sesskey: M.cfg.sesskey, service: "getCourseSectionActivityList", enrolled: enrolled};
        this.post(this.gateway, data, onSuccess);
    }
    
    getCourseList(enrolled, onSuccess){
        enrolled = (typeof enrolled === 'boolean' ? enrolled : true);
        let data = {sesskey: M.cfg.sesskey, service: "getCourseList", enrolled: enrolled};
        this.post(this.gateway, data, onSuccess);
    }
    
    getSectionActivityList(courseId, onSuccess){
        let data = {sesskey: M.cfg.sesskey, service: "getSectionActivityList", courseId: courseId};
        this.post(this.gateway, data, onSuccess);
    }
    
    getUserOptions(onSuccess){
        let data = {sesskey: M.cfg.sesskey, service: "getUserOptions"};
        this.post(this.gateway, data, onSuccess);
    }
    
    setUserOption(key, value, onSuccess){
        let data = {sesskey: M.cfg.sesskey, service: "setUserOption", key:key, value:value};
        this.post(this.gateway, data, onSuccess);
    }

    getReportDiagTag(courseId, groupId, sectionId, cmId, output, options, onSuccess){
        groupId = groupId || 0;
        sectionId = sectionId || 0;
        cmId = cmId || 0;
        output = output || 'html';
        options = options || 'question';

        let data = {sesskey: M.cfg.sesskey, courseId: courseId, sectionId: sectionId, cmId: cmId, groupId: groupId, service: "getReportDiagTag", output: output, options: options};
        this.post(this.gateway, data, onSuccess);
    }

    reportQuiz(courseId, groupId, cmId, onSuccess){
        groupId = groupId || 0;
        cmId = cmId || 0;
        let output = 'json';
        let options = 'question';

        let data = {sesskey: M.cfg.sesskey, courseId: courseId, cmId: cmId, groupId: groupId, service: "reportQuiz", output: output, options: options};
        this.post(this.gateway, data, onSuccess);
    }

    getGroupsOverview(courseId, groupId, onSuccess){
        let data = {sesskey: M.cfg.sesskey, courseId: courseId, groupId: groupId, service: "getGroupsOverview"};
        this.post(this.gateway, data, onSuccess);
    }
   
    getWorkFollowup(courseId, groupId, onSuccess){
        let data = {sesskey: M.cfg.sesskey, groupId: groupId, courseId: courseId, service: "getWorkFollowup"};

        let onSuccessTmp = function(result){
            /*for(let i = 0; i < result.data.length; i++){
                result.data[i].extra = JSON.parse(result.data[i].extra);
            }*/ //Not neeeded with moodle db functions

            onSuccess(result);
        }

        this.post(this.gateway, data, onSuccessTmp);
    }

    getStudentFollowup(courseId, groupId, onSuccess){
        let data = {sesskey: M.cfg.sesskey, groupId: groupId, courseId: courseId, service: "getStudentFollowup"};

        this.post(this.gateway, data, onSuccess);
    }

    reportSectionResults(courseId, groupId, onSuccess){
        let data = {sesskey: M.cfg.sesskey, groupId: groupId, courseId: courseId, service: "reportSectionResults"};
        this.post(this.gateway, data, onSuccess);
    }

    reportActivityCompletion(courseId, groupId, onSuccess){
        let data = {sesskey: M.cfg.sesskey, groupId: groupId, courseId: courseId, service: "reportActivityCompletion"};
        this.post(this.gateway, data, onSuccess);
    }

    reportQuizEssayAnswers(data){
        data = data || {};

        data.sesskey = M.cfg.sesskey;

        let params = new URLSearchParams(data).toString();

        window.open(`${this.gateway}?${params}`, '_blank');
    }
};
