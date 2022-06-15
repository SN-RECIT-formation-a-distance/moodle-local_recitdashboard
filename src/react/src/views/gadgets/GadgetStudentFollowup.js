import React, { Component } from 'react';
import {Card, ButtonGroup, Button, Badge, Alert, ButtonToolbar, OverlayTrigger, Tooltip, Modal, Form} from 'react-bootstrap';
import {faSync, faTimesCircle, faThumbsUp, faInfo, faCog, faSlidersH} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {$glVars} from '../../common/common';
import { JsNx } from '../../libs/utils/Utils';
import { OptionManager } from '../../common/Options';
import { FeedbackCtrl } from '../../libs/components/Feedback';
import { i18n } from '../../common/i18n';

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
            {label: i18n.get_string('dayswithoutconnect'), type: 'number', min: 1, max: 365, name: 'dayswithoutconnect'},
            {label: i18n.get_string('daysdueintervalmin'), type: 'number', min: 0, max: 365, name: 'daysdueintervalmin'},
            {label: i18n.get_string('daysdueintervalmax'), type: 'number', min: 1, max: 365, name: 'daysdueintervalmax'},
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
            $glVars.feedback.showError(i18n.get_string('pluginname'), result.msg);
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
                        <span>{i18n.get_string('studenttracking')}</span>
                        <span><Badge pill variant="primary">{this.state.dataProvider.length}</Badge>{' '+i18n.get_string('studenttotrack')}</span>
                        <ButtonToolbar>
                            <ButtonGroup className="mr-2">
                                <Button variant="outline-secondary" onClick={() => this.openPopup(true)} title={i18n.get_string('options')}><FontAwesomeIcon icon={faSlidersH}/></Button>
                                <Button variant="outline-secondary" onClick={this.getData} title={i18n.get_string('updategadget')}><FontAwesomeIcon icon={faSync}/></Button>
                                <Button variant="outline-secondary" onClick={this.onClose} title={i18n.get_string('removegadget')}><FontAwesomeIcon icon={faTimesCircle}/></Button>
                                <OverlayTrigger placement="left" delay={{ show: 250 }} overlay={<Tooltip>{i18n.get_string('studenttrackinfo')}</Tooltip>}>
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

                        {this.state.dataProvider.length === 0 && <Alert variant="success">{i18n.get_string('nofollowuptodo')} <FontAwesomeIcon icon={faThumbsUp}/></Alert>}
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
                {i18n.get_string('student')} <a href={`${M.cfg.wwwroot}/user/view.php?id=${item.userId}&course=${this.props.options.course.id}`} target='_blank'>{item.username}</a>
                {i18n.get_string('needfollowup')}
                <ul>
                {item.issues.map((issue, index) => {
                    let result = null;

                    if(issue.hasOwnProperty('nbDaysLastAccess')){
                        result = <li key={index} ><a target="_blank" href={`${M.cfg.wwwroot}/report/log/user.php?id=${item.userId}&course=${this.props.options.course.id}&mode=all`}>{`${issue.nbDaysLastAccess} jours`}</a>{` sans se connecter au cours.`}</li>;
                    }
                    else if(issue.hasOwnProperty('nbDaysLate')){
                        result = <li key={index} >{i18n.get_string('activity')} <a target='_blank' href={issue.url}>{issue.cmName}</a>: {issue.nbDaysLate} {i18n.get_string('dayslate')}</li>;
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
                <Modal.Title>{i18n.get_string('options')}</Modal.Title>
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
                    <Button variant="secondary" onClick={this.props.onHide}>{i18n.get_string('cancel')}</Button>
                    <Button variant="success" onClick={() => this.onSave()}>{i18n.get_string('save')}</Button>
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
        FeedbackCtrl.instance.showInfo(i18n.get_string('pluginname'), i18n.get_string('msgsuccess'), 3);
        this.props.onHide(true);
    }
}