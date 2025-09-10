import { useUser } from "../context/UserContext";
import { useRouter } from "next/router";
import { useEffect } from "react";

export default function ClientDashboard() {
  const { user } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (user === undefined) return;
    if (!user) router.replace("/");
    if (user && user.isAdmin) router.replace("/admin");
  }, [user, router]);

  if (user === undefined) return <div>Loading...</div>;
  if (!user) return <div>Not authorized</div>;

  return (
    <div style={{ maxWidth: 700, margin: "2rem auto", padding: "2rem" }}>
      <h1>Welcome, {user.name}!</h1>
      <h2>Your Portfolio</h2>
      {/* Show portfolio details etc. here */}
    </div>
  );
}