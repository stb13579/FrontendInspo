import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Upload, CheckCircle, Clock, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";

const statusIcons = {
  pending: Clock,
  processing: Clock,
  completed: CheckCircle,
  failed: AlertCircle
};

const statusColors = {
  pending: "bg-yellow-100 text-yellow-800",
  processing: "bg-blue-100 text-blue-800",
  completed: "bg-green-100 text-green-800",
  failed: "bg-red-100 text-red-800"
};

export default function RecentSources({ sources, loading }) {
  if (loading) {
    return (
      <Card className="glass-effect premium-shadow border-0">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-slate-900">Recent Sources</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array(4).fill(0).map((_, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Skeleton className="w-8 h-8 rounded-lg" />
                  <div>
                    <Skeleton className="h-4 w-24 mb-1" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                </div>
                <Skeleton className="h-5 w-16 rounded-full" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.7 }}
    >
      <Card className="glass-effect premium-shadow border-0">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-slate-900">Recent Sources</CardTitle>
          <p className="text-sm text-slate-500">Latest data uploads</p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {sources.slice(0, 4).map((source, index) => {
              const StatusIcon = statusIcons[source.processing_status];
              
              return (
                <motion.div
                  key={source.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * index }}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors duration-200"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-lg flex items-center justify-center">
                      <Upload className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">{source.name}</p>
                      <p className="text-sm text-slate-500">
                        {format(new Date(source.created_date), "MMM d, yyyy")}
                      </p>
                    </div>
                  </div>
                  <Badge className={statusColors[source.processing_status]}>
                    <StatusIcon className="w-3 h-3 mr-1" />
                    {source.processing_status}
                  </Badge>
                </motion.div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}