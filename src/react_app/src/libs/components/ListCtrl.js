import React, { Component } from 'react';

export class ListCtrl extends Component {
    static defaultProps = {
        name: "",
        values: [],
        children: null,
        onChange: null
    };

    componentWillReceiveProps(nextProps){
        this.setState({values: nextProps.values});
    }
    
    constructor(props){
        super(props);
        
        this.renderChildren = this.renderChildren.bind(this)
        this.onSelectItem = this.onSelectItem.bind(this);
    }
    
    render() {       
        return (<div className="ListCtrl">{this.renderChildren()}</div>);
    }
    
    renderChildren() {
        return React.Children.map(this.props.children, child => {
            return React.cloneElement(child, {
                onClick: this.onSelectItem,
                selected: this.props.values.includes(child.props.value)
            });
        });
    }
    
    onSelectItem(selected, value){
        let data = this.props.values.nxCopy(); // copy the data to not alter the props
        
        let index = data.indexOf(value);
        
        if((index >= 0) && (!selected)){ // value already exists and the user deselect it so we need to remove it from array
            data.splice(index, 1);
        }
        else if((index < 0) && (selected)){ // the value not exists and the user select it so we need to add it to array
            data.push(value);
        }
        
        let result = {
            target: {
                name: this.props.name, 
                value:  data
            }
        };

        this.props.onChange(result);
    }
}

export class ListCtrlItem extends Component {
    static defaultProps = {
        selected: false,
        text: "",
        value: "",
        onClick: null
    };
    
    constructor(props){
        super(props);
        
        this.onClick = this.onClick.bind(this);
    }
    
    render() {       
        return (
                <div className="ListCtrlItem" onClick={this.onClick}>
                    <input type="checkbox" checked={this.props.selected} onChange={this.onClick} name="selected" />
                    <span>{this.props.text}</span>
                </div>
        );
    }
    
    onClick(){
        this.props.onClick(!this.props.selected, this.props.value, this.props.text);
    }
};
