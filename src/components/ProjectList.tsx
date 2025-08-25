import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Zap, Palette, Globe, Settings } from "lucide-react";

const projects = [
  {
    id: 1,
    name: "Develop API Endpoints",
    icon: Zap,
    color: "text-primary",
    status: "In Progress",
    dueDate: "Due date Nov 20, 2024"
  },
  {
    id: 2,
    name: "Onboarding Flow",
    icon: Palette,
    color: "text-blue-500",
    status: "Completed",
    dueDate: "Due date Dec 20, 2024"
  },
  {
    id: 3,
    name: "Build Dashboard",
    icon: Globe,
    color: "text-purple-500",
    status: "In Progress",
    dueDate: "Due date Nov 20, 2024"
  },
  {
    id: 4,
    name: "Optimize Page Load",
    icon: Settings,
    color: "text-orange-500",
    status: "Completed",
    dueDate: "Due date Dec 20, 2024"
  },
  {
    id: 5,
    name: "Cross-Browser Testing",
    icon: Globe,
    color: "text-green-500",
    status: "In Progress",
    dueDate: "Due date Dec 20, 2024"
  }
];

export function ProjectList() {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "Completed":
        return "bg-success/10 text-success border-success/20";
      case "In Progress":
        return "bg-warning/10 text-warning border-warning/20";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-foreground">Project</h3>
        <Button variant="outline" size="sm" className="gap-2">
          <Plus className="h-4 w-4" />
          New
        </Button>
      </div>
      
      <div className="space-y-3">
        {projects.map((project) => (
          <div key={project.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent/50 transition-colors">
            <div className={`p-2 rounded-lg bg-accent ${project.color}`}>
              <project.icon className="h-4 w-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-foreground">{project.name}</p>
              <p className="text-xs text-muted-foreground">{project.dueDate}</p>
            </div>
            <Badge className={getStatusColor(project.status)}>
              {project.status}
            </Badge>
          </div>
        ))}
      </div>
    </Card>
  );
}