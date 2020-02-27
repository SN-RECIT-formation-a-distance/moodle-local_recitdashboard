
import React, { Component } from 'react';
import { Card, ButtonGroup, ButtonToolbar, Button, OverlayTrigger, Tooltip} from 'react-bootstrap';
import { ResponsivePie } from '@nivo/pie';
import {faSync, faInfo, faSearchPlus} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {$glVars} from '../common/common';
//import { JsNx } from '../libs/utils/Utils';

export class GadgetGroupsOverview extends Component{
    static defaultProps = {        
        courseId: 0,
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
       if (this.props.courseId !== prevProps.courseId) {
            this.getData();
        }
    }

    getData(){
        $glVars.webApi.getGroupsOverview(this.props.courseId, this.getDataResult);        
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
            <Card style={{flexGrow: 1, margin: 5}}>
                <Card.Body>
                    <Card.Title style={{display: "flex", justifyContent: "space-between"}}>
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

                    <div style={{display: "grid", gridTemplateColumns: "auto auto auto auto", gridGap: "1rem"}}>
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
        let groupName = (this.props.data.grades ? this.props.data.grades.groupName : this.props.data.progress.groupName);
        let title = (groupName.length > 0 ? `Groupe ${groupName}` : `Pas de groupe`)

        let main = 
            <div style={{border: "1px solid #efefef"}}>
                <h5 style={{marginTop: 10, marginLeft: 10}}>{title}<Button  size="sm" variant="link" onClick={() => this.props.onSelectGroup(groupName)}>
                    <FontAwesomeIcon icon={faSearchPlus}/></Button>
                </h5>
                {this.getChart(this.props.data.progress)}
                {this.getChart(this.props.data.grades)}
                <div style={{textAlign: "center", fontWeight: 500}}>Progrès / Notes</div>
            </div>;
        return main;
    }

    prepareChartData(data){
        let result = 
        [
            {
              "id": "g",
              "label": "g",
              "value": data.g,
              "color": 'hsl(83, 63%, 59%)'
            },
            {
              "id": "y",
              "label": "y",
              "value": data.y,
              "color": "hsl(49, 100%, 59%)"
            },
            {
              "id": "r",
              "label": "r",
              "value": data.r,
              "color": "hsl(323, 66%, 72%)"
            }
          ]
        

        return result;
    }

    formatValue(v){
        return `${v.value.toFixed(1)}%`;
    }

    getChart(data){
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

        return <div style={{height: 180, width: 180, display: 'inline-flex'}}>{result}</div>;
    }
}
