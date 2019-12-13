import React, { Component } from 'react';
import { FormControl, Col, Alert, InputGroup } from 'react-bootstrap';

export class NumberInterval extends Component {
    static defaultProps = {
        onChange: null,
        name: "",
        eMinMax: false,  // show the checkbox to enable ou disable the min and max
        eMin: true,     // enable min      
        min: 0,      // min value
        eMax: true,     // enable max
        max: 0,      // max value
        lang: 'en'
    };
    
    static TagsLanguage = [
           // prowebapp
           {"tag": "minValue", "en": "Minimum value", "fr": "Valeur minimale"},
           {"tag": "maxValue", "en": "Maximum value", "fr": "Valeur maximum"},
           {"tag": "msgMinGreaterMax", "en": "The minimum value cannot be greater than the maximum one.", "fr": "La valeur minimale ne peut pas être supérieure à la valeur maximale."}
    ];
     
    static getDerivedStateFromProps(nextProps, prevState){
        return {lang: nextProps.lang, minValue: (nextProps.eMin ? nextProps.min : ""), maxValue: (nextProps.eMax ? nextProps.max : "")};
    }

    constructor(props){
        super(props);
        
        this.onChange = this.onChange.bind(this);
        
        this.state = {feedback: "", lang: "en", minValue: 0, maxValue: 0};
        
        this.translator = null;
    }
    
    getTranslator(){
        let result = {};
        for(var i = 0; i <  NumberInterval.TagsLanguage.length; i++){
            result[NumberInterval.TagsLanguage[i].tag] =  NumberInterval.TagsLanguage[i][this.state.lang];
        }
        return result;
    }
    
    render() {        
        this.translator = this.getTranslator();

        let main = <div>
                        <div>
                            <Col xs={6} sm={6} md={6} lg={6} style={{paddingLeft: 0}}>
                                <InputGroup>
                                    {this.props.eMinMax && 
                                        <InputGroup.Addon>
                                            <input type="checkbox" checked={this.props.eMin} onChange={this.onChange} name="eMin" />
                                            {" "}
                                        </InputGroup.Addon>
                                    }
                                    <FormControl name="min" type="number" value={this.state.minValue} placeholder={this.translator.minValue} 
                                                onChange={this.onChange} disabled={!this.props.eMin}/>
                                </InputGroup>
                            </Col>
                            <Col xs={6} sm={6} md={6} lg={6}  style={{paddingRight: 0}}>
                                <InputGroup>
                                    {this.props.eMinMax && 
                                        <InputGroup.Addon>
                                            <input type="checkbox" checked={this.props.eMax} onChange={this.onChange} name="eMax" />
                                            {" "}
                                        </InputGroup.Addon>
                                    }
                                    <FormControl name="max" type="number" value={this.state.maxValue} placeholder={this.translator.maxValue} 
                                            onChange={this.onChange} disabled={!this.props.eMax}/>
                                </InputGroup>
                                
                            </Col>
                        </div>
                        <div>
                        {this.state.feedback.length > 0 &&  <Alert bsStyle="warning">{this.state.feedback}</Alert>}
                        </div>
                    </div>
        return (main);
    }   
      
    onChange(event){ 
        let data ={
            eMin: (this.props.eMinMax ? this.props.eMin : true), 
            min: this.state.minValue, 
            eMax: (this.props.eMinMax ? this.props.eMax : true), 
            max: this.state.maxValue
        };
        
        if(event.target.type === "checkbox"){
            data[event.target.name] = event.target.checked;
        }
        else{
            data[event.target.name] = Number(event.target.value);
        }
        
        let result = {
            target: {
                name: this.props.name, 
                value: data
            }
        };
        this.props.onChange(result);

       /* if(data.min > data.max){
            this.setState({feedback: this.translator.msgMinGreaterMax});
        }
        else{
            this.setState({feedback: ""});
        }*/
       // this.props.onChange(this.props.name, data);  // lifting-state-up
    }   
}