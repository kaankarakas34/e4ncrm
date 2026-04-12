import { getFilledDeals, getUsers } from '../actions';
import FilledClientView from './FilledClientView';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function FilledPage() {
  const sessionCookie = (await cookies()).get('auth_session');
  if (!sessionCookie) redirect('/login');
  
  const session = JSON.parse(sessionCookie.value);

  const filledDeals = await getFilledDeals();
  const users = await getUsers();

  return (
    <div className="fade-up">
      <div className="flex-between mb-8">
        <div>
          <h1 className="page-title">Dolu Koltuk</h1>
          <p className="page-subtitle">Dolu koltuk (Filled) aşamasındaki datalar. Bu havuza tüm kullanıcılar erişebilir ve uygun olan dataları üzerine çekebilir.</p>
        </div>
      </div>
      <FilledClientView initialDeals={filledDeals} users={users} currentUser={session} />
    </div>
  );
}
