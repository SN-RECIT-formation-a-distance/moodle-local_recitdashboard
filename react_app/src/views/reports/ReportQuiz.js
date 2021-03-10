import React, { Component } from 'react';
import {DataGrid} from '../../libs/components/Components';
import {OverlayTrigger, Popover} from 'react-bootstrap';
import {$glVars, Options, AppCommon} from '../../common/common';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {faCheck,faInfoCircle,faTimes, faCheckSquare} from '@fortawesome/free-solid-svg-icons';

export class ReportQuiz  extends Component{
    static defaultProps = {        
        options: null
    };

    constructor(props) {
        super(props);

        this.getData = this.getData.bind(this);
        this.getDataResult = this.getDataResult.bind(this);
       // this.downloadCSV = this.downloadCSV.bind(this);

        this.state = {dataProvider: null};
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
        $glVars.webApi.reportQuiz(this.props.options.course.id, this.props.options.group.id, this.props.options.cm.id, this.getDataResult);        
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
        if (dataProvider === null){ return null};
        
        if(this.props.options.student.id > 0){
            dataProvider.students = dataProvider.students.filter(item => item.userId === this.props.options.student.id);
        }

        let main = 
                <div>
                    <DataGrid orderBy={true}>
                        <DataGrid.Header>
                            <DataGrid.Header.Row>
                                <DataGrid.Header.Cell style={{minWidth: "160px"}}>{"Prénom / Nom"}</DataGrid.Header.Cell>
                                <DataGrid.Header.Cell>{"Courriel"}</DataGrid.Header.Cell>
                                <DataGrid.Header.Cell style={{minWidth: "120px"}}>{"Tentatives"}</DataGrid.Header.Cell>
                                <DataGrid.Header.Cell style={{minWidth: "100px"}}>{"État"}</DataGrid.Header.Cell>
                                <DataGrid.Header.Cell style={{minWidth: "160px"}}>{"Commencé le"}</DataGrid.Header.Cell>
                                <DataGrid.Header.Cell style={{minWidth: "160px"}}>{"Terminé"}</DataGrid.Header.Cell>
                                <DataGrid.Header.Cell style={{minWidth: "160px"}}>{"Temps utilisé"}</DataGrid.Header.Cell>
                                <DataGrid.Header.Cell style={{minWidth: "60px"}}>{`Note/${dataProvider.quizMaxGrade.toFixed(2)}`}</DataGrid.Header.Cell>
                                {dataProvider.questions.map((item, index) => {
                                    const popover = (
                                        <Popover>
                                          <Popover.Title as="h3">{item.questionName}</Popover.Title>
                                          <Popover.Content>
                                              <div dangerouslySetInnerHTML={{__html:item.questionText}}></div>
                                          </Popover.Content>
                                        </Popover>
                                      );
                                    let result = 
                                        <DataGrid.Header.Cell key={index} style={{textAlign: "center", width: "100px"}} >
                                            <OverlayTrigger trigger="click" placement="bottom" overlay={popover} rootClose={true}>
                                                <span className="btn btn-link">{`Q.${item.slot}/${item.gradeWeight} `}</span>
                                            </OverlayTrigger>
                                        </DataGrid.Header.Cell>

                                    return (result);                                    
                                }
                            )}
                            </DataGrid.Header.Row>
                            <DataGrid.Body.Row>
                                <DataGrid.Header.Cell>Tags</DataGrid.Header.Cell>
                                <DataGrid.Body.Cell></DataGrid.Body.Cell>
                                <DataGrid.Body.Cell></DataGrid.Body.Cell>
                                <DataGrid.Body.Cell></DataGrid.Body.Cell>
                                <DataGrid.Body.Cell></DataGrid.Body.Cell>
                                <DataGrid.Body.Cell></DataGrid.Body.Cell>
                                <DataGrid.Body.Cell></DataGrid.Body.Cell>
                                <DataGrid.Body.Cell></DataGrid.Body.Cell>
                                {dataProvider.questions.map((item, index) => {
                                    let tags = (item.tags ? item.tags.toString().replaceAll(",", "") : "");
                                    let result = <DataGrid.Body.Cell key={index} style={{textAlign: "center"}}>{tags}</DataGrid.Body.Cell>
                                    return (result);                                    
                                }
                            )}
                            </DataGrid.Body.Row>
                        </DataGrid.Header>
                        <DataGrid.Body>
                            {dataProvider.students.map((student, index) => { 
                                let row = 0;  
                                return student.quizAttempts.map((quizAttempt, index2) => {   
                                    // all items (children) need to be inside a single array otherwise the orderby won't work                                 
                                    let items =  [];

                                    if(index2 === 0){
                                        let cell = 
                                        <DataGrid.Header.Cell sortValue={student.name}  key={items.length}>
                                            <a href={`${M.cfg.wwwroot}/user/profile.php?id=${student.userId}`} target={"_blank"}>{student.username}</a>
                                        </DataGrid.Header.Cell>;
                                        items.push(cell);
                                        items.push(<DataGrid.Body.Cell key={items.length}>{student.email}</DataGrid.Body.Cell>);
                                    }
                                    else{
                                        items.push(<DataGrid.Header.Cell key={items.length}></DataGrid.Header.Cell>);
                                        items.push(<DataGrid.Body.Cell key={items.length}></DataGrid.Body.Cell>);
                                    }

                                    items.push(<DataGrid.Body.Cell key={items.length}>{quizAttempt.attempt}</DataGrid.Body.Cell>);
                                    items.push(<DataGrid.Body.Cell key={items.length}>{quizAttempt.attempState}</DataGrid.Body.Cell>);
                                    items.push(<DataGrid.Body.Cell key={items.length}>{quizAttempt.attemptTimeStart}</DataGrid.Body.Cell>);
                                    items.push(<DataGrid.Body.Cell key={items.length}>{quizAttempt.attemptTimeFinish}</DataGrid.Body.Cell>);
                                    items.push(<DataGrid.Body.Cell key={items.length}>{quizAttempt.elapsedTime}</DataGrid.Body.Cell>);
                                    items.push(<DataGrid.Body.Cell key={items.length}>{quizAttempt.finalGrade.toFixed(2)}</DataGrid.Body.Cell>);

                                    quizAttempt.questions.map((question, index3) => {
                                        items.push(this.getCell(question, items.length));
                                    })

                                    return (<DataGrid.Body.Row key={row++}>{items}</DataGrid.Body.Row>);
                                });
                            })}
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

    getCell(item, index){
        let text;
        let title;
        let color = AppCommon.Colors.red
        if (item.grade == item.defaultMark){
            text = <FontAwesomeIcon icon={faCheck}/>;
            color = AppCommon.Colors.green;
            title = "Réussi";
        }
        else if((item.grade < item.defaultMark) && (item.grade > 0)){
            text = <FontAwesomeIcon icon={faCheckSquare}/>;
            color = AppCommon.Colors.blue;
            title = "Partiellement correct";
        }
        else{
            text = <FontAwesomeIcon icon={faTimes}/>;
            title = "Échoué";
        }
        
        let cell = 
            <DataGrid.Body.Cell  sortValue={item.weightedGrade.toFixed(2)} style={{textAlign: "center", verticalAlign: "middle", color: color}} key={index}>
                <span title={title}>{text}{" "}{item.weightedGrade.toFixed(2)}</span>
            </DataGrid.Body.Cell>

        return cell;
    }
    /*downloadCSV(){
        CSV.export_table_to_csv("quizreporttbl", "quizreport_"+this.props.options.group.name+".csv")
    }*/

}