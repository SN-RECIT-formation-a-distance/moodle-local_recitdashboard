import React, { Component } from 'react';
import {Card, ButtonGroup, Button, Badge, Alert, ButtonToolbar, OverlayTrigger, Tooltip} from 'react-bootstrap';
import {faSync, faTimesCircle, faThumbsUp, faInfo} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {$glVars} from '../../common/common';
import { JsNx } from '../../libs/utils/Utils';

export class GadgetStudentFollowup extends Component{
    static defaultProps = {        
        options: null
    };

    constructor(props) {
        super(props);

        this.onClose = this.onClose.bind(this);
        this.getData = this.getData.bind(this);
        this.getDataResult = this.getDataResult.bind(this);
        this.getUsers = this.getUsers.bind(this);

        this.state = {dataProvider: [], show: true};
    }

    componentDidMount(){
        this.getData();
    }

    componentDidUpdate(prevProps){
        if((this.props.options.course.id !== prevProps.options.course.id) || (this.props.options.group.id !== prevProps.options.group.id)){
            this.getData();
        }
    }

    getData(){
        $glVars.webApi.getStudentFollowup(this.props.options.course.id,  this.props.options.group.id, this.getDataResult);        
    }

    getDataResult(result){         
        if(result.success){
            this.setState({dataProvider: result.data, show: true});
        }
        else{
            $glVars.feedback.showError($glVars.i18n.tags.appname, result.msg);
            this.setState({dataProvider: [], show: false});
        }
    }

    render() {    
        if(!this.state.show){ return null; }

        let bodyContent = {maxHeight: 400, overflowY: "auto", display: "flex", flexWrap: "wrap"};

        let main = 
            <Card className='gadget'>
                <Card.Body>
                    <Card.Title>
                        <span>{`Suivi des élèves`}</span>
                        <span><Badge pill variant="primary">{this.state.dataProvider.length}</Badge>{` élève(s) à suivre`}</span>
                        <ButtonToolbar aria-label="Toolbar with Buttons">
                            <ButtonGroup className="mr-2">
                                <Button  variant="outline-secondary" size="sm" onClick={this.getData} title="Mettre à jour le gadget"><FontAwesomeIcon icon={faSync}/></Button>
                                <Button  variant="outline-secondary" size="sm" onClick={this.onClose} title="Enlever le gadget"><FontAwesomeIcon icon={faTimesCircle}/></Button>
                            </ButtonGroup>
                        </ButtonToolbar>                        
                    </Card.Title>

                    <div style={bodyContent}>

                        {this.state.dataProvider.map((item, index) => {
                            let result = 
                                <Alert variant="warning" key={index} style={{margin: '.5rem'}}>
                                    {this.getUsers(item)}
                                </Alert>
                            return result;
                        })}

                        {this.state.dataProvider.length === 0 &&  <Alert variant="success">{"Pas de suivi à faire. "}<FontAwesomeIcon icon={faThumbsUp}/></Alert>}
                    </div>
                </Card.Body>
            </Card>;

        return (main);
    }

    onClose(){
        this.setState({show: false});
    }

    getUsers(item){        
        let result = 
            <span>
                {"L'élève "}<a href={`${M.cfg.wwwroot}/user/view.php?id=${item.userId}&course=${this.props.options.course.id}`} target='_blank'>{item.username}</a>
                {` a besoin du suivi :`}
                <ul>
                {item.issues.map((issue, index) => {
                    let result = null;

                    if(issue.hasOwnProperty('nbDaysLastAccess')){
                        result = <li key={index} >{`${issue.nbDaysLastAccess} jours sans se connecter au cours.`}</li>;
                    }
                    else if(issue.hasOwnProperty('nbDaysLate')){
                        result = <li key={index} >{`L'activité `}<a target='_blank' href={issue.url}>{issue.cmName}</a>{` est ${issue.nbDaysLate} jour en retard.`}</li>;
                    }
                    
                    return result;
                })}
                </ul>
            </span>;

        return result;
    }
}
