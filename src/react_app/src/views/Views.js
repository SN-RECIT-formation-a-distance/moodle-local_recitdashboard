import React, { Component } from 'react';
import {Navbar, NavDropdown} from 'react-bootstrap';
import {$glVars} from '../common/common';
import {GadgetAttendance} from './GadgetAttendance';
import {GadgetCourseProgress} from './GadgetCourseProgress';

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
                        <br/>
                        <GadgetAttendance courseId={this.state.selectedCourse.courseId}/>
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

