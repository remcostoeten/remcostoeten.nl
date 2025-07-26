import { NumberFlow } from '../components/ui/NumberFlow';
import { numberFlowPresets } from '../lib/number-flow-presets';
import { Component, createSignal, createEffect, onCleanup } from 'solid-js';

function randomizeValues() {
  return {
    price: Math.random() * 5000 + 100,
    percentage: Math.random() * 100,
    downloads: Math.floor(Math.random() * 10000000),
    rating: Math.random() * 5
  };
}

const Demo: Component = () => {
  const [counter, setCounter] = createSignal(0);
  const [price, setPrice] = createSignal(1299.99);
  const [percentage, setPercentage] = createSignal(75.5);
  const [downloads, setDownloads] = createSignal(1234567);
  const [rating, setRating] = createSignal(4.7);

  const counterInterval = setInterval(() => {
    setCounter(prev => (prev + 1) % 100);
  }, 2000);

  onCleanup(() => clearInterval(counterInterval));

  function handleRandomizeValues() {
    const values = randomizeValues();
    setPrice(values.price);
    setPercentage(values.percentage);
    setDownloads(values.downloads);
    setRating(values.rating);
  }

  return (
    <div class="min-h-screen bg-gray-50 p-8">
      <div class="max-w-6xl mx-auto">
        <div class="mb-8">
          <h1 class="text-4xl font-bold text-gray-900 mb-4">NumberFlow SolidJS Demo</h1>
          <p class="text-gray-600 mb-6">
            A SolidJS port of the NumberFlow component with smooth number transitions, 
            multiple presets, and extensive customization options.
          </p>
          
          <button 
            onClick={handleRandomizeValues}
            class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Randomize Values
          </button>
        </div>

        <div class="grid md:grid-cols-2 gap-8 mb-8">
          <div class="bg-white p-6 rounded-lg shadow-md">
            <h3 class="text-xl font-semibold mb-2">Basic Counter</h3>
            <p class="text-gray-600 mb-4">Auto-incrementing counter with default settings</p>
            <div class="text-4xl font-bold text-blue-600">
              <NumberFlow value={counter()} />
            </div>
          </div>

          <div class="bg-white p-6 rounded-lg shadow-md">
            <h3 class="text-xl font-semibold mb-2">Currency Display</h3>
            <p class="text-gray-600 mb-4">Price formatting with prefix and custom animation</p>
            <div class="text-3xl font-bold text-green-600">
              <NumberFlow 
                value={price()}
                prefix="$"
                format={{ 
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2 
                }}
                transformTiming={{ duration: 600, easing: 'cubic-bezier(0.4, 0, 0.2, 1)' }}
              />
            </div>
          </div>

          <div class="bg-white p-6 rounded-lg shadow-md">
            <h3 class="text-xl font-semibold mb-2">Percentage</h3>
            <p class="text-gray-600 mb-4">Progress indicator with suffix and fast animation</p>
            <div class="text-2xl font-semibold text-blue-600">
              <NumberFlow 
                value={percentage()}
                suffix="%"
                format={{ 
                  minimumFractionDigits: 1,
                  maximumFractionDigits: 1 
                }}
                transformTiming={{ duration: 300, easing: 'ease-out' }}
                spinTiming={{ duration: 350, easing: 'ease-out' }}
              />
            </div>
          </div>

          <div class="bg-white p-6 rounded-lg shadow-md">
            <h3 class="text-xl font-semibold mb-2">Large Numbers</h3>
            <p class="text-gray-600 mb-4">Download count with thousand separators</p>
            <div class="text-2xl font-semibold text-purple-600">
              <NumberFlow 
                value={downloads()}
                format={{ 
                  notation: 'standard',
                  useGrouping: true 
                }}
                transformTiming={{ duration: 800, easing: 'ease-in-out' }}
              />
              <span class="text-sm text-gray-500 ml-2">downloads</span>
            </div>
          </div>
        </div>

        <div class="bg-white p-6 rounded-lg shadow-md mb-8">
          <h3 class="text-xl font-semibold mb-4">Preset Examples</h3>
          <div class="grid md:grid-cols-4 gap-6">
            <div class="text-center">
              <h4 class="font-medium mb-2">Revenue (USD)</h4>
              <div class="text-2xl font-bold text-green-600">
                <NumberFlow 
                  value={price()}
                  {...numberFlowPresets.currency('USD')}
                />
              </div>
            </div>
            
            <div class="text-center">
              <h4 class="font-medium mb-2">Completion</h4>
              <div class="text-2xl font-bold text-blue-600">
                <NumberFlow 
                  value={percentage()}
                  {...numberFlowPresets.percentage()}
                />
              </div>
            </div>
            
            <div class="text-center">
              <h4 class="font-medium mb-2">Users (Compact)</h4>
              <div class="text-2xl font-bold text-purple-600">
                <NumberFlow 
                  value={downloads()}
                  {...numberFlowPresets.compact()}
                />
              </div>
            </div>
            
            <div class="text-center">
              <h4 class="font-medium mb-2">Rating</h4>
              <div class="text-2xl font-bold text-orange-600">
                <NumberFlow 
                  value={rating()}
                  {...numberFlowPresets.decimal(1)}
                  suffix="/5"
                />
              </div>
            </div>
          </div>
        </div>

        <div class="bg-white p-6 rounded-lg shadow-md mb-8">
          <h3 class="text-xl font-semibold mb-4">Animation Speed Comparison</h3>
          <div class="grid md:grid-cols-3 gap-6">
            <div class="text-center">
              <h4 class="font-medium mb-2">Fast Animation</h4>
              <div class="text-xl font-bold">
                <NumberFlow 
                  value={downloads()}
                  {...numberFlowPresets.fast()}
                  {...numberFlowPresets.integer()}
                />
              </div>
            </div>
            
            <div class="text-center">
              <h4 class="font-medium mb-2">Normal Animation</h4>
              <div class="text-xl font-bold">
                <NumberFlow 
                  value={downloads()}
                  {...numberFlowPresets.integer()}
                />
              </div>
            </div>
            
            <div class="text-center">
              <h4 class="font-medium mb-2">Slow Animation</h4>
              <div class="text-xl font-bold">
                <NumberFlow 
                  value={downloads()}
                  {...numberFlowPresets.slow()}
                  {...numberFlowPresets.integer()}
                />
              </div>
            </div>
          </div>
        </div>

        <div class="bg-white p-6 rounded-lg shadow-md">
          <h3 class="text-xl font-semibold mb-4">Static vs Animated</h3>
          <div class="grid md:grid-cols-2 gap-6">
            <div class="text-center">
              <h4 class="font-medium mb-2">With Animation</h4>
              <div class="text-2xl font-semibold">
                <NumberFlow 
                  value={counter()}
                  animated={true}
                  prefix="Animated: "
                />
              </div>
            </div>
            
            <div class="text-center">
              <h4 class="font-medium mb-2">Without Animation</h4>
              <div class="text-2xl font-semibold">
                <NumberFlow 
                  value={counter()}
                  animated={false}
                  prefix="Static: "
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Demo;
