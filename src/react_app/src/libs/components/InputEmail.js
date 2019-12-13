import React, { Component } from 'react';
import { FormControl, InputGroup,  OverlayTrigger, HelpBlock, Tooltip, Glyphicon } from 'react-bootstrap';

export class InputEmail extends Component {
    static defaultProps = {
        name: "",
        value: "",
        placeholder: "",
        onChange: null,
        msgInfo: "If you want to add another email address, separate them by commas. Ex: a@a.com, b@b.com",
        msgInvalidEmail: "Invalid email"
    };
    
    constructor(props){
        super(props);
        
        this.onChange = this.onChange.bind(this);

        this.state = {valid: true}    
    }  
    
    render() {       
        let main = 
        <div>
            <InputGroup>                                                                                            
                <OverlayTrigger placement="right" overlay={<Tooltip id="tooltip">{this.props.msgInfo}</Tooltip>}>
                    <InputGroup.Addon><Glyphicon glyph="info-sign"/></InputGroup.Addon>
                </OverlayTrigger>
                <FormControl name={this.props.name} type="text" value={this.props.value} placeholder={this.props.placeholder} onChange={this.onChange} />
                <FormControl.Feedback/>                                                        
            </InputGroup>
            <HelpBlock>{!this.state.valid ?  this.props.msgInvalidEmail : ""}</HelpBlock>
        </div>
        return (main);
    }   
    
    onChange(event){ 
        let data = {target: {name: this.props.name, value: event.target.value}};
        this.setState({valid: this.checkEmail(event.target.value)});
        this.props.onChange(data)
    }       

    checkEmail(email) {
        //var filter = /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;
        let filter = /^([a-zA-Z0-9_.-])+@(([a-zA-Z0-9-])+.)+([a-zA-Z0-9]{2,4})+$/;
    
        if (!filter.test(email.trim())) {
            return false;
        }
        else{
            return true;
        }
    }
}
