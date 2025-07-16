"use client";

import { useState, useEffect, useCallback } from 'react';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { Monitor, Tablet, Smartphone, Save, RotateCcw } from 'lucide-react';

type TProps = {
  initialWidth?: number;
  pageId?: number;
  global?: boolean;
  onWidthChange?: (width: number) => void;
};

const PRESET_WIDTHS = {
  mobile: 375,
  tablet: 768,
  desktop: 1200,
  wide: 1920,
};

const DEFAULT_WIDTH = 672; // Current max-w-2xl equivalent

export default function WidthControl({ 
  initialWidth = DEFAULT_WIDTH, 
  pageId, 
  global = false,
  onWidthChange 
}: TProps) {
  const [width, setWidth] = useState(initialWidth);
  const [inputWidth, setInputWidth] = useState(initialWidth.toString());
  const [isLoading, setIsLoading] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  useEffect(() => {
    setWidth(initialWidth);
    setInputWidth(initialWidth.toString());
  }, [initialWidth]);

  const handleSliderChange = useCallback((value: number[]) => {
    const newWidth = value[0];
    setWidth(newWidth);
    setInputWidth(newWidth.toString());
    setHasUnsavedChanges(newWidth !== initialWidth);
    onWidthChange?.(newWidth);
  }, [initialWidth, onWidthChange]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputWidth(value);
    
    const numericValue = parseInt(value, 10);
    if (!isNaN(numericValue) && numericValue >= 300 && numericValue <= 1920) {
      setWidth(numericValue);
      setHasUnsavedChanges(numericValue !== initialWidth);
      onWidthChange?.(numericValue);
    }
  }, [initialWidth, onWidthChange]);

  const handlePresetClick = useCallback((presetWidth: number) => {
    setWidth(presetWidth);
    setInputWidth(presetWidth.toString());
    setHasUnsavedChanges(presetWidth !== initialWidth);
    onWidthChange?.(presetWidth);
  }, [initialWidth, onWidthChange]);

  const handleSave = async () => {
    if (!pageId && !global) {
      toast({
        title: 'Error',
        description: 'Page ID is required for saving settings',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/layout-settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          pageId: global ? undefined : pageId,
          settingKey: 'containerWidth',
          settingValue: width,
          settingType: 'number',
          description: 'Container width setting for content layout',
          global,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save width setting');
      }

      const result = await response.json();
      
      if (result.success) {
        toast({
          title: 'Success',
          description: `Container width saved: ${width}px`,
        });
        setHasUnsavedChanges(false);
      } else {
        throw new Error(result.error || 'Failed to save setting');
      }
    } catch (error) {
      console.error('Error saving width setting:', error);
      toast({
        title: 'Error',
        description: 'Failed to save width setting',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setWidth(initialWidth);
    setInputWidth(initialWidth.toString());
    setHasUnsavedChanges(false);
    onWidthChange?.(initialWidth);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Monitor className="w-5 h-5" />
          Container Width
        </CardTitle>
        <CardDescription>
          Adjust the maximum width of your content container. Changes are applied instantly but need to be saved.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Preset Buttons */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Quick Presets</Label>
          <div className="grid grid-cols-4 gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePresetClick(PRESET_WIDTHS.mobile)}
              className="flex items-center gap-2"
            >
              <Smartphone className="w-4 h-4" />
              Mobile
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePresetClick(PRESET_WIDTHS.tablet)}
              className="flex items-center gap-2"
            >
              <Tablet className="w-4 h-4" />
              Tablet
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePresetClick(PRESET_WIDTHS.desktop)}
              className="flex items-center gap-2"
            >
              <Monitor className="w-4 h-4" />
              Desktop
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePresetClick(PRESET_WIDTHS.wide)}
              className="flex items-center gap-2"
            >
              <Monitor className="w-4 h-4" />
              Wide
            </Button>
          </div>
        </div>

        {/* Slider Control */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Width: {width}px</Label>
          <Slider
            value={[width]}
            onValueChange={handleSliderChange}
            min={300}
            max={1920}
            step={10}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>300px</span>
            <span>1920px</span>
          </div>
        </div>

        {/* Input Control */}
        <div className="space-y-2">
          <Label htmlFor="width-input" className="text-sm font-medium">
            Exact Width (px)
          </Label>
          <Input
            id="width-input"
            type="number"
            min={300}
            max={1920}
            value={inputWidth}
            onChange={handleInputChange}
            className="w-full"
            placeholder="Enter width in pixels"
          />
        </div>

        {/* Visual Preview */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Preview</Label>
          <div className="w-full bg-muted rounded p-4">
            <div 
              className="bg-background border border-border rounded h-12 transition-all duration-200"
              style={{ width: `${Math.min(width, 400)}px`, maxWidth: '100%' }}
            >
              <div className="p-3 text-xs text-muted-foreground text-center">
                {width}px container
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between items-center pt-4 border-t">
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleReset}
              disabled={!hasUnsavedChanges}
            >
              <RotateCcw className="w-4 h-4 mr-1" />
              Reset
            </Button>
          </div>
          <Button
            onClick={handleSave}
            disabled={!hasUnsavedChanges || isLoading}
            size="sm"
          >
            <Save className="w-4 h-4 mr-1" />
            {isLoading ? 'Saving...' : 'Save Width'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

