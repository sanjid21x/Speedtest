import React, { useState, useMemo } from 'react';
import { NetworkCategory, SpeedTestServer } from '../types/speedtest';
import {
  getAllServers,
  saveCustomServer,
  deleteCustomServer,
  setActiveServerId,
  NETWORK_CATEGORIES,
} from '../services/servers';
import { Server, Plus, Trash2, X, CheckCircle, MapPin, Search, Globe, ChevronDown } from 'lucide-react';

interface ServerSelectorProps {
  activeServer: SpeedTestServer;
  onServerChange: (server: SpeedTestServer) => void;
  disabled: boolean;
  theme: 'dark' | 'light';
}

export const ServerSelector: React.FC<ServerSelectorProps> = ({
  activeServer,
  onServerChange,
  disabled,
  theme,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [servers, setServers] = useState<SpeedTestServer[]>(() => getAllServers());
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Form state for custom server
  const [formName, setFormName] = useState('');
  const [formLocation, setFormLocation] = useState('');
  const [formCategory, setFormCategory] = useState<NetworkCategory>('bdix');
  const [formPingUrl, setFormPingUrl] = useState('');
  const [formDownloadUrl, setFormDownloadUrl] = useState('');
  const [formUploadUrl, setFormUploadUrl] = useState('');

  const refreshList = () => {
    const list = getAllServers();
    setServers(list);
  };

  const handleSelect = (server: SpeedTestServer) => {
    setActiveServerId(server.id);
    onServerChange(server);
    setIsOpen(false);
  };

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    deleteCustomServer(id);
    refreshList();
    if (activeServer.id === id) {
      const remaining = getAllServers();
      handleSelect(remaining[0]);
    }
  };

  const handleSaveCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName || !formPingUrl) return;

    const newServer = saveCustomServer({
      id: `custom-${Date.now()}`,
      name: formName.trim(),
      location: formLocation.trim() || 'Custom Node',
      provider: 'Custom Dedicated Server',
      category: formCategory,
      pingUrl: formPingUrl.trim(),
      downloadBaseUrl: formDownloadUrl.trim() || formPingUrl.trim(),
      uploadUrl: formUploadUrl.trim() || formPingUrl.trim(),
    });

    refreshList();
    setShowAddModal(false);
    handleSelect(newServer);

    // Reset form
    setFormName('');
    setFormLocation('');
    setFormPingUrl('');
    setFormDownloadUrl('');
    setFormUploadUrl('');
  };

  const filteredServers = useMemo(() => {
    return servers.filter((s) => {
      const matchesSearch =
        searchQuery === '' ||
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.provider.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (s.country && s.country.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesCat = selectedCategory === 'all' || s.category === selectedCategory;

      return matchesSearch && matchesCat;
    });
  }, [servers, searchQuery, selectedCategory]);

  const isDark = theme === 'dark';

  return (
    <div className="relative">
      {/* Trigger Button */}
      <button
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        type="button"
        className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border transition-all cursor-pointer ${
          disabled ? 'opacity-60 cursor-not-allowed' : 'hover:border-cyan-500/50 hover:shadow-cyan-500/20 shadow-sm'
        } ${
          isDark
            ? 'bg-slate-900/80 border-slate-800 text-slate-300'
            : 'bg-white border-slate-200 text-slate-700 shadow-sm'
        }`}
      >
        <Server className="w-3.5 h-3.5 text-cyan-400" />
        <span className="text-sm">{activeServer.flag || '🌐'}</span>
        <span className="font-semibold text-slate-200 truncate max-w-[120px] sm:max-w-[180px]">
          {activeServer.name}
        </span>
        <span className="text-[10px] px-1.5 py-0.5 rounded font-mono font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 hidden sm:inline">
          {activeServer.categoryLabel}
        </span>
        <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
      </button>

      {/* Vast Server Dropdown Modal */}
      {isOpen && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setIsOpen(false)} />
          <div
            className={`absolute right-0 sm:left-0 sm:right-auto mt-2 w-88 sm:w-[460px] rounded-2xl border p-3 shadow-2xl z-40 animate-fade-in ${
              isDark
                ? 'bg-slate-900/95 border-slate-800 text-slate-100 backdrop-blur-2xl'
                : 'bg-white border-slate-200 text-slate-800 shadow-slate-200'
            }`}
          >
            {/* Header & Add Button */}
            <div className="flex items-center justify-between px-2 pb-2.5 border-b border-slate-800/40">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5" />
                  Select Endpoint ({servers.length} Available)
                </span>
                <p className="text-[10px] text-slate-400">
                  Select BDIX, IIG, FNA, GGC, or CDN test endpoint
                </p>
              </div>
              <button
                onClick={() => {
                  setIsOpen(false);
                  setShowAddModal(true);
                }}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 text-xs font-bold transition-all cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Custom Node</span>
              </button>
            </div>

            {/* Live Search Input */}
            <div className="relative mt-2.5 mb-2">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by city, country, ISP, or provider..."
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl bg-slate-950/70 border border-slate-800 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* Category Quick Filter */}
            <div className="flex items-center gap-1 overflow-x-auto py-1 scrollbar-none mb-2 text-[11px]">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-2.5 py-0.5 rounded-lg font-medium whitespace-nowrap transition-all ${
                  selectedCategory === 'all'
                    ? 'bg-cyan-500 text-slate-950 font-bold'
                    : 'bg-slate-800/60 text-slate-400 hover:text-slate-200'
                }`}
              >
                All ({servers.length})
              </button>
              {NETWORK_CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-2 py-0.5 rounded-lg font-medium whitespace-nowrap transition-all ${
                    selectedCategory === cat.id
                      ? 'bg-cyan-500 text-slate-950 font-bold'
                      : 'bg-slate-800/60 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {cat.badge}
                </button>
              ))}
            </div>

            {/* Server List */}
            <div className="max-h-80 overflow-y-auto divide-y divide-slate-800/20 pr-1 space-y-1">
              {filteredServers.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-500">
                  No servers match "{searchQuery}"
                </div>
              ) : (
                filteredServers.map((srv) => {
                  const isSelected = srv.id === activeServer.id;
                  return (
                    <div
                      key={srv.id}
                      onClick={() => handleSelect(srv)}
                      className={`flex items-center justify-between px-3 py-2.5 rounded-xl cursor-pointer transition-colors ${
                        isSelected
                          ? 'bg-cyan-500/15 border border-cyan-500/30 text-cyan-200'
                          : isDark
                          ? 'hover:bg-slate-800/60 text-slate-300'
                          : 'hover:bg-slate-100 text-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 truncate pr-2">
                        <span className="text-lg">{srv.flag || '🌐'}</span>
                        <div className="flex flex-col truncate">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-xs truncate text-slate-100">
                              {srv.name}
                            </span>
                            <span className="text-[9px] px-1.5 py-0.5 rounded font-mono font-semibold bg-slate-800 text-cyan-400 border border-slate-700">
                              {srv.categoryLabel}
                            </span>
                            {srv.isCustom && (
                              <span className="text-[9px] px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300">
                                Custom
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] text-slate-400 truncate">
                            {srv.location} • <span className="text-slate-500">{srv.provider}</span>
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {isSelected && <CheckCircle className="w-4 h-4 text-cyan-400" />}
                        {srv.isCustom && (
                          <button
                            onClick={(e) => handleDelete(e, srv.id)}
                            type="button"
                            className="p-1 rounded text-slate-500 hover:text-rose-400 transition-colors"
                            title="Delete custom node"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <div className="p-2 border-t border-slate-800/40 text-[10px] text-slate-400 flex items-center justify-between">
              <span>Select any node for targeted bandwidth & routing analysis.</span>
              <span className="font-mono text-cyan-400 font-bold">{filteredServers.length} nodes</span>
            </div>
          </div>
        </>
      )}

      {/* Add Custom Node Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
          <div
            className={`w-full max-w-md rounded-2xl border p-6 shadow-2xl ${
              isDark
                ? 'bg-slate-900 border-slate-800 text-slate-100'
                : 'bg-white border-slate-200 text-slate-800'
            }`}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-800/50">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-cyan-400" />
                <h3 className="text-base font-bold">Add Custom Speed Node</h3>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCustom} className="space-y-3 mt-4 text-xs">
              <div>
                <label className="block text-slate-400 font-medium mb-1">
                  Routing Category *
                </label>
                <select
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value as NetworkCategory)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-100 focus:outline-none focus:border-cyan-500"
                >
                  {NETWORK_CATEGORIES.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name} ({cat.tag})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">
                  Server Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., My ISP Local FTP Node"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-100 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">
                  Location (City / Region)
                </label>
                <input
                  type="text"
                  placeholder="e.g., Dhaka, Gulshan-2"
                  value={formLocation}
                  onChange={(e) => setFormLocation(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-100 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">
                  Ping Endpoint URL (HTTPS) *
                </label>
                <input
                  type="url"
                  required
                  placeholder="https://..."
                  value={formPingUrl}
                  onChange={(e) => setFormPingUrl(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-100 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">
                  Download Chunk URL (Optional)
                </label>
                <input
                  type="url"
                  placeholder="https://.../?bytes={bytes}"
                  value={formDownloadUrl}
                  onChange={(e) => setFormDownloadUrl(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-100 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">
                  Upload Endpoint URL (Optional)
                </label>
                <input
                  type="url"
                  placeholder="https://.../__up"
                  value={formUploadUrl}
                  onChange={(e) => setFormUploadUrl(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-100 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800/50">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 rounded-lg border border-slate-700 text-slate-300 hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold"
                >
                  Save Endpoint
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
