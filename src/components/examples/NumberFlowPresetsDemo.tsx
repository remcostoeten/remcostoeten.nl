import { useState, useEffect } from 'react';
import { NumberFlow } from '@/components/ui/NumberFlow';
import { numberFlowPresets } from '@/lib/number-flow-presets';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

type TProps = {
  className?: string;
};

export function NumberFlowPresetsDemo({ className }: TProps) {
  const [revenue, setRevenue] = useState(125499.99);
  const [completion, setCompletion] = useState(87.3);
  const [users, setUsers] = useState(2450000);
  const [rating, setRating] = useState(4.7);

  useEffect(() => {
    const interval = setInterval(() => {
      setRevenue(prev => prev + Math.random() * 1000 - 500);
      setCompletion(prev => Math.min(100, Math.max(0, prev + Math.random() * 10 - 5)));
      setUsers(prev => prev + Math.floor(Math.random() * 100));
      setRating(prev => Math.min(5, Math.max(0, prev + Math.random() * 0.2 - 0.1)));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  function randomizeAll() {
    setRevenue(Math.random() * 500000 + 50000);
    setCompletion(Math.random() * 100);
    setUsers(Math.floor(Math.random() * 5000000 + 100000));
    setRating(Math.random() * 5);
  }

  return (
    <div className={`space-y-6 ${className}`}>
      <div>
        <h2 className="text-2xl font-bold mb-4">NumberFlow Presets Demo</h2>
        <p className="text-muted-foreground mb-6">
          Pre-configured NumberFlow components for common use cases with optimized animations.
        </p>
        
        <Button onClick={randomizeAll} className="mb-6">
          Update All Metrics
        </Button>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Revenue</CardTitle>
            <CardDescription>Currency preset with USD formatting</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              <NumberFlow 
                value={revenue}
                {...numberFlowPresets.currency('USD')}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Completion</CardTitle>
            <CardDescription>Percentage preset with suffix</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              <NumberFlow 
                value={completion}
                {...numberFlowPresets.percentage()}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Users</CardTitle>
            <CardDescription>Compact notation for large numbers</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              <NumberFlow 
                value={users}
                {...numberFlowPresets.compact()}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Rating</CardTitle>
            <CardDescription>Decimal preset with 1 digit</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              <NumberFlow 
                value={rating}
                {...numberFlowPresets.decimal(1)}
                suffix="/5"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Animation Speed Comparison</CardTitle>
            <CardDescription>Same value with different animation speeds</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Fast:</span>
              <div className="text-xl font-bold">
                <NumberFlow 
                  value={users}
                  {...numberFlowPresets.fast()}
                  {...numberFlowPresets.integer()}
                />
              </div>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Normal:</span>
              <div className="text-xl font-bold">
                <NumberFlow 
                  value={users}
                  {...numberFlowPresets.integer()}
                />
              </div>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Slow:</span>
              <div className="text-xl font-bold">
                <NumberFlow 
                  value={users}
                  {...numberFlowPresets.slow()}
                  {...numberFlowPresets.integer()}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Currency Variations</CardTitle>
            <CardDescription>Same amount in different currencies</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">USD:</span>
              <div className="text-lg font-bold">
                <NumberFlow 
                  value={revenue}
                  {...numberFlowPresets.currency('USD')}
                />
              </div>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">EUR:</span>
              <div className="text-lg font-bold">
                <NumberFlow 
                  value={revenue * 0.85}
                  {...numberFlowPresets.currency('EUR')}
                />
              </div>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">GBP:</span>
              <div className="text-lg font-bold">
                <NumberFlow 
                  value={revenue * 0.73}
                  {...numberFlowPresets.currency('GBP')}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Custom Combinations</CardTitle>
            <CardDescription>Mixing presets with custom props</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Smooth %:</span>
              <div className="text-lg font-bold text-green-600">
                <NumberFlow 
                  value={completion}
                  {...numberFlowPresets.smooth()}
                  {...numberFlowPresets.percentage()}
                />
              </div>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Fast $:</span>
              <div className="text-lg font-bold text-blue-600">
                <NumberFlow 
                  value={revenue / 1000}
                  {...numberFlowPresets.fast()}
                  prefix="$"
                  suffix="K"
                  format={{ maximumFractionDigits: 0 }}
                />
              </div>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Compact+:</span>
              <div className="text-lg font-bold text-purple-600">
                <NumberFlow 
                  value={users}
                  {...numberFlowPresets.compact()}
                  suffix=" users"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Usage Examples</CardTitle>
          <CardDescription>Code examples for common patterns</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-muted p-4 rounded-lg font-mono text-sm">
            <div className="text-muted-foreground mb-2">// Basic currency</div>
            <div>{`<NumberFlow value={price} {...numberFlowPresets.currency('USD')} />`}</div>
          </div>
          
          <div className="bg-muted p-4 rounded-lg font-mono text-sm">
            <div className="text-muted-foreground mb-2">// Percentage with custom suffix</div>
            <div>{`<NumberFlow value={score} {...numberFlowPresets.percentage()} suffix="/100" />`}</div>
          </div>
          
          <div className="bg-muted p-4 rounded-lg font-mono text-sm">
            <div className="text-muted-foreground mb-2">// Fast animation with compact format</div>
            <div>{`<NumberFlow value={count} {...numberFlowPresets.fast()} {...numberFlowPresets.compact()} />`}</div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
