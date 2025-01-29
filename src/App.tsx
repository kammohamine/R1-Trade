import { Layout, BarChart3, BookOpen, Settings, Brain } from 'lucide-react';
import Dashboard from './components/Dashboard';
import TradeList from './components/TradeList';
import AIAdvisor from './components/AIAdvisor';
import LiveMarketWatch from './components/LiveMarketWatch';

function App() {
  return (
    <div className="flex h-screen bg-gray-900">
      {/* Sidebar */}
      <div className="w-64 bg-gray-800 border-r border-gray-700 px-4 py-6">
        <div className="flex items-center space-x-3 mb-8">
          <Layout className="w-8 h-8 text-blue-400" />
          <span className="text-xl font-bold text-gray-100">TradingPips</span>
        </div>
        
        <nav>
          <ul className="space-y-2">
            <li>
              <a href="#" className="flex items-center space-x-3 px-4 py-2 text-gray-100 bg-gray-700 rounded-lg">
                <BarChart3 className="w-5 h-5" />
                <span>Dashboard</span>
              </a>
            </li>
            <li>
              <a href="#" className="flex items-center space-x-3 px-4 py-2 text-gray-300 hover:bg-gray-700 rounded-lg">
                <Brain className="w-5 h-5" />
                <span>AI Advisor</span>
              </a>
            </li>
            <li>
              <a href="#" className="flex items-center space-x-3 px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">
                <BookOpen className="w-5 h-5" />
                <span>Trade Journal</span>
              </a>
            </li>
            <li>
              <a href="#" className="flex items-center space-x-3 px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">
                <Settings className="w-5 h-5" />
                <span>Settings</span>
              </a>
            </li>
          </ul>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <header className="bg-gray-800 border-b border-gray-700 px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-100">Trading Account</h1>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm text-gray-400">Account Balance</p>
                <p className="text-lg font-semibold text-gray-100">$10,250.75</p>
              </div>
              <button className="bg-blue-700 text-bleu px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors">
                Deposit
              </button>
            </div>
          </div>
        </header> 

        <main>
          <LiveMarketWatch />
          <AIAdvisor />
          <Dashboard />
          <TradeList />
        </main>
      </div>
    </div>
  );
}

export default App;