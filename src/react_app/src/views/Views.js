import React, { Component } from 'react';
import {Navbar, Nav, Form, FormControl, InputGroup, Card, ProgressBar, ButtonGroup, Button} from 'react-bootstrap';
import {faTachometerAlt, faSearch, faBookOpen, faFileAlt} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {DataGrid} from '../libs/components/Components';
import {UtilsString} from '../libs/utils/Utils';
import {$glVars} from '../common/common';
//import {GadgetAttendance} from './GadgetAttendance';
import {GadgetCourseProgressOverview, GadgetCourseProgressDetailled} from './GadgetCourseProgress';
import {GadgetDiagnosticTags} from './GadgetDiagnosticTags';
import {GadgetGroupsOverview} from './GadgetGroupsOverview';
import {GadgetStudentRadar} from './GadgetStudentRadar';

class GadgetCourseList extends Component{
    static defaultProps = {        
        onSelectCourse: null
    };

    constructor(props) {
        super(props);

        this.getData = this.getData.bind(this);
        this.getDataResult = this.getDataResult.bind(this);

        this.state = {courseList: []};
    }

    componentDidMount(){
        this.getData();
    }

    getData(){
        $glVars.webApi.getEnrolledCourseList($glVars.signedUser.userId, this.getDataResult);        
    }

    getDataResult(result){         
        if(result.success){
            this.setState({courseList: result.data});
        }
        else{
            $glVars.feedback.showError($glVars.i18n.tags.appname, result.msg);
        }
    }

    render(){
        let that = this;

        let main = 
            <div className='gadget-course-list'>
                {this.state.courseList.length === 0 && <h4>Pas de cours</h4>}
                {this.state.courseList.map(function(item, index){
                    let result =
                        <Card style={{ width: '18rem', margin: "1rem" }} key={index}>
                            <Card.Img variant="top" src={item.imageUrl} />
                            <Card.Body>
                                <Card.Title>{item.courseName}</Card.Title>
                                <ProgressBar animated now={item.pctProgress}  label={`${item.pctProgress}%`}/>
                            </Card.Body>
                            <Card.Footer>
                                <Card.Link href={`${M.cfg.wwwroot}/course/view.php?id=${item.courseId}`}>Accéder</Card.Link>
                                <Card.Link href="#" onClick={() => that.props.onSelectCourse(item)}>Indicateurs</Card.Link>
                            </Card.Footer>
                        </Card>
                    return result;
                })}
            </div>

        return main;
    }
}

export class TeacherView extends Component {
    constructor(props) {
        super(props);

        this.onSelectCourse = this.onSelectCourse.bind(this);
        this.onUnselectCourse = this.onUnselectCourse.bind(this);
        this.onSelectGroup = this.onSelectGroup.bind(this);
        this.onUnselectGroup = this.onUnselectGroup.bind(this);
        this.onSelectUser = this.onSelectUser.bind(this);
        this.onUnselectUser = this.onUnselectUser.bind(this);
        this.onChangeSearch = this.onChangeSearch.bind(this);
        this.onSearch = this.onSearch.bind(this);

        this.state = {selectedCourse: null, selectedGroup: null, selectedUser: null, querySearch: "", queryResult: null};
    }

    render() {       
        let main = 
            <div>                
                <DashboardNavBar course={this.state.selectedCourse}>   
                    <Nav className="mr-auto">
                        {this.state.selectedCourse !== null && 
                            <Nav.Link style={{color: "#dc3545"}} href="#" onClick={this.onUnselectCourse} title={this.state.selectedCourse.courseName}>
                                {`Course: ${UtilsString.slice(this.state.selectedCourse.courseName, 15)} (x)`}
                            </Nav.Link>
                        }
                        {this.state.selectedGroup !== null && 
                            <Nav.Link style={{color: "#dc3545"}} href="#" onClick={this.onUnselectGroup} title={this.state.selectedGroup.name}>
                                {`Groupe: ${UtilsString.slice(this.state.selectedGroup.name, 15)} (x)`}
                            </Nav.Link>
                        }
                        {this.state.selectedUser !== null && 
                            <Nav.Link style={{color: "#dc3545"}} href="#" onClick={this.onUnselectUser} title={this.state.selectedUser.name}>
                                {`Élève: ${UtilsString.slice(this.state.selectedUser.name, 25)} (x)`}
                            </Nav.Link>
                        }
                    </Nav>                 
                    
                    <Nav>
                        {this.state.selectedCourse && 
                            <Nav.Link href={`${M.cfg.wwwroot}/grade/report/grader/index.php?id=${this.state.selectedCourse.courseId}`} target="_blank">
                               <FontAwesomeIcon icon={faFileAlt}/> {" Rapport de l'évaluateur"}
                            </Nav.Link>
                        }
                    </Nav>

                    <Form inline>
                        <InputGroup className="mb-0">
                            <FormControl placeholder="Recherchez un élève..." aria-label="Recherchez un élève..." aria-describedby="search" value={this.state.querySearch} 
                                            onChange={this.onChangeSearch} onKeyPress={this.onSearch} disabled={this.state.selectedCourse === null}/>
                            <InputGroup.Append>
                                <InputGroup.Text id="basic-addon2"> <FontAwesomeIcon icon={faSearch}/></InputGroup.Text>
                            </InputGroup.Append>
                        </InputGroup>
                    </Form>
                </DashboardNavBar>

                {this.state.selectedCourse === null && <GadgetCourseList onSelectCourse={this.onSelectCourse}/>}
                
                {this.state.queryResult !== null ?
                    <DataGrid orderBy={true}>
                        <DataGrid.Header>
                            <DataGrid.Header.Row>
                                <DataGrid.Header.Cell style={{width: 70}}>{"#"}</DataGrid.Header.Cell>
                                <DataGrid.Header.Cell style={{width: 70}}>{"ID"}</DataGrid.Header.Cell>
                                <DataGrid.Header.Cell>{"Élève"}</DataGrid.Header.Cell>
                            </DataGrid.Header.Row>
                        </DataGrid.Header>
                        <DataGrid.Body>
                            {this.state.queryResult.map((item, index) => {
                                    let row = 
                                        <DataGrid.Body.Row key={index}>
                                            <DataGrid.Body.Cell>{index + 1}</DataGrid.Body.Cell>
                                            <DataGrid.Body.Cell>{item.userId}</DataGrid.Body.Cell>
                                            <DataGrid.Body.Cell sortValue={item.username}><a href='#' onClick={() => this.onSelectUser({id: item.userId, name: item.username})}>{item.username}</a></DataGrid.Body.Cell>
                                        </DataGrid.Body.Row>
                                    return (row);                                    
                                }
                            )}
                        </DataGrid.Body>
                    </DataGrid>
                    :
                    this.state.selectedCourse !== null ?
                    
                        this.state.selectedUser !== null ? 
                            <StudentGadgets courseId={this.state.selectedCourse.courseId} userId={this.state.selectedUser.id}/> 
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

    onSelectCourse(item){
        this.setState({selectedCourse: item, selectedGroup: null, querySearch: "", queryResult: null});
    }
    
    onUnselectCourse(){
        this.setState({selectedCourse: null, querySearch: "", queryResult: null});
    }

    onUnselectGroup(){
        this.setState({selectedGroup: null, querySearch: "", queryResult: null});
    }

    onSelectGroup(group){
        this.setState({selectedGroup: group, querySearch: "", queryResult: null});
    }

    onSelectUser(user){
        this.setState({selectedUser: user, querySearch: "", queryResult: null});
    }

    onUnselectUser(){
        this.setState({selectedUser: null, querySearch: "", queryResult: null});
    }

    onChangeSearch(event){
        this.setState({querySearch: event.target.value});
    }

    onSearch(event){
        let that = this;
        let callback = function(result){
            that.setState({querySearch: "", queryResult: result.data});
        }

        if(event.key === 'Enter'){
            $glVars.webApi.searchUser(this.state.querySearch, this.state.selectedCourse.courseId, callback);        
            event.preventDefault();
        }
    }
}

class DashboardNavBar extends Component{
    static defaultProps = {
        links:[],
        children: null,
        //course: null,
        //onSelectCourse: null
    };

    constructor(props) {
        super(props);

        //this.getData = this.getData.bind(this);
        //this.getDataResult = this.getDataResult.bind(this);

        //this.state = {courseList: [], selectedCourse: null};
    }

    /*componentDidMount(){
        this.getData();
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
    }*/

    render(){
        //let that = this;

        /* <Nav className="mr-auto">
                        <NavDropdown  variant="primary" title={(this.props.course !== null ? `Cours: ${this.props.course.courseName}` : "Sélectionnez le cours")} id="basic-nav-dropdown" >
                                {this.state.courseList.map(function(item, index){
                                    return <NavDropdown.Item key={index} href={`#${index}`} onClick={() => that.props.onSelectCourse(item)}>{item.courseName}</NavDropdown.Item>;
                                })}
                        </NavDropdown>
                    </Nav>*/
        let main = 
            <Navbar className="justify-content-between">
                <Navbar.Brand href="#"><FontAwesomeIcon icon={faTachometerAlt}/>{" Tableau de bord"}</Navbar.Brand>
                <Navbar.Toggle aria-controls="basic-navbar-nav" />
                <Navbar.Collapse id="basic-navbar-nav">                   
                    {this.props.children}
                </Navbar.Collapse>
            </Navbar>

        return main;
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

    //<GadgetAttendance  courseId={this.props.courseId} groupId={this.props.groupId}/>
    render(){
        let main = 
            <div style={{marginTop: 15, display: "flex", flexFlow: "column"}}>
                <GadgetCourseProgressOverview courseId={this.props.courseId} groupId={this.props.groupId} onSelectUser={this.props.onSelectUser}/>
                <br/><br/>
                <GadgetDiagnosticTags  courseId={this.props.courseId} groupId={this.props.groupId}/>
            </div>
        return main;
    }
}

export class StudentView extends Component{
    static defaultProps = {        
        userId: 0,
    };

    constructor(props) {
        super(props);

        this.onSelectCourse = this.onSelectCourse.bind(this);
        this.onUnselectCourse = this.onUnselectCourse.bind(this);

        this.state = {selectedCourse: null};
    }
    
    render() {       
        let main = 
            <div>
                <DashboardNavBar>                    
                    <Nav className="mr-auto">
                        {this.state.selectedCourse !== null && <Nav.Link style={{color: "#dc3545"}} href="#" onClick={this.onUnselectCourse}>{`Course: ${this.state.selectedCourse.courseName} (x)`}</Nav.Link>}
                    </Nav>
                    <Nav>
                        {this.state.selectedCourse && 
                            <Nav.Link href={`${M.cfg.wwwroot}/course/user.php?mode=grade&id=${this.state.selectedCourse.courseId}&user=${this.props.userId}`} target="_blank">
                                <FontAwesomeIcon icon={faBookOpen}/>{" Notes"}
                            </Nav.Link>
                        }
                    </Nav>
                </DashboardNavBar>
                {this.state.selectedCourse === null && <GadgetCourseList onSelectCourse={this.onSelectCourse}/>}
                {this.state.selectedCourse !== null && <StudentGadgets courseId={this.state.selectedCourse.courseId} userId={this.props.userId}/>}
            </div>;

        return (main);
    }

    onSelectCourse(item){
        this.setState({selectedCourse: item});
    }

    onUnselectCourse(){
        this.setState({selectedCourse: null, querySearch: "", queryResult: null});
    }
}

class StudentGadgets extends Component {
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
                    <p><small className="text-muted">{this.state.profile.email}</small><small className="text-muted">{` | Dernière connexion: ${this.state.profile.lastLogin}`}</small></p>
                    <GadgetStudentRadar  courseId={this.props.courseId} userId={this.props.userId}/> 
                </div>
                <GadgetCourseProgressDetailled courseId={this.props.courseId} userId={this.props.userId}/>
                <GadgetDiagnosticTags  courseId={this.props.courseId} userId={this.props.userId}/>
            </div>;

        return (main);
    }
}

