import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus } from "lucide-react";

const teamMembers = [
  {
    id: 1,
    name: "Alexandra Deff",
    role: "Working on",
    project: "Official Project Repository",
    status: "Completed",
    avatar: "AD"
  },
  {
    id: 2,
    name: "Edwin Adenike",
    role: "Working on",
    project: "Integrate User Authentication System",
    status: "In Progress",
    avatar: "EA"
  },
  {
    id: 3,
    name: "Isaac Obwuantanbioun",
    role: "Working on",
    project: "Develop Search and Filter Functionality",
    status: "Pending",
    avatar: "IO"
  }
];

export function TeamCollaboration() {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "Completed":
        return "bg-success/10 text-success border-success/20";
      case "In Progress":
        return "bg-warning/10 text-warning border-warning/20";
      case "Pending":
        return "bg-muted text-muted-foreground";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-foreground">Team Collaboration</h3>
        <Button variant="outline" size="sm" className="gap-2">
          <Plus className="h-4 w-4" />
          Add Member
        </Button>
      </div>
      
      <div className="space-y-4">
        {teamMembers.map((member) => (
          <div key={member.id} className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
              {member.avatar}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-foreground">{member.name}</p>
              <p className="text-sm text-muted-foreground truncate">
                {member.role} <span className="font-medium">{member.project}</span>
              </p>
            </div>
            <Badge className={getStatusColor(member.status)}>
              {member.status}
            </Badge>
          </div>
        ))}
      </div>
    </Card>
  );
}