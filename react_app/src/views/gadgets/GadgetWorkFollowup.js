import React, { Component } from 'react';
import {Card, ButtonGroup, Button, Badge, Alert, ButtonToolbar, OverlayTrigger, Tooltip} from 'react-bootstrap';
import {faSync, faTimesCircle, faThumbsUp, faInfo} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {$glVars} from '../../common/common';

export class GadgetWorkFollowup extends Component{
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

        this.state = {dataProvider: [], show: true};
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
        $glVars.webApi.getWorkFollowup(this.props.options.course.id,  this.props.options.group.id, this.getDataResult);        
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

        let nbItems = 0;

        for(let item of this.state.dataProvider){
            nbItems += item.nbItems;
        }
        
        let main = 
            <Card className='gadget'>
                <Card.Body>
                    <Card.Title>
                        <span>{`Suivi des travaux`}</span>
                        <span><Badge pill variant="primary">{nbItems}</Badge>{` item(s) à suivre`}</span>
                        <ButtonToolbar aria-label="Toolbar with Buttons">
                            <ButtonGroup className="mr-2">
                                <Button  variant="outline-secondary" size="sm" onClick={this.getData} title="Mettre à jour le gadget"><FontAwesomeIcon icon={faSync}/></Button>
                                <Button  variant="outline-secondary" size="sm" onClick={this.onClose} title="Enlever le gadget"><FontAwesomeIcon icon={faTimesCircle}/></Button>
                                <OverlayTrigger placement="left" delay={{ show: 250 }} overlay={<Tooltip>{`La pastille de couleur passe du jaune au rouge lorsqu'un travail remis par l'élève date de plus de 7 jours.`}</Tooltip>}>
                                    <Button size="sm" variant="outline-secondary"><FontAwesomeIcon icon={faInfo}/></Button>
                                </OverlayTrigger>
                            </ButtonGroup>
                        </ButtonToolbar>                        
                    </Card.Title>

                    <div style={bodyContent}>

                        {this.state.dataProvider.map((item, index) => {
                            let variant = "warning";

                            let diffInDays = Math.floor(Math.abs(new Date() - new Date(item.timeModified)) / 86400000);

                            if(diffInDays > 7) {
                                variant = "danger";
                            }

                            let result = 
                                <Alert variant={variant} key={index} style={{margin: '.5rem'}}>
                                    <b>Activité: <a href={item.url} target={"_blank"}>{`${item.cmName} `}</a></b>
                                    <br/>
                                    <h2 style={{display: 'inline'}}><Badge pill variant="primary">{item.nbItems}</Badge></h2>
                                    <span>{` ${item.extra.description}.`}</span>
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
        if (this.props.onClose){
            this.props.onClose();
        }
    }
}
