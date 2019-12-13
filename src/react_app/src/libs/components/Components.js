//////////////////////////////////////////////////
// Note: the "export *" will only export the classes marqued with "export" in their definition
//////////////////////////////////////////////////

import "./css/components.scss";

export * from './ComboBox';
export * from './DataGrid';
export * from './DateTimeInterval'; 
export * from './DateTime';
export * from './DlgInput';
export * from './DropdownList';
export * from './Feedback';
export * from './InputEmail';
export * from './InputNumber';
export * from './ListCtrl';
export * from './Loading';
export * from './NumberInterval';
export * from './RadioGroup';
export * from './Switch';
export * from './RichEditor';
export * from './ToggleButtons';

export default class Components{
    static version = 1.0;

    static assets = {
        
    };
} 