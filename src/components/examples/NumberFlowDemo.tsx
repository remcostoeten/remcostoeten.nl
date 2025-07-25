import { useState, useEffect } from 'react';
import { NumberFlow } from '@/components/ui/NumberFlow';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

type TProps = {
  className?: string;
};

export function NumberFlowDemo({ className }: TProps) {
  const [counter, setCounter] = useState(0);
  const [price, setPrice] = useState(1299.99);
  const [percentage, setPercentage] = useState(75.5);
  const [downloads, setDownloads] = useState(1234567);

  useEffect(() => {
    const interval = setInterval(() => {
      setCounter(prev => (prev + 1) % 100);
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  function randomizeValues() {
    setPrice(Math.random() * 5000 + 100);
    setPercentage(Math.random() * 100);
    setDownloads(Math.floor(Math.random() * 10000000));
  }

  return (
    <div className={`space-y-6 ${className}`}>
      <div>
        <h2 className="text-2xl font-bold mb-4">NumberFlow Component Demo</h2>
        <p className="text-muted-foreground mb-6">
          A reusable component for smooth number transitions with various formatting options.
        </p>
        
        <Button onClick={randomizeValues} className="mb-6">
          Randomize Values
        </Button>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Basic Counter</CardTitle>
            <CardDescription>Auto-incrementing counter with default settings</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">
              <NumberFlow value={counter} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Currency Display</CardTitle>
            <CardDescription>Price formatting with prefix and custom animation</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              <NumberFlow 
                value={price}
                prefix="$"
                format={{ 
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2 
                }}
                transformTiming={{ duration: 600, easing: 'cubic-bezier(0.4, 0, 0.2, 1)' }}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Percentage</CardTitle>
            <CardDescription>Progress indicator with suffix and fast animation</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold text-blue-600">
              <NumberFlow 
                value={percentage}
                suffix="%"
                format={{ 
                  minimumFractionDigits: 1,
                  maximumFractionDigits: 1 
                }}
                transformTiming={{ duration: 300, easing: 'ease-out' }}
                spinTiming={{ duration: 350, easing: 'ease-out' }}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Large Numbers</CardTitle>
            <CardDescription>Download count with thousand separators</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold text-purple-600">
              <NumberFlow 
                value={downloads}
                format={{ 
                  notation: 'standard',
                  useGrouping: true 
                }}
                transformTiming={{ duration: 800, easing: 'ease-in-out' }}
              />
              <span className="text-sm text-muted-foreground ml-2">downloads</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Compact Numbers</CardTitle>
          <CardDescription>Various compact number formats</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-lg font-semibold">
                <NumberFlow 
                  value={downloads}
                  format={{ notation: 'compact', compactDisplay: 'short' }}
                />
              </div>
              <div className="text-xs text-muted-foreground">Short</div>
            </div>
            
            <div className="text-center">
              <div className="text-lg font-semibold">
                <NumberFlow 
                  value={downloads}
                  format={{ notation: 'compact', compactDisplay: 'long' }}
                />
              </div>
              <div className="text-xs text-muted-foreground">Long</div>
            </div>
            
            <div className="text-center">
              <div className="text-lg font-semibold">
                <NumberFlow 
                  value={downloads}
                  format={{ notation: 'scientific' }}
                />
              </div>
              <div className="text-xs text-muted-foreground">Scientific</div>
            </div>
            
            <div className="text-center">
              <div className="text-lg font-semibold">
                <NumberFlow 
                  value={downloads}
                  format={{ notation: 'engineering' }}
                />
              </div>
              <div className="text-xs text-muted-foreground">Engineering</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Animation Disabled</CardTitle>
          <CardDescription>Static number display without transitions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-semibold">
            <NumberFlow 
              value={counter}
              animated={false}
              prefix="Static: "
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
