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
// along with Moodle. If not, see <http://www.gnu.org/licenses/>.

/**
 * RÉCIT Dashboard 
 * 
 * @package   local_recitdashboard
 * @copyright 2019 RÉCIT 
 * @license   {@link http://www.gnu.org/licenses/gpl-3.0.html} GNU GPL v3 or later
 */
import React, { Component } from 'react';
import {DataGrid} from '../../libs/components/Components';
import {JsNx} from '../../libs/utils/Utils';
import {$glVars, Options, AppCommon} from '../../common/common';
import { i18n } from '../../common/i18n';

export class ReportSectionResults  extends Component{
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
        if((this.props.options.course.id !== prevProps.options.course.id) || (this.props.options.group.id !== prevProps.options.group.id)){
            this.getData();
        }
    }

    getData(){
        $glVars.webApi.reportSectionResults(this.props.options.course.id, this.props.options.group.id, this.getDataResult);        
    }

    getDataResult(result){         
        if(result.success){
            this.setState({dataProvider: result.data});
        }
        else{
            $glVars.feedback.showError(i18n.get_string('pluginname'), result.msg);
        }
    }

    render() {    
        let that = this;

        let dataProvider = this.state.dataProvider;
        
        if(this.props.options.group.id > 0){
            dataProvider = dataProvider.filter(item => item.groupIds.includes(this.props.options.group.id.toString()));
        }

        if(this.props.options.student.id > 0){
            dataProvider = dataProvider.filter(item => parseInt(item.userId) === this.props.options.student.id);
        }

        let grades = JsNx.at(dataProvider, 0, {grades: []}).grades;

        let main = 
                <div>
                    <DataGrid orderBy={true}>
                        <DataGrid.Header>
                            <DataGrid.Header.Row>
                                <DataGrid.Header.Cell style={{minWidth: "120px"}}>{i18n.get_string('firstname')}</DataGrid.Header.Cell>
                                <DataGrid.Header.Cell style={{minWidth: "100px"}}>{i18n.get_string('lastname')}</DataGrid.Header.Cell>
                                {grades.map((item, index) => {
                                    if(!this.filterSectionAndCm(item)){ return null;}

                                    let result = 
                                        <DataGrid.Header.Cell key={index} style={{textAlign: "center"}}>
                                            <a href={`${M.cfg.wwwroot}/mod/${item.itemModule}/view.php?id=${item.cmId}`} target={"_blank"}>{item.itemName}</a>
                                        </DataGrid.Header.Cell>

                                    return (result);                                    
                                }
                            )}
                            </DataGrid.Header.Row>
                        </DataGrid.Header>
                        <DataGrid.Body>
                            {dataProvider.map((item, index) => {   
                                // all items (children) need to be inside a single array otherwise the orderby won't work                                 
                                    let items =  [];

                                    let cell = 
                                        <DataGrid.Header.Cell sortValue={item.firstName}  key={items.length} freezing={true}>
                                            <a href={`${M.cfg.wwwroot}/user/profile.php?id=${item.userId}`} target={"_blank"}>{item.firstName}</a>
                                        </DataGrid.Header.Cell>;

                                    items.push(cell);

                                    cell = 
                                        <DataGrid.Header.Cell sortValue={item.lastName}  key={items.length} freezing={true}>
                                            <a href={`${M.cfg.wwwroot}/user/profile.php?id=${item.userId}`} target={"_blank"}>{item.lastName}</a>
                                        </DataGrid.Header.Cell>;

                                    items.push(cell);

                                    item.grades.map((item2, index2) => {
                                        if(!this.filterSectionAndCm(item2)){ return null;}

                                        let color = that.getCellContext(item2);
                                        let text = that.getCellValue(item2);
                                        cell = 
                                            <DataGrid.Body.Cell  sortValue={(item2.finalGrade ? item2.finalGrade.toString() : "")} style={{textAlign: "center", verticalAlign: "midle", backgroundColor: color, border: `.5px solid ${color}`}} key={items.length}>
                                                {text}
                                            </DataGrid.Body.Cell>

                                        items.push(cell);

                                        return (null);
                                    })
                                        
                                    return (<DataGrid.Body.Row key={index}>{items}</DataGrid.Body.Row>);                                    
                                }
                            )}
                        </DataGrid.Body>
                    </DataGrid>
                    <br/>
                    <hr/>
                    <div>
                        <a href={`${Options.getGateway(true)}&service=reportSectionResults&courseId=${this.props.options.course.id}&groupId=${this.props.options.group.id}&output=csv`} target='_blank'>{i18n.get_string('downloadcsv')}</a>
                    </div>                           
                    <br/>
                </div>;

        return (main);
    }

    filterSectionAndCm(item){
        if((this.props.options.section.id > 0) && (parseInt(item.sectionId) !== this.props.options.section.id)){
            return false;
        }

        if((this.props.options.cm.id > 0) && (parseInt(item.cmId) !== this.props.options.cm.id)){
            return false;
        }

        return true;
    }

    getCellContext(item){
        if(item.finalGrade < 0){ return "inherit";}

        let grade = parseFloat(item.successPct);

        let context = "";

        if(grade >= 70){
            context = AppCommon.Colors.lightGreen;
        }
        else if(grade >= 60 && grade < 70){
            context = AppCommon.Colors.lightYellow;
        }
        else if(grade >= 50 && grade < 60){
            context = AppCommon.Colors.lightOrange;
        }
        else{
            context = AppCommon.Colors.lightRed;
        }

        return context;
    }   
    
    getCellValue(item){
        if(item.finalGrade < 0){ return "";}

        let finalGrade = parseFloat(item.finalGrade).toFixed(1);
        let gradeMax = parseFloat(item.gradeMax).toFixed(1);
        let ret = `${finalGrade}/${gradeMax}`;
        if((item.itemModule === 'quiz') && (item.extra !== null)){
            return <a href={`${M.cfg.wwwroot}/mod/quiz/review.php?attempt=${item.extra.attempt}`} target='_blank'>{ret}</a>
        }
        else{
            return ret;
        }
    }
}