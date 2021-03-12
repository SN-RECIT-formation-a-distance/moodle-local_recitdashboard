
/*import React, { Component } from 'react';
import { Card, ButtonGroup, ButtonToolbar, Button} from 'react-bootstrap';
import { ResponsiveBar } from '@nivo/bar'
import {faSync} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {UtilsDateTime} from '../libs/utils/Utils';
import {$glVars} from '../common/common';

export class GadgetStudentAssiduity extends Component{
    static defaultProps = {        
        courseId: 0,
        userId: 0
    };

    constructor(props) {
        super(props);

        this.getData = this.getData.bind(this);
        this.getDataResult = this.getDataResult.bind(this);
        this.prepareChartData = this.prepareChartData.bind(this);

        this.state = {dataProvider:[]};
    }

    componentDidMount(){
        this.getData();
    }

    componentDidUpdate(prevProps){
        // Typical usage (don't forget to compare props):
        if((this.props.courseId !== prevProps.courseId) || (this.props.userId !== prevProps.userId)){
            this.getData();
        }
    }

    getData(){
        $glVars.webApi.getStudentAssiduity(this.props.courseId, this.props.userId, this.getDataResult);        
    }

    getDataResult(result){         
        if(result.success){
            this.setState({dataProvider: result.data});
        }
        else{
            $glVars.feedback.showError($glVars.i18n.tags.appname, result.msg);
        }
    }

    formatDate(obj){
        return `${obj.getFullYear()}-${obj.getMonth()}-${obj.getDate()}`;
    }

    prepareChartData(dataProvider){
        if(dataProvider.length === 0){ return []; }

        let result = [];
        for(let item of dataProvider){
            result.push({dateRef: new Date(item.timeCreated), nbRequest: item.nbRequest});
        }

        for(let item of result){
            item.dateRef = UtilsDateTime.format(item.dateRef);
        }

        return result;
    }

    render(){
        let bodyContent = {height: 400};

        let dataProvider = this.prepareChartData(this.state.dataProvider);        
        
        let main =
            <Card className="gadget">
                <Card.Body>
                    <Card.Title style={{display: "flex", justifyContent: "space-between"}}>
                        <div>
                            {"Assiduité - Nombre de requêtes"}
                        </div>
                        
                        <ButtonToolbar aria-label="Toolbar with Buttons">
                            <ButtonGroup  >
                                <Button  variant="outline-secondary" size="sm" onClick={this.getData}><FontAwesomeIcon icon={faSync}/></Button>
                            </ButtonGroup>
                        </ButtonToolbar>                              
                    </Card.Title>

                    <div style={bodyContent}>
                    <ResponsiveBar
                        data={dataProvider}
                        keys={[ 'nbRequest']}
                        indexBy="dateRef"
                        margin={{ top: 50, right: 50, bottom: 50, left: 60 }}
                        padding={0.3}
                        colors={{ scheme: 'nivo' }}
                        defs={[
                            {
                                id: 'lines',
                                type: 'patternLines',
                                background: 'inherit',
                                color: '#eed312',
                                rotation: -45,
                                lineWidth: 6,
                                spacing: 10
                            }
                        ]}
                        fill={[
                            {
                                match: {
                                    id: 'nbRequest'
                                },
                                id: 'lines'
                            }
                        ]}
                        borderColor={{ from: 'color', modifiers: [ [ 'darker', 1.6 ] ] }}
                        axisTop={null}
                        axisRight={null}
                        axisBottom={{
                            tickSize: 5,
                            tickPadding: 3,
                            tickRotation: 0,
                            legend: 'Date',
                            legendPosition: 'middle',
                            legendOffset: 32
                        }}
                        axisLeft={{
                            tickSize: 5,
                            tickPadding: 5,
                            tickRotation: 0,
                            legend: 'Nb Requêtes',
                            legendPosition: 'middle',
                            legendOffset: -40
                        }}
                        labelSkipWidth={12}
                        labelSkipHeight={12}
                        labelTextColor={{ from: 'color', modifiers: [ [ 'darker', 1.6 ] ] }}
                        legends={[]}
                        animate={true}
                        motionStiffness={90}
                        motionDamping={15}
                    />
                    </div>
                </Card.Body>
            </Card>;
//
//enablePointLabel={true}
        return main;
    }
}
*/