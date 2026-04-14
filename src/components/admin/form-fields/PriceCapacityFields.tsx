
import React from 'react';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';

interface PriceCapacityFieldsProps {
  control: any;
}

const PriceCapacityFields: React.FC<PriceCapacityFieldsProps> = ({ control }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <FormField
        control={control}
        name="price"
        render={({ field: { onChange, value, ...restField } }) => (
          <FormItem>
            <FormLabel>Price</FormLabel>
            <FormControl>
              <Input 
                type="number" 
                placeholder="0.00" 
                step="0.01" 
                min="0" 
                {...restField} 
                value={value === null ? '' : value}
                onChange={(e) => {
                  const val = e.target.value === '' ? null : e.target.value;
                  onChange(val);
                }}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="capacity"
        render={({ field: { onChange, value, ...restField } }) => (
          <FormItem>
            <FormLabel>Capacity</FormLabel>
            <FormControl>
              <Input 
                type="number" 
                placeholder="0" 
                min="0" 
                {...restField} 
                value={value === null ? '' : value}
                onChange={(e) => {
                  const val = e.target.value === '' ? null : e.target.value;
                  onChange(val);
                }}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};

export default PriceCapacityFields;
