import { ClientMotion } from "~/components/ui/client-motion";
import { TIMEZONE_INFO, useCurrentTime } from "~/modules/time";
import { getParagraphClass } from "~/cms";

type TProps = {
  showAnimation?: boolean;
  animationDelay?: number;
};

export function TimezoneSection(props: TProps) {
  const currentTime = useCurrentTime();

  return (
    <Motion.p 
      class={`text-foreground ${getParagraphClass('body')}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.4, easing: [0.4, 0.0, 0.2, 1] }}
    >
      My current timezone is{" "}
      <span class="dashed-highlight">
        {TIMEZONE_INFO.offset}
      </span>{" "}
      which includes countries like{" "}
      {TIMEZONE_INFO.countries.map((country, index) => (
        <span>
          <span class="dashed-highlight">
            {country}
          </span>
          {index < TIMEZONE_INFO.countries.length - 1 && (
            index === TIMEZONE_INFO.countries.length - 2 ? " and " : ", "
          )}
        </span>
      ))}
      . Right now it is{" "}
      {props.showAnimation ? (
        <ClientMotion
          as="span"
          class="dashed-highlight inline-block"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: props.animationDelay || 0.8, easing: "ease-out" }}
        >
          <span class="font-mono leading-none">{currentTime()}</span>
        </ClientMotion>
      ) : (
        <span class="dashed-highlight inline-block">
          <span class="font-mono leading-none">{currentTime()}</span>
        </span>
      )}
      .
    </Motion.p>
  );
}
