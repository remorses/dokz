import * as React from "react";

function SvgWebpageMockup(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 940 623"
      className="webpage_mockup_svg__pdxBrowser"
      {...props}
    >
      <g fill="none" fillRule="evenodd">
        <rect fill="#FFF" width={940} height={623} rx={9} />
        <path d="M0 36h940V9a9 9 0 00-9-9H9a9 9 0 00-9 9v27z" fill="#DFE1E6" />
        <circle fill="#FD6157" cx={18} cy={18} r={6} />
        <circle fill="#FDBD04" cx={38} cy={18} r={6} />
        <circle fill="#30CA2E" cx={58} cy={18} r={6} />
      </g>
    </svg>
  );
}

export default SvgWebpageMockup;
