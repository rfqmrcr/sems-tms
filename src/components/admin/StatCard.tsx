
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: number | string;
  Icon: LucideIcon | React.ReactNode;
  description?: string;
  isMonetary?: boolean;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, Icon, description, isMonetary }) => {
  // Format monetary values with AED symbol and 2 decimal places
  const displayValue = isMonetary && typeof value === 'number' 
    ? `AED ${value.toFixed(2)}`
    : value;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-gray-500">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center">
          {React.isValidElement(Icon) ? (
            Icon
          ) : (
            // @ts-ignore - This is to handle both LucideIcon and ReactNode
            Icon && typeof Icon === 'function' && <Icon className="h-8 w-8 text-primary mr-3" />
          )}
          <div>
            <span className="text-3xl font-bold">{displayValue}</span>
            {description && <p className="text-sm text-gray-500 mt-1">{description}</p>}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default StatCard;
