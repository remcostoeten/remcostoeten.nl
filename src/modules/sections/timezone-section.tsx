import { For } from "solid-js";
import { TIMEZONE_INFO, useCurrentTime } from "~/modules/time";
import { getParagraphClass } from "~/cms";

type TProps = {
  showAnimation?: boolean;
  animationDelay?: number;
};

export function TimezoneSection(props: TProps) {
  const currentTime = useCurrentTime();

  return (
    <p class={`text-foreground ${getParagraphClass('body')}`}>
      My current timezone is{" "}
      <span class="dashed-highlight">
        {TIMEZONE_INFO.offset}
      </span>{" "}
      which includes countries like{" "}
      <For each={TIMEZONE_INFO.countries}>
        {(country, index) => (
          <span>
            <span class="dashed-highlight">
              {country}
            </span>
            {index() < TIMEZONE_INFO.countries.length - 1 && (
              index() === TIMEZONE_INFO.countries.length - 2 ? " and " : ", "
            )}
          </span>
        )}
      </For>
      . Right now it is{" "}
      <span class="dashed-highlight inline-block">
        <span class="font-mono leading-none">{currentTime()}</span>
      </span>
      .
    </p>
  );
}
