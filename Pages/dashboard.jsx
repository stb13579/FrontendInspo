import React, { useState, useEffect } from "react";
import { AmplitudeEvent, DataSource } from "@/entities/all";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  TrendingUp, 
  Globe, 
  Users, 
  Activity, 
  Database,
  Zap,
  MapPin,
  Building
} from "lucide-react";
import { format, subDays, startOfDay } from "date-fns";
import { motion } from "framer-motion";

import StatsGrid from "../components/dashboard/StatsGrid";
import EventsChart from "../components/dashboard/EventsChart";
import LocationMap from "../components/dashboard/LocationMap";
import TopEvents from "../components/dashboard/TopEvents";
import RecentSources from "../components/dashboard/RecentSources";

export default function Dashboard() {
  const [events, setEvents] = useState([]);
  const [sources, setSources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalEvents: 0,
    enrichedEvents: 0,
    uniqueUsers: 0,
    topCountries: [],
    eventTypes: {}
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [eventsData, sourcesData] = await Promise.all([
        AmplitudeEvent.list("-timestamp", 1000),
        DataSource.list("-created_date", 20)
      ]);

      setEvents(eventsData);
      setSources(sourcesData);
      
      // Calculate stats
      const uniqueUsers = new Set(eventsData.map(e => e.user_id)).size;
      const enrichedCount = eventsData.filter(e => e.is_enriched).length;
      const countryCount = {};
      const eventTypeCount = {};
      
      eventsData.forEach(event => {
        if (event.country) {
          countryCount[event.country] = (countryCount[event.country] || 0) + 1;
        }
        eventTypeCount[event.event_type] = (eventTypeCount[event.event_type] || 0) + 1;
      });

      const topCountries = Object.entries(countryCount)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5)
        .map(([country, count]) => ({ country, count }));

      setStats({
        totalEvents: eventsData.length,
        enrichedEvents: enrichedCount,
        uniqueUsers,
        topCountries,
        eventTypes: eventTypeCount
      });
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-8">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-2"
      >
        <h1 className="text-4xl font-bold text-slate-900">Analytics Dashboard</h1>
        <p className="text-lg text-slate-600">
          Real-time insights from your Amplitude event data
        </p>
      </motion.div>

      <StatsGrid stats={stats} loading={loading} />

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <EventsChart events={events} loading={loading} />
          <TopEvents eventTypes={stats.eventTypes} loading={loading} />
        </div>
        
        <div className="space-y-8">
          <LocationMap countries={stats.topCountries} loading={loading} />
          <RecentSources sources={sources} loading={loading} />
        </div>
      </div>
    </div>
  );
}