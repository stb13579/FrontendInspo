import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Clock, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

export default function ProcessingSteps({ steps, currentStep, progress }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Card className="glass-effect premium-shadow border-0">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-slate-900">Processing</CardTitle>
          <Progress value={progress} className="w-full" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {steps.map((step, index) => {
              const isCompleted = index < currentStep;
              const isCurrent = index === currentStep - 1;
              const isPending = index >= currentStep;

              return (
                <div
                  key={index}
                  className={`flex items-center gap-3 p-3 rounded-lg transition-all duration-300 ${
                    isCompleted ? 'bg-green-50' : 
                    isCurrent ? 'bg-blue-50' : 'bg-slate-50'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    isCompleted ? 'bg-green-500' : 
                    isCurrent ? 'bg-blue-500' : 'bg-slate-300'
                  }`}>
                    {isCompleted ? (
                      <CheckCircle className="w-5 h-5 text-white" />
                    ) : isCurrent ? (
                      <Loader2 className="w-5 h-5 text-white animate-spin" />
                    ) : (
                      <step.icon className="w-5 h-5 text-slate-600" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className={`font-semibold ${
                      isCompleted ? 'text-green-800' : 
                      isCurrent ? 'text-blue-800' : 'text-slate-600'
                    }`}>
                      {step.title}
                    </p>
                    <p className="text-sm text-slate-500">{step.description}</p>
                  </div>
                  <Badge variant={
                    isCompleted ? 'default' : 
                    isCurrent ? 'secondary' : 'outline'
                  }>
                    {isCompleted ? 'Complete' : 
                     isCurrent ? 'Processing' : 'Pending'}
                  </Badge>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}