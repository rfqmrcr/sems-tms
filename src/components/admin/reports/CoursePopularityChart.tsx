import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';

interface CoursePopularityChartProps {
  data: Array<{
    course_name: string;
    registration_count: number;
    revenue: number;
  }>;
}

const COLORS = [
  'hsl(var(--primary))',
  'hsl(var(--secondary))',
  'hsl(var(--accent))',
  'hsl(var(--muted))',
  'hsl(var(--destructive))',
];

const CoursePopularityChart: React.FC<CoursePopularityChartProps> = ({ data }) => {
  const chartConfig = data.reduce((config, item, index) => {
    config[item.course_name] = {
      label: item.course_name,
      color: COLORS[index % COLORS.length],
    };
    return config;
  }, {} as any);

  return (
    <ChartContainer config={chartConfig} className="h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="registration_count"
            nameKey="course_name"
            cx="50%"
            cy="50%"
            outerRadius={80}
            label={({ course_name, registration_count }) => 
              `${course_name}: ${registration_count}`
            }
          >
            {data.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={COLORS[index % COLORS.length]} 
              />
            ))}
          </Pie>
          <ChartTooltip 
            content={<ChartTooltipContent />}
            formatter={(value: number, name: string) => [
              `${value} registrations`,
              name
            ]}
          />
        </PieChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
};

export default CoursePopularityChart;