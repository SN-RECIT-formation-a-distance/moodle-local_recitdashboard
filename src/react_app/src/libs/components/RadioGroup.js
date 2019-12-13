import React, { Component } from 'react';
import { ButtonToolbar, ButtonGroup, Button } from 'react-bootstrap';

export class RadioGroup extends Component {
    static defaultProps = {
        name: "",
        selectedValue: "",
        onChange: null,
        children: []
    };
    
    constructor(props){
        super(props);
        
        this.onChange = this.onChange.bind(this);
        this.renderChildren = this.renderChildren.bind(this);
    }
    
    renderChildren() {
        return React.Children.map(this.props.children, child => {
            return React.cloneElement(child, {
              onClick: this.onChange,
              selected: this.props.selectedValue === child.props.value
            });
        });
    }
    
    onChange(value){
        let data = {target: {name: this.props.name, value: value}};
        this.props.onChange(data);
    }
    
    render() {
        return (
                <ButtonToolbar className="RadioGroup">
                    <ButtonGroup>
                        {this.renderChildren()}
                    </ButtonGroup>
                </ButtonToolbar>
      );
    }   
}

export class RadioItem extends Component {
    static defaultProps = {
        text: "",
        value: "",
        onClick: null,
        selected: false
    };

    constructor(props){
        super();
    
        this.onClick = this.onClick.bind(this);    
    }

    render() {
        return (
                <Button className="RadioItem" bsStyle={(this.props.selected ? 'primary' : 'default')} data-selected={(this.props.selected ? 1 : 0)} type="button" onClick={this.onClick}>
                    {this.props.text}
                </Button>
      );
    }
    
    onClick(){
        this.props.onClick(this.props.value);
    }
};