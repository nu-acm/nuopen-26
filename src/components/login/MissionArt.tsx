/** A quiet targeting display, drawn as SVG so the account flow needs no 3D download. */
export function MissionArt() {
  return (
    <div className="mission-art" aria-hidden="true">
      <svg viewBox="0 0 400 320" fill="none">
        <defs>
          <radialGradient id="station-light">
            <stop stopColor="currentColor" stopOpacity=".12" />
            <stop offset="1" stopColor="currentColor" stopOpacity=".02" />
          </radialGradient>
          <clipPath id="station-clip">
            <circle cx="200" cy="160" r="96" />
          </clipPath>
        </defs>
        <g stroke="currentColor">
          <circle
            className="mission-orbit"
            cx="200"
            cy="160"
            r="128"
            strokeDasharray="2 10"
            opacity=".3"
          />
          <circle cx="200" cy="160" r="110" opacity=".16" />
          <g className="mission-radar" opacity=".55">
            <path d="M200 160V44" />
            <path d="M200 160 166 49 200 44Z" fill="currentColor" fillOpacity=".08" stroke="none" />
          </g>
          <path
            d="M200 16v24m0 240v24M56 160H32m336 0h-24M78 53H62v16m260-16h16v16M62 251v16h16m260-16v16h-16"
            opacity=".6"
          />
          <circle cx="200" cy="160" r="96" fill="url(#station-light)" opacity=".8" />
          <g clipPath="url(#station-clip)" opacity=".45">
            <path d="M99 157h202v7H99m5-23h192M110 181h181M118 198h168M125 214h150M143 231h116M126 109h63m-71 16h66M146 94h43M165 80h60M175 64v235M204 164v91M230 164v91M250 175v65M144 175v65M121 144v53M271 144v53" />
            <path
              d="M113 173h45m9 16h32m-77 19h42m57-35h51m-67 38h34M194 100v49m14-65v20m-53 24v17"
              strokeWidth="3"
            />
          </g>
          <ellipse
            cx="235"
            cy="119"
            rx="23"
            ry="26"
            transform="rotate(-30 235 119)"
            fill="var(--space)"
          />
          <ellipse cx="235" cy="119" rx="15" ry="18" transform="rotate(-30 235 119)" opacity=".5" />
          <path d="m224 103 11 16 15 12m-33-11 18-1 1-24m-1 24-11 19" opacity=".5" />
          <path d="M200 149v22m-11-11h22" opacity=".8" />
        </g>
      </svg>
    </div>
  );
}
