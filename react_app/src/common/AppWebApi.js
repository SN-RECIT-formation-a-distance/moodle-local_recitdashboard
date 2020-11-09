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
    
    getEnrolledCourseList(userId, onSuccess){
        let data = {userId: userId, service: "getEnrolledCourseList"};
        this.post(this.gateway, data, onSuccess);
    }

    getEnrolledUserList(cmId, userId, courseId, onSuccess){
        let data = {cmId: cmId, userId: userId, courseId: courseId, service: "getEnrolledUserList"};
        this.post(this.gateway, data, onSuccess);
    }
    
    getCourseSectionActivityList(enrolled, onSuccess){
        enrolled = (typeof enrolled === 'boolean' ? enrolled : true);
        let data = {service: "getCourseSectionActivityList", enrolled: enrolled};
        this.post(this.gateway, data, onSuccess);
    }

    getCourseProgressionOverview(courseId, groupId, onSuccess){
        groupId = groupId || 0;
        let data = {courseId: courseId, groupId: groupId, service: "getCourseProgressionOverview"};
        this.post(this.gateway, data, onSuccess);
    }

    getCourseProgressionDetails(courseId, userId, onSuccess){
        let data = {courseId: courseId, userId: userId, service: "getCourseProgressionDetails"};
        this.post(this.gateway, data, onSuccess);
    }

    getCourseAttendance(courseId, groupId, onSuccess){
        groupId = groupId || 0;
        let data = {courseId: courseId, groupId: groupId, service: "getCourseAttendance"};
        this.post(this.gateway, data, onSuccess);
    }

    getStudentAssiduity(courseId, userId, onSuccess){
        userId = userId || 0;
        let data = {courseId: courseId, userId: userId, service: "getStudentAssiduity"};
        this.post(this.gateway, data, onSuccess);
    }

    getReportDiagTag(courseId, groupId, cmId, output, options, onSuccess){
        groupId = groupId || 0;
        cmId = cmId || 0;
        output = output || 'html';
        options = options || 'question';

        let data = {courseId: courseId, cmId: cmId, groupId: groupId, service: "getReportDiagTag", output: output, options: options};
        this.post(this.gateway, data, onSuccess);
    }

    getGroupsProgressOverview(courseId, onSuccess){
        let data = {courseId: courseId, service: "getGroupsProgressOverview"};
        this.post(this.gateway, data, onSuccess);
    }

    getGroupsOverview(courseId, onlyMyGroups, onSuccess){
        let data = {courseId: courseId, onlyMyGroups: (onlyMyGroups ? 1 : 0), service: "getGroupsOverview"};
        this.post(this.gateway, data, onSuccess);
    }

    getStudentTracking(courseId, userId, onlyMyGroups, onSuccess){
        userId = userId || 0;
        let data = {courseId: courseId, userId: userId, onlyMyGroups: (onlyMyGroups ? 1 : 0), service: "getStudentTracking"};
        this.post(this.gateway, data, onSuccess);
    }
    
    getUserProfile(courseId, userId, onSuccess){
        let data = {courseId: courseId, userId: userId, service: "getUserProfile"};
        this.post(this.gateway, data, onSuccess);
    }

    searchUser(queryStr, courseId, onSuccess){
        let data = {queryStr: queryStr, courseId: courseId || 0, service: "searchUser"};
        this.post(this.gateway, data, onSuccess);
    }
    
    getPendingActions(courseId, groupId, onSuccess){
        let data = {groupId: groupId, courseId: courseId, service: "getPendingActions"};
        this.post(this.gateway, data, onSuccess);
    }

    reportSectionCompletion(courseId, groupId, onSuccess){
        let data = {groupId: groupId, courseId: courseId, service: "reportSectionCompletion"};
        this.post(this.gateway, data, onSuccess);
    }
};
