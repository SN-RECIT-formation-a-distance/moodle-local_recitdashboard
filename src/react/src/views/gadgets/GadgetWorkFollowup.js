// This file is part of Moodle - http://moodle.org/
//
// Moodle is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// Moodle is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with Moodle.  If not, see <http://www.gnu.org/licenses/>.

/**
 * RÉCIT Dashboard 
 * 
 * @package   local_recitdashboard
 * @copyright 2019 RÉCIT 
 * @license   {@link http://www.gnu.org/licenses/gpl-3.0.html} GNU GPL v3 or later
 */

import React, { Component } from 'react';
import {Card, ButtonGroup, Button, Badge, Alert, ButtonToolbar, OverlayTrigger, Tooltip} from 'react-bootstrap';
import {faSync, faTimesCircle, faThumbsUp, faInfo} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {$glVars} from '../../common/common';
import { i18n } from '../../common/i18n';

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
            $glVars.feedback.showError(i18n.get_string('pluginname'), result.msg);
            this.setState({dataProvider: [], show: false});
        }
    }

    render() {    
        if(!this.state.show){ return null; }

        let bodyContent = {maxHeight: 400, overflowY: "auto", display: "flex", flexWrap: "wrap"};

        let nbItems = 0;

        for(let item of this.state.dataProvider){
            nbItems += parseFloat(item.nbItems);
        }
        
        let main = 
            <Card className='gadget'>
                <Card.Body>
                    <Card.Title>
                        <span>{i18n.get_string('worktracking')}</span>
                        <span><Badge pill variant="primary">{nbItems}</Badge> {i18n.get_string('itemtofollow')}</span>
                        <ButtonToolbar>
                            <ButtonGroup className="mr-2">
                                <Button variant="outline-secondary" onClick={this.getData} title={i18n.get_string('updategadget')}><FontAwesomeIcon icon={faSync}/></Button>
                                <Button variant="outline-secondary"  onClick={this.onClose} title={i18n.get_string('removegadget')}><FontAwesomeIcon icon={faTimesCircle}/></Button>
                                <OverlayTrigger placement="left" delay={{ show: 250 }} overlay={<Tooltip>{i18n.get_string('worktrackinfo')}</Tooltip>}>
                                    <Button variant="outline-secondary"><FontAwesomeIcon icon={faInfo}/></Button>
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
                                    <b>{i18n.get_string('activity')}: <a href={item.url} target={"_blank"}>{`${item.cmName} `}</a></b>
                                    <br/>
                                    <h2 style={{display: 'inline'}}><Badge pill variant="primary">{item.nbItems}</Badge></h2>
                                    <span>{` ${item.extra.description}.`}</span>
                                </Alert>
                            return result;
                        })}

                        {this.state.dataProvider.length === 0 && <Alert variant="success">{i18n.get_string('nofollowuptodo')}{" "}<FontAwesomeIcon icon={faThumbsUp}/></Alert>}
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
