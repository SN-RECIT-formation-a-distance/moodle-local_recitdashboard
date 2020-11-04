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
        /*if(JSON.stringify(this.props.options) !== JSON.stringify(prevProps.options)){
            this.getData();
        }*/
        if(this.props.options.course.id !== prevProps.options.course.id){
            this.getData();
        }
    }

    getData(){
        $glVars.webApi.reportSectionCompletion(this.props.options.course.id, this.props.options.group.id, this.getDataResult);        
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
        let dataProvider = this.state.dataProvider;
        
        if(this.props.options.group.id > 0){
            dataProvider = dataProvider.filter(item => item.groupIds.includes(this.props.options.group.id.toString()));
        }

        if(this.props.options.student.id > 0){
            dataProvider = dataProvider.filter(item => item.userId === this.props.options.student.id);
        }

        let grades = JsNx.at(dataProvider, 0, {grades: []}).grades;

        let main = 
                <div >
                    <DataGrid orderBy={true}>
                        <DataGrid.Header>
                            <DataGrid.Header.Row>
                                <DataGrid.Header.Cell >{"Prénom / Nom"}</DataGrid.Header.Cell>
                                {grades.map((item, index) => {
                                    if(!this.filterSectionAndCm(item)){ return null;}

                                    let result = 
                                        <DataGrid.Header.Cell key={index}>
                                            <a href={`${M.cfg.wwwroot}/mod/${item.itemModule}/view.php?id=${item.cmId}`} target={"_blank"}>{item.itemName}</a>
                                        </DataGrid.Header.Cell>

                                    return (result);                                    
                                }
                            )}
                            </DataGrid.Header.Row>
                        </DataGrid.Header>
                        <DataGrid.Body>
                            {dataProvider.map((item, index) => {                                    
                                    let row = 
                                        <DataGrid.Body.Row key={index}>
                                            <DataGrid.Body.Cell sortValue={item.studentName}>
                                                <a href={`${M.cfg.wwwroot}/user/profile.php?id=${item.userId}`} target={"_blank"}>{item.studentName}</a>
                                            </DataGrid.Body.Cell>
                                            {item.grades.map((item, index) => {
                                                if(!this.filterSectionAndCm(item)){ return null;}

                                                let result = <DataGrid.Body.Cell style={{textAlign: "right"}} key={index}>{parseFloat(item.finalGrade).toFixed(2)}</DataGrid.Body.Cell>

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

    filterSectionAndCm(item){
        if((this.props.options.section.id > 0) && (item.sectionId !== this.props.options.section.id)){
            return false;
        }

        if((this.props.options.cm.id > 0) && (item.cmId !== this.props.options.cm.id)){
            return false;
        }

        return true;
    }
}