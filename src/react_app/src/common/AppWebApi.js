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
    
    getCourseProgressionOverview(courseId, onSuccess){
        let data = {courseId: courseId, service: "getCourseProgressionOverview"};
        this.post(this.gateway, data, onSuccess);
    }

    getCourseProgressionDetails(courseId, userId, onSuccess){
        let data = {courseId: courseId, userId: userId, service: "getCourseProgressionDetails"};
        this.post(this.gateway, data, onSuccess);
    }

    getCourseAttendance(courseId, onSuccess){
        let data = {courseId: courseId, service: "getCourseAttendance"};
        this.post(this.gateway, data, onSuccess);
    }

    getReportDiagTag(courseId, onSuccess){
        let data = {courseId: courseId, cmId: 0, userId:0, service: "getReportDiagTag"};
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
};
