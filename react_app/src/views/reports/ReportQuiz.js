import React, { Component } from 'react';
import {DataGrid} from '../../libs/components/Components';
import {OverlayTrigger, Popover} from 'react-bootstrap';
import {CSV} from '../../libs/utils/Utils';
import {$glVars, Options, AppCommon} from '../../common/common';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {faCheck,faInfoCircle,faTimes} from '@fortawesome/free-solid-svg-icons';

export class ReportQuiz  extends Component{
    static defaultProps = {        
        options: null
    };

    constructor(props) {
        super(props);

        this.getData = this.getData.bind(this);
        this.getDataResult = this.getDataResult.bind(this);
        this.downloadCSV = this.downloadCSV.bind(this);

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
        if (!this.props.options.cm.id){
            $glVars.feedback.showError($glVars.i18n.tags.appname, 'Activité non specifié');
            return;
        }
        $glVars.webApi.getReportQuiz(this.props.options.course.id, this.props.options.group.id, this.props.options.cm.id, this.getDataResult);        
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
        if (!dataProvider.data) return null;
        
        if(this.props.options.group.id > 0){
            dataProvider.students = dataProvider.students.filter(item => item.groupName.includes(this.props.options.group.name.toString()));
        }

        if(this.props.options.student.id > 0){
            dataProvider.students = dataProvider.students.filter(item => item.userId === this.props.options.student.id);
        }

        let main = 
                <div id="quizreporttbl">
                    <DataGrid orderBy={true}>
                        <DataGrid.Header>
                            <DataGrid.Header.Row>
                                <DataGrid.Header.Cell style={{minWidth: "160px"}}>{"Prénom / Nom"}</DataGrid.Header.Cell>
                                {dataProvider.questions.map((item, index) => {

                                    const popover = (
                                        <Popover>
                                          <Popover.Title as="h3">{item.name}</Popover.Title>
                                          <Popover.Content>
                                              <div dangerouslySetInnerHTML={{__html:item.text}}></div>
                                          </Popover.Content>
                                        </Popover>
                                      );
                                    let result = 
                                        <DataGrid.Header.Cell key={index} style={{textAlign: "center"}}>
                                            <span>{item.name} <br></br> {item.tag} </span>
                                        <OverlayTrigger trigger="click" placement="bottom" overlay={popover}>
                                            <FontAwesomeIcon icon={faInfoCircle}></FontAwesomeIcon>
                                        </OverlayTrigger>
                                        </DataGrid.Header.Cell>

                                    return (result);                                    
                                }
                            )}
                            </DataGrid.Header.Row>
                        </DataGrid.Header>
                        <DataGrid.Body>
                            {dataProvider.students.map((item, index) => {   
                                // all items (children) need to be inside a single array otherwise the orderby won't work                                 
                                    let items =  [];
                                    let pos = 0;

                                    let cell = 
                                        <DataGrid.Body.Cell sortValue={item.name}  key={0}>
                                            <a href={`${M.cfg.wwwroot}/user/profile.php?id=${item.userId}`} target={"_blank"}>{item.name}</a>
                                        </DataGrid.Body.Cell>;

                                    items.push(cell);

                                    dataProvider.data.map((item2, index2) => {

                                        if (item.userId == item2.userId && dataProvider.cellPos[pos] == item2.questionName){
                                            let text;
                                            let title;
                                            let color = AppCommon.Colors.red
                                            if (item2.grade == item2.gradeWeight){
                                                text = <FontAwesomeIcon icon={faCheck}/>
                                                color = AppCommon.Colors.green
                                                title = "Réussi"
                                            }else{
                                                text = <FontAwesomeIcon icon={faTimes}/>
                                                title = "Échoué"
                                            }
                                            cell = 
                                                <DataGrid.Body.Cell  sortValue={(item2.grade ? item2.grade.toString() : "")} style={{textAlign: "center", verticalAlign: "middle", color: color}} key={items.length}>
                                                    <span title={title}>{text}</span>
                                                </DataGrid.Body.Cell>

                                            items.push(cell);
                                            pos++;
                                        }
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
                        <a href={`${Options.getGateway()}?service=reportQuiz&courseId=${this.props.options.course.id}&groupId=${this.props.options.group.id}&cmId=${this.props.options.cm.id}&output=csv`} target='_blank'>{"Télécharger en CSV"}</a>
                    </div>                           
                    <br/>
                </div>;

        return (main);
    }

    downloadCSV(){
        CSV.export_table_to_csv("quizreporttbl", "quizreport_"+this.props.options.group.name+".csv")
    }

}