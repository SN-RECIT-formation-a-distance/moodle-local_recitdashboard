/*
import React, { Component } from 'react';
import { Card, ButtonGroup, ButtonToolbar, Button, OverlayTrigger, Tooltip} from 'react-bootstrap';
import {faSync, faInfo, faSearchPlus, faFileSignature, faUserPlus, faUserClock, faBell, faTasks} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {$glVars} from '../common/common';
//import { JsNx } from '../libs/utils/Utils';

export class GadgetStudentTracking extends Component{
    static defaultProps = {        
        options: null,
        onSelectGroup: null,
        onSelectUser: null
    };

    constructor(props) {
        super(props);

        this.getData = this.getData.bind(this);
        this.getDataResult = this.getDataResult.bind(this);

        this.state = {dataProvider:[]};
    }

    componentDidMount(){
        this.getData();
    }

    componentDidUpdate(prevProps){
       // Typical usage (don't forget to compare props):
       if ((this.props.options.selectedCourse.courseId !== prevProps.options.selectedCourse.courseId) || 
            (this.props.options.onlyMyGroups !== prevProps.options.onlyMyGroups)){
            this.getData();
        }
    }

    getData(){
        $glVars.webApi.getStudentTracking(this.props.options.selectedCourse.courseId, this.props.options.userId, this.props.options.onlyMyGroups, this.getDataResult);        
    }

    getDataResult(result){         
        if(result.success){
            this.setState({dataProvider: result.data});
        }
        else{
            $glVars.feedback.showError($glVars.i18n.tags.appname, result.msg);
        }
    }

    render(){
        let main = this.getContent();
        return main;
    }

    getTitle(){
        let result = null;

        if(this.props.options.userId === 0){
            result = 
                <Card.Title>
                    <div>
                        {"Élèves requèrant attention particulière "}
                        <OverlayTrigger placement="right" delay={{ show: 250, hide: 400 }} overlay={<Tooltip>{`En cliquant sur le groupe on obtient une vue détaillée des données du group`}</Tooltip>}>
                            <Button size="sm" variant="outline-secondary"><FontAwesomeIcon icon={faInfo}/></Button>
                        </OverlayTrigger>
                    </div>
                    <ButtonToolbar aria-label="Toolbar with Buttons">
                        <ButtonGroup  >
                            <Button  variant="outline-secondary" size="sm" onClick={this.getData}><FontAwesomeIcon icon={faSync}/></Button>
                        </ButtonGroup>
                    </ButtonToolbar>                              
                </Card.Title>;
        }

        return result;
    }

    getContent(){
        let result = null;

        if(this.state.dataProvider.length === 0){ return result;}

        if(this.props.options.userId === 0){
            result = 
            <Card className='gadget-student-tracking'>
                <Card.Body>
                    {this.getTitle()}
                    <div className='content'>
                        {this.state.dataProvider.map((item, index) => {
                            return <GroupView key={index} data={item}  onSelectGroup={this.props.onSelectGroup} onSelectUser={this.props.onSelectUser} />;
                        })}
                    </div>
                </Card.Body>
            </Card>;
                
        }
        else{  
            let item = this.state.dataProvider[0].students[0]; // always one item
            result = <StudentView data={item}/>;
        }

        return result;
    }
}

class AView extends Component{
    getVisualItem(data, attr, value, title, icon, text){
        let result = 
            <div>
                <Button size="sm" variant={(data[attr] === value ? 'outline-success' : 'outline-danger')} title={title}>
                    {text}
                    <FontAwesomeIcon icon={icon}/>
                </Button>
            </div>;

        return result;
    }

    getContractSigned(item){
        return this.getVisualItem(item, 'contractSigned', 1, "Signature du contrat", faFileSignature, ``);
    }

    getNewStudent(item){
        return this.getVisualItem(item, 'newStudent', 0, "Nouveau élève", faUserPlus, ``);
    }

    getExtendedAbsence(item){
        return this.getVisualItem(item, 'extendedAbsence', 0, "Absence prolongée (dernier accès plus de 5 jours)", faUserClock, ``);
    }
    
    getNbLateActivities(item){
        return this.getVisualItem(item, 'nbLateActivities', 0, "Activités en retard", faTasks, `${item.nbLateActivities} `);
    }
         
    getPendingMessages(item){
        return this.getVisualItem(item, 'pendingMessages', 0, "Courriel en attente", faBell, `${item.pendingMessages} `);
    }
}

class StudentView extends AView{
    static defaultProps = {        
        data: null,
    };

    render(){
        let item = this.props.data;
        let main = 
            <div style={{display: "flex", margin: "1rem", justifyContent: "space-between", width: 200}}>
                {this.getContractSigned(item)}
                {this.getExtendedAbsence(item)}
                {this.getNbLateActivities(item)}
                {this.getPendingMessages(item)}
            </div>;
        return main;
    }
}

class GroupView extends AView{
    static defaultProps = {        
        data: null,
        onSelectGroup: null,
        onSelectUser: null
    };

    render(){
        let title = (this.props.data.groupName.length > 0 ? `Groupe ${this.props.data.groupName}` : `Pas de groupe`)

        let main = 
            <div className='item'>
                {this.props.onSelectGroup !== null &&
                    <Button  size="sm" variant="link" onClick={() => this.props.onSelectGroup({id: this.props.data.groupId, name: this.props.data.groupName})}>
                        <h5 className='item-title'>{title}</h5>
                    </Button>
                }
                {this.props.data.students.map((item, index) => {
                    let row = <div key={index} className='visual-data'>
                                <div><a href="#" onClick={() => this.props.onSelectUser({id: item.userId, name: item.studentName})}>{item.studentName}</a></div>
                                {this.getContractSigned(item)}
                                {this.getNewStudent(item)}
                                {this.getExtendedAbsence(item)}
                                {this.getNbLateActivities(item)}
                                {this.getPendingMessages(item)}
                            </div>;
                    return row;
                })}
            </div>;
        return main;
    }
}
*/