import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';

export default function RootPage() {
  redirect('/dashboard');
}
