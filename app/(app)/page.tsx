import Welcome from "../components/welcome";

export default async function Page() {
  return (
    <div className="fixed inset-0 bg-background overflow-auto">
      <Welcome />
    </div>
  );
}
