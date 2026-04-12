import React from 'react';
import {Handle, Position} from 'reactflow';


const Source = (props: any) => {
    const { truth, style, ...restProps } = props;
    
    return (
        <Handle {...restProps} type="source" position={Position.Right} style={{
            height: '15px',
            width: '15px',
            background: truth ? 'red':'gray',
            borderWidth: '2px',
            borderColor: 'black',
            ...style ?? {}
        }}
        ></Handle>
    );
};

export default Source;
