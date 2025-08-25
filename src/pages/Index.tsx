import { ModernSidebar } from "@/components/ModernSidebar";
import { ModernHeader } from "@/components/ModernHeader";
import { ModernMetricCard } from "@/components/ModernMetricCard";
import { ProjectAnalytics } from "@/components/ProjectAnalytics";
import { RemindersCard } from "@/components/RemindersCard";
import { ProjectList } from "@/components/ProjectList";
import { TeamCollaboration } from "@/components/TeamCollaboration";
import { ProjectProgress } from "@/components/ProjectProgress";
import { TimeTracker } from "@/components/TimeTracker";
import { SidebarProvider } from "@/components/ui/sidebar";

const Index = () => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <ModernSidebar />
        
        <div className="flex-1">
          <ModernHeader />
          
          <main className="p-6 space-y-6">
            {/* Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <ModernMetricCard
                title="Total Projects"
                value="24"
                change="+2 increased from last month"
                variant="primary"
              />
              <ModernMetricCard
                title="Ended Projects"
                value="10"
                change="+2 increased from last month"
                variant="secondary"
              />
              <ModernMetricCard
                title="Running Projects"
                value="12"
                change="+2 increased from last month"
                variant="secondary"
              />
              <ModernMetricCard
                title="Pending Project"
                value="2"
                change="On Discuss"
                variant="accent"
              />
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column - Analytics */}
              <div className="lg:col-span-1">
                <ProjectAnalytics />
              </div>
              
              {/* Center Column - Reminders */}
              <div className="lg:col-span-1">
                <RemindersCard />
              </div>
              
              {/* Right Column - Project List */}
              <div className="lg:col-span-1">
                <ProjectList />
              </div>
            </div>

            {/* Bottom Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Team Collaboration */}
              <div className="lg:col-span-2">
                <TeamCollaboration />
              </div>
              
              {/* Right Side - Progress and Time Tracker */}
              <div className="space-y-6">
                <ProjectProgress />
                <TimeTracker />
              </div>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Index;