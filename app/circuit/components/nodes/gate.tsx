import React from "react";
import Image from "next/image";
import localFont from "next/font/local";
import { NodeProps } from "reactflow";
import Target from "@/app/circuit/components/handles/target";
import Source from "@/app/circuit/components/handles/source";

const moghul = localFont({
  src: "../../../../public/font/Moghul.ttf",
  variable: "--font-moghul",
});

function Gate(props: NodeProps) {
  const { data, id } = props;
  const inputs: string[] = data?.inputs ?? [];
  const outputKeys: string[] = data?.outputs ? Object.keys(data.outputs) : [];
  const accentColor: string = data?.color ?? "#42345f";
  const isCombinational = data?.isCombinational ?? false;

  // Calculate dynamic height based on the number of inputs/outputs
  const maxIO = Math.max(inputs.length, outputKeys.length);
  // Formula: 100px (header + padding) + 40px per I/O, minimum 180px
  const dynamicHeight = Math.max(180, 100 + maxIO * 40);

  const getHandleOffset = (index: number, total: number) => {
    if (total <= 1) return 50;

    if (isCombinational) {
      const topPadding = 15;
      const bottomPadding = 70;
      const spacing = (bottomPadding - topPadding) / (total - 1);
      return topPadding + index * spacing;
    } else {
      // For regular gates
      if (total === 2) {
        // Keep original spacing for 2 inputs
        const spread = 70;
        const start = (100 - spread) / 2;
        return start + (spread * index) / (total - 1);
      } else {
        // For 3+ inputs, use more even spacing
        const topPadding = 20;
        const bottomPadding = 80;
        const spacing = (bottomPadding - topPadding) / (total - 1);
        return topPadding + index * spacing;
      }
    }
  };

  if (isCombinational) {
    return (
      <div
        className="relative flex flex-col w-[200px] rounded-[20px] border-2 text-white shadow-lg"
        onContextMenu={(e) => data?.onContextMenu?.(e)}
        onDoubleClick={(e) => data?.onDoubleClick?.(e)}
        style={{
          background: `linear-gradient(335deg, rgba(8, 6, 12, 0.95) 0%, rgba(19, 14, 25, 0.88) 45%, ${accentColor} 100%)`,
          borderColor: accentColor,
          minHeight: `${dynamicHeight}px`,
        }}
      >
        <span 
          className="mt-8 text-lg font-bold text-center cursor-pointer hover:text-gray-200 transition-colors"
          onDoubleClick={(e) => {
            e.stopPropagation();
            data?.editLabel?.();
          }}
        >
          {data.name}
        </span>

        <div className="flex-1 flex justify-between px-4 py-4">
          {/* Inputs */}
          <div className="flex flex-col justify-center gap-3 relative">
            {inputs.map((input: string, idx: number) => {
              const offset = getHandleOffset(idx, inputs.length);
              
              return (
                <div
                  key={input}
                  className="absolute left-0 flex items-center gap-1"
                  style={{
                    top: `${offset}%`,
                    transform: "translateY(-50%)",
                  }}
                >
                  {/* Move handle slightly outside to the left */}
                  <div className="translate-x-[-16px]">
                    <Target
                      id={`${id}-i-${input}`}
                      title={input}
                    />
                  </div>
                  
                  {/* Label */}
                  <span className="text-xs text-white whitespace-nowrap ml-1">
                    {input}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="relative w-full">
            {outputKeys.map((output: string, idx: number) => {
              const offset = getHandleOffset(idx, outputKeys.length);

              return (
                <div
                  key={output}
                  className="absolute right-0 flex items-center gap-1"
                  style={{
                    top: `${offset}%`,
                    transform: "translateY(-50%)",
                  }}
                >
                  {/* Label */}
                  <span className="text-xs text-white whitespace-nowrap mr-1">
                    {output}
                  </span>

                  {/* Move handle slightly outside */}
                  <div className="translate-x-[16px]">
                    <Source id={`${id}-o-${output}`} title={output} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  } else {
    // Calculate dynamic height for regular gates
    // Base height for 2 inputs, then +40px for each additional input starting from 3
    const regularGateHeight = inputs.length <= 2 ? undefined : `${140 + (inputs.length - 2) * 40}px`;
    
    return (
      <div
        className={`relative flex min-w-[170px] max-w-[190px] flex-col gap-2.5 rounded-[24px] border px-4 py-4 text-slate-100 shadow-[0_10px_22px_rgba(0,0,0,0.42)] ${moghul.className}`}
        onContextMenu={(e) => data?.onContextMenu?.(e)}
        onDoubleClick={(e) => data?.onDoubleClick?.(e)}
        style={{
          background: `linear-gradient(335deg, rgba(8, 6, 12, 0.95) 0%, rgba(19, 14, 25, 0.88) 45%, ${accentColor} 100%)`,
          borderColor: accentColor,
          minHeight: regularGateHeight,
        }}
      >
        <span className="text-[9px] uppercase tracking-[0.35em] text-slate-200/80">
          {data?.gateType || data?.name} Gate
        </span>
        <span 
          className="text-base font-semibold tracking-[0.32em] uppercase text-amber-100 drop-shadow-sm cursor-pointer hover:text-amber-50 transition-colors"
          onDoubleClick={(e) => {
            e.stopPropagation();
            data?.editLabel?.();
          }}
        >
          {data?.name}
        </span>

        {inputs.map((input: string, idx: number) => (
          <Target
            truth={data?.inputvalues?.[input]?.value}
            title={input}
            key={input}
            id={`${id}-i-${input}`}
            style={{
              top: `${getHandleOffset(idx, inputs.length)}%`,
            }}
          />
        ))}

        {outputKeys.map((output: string, idx: number) => (
          <Source
            truth={data?.outputs?.[output]?.value}
            title={output}
            key={output}
            id={`${id}-o-${output}`}
            style={{
              top: `${getHandleOffset(idx, outputKeys.length)}%`,
            }}
          />
        ))}
      </div>
    );
  }
}

export default Gate;
