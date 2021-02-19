import React, { Component } from 'react';
import {DataGrid} from '../../libs/components/Components';
import { faCheck, faTimes} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {JsNx} from '../../libs/utils/Utils';
import {$glVars, Options} from '../../common/common';

export class ReportActivityCompletion  extends Component{
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
        $glVars.webApi.reportActivityCompletion(this.props.options.course.id, this.props.options.group.id, this.getDataResult);        
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

        let activityList = JsNx.at(dataProvider, 0, {activityList: []}).activityList;

        let main = 
                <div>
                    <DataGrid orderBy={true}>
                        <DataGrid.Header>
                            <DataGrid.Header.Row>
                                <DataGrid.Header.Cell style={{minWidth: "160px"}}>{"Prénom / Nom"}</DataGrid.Header.Cell>
                                {activityList.map((item, index) => {
                                    if(!this.filterSectionAndCm(item)){ return null;}

                                    let result = 
                                        <DataGrid.Header.Cell key={index} style={{textAlign: "center", minWidth: "100px", position: 'sticky', top: '0' }} >
                                            <a href={`${M.cfg.wwwroot}/mod/${item.modName}/view.php?id=${item.cmId}`} target={"_blank"}>{item.cmName}</a>
                                            <div style={{fontSize: "12px"}}>{(item.completionExpected !== null ? item.completionExpected.substr(0, 10) : "")}</div>
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
                                            <a href={`${M.cfg.wwwroot}/user/profile.php?id=${item.userId}&course=${item.courseId}`} target={"_blank"}>{item.studentName}</a>
                                        </DataGrid.Header.Cell>;

                                    items.push(cell);

                                    item.activityList.map((item2, index2) => {
                                        if(!this.filterSectionAndCm(item2)){ return null;}

                                        let text = that.getCellText(item2);

                                        cell = 
                                            <DataGrid.Body.Cell style={{textAlign: "center", verticalAlign: "midle"}} key={items.length} sortValue={item2.completionState}>
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
                        <a href={`${Options.getGateway()}?service=reportActivityCompletion&courseId=${this.props.options.course.id}&groupId=${this.props.options.group.id}&output=csv`} target='_blank'>{"Télécharger en CSV"}</a>
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

    getCellText(item){
        switch(item.completionState){
            case 1:
                return <FontAwesomeIcon icon={faCheck}/>;
            case 2:
                return <FontAwesomeIcon color="#28a745" icon={faCheck}/>;
            case 3:                
                return  <FontAwesomeIcon color="#dc3545" icon={faTimes}/>;
            default:
                return null;
        }
    }
}