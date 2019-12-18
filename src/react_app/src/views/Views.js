import React, { Component } from 'react';
import {Navbar, NavDropdown, Card, ButtonGroup, Button, ProgressBar} from 'react-bootstrap';
import {faSync, faArrowLeft, faSquare, faCheckSquare} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {DataGrid} from '../libs/components/Components';
import {UtilsMoodle, JsNx} from '../libs/utils/Utils';
import {$glVars} from '../common/common';

export class TeacherView extends Component {
    constructor(props) {
        super(props);

        this.getData = this.getData.bind(this);
        this.getDataResult = this.getDataResult.bind(this);
        this.onSelectCourse = this.onSelectCourse.bind(this);

        this.state = {courseList: [], selectedCourse: null};
    }

    componentDidMount(){
        this.getData();
    }

    componentWillUnmount(){
    }

    getData(){
        $glVars.webApi.getEnrolledCourseList($glVars.signedUser.userId, this.getDataResult);        
    }

    getDataResult(result){         
        if(result.success){
            this.setState({courseList: result.data, selectedCourse: null});
        }
        else{
            $glVars.feedback.showError($glVars.i18n.tags.appname, result.msg);
        }
    }

    render() {       
        let that = this;
        let main = 
            <div>
                <Navbar>
                    <Navbar.Brand href="#">{"Tableau de bord"}</Navbar.Brand>
                    <Navbar.Collapse id="basic-navbar-nav">
                        <NavDropdown  variant="primary" title={(this.state.selectedCourse !== null ? `Cours: ${this.state.selectedCourse.courseName}` : "Sélectionnez le cours")} id="basic-nav-dropdown" >
                            {this.state.courseList.map(function(item, index){
                                return <NavDropdown.Item key={index} href="#" onClick={() => that.onSelectCourse(item)}>{item.courseName}</NavDropdown.Item>;
                            })}
                        </NavDropdown>
                    </Navbar.Collapse>
                </Navbar>
                {this.state.selectedCourse !== null ?
                    <div style={{marginTop: 15}}>
                        <GadgetCourseProgress courseId={this.state.selectedCourse.courseId}/>
                    </div>
                :
                    null
                }
            </div>;
            
        return (main);
    }

    onSelectCourse(item){
        this.setState({selectedCourse: item});
    }
}

export class StudentView extends Component {
    constructor(props) {
        super(props);
    }

    render() {       
        let main = <h1>Student view</h1>;

        return (main);
    }
}

class GadgetCourseProgress extends Component{
    static defaultProps = {        
        courseId: 0
    };

    constructor(props) {
        super(props);

        this.getData = this.getData.bind(this);
        this.getDataResult = this.getDataResult.bind(this);
        this.onBack = this.onBack.bind(this);
        this.onDetails = this.onDetails.bind(this);

        this.state = {userId: 0, overview: [], details: []};
    }

    componentDidMount(){
        this.getData();
    }

    componentDidUpdate(prevProps){
       // Typical usage (don't forget to compare props):
       if (this.props.courseId !== prevProps.courseId) {
            this.getData();
        }
    }

    getData(){
        $glVars.webApi.getCourseProgressionOverview(this.props.courseId, this.getDataResult);        
    }

    getDataResult(result){         
        if(result.success){
            this.setState({userId: 0, overview: result.data});
        }
        else{
            $glVars.feedback.showError($glVars.i18n.tags.appname, result.msg);
        }
    }

    render() {    
        let bodyContent = {maxHeight: 400, overflowY: "auto"};
        
        let cardTitle = "Aperçu de la progression";
        if(this.state.userId > 0){
            cardTitle += ": " + JsNx.get(JsNx.at(this.state.details, 0, null), "studentName", "");
        }
        //<Card.Header>{cardTitle}</Card.Header>
        let main = 
            <Card style={{width: "60%"}}>
                <Card.Body>
                    <Card.Title style={{display: "flex", justifyContent: "space-between"}}>
                        {cardTitle}
                        <ButtonGroup  >
                            {this.state.userId > 0 && <Button variant="outline-secondary" size="sm" onClick={this.onBack}><FontAwesomeIcon icon={faArrowLeft}/></Button>}
                            <Button  variant="outline-secondary" size="sm" onClick={this.getData}><FontAwesomeIcon icon={faSync}/></Button>
                        </ButtonGroup>
                    </Card.Title>

                    <div style={bodyContent}>
                        {this.state.userId === 0 ?
                            <DataGrid orderBy={true}>
                                <DataGrid.Header>
                                    <DataGrid.Header.Row>
                                        <DataGrid.Header.Cell style={{width: 70}}>{"#"}</DataGrid.Header.Cell>
                                        <DataGrid.Header.Cell >{"Élève"}</DataGrid.Header.Cell>
                                        <DataGrid.Header.Cell style={{width: 150}}>{"Progression"}</DataGrid.Header.Cell>
                                        <DataGrid.Header.Cell style={{width: 180}}>{"Mise à jour"}</DataGrid.Header.Cell>
                                    </DataGrid.Header.Row>
                                </DataGrid.Header>
                                <DataGrid.Body>
                                    {this.state.overview.map((item, index) => {
                                            let row = 
                                                <DataGrid.Body.Row key={index} onDbClick={() => this.onDetails(item.userId)}>
                                                    <DataGrid.Body.Cell>{index + 1}</DataGrid.Body.Cell>
                                                    <DataGrid.Body.Cell sortValue={item.studentName}><a href="#" onClick={() => this.onDetails(item.userId)}>{item.studentName}</a></DataGrid.Body.Cell>
                                                    <DataGrid.Body.Cell sortValue={item.pct.toString()} style={{textAlign: "center"}}>
                                                        <ProgressBar striped min={0} max={100} variant="success" now={item.pct} label={`${item.pct}%`}/>
                                                    </DataGrid.Body.Cell>                                            
                                                    <DataGrid.Body.Cell>{item.lastUpdate}</DataGrid.Body.Cell>
                                                </DataGrid.Body.Row>
                                            return (row);                                    
                                        }
                                    )}
                                </DataGrid.Body>
                            </DataGrid>
                            :
                            <DataGrid orderBy={true}>
                                <DataGrid.Header>
                                    <DataGrid.Header.Row>
                                        <DataGrid.Header.Cell style={{width: 70}}>{"#"}</DataGrid.Header.Cell>
                                        <DataGrid.Header.Cell >{"Activité"}</DataGrid.Header.Cell>
                                        <DataGrid.Header.Cell style={{width: 100}}>{"État"}</DataGrid.Header.Cell>
                                        <DataGrid.Header.Cell style={{width: 110}}>{"Grade"}</DataGrid.Header.Cell>
                                        <DataGrid.Header.Cell style={{width: 190}}>{"Date d'échéance"}</DataGrid.Header.Cell>
                                    </DataGrid.Header.Row>
                                </DataGrid.Header>
                                <DataGrid.Body>
                                    {this.state.details.map((item, index) => {
                                            let row = 
                                                <DataGrid.Body.Row key={index} >
                                                    <DataGrid.Body.Cell>{index + 1}</DataGrid.Body.Cell>
                                                    <DataGrid.Body.Cell sortValue={item.activity.name}>
                                                        <img className="activityicon" alt="activity icon" role="presentation" aria-hidden="true" src={UtilsMoodle.getActivityIconUrl(item.module)}/>
                                                        {` ${item.activity.name}`}
                                                        </DataGrid.Body.Cell>
                                                    <DataGrid.Body.Cell sortValue={item.completionState.toString()} style={{textAlign: "center"}}>
                                                        {item.completionState === 1 ? <FontAwesomeIcon icon={faCheckSquare}/> : <FontAwesomeIcon icon={faSquare}/> }
                                                    </DataGrid.Body.Cell>
                                                    <DataGrid.Body.Cell style={{textAlign: "center"}}>{item.activity.grade}</DataGrid.Body.Cell>
                                                    <DataGrid.Body.Cell sortValue={item.completionExpected} alert={this.getDeadline(item)} style={{textAlign: "center"}}>
                                                        {item.completionExpected}<br/><span style={{fontSize: ".7rem"}}>{this.getDeadlineInDays(item)}</span>
                                                    </DataGrid.Body.Cell>
                                                </DataGrid.Body.Row>
                                            return (row);                                    
                                        }
                                    )}
                                </DataGrid.Body>
                            </DataGrid>
                        }
                    </div>
                </Card.Body>
            </Card>;

        return (main);
    }

    getDeadline(item){
        if(item.completionState === 1){
            return "";
        }
        else if(item.completionExpected === null){
            return "";
        }
        else if(item.daysDeadline < 0){
            return "error";
        }
        else if(item.daysDeadline <= 3){
            return "warning";
        }
        else{
            return "";
        }
    }

    getDeadlineInDays(item){
        if(item.completionState === 1){ return "";}
        return (item.daysDeadline < 0 ? `(${Math.abs(item.daysDeadline)} jours en retard)` : "");
    }

    onDetails(userId){
        let that = this;
        let callback = function(result){
            if(result.success){
                that.setState({userId: parseInt(userId, 10), details: result.data});
            }
            else{
                $glVars.feedback.showError($glVars.i18n.tags.appname, result.msg);
            }
        }
        $glVars.webApi.getCourseProgressionDetails(this.props.courseId, userId, callback);      
    }

    onBack(){
        this.setState({userId: 0});
    }
}