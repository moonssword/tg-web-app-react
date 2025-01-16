import React, { useEffect, useState } from 'react';
import './Preloader.css';

const Preloader = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  if (!loading) return null;

  return (
    <div className="preloader">
      <svg
        className="preloader-svg"
        viewBox="0 0 322 330"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <g filter="url(#filter0_d_1582_2099)">
          <path
            d="M298.066 135.377L169.316 18.3756C166.942 16.2042 163.842 15 160.625 15C157.408 15 154.308 16.2042 151.934 18.3756L23.1844 135.377C21.8888 136.601 20.8511 138.071 20.1325 139.702C19.4139 141.333 19.0288 143.091 19 144.872V293.74C19 297.154 20.3565 300.429 22.771 302.844C25.1855 305.258 28.4603 306.615 31.875 306.615H289.375C292.79 306.615 296.064 305.258 298.479 302.844C300.894 300.429 302.25 297.154 302.25 293.74V144.872C302.221 143.091 301.836 141.333 301.117 139.702C300.399 138.071 299.361 136.601 298.066 135.377Z"
            stroke="#FAFF00"
            strokeWidth="15"
            strokeLinecap="round"
            strokeLinejoin="round"
            shapeRendering="crispEdges"
            className="preloader-path"
          />
        </g>
        <defs>
          <filter
            id="filter0_d_1582_2099"
            x="0"
            y="0"
            width="321.25"
            height="329.615"
            filterUnits="userSpaceOnUse"
            colorInterpolationFilters="sRGB"
          >
            <feFlood floodOpacity="0" result="BackgroundImageFix" />
            <feColorMatrix
              in="SourceAlpha"
              type="matrix"
              values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
              result="hardAlpha"
            />
            <feOffset dy="4" />
            <feGaussianBlur stdDeviation="2" />
            <feComposite in2="hardAlpha" operator="out" />
            <feColorMatrix
              type="matrix"
              values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"
            />
            <feBlend
              mode="normal"
              in2="BackgroundImageFix"
              result="effect1_dropShadow_1582_2099"
            />
            <feBlend
              mode="normal"
              in="SourceGraphic"
              in2="effect1_dropShadow_1582_2099"
              result="shape"
            />
          </filter>
        </defs>
      </svg>
    </div>
  );
};

export default Preloader;
