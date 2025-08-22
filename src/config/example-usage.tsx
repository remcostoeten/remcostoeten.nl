import { useDesignTokens } from '../context/design-tokens-context';

type TProps = {
  title?: string;
};

export function ConfigExampleComponent({ title = "Design System Preview" }: TProps) {
  const { state } = useDesignTokens();
  const { tokens } = state;

  return (
    <div className="p-8 space-y-8">
      <section>
        <h2 className="text-2xl font-bold mb-4">{title}</h2>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="space-y-2">
            <h3 className="font-semibold">Primary Colors</h3>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded bg-primary-500" />
                <span className="text-sm">Primary</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded bg-secondary-500" />
                <span className="text-sm">Secondary</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded bg-accent-500" />
                <span className="text-sm">Accent</span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold">Typography Sizes</h3>
            <div className="space-y-1">
              <p className="text-xs">Extra Small</p>
              <p className="text-sm">Small</p>
              <p className="text-base">Base</p>
              <p className="text-lg">Large</p>
              <p className="text-xl">Extra Large</p>
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold">Spacing</h3>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-muted" />
                <span className="text-sm">1 ({tokens.spacing[1]})</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-4 bg-muted" />
                <span className="text-sm">2 ({tokens.spacing[2]})</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-16 h-4 bg-muted" />
                <span className="text-sm">4 ({tokens.spacing[4]})</span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold">Border Radius</h3>
            <div className="space-y-2">
              <div className="w-12 h-12 bg-muted rounded-sm" />
              <div className="w-12 h-12 bg-muted rounded" />
              <div className="w-12 h-12 bg-muted rounded-lg" />
              <div className="w-12 h-12 bg-muted rounded-full" />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="font-semibold">Shadows</h3>
          <div className="flex gap-4 flex-wrap">
            <div className="p-4 bg-card rounded shadow-sm">Shadow SM</div>
            <div className="p-4 bg-card rounded shadow">Shadow Default</div>
            <div className="p-4 bg-card rounded shadow-md">Shadow MD</div>
            <div className="p-4 bg-card rounded shadow-lg">Shadow LG</div>
            <div className="p-4 bg-card rounded shadow-xl">Shadow XL</div>
          </div>
        </div>

        <div className="mt-8 p-4 bg-muted rounded-lg">
          <h3 className="font-semibold mb-2">Dynamic Values from Config</h3>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>Background: {tokens.colors.background}</div>
            <div>Foreground: {tokens.colors.foreground}</div>
            <div>Border: {tokens.colors.border}</div>
            <div>Ring: {tokens.colors.ring}</div>
            <div>Font Family: {tokens.typography.fontFamily.sans[0]}</div>
            <div>Base Font Size: {tokens.typography.fontSize.base[0]}</div>
          </div>
        </div>
      </section>
    </div>
  );
}
