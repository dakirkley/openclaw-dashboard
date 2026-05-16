import React, { useState } from 'react';
import type { BusinessData, Bot, SubAgent, Skill, ApiConfig } from '../types';
import { BOT_MODELS, SKILL_CATEGORIES, API_PROVIDERS } from '../types';
import * as Icons from './icons';

interface BusinessDetailViewProps {
  businessData: BusinessData;
  onBack: () => void;
  onAddBot: (businessId: string, bot: Omit<Bot, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onUpdateBot: (businessId: string, botId: string, updates: Partial<Bot>) => void;
  onDeleteBot: (businessId: string, botId: string) => void;
  onAddSubAgent: (businessId: string, agent: Omit<SubAgent, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onUpdateSubAgent: (businessId: string, agentId: string, updates: Partial<SubAgent>) => void;
  onDeleteSubAgent: (businessId: string, agentId: string) => void;
  onAddSkill: (businessId: string, skill: Omit<Skill, 'id'>) => void;
  onUpdateSkill: (businessId: string, skillId: string, updates: Partial<Skill>) => void;
  onDeleteSkill: (businessId: string, skillId: string) => void;
  onAddApi: (businessId: string, api: Omit<ApiConfig, 'id'>) => void;
  onUpdateApi: (businessId: string, apiId: string, updates: Partial<ApiConfig>) => void;
  onDeleteApi: (businessId: string, apiId: string) => void;
}

type Section = 'bots' | 'subagents' | 'skills' | 'apis' | 'activity' | 'tasks' | 'memory';

export const BusinessDetailView: React.FC<BusinessDetailViewProps> = ({
  businessData,
  onBack,
  onAddBot,
  onUpdateBot,
  onDeleteBot,
  onAddSubAgent,
  onUpdateSubAgent,
  onDeleteSubAgent,
  onAddSkill,
  onUpdateSkill,
  onDeleteSkill,
  onAddApi,
  onUpdateApi,
  onDeleteApi,
}) => {
  const [activeSection, setActiveSection] = useState<Section>('bots');
  const { business, bots, subAgents, skills, apis } = businessData;

  const renderSection = () => {
    switch (activeSection) {
      case 'bots':
        return (
          <BotsSection
            bots={bots}
            businessId={business.id}
            businessColor={business.color}
            onAdd={onAddBot}
            onUpdate={onUpdateBot}
            onDelete={onDeleteBot}
          />
        );
      case 'subagents':
        return (
          <SubAgentsSection
            subAgents={subAgents}
            bots={bots}
            businessId={business.id}
            businessColor={business.color}
            onAdd={onAddSubAgent}
            onUpdate={onUpdateSubAgent}
            onDelete={onDeleteSubAgent}
          />
        );
      case 'skills':
        return (
          <SkillsSection
            skills={skills}
            businessId={business.id}
            businessColor={business.color}
            onAdd={onAddSkill}
            onUpdate={onUpdateSkill}
            onDelete={onDeleteSkill}
          />
        );
      case 'apis':
        return (
          <ApisSection
            apis={apis}
            businessId={business.id}
            businessColor={business.color}
            onAdd={onAddApi}
            onUpdate={onUpdateApi}
            onDelete={onDeleteApi}
          />
        );
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-4">
        <button onClick={onBack} className="p-2 text-dark-400 hover:text-dark-200 hover:bg-dark-800 rounded-lg">
          <Icons.ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${business.color}20` }}>
              <Icons.Building2 className="w-5 h-5" style={{ color: business.color }} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">{business.name}</h1>
              <p className="text-dark-400 text-sm">{business.description || 'No description'}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon={Icons.Bot} label="Bots" value={bots.length} color={business.color} isActive={activeSection === 'bots'} onClick={() => setActiveSection('bots')} />
        <StatCard icon={Icons.Network} label="Sub-Agents" value={subAgents.length} color={business.color} isActive={activeSection === 'subagents'} onClick={() => setActiveSection('subagents')} />
        <StatCard icon={Icons.Puzzle} label="Skills" value={skills.length} color={business.color} isActive={activeSection === 'skills'} onClick={() => setActiveSection('skills')} />
        <StatCard icon={Icons.Key} label="APIs" value={apis.length} color={business.color} isActive={activeSection === 'apis'} onClick={() => setActiveSection('apis')} />
      </div>

      {renderSection()}
    </div>
  );
};

const StatCard: React.FC<{ icon: any; label: string; value: number; color: string; isActive: boolean; onClick: () => void }> = ({ icon: Icon, label, value, color, isActive, onClick }) => (
  <button onClick={onClick} className={`card p-4 text-left transition-all ${isActive ? 'ring-2 ring-primary-500' : 'hover:scale-[1.02]'}`}>
    <div className="flex items-center justify-between">
      <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${color}20` }}>
        <Icon className="w-5 h-5" style={{ color }} />
      </div>
      <span className="text-2xl font-bold text-white">{value}</span>
    </div>
    <p className="text-dark-400 text-sm mt-2">{label}</p>
  </button>
);

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const colors: Record<string, string> = {
    active: 'bg-green-500/20 text-green-400',
    inactive: 'bg-gray-500/20 text-gray-400',
    error: 'bg-red-500/20 text-red-400',
    idle: 'bg-yellow-500/20 text-yellow-400',
  };
  return <span className={`text-xs px-2 py-1 rounded-full ${colors[status] || colors.inactive}`}>{status}</span>;
};

const Modal: React.FC<{ title: string; onClose: () => void; children: React.ReactNode }> = ({ title, onClose, children }) => (
  <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
    <div className="bg-dark-900 border border-dark-800 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
      <div className="p-6 border-b border-dark-800 flex items-center justify-between">
        <h2 className="text-xl font-bold text-white">{title}</h2>
        <button onClick={onClose} className="text-dark-400 hover:text-dark-200"><Icons.X className="w-5 h-5" /></button>
      </div>
      <div className="p-6">{children}</div>
    </div>
  </div>
);

// Bots Section
const BotsSection: React.FC<{ bots: Bot[]; businessId: string; businessColor: string; onAdd: any; onUpdate: any; onDelete: any }> = ({ bots, businessId, businessColor, onAdd, onUpdate, onDelete }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBot, setEditingBot] = useState<Bot | null>(null);
  const [formData, setFormData] = useState({ name: '', model: BOT_MODELS[0], purpose: '', status: 'active' as 'active' | 'inactive' | 'error', config: {} });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingBot) onUpdate(businessId, editingBot.id, formData);
    else onAdd(businessId, formData);
    setIsModalOpen(false);
    setEditingBot(null);
  };

  const openModal = (bot?: Bot) => {
    if (bot) { setEditingBot(bot); setFormData({ name: bot.name, model: bot.model, purpose: bot.purpose, status: bot.status, config: bot.config }); }
    else { setEditingBot(null); setFormData({ name: '', model: BOT_MODELS[0], purpose: '', status: 'active', config: {} }); }
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-white">Bots</h2>
        <button onClick={() => openModal()} className="btn-primary"><Icons.Plus className="w-4 h-4" />Add Bot</button>
      </div>
      {bots.length === 0 ? (
        <div className="card text-center py-12"><Icons.Bot className="w-12 h-12 text-dark-600 mx-auto mb-3" /><p className="text-dark-400">No bots yet</p></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {bots.map((bot) => (
            <div key={bot.id} className="card-hover group">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${businessColor}20` }}>
                    <Icons.Bot className="w-5 h-5" style={{ color: businessColor }} />
                  </div>
                  <div><h3 className="font-medium text-dark-100">{bot.name}</h3><p className="text-xs text-dark-500">{bot.model}</p></div>
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge status={bot.status} />
                  <button onClick={() => openModal(bot)} className="p-1.5 text-dark-400 hover:text-primary-400 opacity-0 group-hover:opacity-100"><Icons.Edit2 className="w-4 h-4" /></button>
                  <button onClick={() => onDelete(businessId, bot.id)} className="p-1.5 text-dark-400 hover:text-red-400 opacity-0 group-hover:opacity-100"><Icons.Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
              <p className="text-sm text-dark-400 mt-3">{bot.purpose}</p>
            </div>
          ))}
        </div>
      )}
      {isModalOpen && (
        <Modal title={editingBot ? 'Edit Bot' : 'Add Bot'} onClose={() => setIsModalOpen(false)}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div><label className="label">Name *</label><input type="text" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="input" /></div>
            <div><label className="label">Model</label><select value={formData.model} onChange={(e) => setFormData({ ...formData, model: e.target.value })} className="input">{BOT_MODELS.map((m) => <option key={m} value={m}>{m}</option>)}</select></div>
            <div><label className="label">Purpose</label><textarea value={formData.purpose} onChange={(e) => setFormData({ ...formData, purpose: e.target.value })} className="input min-h-[80px] resize-none" /></div>
            <div><label className="label">Status</label><select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value as any })} className="input"><option value="active">Active</option><option value="inactive">Inactive</option><option value="error">Error</option></select></div>
            <div className="flex gap-3 pt-4"><button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary flex-1">Cancel</button><button type="submit" className="btn-primary flex-1 justify-center"><Icons.Save className="w-4 h-4" />{editingBot ? 'Save' : 'Add'}</button></div>
          </form>
        </Modal>
      )}
    </div>
  );
};

// Sub-Agents Section
const SubAgentsSection: React.FC<{ subAgents: SubAgent[]; bots: Bot[]; businessId: string; businessColor: string; onAdd: any; onUpdate: any; onDelete: any }> = ({ subAgents, bots, businessId, businessColor, onAdd, onUpdate, onDelete }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAgent, setEditingAgent] = useState<SubAgent | null>(null);
  const [formData, setFormData] = useState({ name: '', role: '', botId: '', capabilities: [] as string[], status: 'active' as 'active' | 'inactive' | 'idle' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingAgent) onUpdate(businessId, editingAgent.id, formData);
    else onAdd(businessId, formData);
    setIsModalOpen(false);
    setEditingAgent(null);
  };

  const openModal = (agent?: SubAgent) => {
    if (agent) { setEditingAgent(agent); setFormData({ name: agent.name, role: agent.role, botId: agent.botId, capabilities: agent.capabilities, status: agent.status }); }
    else { setEditingAgent(null); setFormData({ name: '', role: '', botId: bots[0]?.id || '', capabilities: [], status: 'active' }); }
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-white">Sub-Agents</h2>
        <button onClick={() => openModal()} className="btn-primary"><Icons.Plus className="w-4 h-4" />Add Sub-Agent</button>
      </div>
      {subAgents.length === 0 ? (
        <div className="card text-center py-12"><Icons.Network className="w-12 h-12 text-dark-600 mx-auto mb-3" /><p className="text-dark-400">No sub-agents yet</p></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {subAgents.map((agent) => (
            <div key={agent.id} className="card-hover group">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${businessColor}20` }}>
                    <Icons.Network className="w-5 h-5" style={{ color: businessColor }} />
                  </div>
                  <div><h3 className="font-medium text-dark-100">{agent.name}</h3><p className="text-xs text-dark-500">{agent.role}</p></div>
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge status={agent.status} />
                  <button onClick={() => openModal(agent)} className="p-1.5 text-dark-400 hover:text-primary-400 opacity-0 group-hover:opacity-100"><Icons.Edit2 className="w-4 h-4" /></button>
                  <button onClick={() => onDelete(businessId, agent.id)} className="p-1.5 text-dark-400 hover:text-red-400 opacity-0 group-hover:opacity-100"><Icons.Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
              <div className="mt-3 flex flex-wrap gap-1">{agent.capabilities.map((cap) => <span key={cap} className="text-xs px-2 py-0.5 bg-dark-800 text-dark-400 rounded">{cap}</span>)}</div>
            </div>
          ))}
        </div>
      )}
      {isModalOpen && (
        <Modal title={editingAgent ? 'Edit Sub-Agent' : 'Add Sub-Agent'} onClose={() => setIsModalOpen(false)}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div><label className="label">Name *</label><input type="text" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="input" /></div>
            <div><label className="label">Role</label><input type="text" value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value })} className="input" placeholder="e.g., Research Assistant" /></div>
            <div><label className="label">Parent Bot</label><select value={formData.botId} onChange={(e) => setFormData({ ...formData, botId: e.target.value })} className="input">{bots.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}</select></div>
            <div><label className="label">Capabilities (comma-separated)</label><input type="text" value={formData.capabilities.join(', ')} onChange={(e) => setFormData({ ...formData, capabilities: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })} className="input" placeholder="web-search, data-analysis" /></div>
            <div className="flex gap-3 pt-4"><button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary flex-1">Cancel</button><button type="submit" className="btn-primary flex-1 justify-center"><Icons.Save className="w-4 h-4" />{editingAgent ? 'Save' : 'Add'}</button></div>
          </form>
        </Modal>
      )}
    </div>
  );
};

// Skills Section
const SkillsSection: React.FC<{ skills: Skill[]; businessId: string; businessColor: string; onAdd: any; onUpdate: any; onDelete: any }> = ({ skills, businessId, businessColor, onAdd, onUpdate, onDelete }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSkill, setEditingSkill] = useState<Skill | null>(null);
  const [formData, setFormData] = useState({ name: '', version: '1.0.0', description: '', category: SKILL_CATEGORIES[0], commands: [] as string[], usedByBots: [] as string[], installedAt: new Date().toISOString() });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingSkill) onUpdate(businessId, editingSkill.id, formData);
    else onAdd(businessId, formData);
    setIsModalOpen(false);
    setEditingSkill(null);
  };

  const openModal = (skill?: Skill) => {
    if (skill) { setEditingSkill(skill); setFormData({ name: skill.name, version: skill.version, description: skill.description, category: skill.category, commands: skill.commands, usedByBots: skill.usedByBots, installedAt: skill.installedAt }); }
    else { setEditingSkill(null); setFormData({ name: '', version: '1.0.0', description: '', category: SKILL_CATEGORIES[0], commands: [], usedByBots: [], installedAt: new Date().toISOString() }); }
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-white">Skills</h2>
        <button onClick={() => openModal()} className="btn-primary"><Icons.Plus className="w-4 h-4" />Add Skill</button>
      </div>
      {skills.length === 0 ? (
        <div className="card text-center py-12"><Icons.Puzzle className="w-12 h-12 text-dark-600 mx-auto mb-3" /><p className="text-dark-400">No skills yet</p></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {skills.map((skill) => (
            <div key={skill.id} className="card-hover group">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${businessColor}20` }}>
                    <Icons.Puzzle className="w-5 h-5" style={{ color: businessColor }} />
                  </div>
                  <div><h3 className="font-medium text-dark-100">{skill.name}</h3><p className="text-xs text-dark-500">v{skill.version} • {skill.category}</p></div>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => openModal(skill)} className="p-1.5 text-dark-400 hover:text-primary-400 opacity-0 group-hover:opacity-100"><Icons.Edit2 className="w-4 h-4" /></button>
                  <button onClick={() => onDelete(businessId, skill.id)} className="p-1.5 text-dark-400 hover:text-red-400 opacity-0 group-hover:opacity-100"><Icons.Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
              <p className="text-sm text-dark-400 mt-2">{skill.description}</p>
              <div className="mt-3 flex flex-wrap gap-1">
                {skill.commands.slice(0, 3).map((cmd) => <span key={cmd} className="text-xs px-2 py-0.5 bg-dark-800 text-dark-400 rounded font-mono">/{cmd}</span>)}
                {skill.commands.length > 3 && <span className="text-xs px-2 py-0.5 text-dark-500">+{skill.commands.length - 3} more</span>}
              </div>
            </div>
          ))}
        </div>
      )}
      {isModalOpen && (
        <Modal title={editingSkill ? 'Edit Skill' : 'Add Skill'} onClose={() => setIsModalOpen(false)}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div><label className="label">Name *</label><input type="text" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="input" /></div>
            <div><label className="label">Version</label><input type="text" value={formData.version} onChange={(e) => setFormData({ ...formData, version: e.target.value })} className="input" /></div>
            <div><label className="label">Category</label><select value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} className="input">{SKILL_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}</select></div>
            <div><label className="label">Description</label><textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="input min-h-[80px] resize-none" /></div>
            <div><label className="label">Commands (comma-separated)</label><input type="text" value={formData.commands.join(', ')} onChange={(e) => setFormData({ ...formData, commands: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })} className="input" placeholder="/command1, /command2" /></div>
            <div className="flex gap-3 pt-4"><button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary flex-1">Cancel</button><button type="submit" className="btn-primary flex-1 justify-center"><Icons.Save className="w-4 h-4" />{editingSkill ? 'Save' : 'Add'}</button></div>
          </form>
        </Modal>
      )}
    </div>
  );
};

// APIs Section
const ApisSection: React.FC<{ apis: ApiConfig[]; businessId: string; businessColor: string; onAdd: any; onUpdate: any; onDelete: any }> = ({ apis, businessId, businessColor, onAdd, onUpdate, onDelete }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingApi, setEditingApi] = useState<ApiConfig | null>(null);
  const [formData, setFormData] = useState({ name: '', provider: API_PROVIDERS[0], keyMasked: '', status: 'active' as 'active' | 'expired' | 'unknown', lastChecked: new Date().toISOString(), usedBySkills: [] as string[], usedByBots: [] as string[] });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const maskedKey = formData.keyMasked ? `••••${formData.keyMasked.slice(-4)}` : editingApi?.keyMasked || '';
    if (editingApi) onUpdate(businessId, editingApi.id, { ...formData, keyMasked: maskedKey || editingApi.keyMasked });
    else onAdd(businessId, { ...formData, keyMasked: maskedKey });
    setIsModalOpen(false);
    setEditingApi(null);
  };

  const openModal = (api?: ApiConfig) => {
    if (api) { setEditingApi(api); setFormData({ name: api.name, provider: api.provider, keyMasked: '', status: api.status, lastChecked: api.lastChecked, usedBySkills: api.usedBySkills, usedByBots: api.usedByBots }); }
    else { setEditingApi(null); setFormData({ name: '', provider: API_PROVIDERS[0], keyMasked: '', status: 'active', lastChecked: new Date().toISOString(), usedBySkills: [], usedByBots: [] }); }
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-white">APIs</h2>
        <button onClick={() => openModal()} className="btn-primary"><Icons.Plus className="w-4 h-4" />Add API</button>
      </div>
      {apis.length === 0 ? (
        <div className="card text-center py-12"><Icons.Key className="w-12 h-12 text-dark-600 mx-auto mb-3" /><p className="text-dark-400">No APIs configured yet</p></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {apis.map((api) => (
            <div key={api.id} className="card-hover group">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${businessColor}20` }}>
                    <Icons.Key className="w-5 h-5" style={{ color: businessColor }} />
                  </div>
                  <div><h3 className="font-medium text-dark-100">{api.name}</h3><p className="text-xs text-dark-500">{api.provider}</p></div>
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge status={api.status} />
                  <button onClick={() => openModal(api)} className="p-1.5 text-dark-400 hover:text-primary-400 opacity-0 group-hover:opacity-100"><Icons.Edit2 className="w-4 h-4" /></button>
                  <button onClick={() => onDelete(businessId, api.id)} className="p-1.5 text-dark-400 hover:text-red-400 opacity-0 group-hover:opacity-100"><Icons.Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
              <p className="text-sm text-dark-400 mt-2 font-mono">{api.keyMasked}</p>
            </div>
          ))}
        </div>
      )}
      {isModalOpen && (
        <Modal title={editingApi ? 'Edit API' : 'Add API'} onClose={() => setIsModalOpen(false)}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div><label className="label">Name *</label><input type="text" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="input" /></div>
            <div><label className="label">Provider</label><select value={formData.provider} onChange={(e) => setFormData({ ...formData, provider: e.target.value })} className="input">{API_PROVIDERS.map((p) => <option key={p} value={p}>{p}</option>)}</select></div>
            <div><label className="label">API Key {editingApi && '(leave blank to keep existing)'}</label><input type="password" value={formData.keyMasked} onChange={(e) => setFormData({ ...formData, keyMasked: e.target.value })} className="input" placeholder="Enter API key" /></div>
            <div><label className="label">Status</label><select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value as any })} className="input"><option value="active">Active</option><option value="expired">Expired</option><option value="unknown">Unknown</option></select></div>
            <div className="flex gap-3 pt-4"><button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary flex-1">Cancel</button><button type="submit" className="btn-primary flex-1 justify-center"><Icons.Save className="w-4 h-4" />{editingApi ? 'Save' : 'Add'}</button></div>
          </form>
        </Modal>
      )}
    </div>
  );
};
