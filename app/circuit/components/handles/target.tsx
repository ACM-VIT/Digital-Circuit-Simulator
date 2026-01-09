import React, {useMemo} from 'react';
import {Edge, Handle, Position, useStore} from 'reactflow';

const selector = (s: { nodeInternals: any; edges: any; }) => ({
    nodeInternals: s.nodeInternals,
    edges: s.edges,
});

const Target = (props: any) => {
    const {edges} = useStore(selector);

    const isHandleConnectable = useMemo(() => {

        return edges.filter((i: Edge) => i.targetHandle === props.id).length < 1;

    }, [edges, props.id]);

    const { truth, style, ...restProps } = props;

    return (
        <Handle {...restProps} isConnectable={isHandleConnectable} type="target" position={Position.Left} style={{
            height: '15px',
            width: '15px',
            background: truth ? 'red' : 'gray',
            borderWidth: '2px',
            borderColor: 'black',
            ...style ?? {}
        }}
        ></Handle>
    );
};

export default Target;
