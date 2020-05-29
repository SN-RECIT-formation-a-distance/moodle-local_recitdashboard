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

    getReportDiagTag(courseId, groupId, userId, onSuccess){
        groupId = groupId || 0;
        let data = {courseId: courseId, cmId: 0, userId:userId, groupId: groupId, service: "getReportDiagTag"};
        this.post(this.gateway, data, onSuccess);
    }

    getGroupsProgressOverview(courseId, onSuccess){
        let data = {courseId: courseId, service: "getGroupsProgressOverview"};
        this.post(this.gateway, data, onSuccess);
    }

    getGroupsOverview(courseId, onSuccess){
        let data = {courseId: courseId, service: "getGroupsOverview"};
        this.post(this.gateway, data, onSuccess);
    }

    getStudentTracking(courseId, userId, onSuccess){
        userId = userId || 0;
        let data = {courseId: courseId, userId: userId, service: "getStudentTracking"};
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
    
};
