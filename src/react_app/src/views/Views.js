import React, { Component } from 'react';
import {Navbar, Nav, Form, FormControl, InputGroup, Card, ProgressBar, NavDropdown, Jumbotron} from 'react-bootstrap';
import {faTachometerAlt, faSearch, faBookOpen, faFileAlt} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {DataGrid} from '../libs/components/Components';
import {UtilsString, JsNx} from '../libs/utils/Utils';
import {$glVars} from '../common/common';
//import {GadgetAttendance} from './GadgetAttendance';
import {GadgetCourseProgressOverview, GadgetCourseProgressDetailled} from './GadgetCourseProgress';
import {GadgetDiagnosticTags} from './GadgetDiagnosticTags';
import {GadgetGroupsOverview} from './GadgetGroupsOverview';
import {GadgetStudentTracking} from './GadgetStudentTracking';
import {GadgetStudentAssiduity} from './GadgetStudentAssiduity';

export class DashboardView extends Component{
    static defaultProps = {        
        mode: 's',
        selectCourseId: 0
    };

    constructor(props) {
        super(props);

        this.onSelectCourse = this.onSelectCourse.bind(this);
        this.onUnselectCourse = this.onUnselectCourse.bind(this);

        this.state = {selectedCourse: null, selectCourseId: props.selectCourseId};
    }

    render() {  
        let main =
            <div>
                {this.props.mode  === 't' ? 
                    <TeacherView options={{selectedCourse: this.state.selectedCourse, userId: 0}} onUnselectCourse={this.onUnselectCourse}/> 
                : 
                    <StudentView options={{selectedCourse: this.state.selectedCourse, userId: $glVars.signedUser.userId}} onUnselectCourse={this.onUnselectCourse} />
                }     
                {this.state.selectedCourse === null && <GadgetCourseList selectCourseId={this.state.selectCourseId} onSelectCourse={this.onSelectCourse}/>}
            </div>

        return (main);
    }

    onSelectCourse(item){
        this.setState({selectedCourse: item});
    }

    onUnselectCourse(){
        this.setState({selectedCourse: null, selectCourseId: 0});
    }
}

class GadgetCourseList extends Component{
    static defaultProps = {
        selectCourseId: 0,        
        onSelectCourse: null
    };

    constructor(props) {
        super(props);

        this.getData = this.getData.bind(this);
        this.getDataResult = this.getDataResult.bind(this);
        this.selectCourse = this.selectCourse.bind(this);

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
            this.setState({courseList: result.data}, this.selectCourse);
        }
        else{
            $glVars.feedback.showError($glVars.i18n.tags.appname, result.msg);
        }
    }

    selectCourse(){
        for(let item of this.state.courseList){
            if(item.courseId === this.props.selectCourseId){
                this.props.onSelectCourse(item);
            }
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
                                <ProgressBar animated now={item.pctProgress}  label={`${item.pctProgress.toFixed(0)}%`}/>
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

class TeacherView extends Component {
    static defaultProps = {        
        options: null,
        onUnselectCourse: null
    };

    constructor(props) {
        super(props);

        this.onSelectGroup = this.onSelectGroup.bind(this);
        this.onUnselectGroup = this.onUnselectGroup.bind(this);
        this.onSelectUser = this.onSelectUser.bind(this);
        this.onUnselectUser = this.onUnselectUser.bind(this);
        this.onChangeSearch = this.onChangeSearch.bind(this);
        this.onSearch = this.onSearch.bind(this);
        this.onMyGroupsOn = this.onMyGroupsOn.bind(this);

        this.state = {selectedGroup: null, selectedUser: null, querySearch: "", queryResult: null, onlyMyGroups: true };
    }

    render() {       
        let selectedCourse = this.props.options.selectedCourse;
        let options = JsNx.clone(this.props.options);
        options.onlyMyGroups = this.state.onlyMyGroups;
        options.userId = (this.state.selectedUser ? this.state.selectedUser.id : options.userId);

        let main = 
            <div>   
                {selectedCourse === null ?
                    <DashboardIntro/>
                    :
                    <DashboardNavBar>
                        <Nav className="mr-auto"></Nav>
                            <NavDropdown title={<span><FontAwesomeIcon icon={faFileAlt}/>{" Rapports"}</span>} id="menu-reports">
                                <NavDropdown.Item href={`${M.cfg.wwwroot}/grade/report/grader/index.php?id=${selectedCourse.courseId}`} target="_blank">
                                    {" Rapport de l'évaluateur"}
                                </NavDropdown.Item>                        
                                <NavDropdown.Item href={`${M.cfg.wwwroot}/report/embedquestion/index.php?courseid=${selectedCourse.courseId}`} target="_blank">
                                    {" Questions intégrées"}
                                </NavDropdown.Item>                        
                                
                            </NavDropdown>
                    
                        <Form inline>
                            <InputGroup className="mb-0">
                                <FormControl placeholder="Recherchez un élève..." aria-label="Recherchez un élève..." aria-describedby="search" value={this.state.querySearch} 
                                                onChange={this.onChangeSearch} onKeyPress={this.onSearch} disabled={selectedCourse === null}/>
                                <InputGroup.Append>
                                    <InputGroup.Text id="basic-addon2"> <FontAwesomeIcon icon={faSearch}/></InputGroup.Text>
                                </InputGroup.Append>
                            </InputGroup>
                        </Form>   
                    </DashboardNavBar>   
                }   
                
                <DashboardFilters show={(selectedCourse !== null)}>
                        <Form>
                            <Form.Group controlId="formBasicCheckbox">
                                <Form.Check type="checkbox" label=" Afficher uniquement mes groupes" checked={this.state.onlyMyGroups} onChange={this.onMyGroupsOn} />
                            </Form.Group>
                        </Form>
                      
                        {selectedCourse !== null && 
                            <Nav.Link style={{color: "#dc3545"}} href="#" onClick={this.props.onUnselectCourse} title={selectedCourse.courseName}>
                                {`Course: ${UtilsString.slice(selectedCourse.courseName, 15)} (x)`}
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
                </DashboardFilters>
                
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
                    selectedCourse !== null ?
                    
                        this.state.selectedUser !== null ? 
                            <StudentGadgets options={options}/> 
                        :
                            this.state.selectedGroup === null ? 
                                <TeacherCourseView options={options} onSelectGroup={this.onSelectGroup} onSelectUser={this.onSelectUser}/>
                            :
                                <TeacherGroupView  courseId={selectedCourse.courseId} groupId={this.state.selectedGroup.id} onSelectUser={this.onSelectUser}/>
                    :
                        null
                }                
            </div>;

        return (main);
    }

    onMyGroupsOn(){
        this.setState({onlyMyGroups: !this.state.onlyMyGroups});
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
            $glVars.webApi.searchUser(this.state.querySearch, this.props.options.selectedCourse.courseId, callback);        
            event.preventDefault();
        }
    }
}

class DashboardIntro extends Component{
    render(){
        let main = 
            <Jumbotron style={{padding: "2rem 2rem", margin: "1rem"}}>
                <h1>Tableau de bord RÉCIT</h1>
                <p>Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s...</p>
            </Jumbotron>;
        return main;
    }
}

class DashboardFilters extends Component{
    static defaultProps = {
        show: false,
        children: null
    };

    render(){
        let main = 
            <div style={{display: "flex", marginBottom: "1rem", alignItems: "baseline", padding: "1rem"}} className="bg-light">
                {this.props.children}
            </div> 
                  
        return (this.props.show ? main : null);
    }
}

class DashboardNavBar extends Component{
    static defaultProps = {
        brandDesc: null,
        children: null
    };

    render(){
        let brandDesc = this.props.brandDesc || <span><FontAwesomeIcon icon={faTachometerAlt}/>{" Tableau de bord RÉCIT"}</span>;

        let main = 
            <Navbar className="justify-content-between mb-3">
                <Navbar.Brand href="#">{brandDesc}</Navbar.Brand>
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
        options: null,
        onSelectGroup: null,
        onSelectUser: null
    };

    render(){
        let main = 
            <div>
                <GadgetGroupsOverview options={this.props.options} onSelectGroup={this.props.onSelectGroup}/> 
                <GadgetStudentTracking options={this.props.options} onSelectGroup={this.props.onSelectGroup} onSelectUser={this.props.onSelectUser}/> 
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
            <div>
                <GadgetCourseProgressOverview courseId={this.props.courseId} groupId={this.props.groupId} onSelectUser={this.props.onSelectUser}/>
                <GadgetDiagnosticTags courseId={this.props.courseId} groupId={this.props.groupId}/>
            </div>
        return main;
    }
}

class StudentView extends Component{
    static defaultProps = {        
        options: null,
        onUnselectCourse: null
    };

    render() {     
        let selectedCourse = this.props.options.selectedCourse;
        let userId = this.props.options.userId;

        let main = 
            <div>
                {selectedCourse === null ?
                    <DashboardIntro/>
                    :
                    <DashboardNavBar>                    
                        <Nav className="mr-auto"></Nav>
                        <NavDropdown title={<span><FontAwesomeIcon icon={faFileAlt}/>{" Rapports"}</span>} id="menu-reports">
                            <NavDropdown.Item href={`${M.cfg.wwwroot}/course/user.php?mode=grade&id=${selectedCourse.courseId}&user=${userId}`} target="_blank">
                                <FontAwesomeIcon icon={faBookOpen}/>{" Notes"}
                            </NavDropdown.Item>                        
                        </NavDropdown>
                    </DashboardNavBar>
                }

                <DashboardFilters show={(selectedCourse !== null)}>
                    {selectedCourse !== null && 
                        <Nav.Link style={{color: "#dc3545"}} href="#" onClick={this.props.onUnselectCourse}>{`Course: ${selectedCourse.courseName} (x)`}</Nav.Link>
                    }
                </DashboardFilters>

                {selectedCourse !== null && <StudentGadgets options={this.props.options}/>}
            </div>;

        return (main);
    }
}

class StudentGadgets extends Component {
    static defaultProps = {        
        options: null,
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
        $glVars.webApi.getUserProfile(this.props.options.selectedCourse.courseId, this.props.options.userId, this.getDataResult);        
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
        let courseId = this.props.options.selectedCourse.courseId;
        let userId = this.props.options.userId;

        let main = 
            <div>
                <div className="gadget" style={{padding: "1rem", backgroundColor: "#fafafa"}}>
                    <img src={this.state.profile.avatar} style={{borderRadius: "50%", marginRight: "1rem", float: "left"}}/>
                    <h2>{this.state.profile.name}</h2>
                    <p><small className="text-muted">{this.state.profile.email}</small><small className="text-muted">{` | Dernière connexion: ${this.state.profile.lastLogin}`}</small></p>
                    <GadgetStudentTracking options={this.props.options}/> 
                </div>
                <GadgetCourseProgressDetailled courseId={courseId} userId={userId}/>
                <GadgetDiagnosticTags  courseId={courseId} userId={userId}/>
                <GadgetStudentAssiduity  courseId={courseId} userId={userId}/>
            </div>;

        return (main);
    }
}

