import { CubeLoader } from "@/components/effects/cube-loader";
import { Center } from "@/shared/components/center";

export default function Loading() {
  return (
    <Center>
      <CubeLoader className='blur-in opacity-in' color="rgb(202,255,128)" />
    </Center>
  );
}