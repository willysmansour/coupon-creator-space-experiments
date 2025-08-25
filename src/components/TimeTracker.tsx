import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, Pause } from "lucide-react";
import { useState } from "react";

export function TimeTracker() {
  const [isRunning, setIsRunning] = useState(true);
  const [time] = useState("01:24:08");

  return (
    <Card className="p-6 bg-gradient-to-br from-slate-900 to-slate-800 text-white">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Time Tracker</h3>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => setIsRunning(!isRunning)}
          className="text-white hover:bg-white/10"
        >
          {isRunning ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
        </Button>
      </div>
      
      <div className="text-center">
        <div className="text-3xl font-mono font-bold mb-2">{time}</div>
        <p className="text-sm text-white/60">Current session time</p>
      </div>
      
      <div className="mt-4 h-1 bg-white/20 rounded-full overflow-hidden">
        <div className="h-full bg-primary rounded-full w-3/4 transition-all duration-300"></div>
      </div>
    </Card>
  );
}