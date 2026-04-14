
import React from 'react';
import { Button } from '@/components/ui/button';
import { Pen } from 'lucide-react';
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from '@/components/ui/tooltip';

interface AttendanceSignatureCellProps {
  signatureData: string | null;
  traineeId: string;
  onOpenSignaturePad: (traineeId: string) => void;
}

const AttendanceSignatureCell: React.FC<AttendanceSignatureCellProps> = ({
  signatureData,
  traineeId,
  onOpenSignaturePad,
}) => {
  return (
    <>
      {signatureData ? (
        <div className="flex items-center space-x-2">
          <div className="border border-gray-200 bg-gray-50 p-2 w-24 h-12 relative overflow-hidden">
            <img 
              src={signatureData} 
              alt="Signature" 
              className="max-w-full max-h-full object-contain absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
            />
          </div>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onOpenSignaturePad(traineeId)}
                >
                  <Pen className="h-3 w-3 mr-1" />
                  Update
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Update signature</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      ) : (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onOpenSignaturePad(traineeId)}
              >
                <Pen className="h-3 w-3 mr-1" />
                Sign
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Add signature</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </>
  );
};

export default AttendanceSignatureCell;
