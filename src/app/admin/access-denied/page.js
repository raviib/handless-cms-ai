'use client';
import "@/app/styles/Error/403.scss";
import { useRouter } from 'next/navigation';

const AccessRestricted = () => {
  const router = useRouter();

  return (
    <div className="access-wrapper">
      <div className="lock"></div>

      <div className="message">
        <h1>Access to this page is restricted</h1>
        <p>Please check with the site admin if you believe this is a mistake.</p>

        <button
          className="dashboard-btn"
          onClick={() => router.push("/admin/dashboard")}
        >
          Go to Dashboard
        </button>
      </div>
    </div>
  );
};

export default AccessRestricted;
