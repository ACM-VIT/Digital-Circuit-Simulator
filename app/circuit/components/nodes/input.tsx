import React from 'react';
import Image from 'next/image';
import localFont from 'next/font/local';
import {NodeProps} from "reactflow";
import Source from "@/app/circuit/components/handles/source";

const moghul = localFont({
    src: '../../../../public/font/Moghul.ttf',
    variable: '--font-moghul'
});

function Input(props: NodeProps) {
    const {data, id} = props;
    const isOn = Boolean(data?.value);

    return (
        <div 
            className="relative flex h-[130px] w-[130px] min-w-[120px] flex-col items-center justify-center gap-1.5 rounded-[999px] border border-[#5f2c30] bg-gradient-to-b from-[#3d1e21] to-[#1a1011] p-4 text-white shadow-[0_10px_20px_rgba(0,0,0,0.4)]"
            onContextMenu={(e) => data?.onContextMenu?.(e)}
            onDoubleClick={(e) => data?.onDoubleClick?.(e)}
        >
            <div className={`flex flex-col items-center gap-1 text-[9px] uppercase tracking-[0.35em] text-amber-200/75 ${moghul.className}`}>
                <Image src={isOn ? '/bulbon.svg' : '/bulboff.svg'} alt={isOn ? 'Input on' : 'Input off'} width={26} height={26} />
                <span>Input</span>
            </div>
            <span 
                className={`text-xs font-semibold tracking-[0.25em] text-amber-50 ${moghul.className} cursor-pointer hover:text-amber-100 transition-colors`}
                onDoubleClick={(e) => {
                    e.stopPropagation();
                    data?.editLabel?.();
                }}
            >
                {data?.label}
            </span>
            <button
                type="button"
                onClick={() => data?.toggle?.()}
                aria-pressed={isOn}
                className="nodrag rounded-full transition-transform focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-300/80 hover:scale-105 active:scale-95"
            >
                <Image
                    src={isOn ? '/on.svg' : '/off.svg'}
                    alt={isOn ? 'Input is on' : 'Input is off'}
                    width={40}
                    height={40}
                />
            </button>
            <div className="absolute right-[-18px] top-1/2 -translate-y-1/2">
                <Source
                    truth={isOn}
                    type="source"
                    id={`${id}-o`}
                />
            </div>
        </div>
    );
}

export default Input;