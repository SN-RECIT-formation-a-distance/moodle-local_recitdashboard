import React, { Component } from 'react';
import {Card, ButtonGroup, Button, Badge, OverlayTrigger, Tooltip, DropdownButton, Dropdown, ButtonToolbar, ProgressBar} from 'react-bootstrap';
import {faSync, faCheck} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {DataGrid} from '../libs/components/Components';
import {UtilsMoodle, JsNx} from '../libs/utils/Utils';
import {$glVars} from '../common/common';

export class GadgetCourseProgressOverview extends Component{
    static defaultProps = {        
        courseId: 0,
        groupId: 0,
        onSelectUser: null
    };

    constructor(props) {
        super(props);

        this.getData = this.getData.bind(this);
        this.getDataResult = this.getDataResult.bind(this);

        this.state = {dataProvider: []};
    }

    componentDidMount(){
        this.getData();
    }

    componentDidUpdate(prevProps){
       // Typical usage (don't forget to compare props):
        if((this.props.courseId !== prevProps.courseId) || (this.props.groupId !== prevProps.groupId)){
            this.getData();
        }
    }

    getData(){
        $glVars.webApi.getCourseProgressionOverview(this.props.courseId, this.props.groupId, this.getDataResult);        
    }

    getDataResult(result){         
        if(result.success){
            this.setState({dataProvider: result.data});
        }
        else{
            $glVars.feedback.showError($glVars.i18n.tags.appname, result.msg);
        }
    }

    render() {    
        let bodyContent = {maxHeight: 400, overflowY: "auto"};
        
        let main = 
            <Card className='gadget'>
                <Card.Body>
                    <Card.Title>
                        <span>{"Aperçu de la progression"}</span>
                        <ButtonToolbar aria-label="Toolbar with Buttons">
                            <ButtonGroup className="mr-2">
                                <Button  variant="outline-secondary" size="sm" onClick={this.getData}><FontAwesomeIcon icon={faSync}/></Button>
                            </ButtonGroup>
                        </ButtonToolbar>                        
                    </Card.Title>

                    <div style={bodyContent}>
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
                                {this.state.dataProvider.map((item, index) => {
                                        let row = 
                                            <DataGrid.Body.Row key={index} onDbClick={() => this.props.onSelectUser({id: item.userId, name: item.studentName})}>
                                                <DataGrid.Body.Cell>{index + 1}</DataGrid.Body.Cell>
                                                <DataGrid.Body.Cell sortValue={item.studentName}><Button variant='link' onClick={() => this.props.onSelectUser({id: item.userId, name: item.studentName})}>{item.studentName}</Button></DataGrid.Body.Cell>
                                                <DataGrid.Body.Cell sortValue={item.pctWork.toString()} style={{textAlign: "center"}}>
                                                <OverlayTrigger placement="right" delay={{ show: 250, hide: 400 }}
                                                    overlay={<Tooltip>{`Temps: ${item.pctTime}%  | Travail: ${item.pctWork}%`}</Tooltip>}>
                                                    <ProgressBar striped min={0} max={100} variant={this.getProgressColor(item)} now={item.pctWork} label={`${item.pctWork}%`}/>
                                                </OverlayTrigger>
                                                </DataGrid.Body.Cell>                                            
                                                <DataGrid.Body.Cell>{item.lastUpdate}</DataGrid.Body.Cell>
                                            </DataGrid.Body.Row>
                                        return (row);                                    
                                    }
                                )}
                            </DataGrid.Body>
                        </DataGrid>                           
                    </div>
                </Card.Body>
            </Card>;

        main = (this.state.selectedStudentId > 0 ? <GadgetCourseProgressDetailled courseId={this.props.courseId} studentId={this.state.selectedStudentId} onUnselectUser={this.onUnselectUser}/> : main);

        return (main);
    }

    getProgressColor(item){
        let threshold = 0.05;

        if(item.pctTime < item.pctWork){
            return "success";
        }
        else if(item.pctTime < item.pctWork + (item.pctWork * threshold)){
            return "warning";
        }
        else{
            return "danger";
        }
    }
}

export class GadgetCourseProgressDetailled extends Component{
    static defaultProps = {        
        courseId: 0,
        userId: 0
    };

    constructor(props) {
        super(props);

        this.getData = this.getData.bind(this);
        this.onSelectSection = this.onSelectSection.bind(this);

        this.state = {dataProvider: [], sectionList: [], selectedSectionIndex: -1};
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
        let that = this;
        let callback = function(result){
            if(result.success){
                let sectionList = [];
                for(let item of result.data){
                    if(JsNx.getItem(sectionList, 'value', item.sectionId, null) === null){
                        sectionList.push({value: item.sectionId, text: item.sectionName});
                    }
                }

                that.setState({dataProvider: result.data, sectionList: sectionList});
            }
            else{
                $glVars.feedback.showError($glVars.i18n.tags.appname, result.msg);
            }
        }
        $glVars.webApi.getCourseProgressionDetails(this.props.courseId, this.props.userId, callback);     
    }

    render() {    
        let bodyContent = {maxHeight: 400, overflowY: "auto"};
        
        //let studentName = (this.state.dataProvider.length > 0 ? this.state.dataProvider[0].studentName : "");

        //<Card.Header>{cardTitle}</Card.Header>
        let main = 
            <Card className='gadget'>
                <Card.Body>
                    <Card.Title>
                        <span>{`Détails de la progression`}</span>
                        <ButtonToolbar aria-label="Toolbar with Buttons">
                            <ButtonGroup className="mr-2">
                                <DropdownButton as={ButtonGroup} title={(this.state.selectedSectionIndex >= 0 ? this.state.sectionList[this.state.selectedSectionIndex].text : "Filtrez par section")} 
                                                size="sm" variant="outline-secondary" onSelect={this.onSelectSection}>
                                    <Dropdown.Item key={-1} eventKey={-1}>{"Toutes"}</Dropdown.Item>
                                    <Dropdown.Divider />
                                    {this.state.sectionList.map((item, index) => {
                                        return <Dropdown.Item key={index} eventKey={index} dangerouslySetInnerHTML={{__html:item.text}}></Dropdown.Item>
                                    })}
                                </DropdownButton>
                                <Button  variant="outline-secondary" size="sm" onClick={this.getData}><FontAwesomeIcon icon={faSync}/></Button>
                            </ButtonGroup>
                        </ButtonToolbar>                        
                    </Card.Title>

                    <div style={bodyContent}>
                        <DataGrid orderBy={true}>
                            <DataGrid.Header>
                                <DataGrid.Header.Row>
                                    <DataGrid.Header.Cell style={{width: 70}}>{"#"}</DataGrid.Header.Cell>
                                    <DataGrid.Header.Cell >{"Activité"}</DataGrid.Header.Cell>
                                    <DataGrid.Header.Cell style={{width: 130}}>{"Module Terminé"}</DataGrid.Header.Cell>
                                    <DataGrid.Header.Cell style={{width: 130}}>{"Grade"}</DataGrid.Header.Cell>
                                    <DataGrid.Header.Cell style={{width: 300}}>{"Date d'échéance"}</DataGrid.Header.Cell>
                                    <DataGrid.Header.Cell style={{width: 200}}>{"Dernière mise à jour"}</DataGrid.Header.Cell>
                                    <DataGrid.Header.Cell>{"Description"}</DataGrid.Header.Cell>
                                </DataGrid.Header.Row>
                            </DataGrid.Header>
                            <DataGrid.Body>
                                {this.state.dataProvider.map((item, index) => {
                                        if(this.state.selectedSectionIndex >= 0){
                                            if(item.sectionId !== this.state.sectionList[this.state.selectedSectionIndex].value){
                                                return null;
                                            }
                                        }
                                        let row = 
                                            <DataGrid.Body.Row key={index} >
                                                <DataGrid.Body.Cell>{index + 1}</DataGrid.Body.Cell>
                                                <DataGrid.Body.Cell sortValue={item.activity.name}>
                                                    <img className="activityicon" alt="activity icon" role="presentation" aria-hidden="true" src={UtilsMoodle.getActivityIconUrl(item.module)}/>
                                                    {` ${item.activity.name}`}
                                                </DataGrid.Body.Cell>
                                                <DataGrid.Body.Cell style={{textAlign: "center"}}>
                                                    {item.completionState === 1 ? <FontAwesomeIcon icon={faCheck}/> : null }
                                                    </DataGrid.Body.Cell>    
                                                <DataGrid.Body.Cell style={{textAlign: "center"}}>{this.getGradeDesc(item)}</DataGrid.Body.Cell>
                                                <DataGrid.Body.Cell sortValue={item.completionExpected}>
                                                    {item.completionExpected}{" "}<span style={{fontSize: ".7rem"}}>{this.getDeadlineInDays(item)}</span>
                                                </DataGrid.Body.Cell>
                                                <DataGrid.Body.Cell>{item.activity.timeModified}</DataGrid.Body.Cell>
                                                <DataGrid.Body.Cell>{this.getDesc(item)}</DataGrid.Body.Cell>
                                            </DataGrid.Body.Row>
                                        return (row);                                    
                                    }
                                )}
                            </DataGrid.Body>
                        </DataGrid>
                    </div>
                </Card.Body>
            </Card>;

        return (main);
    }

    getDesc(item){
        let result = "";
       
        if(item.activity.completed === 0){
            result = "La leçon a été commencée, mais n'est pas terminée.";
        }
        else if(item.activity.completed === 1){
            result = 'Terminé';
        }
        else if(item.activity.nbViews > 0){
            result = `${item.activity.nbViews} vues`;
        }

        return result;
    }

    getGradeDesc(item){
        if(item.activity.studentGrade < 0){ return "";}

        return `${item.activity.studentGrade.toFixed(2)} / ${item.activity.maxGrade.toFixed(2)}`;
    }    

   /* getDeadline(item){
        if(item.completionState === 1){
            return "success";
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
    }*/

    onSelectSection(index){
        this.setState({selectedSectionIndex: index});
    }

    getDeadlineInDays(item){
        if(item.completionState === 1){ return "";}
        return (item.daysDeadline < 0 ? `(${Math.abs(item.daysDeadline)} jours en retard)` : "");
    }
}