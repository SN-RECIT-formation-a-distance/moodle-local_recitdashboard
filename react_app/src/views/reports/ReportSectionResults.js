import React, { Component } from 'react';
import {DataGrid} from '../../libs/components/Components';
import {JsNx} from '../../libs/utils/Utils';
import {$glVars, Options, AppCommon} from '../../common/common';

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
        // Typical usage (don't forget to compare props):
        /*if(JSON.stringify(this.props.options) !== JSON.stringify(prevProps.options)){
            this.getData();
        }*/
        if(this.props.options.course.id !== prevProps.options.course.id){
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
            $glVars.feedback.showError($glVars.i18n.tags.appname, result.msg);
        }
    }

    render() {    
        let that = this;

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
                                <DataGrid.Header.Cell style={{minWidth: "160px"}}>{"Prénom / Nom"}</DataGrid.Header.Cell>
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
                                        <DataGrid.Header.Cell sortValue={item.studentName}  key={0}>
                                            <a href={`${M.cfg.wwwroot}/user/profile.php?id=${item.userId}`} target={"_blank"}>{item.studentName}</a>
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
                        <a href={`${Options.getGateway()}?service=reportSectionResults&courseId=${this.props.options.course.id}&groupId=${this.props.options.group.id}&output=csv`} target='_blank'>{"Télécharger en CSV"}</a>
                    </div>                           
                    <br/>
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
        let gradeMax = item.gradeMax.toFixed(1);
        let ret = `${finalGrade}/${gradeMax}`;
        if((item.itemModule === 'quiz') && (item.extra !== null)){
            return <a href={`${M.cfg.wwwroot}/mod/quiz/review.php?attempt=${item.extra.attempt}`} target='_blank'>{ret}</a>
        }
        else{
            return ret;
        }
    }
}