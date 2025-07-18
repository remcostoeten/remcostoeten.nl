"use client";

import { useEffect } from "react";
import { useProgress } from "@/hooks/use-progress";

type TProps = {
	children: React.ReactNode;
};

export function ProgressBar({ children }: TProps) {
	const {} = useProgress(); // Removed unused isActive

	useEffect(() => {
		if (typeof window !== "undefined") {
			const style = document.createElement("style");
			style.textContent = `
        #nprogress {
          pointer-events: none;
        }
        
        #nprogress .bar {
          background: hsl(var(--primary));
          position: fixed;
          z-index: 1031;
          top: 0;
          left: 0;
          width: 100%;
          height: 2px;
        }
        
        #nprogress .peg {
          display: block;
          position: absolute;
          right: 0px;
          width: 100px;
          height: 100%;
          box-shadow: 0 0 10px hsl(var(--primary)), 0 0 5px hsl(var(--primary));
          opacity: 1;
          transform: rotate(3deg) translate(0px, -4px);
        }
        
        #nprogress .spinner {
          display: block;
          position: fixed;
          z-index: 1031;
          top: 15px;
          right: 15px;
        }
        
        #nprogress .spinner-icon {
          width: 18px;
          height: 18px;
          box-sizing: border-box;
          border: solid 2px transparent;
          border-top-color: hsl(var(--primary));
          border-left-color: hsl(var(--primary));
          border-radius: 50%;
          animation: nprogress-spinner 400ms linear infinite;
        }
        
        @keyframes nprogress-spinner {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `;
			document.head.appendChild(style);

			return () => {
				document.head.removeChild(style);
			};
		}
	}, []);

	return <>{children}</>;
}
