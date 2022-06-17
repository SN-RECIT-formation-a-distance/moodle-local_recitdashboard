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
import { Card, ButtonGroup, ButtonToolbar, Button} from 'react-bootstrap';
import { ResponsivePie } from '@nivo/pie';
import {faSync, faTimesCircle} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {$glVars, AppCommon} from '../../common/common';
import { i18n } from '../../common/i18n';

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
            $glVars.feedback.showError(i18n.get_string('pluginname'), result.msg);
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
                        <div>{i18n.get_string('overviewofmygroups')}</div>
                        
                        <ButtonToolbar>
                            <ButtonGroup>
                                <Button  variant="outline-secondary" onClick={this.getData} title={i18n.get_string('updategadget')}><FontAwesomeIcon icon={faSync}/></Button>
                                <Button  variant="outline-secondary" onClick={this.onClose} title={i18n.get_string('removegadget')}><FontAwesomeIcon icon={faTimesCircle}/></Button>
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
        let title = (item.group.name.length > 0 ? i18n.get_string('group') + ' ' + item.group.name : i18n.get_string('nogroup'))

        let main = 
            <div className='item'>
                <h6 className='item-title'>{title}</h6>
                
                <div className='charts'>
                    {this.getChart(this.props.data.progress, i18n.get_string('progress'))}
                    {this.getChart(this.props.data.grades, i18n.get_string('grades'))}
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