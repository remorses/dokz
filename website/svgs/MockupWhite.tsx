import * as React from "react";

function SvgMockupWhite(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 1391 762" {...props}>
      <defs>
        <filter
          x="-.8%"
          y="-1.2%"
          width="101.5%"
          height="102.3%"
          filterUnits="objectBoundingBox"
          id="mockup_white_svg__c"
        >
          <feGaussianBlur
            stdDeviation={4}
            in="SourceAlpha"
            result="shadowBlurInner1"
          />
          <feOffset dy={-9} in="shadowBlurInner1" result="shadowOffsetInner1" />
          <feComposite
            in="shadowOffsetInner1"
            in2="SourceAlpha"
            operator="arithmetic"
            k2={-1}
            k3={1}
            result="shadowInnerInner1"
          />
          <feColorMatrix
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.0248033217 0"
            in="shadowInnerInner1"
            result="shadowMatrixInner1"
          />
          <feGaussianBlur
            stdDeviation={1.5}
            in="SourceAlpha"
            result="shadowBlurInner2"
          />
          <feOffset in="shadowBlurInner2" result="shadowOffsetInner2" />
          <feComposite
            in="shadowOffsetInner2"
            in2="SourceAlpha"
            operator="arithmetic"
            k2={-1}
            k3={1}
            result="shadowInnerInner2"
          />
          <feColorMatrix
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.136636801 0"
            in="shadowInnerInner2"
            result="shadowMatrixInner2"
          />
          <feMerge>
            <feMergeNode in="shadowMatrixInner1" />
            <feMergeNode in="shadowMatrixInner2" />
          </feMerge>
        </filter>
        <filter
          x="-1.1%"
          y="-68.2%"
          width="102.2%"
          height="236.4%"
          filterUnits="objectBoundingBox"
          id="mockup_white_svg__e"
        >
          <feGaussianBlur
            stdDeviation={9}
            in="SourceAlpha"
            result="shadowBlurInner1"
          />
          <feOffset dy={12} in="shadowBlurInner1" result="shadowOffsetInner1" />
          <feComposite
            in="shadowOffsetInner1"
            in2="SourceAlpha"
            operator="arithmetic"
            k2={-1}
            k3={1}
            result="shadowInnerInner1"
          />
          <feColorMatrix
            values="0 0 0 0 0.88627451 0 0 0 0 0.888083393 0 0 0 0 0.890196078 0 0 0 1 0"
            in="shadowInnerInner1"
          />
        </filter>
        <path
          d="M166 0h1057c18.225 0 33 14.775 33 33v679c0 12.15-9.85 22-22 22H155c-12.15 0-22-9.85-22-22V33c0-18.225 14.775-33 33-33z"
          id="mockup_white_svg__b"
        />
        <path
          d="M303.477 740.075h776.702c195.565 0 299.171 7.333 310.821 22V763H0v-.925c31.315-14.667 132.474-22 303.477-22z"
          id="mockup_white_svg__d"
        />
        <linearGradient
          x1="50%"
          y1="100%"
          x2="50%"
          y2="0%"
          id="mockup_white_svg__a"
        >
          <stop stopColor="#FFF" offset="0%" />
          <stop stopColor="#F1F2F4" offset="100%" />
        </linearGradient>
      </defs>
      <g fill="none" fillRule="evenodd">
        <use
          fill="url(#mockup_white_svg__a)"
          xlinkHref="#mockup_white_svg__b"
        />
        <use
          fill="#000"
          filter="url(#mockup_white_svg__c)"
          xlinkHref="#mockup_white_svg__b"
        />
        <path
          d="M182 33h1025c10.493 0 19 8.507 19 19v626c0 10.493-8.507 19-19 19H182c-10.493 0-19-8.507-19-19V52c0-10.493 8.507-19 19-19z"
          fill="transparent"
        />
        <path d="M3 729h1385a3 3 0 013 3v9H0v-9a3 3 0 013-3z" fill="#FFF" />
        <g transform="matrix(1 0 0 -1 0 1502)">
          <use fill="#FFF" xlinkHref="#mockup_white_svg__d" />
          <use
            fill="#000"
            filter="url(#mockup_white_svg__e)"
            xlinkHref="#mockup_white_svg__d"
          />
        </g>
      </g>
    </svg>
  );
}

export default SvgMockupWhite;
