//import React from 'react';
import { Trade } from '../types';
import { ArrowUpRight, ArrowDownRight, Clock } from 'lucide-react';

const mockTrades: Trade[] = [
  {
    id: '1',
    pair: 'EUR/USD',
    type: 'BUY',
    entryPrice: 1.0850,
    exitPrice: 1.0900,
    size: 1.0,
    date: new Date('2024-03-10'),
    status: 'CLOSED',
    pnl: 50,
    notes: 'Strong trend following trade'
  },
  {
    id: '2',
    pair: 'GBP/JPY',
    type: 'SELL',
    entryPrice: 185.500,
    size: 0.5,
    date: new Date('2024-03-11'),
    status: 'OPEN',
    notes: 'Technical breakdown at resistance'
  }
];

export default function TradeList() {
  return (
    <div className="p-6 bg-gray-800 rounded-lg shadow-md border border-gray-700">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <Clock className="w-6 h-6 text-blue-400" />
          <h2 className="text-2xl font-bold text-gray-100">Recent Trades</h2>
        </div>
      </div>

      <div className="space-y-4">
        {mockTrades.map(trade => (
          <div key={trade.id} className="bg-gray-800 rounded-xl p-4 border border-gray-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className={`${trade.type === 'BUY' ? 'bg-green-900 text-green-300' : 'bg-red-900 text-red-300'} px-3 py-1 rounded-full text-sm font-medium`}>
                  {trade.type}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-100">{trade.pair}</h3>
                  <p className="text-sm text-gray-400">{trade.status}</p>
                </div>
              </div>
              <div className="text-right">
                {trade.status === 'CLOSED' && (
                  <p className={`font-semibold flex items-center ${(trade.pnl ?? 0) > 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {(trade.pnl ?? 0) > 0 ? <ArrowUpRight className="w-4 h-4 mr-1" /> : <ArrowDownRight className="w-4 h-4 mr-1" />}
                    {(trade.pnl ?? 0) > 0 ? `+$${trade.pnl}` : `-$${Math.abs(trade.pnl ?? 0)}`}
                  </p>
                )}
                <p className="text-sm text-gray-400">
                  {trade.entryPrice} {trade.exitPrice ? `→ ${trade.exitPrice}` : ''}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 text-center">
        <button className="text-blue-400 hover:text-blue-300 text-sm font-medium">
          View All Trades →
        </button>
      </div>
    </div>
  );
}