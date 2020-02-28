
import React, { Component } from 'react';
import { Card, ButtonGroup, ButtonToolbar, Button, OverlayTrigger, Tooltip} from 'react-bootstrap';
import {faSync, faInfo, faSearchPlus, faFileSignature, faUserPlus, faUserClock, faEnvelope, faTasks} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {$glVars} from '../common/common';
//import { JsNx } from '../libs/utils/Utils';

export class GadgetStudentRadar extends Component{
    static defaultProps = {        
        courseId: 0,
        onSelectGroup: null
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
       if (this.props.courseId !== prevProps.courseId) {
            this.getData();
        }
    }

    getData(){
        $glVars.webApi.getStudentRadar(this.props.courseId, this.getDataResult);        
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
        
        let main =
            <Card style={{flexGrow: 1, margin: 5}}>
                <Card.Body>
                    <Card.Title style={{display: "flex", justifyContent: "space-between"}}>
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
                    </Card.Title>

                    <div style={{display: "grid", gridTemplateColumns: "auto auto auto", gridGap: "1rem"}}>
                        {this.state.dataProvider.map((item, index) => {
                            return <GroupItem key={index} data={item}  onSelectGroup={this.props.onSelectGroup} />;
                        })}
                    </div>
                </Card.Body>
            </Card>;
        return main;
    }
}


class GroupItem extends Component{
    static defaultProps = {        
        data: null,
        onSelectGroup: null
    };

    render(){
        let title = (this.props.data.groupName.length > 0 ? `Groupe ${this.props.data.groupName}` : `Pas de groupe`)

        let main = 
            <div style={{border: "1px solid #efefef"}}>
                <h5 style={{marginTop: 10, marginLeft: 10}}>{title}<Button  size="sm" variant="link" onClick={() => this.props.onSelectGroup(this.props.data.groupName)}>
                    <FontAwesomeIcon icon={faSearchPlus}/></Button>
                </h5>
                {this.props.data.students.map((item, index) => {
                    let row = <div key={index} style={{display: "grid", gridTemplateColumns: "50% auto auto auto auto auto", marginBottom: ".2rem", padding: ".5rem"}}>
                                <div>{item.studentName}</div>
                                <div><Button size="sm" variant={(item.contractSigned === 1 ? 'outline-success' : 'outline-danger')} title='Signature du contrat'><FontAwesomeIcon icon={faFileSignature}/></Button></div>
                                <div><Button size="sm" variant={(item.newStudent === 0 ? 'outline-success' : 'outline-danger')} title="Nouveau élève"><FontAwesomeIcon icon={faUserPlus}/></Button></div>
                                <div><Button size="sm" variant={(item.extendedAbsence === 0 ? 'outline-success' : 'outline-danger')} title="Absence prolongée (dernier accès plus de 5 jours)"><FontAwesomeIcon icon={faUserClock}/></Button></div>
                                <div><Button size="sm" variant={(item.nbLateActivities === 0 ? 'outline-success' : 'outline-danger')} title="Activités en retard">{`${item.nbLateActivities} `}<FontAwesomeIcon icon={faTasks}/></Button></div>
                                <div><Button size="sm" variant={(item.pendingMessages === 0 ? 'outline-success' : 'outline-danger')} title="Courriel en attente">{`${item.pendingMessages} `}<FontAwesomeIcon icon={faEnvelope}/></Button></div>
                            </div>;
                    return row;
                })}
            </div>;
        return main;
    }
}
