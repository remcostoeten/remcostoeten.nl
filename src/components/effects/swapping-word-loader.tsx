import React, { JSX } from "react";

type TProps = {
  loadingText?: string;
  words?: string[];
  backgroundColor?: string;
  textColor?: string;
  wordColor?: string;
  gradientTopBottom?: string;
  fontSize?: string;
  animationDuration?: string;
};

export function SwappingWordsLoader({
  loadingText = "loading",
  words = ["neon.tech", "custom  cms", "convex"], 
  backgroundColor = "hsl(var(--background))",
  textColor = "hsl(var(--muted-foreground))",
  wordColor = "hsl(var(--accent))",
  gradientTopBottom = "hsl(var(--background))",
  fontSize = "25px",
  animationDuration = "4s",
}: TProps): JSX.Element {
  const loaderStyle: React.CSSProperties = {
    color: textColor,
    fontFamily: '"Poppins", sans-serif',
    fontWeight: 500,
    fontSize: fontSize,
    boxSizing: "content-box",
    height: "40px",
    padding: "10px 10px",
    display: "flex",
    borderRadius: "8px",
    backgroundColor: backgroundColor,
  };

  const wordsContainerStyle: React.CSSProperties = {
    overflow: "hidden",
    position: "relative",
  };

  const gradientOverlayStyle: React.CSSProperties = {
    content: '""',
    position: "absolute",
    inset: 0,
    background: `linear-gradient(
      ${gradientTopBottom} 10%,
      transparent 30%,
      transparent 70%,
      ${gradientTopBottom} 90%
    )`,
    zIndex: 20,
    pointerEvents: "none",
  };

  const wordStyle: React.CSSProperties = {
    display: "block",
    height: "100%",
    paddingLeft: "6px",
    color: wordColor,
    animation: `swapWords ${animationDuration} infinite`,
  };

  return (
    <>
      <style>{`
        @keyframes swapWords {
          10% {
            transform: translateY(-102%);
          }
          25% {
            transform: translateY(-100%);
          }
          35% {
            transform: translateY(-202%);
          }
          50% {
            transform: translateY(-200%);
          }
          60% {
            transform: translateY(-302%);
          }
          75% {
            transform: translateY(-300%);
          }
          85% {
            transform: translateY(-402%);
          }
          100% {
            transform: translateY(-400%);
          }
        }
      `}</style>
      <div style={loaderStyle}>
        <p>{loadingText}</p>
        <div style={wordsContainerStyle}>
          {words.map((word, index) => (
            <span key={index} style={wordStyle}>
              {word}
            </span>
          ))}
          <div style={gradientOverlayStyle} />
        </div>
      </div>
    </>
  );
}
