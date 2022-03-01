
import React, { Component } from 'react';
import { Card, ButtonGroup, ButtonToolbar, Button} from 'react-bootstrap';
import { ResponsivePie } from '@nivo/pie';
import {faSync, faTimesCircle} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {$glVars, AppCommon} from '../../common/common';

export class GadgetGroupsOverview extends Component{
    static defaultProps = {        
        options: null,
        onClose: null,
        show: true,
    };

    constructor(props) {
        super(props);

        this.onClose = this.onClose.bind(this);
        this.getData = this.getData.bind(this);
        this.getDataResult = this.getDataResult.bind(this);

        this.state = {dataProvider:[], show: true};
    }

    componentDidMount(){
        this.getData();
    }

    componentDidUpdate(prevProps){
        if((this.props.options.course.id !== prevProps.options.course.id) || (this.props.options.group.id !== prevProps.options.group.id)){
            this.getData();
        }
        if(this.props.show !== this.state.show){
            this.setState({show: this.props.show});
        }
    }

    getData(){
        if(this.props.options === null){ return; }

        $glVars.webApi.getGroupsOverview(this.props.options.course.id, this.props.options.group.id, this.getDataResult);        
    }

    getDataResult(result){         
        if(result.success){
            this.setState({dataProvider: result.data, show: true});
        }
        else{
            $glVars.feedback.showError($glVars.i18n.tags.appname, result.msg);
            this.setState({dataProvider: [], show: false});
        }
    }

    render(){
        if(!this.state.show){ return null; }

        if(this.state.dataProvider.length === 0){ return null;}

        let main =
            <Card className="gadget-groups-overview">
                <Card.Body>
                    <Card.Title>
                        <div>{"Aperçu rapide de mes groupes "}</div>
                        
                        <ButtonToolbar aria-label="Toolbar with Buttons">
                            <ButtonGroup  >
                                <Button  variant="outline-secondary" size="sm" onClick={this.getData} title="Mettre à jour le gadget"><FontAwesomeIcon icon={faSync}/></Button>
                                <Button  variant="outline-secondary" size="sm" onClick={this.onClose} title="Enlever le gadget"><FontAwesomeIcon icon={faTimesCircle}/></Button>
                            </ButtonGroup>
                        </ButtonToolbar>                              
                    </Card.Title>

                    <div className="content">
                        {this.state.dataProvider.map((item, index) => {
                            return <PieChart key={index} data={item} />;
                        })}
                    </div>
                </Card.Body>
            </Card>;
        return main;
    }

    onClose(){
        this.setState({show: false});
        if (this.props.onClose){
            this.props.onClose();
        }
    }
}

class PieChart extends Component{
    static defaultProps = {        
        data: null
    };

    render(){
        let item = this.props.data.grades || this.props.data.progress;
        let title = (item.group.name.length > 0 ? `Groupe ${item.group.name}` : `Pas de groupe`)

        let main = 
            <div className='item'>
                <h6 className='item-title'>{title}</h6>
                
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
        colors={[AppCommon.Colors.lightGreen, AppCommon.Colors.lightYellow, AppCommon.Colors.lightRed]}
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
                background: AppCommon.Colors.lightGreen,
                color: 'rgba(255, 255, 255, 0.3)',
                size: 4,
                padding: 1,
                stagger: true
            },
            {
                id: 'ydef',
                type: 'patternLines',
                background: AppCommon.Colors.lightYellow,
                color: 'rgba(255, 255, 255, 0.3)',
                rotation: -45,
                lineWidth: 6,
                spacing: 10
            },
            {
                id: 'rdef',
                type: 'patternLines',
                background: AppCommon.Colors.lightRed,
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
