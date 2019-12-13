import React, { Component } from 'react';

export class Switch extends Component {
    static defaultProps = {
        name: "",
        onDesc: "",
        offDesc: "",
        value: false,
        onChange: null
    };
    
    constructor(props){
        super(props);
        
        this.onChange = this.onChange.bind(this);
        
        this.state = {selected: false};
    }
    
    onChange(){
        let event = {
            target: {
                name: this.props.name, 
                value:  (this.props.value === 1 ? 0 : 1)
            }
        };
        this.props.onChange(event);
    }
    
    render() {    
        let value = parseInt(this.props.value, 10);
        
        if(isNaN(value)){
            value = 0;
        }
        // tabindex = 0 - the element can be focused via the keyboard and falls into the tabbing flow of the document.
       
        let desc = null;
        if(value === 1){
            desc = (this.props.onDesc.length > 0 ? this.props.onDesc : 'ON');
        }
        else{
            desc = (this.props.offDesc.length > 0 ? this.props.offDesc : 'OFF');
        }
            
        let main = 
                <div className="Switch">
                    <div className="SwitchCtrl" onClick={this.onChange} tabIndex="0" data-value={value}>
                        <span className="Description">{desc}</span>
                        <span className="Toggle"></span>
                    </div>
                    <div className="Spacer"></div>
                </div>;
        
        return (main);
    }
}
