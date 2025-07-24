import React from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Eye, X } from 'lucide-react';
import { useCMSPreview } from '../hooks/useCMS';

export function PreviewBanner() {
  const { previewMode, disablePreview } = useCMSPreview();

  if (!previewMode) {
    return null;
  }

  return (
    <Alert className="fixed top-0 left-0 right-0 z-50 rounded-none border-b border-orange-200 bg-orange-50 text-orange-800">
      <Eye className="h-4 w-4" />
      <AlertDescription className="flex items-center justify-between">
        <span>
          You are viewing this page in preview mode. Content may not be published yet.
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={disablePreview}
          className="ml-4 h-8 border-orange-200 bg-white text-orange-800 hover:bg-orange-100"
        >
          <X className="h-3 w-3 mr-1" />
          Exit Preview
        </Button>
      </AlertDescription>
    </Alert>
  );
};