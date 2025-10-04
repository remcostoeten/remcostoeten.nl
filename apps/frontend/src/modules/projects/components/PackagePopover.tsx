'use client';

import { useState } from 'react';
import { Package, ExternalLink } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { TPackageInfo } from '../types';

type TProps = {
  packageInfo: TPackageInfo;
  projectName: string;
};

export function PackagePopover({ packageInfo, projectName }: TProps) {
  const [isOpen, setIsOpen] = useState(false);

  if (!packageInfo?.isPackage) return null;

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <button
          className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-accent/10 text-accent hover:bg-accent/20 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-accent/50 focus:ring-offset-1"
          aria-label={`Package links for ${projectName}`}
        >
          <Package className="w-3 h-3" />
          package
        </button>
      </PopoverTrigger>
      
      <PopoverContent className="w-48 p-3" align="start">
        <div className="space-y-2">
          <h4 className="font-medium text-sm text-foreground mb-3">Package Links</h4>
          
          <div className="space-y-2">
            {packageInfo.npmUrl && (
              <a
                href={packageInfo.npmUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 p-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-md transition-colors group"
                onClick={() => setIsOpen(false)}
              >
                <div className="w-5 h-5 flex items-center justify-center">
                  <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
                    <path d="M1.763 0C.786 0 0 .786 0 1.763v20.474C0 23.214.786 24 1.763 24h20.474c.977 0 1.763-.786 1.763-1.763V1.763C24 .786 23.214 0 22.237 0H1.763zM5.13 5.323l13.837.019-.009 5.183H13.82v.73h5.133v2.043h-5.142v.73h5.142v2.043H13.82v.73h5.133V18.8H5.113V5.323h.017zm2.896 2.41v9.057h3.176V7.733H8.026zm3.176 0v9.057h3.176V7.733h-3.176z"/>
                  </svg>
                </div>
                <span>View on npm</span>
                <ExternalLink className="w-3 h-3 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
              </a>
            )}
            
            {packageInfo.githubUrl && (
              <a
                href={packageInfo.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 p-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-md transition-colors group"
                onClick={() => setIsOpen(false)}
              >
                <div className="w-5 h-5 flex items-center justify-center">
                  <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
                    <path d="M12 0C5.374 0 0 5.373 0 12 0 17.302 3.438 21.8 8.207 23.387c.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
                  </svg>
                </div>
                <span>View on GitHub</span>
                <ExternalLink className="w-3 h-3 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
              </a>
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}