import React, { Component } from 'react';
import {Card, ButtonGroup, Button, Badge, OverlayTrigger, Tooltip, DropdownButton, Dropdown, ButtonToolbar, ProgressBar} from 'react-bootstrap';
import {faSync, faArrowLeft} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {DataGrid} from '../libs/components/Components';
import {UtilsMoodle, JsNx} from '../libs/utils/Utils';
import {$glVars} from '../common/common';

export class GadgetCourseProgressOverview extends Component{
    static defaultProps = {        
        courseId: 0
    };

    constructor(props) {
        super(props);

        this.getData = this.getData.bind(this);
        this.getDataResult = this.getDataResult.bind(this);
        this.onSelectGroup = this.onSelectGroup.bind(this);

        this.state = {dataProvider: [], groupList: [], selectedGroupIndex: -1};
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
            let dataProvider = result.data;
            let groupList = [];

            for(let item of dataProvider){
                let tmp = item.groups.split(",");
                for(let item2 of tmp){
                    JsNx.singlePush(groupList, item2);
                }
            }

            this.setState({dataProvider: dataProvider, groupList: groupList, selectedGroupIndex: -1});
        }
        else{
            $glVars.feedback.showError($glVars.i18n.tags.appname, result.msg);
        }
    }

    render() {    
        let bodyContent = {maxHeight: 400, overflowY: "auto"};
        
        //<Card.Header>{cardTitle}</Card.Header>
        let main = 
            <Card style={{flexGrow: 1, margin: 5}}>
                <Card.Body>
                    <Card.Title style={{display: "flex", justifyContent: "space-between"}}>
                        <span>{"Aperçu de la progression"}</span>
                        <ButtonToolbar aria-label="Toolbar with Buttons">
                            <ButtonGroup className="mr-2">
                                <DropdownButton as={ButtonGroup} title={(this.state.selectedGroupIndex >= 0 ? this.state.groupList[this.state.selectedGroupIndex] : "Filtrez par groupe")} 
                                            size="sm" variant="outline-secondary" onSelect={this.onSelectGroup}>
                                    <Dropdown.Item key={-1} eventKey={-1}>{"Tous"}</Dropdown.Item>
                                    <Dropdown.Divider />
                                    {this.state.groupList.map((item, index) => {
                                        return <Dropdown.Item key={index} eventKey={index}>{item}</Dropdown.Item>
                                    })}
                                </DropdownButton>
                            </ButtonGroup>
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
                                        if(this.state.selectedGroupIndex >= 0){
                                            if(!item.groups.includes(this.state.groupList[this.state.selectedGroupIndex])){
                                                return null;
                                            }
                                        }
                                        let row = 
                                            <DataGrid.Body.Row key={index} onDbClick={() => this.onDetails(item.userId)}>
                                                <DataGrid.Body.Cell>{index + 1}</DataGrid.Body.Cell>
                                                <DataGrid.Body.Cell sortValue={item.studentName}>{item.studentName}</DataGrid.Body.Cell>
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

        return (main);
    }

    getProgressColor(item){
        let threshold = 0.02; // 2%

        if(item.pctTime < item.pctWork){
            return "success";
        }
        else if(item.pctTime + (item.pctTime* threshold) < item.pctWork){
            return "warning";
        }
        else{
            return "danger";
        }
    }

    onSelectGroup(index){
        this.setState({selectedGroupIndex: index});
    }
}

export class GadgetCourseProgressDetailled extends Component{
    static defaultProps = {        
        courseId: 0
    };

    constructor(props) {
        super(props);

        this.getData = this.getData.bind(this);
        this.getDataResult = this.getDataResult.bind(this);
        this.onSelectSection = this.onSelectSection.bind(this);
        this.onSelectUser = this.onSelectUser.bind(this);

        this.state = {dataProvider: [], sectionList: [], selectedSectionIndex: -1, userList: [], selectedUserIndex: -1};
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
            let userList = [];

            for(let item of result.data){
                userList.push({value: item.userId, text: item.studentName});
            }

            this.setState({dataProvider: [], sectionList: [], userList: userList, selectedSectionIndex: -1, selectedUserIndex: -1});
        }
        else{
            $glVars.feedback.showError($glVars.i18n.tags.appname, result.msg);
        }
    }

    render() {    
        let bodyContent = {maxHeight: 400, overflowY: "auto"};
        
        //<Card.Header>{cardTitle}</Card.Header>
        let main = 
            <Card style={{flexGrow: 1, margin: 5}}>
                <Card.Body>
                    <Card.Title style={{display: "flex", justifyContent: "space-between"}}>
                        <span>{"Détails de la progression"}</span>
                        <ButtonToolbar aria-label="Toolbar with Buttons">
                            <ButtonGroup className="mr-2">
                                <DropdownButton as={ButtonGroup} title={(this.state.selectedUserIndex >= 0 ? this.state.userList[this.state.selectedUserIndex].text : "Filtrez par élève")} 
                                                size="sm" variant="outline-secondary" onSelect={this.onSelectUser}>
                                    {this.state.userList.map((item, index) => {
                                        return <Dropdown.Item key={index} eventKey={index}>{item.text}</Dropdown.Item>
                                    })}
                                </DropdownButton>
                            </ButtonGroup>
                            <ButtonGroup className="mr-2">
                                <DropdownButton as={ButtonGroup} title={(this.state.selectedSectionIndex >= 0 ? this.state.sectionList[this.state.selectedSectionIndex].text : "Filtrez par section")} 
                                                size="sm" variant="outline-secondary" onSelect={this.onSelectSection}>
                                    <Dropdown.Item key={-1} eventKey={-1}>{"Toutes"}</Dropdown.Item>
                                    <Dropdown.Divider />
                                    {this.state.sectionList.map((item, index) => {
                                        return <Dropdown.Item key={index} eventKey={index} dangerouslySetInnerHTML={{__html:item.text}}></Dropdown.Item>
                                    })}
                                </DropdownButton>
                            </ButtonGroup>
                        </ButtonToolbar>                        
                    </Card.Title>

                    <div style={bodyContent}>
                        <DataGrid orderBy={true}>
                            <DataGrid.Header>
                                <DataGrid.Header.Row>
                                    <DataGrid.Header.Cell style={{width: 70}}>{"#"}</DataGrid.Header.Cell>
                                    <DataGrid.Header.Cell >{"Activité"}</DataGrid.Header.Cell>
                                    <DataGrid.Header.Cell style={{width: 110}}>{"Grade"}</DataGrid.Header.Cell>
                                    <DataGrid.Header.Cell style={{width: 300}}>{"Date d'échéance"}</DataGrid.Header.Cell>
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
                                            <DataGrid.Body.Row key={index} alert={this.getDeadline(item)} >
                                                <DataGrid.Body.Cell>{index + 1}</DataGrid.Body.Cell>
                                                <DataGrid.Body.Cell sortValue={item.activity.name}>
                                                    <img className="activityicon" alt="activity icon" role="presentation" aria-hidden="true" src={UtilsMoodle.getActivityIconUrl(item.module)}/>
                                                    {` ${item.activity.name}`}
                                                    </DataGrid.Body.Cell>
                                                <DataGrid.Body.Cell style={{textAlign: "center"}}>{item.activity.grade}</DataGrid.Body.Cell>
                                                <DataGrid.Body.Cell sortValue={item.completionExpected}>
                                                    {item.completionExpected}{" "}<span style={{fontSize: ".7rem"}}>{this.getDeadlineInDays(item)}</span>
                                                </DataGrid.Body.Cell>
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

    getDeadline(item){
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
    }

    onSelectSection(index){
        this.setState({selectedSectionIndex: index});
    }

    getDeadlineInDays(item){
        if(item.completionState === 1){ return "";}
        return (item.daysDeadline < 0 ? `(${Math.abs(item.daysDeadline)} jours en retard)` : "");
    }

    onSelectUser(iUser){
        let that = this;
        let callback = function(result){
            if(result.success){
                let sectionList = [];
                for(let item of result.data){
                    if(JsNx.getItem(sectionList, 'value', item.sectionId, null) === null){
                        sectionList.push({value: item.sectionId, text: item.sectionName});
                    }
                }

                that.setState({dataProvider: result.data, sectionList: sectionList, selectedSectionIndex: -1, selectedUserIndex: iUser});
            }
            else{
                $glVars.feedback.showError($glVars.i18n.tags.appname, result.msg);
            }
        }
        $glVars.webApi.getCourseProgressionDetails(this.props.courseId, this.state.userList[iUser].value, callback);      
    }
}