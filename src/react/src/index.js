import React, { Component } from 'react';
import ReactDOM from "react-dom";

/**************************************************************************************
 *  il ne faut pas charger le bootstrap de base car il est déjà chargé dans le thème
 * //import 'bootstrap/dist/css/bootstrap.min.css';  
 **************************************************************************************/ 

import {faSync} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {VisualFeedback, Loading} from "./libs/components/Components";
import {MainView} from "./views/Views";
import {$glVars} from "./common/common";
import "./common/style.scss";

class App extends Component {
    static defaultProps = {
        signedUser: null,
        courseId: 0
    };

    constructor(props) {
        super(props);

        this.onFeedback = this.onFeedback.bind(this);

        $glVars.signedUser = this.props.signedUser;
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
                {$glVars.feedback.msg.map((item, index) => {  
                    return (<VisualFeedback key={index} id={index} msg={item.msg} type={item.type} title={item.title} timeout={item.timeout}/>);                                    
                })}
                <Loading webApi={$glVars.webApi}><FontAwesomeIcon icon={faSync} spin/></Loading>
                <MainView courseId={this.props.courseId} />
            </div>

        return (main);
    }

    onFeedback(){
        this.forceUpdate();
    }
}

document.addEventListener('DOMContentLoaded', function(){ 
    const domContainer = document.getElementById('recit_dashboard');
    let signedUser = {userId: domContainer.getAttribute('data-student-id')};

    ReactDOM.render(<App signedUser={signedUser} courseId={parseInt(domContainer.getAttribute('data-course-id'))}/>, domContainer);
}, false);


