import React, { Component } from 'react';
import {Form} from 'react-bootstrap';

export class RichEditor extends Component {
    static defaultProps = {
        onChange: null,    
        value: "",
        name: "",
        nbRows: 5
    };
    
    constructor(props){
        super(props);
        
        this.onChange = this.onChange.bind(this);
    }
    
    render() {    
        let main = <Form.Control as="textarea" rows={this.props.nbRows} onChange={this.onChange} value={this.props.value || ""} />;

        return (main);
    }   

    onChange(event){ 
        let data = {target:{name: this.props.name, value: event.target.value}}; 
        this.props.onChange(data);
    }   
}