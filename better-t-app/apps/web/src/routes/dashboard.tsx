import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/dashboard")({
  beforeLoad: () => {
    throw redirect({ to: "/admin" });
  },
  component: () => null,
});


function RouteComponent() {
  const { session } = Route.useRouteContext();

  const privateData = useQuery(orpc.privateData.queryOptions());

  return (
    <div>
      <h1>Dashboard</h1>
      <p>Welcome {session.data?.user.name}</p>
      <p>API: {privateData.data?.message}</p>
    </div>
  );
}
