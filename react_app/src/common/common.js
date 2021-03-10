//import Moment from 'moment'
import {I18n} from "../libs/utils/Utils";
import {FeedbackCtrl} from "../libs/components/Feedback";
import {AppWebApi} from "./AppWebApi";

export * from "./Options";

export const $glVars = {
    signedUser: {userId: 0},
    feedback: new FeedbackCtrl(),
    i18n: new I18n(),
    webApi: new AppWebApi()
}

export class AppCommon {
    static Colors = {
        red: '#dc3545',
        green: '#28a745',
        blue: '#007bff'
    }
}