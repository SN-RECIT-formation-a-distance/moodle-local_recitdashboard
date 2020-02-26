import React, { Component } from 'react';
import {Navbar, NavDropdown, Nav} from 'react-bootstrap';
import {faTachometerAlt} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {$glVars} from '../common/common';
import {GadgetAttendance} from './GadgetAttendance';
import {GadgetCourseProgressOverview, GadgetCourseProgressDetailled} from './GadgetCourseProgress';
import {GadgetDiagnosticTags} from './GadgetDiagnosticTags';
import {GadgetGroupsOverview} from './GadgetGroupsOverview';

export class TeacherView extends Component {
    constructor(props) {
        super(props);

        this.getData = this.getData.bind(this);
        this.getDataResult = this.getDataResult.bind(this);
        this.onSelectCourse = this.onSelectCourse.bind(this);
        this.onSelectGroup = this.onSelectGroup.bind(this);
        this.onUnselectGroup = this.onUnselectGroup.bind(this);

        this.state = {courseList: [], selectedCourse: null, selectedGroup: null};
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
       /*<Nav className="mr-auto"></Nav>
                    <Nav>
                        {this.state.courseList.map(function(item, index){
                            return  <Nav.Link key={index} href={"#c"+index} onClick={() => that.onSelectCourse(item)}>{item.courseName}</Nav.Link>
                        })}
                    </Nav>*/
        let main = 
            <div>
                <Navbar>
                    <Navbar.Brand href="#"><FontAwesomeIcon icon={faTachometerAlt}/>{" Tableau de bord"}</Navbar.Brand>
                    <NavDropdown  variant="primary" title={(this.state.selectedCourse !== null ? `Cours: ${this.state.selectedCourse.courseName}` : "Sélectionnez le cours")} id="basic-nav-dropdown" >
                            {this.state.courseList.map(function(item, index){
                                return <NavDropdown.Item key={index} href="#" onClick={() => that.onSelectCourse(item)}>{item.courseName}</NavDropdown.Item>;
                            })}
                    </NavDropdown>
                    {this.state.selectedGroup !== null && <Nav.Link style={{color: "#dc3545"}} href="#" onClick={this.onUnselectGroup}>{`Groupe: ${this.state.selectedGroup} (x)`}</Nav.Link>}
                </Navbar>
                {this.state.selectedCourse !== null ?
                    
                    this.state.selectedGroup === null ? 
                        <div style={{marginTop: 15, display: "flex", flexWrap: "wrap"}}>
                            <GadgetGroupsOverview  courseId={this.state.selectedCourse.courseId} onSelectGroup={this.onSelectGroup}/> 
                        </div>
                    :
                        <div style={{marginTop: 15, display: "flex", flexFlow: "column"}}>
                            <GadgetCourseProgressOverview courseId={this.state.selectedCourse.courseId} group={this.state.selectedGroup}/>
                            <br/><br/>
                            <GadgetAttendance courseId={this.state.selectedCourse.courseId} group={this.state.selectedGroup}/>
                            <br/><br/>
                            <GadgetDiagnosticTags courseId={this.state.selectedCourse.courseId} group={this.state.selectedGroup}/>
                        </div>
                :
                    null
                }
            </div>;
            /*<GadgetCourseProgressDetailled courseId={this.state.selectedCourse.courseId}/>*/

        return (main);
    }

    onUnselectGroup(){
        this.setState({selectedGroup: null});
    }

    onSelectGroup(groupName){
        this.setState({selectedGroup: groupName});
    }

    onSelectCourse(item){
        this.setState({selectedCourse: item, selectedGroup: null});
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

