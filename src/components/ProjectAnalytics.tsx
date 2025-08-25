import { Card } from "@/components/ui/card";

export function ProjectAnalytics() {
  const chartData = [
    { day: "S", height: 20 },
    { day: "M", height: 60 },
    { day: "T", height: 80 },
    { day: "W", height: 100 },
    { day: "T", height: 40 },
    { day: "F", height: 30 },
    { day: "S", height: 25 },
  ];

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold text-foreground mb-6">Project Analytics</h3>
      
      <div className="flex items-end gap-2 h-32">
        {chartData.map((item, index) => (
          <div key={index} className="flex flex-col items-center flex-1">
            <div 
              className={`w-full rounded-t-lg transition-all duration-300 ${
                item.height > 70 ? "bg-primary" : "bg-muted"
              }`}
              style={{ height: `${item.height}%` }}
            />
            <span className="text-xs text-muted-foreground mt-2">{item.day}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}