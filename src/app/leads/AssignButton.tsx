'use client';

import { useState } from 'react';
import { assignLeadToUser } from '../actions';
import { UserPlus } from 'lucide-react';

export default function AssignButton({ leadId, users, onAssign }: { leadId: number, users: any[], onAssign?: () => void }) {
  const [loading, setLoading] = useState(false);

  const handleAssign = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const userId = Number(e.target.value);
    if (!userId) return;
    
    setLoading(true);
    await assignLeadToUser(leadId, userId);
    setLoading(false);
    if (onAssign) onAssign();
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--bg-base)', padding: '4px', borderRadius: '6px', border: '1px solid var(--border)' }}>
      <UserPlus size={14} color="var(--gray-400)" style={{ marginLeft: '4px' }} />
      <select 
        disabled={loading}
        onChange={handleAssign}
        defaultValue=""
        style={{
          background: 'transparent',
          border: 'none',
          color: 'var(--gray-300)',
          fontSize: '13px',
          outline: 'none',
          cursor: 'pointer',
          width: '120px'
        }}
      >
        <option value="" disabled>Ata (Agent)</option>
        {users.map(user => (
          <option key={user.id} value={user.id}>{user.name}</option>
        ))}
      </select>
    </div>
  );
}
