import React, { useState } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Upload, File, X } from 'lucide-react';
import FormFieldWrapper from './FormFieldWrapper';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface FileUploadFieldProps {
  name: string;
  label: string;
  accept?: string;
  required?: boolean;
  maxSize?: number; // in MB
}

export const FileUploadField: React.FC<FileUploadFieldProps> = ({
  name,
  label,
  accept = '.pdf',
  required = false,
  maxSize = 10
}) => {
  const { control, setValue, watch } = useFormContext();
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);
  
  const fileUrl = watch(name);

  const uploadFile = async (file: File) => {
    try {
      setUploading(true);
      
      // Validate file size
      if (file.size > maxSize * 1024 * 1024) {
        throw new Error(`File size must be less than ${maxSize}MB`);
      }
      
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('registration-documents')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('registration-documents')
        .getPublicUrl(filePath);

      setValue(name, publicUrl);
      
      toast({
        title: "File uploaded successfully",
        description: `${file.name} has been uploaded.`,
      });
    } catch (error: any) {
      console.error('Upload error:', error);
      toast({
        title: "Upload failed",
        description: error.message || "Failed to upload file. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const removeFile = () => {
    setValue(name, '');
    toast({
      title: "File removed",
      description: "The file has been removed from the form.",
    });
  };

  return (
    <FormFieldWrapper name={name} label={label} required={required}>
      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <div className="space-y-2">
            {!fileUrl ? (
              <div className="flex items-center gap-2">
                <Input
                  type="file"
                  accept={accept}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      uploadFile(file);
                    }
                  }}
                  disabled={uploading}
                  className="hidden"
                  id={`file-input-${name}`}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => document.getElementById(`file-input-${name}`)?.click()}
                  disabled={uploading}
                  className="w-full"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  {uploading ? 'Uploading...' : `Upload ${label}`}
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2 p-3 border rounded-md bg-muted/50">
                <File className="w-4 h-4 text-muted-foreground" />
                <span className="flex-1 text-sm truncate">File uploaded successfully</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={removeFile}
                  className="h-auto p-1"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            )}
            <p className="text-xs text-muted-foreground">
              Accept: {accept} | Max size: {maxSize}MB
            </p>
          </div>
        )}
      />
    </FormFieldWrapper>
  );
};

export default FileUploadField;