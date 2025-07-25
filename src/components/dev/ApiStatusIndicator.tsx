import { useState, useEffect, useCallback } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { CheckCircle, XCircle, Clock, RefreshCw } from 'lucide-react';

type TApiStatus = 'online' | 'offline' | 'checking' | 'unknown';

type TProps = {
  apiUrl?: string;
  checkInterval?: number;
  showDetails?: boolean;
};

export function ApiStatusIndicator({ 
  apiUrl = `http://localhost:${import.meta.env.VITE_API_PORT || '3003'}`, 
  checkInterval = 30000,
  showDetails = true 
}: TProps) {
  const [status, setStatus] = useState<TApiStatus>('unknown');
  const [lastChecked, setLastChecked] = useState<Date | null>(null);
  const [isManualChecking, setIsManualChecking] = useState(false);

  const checkApiStatus = useCallback(async () => {
    try {
      setStatus('checking');
      const response = await fetch(`${apiUrl}/health`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        signal: AbortSignal.timeout(5000)
      });
      
      if (response.ok) {
        setStatus('online');
        setLastChecked(new Date());
        return true;
      } else {
        setStatus('offline');
        return false;
      }
    } catch (error) {
      setStatus('offline');
      setLastChecked(new Date());
      return false;
    }
  }, [apiUrl]);

  async function handleManualCheck() {
    setIsManualChecking(true);
    const isOnline = await checkApiStatus();
    
    toast({
      title: isOnline ? 'API Connection Successful' : 'API Connection Failed',
      description: isOnline 
        ? `Connected to ${apiUrl}` 
        : `Unable to reach ${apiUrl}`,
      variant: isOnline ? 'default' : 'destructive',
    });
    
    setIsManualChecking(false);
  }

  useEffect(() => {
    checkApiStatus();
    
    const interval = setInterval(checkApiStatus, checkInterval);
    return () => clearInterval(interval);
  }, [apiUrl, checkInterval, checkApiStatus]);

  function getStatusConfig(status: TApiStatus) {
    switch (status) {
      case 'online':
        return {
          icon: CheckCircle,
          text: 'API Online',
          variant: 'default' as const,
          className: 'bg-accent/10 text-accent border-accent/20 hover:bg-accent/20'
        };
      case 'offline':
        return {
          icon: XCircle,
          text: 'API Offline',
          variant: 'destructive' as const,
          className: 'bg-destructive/10 text-destructive border-destructive/20 hover:bg-destructive/20'
        };
      case 'checking':
        return {
          icon: Clock,
          text: 'Checking...',
          variant: 'secondary' as const,
          className: 'bg-yellow-400/10 text-yellow-400 border-yellow-400/20'
        };
      default:
        return {
          icon: Clock,
          text: 'Unknown',
          variant: 'outline' as const,
          className: 'bg-muted-foreground/10 text-muted-foreground border-muted-foreground/20'
        };
    }
  }

  const config = getStatusConfig(status);
  const Icon = config.icon;

  return (
    <div className="flex items-center gap-2">
      <Badge 
        variant={config.variant} 
        className={`flex items-center gap-1.5 px-2 py-1 ${config.className}`}
      >
        <Icon className="h-3 w-3" />
        <span className="text-xs font-medium">{config.text}</span>
      </Badge>
      
      {showDetails && (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleManualCheck}
            disabled={isManualChecking || status === 'checking'}
            className="h-7 px-2 text-xs"
          >
            <RefreshCw className={`h-3 w-3 mr-1 ${isManualChecking ? 'animate-spin' : ''}`} />
            Test
          </Button>
          
          {lastChecked && (
            <span className="text-xs text-muted-foreground">
              Last: {lastChecked.toLocaleTimeString()}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
