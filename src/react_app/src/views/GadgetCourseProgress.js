import React, { Component } from 'react';
import {Card, ButtonGroup, Button, Badge, OverlayTrigger, Tooltip, DropdownButton, Dropdown, ButtonToolbar} from 'react-bootstrap';
import {faSync, faArrowLeft} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {DataGrid} from '../libs/components/Components';
import {UtilsMoodle, JsNx} from '../libs/utils/Utils';
import {$glVars} from '../common/common';

export class GadgetCourseProgress extends Component{
    static defaultProps = {        
        courseId: 0
    };

    constructor(props) {
        super(props);

        this.getData = this.getData.bind(this);
        this.getDataResult = this.getDataResult.bind(this);
        this.onBack = this.onBack.bind(this);
        this.onDetails = this.onDetails.bind(this);
        this.onSelectSection = this.onSelectSection.bind(this);
        this.onSelectGroup = this.onSelectGroup.bind(this);

        this.state = {userId: 0, overview: [], details: [], sectionList: [], selectedSectionIndex: -1, groupList: [], selectedGroupIndex: -1};
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
            let overview = result.data;
            let groupList = [];

            for(let item of overview){
                let tmp = item.groups.split(",");
                for(let item2 of tmp){
                    JsNx.singlePush(groupList, item2);
                }
            }

            this.setState({userId: 0, overview: overview, sectionList: [], selectedSectionIndex: -1, groupList: groupList, selectedGroupIndex: -1});
        }
        else{
            $glVars.feedback.showError($glVars.i18n.tags.appname, result.msg);
        }
    }

    render() {    
        let bodyContent = {maxHeight: 400, overflowY: "auto"};
        
        //<Card.Header>{cardTitle}</Card.Header>
        let main = 
            <Card>
                <Card.Body>
                    <Card.Title style={{display: "flex", justifyContent: "space-between"}}>
                        <span>{"Aperçu de la progression"}</span>
                        {this.state.userId > 0 && <Badge variant="info">{`Élève: ${JsNx.get(JsNx.at(this.state.details, 0, null), "studentName", "")}`}</Badge>}
                        <ButtonToolbar aria-label="Toolbar with Buttons">
                            {this.state.userId > 0 &&
                                <ButtonGroup className="mr-2">
                                    <Button variant="outline-secondary" size="sm" onClick={this.onBack}><FontAwesomeIcon icon={faArrowLeft}/></Button>                                    
                                </ButtonGroup>
                            }

                            {this.state.userId > 0 &&
                                <ButtonGroup className="mr-2">
                                    <DropdownButton as={ButtonGroup} title={(this.state.selectedSectionIndex >= 0 ? this.state.sectionList[this.state.selectedSectionIndex].text : "Filtrez par section")} 
                                                   size="sm" variant="outline-secondary" onSelect={this.onSelectSection}>
                                        <Dropdown.Item key={-1} eventKey={-1}>{"Toutes"}</Dropdown.Item>
                                        <Dropdown.Divider />
                                        {this.state.sectionList.map((item, index) => {
                                            return <Dropdown.Item key={index} eventKey={index}>{item.text}</Dropdown.Item>
                                        })}
                                    </DropdownButton>
                                </ButtonGroup>
                            }   
                                
                            {this.state.userId === 0 &&
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
                            }

                            {this.state.userId === 0 &&
                                <ButtonGroup className="mr-2">
                                    <Button  variant="outline-secondary" size="sm" onClick={this.getData}><FontAwesomeIcon icon={faSync}/></Button>
                                </ButtonGroup>
                            }
                            
                        </ButtonToolbar>                        
                    </Card.Title>

                    <div style={bodyContent}>
                        {this.state.userId === 0 ?
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
                                    {this.state.overview.map((item, index) => {
                                      //<ProgressBar striped min={0} max={100} variant="primary" now={item.pctWork} label={`${item.pctWork}%`}/>
                                            if(this.state.selectedGroupIndex >= 0){
                                                if(!item.groups.includes(this.state.groupList[this.state.selectedGroupIndex])){
                                                    return null;
                                                }
                                            }
                                            let row = 
                                                <DataGrid.Body.Row key={index} onDbClick={() => this.onDetails(item.userId)}>
                                                    <DataGrid.Body.Cell>{index + 1}</DataGrid.Body.Cell>
                                                    <DataGrid.Body.Cell sortValue={item.studentName}><a href="#" onClick={() => this.onDetails(item.userId)}>{item.studentName}</a></DataGrid.Body.Cell>
                                                    <DataGrid.Body.Cell sortValue={item.pctWork.toString()} style={{textAlign: "center"}}>
                                                    <OverlayTrigger placement="right" delay={{ show: 250, hide: 400 }}
                                                        overlay={<Tooltip>{`Temps: ${item.pctTime}%  | Travail: ${item.pctWork}%`}</Tooltip>}>
                                                        <Button variant={this.getProgressColor(item)} size="sm">
                                                            <Badge variant="light">{`${item.pctWork}%`}</Badge>
                                                        </Button>
                                                    </OverlayTrigger>
                                                    </DataGrid.Body.Cell>                                            
                                                    <DataGrid.Body.Cell>{item.lastUpdate}</DataGrid.Body.Cell>
                                                </DataGrid.Body.Row>
                                            return (row);                                    
                                        }
                                    )}
                                </DataGrid.Body>
                            </DataGrid>
                            :
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
                                    {this.state.details.map((item, index) => {
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
                        }
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

    onSelectSection(index){
        this.setState({selectedSectionIndex: index});
    }

    onSelectGroup(index){
        this.setState({selectedGroupIndex: index});
    }

    getDeadlineInDays(item){
        if(item.completionState === 1){ return "";}
        return (item.daysDeadline < 0 ? `(${Math.abs(item.daysDeadline)} jours en retard)` : "");
    }

    onDetails(userId){
        let that = this;
        let callback = function(result){
            if(result.success){
                let details = result.data;
                let sectionList = [];
                for(let item of details){
                    if(JsNx.getItem(sectionList, 'value', item.sectionId, null) === null){
                        sectionList.push({value: item.sectionId, text: item.sectionName});
                    }
                }

                that.setState({userId: parseInt(userId, 10), details: result.data, sectionList: sectionList, selectedSectionIndex: -1});
            }
            else{
                $glVars.feedback.showError($glVars.i18n.tags.appname, result.msg);
            }
        }
        $glVars.webApi.getCourseProgressionDetails(this.props.courseId, userId, callback);      
    }

    onBack(){
        this.setState({userId: 0});
    }
}