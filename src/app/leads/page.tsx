import { getLeads, getUsers } from '../actions';
import LeadsClientView from './LeadsClientView';

export const dynamic = 'force-dynamic';

export default async function LeadsPage() {
  const leads = await getLeads('New'); 
  const users = await getUsers();

  return (
    <div>
      <LeadsClientView initialLeads={leads} users={users} />
    </div>
  );
}
