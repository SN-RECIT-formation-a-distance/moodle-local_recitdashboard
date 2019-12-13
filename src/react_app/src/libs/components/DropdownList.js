import React, { Component } from 'react';
import Select from 'react-select';

export class DropdownList extends Component {
    static defaultProps = {        
        onChange: null,    
        value: null,
        name: "",
        isDisabled: false,
        isMulti: false,
        isSearchable: true,
        isClearable: true,
        placeholder: "",
        options: [],
        style: null
    };
    
    constructor(props){
        super(props);
        
        this.onChange = this.onChange.bind(this);
        this.isOptionDisabled = this.isOptionDisabled.bind(this);
    }
    
    render() {       
        let value = null;

        if(this.props.value === null){
            value = null;
        }
        else if(this.props.isMulti){
            value = [];
            for(let item of this.props.value){
                value.push(this.props.options.find(option => option.value.toString() === item.toString()));
            }
        }
        else{
            value = this.props.options.find(option => option.value.toString() === this.props.value.toString());
        }

        let main = 
            <Select value={value} onChange={this.onChange} options={this.props.options} name={this.props.name} isDisabled={this.props.isDisabled}
                    isMulti={this.props.isMulti} isSearchable={this.props.isSearchable} placeholder={this.props.placeholder} isClearable={this.props.isClearable}
                    isOptionDisabled={(option) => option.disabled === true} style={this.props.style}/>         
        return (main);
    }   
    
    isOptionDisabled(option){
        if(this.props.isOptionDisabled === null){ return false;}

        return this.props.isOptionDisabled(option);
    }

    onChange(event){
        let value = "";
        let label = "";
        let data = null;

        if(event !== null){
            if(this.props.isMulti){
                value = [];
                label = [];
                data = [];
                for(let item of event){
                    value.push(item.value || "");
                    label.push(item.label || "");
                    data.push(item.data || null);
                }
            }
            else{
                value = event.value || "";
                label = event.label || "";
                data = event.data || null;
            }
        }

        let result = {target:{name: this.props.name, value: value, label: label, data: data}}; 
        this.props.onChange(result);
    }   
}