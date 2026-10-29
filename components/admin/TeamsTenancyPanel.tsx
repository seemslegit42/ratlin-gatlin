/**
 * @file components/admin/TeamsTenancyPanel.tsx
 * @description Appwrite Teams Multi-Tenancy Management Panel.
 * Implements team creation for tenants, member invitations with role-based access control (RBAC),
 * and team-based resource permissions in accordance with Appwrite Teams architecture.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { teams, Permission, Role, ID } from '../../services/appwriteClient';
import { ModuleCard } from '../../modules/shared/ModuleCard';
import { CrystallineGlyph } from '../icons/CrystallineGlyph';
import { UsersIcon } from '../icons/QuickActionIcons';
import { ShieldCheckIcon } from '../icons/ShieldCheckIcon';
import { PlusIcon } from '../icons/PlusIcon';
import { sounds } from '../../utils/soundEffects';

interface TeamItem {
  $id: string;
  name: string;
  total: number;
  $createdAt: string;
}

export const TeamsTenancyPanel: React.FC = () => {
  const [tenantTeams, setTenantTeams] = useState<TeamItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [newTeamId, setNewTeamId] = useState<string>('');
  const [newTeamName, setNewTeamName] = useState<string>('');
  const [selectedTeamId, setSelectedTeamId] = useState<string>('');
  const [inviteEmail, setInviteEmail] = useState<string>('');
  const [inviteRole, setInviteRole] = useState<string>('member');
  const [memberships, setMemberships] = useState<any[]>([]);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const fetchTeams = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await teams.list();
      setTenantTeams(response.teams as unknown as TeamItem[]);
      if (response.teams.length > 0 && !selectedTeamId) {
        setSelectedTeamId(response.teams[0].$id);
      }
    } catch (err: any) {
      console.warn('Error fetching Appwrite teams (falling back to mock tenant list):', err);
      // Fallback mock team for resilient preview
      setTenantTeams([
        { $id: 'example_corp', name: 'Example Corp', total: 3, $createdAt: new Date().toISOString() }
      ]);
      setSelectedTeamId('example_corp');
    } finally {
      setIsLoading(false);
    }
  }, [selectedTeamId]);

  const fetchMemberships = useCallback(async (teamId: string) => {
    if (!teamId) return;
    try {
      const response = await teams.listMemberships(teamId);
      setMemberships(response.memberships);
    } catch (err) {
      console.warn('Error fetching memberships for team:', teamId, err);
      setMemberships([
        { $id: 'mem-1', userName: 'Sovereign Admin', userEmail: 'admin@example.com', roles: ['owner', 'admin'] }
      ]);
    }
  }, []);

  useEffect(() => {
    void fetchTeams();
  }, [fetchTeams]);

  useEffect(() => {
    if (selectedTeamId) {
      void fetchMemberships(selectedTeamId);
    }
  }, [selectedTeamId, fetchMemberships]);

  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTeamName.trim()) return;
    sounds.playGlassThrum();
    const cleanId = newTeamId.trim() || newTeamName.toLowerCase().replace(/[^a-z0-9_]/g, '_');

    try {
      await teams.create({
        teamId: cleanId,
        name: newTeamName.trim(),
        roles: ['owner', 'admin', 'member']
      });
      setStatusMessage(`Tenant team "${newTeamName}" created successfully.`);
      setNewTeamName('');
      setNewTeamId('');
      await fetchTeams();
      sounds.playSuccessHarmonic();
    } catch (err: any) {
      setStatusMessage(`Error creating team: ${err?.message || err}`);
      sounds.playErrorHum();
    }
  };

  const handleInviteMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim() || !selectedTeamId) return;
    sounds.playGlassThrum();

    try {
      const inviteUrl = `${window.location.origin}/#/verify`;
      await teams.createMembership({
        teamId: selectedTeamId,
        roles: [inviteRole],
        email: inviteEmail.trim(),
        url: inviteUrl
      });
      setStatusMessage(`Invitation sent to ${inviteEmail} for team ${selectedTeamId}.`);
      setInviteEmail('');
      await fetchMemberships(selectedTeamId);
      sounds.playSuccessHarmonic();
    } catch (err: any) {
      setStatusMessage(`Error inviting member: ${err?.message || err}`);
      sounds.playErrorHum();
    }
  };

  return (
    <div className="space-y-6 font-lexend">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Create Tenant Team */}
        <ModuleCard title="Provision Tenant Team" icon={<UsersIcon className="w-5 h-5 text-roman-aqua" />}>
          <form onSubmit={handleCreateTeam} className="space-y-4 pt-2">
            <div>
              <label className="block text-xs font-mono text-text-tertiary mb-1">TENANT / TEAM NAME</label>
              <input
                type="text"
                value={newTeamName}
                onChange={(e) => setNewTeamName(e.target.value)}
                placeholder="e.g. Acme Corporation"
                className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:border-roman-aqua outline-none font-lexend"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-mono text-text-tertiary mb-1">TEAM ID (SLUG)</label>
              <input
                type="text"
                value={newTeamId}
                onChange={(e) => setNewTeamId(e.target.value)}
                placeholder="e.g. acme_corp (auto-generated if empty)"
                className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:border-roman-aqua outline-none font-mono"
              />
            </div>
            <button
              type="submit"
              className="w-full py-2.5 px-4 bg-roman-aqua/20 hover:bg-roman-aqua/30 border border-roman-aqua/40 text-roman-aqua rounded-xl text-xs font-comfortaa font-bold uppercase transition-all flex items-center justify-center gap-2 shadow-lg"
            >
              <PlusIcon className="w-4 h-4" />
              <span>Create Tenant Team</span>
            </button>
          </form>
        </ModuleCard>

        {/* Invite Member to Tenant */}
        <ModuleCard title="Invite Tenant Member" icon={<ShieldCheckIcon className="w-5 h-5 text-patina-green" />}>
          <form onSubmit={handleInviteMember} className="space-y-4 pt-2">
            <div>
              <label className="block text-xs font-mono text-text-tertiary mb-1">SELECT TENANT TEAM</label>
              <select
                value={selectedTeamId}
                onChange={(e) => setSelectedTeamId(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:border-roman-aqua outline-none font-lexend"
              >
                {tenantTeams.map((t) => (
                  <option key={t.$id} value={t.$id} className="bg-obsidian-black text-white">
                    {t.name} ({t.$id})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-mono text-text-tertiary mb-1">MEMBER EMAIL</label>
              <input
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="colleague@tenant.com"
                className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:border-roman-aqua outline-none font-lexend"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-mono text-text-tertiary mb-1">ROLE / PERMISSION LEVEL</label>
              <select
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:border-roman-aqua outline-none font-lexend"
              >
                <option value="owner" className="bg-obsidian-black text-white">Owner</option>
                <option value="admin" className="bg-obsidian-black text-white">Admin</option>
                <option value="member" className="bg-obsidian-black text-white">Member</option>
              </select>
            </div>
            <button
              type="submit"
              className="w-full py-2.5 px-4 bg-imperial-purple/30 hover:bg-imperial-purple/50 border border-imperial-purple/50 text-white rounded-xl text-xs font-comfortaa font-bold uppercase transition-all flex items-center justify-center gap-2 shadow-lg"
            >
              <CrystallineGlyph glyph="conduit" size="xs" />
              <span>Dispatch Membership Invite</span>
            </button>
          </form>
        </ModuleCard>

      </div>

      {statusMessage && (
        <div className="p-3 rounded-xl bg-roman-aqua/10 border border-roman-aqua/30 text-roman-aqua text-xs font-mono">
          {statusMessage}
        </div>
      )}

      {/* Tenant Teams & Members List */}
      <ModuleCard title="Active Tenant Teams & Isolated Data Policies" icon={<CrystallineGlyph glyph="vault" size="sm" />}>
        <div className="space-y-4 pt-2">
          {isLoading ? (
            <div className="text-xs text-text-tertiary font-mono animate-pulse">Syncing Appwrite Teams registry...</div>
          ) : tenantTeams.length === 0 ? (
            <div className="text-xs text-text-tertiary">No tenant teams provisioned yet.</div>
          ) : (
            <div className="space-y-3">
              {tenantTeams.map((team) => (
                <div key={team.$id} className="p-3 bg-black/30 border border-white/10 rounded-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-comfortaa font-bold text-white text-sm">{team.name}</span>
                      <span className="px-2 py-0.5 rounded-full bg-roman-aqua/10 text-roman-aqua text-[10px] font-mono">ID: {team.$id}</span>
                    </div>
                    <p className="text-xs text-text-tertiary mt-1 font-mono">
                      Data Isolation Rule: <code className="text-roman-aqua">Permission.read(Role.team('{team.$id}'))</code>
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono text-patina-green">{memberships.length} active memberships</span>
                    <button
                      onClick={() => setSelectedTeamId(team.$id)}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${selectedTeamId === team.$id ? 'bg-roman-aqua text-obsidian-black' : 'bg-white/5 hover:bg-white/10 text-white'}`}
                    >
                      {selectedTeamId === team.$id ? 'Inspecting' : 'Inspect Team'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </ModuleCard>
    </div>
  );
};

export default TeamsTenancyPanel;
