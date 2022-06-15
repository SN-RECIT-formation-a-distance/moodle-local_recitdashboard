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
// along with Moodle. If not, see <http://www.gnu.org/licenses/>.

/**
 * RÉCIT Dashboard 
 * 
 * @package   local_recitdashboard
 * @copyright 2019 RÉCIT 
 * @license   {@link http://www.gnu.org/licenses/gpl-3.0.html} GNU GPL v3 or later
 */
import React, { Component } from 'react';
import {Card, Button, Collapse, InputGroup, FormControl} from 'react-bootstrap';
import {faPlus, faMinus} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {DataGrid, MultipleSelect} from '../../libs/components/Components';
import {JsNx} from '../../libs/utils/Utils';
import {Cookies} from '../../libs/utils/Cookies';
import {$glVars, Options, AppCommon} from '../../common/common';
import { i18n } from '../../common/i18n';

export class ReportDiagnosticTags extends Component{
    static defaultProps = {
        options: null        
    };

    constructor(props) {
        super(props);

        this.getData = this.getData.bind(this);
        this.getDataResult = this.getDataResult.bind(this);
        this.getCellContext = this.getCellContext.bind(this);
        this.onOptionChange = this.onOptionChange.bind(this);

        this.state = {collapse: true, data: null, tagList: [], options: {tagFilter: []}};
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
    
    getData(output){
        if(this.props.options === null){ return; }

        output = output || 'html';
        $glVars.webApi.getReportDiagTag(this.props.options.course.id, this.props.options.group.id, this.props.options.section.id, this.props.options.cm.id, output, 'question', this.getDataResult);  
    }

    getDataResult(result){    
        if(result.success){
            let tagList = [];
            for(let item of result.data.tagList){
                tagList.push({text: item, value: item});
            }
            
            let cellContext = Cookies.get("reportDiagTagContexts", null);
            if(cellContext !== null){
                result.data.htmlCellContext = JSON.parse(cellContext);
            }
            
            this.setState({data: result.data, tagList: tagList});
        }
        else{
            $glVars.feedback.showError(i18n.get_string('pluginname'), result.msg);
        }
    }

    getCellContext(grade){
        grade = parseFloat(grade);

        let context = "";
        let cellContext = this.state.data.htmlCellContext;

        if(grade >= cellContext.minSuccess && grade <= cellContext.maxSuccess){
            context = AppCommon.Colors.lightGreen;
        }
        else if(grade >= cellContext.minWarning && grade < cellContext.maxWarning){
            context =  AppCommon.Colors.lightYellow;
        }
        else{
            context =  AppCommon.Colors.lightRed;
        }

        return context;
    }    

    render(){
        let data = this.state.data;
        let that = this;

        if(data === null){ return null;}

        let tagList = (this.state.options.tagFilter.length === 0 ? data.tagList : this.state.options.tagFilter);

        let main = 
        <div>
            <br/>
            <br/>
            <h5>{i18n.get_string('viewoptions')} <Button variant="link" size="sm" onClick={() => {this.setState({collapse: !this.state.collapse})}}>{this.state.collapse ? <FontAwesomeIcon icon={faMinus}/> : <FontAwesomeIcon icon={faPlus}/>}</Button></h5>
            <Collapse in={this.state.collapse}>
                <div style={{padding: '.5rem', marginBottom: ".5rem"}}>
                    <div style={{display: "flex", justifyContent: "left", padding: '1rem'}}>                
                        <AlertRange title={i18n.get_string('intervaldanger')} width="330px" min={this.state.data.htmlCellContext.minDanger} max={this.state.data.htmlCellContext.maxDanger} suffix="Danger" onDataChange={this.onOptionChange}/>
                        <AlertRange title={i18n.get_string('intervalalert')} width="330px"  min={this.state.data.htmlCellContext.minWarning} max={this.state.data.htmlCellContext.maxWarning} suffix="Warning" onDataChange={this.onOptionChange}/>
                        <AlertRange title={i18n.get_string('intervalsuccess')} width="330px" min={this.state.data.htmlCellContext.minSuccess} max={this.state.data.htmlCellContext.maxSuccess} suffix="Success" onDataChange={this.onOptionChange}/>
                    </div>
                    <MultipleSelect style={{padding: ".5rem"}} values={this.state.options.tagFilter} placeholder={i18n.get_string('filterbytags')} name="tagFilter" options={this.state.tagList} onDataChange={this.onOptionChange}/>
                </div>
            </Collapse>
            <hr/>
            <br/>
            <h5>{i18n.get_string('studentsoverview')}</h5>
            <DataGrid orderBy={true}>
                <DataGrid.Header>
                    <DataGrid.Header.Row>
                        <DataGrid.Header.Cell style={{minWidth: "120px"}}>{i18n.get_string('firstname')}</DataGrid.Header.Cell>
                        <DataGrid.Header.Cell style={{minWidth: "100px"}}>{i18n.get_string('lastname')}</DataGrid.Header.Cell>
                        {tagList.map((item, index) => {
                            return <DataGrid.Header.Cell key={index}>{item}</DataGrid.Header.Cell>
                        })}
                    </DataGrid.Header.Row>
                </DataGrid.Header>
                <DataGrid.Body>
                {data.students.map((student, index) => {
                            let cols = [];
                            cols.push(<DataGrid.Header.Cell key={cols.length} freezing={true}>{student.firstName}</DataGrid.Header.Cell>);
                            cols.push(<DataGrid.Header.Cell key={cols.length} freezing={true}>{student.lastName}</DataGrid.Header.Cell>);

                            {tagList.map((tagName, index2) => {
                                let tag = JsNx.getItem(student.tags, 'tagName', tagName, null);
                                let value = (tag === null ? '0' : tag.value);
                                value = parseFloat(value).toFixed(1);
                                let col = <DataGrid.Body.Cell key={cols.length} style={{backgroundColor: that.getCellContext(value)}}>{`${value}%`}</DataGrid.Body.Cell>
                                cols.push(col);
                                return (null);
                            })}

                            let row = <DataGrid.Body.Row key={index}>{cols}</DataGrid.Body.Row>;
                            return (row);                                    
                        }
                    )}
                </DataGrid.Body>
            </DataGrid>
            <br/>
            <h5>{i18n.get_string('groupoverview')}</h5>
            {data.groups.map((group, index) => {
                let groupCard = 
                    <Card key={index}>
                        <Card.Header>{group.groupName}</Card.Header>
                        <Card.Body style={{display: 'flex', flexWrap: 'wrap'}}>
                            {group.tags.map((item, index2) => {
                                if(!tagList.includes(item.tagName)){ return null;}

                                let value = parseFloat(item.value).toFixed(1);
                                let style = {backgroundColor: that.getCellContext(value), fontWeight: 700, fontSize: '15px', flexGrow: 1, padding: '8px', borderRadius: '4px',
                                             margin: '10px', textAlign: 'center'};
                                let groupTag = <div key={index2} style={style}>{item.tagName}<br/>{`${value}%`}</div>
                                return (groupTag);
                            })}
                        </Card.Body>
                    </Card>
                return groupCard;
                }
            )}
            <br/>
            <br/>
            <hr/>
            <div>
                <a href={`${Options.getGateway()}?service=getReportDiagTag&cmId=${this.props.options.cm.id}&groupId=${this.props.options.group.id}&output=csv&options=question`} target='_blank'>{"Télécharger en CSV"}</a>
            </div>
        </div>;

        return main;
    }
    
    onOptionChange(event){
        let options = this.state.options;
        
        if(this.state.data.htmlCellContext.hasOwnProperty(event.target.name)){
            this.state.data.htmlCellContext[event.target.name] = event.target.value;
            Cookies.set('reportDiagTagContexts', JSON.stringify(this.state.data.htmlCellContext), 60*24*7); // 1 week
        }
        else{
            options[event.target.name] = event.target.value;
        }
        
        this.setState({options: options})
    }
}

class AlertRange extends Component{
    static defaultProps = {
        title: "",
        width: "100%",
        min: 0,
        max: 0,
        suffix: "",
        onDataChange: null
    };

    constructor(props){
        super(props);

        this.onDataChange = this.onDataChange.bind(this);
    }

    render(){
        let main =
            <div style={{width: this.props.width, marginRight: "2rem"}}>
                <h6>{this.props.title}</h6>
                    <div style={{display: "flex", justifyContent: "space-between", alignItems: "baseline"}}>
                        <InputGroup className="mb-3" style={{width: 130}}>
                            <FormControl value={this.props.min} name="min" onChange={this.onDataChange}/>
                            <InputGroup.Append>
                                <InputGroup.Text >%</InputGroup.Text>
                            </InputGroup.Append>
                        </InputGroup>
                        et
                        <InputGroup className="mb-3" style={{width: 130}}>
                            <FormControl value={this.props.max} name="max" onChange={this.onDataChange}/>
                            <InputGroup.Append>
                                <InputGroup.Text>%</InputGroup.Text>
                            </InputGroup.Append>
                        </InputGroup>
                    </div>
            </div>;

        return main;
    }

    onDataChange(event){
        event = {target: {name: `${event.target.name}${this.props.suffix}`, value: event.target.value}};
        this.props.onDataChange(event);
    }
}