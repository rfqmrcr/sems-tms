import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';

interface RevenueChartProps {
  data: Array<{
    period: string;
    revenue: number;
    paid: number;
    pending: number;
  }>;
}

const RevenueChart: React.FC<RevenueChartProps> = ({ data }) => {
  const chartConfig = {
    revenue: {
      label: 'Total Revenue',
      color: 'hsl(var(--primary))',
    },
    paid: {
      label: 'Paid',
      color: 'hsl(var(--secondary))',
    },
    pending: {
      label: 'Pending',
      color: 'hsl(var(--muted))',
    },
  };

  return (
    <ChartContainer config={chartConfig} className="h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="period" tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} />
          <ChartTooltip 
            content={<ChartTooltipContent />}
            formatter={(value: number) => [`AED ${value.toFixed(2)}`, '']}
          />
          <Bar dataKey="paid" fill="var(--color-paid)" stackId="a" />
          <Bar dataKey="pending" fill="var(--color-pending)" stackId="a" />
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
};

export default RevenueChart;