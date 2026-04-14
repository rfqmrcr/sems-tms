import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Calendar, TrendingUp, TrendingDown, ArrowUpDown } from 'lucide-react';

interface ComparisonAnalysisProps {
  data: any;
}

const ComparisonAnalysis: React.FC<ComparisonAnalysisProps> = ({ data }) => {
  const [comparisonType, setComparisonType] = useState('period');
  const [basePeriod, setBasePeriod] = useState('this-month');
  const [comparePeriod, setComparePeriod] = useState('last-month');
  const [metric, setMetric] = useState('revenue');

  // Mock comparison data
  const comparisonData = {
    revenue: {
      current: 45000,
      previous: 38000,
      change: 18.4,
      trend: 'up'
    },
    registrations: {
      current: 156,
      previous: 142,
      change: 9.9,
      trend: 'up'
    },
    participants: {
      current: 324,
      previous: 298,
      change: 8.7,
      trend: 'up'
    },
    avgOrderValue: {
      current: 288.46,
      previous: 267.61,
      change: 7.8,
      trend: 'up'
    }
  };

  const metricData = comparisonData[metric as keyof typeof comparisonData];

  const formatValue = (value: number, metricType: string) => {
    switch (metricType) {
      case 'revenue':
      case 'avgOrderValue':
        return `AED ${value.toFixed(2)}`;
      default:
        return value.toString();
    }
  };

  return (
    <div className="space-y-6">
      {/* Comparison Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ArrowUpDown className="h-5 w-5" />
            Comparison Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label>Comparison Type</Label>
              <Select value={comparisonType} onValueChange={setComparisonType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="period">Period vs Period</SelectItem>
                  <SelectItem value="year-over-year">Year over Year</SelectItem>
                  <SelectItem value="quarter">Quarter vs Quarter</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Base Period</Label>
              <Select value={basePeriod} onValueChange={setBasePeriod}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="this-month">This Month</SelectItem>
                  <SelectItem value="this-quarter">This Quarter</SelectItem>
                  <SelectItem value="this-year">This Year</SelectItem>
                  <SelectItem value="last-30-days">Last 30 Days</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Compare With</Label>
              <Select value={comparePeriod} onValueChange={setComparePeriod}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="last-month">Last Month</SelectItem>
                  <SelectItem value="last-quarter">Last Quarter</SelectItem>
                  <SelectItem value="last-year">Last Year</SelectItem>
                  <SelectItem value="previous-30-days">Previous 30 Days</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Primary Metric</Label>
              <Select value={metric} onValueChange={setMetric}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="revenue">Revenue</SelectItem>
                  <SelectItem value="registrations">Registrations</SelectItem>
                  <SelectItem value="participants">Participants</SelectItem>
                  <SelectItem value="avgOrderValue">Avg Order Value</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Comparison Results */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Object.entries(comparisonData).map(([key, data]) => (
          <Card key={key} className={metric === key ? 'ring-2 ring-primary' : ''}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-gray-600 capitalize">
                  {key.replace(/([A-Z])/g, ' $1').trim()}
                </p>
                <div className={`flex items-center text-sm ${
                  data.trend === 'up' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {data.trend === 'up' ? (
                    <TrendingUp className="h-4 w-4 mr-1" />
                  ) : (
                    <TrendingDown className="h-4 w-4 mr-1" />
                  )}
                  {data.change}%
                </div>
              </div>
              
              <div className="space-y-1">
                <p className="text-2xl font-bold">
                  {formatValue(data.current, key)}
                </p>
                <p className="text-sm text-gray-500">
                  vs {formatValue(data.previous, key)} last period
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Detailed Comparison Table */}
      <Card>
        <CardHeader>
          <CardTitle>Detailed Comparison</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Metric</th>
                  <th className="text-right p-2">Current Period</th>
                  <th className="text-right p-2">Previous Period</th>
                  <th className="text-right p-2">Change</th>
                  <th className="text-right p-2">% Change</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(comparisonData).map(([key, data]) => (
                  <tr key={key} className="border-b">
                    <td className="p-2 font-medium capitalize">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </td>
                    <td className="p-2 text-right">
                      {formatValue(data.current, key)}
                    </td>
                    <td className="p-2 text-right">
                      {formatValue(data.previous, key)}
                    </td>
                    <td className="p-2 text-right">
                      {formatValue(data.current - data.previous, key)}
                    </td>
                    <td className="p-2 text-right">
                      <Badge variant={data.trend === 'up' ? 'default' : 'destructive'}>
                        {data.change > 0 ? '+' : ''}{data.change}%
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ComparisonAnalysis;