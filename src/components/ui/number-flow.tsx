import { forwardRef } from 'react';
import NumberFlowComponent from '@number-flow/react';
import { cn } from '@/lib/utils';

type TProps = {
  value: number;
  className?: string;
  format?: Intl.NumberFormatOptions;
  transformTiming?: {
    duration: number;
    easing: string;
  };
  spinTiming?: {
    duration: number;
    easing: string;
  };
  opacityTiming?: {
    duration: number;
    easing: string;
  };
  prefix?: string;
  suffix?: string;
  animated?: boolean;
};

const NumberFlow = forwardRef<HTMLSpanElement, TProps>(
  function NumberFlow({
    value,
    className,
    format = {},
    transformTiming = { duration: 400, easing: 'ease-out' },
    spinTiming = { duration: 500, easing: 'ease-out' },
    opacityTiming = { duration: 200, easing: 'ease-out' },
    prefix,
    suffix,
    animated = true,
    ...props
  }, ref) {
    if (!animated) {
      const formattedValue = new Intl.NumberFormat(undefined, format).format(value);
      return (
        <span ref={ref} className={cn('font-mono', className)} {...props}>
          {prefix}{formattedValue}{suffix}
        </span>
      );
    }

    return (
      <span className={cn('inline-flex items-center', className)}>
        {prefix && <span className="mr-0.5">{prefix}</span>}
        <NumberFlowComponent
          ref={ref}
          value={value}
          format={format}
          transformTiming={transformTiming}
          spinTiming={spinTiming}
          opacityTiming={opacityTiming}
          className="font-mono"
          {...props}
        />
        {suffix && <span className="ml-0.5">{suffix}</span>}
      </span>
    );
  }
);

export { NumberFlow };
