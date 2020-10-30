import React, { Component } from 'react';
import {Card, ButtonGroup, Button, Badge, OverlayTrigger, Tooltip, DropdownButton, Dropdown, ButtonToolbar, ProgressBar} from 'react-bootstrap';
import {faSync} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {DataGrid} from '../../libs/components/Components';
import {JsNx} from '../../libs/utils/Utils';
import {$glVars} from '../../common/common';

export class ReportSectionCompletion  extends Component{
    static defaultProps = {        
        options: null
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
        // Typical usage (don't forget to compare props):
        if(JSON.stringify(this.props.options) !== JSON.stringify(prevProps.options)){
            this.getData();
        }
    }

    getData(){
        $glVars.webApi.reportSectionCompletion(this.props.options.course.id, this.props.options.group.id, this.getDataResult);        
    }

    getDataResult(result){         
        if(result.success){
            console.log(result.data)
            this.setState({dataProvider: result.data});
        }
        else{
            $glVars.feedback.showError($glVars.i18n.tags.appname, result.msg);
        }
    }

    render() {    
        let grades = JsNx.at(this.state.dataProvider, 0, {grades: []}).grades;

        let main = 
                <div >
                    <DataGrid orderBy={true}>
                        <DataGrid.Header>
                            <DataGrid.Header.Row>
                                <DataGrid.Header.Cell >{"Prénom / Nom"}</DataGrid.Header.Cell>
                                {grades.map((item, index) => {
                                    let result = <DataGrid.Header.Cell key={index}>{item.itemName}</DataGrid.Header.Cell>
                                    return (result);                                    
                                }
                            )}
                            </DataGrid.Header.Row>
                        </DataGrid.Header>
                        <DataGrid.Body>
                            {this.state.dataProvider.map((item, index) => {
                                    let row = 
                                        <DataGrid.Body.Row key={index}>
                                            <DataGrid.Body.Cell sortValue={item.studentName}>{item.studentName}</DataGrid.Body.Cell>
                                            {grades.map((item, index) => {
                                                let result = <DataGrid.Header.Cell key={index}>{item.finalGrade}</DataGrid.Header.Cell>
                                                return (result);                                    
                                            })}
                                        </DataGrid.Body.Row>
                                    return (row);                                    
                                }
                            )}
                        </DataGrid.Body>
                    </DataGrid>                           
                </div>;

        return (main);
    }

    getProgressColor(item){
        let threshold = 0.05;

        if(item.pctTime < item.pctWork){
            return "success";
        }
        else if(item.pctTime < item.pctWork + (item.pctWork * threshold)){
            return "warning";
        }
        else{
            return "danger";
        }
    }
}