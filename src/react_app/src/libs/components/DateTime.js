import React, { Component } from 'react';
import { Button, Glyphicon, InputGroup, FormControl } from 'react-bootstrap';
import DatePicker from 'react-datepicker';
import en_ca from 'date-fns/locale/en-CA';
import "react-datepicker/dist/react-datepicker.css";

export class DateTime extends Component {
    static defaultProps = {
        locale: en_ca,
        onChange: null,    
        dateFormat: "yyyy-MM-dd HH:mm",
        timeFormat: "HH:mm",
        showTime: true,
        value: null,
        name: "",
        placeholder: "",
        utc: false
    };
    
    constructor(props){
        super(props);
        
        this.onChange = this.onChange.bind(this);
        this.setNow = this.setNow.bind(this);
    }
    
    setNow(){
        let data = {target:{name: this.props.name, value: new Date()}}; 
        this.props.onChange(data);
    }

    render() {        
        let value = this.props.value || "";

        let customInput = <FormControl type="text" className="form-control" style={{marginTop: 4}} />;

        let main = 
            <InputGroup>  
                <InputGroup.Button>
                    <Button bsStyle="primary" title='Set now' onClick={this.setNow}><Glyphicon  glyph="time"/></Button>
                </InputGroup.Button>
                <DatePicker selected={value} onChange={this.onChange} timeFormat={this.props.timeFormat} timeIntervals={5} 
                dateFormat={this.props.dateFormat} placeholderText={this.props.placeholder} locale={this.props.locale}
                customInput={customInput} showTimeSelect={this.props.showTime} showMonthDropdown showYearDropdown disabledKeyboardNavigation/>
            </InputGroup>;                
        return (main);
    }   
    
    onChange(event){ 
        let data = {target:{name: this.props.name, value: event}}; 
        this.props.onChange(data);
    }
}

/*
import ReactDatetime from 'react-datetime';
import Moment from 'moment'
import 'moment/locale/fr';
import 'moment/locale/en-ca';
export class DateTime extends Component {
    static defaultProps = {
        locale: "en-ca",
        onChange: null,    
        showDate: "yyyy-MM-dd",
        showTime: "HH:mm:ss",
        value: null,
        name: "",
        placeholder: "",
        utc: false
    };
    
    constructor(props){
        super(props);
        
        this.onChange = this.onChange.bind(this);
        this.setNow = this.setNow.bind(this);
    }
    //style={{position: "absolute", top: 31, right: 10}} 
    render() {        
        let value = this.props.value || "";
        let main = 
            <InputGroup>  
                <InputGroup.Button>
                    <Button bsStyle="primary" title='Set now' onClick={this.setNow}><Glyphicon  glyph="time"/></Button>
                </InputGroup.Button>
                <ReactDatetime dateFormat={this.props.showDate} timeFormat={this.props.showTime} locale={this.props.locale} value={value} 
                    onChange={this.onChange} inputProps={{placeholder: this.props.placeholder}} open={false}
                    utc={this.props.utc} input={true}></ReactDatetime>                
            </InputGroup>;                
        return (main);
    }   

    
    setNow(){
        let data = {target:{name: this.props.name, value: new Date()}}; 
        this.props.onChange(data);
    }

    onChange(event){ 
        event = event || null;
        let data = {target:{name: this.props.name, value: (event instanceof Moment ? event.toDate() : null)}}; 
        this.props.onChange(data);
    }
}*/