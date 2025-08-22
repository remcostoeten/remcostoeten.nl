import { Center } from "@/shared/components/base/center";
import { SwappingWordsLoader } from "./swapping-word-loader";

type TProps = {
  loadingText?: string;
  words?: string[];
};

export function AppLoader({ 
  loadingText = "Loading", 
  words = ["portfolio", "projects", "experience", "skills", "content"] 
}: TProps) {
  return (
    <Center className="min-h-screen bg-background">
      <SwappingWordsLoader 
        loadingText={loadingText}
        words={words}
        fontSize="28px"
        animationDuration="3s"
      />
    </Center>
  );
}
