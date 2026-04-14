import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';

interface RegistrationChartProps {
  data: Array<{
    date: string;
    registrations: number;
    participants: number;
  }>;
}

const RegistrationChart: React.FC<RegistrationChartProps> = ({ data }) => {
  const chartConfig = {
    registrations: {
      label: 'Registrations',
      color: 'hsl(var(--primary))',
    },
    participants: {
      label: 'Participants',
      color: 'hsl(var(--secondary))',
    },
  };

  return (
    <ChartContainer config={chartConfig} className="h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="date" 
            tick={{ fontSize: 12 }}
            tickFormatter={(value) => new Date(value).toLocaleDateString()}
          />
          <YAxis tick={{ fontSize: 12 }} />
          <ChartTooltip 
            content={<ChartTooltipContent />}
            labelFormatter={(value) => new Date(value).toLocaleDateString()}
          />
          <Line 
            type="monotone" 
            dataKey="registrations" 
            stroke="var(--color-registrations)" 
            strokeWidth={2}
            dot={{ fill: 'var(--color-registrations)' }}
          />
          <Line 
            type="monotone" 
            dataKey="participants" 
            stroke="var(--color-participants)" 
            strokeWidth={2}
            dot={{ fill: 'var(--color-participants)' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
};

export default RegistrationChart;