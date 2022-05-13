import React, { Component } from 'react';
import {Card, ButtonGroup, Button, Badge, Alert, ButtonToolbar, OverlayTrigger, Tooltip, Modal, Form} from 'react-bootstrap';
import {faSync, faTimesCircle, faThumbsUp, faInfo, faCog, faSlidersH} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {$glVars} from '../../common/common';
import { JsNx } from '../../libs/utils/Utils';
import { OptionManager } from '../../common/Options';
import { FeedbackCtrl } from '../../libs/components/Feedback';

export class GadgetStudentFollowup extends Component{
    static defaultProps = {        
        options: null,
        onClose: null,
        show: true,
    };

    constructor(props) {
        super(props);

        this.onClose = this.onClose.bind(this);
        this.getData = this.getData.bind(this);
        this.getDataResult = this.getDataResult.bind(this);
        this.getUsers = this.getUsers.bind(this);

        this.state = {dataProvider: [], show: true, options: {}, optionPopup: false};
        this.optionList = [
            {label: 'Nombre de jours sans se connecter', type: 'number', min: 1, max: 365, name: 'dayswithoutconnect'},
            {label: 'Interval de jours minimum pour travaux à remettre', type: 'number', min: 0, max: 365, name: 'daysdueintervalmin'},
            {label: 'Interval de jours maximum pour travaux à remettre', type: 'number', min: 1, max: 365, name: 'daysdueintervalmax'},
        ];
    }

    componentDidMount(){
        this.getData();
    }

    componentDidUpdate(prevProps){
        if((this.props.options.course.id !== prevProps.options.course.id) || (this.props.options.group.id !== prevProps.options.group.id)){
            this.getData();
        }
        if(this.props.show !== this.state.show){
            this.setState({show: this.props.show});
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
            <Card className='gadget' key="1">
                <Card.Body>
                    <Card.Title>
                        <span>{`Suivi des élèves`}</span>
                        <span><Badge pill variant="primary">{this.state.dataProvider.length}</Badge>{` élève(s) à suivre`}</span>
                        <ButtonToolbar aria-label="Toolbar with Buttons">
                            <ButtonGroup className="mr-2">
                                <Button  variant="outline-secondary" onClick={() => this.openPopup(true)} title="Options"><FontAwesomeIcon icon={faSlidersH}/></Button>
                                <Button  variant="outline-secondary" onClick={this.getData} title="Mettre à jour le gadget"><FontAwesomeIcon icon={faSync}/></Button>
                                <Button  variant="outline-secondary" onClick={this.onClose} title="Enlever le gadget"><FontAwesomeIcon icon={faTimesCircle}/></Button>
                                <OverlayTrigger placement="left" delay={{ show: 250 }} overlay={<Tooltip>{`Cette zone alerte l'enseignant lors des situations suivantes : L'élève n'a pas remis un devoir ou un test n'a pas été répondu alors que la date d'échéance est dépassée.  Ces messages d'alerte s'effacent après une période déterminée. Une alerte apparaît lorsque l'élève ne s'est pas connecté à la plateforme depuis plus que 5 jours.`}</Tooltip>}>
                                    <Button variant="outline-secondary"><FontAwesomeIcon icon={faInfo}/></Button>
                                </OverlayTrigger>
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

            let popup = <OptionPopup key="2" onHide={(e) => this.openPopup(false, e)} show={this.state.optionPopup} optionList={this.optionList}/>

        return [main,popup];
    }

    openPopup(toggle, saved){
        this.setState({optionPopup:toggle});
        if (saved){
            this.getData();
        }
    }

    onClose(){
        this.setState({show: false});
        if (this.props.onClose){
            this.props.onClose();
        }
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
                        result = <li key={index} ><a target="_blank" href={`${M.cfg.wwwroot}/report/log/user.php?id=${item.userId}&course=${this.props.options.course.id}&mode=all`}>{`${issue.nbDaysLastAccess} jours`}</a>{` sans se connecter au cours.`}</li>;
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


export class OptionPopup extends Component{
    static defaultProps = {        
        options: null,
        onClose: null,
        show: false,
        onHide: null,
    };

    constructor(props) {
        super(props);
        this.state = {options:{}};
    }

    componentDidMount(){
        this.setState({options: OptionManager.options});
    }


    render() {    
        if(!this.props.show){ return null; }

            let popup = <Modal key="2" onHide={this.props.onHide} show={this.props.show}>
                <Modal.Header closeButton>
                <Modal.Title>Options</Modal.Title>
                </Modal.Header>
            
                {this.state.options && <Modal.Body>
                    {this.props.optionList.map((o, index) => {
                        return <Form.Group key={index}>
                          <Form.Label>{o.label}</Form.Label>
                          <Form.Control type={o.type} min={o.min} max={o.max} value={this.state.options[o.name]} name={o.name} onChange={(e) => this.onOptionChange(e)} />
                        </Form.Group>
                    })}
                </Modal.Body>}
            
                <Modal.Footer>
                    <Button variant="secondary" onClick={this.props.onHide}>Annuler</Button>
                    <Button variant="success" onClick={() => this.onSave()}>Enregistrer</Button>
                </Modal.Footer>
            </Modal>

        return (popup);
    }

    onOptionChange(e){
        let key = e.target.name;
        let options = this.state.options;
        options[key] = e.target.value
        this.setState({options:options});
    }

    onSave(){
        for (let v of this.props.optionList){
            let key = v.name;
            let val = this.state.options[key];
            OptionManager.setValue(key, val);
        }
        FeedbackCtrl.instance.showInfo($glVars.i18n.tags.appName, $glVars.i18n.tags.msgSuccess, 3);
        this.props.onHide(true);
    }
}