import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Activity, 
  Zap, 
  Users, 
  Globe,
  TrendingUp
} from "lucide-react";
import { motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";

const StatCard = ({ title, value, subtitle, icon: Icon, color, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
  >
    <Card className="glass-effect premium-shadow border-0 hover:shadow-2xl transition-all duration-500">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="text-sm font-medium text-slate-600">{title}</CardTitle>
            <div className="text-3xl font-bold text-slate-900">{value}</div>
          </div>
          <div className={`p-3 rounded-2xl ${color} bg-opacity-10`}>
            <Icon className={`w-6 h-6 ${color.replace('bg-', 'text-')}`} />
          </div>
        </div>
      </CardHeader>
      {subtitle && (
        <CardContent className="pt-0">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <TrendingUp className="w-4 h-4 text-green-500" />
            {subtitle}
          </div>
        </CardContent>
      )}
    </Card>
  </motion.div>
);

export default function StatsGrid({ stats, loading }) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array(4).fill(0).map((_, i) => (
          <Card key={i} className="glass-effect">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-8 w-16" />
                </div>
                <Skeleton className="w-12 h-12 rounded-2xl" />
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>
    );
  }

  const enrichmentRate = stats.totalEvents > 0 ? 
    Math.round((stats.enrichedEvents / stats.totalEvents) * 100) : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatCard
        title="Total Events"
        value={stats.totalEvents.toLocaleString()}
        subtitle="All time data"
        icon={Activity}
        color="bg-blue-500"
        delay={0}
      />
      <StatCard
        title="Enriched Events"
        value={stats.enrichedEvents.toLocaleString()}
        subtitle={`${enrichmentRate}% enrichment rate`}
        icon={Zap}
        color="bg-green-500"
        delay={0.1}
      />
      <StatCard
        title="Unique Users"
        value={stats.uniqueUsers.toLocaleString()}
        subtitle="Active users tracked"
        icon={Users}
        color="bg-purple-500"
        delay={0.2}
      />
      <StatCard
        title="Countries"
        value={stats.topCountries.length}
        subtitle="Global reach"
        icon={Globe}
        color="bg-orange-500"
        delay={0.3}
      />
    </div>
  );
}