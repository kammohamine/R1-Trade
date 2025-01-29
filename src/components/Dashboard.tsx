import React from 'react';
import { BarChart3, DollarSign, Activity, Percent, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { DashboardStats } from '../types';

const mockStats: DashboardStats = {
  dailyPnL: 250.50,
  weeklyPnL: 1250.75,
  monthlyPnL: 4500.25,
  totalTrades: 145,
  winRate: 65.5,
  averageWin: 125.50,
  averageLoss: -75.25
};

const StatCard = ({ title, value, icon: Icon, trend = 0 }: { 
  title: string; 
  value: string | number; 
  icon: React.ElementType;
  trend?: number;
}) => (
  <div className="bg-gray-800 rounded-xl p-6 shadow-md border border-gray-700">
    <div className="flex items-center justify-between mb-4">
      <div className="bg-blue-900 p-2 rounded-lg">
        <Icon className="w-6 h-6 text-blue-400" />
      </div>
      {trend !== 0 && (
        <div className={`flex items-center ${trend > 0 ? 'text-green-400' : 'text-red-400'}`}>
          {trend > 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
          <span className="text-sm font-medium ml-1">{Math.abs(trend)}%</span>
        </div>
      )}
    </div>
    <h3 className="text-gray-400 text-sm font-medium">{title}</h3>
    <p className="text-2xl font-semibold mt-1 text-white">{value}</p>
  </div>
);

export default function Dashboard() {
  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6 text-gray-100">Trading Dashboard</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Daily P&L" 
          value={`$${mockStats.dailyPnL.toFixed(2)}`}
          icon={DollarSign}
          trend={2.5}
        />
        <StatCard 
          title="Monthly P&L" 
          value={`$${mockStats.monthlyPnL.toFixed(2)}`}
          icon={BarChart3}
          trend={5.2}
        />
        <StatCard 
          title="Win Rate" 
          value={`${mockStats.winRate}%`}
          icon={Percent}
        />
        <StatCard 
          title="Total Trades" 
          value={mockStats.totalTrades}
          icon={Activity}
        />
      </div>

      <div className="mt-8 bg-gray-800 rounded-xl p-6 shadow-md border border-gray-700">
        <h3 className="text-xl font-semibold mb-4 text-gray-100">Performance Metrics</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="border-r border-gray-700 pr-6">
            <p className="text-gray-400 text-sm">Average Win</p>
            <p className="text-2xl font-semibold text-green-400">${mockStats.averageWin.toFixed(2)}</p>
          </div>
          <div className="border-r border-gray-700 px-6">
            <p className="text-gray-400 text-sm">Average Loss</p>
            <p className="text-2xl font-semibold text-red-400">${mockStats.averageLoss.toFixed(2)}</p>
          </div>
          <div className="pl-6">
            <p className="text-gray-400 text-sm">Weekly P&L</p>
            <p className="text-2xl font-semibold text-gray-100">${mockStats.weeklyPnL.toFixed(2)}</p>
          </div>
        </div>
      </div>
    </div>
  );
}