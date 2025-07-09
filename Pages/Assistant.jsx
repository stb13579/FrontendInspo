import React, { useState, useEffect, useRef } from "react";
import { AmplitudeEvent } from "@/entities/all";
import { InvokeLLM } from "@/integrations/Core";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  MessageSquare, 
  Send, 
  Bot, 
  User, 
  BarChart3,
  Database,
  Sparkles
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Assistant() {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Hello! I'm your AI analytics assistant. I can help you understand your Amplitude event data through natural language queries. Try asking me something like 'What are the top 5 event types?' or 'Show me user activity patterns'.",
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [eventCount, setEventCount] = useState(0);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    loadEventCount();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const loadEventCount = async () => {
    try {
      const events = await AmplitudeEvent.list("", 1);
      setEventCount(events.length);
    } catch (error) {
      console.error("Error loading event count:", error);
    }
  };

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = { role: "user", content: input, timestamp: new Date() };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      // Get recent events for context
      const recentEvents = await AmplitudeEvent.list("-timestamp", 100);
      
      // Create context about the data
      const dataContext = {
        totalEvents: recentEvents.length,
        eventTypes: [...new Set(recentEvents.map(e => e.event_type))],
        countries: [...new Set(recentEvents.map(e => e.country).filter(Boolean))],
        enrichedEvents: recentEvents.filter(e => e.is_enriched).length,
        sampleEvent: recentEvents[0]
      };

      const response = await InvokeLLM({
        prompt: `You are an expert data analyst helping users understand their Amplitude event data. 
        
        User question: "${input}"
        
        Here's the context about their data:
        - Total events: ${dataContext.totalEvents}
        - Event types: ${dataContext.eventTypes.join(", ")}
        - Countries: ${dataContext.countries.join(", ")}
        - Enriched events: ${dataContext.enrichedEvents}
        - Sample event structure: ${JSON.stringify(dataContext.sampleEvent, null, 2)}
        
        Provide a helpful, informative response that answers their question using this data context. 
        Be conversational and explain insights in a way that's easy to understand for non-technical users.
        If they ask for specific data analysis, provide concrete numbers and insights.
        If the question is about something not covered in the data, explain what information is available.`,
        add_context_from_internet: false
      });

      const assistantMessage = {
        role: "assistant",
        content: response,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      const errorMessage = {
        role: "assistant",
        content: "I apologize, but I encountered an error while processing your question. Please try again.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const quickQuestions = [
    "What are the top 5 event types?",
    "Show me user activity by country",
    "What's the enrichment rate?",
    "Analyze user behavior patterns"
  ];

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="p-6 bg-white/80 backdrop-blur-lg border-b border-slate-200">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center">
                <MessageSquare className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">AI Analytics Assistant</h1>
                <p className="text-slate-600">Ask questions about your Amplitude data</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                <Database className="w-4 h-4 mr-1" />
                {eventCount} events
              </Badge>
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                <Sparkles className="w-4 h-4 mr-1" />
                AI Powered
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          <AnimatePresence>
            {messages.map((message, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className={`flex gap-4 ${message.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div className={`flex gap-3 max-w-3xl ${message.role === "user" ? "flex-row-reverse" : ""}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    message.role === "user" 
                      ? "bg-blue-500" 
                      : "bg-gradient-to-br from-purple-500 to-purple-600"
                  }`}>
                    {message.role === "user" ? (
                      <User className="w-4 h-4 text-white" />
                    ) : (
                      <Bot className="w-4 h-4 text-white" />
                    )}
                  </div>
                  <div className={`p-4 rounded-2xl ${
                    message.role === "user" 
                      ? "bg-blue-500 text-white" 
                      : "bg-white shadow-lg glass-effect"
                  }`}>
                    <p className="whitespace-pre-wrap">{message.content}</p>
                    <p className={`text-xs mt-2 ${
                      message.role === "user" ? "text-blue-100" : "text-slate-400"
                    }`}>
                      {message.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {isLoading && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex gap-4 justify-start"
            >
              <div className="flex gap-3 max-w-3xl">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div className="p-4 rounded-2xl bg-white shadow-lg glass-effect">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
                      <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                    </div>
                    <span className="text-sm text-slate-500">Analyzing your data...</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="p-6 bg-white/80 backdrop-blur-lg border-t border-slate-200">
        <div className="max-w-4xl mx-auto">
          {/* Quick Questions */}
          <div className="mb-4">
            <p className="text-sm text-slate-500 mb-2">Quick questions:</p>
            <div className="flex flex-wrap gap-2">
              {quickQuestions.map((question, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => setInput(question)}
                  className="text-xs"
                >
                  {question}
                </Button>
              ))}
            </div>
          </div>

          {/* Input */}
          <div className="flex gap-3">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask me anything about your Amplitude data..."
              className="flex-1 px-4 py-3 text-base"
              disabled={isLoading}
            />
            <Button
              onClick={handleSendMessage}
              disabled={!input.trim() || isLoading}
              className="px-6 py-3 bg-purple-600 hover:bg-purple-700"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}