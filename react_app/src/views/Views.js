import React, { Component } from 'react';
import {Card, Nav, Button, Collapse, Jumbotron} from 'react-bootstrap';
import {faTachometerAlt, faPlus, faMinus, faFileAlt, faThumbsUp} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {ComboBox} from '../libs/components/Components';
import {JsNx} from '../libs/utils/Utils';
import {$glVars} from '../common/common';
import {GadgetGroupsOverview} from './gadgets/GadgetGroupsOverview';
import {ReportDiagnosticTags} from './reports/ReportDiagnosticTags';
import {ReportCourseProgressOverview} from './reports/ReportCourseProgress';

export class MainView extends Component{
    static defaultProps = { 
        courseId: 0
    };


    constructor(props){
        super(props);

        this.onSelect = this.onSelect.bind(this);
        this.onChangeFilterOptions = this.onChangeFilterOptions.bind(this);

        this.state = {selectedView: 1, options: null};
    }

    render(){
        let main = 
            <div>
                <Jumbotron className='bg-light' style={{padding: "2rem 2rem", marginTop: "1rem"}}>
                    <h1><img src='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAHYAAAB0CAMAAABnsTYoAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAMAUExURQAAAABpvwJqvyp9vwRrwAZswAduwAhtwQhuwQtvwgtwwQ5wwQ1wwg5xww9ywxBywxJ0wxN0xBd1whR1xBZ2xBl2wRh3xRp4xR95wR56xR56xh97xyJ8xyV8wiR9xyV+yCZ/yTKBvz+HvSeAySiAySyCyi6Dyy+Eyi+EyzCFyzKGyzaIzDeJzTiJzTiKzTuMzj2MzkGGu2WTr3KVpkCOz0KQz0OR0ESQ0EaS0EeS0UmT0UqU0UyV0kyW0U2W0k6X01KZ01Oa01Oa1FWa1Fid1Vqd1lqe1Vue1l6g1l+h12Ki12Sj2Gak2Gqn2Wqn2muo2Wuo2m2o2m6q2nGq23Ks23St3Hau3Hev3Xiv3Xqw3Xux3n6y3n+03rugbPGgL/qiKvmiK/qjLPqjLfqjLvqkL/qnNfqoOPmqP8efXtqfSMOfYcKfZNegS9GgVdWgUNupX9eoYeGgQvqrQPqsQvquR/qvSPqvSfqwS/qzUfqzUvuzVPu1V/u2V/u2WPu4Xfu5X/u6YPu6Yvu+a/u+bPvEePvEefvGfPzEePzEeZacjJychZidjKGvroC034O24Ia34Ie44Ie44Ym64Yy74o284o+945C945C+45TA5JfB5ZfC5JjC5JrC5ZrE5ZvE5pzF5p/G56DH5qDG56HI56PJ6KTJ6KXK6KjM6arN6qzO6q/Q6q/Q67DQ6rLR67PS7LTT7LbU7LjV7brW7bzX7r3Y7r7Z77/a7/vHgPzIgvzJhPzJhfzKhfzKhvzKh/zLiPzLivzOj/zPk/zQk/zQlPzRlf3ZqP3brv3guf3iu/3hvP3ivMDa78Pb8MPc8Mbd8Mfe8Mje8cvg8szg8s7i89Ll89Lk9NTm89bm9Nno9dvq9d3q9t7s9v7kwP3nyf3oy/7r0v7s0/7t1v7t1/7w3eHt9+Pu+OTv+OXw+Obw+ejx+eny+erz+uz0+u71+/7y4/705fD2+/L3/PP4/PT5/Pb6/f/58v/68//89/j7/fr8/v/8+f/9/P/+/P3+/v7+/wAAAFY5PcMAAAEAdFJOU////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////wBT9wclAAAACXBIWXMAAA7DAAAOwwHHb6hkAAAAGHRFWHRTb2Z0d2FyZQBwYWludC5uZXQgNC4wLjVlhTJlAAAGpklEQVRoQ+2Zd3gURRiHb2MiERIDEj0NEVBaIBpOBSOgB4ooiVgIRTHqKdh7B+wtiiWKiBIQLKBobCiCimADGwlqJCgQxI5SFWJUojLnlN9e9mZ3Lsu5k3sen7z8wXxl92Vv2+zgCzfOOzdfOSbkLY1q3zwXnZ7SiPbts9DnMbG1V6HLc2JqR6PJe2Jp0aKDGNoz0aIDtfYcdGhBqb0VDXpQalHXhEo7HnVNqLQo60KhXYiyLhTasSjrQqFFVRvNWgqq2mjWUlDVhqQd1rdbFmWfveNl3/0PvvcC7DsGVm3fJMMb9rv7DOxeRYO2G7bxhD3viT1JMLVD0O8ZB10BgyPQdkezh+xxPhROCG02Wj2l1YVwOMC1XdCoJCUA2iPhilaXQmKHaQeiTc1AIqjrjIQ7dlFe0EyLphi8CO1JiN1yCCw2qNaPHjVt6oV1DmLXJF8MjQzVoiUGJwrrxkzErsgvLSsrvQ8aGV/YxemqEtrDEbqiVGzzATwSPhcH20HsYRpCd2wUG/3p/KXqRiv+4StSEboijW9Dcf5W9fVDXwxeYZuv27lHip87KZiDvr54CecmEfpc7O0xuvX8dghckiqkhJwnPGGES0Toa4G+GKQWDs3F0D0/Cs3mS4RH1qLLc4qE5v6LhKeptEbO0AceHJZnnC48jWkzggMC0bOMzB6B/ED3tojstM4NDgj26aK40BXaNRzzYZv7xG+09jQiw+hR+kmt6Ccbnitw2POhM2pQ37FySh6SVhRaEW1lz72Wx1WLaJjYwjjicxGbbBmZggo4ZiUq4NMACkZ6MbgsFLq6ZMIdv6KjouSuCRNKSqAls42uZdswJh35lhnPI7Sw3Pre8M9H1sIknKB2iMm4UKgEQwumlizH35Q1fEP/KoRR1DR4O65DLoqnRNGt1kIZ2y5N+v1MqszrbXfHfxYhp/JqHNog2+5JBDbME1+GWKaev9J2XrudXbC5COjVNqOgd4/ehTPrEG8S13O7HYhtPMvLCNxr57LNXkJAprVkIcX/GTIFPJyIiGwv65W1W3r74HR26zHq2S2+M9rK4d0zjL3Ydew3j2USd3AycQeLqY15u26LPK7br0dqMA1ca7c/aplnYBpDNlufELNErpZdVJ3EmJDhosY4EqmpdGzV3rL044rfEf6wtGJpRUVFRDsn6g1YjuzjiDmDkGTT6gKM69JFjbNV5ObRoVXL+B7hYhFGtOyXaQCvLRL1aZSD5FF0PAXj+aIkqBS5L+hQpY1+OErayEu6FxKcDCSH0vEcjCeKkqDwYU4xHcal7YgkyUGCsyuSbLfmw0T1pShrv0MYUxtAkowcbAVJdnVvxpg/WhyI62jzkXTmIdqBIYm8ciTi0gaRdIb+yOkYuta6+pH7IOlMPFpXN1Dk3Doy4j9o3V1SjhTp0nZFkgRzHGij60fORDL6vrWCOslHLBPX0SYhSQ5AwsYmNByNWCYurbEB2f4iBPiR2SzTfErRy6uBEdXV1XT2u5IO49MuQ9acwXBSkDyZjs1pwExREswUuZ/pUKV9T4QKrTlRmoWYY348nkDH5htotSgJ5opcrKN9X4QK7RBk1yPm9EOSvfjM5zOxrN8l4YRX0bFK+5EIFdpsZIn1q3s6cuzyxsICIeWixjAfqS/Qsaz9BuHft/NQoTW+RHoVvUlBFywT1SWzKDJLZmeak2lOrybTQNZ+hZCQX75eu3atSjsKaVIzkFvosfyEzMs8xEoM5bVjO7f2d+o/yXwX8ptK1i5BCFTa9MgHEdk2b3bZ1HJTSsgg3uDHsdupz6BlWXsjQqDSGqchb6MGRz8ZsY1nWFXWhr5FLFBqU/DRaeMwNLQ0T7/EFr64YtPe8A8SHKXWyHL8oLM8lrJXIxXF1p68aNOGFiHBUWuNLKz5WakrRJHR1pw+WliG6bZdG3rjL6QoMbRG8vHSx+aOcmkVKyidiarIjM5BG7r2wz+QDPuKgPOKZ17xq+aXTW3lKIels56PrMDnUm1lsWUVPg27LbocTs6Y6267c9Fb9I+LBaLU7JwDA13Vi7qpnQPB/DzVqjSWTCT0rUuBZm1obGK0CxKjDSdEe01itOGEaMclRDs6nBAt+8/MptcuSIh2IbM2tfZsLm1q7Y2wNql2PJyUptKOvv5dGDnatfBINGs9BR6JZq2XpMEjoVvbBx4J3VpoZP6f2iA0Mpq1sNjQqx0Miw2tWj8kdnRqk+FwQKM2CQon9GlTYXBEm7YDBM5o0rYoxv4VaNG2HYm9K/Fam5LV6xTsWk04/C+LOCax9YczEgAAAABJRU5ErkJggg==' width='32' height='32'/> Centrale d'information</h1>
                    <p>Faites le suivi rapide de vos dossiers en utilisant le Tableau de bord ou consultez les détails en utilisant les rapports RÉCIT.</p>
                    <Nav variant="pills" activeKey={this.state.selectedView} onSelect={this.onSelect}>
                        <Nav.Item>
                            <Nav.Link href="#" eventKey={0}><FontAwesomeIcon icon={faTachometerAlt}/> Tableau de bord</Nav.Link>
                        </Nav.Item>
                        <Nav.Item>
                            <Nav.Link href="#" eventKey={1}><FontAwesomeIcon icon={faFileAlt}/> Rapports</Nav.Link>
                        </Nav.Item>
                    </Nav>  
                    <br/>    <br/>    
                    {this.getFilterOptions()}              
                </Jumbotron>

                {this.getView()}
            </div>

        return main;
    }

    onSelect(eventKey){
        this.setState({selectedView: eventKey});
    }

    getView(){
        switch(this.state.selectedView.toString()){
            case '0': return <DashboardView options={this.state.options}/>;
            case '1': return <ReportsView options={this.state.options}/>;
            default: return null;
        }
    }

    getFilterOptions(){
        switch(this.state.selectedView.toString()){
            case '0': return <FilterOptions onChange={this.onChangeFilterOptions} courseId={this.props.courseId} course={true}/>;
            case '1': return <FilterOptions onChange={this.onChangeFilterOptions} courseId={this.props.courseId} course={true} section={true} activity={true} reports={true} group={true}/>;
            default: return null;
        }
    }

    onChangeFilterOptions(options){
        this.setState({options: options});
    }
}

class DashboardView extends Component{
    static defaultProps = { 
        options: null
    };

    render() {  
        let desc = "";
        if(this.props.options !== null){
            desc = `${this.props.options.courseName}`;
        }

        let main =
            <div>
                <h2 style={{textAlign: 'center'}}>{desc}</h2>
                <GadgetGroupsOverview options={this.props.options} /> 
            </div>

        return (main);
    }
}

class ReportsView extends Component{
    static defaultProps = { 
        options: null
    };

    render() {  
        let desc = "";
        if(this.props.options !== null){
            desc = 
            <div style={{textAlign: 'center'}}>
                <h2>{this.props.options.courseName}</h2>
                <h3>{this.props.options.sectionName}</h3>
                <h4>{this.props.options.cmName}</h4>
                <h5>{this.props.options.reportName}</h5>
            </div>
        }

        let main =
            <div>
                <h4>{desc}</h4>
                {this.getReport()}
            </div>

        return (main);
    }

    getReport(){
        if(this.props.options === null){ return null;}

        switch(this.props.options.reportId){
            case '1':
                return <ReportDiagnosticTags options={this.props.options}/>;
            case '2':
                return <ReportCourseProgressOverview options={this.props.options}/>;
            default:
                return null;
        }
    }
}

class FilterOptions extends Component{
    static defaultProps = { 
        onChange: null,
        courseId: 0,
        course: false,
        section: false,
        activity: false,
        group: false,
        reports: false
    };

    constructor(props){
        super(props);

        this.getDataResult = this.getDataResult.bind(this);
        this.onAfterDataResult = this.onAfterDataResult.bind(this);
        this.getEnrolledUserListResult = this.getEnrolledUserListResult.bind(this);
        this.onDataChange = this.onDataChange.bind(this);

        this.state = {
            collapse: true,
            dataProvider: [],             
            courseList: [], 
            sectionList: [],
            activityList: [],
            reportList: [
                {text: 'Test selon les tags de questions', value: '1'},
                {text: 'Aperçu de la progression', value: '2'}
            ],
            groupList: [],
            options: {
                courseId: 0,
                courseName: "",
                sectionId: 0,
                sectionName: "",
                cmId: 0,
                cmName: "",
                reportId: '0',
                reportName: "",
                groupId: 0,
                groupName: ""
            }
        };
    }

    componentDidMount(){
        this.getData();
    }

    getData(){
        $glVars.webApi.getCourseSectionActivityList(1, this.getDataResult);        
    }

    getDataResult(result){         
        if(result.success){
            let courseList = [];
            for(let item of result.data){
                if(JsNx.getItem(courseList, 'value', item.courseId, null) === null){
                    courseList.push({text: item.courseName, value: item.courseId, data: item});
                }
            }
            this.setState({dataProvider: result.data, courseList: courseList, sectionList: [], activityList: []}, this.onAfterDataResult);
        }
        else{
            $glVars.feedback.showError($glVars.i18n.tags.appname, result.msg);
        }
    }

    onAfterDataResult(){
        if(parseInt(this.props.courseId,10) > 0){
            this.onDataChange({target: {name: 'courseId', value: this.props.courseId.toString()}});
        }
    }
    
    render(){
        let style = {borderRight: "1px solid #dfdfdf", paddingLeft: "2rem", paddingRight: "2rem"};

        let main = 
                <div style={{marginBottom: "1rem", padding: ".5rem", border: "1px solid #dfdfdf", borderRadius: "4px"}}>
                    <h6>Options de filtrage <Button variant="link" size="sm" onClick={() => {this.setState({collapse: !this.state.collapse})}}>{this.state.collapse ? <FontAwesomeIcon icon={faMinus}/> : <FontAwesomeIcon icon={faPlus}/>}</Button></h6>
                    <Collapse in={this.state.collapse}>
                        <div>
                            <div style={{display: "grid", gridTemplateColumns: "23% 23% 23% 23% 8%", justifyContent: 'left', alignItems: "initial"}}>
                                {this.props.course && 
                                    <div style={style}>
                                        <strong>Cours</strong>
                                        <ComboBox placeholder={"Sélectionnez votre option"} options={this.state.courseList} onChange={this.onDataChange} name="courseId" value={this.state.options.courseId}/>
                                    </div>}
                                {this.props.section && 
                                    <div style={style}>
                                        <div>
                                            <strong>Sections</strong>
                                            <ComboBox placeholder={"Sélectionnez votre option"} options={this.state.sectionList} onChange={this.onDataChange} name="sectionId" value={this.state.options.sectionId}/>
                                        </div>
                                        <br/>
                                        {this.props.activity && 
                                            <div>
                                                <strong>Activités</strong>
                                                <ComboBox placeholder={"Sélectionnez votre option"} options={this.state.activityList} onChange={this.onDataChange} name="cmId" value={this.state.options.cmId}/>
                                            </div>  
                                        }
                                    </div>
                                }
                                {this.props.group && 
                                    <div style={style}>
                                        <strong>Groupe</strong>
                                        <ComboBox placeholder={"Sélectionnez votre option"} options={this.state.groupList} onChange={this.onDataChange} name="groupId" value={this.state.options.groupId}/>
                                    </div>  
                                }
                                {this.props.reports && 
                                    <div style={style}>
                                        <strong>Rapports</strong>
                                        <ComboBox placeholder={"Sélectionnez votre option"} options={this.state.reportList} onChange={this.onDataChange} name="reportId" value={this.state.options.reportId}/>
                                    </div>
                                }
                                <div style={{ paddingLeft: "2rem", paddingRight: "2rem"}}>
                                    <Button variant='primary' onClick={() => this.props.onChange(JsNx.clone(this.state.options))}><FontAwesomeIcon icon={faThumbsUp}/>  Allez</Button>
                                </div>
                            </div>
                        </div>
                    </Collapse>                        
                </div>;
            

        return main;
    }

    onDataChange(event){
        let options = this.state.options;
        let sectionList = [];
        let activityList = [];

        options[event.target.name] = event.target.value;

        for(let item of this.state.dataProvider){
            if((item.courseId.toString() === options.courseId) && (JsNx.getItem(sectionList, 'value', item.sectionId, null) === null)){
                sectionList.push({text: item.sectionName, value: item.sectionId});
            }

            if((item.sectionId.toString() === options.sectionId) && (JsNx.getItem(activityList, 'value', item.cmId, null) === null)){
                activityList.push({text: item.cmName, value: item.cmId});
            }

            if((item.courseId.toString() === options.courseId)){
                options.courseName = item.courseName;
            }

            if((item.sectionId.toString() === options.sectionId)){
                options.sectionName = item.sectionName;
            }

            if((item.cmId.toString() === options.cmId)){
                options.cmName = item.cmName;
            }
        }

        let reportItem = JsNx.getItem(this.state.reportList, 'value', options.reportId, null);
        if(reportItem){
            options.reportName = reportItem.text;
        }

        if((event.target.name === "courseId") && (parseInt(options.courseId,10) > 0)){
            $glVars.webApi.getEnrolledUserList(0, 0, options.courseId, this.getEnrolledUserListResult); 
        }

        this.setState({options: options, sectionList: sectionList, activityList: activityList});
    }
    
    getEnrolledUserListResult(result){
        if(result.success){
            let groupList = [];
            for(let groups of result.data){
                let group = JsNx.at(groups, 0, null);
                if(group){
                    groupList.push({text: group.groupName, value: group.groupId, data: group});
                }
            }
            this.setState({groupList: groupList});
        }
        else{
            $glVars.feedback.showError($glVars.i18n.tags.appname, result.msg);
        }
    }
}

/*
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
                <GadgetPendingHomeworks courseId={this.props.courseId} groupId={this.props.groupId} onSelectUser={this.props.onSelectUser}/>
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

*/