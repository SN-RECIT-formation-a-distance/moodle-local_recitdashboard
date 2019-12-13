import React, { Component } from 'react';
/*import {ButtonGroup, Button, Form, Col, Tabs, Tab, DropdownButton, Dropdown, Modal, Collapse, Card} from 'react-bootstrap';
import {faArrowLeft, faArrowRight, faPencilAlt, faPlusCircle, faWrench, faTrashAlt, faCopy, faBars, faGripVertical, faCheckSquare} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {ComboBox, FeedbackCtrl, DataGrid, RichEditor} from '../libs/components/Components';
import Utils, {UtilsMoodle, JsNx} from '../libs/utils/Utils';
import {$glVars} from '../common/common';
*/
export class TeacherView extends Component {
    constructor(props) {
        super(props);

        this.state = {};
    }

    componentDidMount(){
    }

    componentWillUnmount(){
    }

    render() {       
        let main = <h1>Student view</h1>;
            
        return (main);
    }
}

export class StudentView extends Component {
    constructor(props) {
        super(props);
    }

    render() {       
        let main = <h1>Student view</h1>;

        return (main);
    }
}
