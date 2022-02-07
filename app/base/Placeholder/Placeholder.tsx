import { useEffect, useState, forwardRef } from "react";
import { hexToRgb } from "~/utils/hexToRgb";
import type { LinksFunction } from "remix";
import styles from "./styles.css";

export const links: LinksFunction = () => [
  {
    rel: "stylesheet",
    href: styles,
  },
];

interface IProps {
  loading: boolean;
  spinnerColor?: string;
  bgColor?: string;
}

// const Placeholder = (props: IProps) => {
//   const { bgColor = "#000", spinnerColor = "#fff", loading } = props;

//   const [gradientBg, setGradientBg] = useState("");

//   const getRgba = (rgb: number[], alpha: number) => {
//     const [r, g, b] = rgb;
//     return `rgba(${r}, ${g}, ${b}, ${alpha})`;
//   };

//   useEffect(() => {
//     const rgb = hexToRgb(bgColor);
//     if (rgb) {
//       setGradientBg(
//         `linear-gradient(0deg, ${getRgba(rgb, 1)} 50%, ${getRgba(
//           rgb,
//           0.9
//         )} 100%), linear-gradient(90deg, ${getRgba(rgb, 0.9)} 0%, ${getRgba(
//           rgb,
//           0.6
//         )} 100%), linear-gradient(180deg, ${getRgba(rgb, 0.6)} 0%, ${getRgba(
//           rgb,
//           0.3
//         )} 100%), linear-gradient(360deg, ${getRgba(rgb, 0.3)} 0%, ${getRgba(
//           rgb,
//           0
//         )} 100%)`
//       );
//     }
//   }, [bgColor]);

//   return loading ? (
//     <div className="Placeholder">
//       <div className="Placeholder-content">
//         <div
//           className="Placeholder-spinner"
//           style={{ background: spinnerColor }}
//         >
//           <div
//             className="Placeholder-gradient"
//             style={{ backgroundImage: gradientBg }}
//           />
//         </div>
//       </div>
//     </div>
//   ) : null;
// };

const Placeholder = (props: IProps) => {
  const { loading } = props;
  return loading ? (
    <div className="lds-spinner">
      <div></div>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
    </div>
  ) : null;
};

export default Placeholder;
