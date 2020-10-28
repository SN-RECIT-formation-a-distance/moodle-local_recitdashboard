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
            case '0': return <FilterOptions onChange={this.onChangeFilterOptions} courseId={this.props.courseId} courseOn={true}/>;
            case '1': return <FilterOptions onChange={this.onChangeFilterOptions} courseId={this.props.courseId} courseOn={true} sectionOn={true} activityOn={true} reportsOn={true} groupOn={true} studentOn={true}/>;
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
        courseOn: false,
        sectionOn: false,
        activityOn: false,
        groupOn: false,
        studentOn: false,
        reportsOn: false
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
            reportList: [
                {text: 'Test selon les tags de questions', value: '1', callbackValidation: function(options){
                        return (options.courseId > 0 && options.groupId > 0 && options.cmId > 0)
                    }
                },
                /*{text: 'Aperçu de la progression', value: '2', callbackValidation: function(options){
                    return (options.courseId > 0 && options.groupId > 0)
                }}*/
            ],
            groupList: [],
            studentList: [],
            options: {
                courseId: 0,
                courseName: "",
                sectionId: 0,
                sectionName: "",
                cmId: 0,
                cmName: "",
                reportId: '0',
                reportName: "",
                reportValidation: null,
                groupId: 0,
                groupName: "",
                studentId: 0,
                studentName: ""
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
        let main = 
                <div className='filter-options'>
                    <h6>Options de filtrage <Button variant="link" size="sm" onClick={() => {this.setState({collapse: !this.state.collapse})}}>{this.state.collapse ? <FontAwesomeIcon icon={faMinus}/> : <FontAwesomeIcon icon={faPlus}/>}</Button></h6>
                    <Collapse in={this.state.collapse}>
                        <div>
                            <div className='filter-container'>
                                {this.props.courseOn && 
                                    <div className='filter-item'>
                                        <strong>Cours</strong>
                                        <ComboBox placeholder={"Sélectionnez votre option"} options={this.state.courseList} onChange={this.onDataChange} name="courseId" value={this.state.options.courseId}/>
                                    </div>
                                }
                                {this.props.groupOn && 
                                    <div className='filter-item'>
                                         <div>
                                            <strong>Groupe</strong>
                                            <ComboBox placeholder={"Tous les groupes"} options={this.state.groupList} onChange={this.onDataChange} name="groupId" value={this.state.options.groupId}/>
                                        </div>  
                                        <br/>
                                        {this.props.studentOn && 
                                            <div>
                                                <strong>Élèves</strong>
                                                <ComboBox placeholder={"Tous les élèves"} options={this.state.studentList} onChange={this.onDataChange} name="studentId" value={this.state.options.studentId} disabled={true}/>
                                            </div>  
                                        }
                                    </div>
                                }
                                {this.props.sectionOn && 
                                    <div className='filter-item'>
                                        <div>
                                            <strong>Sections</strong>
                                            <ComboBox placeholder={"Toutes les sections"} options={this.state.sectionList} onChange={this.onDataChange} name="sectionId" value={this.state.options.sectionId}/>
                                        </div>
                                        <br/>
                                        {this.props.activityOn && 
                                            <div>
                                                <strong>Activités</strong>
                                                <ComboBox placeholder={"Toutes les activités"} options={this.state.activityList} onChange={this.onDataChange} name="cmId" value={this.state.options.cmId}/>
                                            </div>  
                                        }
                                    </div>
                                }                               
                                {this.props.reportsOn && 
                                    <div className='filter-item'>
                                        <strong>Rapports</strong>
                                        <ComboBox placeholder={"Sélectionnez votre option"} options={this.state.reportList} onChange={this.onDataChange} name="reportId" value={this.state.options.reportId}/>
                                    </div>
                                }
                                <div className='filter-item'>
                                    <Button variant='primary' onClick={() => this.props.onChange(JsNx.clone(this.state.options))} disabled={this.disableBtnGo()}>
                                        <FontAwesomeIcon icon={faThumbsUp}/>  Allez
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
        if(this.props.reportsOn){
            
            if(this.state.options.reportValidation === null){ 
                return true;
            }

            return !this.state.options.reportValidation(this.state.options);
        }
        else{
            return !(parseInt(this.state.options.courseId,10) > 0);
        }
    }

    onDataChange(event){
        let options = this.state.options;
        let sectionList = [];
        let activityList = [];

        options[event.target.name] = event.target.value;
        options.courseName = "";
        options.sectionName = "";
        options.cmName = "";
        options.reportName = "";
        options.reportValidation = null;

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
            options.reportValidation = reportItem.callbackValidation;
        }

        if((event.target.name === "courseId") && (parseInt(options.courseId,10) > 0)){
            options.sectionId = 0;
            options.cmId = 0;
            options.groupId = 0;
            options.studentId = 0;
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