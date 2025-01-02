export default function Home() {
  return (
    <div className="grid gap-6">
      <section>
        <h2 className="text-2xl font-semibold mb-4">Overview</h2>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="p-6 bg-card text-card-foreground rounded-lg shadow">
            <h3 className="font-medium mb-2">Today's Expenses</h3>
            <p className="text-3xl font-bold">$45.67</p>
          </div>
          <div className="p-6 bg-card text-card-foreground rounded-lg shadow">
            <h3 className="font-medium mb-2">This Month</h3>
            <p className="text-3xl font-bold">$1,234.56</p>
          </div>
          <div className="p-6 bg-card text-card-foreground rounded-lg shadow">
            <h3 className="font-medium mb-2">This Year</h3>
            <p className="text-3xl font-bold">$15,678.90</p>
          </div>
        </div>
      </section>
      <section>
        <h2 className="text-2xl font-semibold mb-4">Recent Transactions</h2>
        <div className="bg-card text-card-foreground rounded-lg shadow">
          <div className="p-6">
            <p className="text-muted-foreground">
              Placeholder for recent transactions list
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
