import React, { Component } from 'react';
import {Card, ButtonGroup, Button, Badge, OverlayTrigger, Tooltip, DropdownButton, Dropdown, ButtonToolbar, ProgressBar} from 'react-bootstrap';
import {faSync} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {DataGrid} from '../../libs/components/Components';
import {$glVars} from '../../common/common';

export class ReportCourseProgressOverview extends Component{
    static defaultProps = {        
        options: null
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
        if(JSON.stringify(this.props.options) !== JSON.stringify(prevProps.options)){
            this.getData();
        }
    }

    getData(){
        $glVars.webApi.getCourseProgressionOverview(this.props.options.courseId, this.props.options.groupId, this.getDataResult);        
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
        let main = 
                <div >
                    <DataGrid orderBy={true}>
                        <DataGrid.Header>
                            <DataGrid.Header.Row>
                                <DataGrid.Header.Cell style={{width: 70}}>{"#"}</DataGrid.Header.Cell>
                                <DataGrid.Header.Cell >{"Élève"}</DataGrid.Header.Cell>
                                <DataGrid.Header.Cell style={{width: 270}}>{"Progression"}</DataGrid.Header.Cell>
                                <DataGrid.Header.Cell style={{width: 180}}>{"Mise à jour"}</DataGrid.Header.Cell>
                            </DataGrid.Header.Row>
                        </DataGrid.Header>
                        <DataGrid.Body>
                            {this.state.dataProvider.map((item, index) => {
                                    let row = 
                                        <DataGrid.Body.Row key={index} onDbClick={() => this.props.onSelectUser({id: item.userId, name: item.studentName})}>
                                            <DataGrid.Body.Cell>{index + 1}</DataGrid.Body.Cell>
                                            <DataGrid.Body.Cell sortValue={item.studentName}>{item.studentName}</DataGrid.Body.Cell>
                                            <DataGrid.Body.Cell sortValue={item.pctWork.toString()} style={{textAlign: "center"}}>
                                                <OverlayTrigger placement="right" delay={{ show: 250, hide: 400 }}
                                                    overlay={<Tooltip>{`Temps: ${item.pctTime}%  | Travail: ${item.pctWork}%`}</Tooltip>}>
                                                    <ProgressBar striped min={0} max={100} variant={this.getProgressColor(item)} now={item.pctWork} label={`${item.pctWork.toFixed(0)}%`}/>
                                                </OverlayTrigger>
                                            </DataGrid.Body.Cell>                                            
                                            <DataGrid.Body.Cell>{item.lastUpdate}</DataGrid.Body.Cell>
                                        </DataGrid.Body.Row>
                                    return (row);                                    
                                }
                            )}
                        </DataGrid.Body>
                    </DataGrid>                           
                </div>;

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