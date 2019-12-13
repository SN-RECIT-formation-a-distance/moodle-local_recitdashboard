import React, { Component } from 'react';
import { FormControl  } from 'react-bootstrap';

export class DlgInput extends Component {
  /*  static type = {
        STRING: 'string',
        INT: 'int'
    };
    
    static defaultProps = {
        show: false,
        title: "",
        label: "",
        help: "",
        type: DlgInput.type.STRING,
        value: "",
        onCancel: null,
        onOk: null,
        cancelDesc: "",
        okDesc: ""
    };

    constructor(props, context){
        super(props, context);
        
        this.onChange = this.onChange.bind(this);
        
        this.state = {value: ""};
    }
    
    componentWillReceiveProps(nextProps) {
        this.setState({value: nextProps.value});
    }

    render() {       
        let bodyContent = 
                <ProForm>
                    <FormItem labelText={this.props.label} helpText={this.props.help}>
                        <FormControl name="field" type="text" value={this.state.value} placeholder="" onChange={this.onChange}/>
                    </FormItem>
                </ProForm>;
                    
        let footerContent =  <ActionBar onOk={() => this.props.onOk(this.state.value)} cancelDesc={this.props.cancelDesc} okDesc={this.props.okDesc} onCancel={this.props.onCancel}></ActionBar>;

        let dialog = <Dialog title={this.props.title} show={this.props.show} 
                        onClose={this.props.onCancel} footerContent={footerContent} bodyContent={bodyContent}>
                    </Dialog>;
            
        return (dialog);
    }
    
    onChange(event){
        this.setState({value: event.target.value});
    }*/
}
