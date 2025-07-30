import { For } from "solid-js";
import { TIMEZONE_INFO, useCurrentTime } from "~/modules/time";
import { getParagraphClass } from "~/cms";
import { DashedHighlight } from "~/components/primitives";
export function TimezoneSection() {
  const currentTime = useCurrentTime();

  return (
    <p class={`text-foreground ${getParagraphClass("body")}`}>
      My current timezone is{" "}
      <DashedHighlight>
        {TIMEZONE_INFO.offset}
      </DashedHighlight>{" "}
      which includes countries like{" "}
      <For each={TIMEZONE_INFO.countries}>
        {(country, index) => (
          <span>
            <DashedHighlight>{country}</DashedHighlight>
            {index() < TIMEZONE_INFO.countries.length - 1 &&
              (index() === TIMEZONE_INFO.countries.length - 2 ? " and " : ", ")}
          </span>
        )}
      </For>
      . Right now it is{" "}
      <DashedHighlight>
        <span class="font-mono leading-none">{currentTime()}</span>
      </DashedHighlight>
      .
    </p>
  );
}
