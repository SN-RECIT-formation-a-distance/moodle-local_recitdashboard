
import React, { Component } from 'react';
import { Card, ButtonGroup, ButtonToolbar, Button, OverlayTrigger, Tooltip} from 'react-bootstrap';
import { ResponsivePie } from '@nivo/pie';
import {faSync, faInfo, faSearchPlus} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {$glVars} from '../common/common';

export class GadgetGroupsOverview extends Component{
    static defaultProps = {        
        options: null,
        onSelectGroup: null
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
       if ((this.props.options.selectedCourse.courseId !== prevProps.options.selectedCourse.courseId) || 
            (this.props.options.onlyMyGroups !== prevProps.options.onlyMyGroups)){
            this.getData();
        }
    }

    getData(){
        $glVars.webApi.getGroupsOverview(this.props.options.selectedCourse.courseId, this.props.options.onlyMyGroups, this.getDataResult);        
    }

    getDataResult(result){         
        if(result.success){
            this.setState({dataProvider: result.data});
        }
        else{
            $glVars.feedback.showError($glVars.i18n.tags.appname, result.msg);
        }
    }

    render(){
        
        let main =
            <Card className="gadget-groups-overview">
                <Card.Body>
                    <Card.Title>
                        <div>
                            {"Aperçu rapide de mes groupes "}
                            <OverlayTrigger placement="right" delay={{ show: 250, hide: 400 }} overlay={<Tooltip>{`En cliquant sur le groupe on obtient une vue détaillée des données du group`}</Tooltip>}>
                                <Button size="sm" variant="outline-secondary"><FontAwesomeIcon icon={faInfo}/></Button>
                            </OverlayTrigger>
                        </div>
                        
                        <ButtonToolbar aria-label="Toolbar with Buttons">
                            <ButtonGroup  >
                                <Button  variant="outline-secondary" size="sm" onClick={this.getData}><FontAwesomeIcon icon={faSync}/></Button>
                            </ButtonGroup>
                        </ButtonToolbar>                              
                    </Card.Title>

                    <div className="content">
                        {this.state.dataProvider.map((item, index) => {
                            return <PieChart key={index} data={item}  onSelectGroup={this.props.onSelectGroup} />;
                        })}
                    </div>
                </Card.Body>
            </Card>;
        return main;
    }
}

class PieChart extends Component{
    static defaultProps = {        
        data: null,
        onSelectGroup: null
    };

    render(){
        let item = this.props.data.grades || this.props.data.progress;
        let title = (item.group.name.length > 0 ? `Groupe ${item.group.name}` : `Pas de groupe`)

        let main = 
            <div className='item'>
                <Button  size="sm" variant="link" onClick={() => this.props.onSelectGroup({id: item.group.id, name: item.group.name})}>
                    <h5 className='item-title'>{title}</h5>
                </Button>
                
                <div className='charts'>
                    {this.getChart(this.props.data.progress, 'Progrès')}
                    {this.getChart(this.props.data.grades, 'Notes')}
                </div>
            </div>;
        return main;
    }

    prepareChartData(data){
        let result = 
        [
            {
              "id": "g",
              "label": data.gDesc,
              "value": Math.round(data.g,2),
              "color": 'hsl(83, 63%, 59%)'
            },
            {
              "id": "y",
              "label": data.yDesc,
              "value":  Math.round(data.y,2),
              "color": "hsl(49, 100%, 59%)"
            },
            {
              "id": "r",
              "label": data.rDesc,
              "value": Math.round(data.r,2),
              "color": "hsl(323, 66%, 72%)"
            }
          ]
        

        return result;
    }

    formatValue(v){
        return `${v.value.toFixed(1)}%`;
    }

    getChart(data, desc){
        data = data || null;

        if(data === null){ return null;}

        let result = <ResponsivePie
        data={this.prepareChartData(data)}
        margin={{ top: 10, right: 10, bottom: 10, left: 10 }}
        innerRadius={0.5}
        padAngle={2}
        cornerRadius={0}
        colors={['hsl(134, 41%, 83%)', 'hsl(45, 100%, 86%)', 'hsl(354, 70%, 87%)']}
        borderWidth={1}
        borderColor={{ from: 'color', modifiers: [ [ 'darker', 0.2 ] ] }}
        enableRadialLabels={false}
        radialLabelsSkipAngle={10}
        radialLabelsTextXOffset={6}
        radialLabelsTextColor="#333333"
        radialLabelsLinkOffset={0}
        radialLabelsLinkDiagonalLength={16}
        radialLabelsLinkHorizontalLength={24}
        radialLabelsLinkStrokeWidth={1}
        radialLabelsLinkColor={{ from: 'color' }}
        slicesLabelsSkipAngle={10}
        slicesLabelsTextColor="#333333"
        enableSlicesLabels={true}
        sliceLabel={this.formatValue}
        animate={true}
        motionStiffness={90}
        motionDamping={15}
        defs={[
            {
                id: 'gdef',
                type: 'patternLines',
                background: 'hsl(134, 41%, 83%)',
                color: 'rgba(255, 255, 255, 0.3)',
                size: 4,
                padding: 1,
                stagger: true
            },
            {
                id: 'ydef',
                type: 'patternLines',
                background: 'hsl(45, 100%, 86%)',
                color: 'rgba(255, 255, 255, 0.3)',
                rotation: -45,
                lineWidth: 6,
                spacing: 10
            },
            {
                id: 'rdef',
                type: 'patternLines',
                background: 'hsl(354, 70%, 87%)',
                color: 'rgba(255, 255, 255, 0.3)',
                rotation: -45,
                lineWidth: 6,
                spacing: 10
            }
        ]}
        fill={[
            {
                match: {
                    id: 'g'
                },
                id: 'gdef'
            },
            {
                match: {
                    id: 'y'
                },
                id: 'ydef'
            },
            {
                match: {
                    id: 'r'
                },
                id: 'rdef'
            }
        ]}
        legends={[]}
        />;

        return <div className='item-chart'><strong>{desc}</strong>{result}</div>;
    }
}
