export function SpringMetric({ api }: { api: string }) {
    return (
      <div className="p-4">
        <h1 className="text-2xl font-bold">Spring Metrics</h1>
        <p>API: {api}</p>
      </div>
    );
  }