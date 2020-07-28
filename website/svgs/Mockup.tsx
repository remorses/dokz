import React from "react";

function SvgMockup(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 1391 763" {...props}>
      <defs>
        <linearGradient x1="50%" y1="100%" x2="50%" y2="0%" id="mockup_svg__c">
          <stop stopColor="#282C2F" offset="0%" />
          <stop stopColor="#181A1C" offset="100%" />
        </linearGradient>
        <filter
          x="-.3%"
          y="-.5%"
          width="100.6%"
          height="101%"
          filterUnits="objectBoundingBox"
          id="mockup_svg__b"
        >
          <feMorphology
            radius={2}
            in="SourceAlpha"
            result="shadowSpreadInner1"
          />
          <feGaussianBlur
            stdDeviation={2.5}
            in="shadowSpreadInner1"
            result="shadowBlurInner1"
          />
          <feOffset in="shadowBlurInner1" result="shadowOffsetInner1" />
          <feComposite
            in="shadowOffsetInner1"
            in2="SourceAlpha"
            operator="arithmetic"
            k2={-1}
            k3={1}
            result="shadowInnerInner1"
          />
          <feColorMatrix
            values="0 0 0 0 0.125490196 0 0 0 0 0.129411765 0 0 0 0 0.141176471 0 0 0 0.721727491 0"
            in="shadowInnerInner1"
          />
        </filter>
        <path
          d="M166 0h1057c18.225 0 33 14.775 33 33v679c0 12.15-9.85 22-22 22H155c-12.15 0-22-9.85-22-22V33c0-18.225 14.775-33 33-33z"
          id="mockup_svg__a"
        />
      </defs>
      <g fill="none" fillRule="evenodd">
        <use fill="#282C2F" xlinkHref="#mockup_svg__a" />
        <use
          fill="#000"
          filter="url(#mockup_svg__b)"
          xlinkHref="#mockup_svg__a"
        />
        <path
          d="M182 31h1025c10.493 0 19 8.507 19 19v626c0 10.493-8.507 19-19 19H182c-10.493 0-19-8.507-19-19V50c0-10.493 8.507-19 19-19z"
          fill="#323639"
        />
        <path
          d="M303.477 740.075h776.702c195.565 0 299.171 7.333 310.821 22V763H0v-.925c31.315-14.667 132.474-22 303.477-22z"
          fill="url(#mockup_svg__c)"
          transform="matrix(1 0 0 -1 0 1503.075)"
        />
        <path d="M3 729h1385a3 3 0 013 3v9H0v-9a3 3 0 013-3z" fill="#323639" />
      </g>
    </svg>
  );
}

export default SvgMockup;
