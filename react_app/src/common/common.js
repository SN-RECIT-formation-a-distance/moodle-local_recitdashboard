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
        lightRed: "#FFCCCC",
        green: '#28a745',
        lightGreen: "#C3DFCA",
        blue: '#007bff',
        lightYellow: "#FFFFCC",
        lightOrange: "#FFCC99"
    }
}