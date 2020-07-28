import React from "react";

function SvgLogo(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 63 73" {...props}>
      <g fill="none" fillRule="evenodd">
        <g fillRule="nonzero">
          <path
            d="M13.456 64C10.783 64 9 62 9 59s2.228-5 4.456-5h44.47c-.269 2.538-.245 7.56.074 10H13.456z"
            fill="#858585"
            opacity={0.4}
          />
          <path
            d="M13.5 54.75h46.125c1.864 0 3.375-1.532 3.375-3.422V4.562C63 2.042 60.985 0 58.5 0h-45C6.044 0 0 6.128 0 13.688v45.624C0 66.873 6.044 73 13.5 73h46.125C61.489 73 63 71.468 63 69.578v-2.281c0-1.89-1.511-3.422-3.375-3.422H13.5c-2.7 0-4.5-1.825-4.5-4.563 0-2.737 2.25-4.562 4.5-4.562z"
            fill="#2D3748"
          />
        </g>
        <path
          stroke="#FFF"
          strokeWidth={3}
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M27 11.5H14M47.429 23.086H14"
        />
      </g>
    </svg>
  );
}

export default SvgLogo;
