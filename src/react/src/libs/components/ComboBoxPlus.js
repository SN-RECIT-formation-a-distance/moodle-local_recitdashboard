import React, { Component } from 'react';
import Select from 'react-select'
import { JsNx } from '../utils/Utils';

export class ComboBoxPlus extends Component {
    static defaultProps = {        
        onChange: null,    
        value: "",
        name: "",
        disabled: false,
        multiple: false,
        required: false,
        data: {},
        size: 1,
        placeholder: "",
        options: [],
        style: null,
        selectedIndex: -1
    };
    
    constructor(props){
        super(props);
        
        this.onChange = this.onChange.bind(this);
        
        this.state = {value: this.props.value};
    }
    
    render() {     
        let options = this.props.options;

        let val = JsNx.getItem(options, 'value', this.state.value, null);
        for (let o of options){
            o.label = o.text;
        }
        //  spread attributes <div {...this.props}>    
        let spreadAttr = {required: this.props.required, isDisabled: this.props.disabled, size: this.props.size, style: this.props.style, options: options};
        if (this.props.multiple){
            spreadAttr.isMulti = true;
        }

        let main = 
            <Select {...spreadAttr} onChange={this.onChange} defaultValue={val} placeholder={this.props.placeholder}>
            </Select>;            
        return (main);
    }   
    
    onChange(event){
        let value = event.value || "";
        let text = event.label;
        this.setState({value:value});

        this.props.onChange({target:{name: this.props.name, value: value, text: text, data: this.props.data}});
    }   
}
