// src/pages/Metric.tsx
import { GolangMetric } from "@/components/Metrics/GolangMetric";
import { SpringMetric } from "@/components/Metrics/SpringMetric";
import { Helmet } from 'react-helmet-async'
import { Button } from "@/components/ui/button";
import { RefreshCw, Activity, Server } from "lucide-react"; // Thêm icons
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion"; // Thêm animation
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export default function Metric() {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedApi, setSelectedApi] = useState<string>("all");
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  const apiCheckList = [
    {
      type: "golang",
      api: "http://localhost:8080/v1/metrics",
      name: "Golang API",
      status: "active"
    },
    // Thêm nhiều API endpoints hơn nếu cần
  ]

  const apiEndpoints = ["all", ...apiCheckList.map(item => item.api)];
  const filteredApiList = selectedApi === "all" 
    ? apiCheckList 
    : apiCheckList.filter(item => item.api === selectedApi);

  // Auto refresh mỗi 30 giây
  useEffect(() => {
    const interval = setInterval(() => {
      handleManualRefresh();
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    setLastUpdated(new Date());
    setTimeout(() => setIsRefreshing(false), 2000);
  };

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  const renderMetric = (type: string, api: string, name: string, status: string, index: number) => {
    const MetricComponent = type === "golang" ? GolangMetric : SpringMetric;
    
    return (
        <motion.div
        key={index}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3, delay: index * 0.1 }}
        className={`
          bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900
          rounded-xl shadow-lg mb-6 p-4 hover:shadow-xl transition-all duration-300
          border border-gray-200 dark:border-gray-700
          min-h-[800px] // Thêm chiều cao tối thiểu
        `}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Server className="h-5 w-5 text-blue-500" />
            <h3 className="font-semibold text-lg">{name}</h3>
          </div>
          <span className={`
            px-3 py-1 rounded-full text-sm
            ${status === 'active' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}
          `}>
            {status}
          </span>
        </div>
        <MetricComponent api={api} />
      </motion.div>
    );
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden">
    <Helmet>
      <title>System Metrics | HackerLearn Admin</title>
    </Helmet>

    <div className="flex-1 overflow-hidden">
    <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="sticky top-0 z-10 flex justify-between items-center p-4 bg-white dark:bg-gray-800 shadow-md"
        >
          <div className="flex items-center gap-4">
            <Activity className="h-6 w-6 text-blue-500" />
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-500 to-purple-500 text-transparent bg-clip-text">
              System Metrics
            </h1>
            <Select value={selectedApi} onValueChange={setSelectedApi}>
              <SelectTrigger className="w-[300px] bg-gray-50 dark:bg-gray-700">
                <SelectValue placeholder="Select API endpoint" />
              </SelectTrigger>
              <SelectContent>
                {apiEndpoints.map((endpoint) => (
                  <SelectItem key={endpoint} value={endpoint}>
                    {endpoint === "all" ? "All APIs" : endpoint}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-500">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </span>
            <Button
              onClick={handleManualRefresh}
              disabled={isRefreshing}
              variant="outline"
              className="flex items-center gap-2 hover:bg-blue-50 dark:hover:bg-gray-700"
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button
              onClick={toggleTheme}
              variant="outline"
              className="flex items-center gap-2"
            >
              {theme === 'light' ? '🌙' : '☀️'}
            </Button>
          </div>
        </motion.div>

        <div className="h-[calc(100vh-80px)] overflow-y-auto p-4">
          <div className="container mx-auto">
            <div className="space-y-6">
        <AnimatePresence>
          {filteredApiList.map((item, index) => 
            renderMetric(item.type, item.api, item.name, item.status, index)
          )}
        </AnimatePresence>
        </div>
          </div>
        </div>
      </div>
    </div>
  );
}