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

  const getHandleOffset = (index: number, total: number) => {
    if (total <= 1) return 50;

    if (isCombinational) {
      const topPadding = 15;
      const bottomPadding = 70;
      const spacing = (bottomPadding - topPadding) / (total - 1);
      return topPadding + index * spacing;
    } else {
      const spread = 70;
      const start = (100 - spread) / 2;
      return start + (spread * index) / (total - 1);
    }
  };

  if (isCombinational) {
    return (
      <div
        className="relative flex flex-col w-[200px] min-h-[180px] rounded-[20px] border-2 text-white shadow-lg"
        style={{
          background: `linear-gradient(335deg, rgba(8, 6, 12, 0.95) 0%, rgba(19, 14, 25, 0.88) 45%, ${accentColor} 100%)`,
          borderColor: accentColor,
        }}
      >
        <span className="mt-8 text-lg font-bold text-center">{data.name}</span>

        <div className="flex-1 flex justify-between px-4 py-4">
          {/* Inputs */}
          <div className="flex flex-col justify-center gap-3">
            {inputs.map((input: string, idx: number) => (
              <Target
                key={input}
                id={`${id}-i-${input}`}
                title={input}
                style={{
                  top: `${getHandleOffset(idx, inputs.length)}%`,
                }}
              />
            ))}
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

        <button
          type="button"
          onClick={() => data?.remove?.()}
          className="nodrag absolute bottom-2 right-2 rounded-full border border-white/10 bg-black/45 p-1 transition hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-300"
          aria-label="Delete gate node"
        >
          <Image
            src="/trash.svg"
            alt="Delete"
            width={14}
            height={14}
            className="filter invert"
          />
        </button>
      </div>
    );
  } else {
    return (
      <div
        className={`relative flex min-w-[170px] max-w-[190px] flex-col gap-2.5 rounded-[24px] border px-4 py-4 text-slate-100 shadow-[0_10px_22px_rgba(0,0,0,0.42)] ${moghul.className}`}
        style={{
          background: `linear-gradient(335deg, rgba(8, 6, 12, 0.95) 0%, rgba(19, 14, 25, 0.88) 45%, ${accentColor} 100%)`,
          borderColor: accentColor,
        }}
      >
        <span className="text-[9px] uppercase tracking-[0.35em] text-slate-200/80">
          Gate
        </span>
        <span className="text-base font-semibold tracking-[0.32em] uppercase text-amber-100 drop-shadow-sm">
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
        <button
          type="button"
          onClick={() => data?.remove?.()}
          className="nodrag absolute bottom-2 right-2 rounded-full border border-white/10 bg-black/45 p-1 transition hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-300"
          aria-label="Delete gate node"
        >
          <Image
            src="/trash.svg"
            alt="Delete"
            width={14}
            height={14}
            className="filter invert"
          />
        </button>
      </div>
    );
  }
}

export default Gate;
