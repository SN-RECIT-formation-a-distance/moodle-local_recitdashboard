
import React, { Component } from 'react';
import { Card, ButtonGroup, Button} from 'react-bootstrap';
import { ResponsiveLine } from '@nivo/line'
import {faSync} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {$glVars} from '../common/common';
import { JsNx } from '../libs/utils/Utils';

export class GadgetAttendance extends Component{
    static defaultProps = {        
        courseId: 0
    };

    constructor(props) {
        super(props);

        this.getData = this.getData.bind(this);
        this.getDataResult = this.getDataResult.bind(this);

        this.state = {dataProvider:[]};
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
        $glVars.webApi.getCourseAttendance(this.props.courseId, this.getDataResult);        
    }

    getDataResult(result){         
        if(result.success){
            this.setState({dataProvider: this.prepareChartData(result.data)});
        }
        else{
            $glVars.feedback.showError($glVars.i18n.tags.appname, result.msg);
        }
    }

    /*prepareGroup(dataProvider){
        let result = [];

        for(let users of dataProvider){
            for(let courseId in users){
                let course = users[courseId];
                for(let weekNumber in course){
                    let tmp = course[weekNumber].groups.split(",");
                    for(let item of tmp){
                        JsNx.singlePush(result, item);
                    }                 
                    break;
                }
                break;
            }
        }

        return result;
    }*/

    prepareChartData(dataProvider){
        let result = [];

        for(let users of dataProvider){
            for(let courseId in users){
                let course = users[courseId];
                for(let weekNumber in course){
                    let chartItem = JsNx.getItem(result, "id", course[weekNumber].username, null);
                    if(chartItem === null){
                        chartItem = {id: course[weekNumber].username, color: "", data: []};
                        result.push(chartItem);
                    }
                    
                    chartItem.data.push({x: course[weekNumber].weekNumber, y: Math.round(course[weekNumber].amountSec/60/60,2)});
                }
            }
        }

        return result;
    }

    render(){
        let bodyContent = {height: 400};

        let main =
            <Card>
                <Card.Body>
                    <Card.Title style={{display: "flex", justifyContent: "space-between"}}>
                        {"Assiduité des élèves"}
                        <ButtonGroup  >
                            <Button  variant="outline-secondary" size="sm" onClick={this.getData}><FontAwesomeIcon icon={faSync}/></Button>
                        </ButtonGroup>
                    </Card.Title>

                    <div style={bodyContent}>
                        <ResponsiveLine
                            data={this.state.dataProvider}
                            margin={{ top: 50, right: 160, bottom: 50, left: 60 }}
                            xScale={{ type: 'point' }}
                            yScale={{ type: 'linear', min: 0, max: 'auto', stacked: false, reverse: false }}
                            curve="cardinal"
                            axisTop={null}
                            axisRight={null}
                            axisBottom={{
                                orient: 'bottom',
                                tickSize: 1,
                                tickPadding: 5,
                                tickRotation: 0,
                                legend: '# semaine',
                                legendOffset: 36,
                                legendPosition: 'middle'
                            }}
                            axisLeft={{
                                orient: 'left',
                                tickSize: 1,
                                tickPadding: 5,
                                tickRotation: 0,
                                legend: '# heures',
                                legendOffset: -40,
                                legendPosition: 'middle'
                            }}
                            colors={{ scheme: 'nivo' }}
                            pointSize={10}
                            pointColor={{ theme: 'background' }}
                            pointBorderWidth={2}
                            pointBorderColor={{ from: 'serieColor' }}
                            pointLabel="y"
                            pointLabelYOffset={-12}
                            enableArea={true}
                            useMesh={true}
                            legends={[
                                {
                                    anchor: 'bottom-right',
                                    direction: 'column',
                                    justify: false,
                                    translateX: 100,
                                    translateY: 0,
                                    itemsSpacing: 0,
                                    itemDirection: 'left-to-right',
                                    itemWidth: 80,
                                    itemHeight: 20,
                                    itemOpacity: 0.75,
                                    symbolSize: 12,
                                    symbolShape: 'circle',
                                    symbolBorderColor: 'rgba(0, 0, 0, .5)',
                                    effects: [
                                        {
                                            on: 'hover',
                                            style: {
                                                itemBackground: 'rgba(0, 0, 0, .03)',
                                                itemOpacity: 1
                                            }
                                        }
                                    ]
                                }
                            ]}
                        />
                    </div>
                </Card.Body>
            </Card>;
//
//enablePointLabel={true}
        return main;
    }
}
