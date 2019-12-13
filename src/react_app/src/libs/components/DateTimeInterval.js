import React, { Component } from 'react';
import { Button, Glyphicon, InputGroup, FormControl, Row, Col } from 'react-bootstrap';
import DatePicker from 'react-datepicker';
import en_ca from 'date-fns/locale/en-CA';
import "react-datepicker/dist/react-datepicker.css";

export class DateTimeInterval extends Component {
    static defaultProps = {
        locale: en_ca,
        onChange: null,    
        dateFormat: "yyyy-MM-dd HH:mm",
        timeFormat: "HH:mm",
        showTime: true,
        valueStart: null,
        valueEnd: null,
        nameStart: "",
        nameEnd: "",
        placeholder: "",
        utc: false
    };
    
    constructor(props){
        super(props);
        
        this.onChange = this.onChange.bind(this);
        this.setNow = this.setNow.bind(this);
    }
    
    setNow(name){
        let data = {target:{name: name, value: new Date()}}; 
        this.props.onChange(data);
    }

    render() {        
        let valueStart = this.props.valueStart || "";
        let valueEnd = this.props.valueEnd || "";

        let customInput = <FormControl type="text" className="form-control" style={{marginTop: 4}} />;

        let main = 
            <Row>
                <Col  xs={6} sm={6} md={6} lg={6}>
                    <InputGroup>  
                        <InputGroup.Button>
                            <Button bsStyle="primary" title='Set now' onClick={() => this.setNow(this.props.nameStart)}><Glyphicon  glyph="time"/></Button>
                        </InputGroup.Button>
                        <DatePicker selected={valueStart} onChange={(event) => this.onChange(event, this.props.nameStart)} timeFormat={this.props.timeFormat} timeIntervals={5} 
                        dateFormat={this.props.dateFormat} placeholderText={this.props.placeholder} locale={this.props.locale}
                        customInput={customInput} showTimeSelect={this.props.showTime} showMonthDropdown showYearDropdown disabledKeyboardNavigation
                        selectsStart     startDate={valueStart}    endDate={valueEnd} />
                    </InputGroup>
                </Col>
                <Col  xs={6} sm={6} md={6} lg={6}>
                    <InputGroup>  
                        <InputGroup.Button>
                            <Button bsStyle="primary" title='Set now' onClick={() => this.setNow(this.props.nameEnd)}><Glyphicon  glyph="time"/></Button>
                        </InputGroup.Button>
                        <DatePicker selected={valueEnd} onChange={(event) => this.onChange(event, this.props.nameEnd)} timeFormat={this.props.timeFormat} timeIntervals={5} 
                        dateFormat={this.props.dateFormat} placeholderText={this.props.placeholder} locale={this.props.locale}
                        customInput={customInput} showTimeSelect={this.props.showTime} showMonthDropdown showYearDropdown disabledKeyboardNavigation
                        selectsEnd     startDate={valueStart}    endDate={valueEnd} minDate={valueStart}/>
                    </InputGroup>
                </Col>
            </Row>
            ;                
        return (main);
    }   
    
    onChange(event, name){ 
        let data = {target:{name: name, value: event}}; 
        this.props.onChange(data);
    }
}

/*import Datetime from 'react-datetime';
import Moment from 'moment'
import 'moment/locale/fr';
import 'moment/locale/en-ca';

export class DateTimeInterval extends Component {
    static defaultProps = {
        locale: "en",
        onChange: null,    
        showDate: true,
        showTime: true,
        start: {value: null, name: "", placeholder:""},
        end: {value: null, name: "", placeholder:""}
    };
    
    constructor(props){
        super(props);
        
        this.onChange = this.onChange.bind(this);
        this.validateDateEnd = this.validateDateEnd.bind(this);
    }
    
    render() {        
        let container = {width: "calc(50% - 10px)", display: "inline-block", marginRight: 10};
        
        let main = 
                <div>
                    <div style={container}>
                        <Datetime dateFormat={this.props.showDate} timeFormat={this.props.showTime} locale={this.props.locale} value={this.props.start.value} 
                                onChange={(event) => this.onChange(event, this.props.start.name)} inputProps={{placeholder: this.props.start.placeholder}}
                                utc={false}></Datetime>
                    </div>
                    <div style={container}>
                        <Datetime dateFormat={this.props.showDate} timeFormat={this.props.showTime}  locale={this.props.locale} value={this.props.end.value}
                            onChange={(event) => this.onChange(event, this.props.end.name)}  inputProps={{placeholder: this.props.end.placeholder}} utc={false}
                            isValidDate={this.validateDateEnd}></Datetime>
                    </div>
                </div>;
        return (main);
    }   
    
    onChange(event, prop){ 
        if(event instanceof Moment){
           // this.props.onChange(prop, event.toDate());  // lifting-state-up
            //let data = {target:{name: prop, value: event.toDate()}};
            let data = {target:{name: prop, value: event.toDate()}}; 
            this.props.onChange(data);
        }
    }   
    
    validateDateEnd(current){
        let startDate = Datetime.moment(this.props.start.value);
        return current.isAfter( startDate );
    }

}*/