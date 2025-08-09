import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "../supabaseClient";

export default function VerifyEmailPage() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const confirmEmail = async () => {
      const params = new URLSearchParams(location.search);
      const access_token = params.get("access_token");
      const refresh_token = params.get("refresh_token");

      if (!access_token) {
        // No token? Send to login
        navigate("/login");
        return;
      }

      // Use tokens to set session (sign user in)
      const { error } = await supabase.auth.setSession({
        access_token,
        refresh_token,
      });

      if (error) {
        // Could not set session → send to login
        navigate("/login");
        return;
      }

      // Session set, now check if email confirmed
      const { data } = await supabase.auth.getSession();
      const session = data?.session;

      if (session && session.user.email_confirmed_at) {
        navigate("/dashboard");
      } else {
        navigate("/login");
      }
    };

    confirmEmail();
  }, [location.search, navigate]);

  return <div className="text-white p-8">Verifying your email...</div>;
}