import React, { Component } from 'react';
import {Card, ButtonGroup, Button, Badge, OverlayTrigger, Tooltip, ButtonToolbar, ProgressBar} from 'react-bootstrap';
import {faSync} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {DataGrid} from '../libs/components/Components';
import {$glVars} from '../common/common';

export class GadgetPendingHomeworks extends Component{
    static defaultProps = {        
        courseId: 0,
        groupId: 0,
        onSelectUser: null
    };

    constructor(props) {
        super(props);

        this.getData = this.getData.bind(this);
        this.getDataResult = this.getDataResult.bind(this);

        this.state = {dataProvider: []};
    }

    componentDidMount(){
        this.getData();
    }

    componentDidUpdate(prevProps){
        if((this.props.courseId !== prevProps.courseId) || (this.props.groupId !== prevProps.groupId)){
            this.getData();
        }
    }

    getData(){
        $glVars.webApi.getPendingHomeworks(this.props.courseId,  this.props.groupId, this.getDataResult);        
    }

    getDataResult(result){         
        if(result.success){
            this.setState({dataProvider: result.data});
        }
        else{
            $glVars.feedback.showError($glVars.i18n.tags.appname, result.msg);
        }
    }

    render() {    
        let bodyContent = {maxHeight: 400, overflowY: "auto"};
        
        let main = 
            <Card className='gadget'>
                <Card.Body>
                    <Card.Title>
                        <span>{"Travaux à corriger"}</span>
                        <ButtonToolbar aria-label="Toolbar with Buttons">
                            <ButtonGroup className="mr-2">
                                <Button  variant="outline-secondary" size="sm" onClick={this.getData}><FontAwesomeIcon icon={faSync}/></Button>
                            </ButtonGroup>
                        </ButtonToolbar>                        
                    </Card.Title>

                    <div style={bodyContent}>
                        <DataGrid orderBy={true}>
                            <DataGrid.Header>
                                <DataGrid.Header.Row>
                                    <DataGrid.Header.Cell style={{width: 70}}>{"#"}</DataGrid.Header.Cell>
                                    <DataGrid.Header.Cell >{"Élève"}</DataGrid.Header.Cell>
                                    <DataGrid.Header.Cell style={{width: 270}}>{"Activité"}</DataGrid.Header.Cell>
                                    <DataGrid.Header.Cell style={{width: 200}}>{"Date d'échéance"}</DataGrid.Header.Cell>
                                    <DataGrid.Header.Cell style={{width: 200}}>{"Dernière mise à jour"}</DataGrid.Header.Cell>
                                </DataGrid.Header.Row>
                            </DataGrid.Header>
                            <DataGrid.Body>
                                {this.state.dataProvider.map((item, index) => {
                                        let row = 
                                            <DataGrid.Body.Row key={index} onDbClick={() => this.props.onSelectUser({id: item.userId, name: item.studentName})}>
                                                <DataGrid.Body.Cell>{index + 1}</DataGrid.Body.Cell>
                                                <DataGrid.Body.Cell sortValue={item.studentName}><Button variant='link' onClick={() => this.props.onSelectUser({id: item.userId, name: item.studentName})}>{item.studentName}</Button></DataGrid.Body.Cell>
                                                <DataGrid.Body.Cell>{item.cmName}</DataGrid.Body.Cell>
                                                <DataGrid.Body.Cell>{item.dueDate}</DataGrid.Body.Cell>
                                                <DataGrid.Body.Cell>{item.lastUpdate}</DataGrid.Body.Cell>
                                            </DataGrid.Body.Row>
                                        return (row);                                    
                                    }
                                )}
                            </DataGrid.Body>
                        </DataGrid>                           
                    </div>
                </Card.Body>
            </Card>;

        return (main);
    }
}
