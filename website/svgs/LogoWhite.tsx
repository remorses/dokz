import * as React from "react";

function SvgLogoWhite(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 63 73" {...props}>
      <g fill="none" fillRule="evenodd">
        <g fill="#FFF" fillRule="nonzero">
          <path
            d="M13.456 64C10.783 64 9 62 9 59s2.228-5 4.456-5h44.47c-.269 2.538-.245 7.56.074 10H13.456z"
            fillOpacity={0.382}
            opacity={0.4}
          />
          <path
            d="M13.5 2.5c-3.034 0-5.779 1.25-7.766 3.265-2 2.027-3.234 4.83-3.234 7.923v45.624c0 3.094 1.234 5.896 3.234 7.923C7.721 69.251 10.466 70.5 13.5 70.5h46.125a.85.85 0 00.607-.258.942.942 0 00.268-.664v-2.281c0-.259-.1-.494-.268-.664a.85.85 0 00-.607-.258H13.5c-2.105 0-3.825-.765-5.042-2C7.252 63.155 6.5 61.428 6.5 59.313c0-2.027.804-3.726 2.014-4.953 1.329-1.347 3.16-2.109 4.986-2.109h46.125a.85.85 0 00.607-.258.942.942 0 00.268-.664l-.36-46.623c-1.282-.466-3.453-.845-7.089-1.18C46.074 2.88 34.084 2.5 13.5 2.5z"
            stroke="#FFF"
            strokeWidth={5}
          />
        </g>
        <path
          stroke="#000"
          strokeWidth={4}
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M27 11.5H14M47.429 23.086H14"
        />
      </g>
    </svg>
  );
}

export default SvgLogoWhite;
