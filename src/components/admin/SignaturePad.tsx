
import React, { useRef, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, Save, Trash2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';

interface SignaturePadProps {
  open: boolean;
  onClose: () => void;
  onSave: (signatureData: string) => void;
  traineeId: string;
  traineeName: string;
}

const SignaturePad: React.FC<SignaturePadProps> = ({
  open,
  onClose,
  onSave,
  traineeId,
  traineeName,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Set canvas dimensions
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    // Get canvas context
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas properties
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#000';
  }, [open]);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    setHasSignature(true);
    draw(e);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.beginPath();
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const rect = canvas.getBoundingClientRect();
    let clientX, clientY;
    
    if ('touches' in e) {
      // Touch event
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      // Mouse event
      clientX = e.clientX;
      clientY = e.clientY;
    }
    
    ctx.lineTo(
      clientX - rect.left,
      clientY - rect.top
    );
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(
      clientX - rect.left,
      clientY - rect.top
    );
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);
  };

  const handleSave = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    setSaving(true);
    try {
      // Convert canvas to base64 image data
      const signatureData = canvas.toDataURL('image/png');
      onSave(signatureData);
    } catch (error) {
      console.error('Error saving signature:', error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Signature for {traineeName}</DialogTitle>
        </DialogHeader>
        
        <div className="border-2 border-gray-300 rounded-md bg-white">
          <canvas
            ref={canvasRef}
            className="w-full h-64 touch-none"
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
          />
        </div>
        
        <div className="text-center text-sm text-gray-500">
          Sign using mouse, touch, or stylus
        </div>
        
        <DialogFooter className="flex justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={clearCanvas}
            disabled={saving || !hasSignature}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Clear
          </Button>
          
          <Button
            type="button"
            onClick={handleSave}
            disabled={saving || !hasSignature}
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Signature
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SignaturePad;
