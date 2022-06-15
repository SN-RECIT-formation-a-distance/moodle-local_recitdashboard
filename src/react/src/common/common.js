//import Moment from 'moment'
import {FeedbackCtrl} from "../libs/components/Feedback";
import {AppWebApi} from "./AppWebApi";

export * from "./Options";

export const $glVars = {
    signedUser: {userId: 0},
    feedback: new FeedbackCtrl(),
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