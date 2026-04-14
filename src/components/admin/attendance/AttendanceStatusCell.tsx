
import React from 'react';
import { Switch } from '@/components/ui/switch';
import { Check, X } from 'lucide-react';
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from '@/components/ui/tooltip';

interface AttendanceStatusCellProps {
  isPresent: boolean;
  saving: boolean;
  onTogglePresence: (checked: boolean) => void;
  dayLabel?: string; // Add optional day label
}

const AttendanceStatusCell: React.FC<AttendanceStatusCellProps> = ({
  isPresent,
  saving,
  onTogglePresence,
  dayLabel,
}) => {
  return (
    <div className="flex items-center">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex items-center">
              <Switch 
                checked={isPresent}
                disabled={saving}
                onCheckedChange={onTogglePresence}
                className="mr-2"
              />
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>{isPresent ? 'Mark as absent' : 'Mark as present'}{dayLabel ? ` for ${dayLabel}` : ''}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      {isPresent ? (
        <Check className="h-4 w-4 text-green-500" />
      ) : (
        <X className="h-4 w-4 text-red-500" />
      )}
    </div>
  );
};

export default AttendanceStatusCell;
