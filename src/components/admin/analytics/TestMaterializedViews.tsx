"use client";

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { dashboardDb } from '@/lib/db/dashboard';
import { ticketsDb } from '@/lib/db/tickets';
import { useToast } from "@/hooks/use-toast";

const TestMaterializedViews = () => {
  const { toast } = useToast();
  const [isTesting, setIsTesting] = useState(false);
  const [testResults, setTestResults] = useState<any>(null);

  const runTest = async () => {
    setIsTesting(true);
    setTestResults(null);
    
    try {
      // Get initial status distribution
      const initialStatusData = await dashboardDb.getTicketStatusDistribution();
      console.log('Initial status data:', initialStatusData);
      
      // Refresh materialized views
      await dashboardDb.refreshMaterializedViews();
      
      // Get status distribution after refresh
      const refreshedStatusData = await dashboardDb.getTicketStatusDistribution();
      console.log('Refreshed status data:', refreshedStatusData);
      
      // Compare initial and refreshed data
      const initialTotal = initialStatusData.reduce((sum, item) => sum + item.count, 0);
      const refreshedTotal = refreshedStatusData.reduce((sum, item) => sum + item.count, 0);
      
      setTestResults({
        initialTotal,
        refreshedTotal,
        difference: refreshedTotal - initialTotal,
        initialData: initialStatusData,
        refreshedData: refreshedStatusData
      });
      
      toast({
        title: "Test Completed",
        description: "Materialized views test completed successfully",
      });
    } catch (error) {
      console.error('Test failed:', error);
      toast({
        title: "Test Failed",
        description: "Failed to complete materialized views test",
        variant: "destructive",
      });
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Materialized Views Test</CardTitle>
        <CardDescription>
          Test to verify that materialized views are working correctly
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Button 
            onClick={runTest} 
            disabled={isTesting}
            variant="outline"
          >
            {isTesting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-2"></div>
                Running Test...
              </>
            ) : (
              'Run Materialized Views Test'
            )}
          </Button>
          
          {testResults && (
            <div className="space-y-2">
              <h3 className="font-semibold">Test Results:</h3>
              <p>Total tickets before refresh: {testResults.initialTotal}</p>
              <p>Total tickets after refresh: {testResults.refreshedTotal}</p>
              <p>Difference: {testResults.difference}</p>
              
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div>
                  <h4 className="font-medium mb-2">Before Refresh:</h4>
                  <ul className="space-y-1">
                    {testResults.initialData.map((item: any, index: number) => (
                      <li key={index} className="text-sm">
                        {item.status}: {item.count}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium mb-2">After Refresh:</h4>
                  <ul className="space-y-1">
                    {testResults.refreshedData.map((item: any, index: number) => (
                      <li key={index} className="text-sm">
                        {item.status}: {item.count}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default TestMaterializedViews;