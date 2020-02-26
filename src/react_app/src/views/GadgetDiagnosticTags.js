
import React, { Component } from 'react';
import { Card, ButtonGroup, ButtonToolbar, Button, DropdownButton, Dropdown} from 'react-bootstrap';
import { ResponsiveHeatMap } from '@nivo/heatmap'
import {faSync} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {$glVars} from '../common/common';
import { JsNx } from '../libs/utils/Utils';

export class GadgetDiagnosticTags extends Component{
    static defaultProps = {        
        courseId: 0,
        group: ""
    };

    constructor(props) {
        super(props);

        this.getData = this.getData.bind(this);
        this.getDataResult = this.getDataResult.bind(this);
        this.prepareChartData = this.prepareChartData.bind(this);
        this.getCellContext = this.getCellContext.bind(this);

        this.state = {data: null, cellContext: null};
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
        $glVars.webApi.getReportDiagTag(this.props.courseId, this.getDataResult);        
    }

    getDataResult(result){         
        if(result.success){
            this.setState({data: result.data, cellContext: result.data.htmlCellContext});
        }
        else{
            $glVars.feedback.showError($glVars.i18n.tags.appname, result.msg);
        }
    }

    prepareTagList(data){
        let result = [];

        if(data === null){ return result; }

        for(let student of data.students){
            for(let tag of student.tags){
                JsNx.singlePush(result, tag.tagName);
            }
        }

        return result;
    }

    prepareChartData(data, tagList){
        let result = [];

        if(data === null){ return result; }
        
        for(let student of data.students){
            
            if(this.state.selectedGroupIndex >= 0){                        
                if(!student.groupName.includes(this.props.group)){
                    continue;
                }
            }

            let item = {studentName: `${student.firstName} ${student.lastName}`};

            if(JsNx.getItem(result, "studentName", item.studentName, null) !== null){
                continue;
            }

            for(let tagName of tagList){
                let tag = JsNx.getItem(student.tags, 'tagName', tagName, {});
                item[tagName] = JsNx.get(tag, 'value', 0);
                //let attrName = `${tagName}Color`;
                //item[attrName] = this.getCellContext(item[tagName]);
            }
            result.push(item);
        }

        return result;
    }

    getCellContext(grade){
        grade = parseFloat(grade);

        let context = "";

        if(grade >= this.state.cellContext.minSuccess && grade <= this.state.cellContext.maxSuccess){
            context = 'hsl(134, 41%, 83%)';
        }
        else if(grade >= this.state.cellContext.minWarning && grade < this.state.cellContext.maxWarning){
            context = 'hsl(45, 100%, 86%)';
        }
        //else if(grade >= this.state.cellContext.minDanger && grade < this.state.cellContext.maxDanger){
        else{
            context = 'hsl(354, 70%, 87%)';
        }

        return context;
    }

    render(){
        let tagList = this.prepareTagList(this.state.data);
        let data = this.prepareChartData(this.state.data, tagList);

        let bodyContent = {height: Math.max(400, data.length * 50)}; // make sure parent container have a defined height when using responsive component

        const CustomCell = ({value, x, y, width, height, color, opacity, borderWidth, borderColor, textColor, onHover, onLeave}) => (
             <g transform={`translate(${x}, ${y})`}>
                <path onMouseEnter={onHover} onMouseMove={onHover} onMouseLeave={onLeave}            
                    fill={this.getCellContext(value)}
                    fillOpacity={opacity}
                    strokeWidth={borderWidth}
                    stroke={borderColor}
                    d={`
                        M${Math.round(width / 2)} -${Math.round(height / 2)}
                        L${Math.round(width / 2)} ${Math.round(height / 2)}
                        L-${Math.round(width / 2)} ${Math.round(height / 2)}
                        L-${Math.round(width / 2)} -${Math.round(height / 2)}
                    `}
                />
                <text dominantBaseline="central" textAnchor="middle" style={{ fill: textColor, fontWeight: 500, opacity: 0.5, color: "#555" }}>{value}</text>
            </g>
    )

    
        let main =
            <Card style={{flexGrow: 1, margin: 5}}>
                <Card.Body>
                    <Card.Title style={{display: "flex", justifyContent: "space-between"}}>
                        {"Diagnostic de tags"}
                        <ButtonToolbar aria-label="Toolbar with Buttons">
                            <ButtonGroup  >
                                <Button  variant="outline-secondary" size="sm" onClick={this.getData}><FontAwesomeIcon icon={faSync}/></Button>
                            </ButtonGroup>
                        </ButtonToolbar>                              
                    </Card.Title>

                    <div style={bodyContent}>
                        <ResponsiveHeatMap
                            cellShape={CustomCell}
                            forceSquare={false}                            
                            data={data}
                            keys={tagList}
                            indexBy="studentName"
                            margin={{ top: 150, right: 0, bottom: 0, left: 150 }}
                            padding={5}
                            axisTop={{ orient: 'top', tickSize: 5, tickPadding: 5, tickRotation: -90, legend: '', legendOffset: 36 }}
                            axisRight={null}
                            axisBottom={null}
                            axisLeft={{
                                orient: 'left',
                                tickSize: 5,
                                tickPadding: 5,
                                tickRotation: 0,
                                legend: '',
                                legendPosition: 'middle',
                                legendOffset: -40
                            }}
                            cellOpacity={1}
                            cellBorderColor={{ from: 'color', modifiers: [ [ 'darker', 0.4 ] ] }}
                            labelTextColor={{ from: 'color', modifiers: [ [ 'darker', 1.8 ] ] }}
                            defs={[
                                {
                                    id: 'lines',
                                    type: 'patternLines',
                                    background: 'inherit',
                                    color: 'rgba(0, 0, 0, 0.1)',
                                    rotation: -45,
                                    lineWidth: 4,
                                    spacing: 7
                                }
                            ]}
                            fill={[ { id: 'lines' } ]}
                            animate={true}
                            motionStiffness={80}
                            motionDamping={9}
                            hoverTarget="cell"
                            cellHoverOthersOpacity={0.25}
                        />
                    </div>
                </Card.Body>
            </Card>;
//
//enablePointLabel={true}
        return main;
    }

    onSelectGroup(index){
        this.setState({selectedGroupIndex: index});
    }
}
