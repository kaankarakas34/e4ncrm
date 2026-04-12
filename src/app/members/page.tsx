import { getMembersDeals, getUsers } from '../actions';
import MembersClientView from './MembersClientView';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function MembersPage() {
  const sessionCookie = (await cookies()).get('auth_session');
  if (!sessionCookie) redirect('/login');
  
  const session = JSON.parse(sessionCookie.value);

  const membersDeals = await getMembersDeals();
  const users = await getUsers();

  return (
    <div className="fade-up">
      <div className="flex-between mb-8">
        <div>
          <h1 className="page-title">Üye Olanlar</h1>
          <p className="page-subtitle">Sisteme üye olan müşterilerin havuzu. Bu datalar tüm kullanıcılara açıktır.</p>
        </div>
      </div>
      <MembersClientView initialDeals={membersDeals} users={users} currentUser={session} />
    </div>
  );
}
