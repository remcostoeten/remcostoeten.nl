import { Suspense, ReactNode } from "react";
import { AppLoader } from "./effects/app-loader";

type TProps = {
  children: ReactNode;
  fallback?: ReactNode;
};

export function SuspenseWrapper({ children, fallback }: TProps) {
  return (
    <Suspense fallback={fallback || <AppLoader />}>
      {children}
    </Suspense>
  );
}
