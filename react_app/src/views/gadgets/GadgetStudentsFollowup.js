import React, { Component } from 'react';
import {Card, ButtonGroup, Button, Badge, Alert, ButtonToolbar} from 'react-bootstrap';
import {faSync, faTimesCircle, faThumbsUp} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {$glVars} from '../../common/common';

export class GadgetStudentsFollowup extends Component{
    static defaultProps = {        
        options: null
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
        if(this.props.options.course.id !== prevProps.options.course.id){
            this.getData();
        }
    }

    getData(){
        $glVars.webApi.getStudentsFollowup(this.props.options.course.id,  this.props.options.group.id, this.getDataResult);        
    }

    getDataResult(result){         
        if(result.success){
            this.setState({dataProvider: result.data, show: true});
        }
        else{
            $glVars.feedback.showError($glVars.i18n.tags.appname, result.msg);
        }
    }

    render() {    
        if(!this.state.show){ return null; }

        let bodyContent = {maxHeight: 400, overflowY: "auto"};
        
        let main = 
            <Card className='gadget'>
                <Card.Body>
                    <Card.Title>
                        <span>{"Suivi des élèves"}</span>
                        <ButtonToolbar aria-label="Toolbar with Buttons">
                            <ButtonGroup className="mr-2">
                                <Button  variant="outline-secondary" size="sm" onClick={this.getData} title="Mettre à jour le gadget"><FontAwesomeIcon icon={faSync}/></Button>
                                <Button  variant="outline-secondary" size="sm" onClick={this.onClose} title="Enlever le gadget"><FontAwesomeIcon icon={faTimesCircle}/></Button>
                            </ButtonGroup>
                        </ButtonToolbar>                        
                    </Card.Title>

                    <div style={bodyContent}>

                        {this.state.dataProvider.map((item, index) => {
                            let variant = "warning";

                            if(item.nb > 5){
                                variant = "danger";
                            }

                            let result = 
                                <Alert variant={variant} key={index} style={{margin: '1rem'}}>
                                    <b>Activité: <a href={item.url} target={"_blank"}>{`${item.cmName} `}</a></b>
                                    <br/>
                                    <h2 style={{display: 'inline'}}><Badge pill variant="primary">{item.nb}</Badge></h2>
                                    <span>{` ${item.description}.`}</span>
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
}
