
import React from 'react';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface LocationSelectionFieldProps {
  control: any;
}

const LocationSelectionField: React.FC<LocationSelectionFieldProps> = ({ control }) => {
  // Training room options
  const trainingRoomOptions = [
    { value: "Dubai Investment Park 1", label: "Dubai Investment Park 1" },
  ];

  return (
    <FormField
      control={control}
      name="location"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Training Room</FormLabel>
          <FormControl>
            <Select
              onValueChange={field.onChange}
              value={field.value}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a training room" />
              </SelectTrigger>
              <SelectContent>
                {trainingRoomOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default LocationSelectionField;
