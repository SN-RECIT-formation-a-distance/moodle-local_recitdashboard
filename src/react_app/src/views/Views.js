import React, { Component } from 'react';
import {Navbar, NavDropdown, Nav} from 'react-bootstrap';
import {faTachometerAlt} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {$glVars} from '../common/common';
import {GadgetAttendance} from './GadgetAttendance';
import {GadgetCourseProgressOverview, GadgetCourseProgressDetailled} from './GadgetCourseProgress';
import {GadgetDiagnosticTags} from './GadgetDiagnosticTags';
import {GadgetGroupsOverview} from './GadgetGroupsOverview';
import {GadgetStudentRadar} from './GadgetStudentRadar';

export class TeacherView extends Component {
    constructor(props) {
        super(props);

        this.getData = this.getData.bind(this);
        this.getDataResult = this.getDataResult.bind(this);
        this.onSelectCourse = this.onSelectCourse.bind(this);
        this.onSelectGroup = this.onSelectGroup.bind(this);
        this.onUnselectGroup = this.onUnselectGroup.bind(this);
        this.onSelectUser = this.onSelectUser.bind(this);
        this.onUnselectUser = this.onUnselectUser.bind(this);

        this.state = {courseList: [], selectedCourse: null, selectedGroup: null, selectedUser: null};
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
                    {this.state.selectedGroup !== null && <Nav.Link style={{color: "#dc3545"}} href="#" onClick={this.onUnselectGroup}>{`Groupe: ${this.state.selectedGroup.name} (x)`}</Nav.Link>}
                    {this.state.selectedUser !== null && <Nav.Link style={{color: "#dc3545"}} href="#" onClick={this.onUnselectUser}>{`Élève: ${this.state.selectedUser.name} (x)`}</Nav.Link>}
                </Navbar>
                {this.state.selectedCourse !== null ?
                    
                    this.state.selectedUser !== null ? 
                        <StudentView courseId={this.state.selectedCourse.courseId} userId={this.state.selectedUser.id}/> 
                    :
                        this.state.selectedGroup === null ? 
                            <TeacherCourseView courseId={this.state.selectedCourse.courseId} onSelectGroup={this.onSelectGroup} onSelectUser={this.onSelectUser}/>
                        :
                            <TeacherGroupView  courseId={this.state.selectedCourse.courseId} groupId={this.state.selectedGroup.id} onSelectUser={this.onSelectUser}/>
                :
                    null
                }
            </div>;

        return (main);
    }

    onUnselectGroup(){
        this.setState({selectedGroup: null});
    }

    onSelectGroup(group){
        this.setState({selectedGroup: group});
    }

    onSelectCourse(item){
        this.setState({selectedCourse: item, selectedGroup: null});
    }

    onSelectUser(user){
        this.setState({selectedUser: user});
    }

    onUnselectUser(){
        this.setState({selectedUser: null});
    }
}

class TeacherCourseView extends Component{
    static defaultProps = {        
        courseId: 0,
        onSelectGroup: null,
        onSelectUser: null
    };

    render(){
        let main = 
            <div style={{marginTop: 15, display: "flex", flexWrap: "wrap"}}>
                <GadgetGroupsOverview  courseId={this.props.courseId} onSelectGroup={this.props.onSelectGroup}/> 
                <GadgetStudentRadar  courseId={this.props.courseId} onSelectGroup={this.props.onSelectGroup} onSelectUser={this.props.onSelectUser}/> 
            </div>
        return main;
    }
}

class TeacherGroupView extends Component{
    static defaultProps = {        
        courseId: 0,
        groupId: 0,
        onSelectUser: null
    };

    render(){
        let main = 
            <div style={{marginTop: 15, display: "flex", flexFlow: "column"}}>
                <GadgetCourseProgressOverview courseId={this.props.courseId} groupId={this.props.groupId} onSelectUser={this.props.onSelectUser}/>
                <br/><br/>
                <GadgetAttendance  courseId={this.props.courseId} groupId={this.props.groupId}/>
                <br/><br/>
                <GadgetDiagnosticTags  courseId={this.props.courseId} groupId={this.props.groupId}/>
            </div>
        return main;
    }
}

export class StudentView extends Component {
    static defaultProps = {        
        courseId: 0,
        userId: 0
    };

    constructor(props) {
        super(props);

        this.getDataResult = this.getDataResult.bind(this);

        this.state = {profile: null}
    }

    componentDidMount(){
        this.getData();
    }

    getData(){
        $glVars.webApi.getUserProfile(this.props.courseId, this.props.userId, this.getDataResult);        
    }

    getDataResult(result){         
        if(result.success){
            this.setState({profile: result.data});
        }
        else{
            $glVars.feedback.showError($glVars.i18n.tags.appname, result.msg);
        }
    }

    render() {     
        if(this.state.profile === null) {return null;}
        let main = 
            <div>
                <div style={{padding: "1rem", backgroundColor: "#efefef"}}>
                    <img src={this.state.profile.avatar} style={{borderRadius: "50%", marginRight: "1rem", float: "left"}}/>
                    <h2>{this.state.profile.name}</h2>
                    <p>{this.state.profile.email}</p>
                    <small className="text-muted">{`Dernière connexion: ${this.state.profile.lastLogin}`}</small>
                </div>
                <GadgetCourseProgressDetailled courseId={this.props.courseId} userId={this.props.userId}/>
            </div>;

        return (main);
    }
}

