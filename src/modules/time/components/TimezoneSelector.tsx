import { useState } from 'react';
import { TTimezoneId } from '../types/timezone';
import { getTimezoneInfo, searchTimezones, getAvailableTimezones } from '../utils/timezone';

type TProps = {
  value: TTimezoneId;
  onChange: (timezone: TTimezoneId) => void;
  allowedTimezones?: TTimezoneId[];
  placeholder?: string;
  className?: string;
};

export function TimezoneSelector({
  value,
  onChange,
  allowedTimezones,
  placeholder = 'Select timezone...',
  className = ''
}: TProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const availableTimezones = allowedTimezones || getAvailableTimezones();
  const filteredTimezones = searchQuery
    ? searchTimezones(searchQuery).filter(tz => availableTimezones.includes(tz))
    : availableTimezones;

  const selectedTimezone = getTimezoneInfo(value);

  function handleSelect(timezoneId: TTimezoneId) {
    onChange(timezoneId);
    setIsOpen(false);
    setSearchQuery('');
  }

  return (
    <div className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-3 py-2 text-left bg-background border border-border rounded-md hover:bg-muted focus:outline-none focus:ring-2 focus:ring-ring"
      >
        {selectedTimezone ? (
          <div className="flex justify-between items-center">
            <span className="font-medium">{selectedTimezone.name}</span>
            <span className="text-sm text-muted-foreground">{selectedTimezone.offset}</span>
          </div>
        ) : (
          <span className="text-muted-foreground">{placeholder}</span>
        )}
      </button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-background border border-border rounded-md shadow-lg max-h-60 overflow-auto">
          <div className="p-2">
            <input
              type="text"
              placeholder="Search timezones..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-2 py-1 text-sm bg-background border border-border rounded focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </div>
          
          <div className="max-h-48 overflow-y-auto">
            {filteredTimezones.map((timezoneId) => {
              const timezone = getTimezoneInfo(timezoneId);
              const isSelected = timezoneId === value;
              
              return (
                <button
                  key={timezoneId}
                  onClick={() => handleSelect(timezoneId)}
                  className={`w-full px-3 py-2 text-left hover:bg-muted focus:outline-none focus:bg-muted ${
                    isSelected ? 'bg-muted font-medium' : ''
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-medium text-sm">{timezone.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {timezone.countries.slice(0, 2).join(', ')}
                        {timezone.countries.length > 2 && ` +${timezone.countries.length - 2} more`}
                      </div>
                    </div>
                    <span className="text-sm text-muted-foreground">{timezone.offset}</span>
                  </div>
                </button>
              );
            })}
            
            {filteredTimezones.length === 0 && (
              <div className="px-3 py-2 text-sm text-muted-foreground text-center">
                No timezones found
              </div>
            )}
          </div>
        </div>
      )}

      {isOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}
