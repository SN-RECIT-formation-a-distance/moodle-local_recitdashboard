import React, { Component } from 'react';
import ReactDOM from "react-dom";

/**************************************************************************************
 *  il ne faut pas charger le bootstrap de base car il est déjà chargé dans le thème
 * //import 'bootstrap/dist/css/bootstrap.min.css';  
 **************************************************************************************/ 

import {faSync} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {VisualFeedback, Loading, Components} from "./libs/components/Components";
import {UtilsMoodle} from "./libs/utils/Utils";
import {MainView} from "./views/Views";
import {$glVars} from "./common/common";
import "./common/style.scss";
export * from "./common/i18n";

class App extends Component {
    static defaultProps = {
        signedUser: null,
        courseId: 0
    };

    constructor(props) {
        super(props);

        this.onFeedback = this.onFeedback.bind(this);

        $glVars.signedUser = this.props.signedUser;

        let mode = (UtilsMoodle.checkRoles($glVars.signedUser.roles, UtilsMoodle.rolesL2) ? 't' : 's');

        this.state = {mode: mode};
    }

    componentDidMount(){

        $glVars.feedback.addObserver("App", this.onFeedback); 
    }

    componentWillUnmount(){
        $glVars.feedback.removeObserver("App");        
    }

    render() {  
        let main =
            <div>
                <MainView courseId={this.props.courseId} />
                {$glVars.feedback.msg.map((item, index) => {  
                    return (<VisualFeedback key={index} id={index} msg={item.msg} type={item.type} title={item.title} timeout={item.timeout}/>);                                    
                })}
                <Loading webApi={$glVars.webApi}><FontAwesomeIcon icon={faSync} spin/></Loading>
            </div>

        return (main);
    }

    onFeedback(){
        this.forceUpdate();
    }
}

document.addEventListener('DOMContentLoaded', function(){ 
    const domContainer = document.getElementById('recit_dashboard');
    let signedUser = {userId: domContainer.getAttribute('data-student-id'), roles: domContainer.getAttribute('data-roles').split(",")};

    if(UtilsMoodle.checkRoles(signedUser.roles, UtilsMoodle.rolesL3)){
        window.location.href = `${M.cfg.wwwroot}`;
        return;
    }

    ReactDOM.render(<App signedUser={signedUser} courseId={parseInt(domContainer.getAttribute('data-course-id'))}/>, domContainer);
}, false);


