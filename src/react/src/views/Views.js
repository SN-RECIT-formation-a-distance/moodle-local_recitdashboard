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
import {NavDropdown, Nav, Button, Collapse, Jumbotron} from 'react-bootstrap';
import {faChartLine, faPlus, faMinus, faFileAlt, faSearchPlus} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {JsNx} from '../libs/utils/Utils';
import {$glVars} from '../common/common';
import {GadgetWorkFollowup} from './gadgets/GadgetWorkFollowup';
import {GadgetStudentFollowup} from './gadgets/GadgetStudentFollowup';
import {ReportDiagnosticTags} from './reports/ReportDiagnosticTags';
import {ReportSectionResults} from './reports/ReportSectionResults';
import {ReportQuiz} from './reports/ReportQuiz';
import {ReportActivityCompletion} from './reports/ReportActivityCompletion';
import { OptionManager } from '../common/Options';
import { ComboBoxPlus } from '../libs/components/ComboBoxPlus';
import { i18n } from '../common/i18n';

export class MainView extends Component{
    static defaultProps = { 
        courseId: 0
    };


    constructor(props){
        super(props);

        this.onSelect = this.onSelect.bind(this);
        this.onChangeFilterOptions = this.onChangeFilterOptions.bind(this);
        this.onGo = this.onGo.bind(this);

        this.state = {
            selectedView: 0, 
            show: false,
            options: {
                course: {id: this.props.courseId, name: ""},
                group: {id: 0, name: ""},
                student: {id: 0, name: ""},
                section: {id: 0, name: ""},
                cm: {id: 0, name: ""},
                report: {id: 0, name: "", validation: null, require: {course: true, group: true, student: false, section: false, cm: false}}                
            },
            reportList: [
                {text: i18n.get_string('activityachievements'), value: 3, require:{course: true, group: true, student: true, section: true, cm: false}, validation: function(options){
                    return (options.course.id > 0 && options.group.id > 0)
                    }
                },
                {text: i18n.get_string('resultsbysection'), value: 2, require:{course: true, group: true, student: true, section: true, cm: false}, validation: function(options){
                    return (options.course.id > 0 && options.group.id > 0)
                    }
                },
                {text: i18n.get_string('quizresults'), value: 4, require:{course: true, group: true, student: true, section: true, cm: true}, validation: function(options){
                        return (options.course.id > 0 && options.group.id > 0 && options.cm.id > 0)
                    }
                },
                {text: i18n.get_string('taganalysis'), value: 1, require:{course: true, group: true, student: false, section: true, cm: true}, validation: function(options){
                        return (options.course.id > 0 && options.group.id > 0)
                    }
                }
            ],
        };
    }

    render(){
        let main = 
            <div style={{minHeight: '675px'}}>
                <Jumbotron className='bg-light' style={{padding: "2rem 2rem", marginTop: "1rem"}}>
                    <h1><img src='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAHYAAAB0CAMAAABnsTYoAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAMAUExURQAAAABpvwJqvyp9vwRrwAZswAduwAhtwQhuwQtvwgtwwQ5wwQ1wwg5xww9ywxBywxJ0wxN0xBd1whR1xBZ2xBl2wRh3xRp4xR95wR56xR56xh97xyJ8xyV8wiR9xyV+yCZ/yTKBvz+HvSeAySiAySyCyi6Dyy+Eyi+EyzCFyzKGyzaIzDeJzTiJzTiKzTuMzj2MzkGGu2WTr3KVpkCOz0KQz0OR0ESQ0EaS0EeS0UmT0UqU0UyV0kyW0U2W0k6X01KZ01Oa01Oa1FWa1Fid1Vqd1lqe1Vue1l6g1l+h12Ki12Sj2Gak2Gqn2Wqn2muo2Wuo2m2o2m6q2nGq23Ks23St3Hau3Hev3Xiv3Xqw3Xux3n6y3n+03rugbPGgL/qiKvmiK/qjLPqjLfqjLvqkL/qnNfqoOPmqP8efXtqfSMOfYcKfZNegS9GgVdWgUNupX9eoYeGgQvqrQPqsQvquR/qvSPqvSfqwS/qzUfqzUvuzVPu1V/u2V/u2WPu4Xfu5X/u6YPu6Yvu+a/u+bPvEePvEefvGfPzEePzEeZacjJychZidjKGvroC034O24Ia34Ie44Ie44Ym64Yy74o284o+945C945C+45TA5JfB5ZfC5JjC5JrC5ZrE5ZvE5pzF5p/G56DH5qDG56HI56PJ6KTJ6KXK6KjM6arN6qzO6q/Q6q/Q67DQ6rLR67PS7LTT7LbU7LjV7brW7bzX7r3Y7r7Z77/a7/vHgPzIgvzJhPzJhfzKhfzKhvzKh/zLiPzLivzOj/zPk/zQk/zQlPzRlf3ZqP3brv3guf3iu/3hvP3ivMDa78Pb8MPc8Mbd8Mfe8Mje8cvg8szg8s7i89Ll89Lk9NTm89bm9Nno9dvq9d3q9t7s9v7kwP3nyf3oy/7r0v7s0/7t1v7t1/7w3eHt9+Pu+OTv+OXw+Obw+ejx+eny+erz+uz0+u71+/7y4/705fD2+/L3/PP4/PT5/Pb6/f/58v/68//89/j7/fr8/v/8+f/9/P/+/P3+/v7+/wAAAFY5PcMAAAEAdFJOU////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////wBT9wclAAAACXBIWXMAAA7DAAAOwwHHb6hkAAAAGHRFWHRTb2Z0d2FyZQBwYWludC5uZXQgNC4wLjVlhTJlAAAGpklEQVRoQ+2Zd3gURRiHb2MiERIDEj0NEVBaIBpOBSOgB4ooiVgIRTHqKdh7B+wtiiWKiBIQLKBobCiCimADGwlqJCgQxI5SFWJUojLnlN9e9mZ3Lsu5k3sen7z8wXxl92Vv2+zgCzfOOzdfOSbkLY1q3zwXnZ7SiPbts9DnMbG1V6HLc2JqR6PJe2Jp0aKDGNoz0aIDtfYcdGhBqb0VDXpQalHXhEo7HnVNqLQo60KhXYiyLhTasSjrQqFFVRvNWgqq2mjWUlDVhqQd1rdbFmWfveNl3/0PvvcC7DsGVm3fJMMb9rv7DOxeRYO2G7bxhD3viT1JMLVD0O8ZB10BgyPQdkezh+xxPhROCG02Wj2l1YVwOMC1XdCoJCUA2iPhilaXQmKHaQeiTc1AIqjrjIQ7dlFe0EyLphi8CO1JiN1yCCw2qNaPHjVt6oV1DmLXJF8MjQzVoiUGJwrrxkzErsgvLSsrvQ8aGV/YxemqEtrDEbqiVGzzATwSPhcH20HsYRpCd2wUG/3p/KXqRiv+4StSEboijW9Dcf5W9fVDXwxeYZuv27lHip87KZiDvr54CecmEfpc7O0xuvX8dghckiqkhJwnPGGES0Toa4G+GKQWDs3F0D0/Cs3mS4RH1qLLc4qE5v6LhKeptEbO0AceHJZnnC48jWkzggMC0bOMzB6B/ED3tojstM4NDgj26aK40BXaNRzzYZv7xG+09jQiw+hR+kmt6Ccbnitw2POhM2pQ37FySh6SVhRaEW1lz72Wx1WLaJjYwjjicxGbbBmZggo4ZiUq4NMACkZ6MbgsFLq6ZMIdv6KjouSuCRNKSqAls42uZdswJh35lhnPI7Sw3Pre8M9H1sIknKB2iMm4UKgEQwumlizH35Q1fEP/KoRR1DR4O65DLoqnRNGt1kIZ2y5N+v1MqszrbXfHfxYhp/JqHNog2+5JBDbME1+GWKaev9J2XrudXbC5COjVNqOgd4/ehTPrEG8S13O7HYhtPMvLCNxr57LNXkJAprVkIcX/GTIFPJyIiGwv65W1W3r74HR26zHq2S2+M9rK4d0zjL3Ydew3j2USd3AycQeLqY15u26LPK7br0dqMA1ca7c/aplnYBpDNlufELNErpZdVJ3EmJDhosY4EqmpdGzV3rL044rfEf6wtGJpRUVFRDsn6g1YjuzjiDmDkGTT6gKM69JFjbNV5ObRoVXL+B7hYhFGtOyXaQCvLRL1aZSD5FF0PAXj+aIkqBS5L+hQpY1+OErayEu6FxKcDCSH0vEcjCeKkqDwYU4xHcal7YgkyUGCsyuSbLfmw0T1pShrv0MYUxtAkowcbAVJdnVvxpg/WhyI62jzkXTmIdqBIYm8ciTi0gaRdIb+yOkYuta6+pH7IOlMPFpXN1Dk3Doy4j9o3V1SjhTp0nZFkgRzHGij60fORDL6vrWCOslHLBPX0SYhSQ5AwsYmNByNWCYurbEB2f4iBPiR2SzTfErRy6uBEdXV1XT2u5IO49MuQ9acwXBSkDyZjs1pwExREswUuZ/pUKV9T4QKrTlRmoWYY348nkDH5htotSgJ5opcrKN9X4QK7RBk1yPm9EOSvfjM5zOxrN8l4YRX0bFK+5EIFdpsZIn1q3s6cuzyxsICIeWixjAfqS/Qsaz9BuHft/NQoTW+RHoVvUlBFywT1SWzKDJLZmeak2lOrybTQNZ+hZCQX75eu3atSjsKaVIzkFvosfyEzMs8xEoM5bVjO7f2d+o/yXwX8ptK1i5BCFTa9MgHEdk2b3bZ1HJTSsgg3uDHsdupz6BlWXsjQqDSGqchb6MGRz8ZsY1nWFXWhr5FLFBqU/DRaeMwNLQ0T7/EFr64YtPe8A8SHKXWyHL8oLM8lrJXIxXF1p68aNOGFiHBUWuNLKz5WakrRJHR1pw+WliG6bZdG3rjL6QoMbRG8vHSx+aOcmkVKyidiarIjM5BG7r2wz+QDPuKgPOKZ17xq+aXTW3lKIels56PrMDnUm1lsWUVPg27LbocTs6Y6267c9Fb9I+LBaLU7JwDA13Vi7qpnQPB/DzVqjSWTCT0rUuBZm1obGK0CxKjDSdEe01itOGEaMclRDs6nBAt+8/MptcuSIh2IbM2tfZsLm1q7Y2wNql2PJyUptKOvv5dGDnatfBINGs9BR6JZq2XpMEjoVvbBx4J3VpoZP6f2iA0Mpq1sNjQqx0Miw2tWj8kdnRqk+FwQKM2CQon9GlTYXBEm7YDBM5o0rYoxv4VaNG2HYm9K/Fam5LV6xTsWk04/C+LOCax9YczEgAAAABJRU5ErkJggg==' width='32' height='32'/> {i18n.get_string('pluginname')}</h1>
                    <p>{i18n.get_string('dashboarddesc')}</p>
                    <Nav variant="pills" activeKey={this.state.selectedView} onSelect={this.onSelect}>
                        <Nav.Item>
                            <Nav.Link href="#" eventKey={0}><FontAwesomeIcon icon={faChartLine}/> {i18n.get_string('dashboard')}</Nav.Link>
                        </Nav.Item>
                        <NavDropdown variant="outline-primary" title={<span><FontAwesomeIcon icon={faFileAlt}/> {this.state.options.report.name.length === 0 ? i18n.get_string('report') : this.state.options.report.name}</span>} id="btnReports" >
                            {this.state.reportList.map((item, index) => {
                                return <NavDropdown.Item eventKey={item.value} key={index}>{item.text}</NavDropdown.Item>;
                            })}
                        </NavDropdown>
                    </Nav>  
                    <br/>    <br/>    
                    {this.getFilterOptions()}              
                </Jumbotron>

                {this.getView()}
            </div>

        return main;
    }

    onSelect(eventKey){
        let options = JsNx.clone(this.state.options);
        
        eventKey = parseInt(eventKey, 10);
        if(eventKey >= 1){
            let item = JsNx.getItem(this.state.reportList, 'value', eventKey);
            options.report.name = item.text;
            options.report.id = parseInt(item.value, 10);
            options.report.validation = item.validation;
            options.report.require = item.require;
            options.section.id = 0;
            options.section.name = '';
            options.cm.id = 0;
            options.cm.name = '';
        }
        else{
            options.report.name = "";
            options.report.id = 0;
            options.report.validation = null;
            options.report.require = {course: true, group: true, student: false, section: false, cm: false};
        }
        
        this.setState({selectedView: eventKey, options: options, show: false});
    }

    getView(){
        if(!this.state.show){ return null;}

        switch(this.state.selectedView.toString()){
            case '0': return <DashboardView options={this.state.options}/>;
            case '1': 
            case '2':
            case '3':
            case '4':
                return <ReportsView options={this.state.options}/>;
            default: return null;
        }
    }

    getFilterOptions(){
        switch(this.state.selectedView.toString()){
            case '0': return <FilterOptions onChange={this.onChangeFilterOptions} options={this.state.options} onGo={this.onGo} />;
            case '1': 
            case '2': 
            case '3':
            case '4':
                return <FilterOptions onChange={this.onChangeFilterOptions} options={this.state.options} onGo={this.onGo}/>;
            default: return null;
        }
    }

    onChangeFilterOptions(event){
        let options = JsNx.clone(this.state.options);
        let attr = event.target.name.split(".");
        options[attr[0]].id = parseInt(event.target.value, 10);
        options[attr[0]].name = event.target.text;

        // reset dependences
        switch(attr[0]){
            case "course":
                options.group.id = 0;
                options.group.name = "";
                options.student.id = 0;
                options.student.name = "";
                options.section.id = 0;
                options.section.name = "";
                options.cm.id = 0;
                options.cm.name = "";
                break;
            case "group":
                options.student.id = 0;
                options.student.name = "";
                break;
            case "section":
                options.cm.id = 0;
                options.cm.name = "";
                break;
        }

        this.setState({options: options});
    }

    onGo(){
        if (this.state.show){//Force a refresh
            this.setState({show: false}, () => this.setState({show: true}));
            return;
        }
        this.setState({show: true});
    }
}

class DashboardView extends Component{
    static defaultProps = { 
        options: null
    };

    constructor(props){
        super(props);
        this.state = {options: null};
    } 

    render() {
        if (!this.state.options) return null;

        // <NavDropdown.Item onClick={(e) => this.onHide('showgroupsoverviewwidget', 1)}>{i18n.get_string('overviewofmygroups')}</NavDropdown.Item>

        let main =
            <div>
                <Header options={this.props.options} title={i18n.get_string('dashboard')}/>
                <div style={{display: 'flex', justifyContent: 'right'}}>
                    <NavDropdown variant="outline-primary" style={{textAlign:'right'}} title={i18n.get_string('gadget')}>
                        <NavDropdown.Item onClick={(e) => this.onHide('showworkfollowupwidget', 1)}>{i18n.get_string('worktracking')}</NavDropdown.Item>
                        <NavDropdown.Item onClick={(e) => this.onHide('showstudentfollowupwidget', 1)}>{i18n.get_string('studenttracking')}</NavDropdown.Item>
                        
                    </NavDropdown>
                </div>
                <br/>
                <GadgetWorkFollowup options={this.props.options} onClose={() => this.onHide("showworkfollowupwidget", 0)} show={this.state.options.showworkfollowupwidget == 1}/> 
                <br/>
                <GadgetStudentFollowup options={this.props.options} onClose={() => this.onHide("showstudentfollowupwidget", 0)} show={this.state.options.showstudentfollowupwidget == 1}/> 
                <br/>
            </div>
            //<GadgetGroupsOverview options={this.props.options} onClose={() => this.onHide("showgroupsoverviewwidget", 0)} show={this.state.options.showgroupsoverviewwidget == 1}/> 
        return (main);
    }

    componentDidMount(){ 
        OptionManager.loadOptions((options) => {
            this.setState({options: options});
        });
    }

    onHide(key, toggle){
        OptionManager.setValue(key, toggle);
        let options = this.state.options;
        options[key] = toggle;
        this.setState({options: options});
    }
}

class ReportsView extends Component{
    static defaultProps = { 
        options: null
    };

    render() {
        if(!this.props.options.report.validation(this.props.options)){ return null;}

        let main =
            <div>
                <Header options={this.props.options} title={this.props.options.report.name}/>
                <br/>
                {this.getReport()}                
            </div>

        return (main);
    }

    getReport(){
        if(this.props.options === null){ return null;}

        switch(this.props.options.report.id.toString()){
            case '1':
                return <ReportDiagnosticTags options={this.props.options}/>;
            case '2':
                return <ReportSectionResults options={this.props.options}/>;
            case '3':
                return <ReportActivityCompletion options={this.props.options}/>;
            case '4':
                return <ReportQuiz options={this.props.options}/>;
            default:
                return null;
        }
    }
}

class FilterOptions extends Component{
    static defaultProps = { 
        onChange: null,
        options: null,
        onGo: null
    };

    constructor(props){
        super(props);

        this.getDataResult = this.getDataResult.bind(this);
        this.onAfterDataResult = this.onAfterDataResult.bind(this);
        this.getEnrolledUserListResult = this.getEnrolledUserListResult.bind(this);
        this.onDataChange = this.onDataChange.bind(this);
        this.disableBtnGo = this.disableBtnGo.bind(this);

        this.state = {
            collapse: true,
            dataProvider: [],
            courseList: [],
            sectionList: [],
            activityList: [],           
            groupList: [],
            studentList: [],
            loaded: false
        };
    }

    componentDidMount(){
        this.getData();
    }

    getData(){
        $glVars.webApi.getCourseList(1, this.getDataResult);        
    }

    getDataResult(result){         
        if(result.success){
            let courseList = [];
            for(let item of result.data){
                if(JsNx.getItem(courseList, 'value', parseInt(item.courseId), null) === null){
                    courseList.push({text: item.courseName, value: parseInt(item.courseId), data: item});
                }
            }
            this.setState({dataProvider: result.data, courseList: courseList, sectionList: [], activityList: [], loaded: true}, this.onAfterDataResult);
        }
        else{
            $glVars.feedback.showError(i18n.get_string('pluginname'), result.msg);
            this.setState({dataProvider: [], sectionProvider: [], courseList: [], sectionList: [], activityList: []}, this.onAfterDataResult);
        }
    }

    onAfterDataResult(){
        
        if(parseInt(this.props.options.course.id, 10) > 0){
            let item = JsNx.getItem(this.state.courseList, 'value', parseInt(this.props.options.course.id), null);

            if(item){
                this.onDataChange({target: Object.assign({name: 'course.id'}, item)});
            }
        }
    }
    
    render(){
        if (!this.state.loaded) return null;

        let options = this.props.options;

        let studentList = this.state.studentList;

        if(options.group.id > 0){
            studentList = studentList.filter( item => item.data?.groupId.toString() === options.group.id.toString() || item.value === 0); //If value is 0, it's the all option
        }

        let main = 
                <div className='filter-options'>
                    <h6>{i18n.get_string('filteroptions')} <Button variant="link" size="sm" onClick={() => {this.setState({collapse: !this.state.collapse})}}>{this.state.collapse ? <FontAwesomeIcon icon={faMinus}/> : <FontAwesomeIcon icon={faPlus}/>}</Button></h6>
                    <Collapse in={this.state.collapse}>
                        <div>
                            <div className='filter-container'>
                                <div className='filter-item'>
                                    <strong>{i18n.get_string('course')}</strong>
                                    <ComboBoxPlus disabled={!options.report.require.course} placeholder={i18n.get_string('selectyouroption')} options={this.state.courseList} onChange={this.onDataChange} name="course.id" value={options.course.id}/>
                                </div>
                                <div className='filter-item'>
                                    <div>
                                        <strong>{i18n.get_string('groups')}</strong>
                                        <ComboBoxPlus disabled={!options.report.require.group} placeholder={i18n.get_string('all')} options={this.state.groupList} onChange={this.onDataChange} name="group.id" value={options.group.id}/>
                                    </div>  
                                    <br/>
                                    <div>
                                        <strong>{i18n.get_string('students')}</strong>
                                        <ComboBoxPlus disabled={!options.report.require.student} placeholder={i18n.get_string('all')} options={studentList} onChange={this.onDataChange} name="student.id" value={options.student.id}/>
                                    </div>  
                                </div>
                                <div className='filter-item'>
                                    <div>
                                        <strong>{i18n.get_string('sections')}</strong>
                                        <ComboBoxPlus disabled={!options.report.require.section} placeholder={i18n.get_string('all')} options={this.state.sectionList} onChange={this.onDataChange} name="section.id" value={options.section.id}/>
                                    </div>
                                    <br/>
                                    <div>
                                        <strong>{i18n.get_string('activities')}</strong>
                                        <ComboBoxPlus disabled={!options.report.require.cm} placeholder={i18n.get_string('all')} options={this.state.activityList} onChange={this.onDataChange} name="cm.id" value={options.cm.id}/>
                                    </div>  
                                </div>

                                <div className='filter-item'>
                                    <Button variant='primary' onClick={this.props.onGo} disabled={this.disableBtnGo()}>
                                        <FontAwesomeIcon icon={faSearchPlus}/>  {i18n.get_string('go')}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </Collapse>                        
                </div>;
            

        return main;
    }

    disableBtnGo(){
        // mode report on
        if(this.props.options.report.id > 0){
            
            if(this.props.options.report.validation === null){ 
                return true;
            }

            return !this.props.options.report.validation(this.props.options);
        }
        else{
            return !(this.props.options.course.id > 0);
        }
    }

    onDataChange(event){
        let sectionList = this.state.sectionList;
        let activityList = this.state.activityList;

        event.target.value = (event.target.value === '' ? 0 : event.target.value);

        if(event.target.name === "course.id"){
            sectionList = [];
            activityList = [];

            $glVars.webApi.getSectionActivityList(event.target.value, (data) => this.getSectionActivityListResult(data));
            
            if(parseInt(event.target.value,10) > 0){
                $glVars.webApi.getEnrolledUserList(0, 0, event.target.value, this.getEnrolledUserListResult); 
            }
        }
        
        if(event.target.name === "section.id"){
            activityList = [];
            activityList.push({text: i18n.get_string('all'), value: 0});

            for(let item of this.state.sectionProvider){
                if((item.sectionId.toString() === event.target.value.toString()) && (JsNx.getItem(activityList, 'value', item.cmId, null) === null)){
                    activityList.push({text: item.cmName, value: item.cmId});
                }
            }
        }

        this.setState({sectionList: sectionList, activityList: activityList}, () => this.props.onChange(event));
    }

    getSectionActivityListResult(result){
        if (result.success){
            let sectionList = [];

            sectionList.push({text: i18n.get_string('all'), value: 0});
            for(let item of result.data){
                if(JsNx.getItem(sectionList, 'value', item.sectionId, null) === null){
                    sectionList.push({text: item.sectionName, value: item.sectionId});
                }
            }

            this.setState({sectionList: sectionList, sectionProvider: result.data});
        }
    }
    
    getEnrolledUserListResult(result){
        if(result.success){
            let groupList = [];
            let studentList = [];
            groupList.push({text: i18n.get_string('all'), value: 0});
            studentList.push({text: i18n.get_string('all'), value: 0});

            for(let group of result.data){
                let item = JsNx.at(group, 0, null);
                if(item){
                    if(item.groupId > 0){
                        groupList.push({text: item.groupName, value: item.groupId, data: item});
                    }
                }

                for(let user of group){
                    if(JsNx.getItem(studentList, 'value', user.userId, null) === null){
                        studentList.push({text: user.userName, value: user.userId, data: user});
                    }
                }
            }
            this.setState({groupList: groupList, studentList: studentList});
        }
        else{
            $glVars.feedback.showError(i18n.get_string('pluginname'), result.msg);
            this.setState({groupList: [], studentList: []});
        }
    }
}

class Header extends Component{
    static defaultProps = { 
        title: "",
        options: null
    };

    render(){
        let main = null;

        if(this.props.options !== null){
            let subtitle1 = [this.props.options.course.name, this.props.options.section.name, this.props.options.cm.name].filter(item => item.length > 0);
            let subtitle3 = [this.props.options.group.name, this.props.options.student.name].filter(item => item.length > 0);
            
            main = 
            <div style={{textAlign: "left"}}>
                <h2 style={{borderBottom: "1px solid #efefef"}}>{this.props.title}</h2>
                <div style={{display: "flex", justifyContent: "space-between"}}>
                    <h6>{subtitle1.join(" - ")}</h6>
                    <h6>{subtitle3.join(" - ")}</h6>
                </div>
            </div>
        }

        return main;
    }
}