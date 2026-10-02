import React, { useState } from 'react';
import { NetworkCategory, SpeedTestServer } from '../types/speedtest';
import {
  getAllServers,
  saveCustomServer,
  deleteCustomServer,
  setSelectedServerId,
  NETWORK_CATEGORIES,
} from '../services/servers';
import { Server, Plus, Trash2, X, CheckCircle, MapPin, Tag } from 'lucide-react';

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
  const [servers, setServers] = useState<SpeedTestServer[]>(getAllServers());

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
    setSelectedServerId(server.id);
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

  return (
    <div className="relative">
      {/* Trigger Button */}
      <button
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        type="button"
        className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border transition-all cursor-pointer ${
          disabled ? 'opacity-60 cursor-not-allowed' : 'hover:border-cyan-500/50'
        } ${
          theme === 'dark'
            ? 'bg-slate-900/80 border-slate-800 text-slate-300'
            : 'bg-white border-slate-200 text-slate-700 shadow-sm'
        }`}
      >
        <Server className="w-3.5 h-3.5 text-cyan-400" />
        <span className="font-semibold text-slate-200 truncate max-w-[120px] sm:max-w-[170px]">
          {activeServer.name}
        </span>
        <span className="text-[10px] px-1.5 py-0.2 rounded font-mono font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 hidden sm:inline">
          {activeServer.categoryLabel}
        </span>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-30"
            onClick={() => setIsOpen(false)}
          />
          <div
            className={`absolute right-0 sm:left-0 sm:right-auto mt-2 w-80 sm:w-96 rounded-2xl border p-2 shadow-2xl z-40 animate-fade-in ${
              theme === 'dark'
                ? 'bg-slate-900/95 border-slate-800 text-slate-100 backdrop-blur-xl'
                : 'bg-white border-slate-200 text-slate-800 shadow-slate-200'
            }`}
          >
            <div className="flex items-center justify-between px-3 py-2 border-b border-slate-800/40">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Select Test Endpoint
                </span>
                <p className="text-[10px] text-slate-500">Global CDN, GGC, FNA, IIG, BDIX</p>
              </div>
              <button
                onClick={() => {
                  setIsOpen(false);
                  setShowAddModal(true);
                }}
                className="flex items-center gap-1 text-[11px] font-semibold text-cyan-400 hover:text-cyan-300 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Node</span>
              </button>
            </div>

            <div className="max-h-72 overflow-y-auto divide-y divide-slate-800/20 py-1">
              {servers.map((srv) => {
                const isSelected = srv.id === activeServer.id;
                return (
                  <div
                    key={srv.id}
                    onClick={() => handleSelect(srv)}
                    className={`flex items-center justify-between px-3 py-2.5 rounded-lg cursor-pointer transition-colors ${
                      isSelected
                        ? theme === 'dark'
                          ? 'bg-cyan-500/10 text-cyan-300'
                          : 'bg-cyan-50 text-cyan-900'
                        : theme === 'dark'
                        ? 'hover:bg-slate-800/60 text-slate-300'
                        : 'hover:bg-slate-100 text-slate-700'
                    }`}
                  >
                    <div className="flex flex-col truncate pr-2">
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-xs truncate">
                          {srv.name}
                        </span>
                        <span className="text-[9px] px-1.5 py-0.2 rounded font-mono font-medium bg-slate-800 text-slate-300 border border-slate-700">
                          {srv.categoryLabel}
                        </span>
                        {srv.isCustom && (
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-300">
                            Custom
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-400 truncate">
                        {srv.location}
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      {isSelected && (
                        <CheckCircle className="w-4 h-4 text-cyan-400 shrink-0" />
                      )}
                      {srv.isCustom && (
                        <button
                          onClick={(e) => handleDelete(e, srv.id)}
                          type="button"
                          className="p-1 rounded text-slate-500 hover:text-rose-400 transition-colors cursor-pointer"
                          title="Delete custom node"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="p-2 border-t border-slate-800/40 text-[10px] text-slate-500">
              Supports dedicated local peering (BDIX), Google GGC, Meta FNA, and International IIG gateways.
            </div>
          </div>
        </>
      )}

      {/* Add Custom Node Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div
            className={`w-full max-w-md rounded-2xl border p-6 shadow-2xl ${
              theme === 'dark'
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
                  placeholder="e.g. Circle Network BDIX or Local ISP Node"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-100 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">
                  Location / City
                </label>
                <input
                  type="text"
                  placeholder="e.g. Dhaka, Chittagong, Sylhet, Rajshahi"
                  value={formLocation}
                  onChange={(e) => setFormLocation(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-100 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">
                  Ping Probe URL (HEAD/GET with CORS) *
                </label>
                <input
                  type="url"
                  required
                  placeholder="https://speed.your-isp.net/ping"
                  value={formPingUrl}
                  onChange={(e) => setFormPingUrl(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-100 focus:outline-none focus:border-cyan-500 font-mono text-[11px]"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">
                  Download Chunk URL
                </label>
                <input
                  type="url"
                  placeholder="https://speed.your-isp.net/download?bytes={bytes}"
                  value={formDownloadUrl}
                  onChange={(e) => setFormDownloadUrl(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-100 focus:outline-none focus:border-cyan-500 font-mono text-[11px]"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">
                  Upload Endpoint URL (POST with CORS)
                </label>
                <input
                  type="url"
                  placeholder="https://speed.your-isp.net/upload"
                  value={formUploadUrl}
                  onChange={(e) => setFormUploadUrl(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-100 focus:outline-none focus:border-cyan-500 font-mono text-[11px]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800/40">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-lg text-slate-400 hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg font-bold text-white bg-cyan-600 hover:bg-cyan-500 transition-colors cursor-pointer"
                >
                  Save Node
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
