import React from 'react';
import Image from 'next/image';
import localFont from 'next/font/local';
import {NodeProps} from "reactflow";
import Target from "@/app/circuit/components/handles/target";

const moghul = localFont({
    src: '../../../../public/font/Moghul.ttf',
    variable: '--font-moghul'
});

function Output(props: NodeProps) {
    const {data, id} = props;
    const isOn = Boolean(data?.value);

    return (
        <div
            className={`relative flex h-[125px] w-[125px] min-w-[115px] flex-col items-center justify-center gap-2.5 rounded-full border border-[#274060] px-4 py-4 text-white shadow-[0_9px_20px_rgba(0,0,0,0.4)] ${moghul.className}`}
            onContextMenu={(e) => data?.onContextMenu?.(e)}
            onDoubleClick={(e) => data?.onDoubleClick?.(e)}
            style={{
                background: isOn
                    ? 'linear-gradient(160deg, #233a63 0%, #0f1b33 65%, #080b13 100%)'
                    : 'linear-gradient(160deg, #1c2537 0%, #0d111d 70%, #05070b 100%)',
                boxShadow: isOn
                    ? '0 12px 28px rgba(27, 57, 120, 0.35), 0 8px 18px rgba(0, 0, 0, 0.55)'
                    : '0 10px 22px rgba(0, 0, 0, 0.45)'
            }}
        >
            <span className="text-[9px] uppercase tracking-[0.35em] text-emerald-200/80">Output</span>
            <Image
                src={isOn ? '/bulbon.svg' : '/bulboff.svg'}
                alt={isOn ? 'Output on' : 'Output off'}
                width={46}
                height={46}
            />
            <span 
                className="text-xs font-semibold tracking-[0.25em] text-emerald-100/90 cursor-pointer hover:text-emerald-50 transition-colors"
                onDoubleClick={(e) => {
                    e.stopPropagation();
                    data?.editLabel?.();
                }}
            >
                {data?.label}
            </span>
            <div className="absolute left-[-18px] top-1/2 -translate-y-1/2">
                <Target
                    truth={isOn}
                    id={`${id}-i`}
                />
            </div>
        </div>
    );
}

export default Output;