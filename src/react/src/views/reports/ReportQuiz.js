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
import {DataGrid} from '../../libs/components/Components';
import {OverlayTrigger, Popover, Button, Badge, Modal, Form} from 'react-bootstrap';
import {$glVars, Options, AppCommon} from '../../common/common';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {faCheck, faTimes, faCheckSquare} from '@fortawesome/free-solid-svg-icons';
import { i18n } from '../../common/i18n';
import Utils from '../../libs/utils/Utils';

export class ReportQuiz  extends Component{
    static defaultProps = {        
        options: null
    };

    constructor(props) {
        super(props);

        this.onShowModal = this.onShowModal.bind(this);
        this.getData = this.getData.bind(this);
        this.getDataResult = this.getDataResult.bind(this);
        this.onDataChange = this.onDataChange.bind(this);

        this.state = {
            dataProvider: null, 
            printEssayQuestionModal: false, 
            data: {
                onlyLastTry: false
            }
        };
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
            $glVars.feedback.showError(i18n.get_string('pluginname'), result.msg);
        }
    }

    render() {    
        if (this.state.dataProvider === null){ return null};
        if (this.state.dataProvider.students.length === 0){ return null};

        let dataProvider = structuredClone(this.state.dataProvider);

        if(this.props.options.student.id > 0){
            dataProvider.students = dataProvider.students.filter(item => parseInt(item.userId) === parseInt(this.props.options.student.id));
        }

        if(this.state.data.onlyLastTry){
            for(let student of dataProvider.students){
                student.quizAttempts = [student.quizAttempts.pop()];
            }
        }

        let main = 
                <div>
                    <div className='mb-2 p-2 border rounded'>
                        <Form.Check id="checkboxOnlyLastTry" name='onlyLastTry' checked={this.state.data.onlyLastTry} onChange={this.onDataChange} type="checkbox" label={i18n.get_string('onlylasttry')} />
                    </div>
                    <DataGrid orderBy={true}>
                        <DataGrid.Header>
                            <DataGrid.Header.Row>
                                <DataGrid.Header.Cell style={{minWidth: "120px"}}>{i18n.get_string('lastname')}</DataGrid.Header.Cell>
                                <DataGrid.Header.Cell style={{minWidth: "120px"}}>{i18n.get_string('firstname')}</DataGrid.Header.Cell>
                                <DataGrid.Header.Cell style={{minWidth: "70px"}} title={i18n.get_string('attempts')}>{"#"}</DataGrid.Header.Cell>
                                <DataGrid.Header.Cell style={{minWidth: "100px"}}>{i18n.get_string('state')}</DataGrid.Header.Cell>
                                <DataGrid.Header.Cell style={{minWidth: "110px"}}>{i18n.get_string('beganat')}</DataGrid.Header.Cell>
                                <DataGrid.Header.Cell style={{minWidth: "110px"}}>{i18n.get_string('end')}</DataGrid.Header.Cell>
                                <DataGrid.Header.Cell style={{minWidth: "100px"}}>{i18n.get_string('timeconsumed')}</DataGrid.Header.Cell>
                                <DataGrid.Header.Cell style={{minWidth: "140px"}}>{i18n.get_string('grade')}/{parseFloat(dataProvider.quizMaxGrade).toFixed(2)}</DataGrid.Header.Cell>
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
                                                <span className="btn btn-link">{`Q.${item.slot}/${parseFloat(item.gradeWeight).toFixed(2)} `}</span>
                                            </OverlayTrigger>
                                        </DataGrid.Header.Cell>

                                    return (result);                                    
                                }
                            )}
                            </DataGrid.Header.Row>
                            <DataGrid.Body.Row>
                                <DataGrid.Header.Cell>{i18n.get_string('tags')}</DataGrid.Header.Cell>
                                <DataGrid.Body.Cell></DataGrid.Body.Cell>
                                <DataGrid.Body.Cell></DataGrid.Body.Cell>
                                <DataGrid.Body.Cell></DataGrid.Body.Cell>
                                <DataGrid.Body.Cell></DataGrid.Body.Cell>
                                <DataGrid.Body.Cell></DataGrid.Body.Cell>
                                <DataGrid.Body.Cell></DataGrid.Body.Cell>
                                {dataProvider.questions.map((item, index) => {
                                    let result = 
                                        <DataGrid.Body.Cell key={index} style={{textAlign: "center"}}>
                                            {item.tags.map((item, index) => {
                                                return <Badge key={index}>{item}</Badge>
                                                }
                                            )}
                                        </DataGrid.Body.Cell>
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
                                    let cell = null;

                                    cell = 
                                    <DataGrid.Header.Cell sortValue={student.lastName}  key={items.length} freezing={true}>
                                        <a href={`${M.cfg.wwwroot}/user/profile.php?id=${student.userId}`} target={"_blank"}>{student.lastName}</a>
                                    </DataGrid.Header.Cell>;
                                    items.push(cell);

                                    cell = 
                                    <DataGrid.Header.Cell sortValue={student.firstName}  key={items.length} freezing={true}>
                                        <a href={`${M.cfg.wwwroot}/user/profile.php?id=${student.userId}`} target={"_blank"}>{student.firstName}</a>
                                    </DataGrid.Header.Cell>;
                                    
                                    items.push(cell);

                                    items.push(<DataGrid.Body.Cell key={items.length}>{quizAttempt.attempt}</DataGrid.Body.Cell>);
                                    items.push(<DataGrid.Body.Cell key={items.length}>{quizAttempt.attempState}</DataGrid.Body.Cell>);
                                    items.push(<DataGrid.Body.Cell key={items.length}>{Utils.dateFormat(quizAttempt.attemptTimeStart)}</DataGrid.Body.Cell>);
                                    items.push(<DataGrid.Body.Cell key={items.length}>{Utils.dateFormat(quizAttempt.attemptTimeFinish)}</DataGrid.Body.Cell>);
                                    items.push(<DataGrid.Body.Cell key={items.length} style={{textAlign: "center"}} >{this.formatElapsedTime(quizAttempt.elapsedTime)}</DataGrid.Body.Cell>);

                                    let finalGrade = 0;
                                    if(parseFloat(quizAttempt.finalGrade) >= 0){
                                        finalGrade = parseFloat(quizAttempt.finalGrade).toFixed(2);
                                    }
                                    else{
                                        finalGrade = i18n.get_string('needsgrading');
                                    }

                                    cell = 
                                    <DataGrid.Body.Cell key={items.length} style={{backgroundColor: this.getCellContext(quizAttempt, parseFloat(dataProvider.quizMaxGrade)), textAlign: "center"}}>
                                        <a href={`${M.cfg.wwwroot}/mod/quiz/review.php?attempt=${quizAttempt.quizAttemptId}`} target="_blank">{finalGrade}</a>
                                    </DataGrid.Body.Cell>
                                    items.push(cell);

                                    quizAttempt.questions.map((question, index3) => {
                                        items.push(this.getCell(quizAttempt, question, items.length));
                                    })

                                    return (<DataGrid.Body.Row key={row++}>{items}</DataGrid.Body.Row>);
                                });
                            })}
                        </DataGrid.Body>
                    </DataGrid>
                    <br/>
                    <hr/>
                    <div className='d-flex align-items-center'>
                        <a href={`${Options.getGateway(true)}&service=reportQuiz&courseId=${this.props.options.course.id}&groupId=${this.props.options.group.id}&cmId=${this.props.options.cm.id}&output=csv`} target='_blank'>{i18n.get_string('downloadcsv')}</a>
                        <span className='ml-3 mr-3'>|</span>
                        <Button className='p-0' variant='link' onClick={() => this.onShowModal(true)}>{i18n.get_string('printessayquestions')}</Button>
                    </div>                           
                    <PrintEssayQuestionModal show={this.state.printEssayQuestionModal} options={this.props.options} extraOptions={this.state.data} onClose={() => this.onShowModal(false)}/>
                </div>;

        return (main);
    }

    onDataChange(event){
        let data = this.state.data;
        data[event.target.name] = event.target.checked;
        this.setState({data: data});
    }

    getCell(quizAttempt, question, index){
        let text, title, color, weightedGrade, grade;

        weightedGrade = parseFloat(question.weightedGrade).toFixed(2);
        grade = parseFloat(question.weightedGrade); // question.grade
        
        if(quizAttempt.attemptTimeFinish.length === 0){
            text = null;
            color = "";
            title = "";
        }
        // for float comparison
        else if (grade.toString() === question.gradeWeight.toString()){
            text = [<FontAwesomeIcon icon={faCheck} key={0}/>, " ", weightedGrade];
            color = AppCommon.Colors.green;
            title = i18n.get_string('success');
        }
        else if((grade < parseFloat(question.gradeWeight)) && (grade > 0)){
            text = [<FontAwesomeIcon icon={faCheckSquare} key={0}/>, " ", weightedGrade];
            color = AppCommon.Colors.blue;
            title = i18n.get_string('partiallycorrect');
        }
        else if(grade < 0){
            text = i18n.get_string('needsgrading');
            color = AppCommon.Colors.blue;
            title = i18n.get_string('needsgrading');
        }
        else{
            text = [<FontAwesomeIcon icon={faTimes} key={0}/>, " ", weightedGrade];
            color = AppCommon.Colors.red;
            title = i18n.get_string('fail');
        }
        
        let cell = 
            <DataGrid.Body.Cell sortValue={parseFloat(question.weightedGrade).toFixed(2)} style={{textAlign: "center", verticalAlign: "middle"}} key={index}>
                <Button variant="link" title={title} onClick={() => this.openQuestion(quizAttempt, question)} style={{color: color}}>
                    {text}
                </Button>
            </DataGrid.Body.Cell>

        return cell;
    }

    openQuestion(quizAttempt, question){
        let url=`${M.cfg.wwwroot}/mod/quiz/reviewquestion.php?attempt=${quizAttempt.quizAttemptId}&slot=${question.slot}`;
        window.open(url, "PopUp Question", "width=640,height=460");
    }

    getCellContext(quizAttempt, quizMaxGrade){
        let grade = parseFloat(quizAttempt.finalGrade);

        if(grade < 0){ return "inherit";}

        let context = "";

        if(quizAttempt.attemptTimeFinish.length === 0){
            context = "";
        }
        else if(grade >= (quizMaxGrade*0.7)){
            context = AppCommon.Colors.lightGreen;
        }
        else if(grade >= (quizMaxGrade*0.6) && grade < (quizMaxGrade*0.7)){
            context = AppCommon.Colors.lightYellow;
        }
        else if(grade >= (quizMaxGrade*0.5) && grade < (quizMaxGrade*0.6)){
            context = AppCommon.Colors.lightOrange;
        }
        else{
            context = AppCommon.Colors.lightRed;
        }

        return context;
    }   

    formatElapsedTime(value){
        let dateObj = new Date(parseInt(value) * 1000);
        let hours = dateObj.getUTCHours();
        let minutes = dateObj.getUTCMinutes();
        let seconds = dateObj.getSeconds();

        let result = hours.toString().padStart(2, '0') + ':' + 
        minutes.toString().padStart(2, '0') + ':' + 
        seconds.toString().padStart(2, '0');

        return result;
        //return value;
    }

    onShowModal(value){
        this.setState({printEssayQuestionModal: value});
    }
}

class PrintEssayQuestionModal extends Component{
    static defaultProps = {        
        options: null,
        extraOptions: null,
        show: false,
        onClose: null
    };

    constructor(props){
        super(props);

        this.onDataChange = this.onDataChange.bind(this);
        this.viewReport = this.viewReport.bind(this);

        this.state = {
            data: {
                documentTitle: i18n.get_string('definitiveversion'),
                supervisorName: '',
                testNumber: ''   
            }
        }
    }

    render(){
        let main = 
            <Modal onHide={this.props.onClose} show={this.props.show}>
                <Modal.Header closeButton>
                    <Modal.Title>{i18n.get_string('printessayquestions')}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form.Group>
                        <Form.Label>{i18n.get_string('documentTitle')}</Form.Label>
                        <Form.Control name='documentTitle' value={this.state.data.documentTitle} onChange={this.onDataChange} maxLength={100} />
                    </Form.Group>
                    <Form.Group>
                        <Form.Label>{i18n.get_string('supervisorName')}</Form.Label>
                        <Form.Control name='supervisorName' value={this.state.data.supervisorName} onChange={this.onDataChange} maxLength={75} />
                    </Form.Group>
                   
                    <Form.Group>
                        <Form.Label>{i18n.get_string('testNumber')}</Form.Label>
                        <Form.Control name='testNumber' value={this.state.data.testNumber} onChange={this.onDataChange} maxLength={25} />
                    </Form.Group>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={this.props.onClose}>{i18n.get_string('cancel')}</Button>
                    <Button variant="primary" onClick={this.viewReport}>{i18n.get_string('viewreport')}</Button>
                </Modal.Footer>
            </Modal>

        return (main);
    }

    viewReport(){
        let data = {
            courseId: this.props.options.course.id,
            cmId: this.props.options.cm.id,
            groupId: this.props.options.group.id,
            studentId: this.props.options.student.id,
            documentTitle: this.state.data.documentTitle,
            supervisorName: this.state.data.supervisorName,
            testNumber: this.state.data.testNumber,
            onlyLastTry: (this.props.extraOptions.onlyLastTry ? '1' : '0'),
        }

        $glVars.webApi.reportQuizEssayAnswers(data);
    }

    onDataChange(event){
        let data = this.state.data;
        data[event.target.name] = event.target.value;
        this.setState({data: data});
    }
}