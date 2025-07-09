import React, { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import { format, subDays, startOfDay, eachDayOfInterval } from "date-fns";
import { motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";

export default function EventsChart({ events, loading }) {
  const chartData = useMemo(() => {
    if (!events || events.length === 0) return [];

    const last7Days = eachDayOfInterval({
      start: subDays(new Date(), 6),
      end: new Date()
    });

    return last7Days.map(date => {
      const dayEvents = events.filter(event => {
        const eventDate = new Date(event.timestamp);
        return format(eventDate, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd');
      });

      const enrichedEvents = dayEvents.filter(e => e.is_enriched).length;

      return {
        date: format(date, 'MMM dd'),
        events: dayEvents.length,
        enriched: enrichedEvents,
        enrichmentRate: dayEvents.length > 0 ? Math.round((enrichedEvents / dayEvents.length) * 100) : 0
      };
    });
  }, [events]);

  if (loading) {
    return (
      <Card className="glass-effect premium-shadow border-0">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-slate-900">Event Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <Skeleton className="w-full h-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
    >
      <Card className="glass-effect premium-shadow border-0">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-slate-900">Event Trends</CardTitle>
          <p className="text-sm text-slate-500">Daily event volume and enrichment rates</p>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis 
                  dataKey="date" 
                  stroke="#64748b"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis 
                  stroke="#64748b"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    border: 'none',
                    borderRadius: '12px',
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="events" 
                  stroke="#3b82f6" 
                  strokeWidth={3}
                  dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: '#3b82f6', strokeWidth: 2 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="enriched" 
                  stroke="#10b981" 
                  strokeWidth={3}
                  dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: '#10b981', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}