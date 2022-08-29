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
        
    }
    
    render() {     
        let options = this.props.options;

        let val = null;
        for (let o of options){
            o.label = o.text;
            if (o.value.toString() == this.props.value.toString()){
                val = o;
            }
        }
        //  spread attributes <div {...this.props}>    
        let spreadAttr = {required: this.props.required, isDisabled: this.props.disabled, size: this.props.size, style: this.props.style, options: options};
        if (this.props.multiple){
            spreadAttr.isMulti = true;
        }

        let main = 
            <Select {...spreadAttr} onChange={this.onChange} value={val} placeholder={this.props.placeholder}>
            </Select>;            
        return (main);
    }   
    
    onChange(event){
        let value = event.value || "";
        let text = event.label;
        
        this.props.onChange({target:{name: this.props.name, value: value, text: text, data: this.props.data}});
    }   
}
