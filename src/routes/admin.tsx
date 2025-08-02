
import { createSignal, onMount } from 'solid-js';
import { useNavigate } from '@solidjs/router';
import { useLogout } from '~/lib/queries/auth';
import { useCurrentTime } from '~/modules/time';

function AdminPage() {
  const navigate = useNavigate();
  const logout = useLogout();
  const currentTime = useCurrentTime();

  async function handleLogout() {
    await logout.mutateAsync();
    navigate('/login');
  }

  return (
    <div class="container mx-auto p-4">
      <h1 class="text-2xl font-bold">Welcome, Admin!</h1>
      <p>Current time: {currentTime()}</p>
      <button
        onClick={handleLogout}
        class="mt-4 bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
      >
        Logout
      </button>
    </div>
  );
}

export { AdminPage };
