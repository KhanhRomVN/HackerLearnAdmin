// src/components/Metrics/GolangMetric.tsx

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ResponsiveLine } from '@nivo/line';
import { ResponsivePie } from '@nivo/pie';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Activity } from "lucide-react";
import axios from 'axios';

// Custom SimpleGauge Component
function SimpleGauge({ value, max }: { value: number; max: number }) {
  const percentage = (value / max) * 100;
  
  return (
    <div className="relative w-full h-40">
      <div className="absolute bottom-0 w-full h-4 bg-gray-200 rounded">
        <div 
          className="h-full bg-blue-500 rounded transition-all duration-500"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <div className="absolute bottom-6 w-full text-center">
        <span className="text-2xl font-bold">{value}</span>
        <span className="text-sm text-gray-500"> / {max}</span>
      </div>
    </div>
  );
}

interface MetricData {
  name: string;
  value: number;
  unit: string;
  type: string;
}

interface TimeSeriesData {
  timestamp: number;
  value: number;
}

interface MemoryMetric {
  id: string;
  value: number;
  color?: string;
}

export function GolangMetric({ api }: { api: string }) {
  const [metrics, setMetrics] = useState<MetricData[]>([]);
  const [timeSeriesData, setTimeSeriesData] = useState<TimeSeriesData[]>([]);
  const [memoryData, setMemoryData] = useState<MemoryMetric[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMetrics = async () => {
    try {
      const response = await axios.get(`http://localhost:9090/api-check?api=${api}`);
      
      if (response.data && typeof response.data === 'string') {
        const parsedMetrics = parsePrometheusMetrics(response.data);
        setMetrics(parsedMetrics);
        
        // Update time series data for goroutines
        const timestamp = Date.now();
        setTimeSeriesData(prev => [...prev, {
          timestamp,
          value: parsedMetrics.find(m => m.name === "go_goroutines")?.value || 0
        }].slice(-30));

        // Update memory metrics
        updateMemoryData(parsedMetrics);
      }
    } catch (err) {
      setError("Failed to fetch metrics");
    } finally {
      setLoading(false);
    }
  };

  const updateMemoryData = (parsedMetrics: MetricData[]) => {
    const memoryMetrics = [
      {
        id: "Heap Alloc",
        value: parsedMetrics.find(m => m.name === "go_memstats_heap_alloc_bytes")?.value || 0,
        color: "#61cdbb"
      },
      {
        id: "Stack InUse",
        value: parsedMetrics.find(m => m.name === "go_memstats_stack_inuse_bytes")?.value || 0,
        color: "#97e3d5"
      },
      {
        id: "Heap InUse",
        value: parsedMetrics.find(m => m.name === "go_memstats_heap_inuse_bytes")?.value || 0,
        color: "#e8c1a0"
      }
    ];
    setMemoryData(memoryMetrics);
  };

  useEffect(() => {
    fetchMetrics();
    const interval = setInterval(fetchMetrics, 5000);
    return () => clearInterval(interval);
  }, []);

  const parsePrometheusMetrics = (rawData: string): MetricData[] => {
    const lines = rawData.split('\n');
    const metrics: MetricData[] = [];
    
    let currentMetric = '';
    let currentType = '';
    
    for (const line of lines) {
      if (line.startsWith('# HELP')) {
        currentMetric = line.split(' ')[2];
      } else if (line.startsWith('# TYPE')) {
        currentType = line.split(' ')[3];
      } else if (line && !line.startsWith('#')) {
        const match = line.match(/^([a-zA-Z_]+)(?:\{.*\})?\s+([0-9.e+-]+)$/);
        if (match) {
          const [, name, value] = match;
          metrics.push({
            name,
            value: parseFloat(value),
            unit: determineUnit(name),
            type: currentType
          });
        }
      }
    }
    
    return metrics;
  };

  const determineUnit = (metricName: string): string => {
    if (metricName.includes('bytes')) return 'bytes';
    if (metricName.includes('seconds')) return 's';
    return '';
  };

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading metrics...</div>;
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="h-full overflow-y-auto bg-gray-50">
      <div className="p-6 space-y-6">
        <h1 className="text-2xl font-bold text-gray-800">Golang Backend Performance Dashboard</h1>

        {/* Critical Metrics Summary - Top Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <MetricCard
            title="Total Memory Usage"
            value={formatBytes(metrics.find(m => m.name === "go_memstats_alloc_bytes")?.value || 0)}
            icon={<Activity className="h-4 w-4" />}
            color="bg-gradient-to-br from-blue-500 to-blue-600"
            textColor="text-white"
          />
          <MetricCard
            title="Heap Objects"
            value={formatNumber(metrics.find(m => m.name === "go_memstats_heap_objects")?.value || 0)}
            icon={<Activity className="h-4 w-4" />}
            color="bg-gradient-to-br from-green-500 to-green-600"
            textColor="text-white"
          />
          <MetricCard
            title="GC CPU Fraction"
            value={`${((metrics.find(m => m.name === "go_gc_cpu_fraction")?.value || 0) * 100).toFixed(2)}%`}
            icon={<Activity className="h-4 w-4" />}
            color="bg-gradient-to-br from-purple-500 to-purple-600"
            textColor="text-white"
          />
        </div>

        {/* Goroutines and Memory Distribution */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Goroutines Gauge */}
          <Card className="shadow-lg">
            <CardHeader className="bg-gray-50 border-b">
              <CardTitle className="text-gray-700">Active Goroutines</CardTitle>
            </CardHeader>
            <CardContent>
              <SimpleGauge 
                value={metrics.find(m => m.name === "go_goroutines")?.value || 0} 
                max={1000}
              />
            </CardContent>
          </Card>

          {/* Memory Distribution Pie Chart */}
          <Card className="shadow-lg">
            <CardHeader className="bg-gray-50 border-b">
              <CardTitle className="text-gray-700">Memory Distribution</CardTitle>
            </CardHeader>
            <CardContent className="h-[300px]">
              <ResponsivePie
                data={memoryData}
                margin={{ top: 40, right: 80, bottom: 80, left: 80 }}
                innerRadius={0.5}
                padAngle={0.7}
                cornerRadius={3}
                activeOuterRadiusOffset={8}
                colors={['#60a5fa', '#34d399', '#a78bfa']}
                borderWidth={1}
                borderColor={{ from: 'color', modifiers: [['darker', 0.2]] }}
                enableArcLinkLabels={true}
                arcLinkLabelsSkipAngle={10}
                arcLinkLabelsTextColor="#374151"
                arcLabelsSkipAngle={10}
                valueFormat={value => formatBytes(value)}
                legends={[
                  {
                    anchor: 'bottom',
                    direction: 'row',
                    justify: false,
                    translateX: 0,
                    translateY: 56,
                    itemsSpacing: 0,
                    itemWidth: 100,
                    itemHeight: 18,
                    itemTextColor: '#374151',
                    itemDirection: 'left-to-right',
                    itemOpacity: 1,
                    symbolSize: 18,
                    symbolShape: 'circle'
                  }
                ]}
              />
            </CardContent>
          </Card>
        </div>

        {/* Goroutines Timeline - Area Chart */}
        <Card className="shadow-lg">
          <CardHeader className="bg-gray-50 border-b">
            <CardTitle className="text-gray-700">Goroutines Over Time</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveLine
              data={[
                {
                  id: "goroutines",
                  data: timeSeriesData.map(d => ({
                    x: new Date(d.timestamp).toLocaleTimeString(),
                    y: d.value
                  }))
                }
              ]}
              margin={{ top: 50, right: 110, bottom: 50, left: 60 }}
              xScale={{ type: 'point' }}
              yScale={{ type: 'linear', min: 'auto', max: 'auto' }}
              curve="monotoneX"
              enableArea={true}
              areaOpacity={0.15}
              colors={['#60a5fa']}
              pointSize={8}
              pointColor="white"
              pointBorderWidth={2}
              pointBorderColor={{ from: 'serieColor' }}
              enablePointLabel={true}
              pointLabel="y"
              pointLabelYOffset={-12}
              useMesh={true}
              theme={{
                axis: {
                  ticks: {
                    text: {
                      fill: '#374151'
                    }
                  },
                  legend: {
                    text: {
                      fill: '#374151'
                    }
                  }
                },
                grid: {
                  line: {
                    stroke: '#e5e7eb',
                    strokeWidth: 1
                  }
                }
              }}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function MetricCard({ 
  title, 
  value, 
  icon, 
  color = "bg-white", 
  textColor = "text-gray-900" 
}: { 
  title: string; 
  value: string | number; 
  icon: React.ReactNode;
  color?: string;
  textColor?: string;
}) {
  return (
    <Card className={`${color} shadow-lg`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className={`text-sm font-medium ${textColor}`}>{title}</CardTitle>
        <div className={textColor}>{icon}</div>
      </CardHeader>
      <CardContent>
        <div className={`text-2xl font-bold ${textColor}`}>{value}</div>
      </CardContent>
    </Card>
  );
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

function formatNumber(num: number): string {
  return new Intl.NumberFormat().format(num);
}