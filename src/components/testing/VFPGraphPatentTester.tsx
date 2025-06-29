
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertTriangle, CheckCircle, Clock, FileText, Play, Download } from 'lucide-react';
import { vfpGraphPatentTestSuite, PatentValidationReport, PatentTestResult } from '@/services/vfp-graph-patent-test-suite';

export const VFPGraphPatentTester: React.FC = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [currentReport, setCurrentReport] = useState<PatentValidationReport | null>(null);
  const [testHistory, setTestHistory] = useState<PatentValidationReport[]>([]);

  const runFullPatentSuite = async () => {
    setIsRunning(true);
    try {
      console.log('🚀 Starting VFP-Graph Patent Validation...');
      const report = await vfpGraphPatentTestSuite.runPatentValidationSuite();
      
      setCurrentReport(report);
      setTestHistory(prev => [report, ...prev.slice(0, 9)]); // Keep last 10 runs
      
      console.log('✅ Patent validation complete:', report);
    } catch (error) {
      console.error('❌ Patent test suite failed:', error);
    } finally {
      setIsRunning(false);
    }
  };

  const downloadPatentEvidence = () => {
    if (!currentReport) return;
    
    const evidencePackage = {
      patentApplication: 'US Provisional - Vector-Fusion Personality Graph (VFP-Graph)',
      testRunId: currentReport.testRunId,
      timestamp: currentReport.timestamp,
      validationResults: currentReport,
      technicalEvidence: currentReport.evidence,
      claimsValidation: currentReport.claimResults.map(claim => ({
        claimNumber: claim.claimNumber,
        claimTitle: claim.claimTitle,
        validated: claim.passed,
        evidence: claim.evidence,
        executionTime: claim.executionTimeMs
      }))
    };

    const blob = new Blob([JSON.stringify(evidencePackage, null, 2)], { 
      type: 'application/json' 
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `VFP-Graph-Patent-Evidence-${currentReport.testRunId}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const renderClaimResult = (claim: PatentTestResult) => {
    return (
      <Card key={claim.claimNumber} className={`mb-4 ${claim.passed ? 'border-green-200' : 'border-red-200'}`}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center space-x-2">
              {claim.passed ? (
                <CheckCircle className="w-5 h-5 text-green-600" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-red-600" />
              )}
              <span>Claim {claim.claimNumber}: {claim.claimTitle}</span>
            </CardTitle>
            <Badge variant={claim.passed ? "default" : "destructive"}>
              {claim.passed ? 'VALIDATED' : 'FAILED'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium">Execution Time:</span>
              <span className="ml-2">{claim.executionTimeMs.toFixed(2)}ms</span>
            </div>
            <div>
              <span className="font-medium">Timestamp:</span>
              <span className="ml-2">{new Date(claim.timestamp).toLocaleTimeString()}</span>
            </div>
          </div>
          
          <div className="bg-gray-50 p-3 rounded-lg">
            <h4 className="font-medium text-sm mb-2">Technical Evidence:</h4>
            <pre className="text-xs overflow-x-auto">
              {JSON.stringify(claim.evidence, null, 2)}
            </pre>
          </div>
          
          {claim.testDetails && (
            <div className="bg-blue-50 p-3 rounded-lg">
              <h4 className="font-medium text-sm mb-2">Test Details:</h4>
              <pre className="text-xs overflow-x-auto">
                {JSON.stringify(claim.testDetails, null, 2)}
              </pre>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  const renderExecutionSummary = (report: PatentValidationReport) => {
    const successRate = (report.passedClaims / report.totalClaims) * 100;
    
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-2xl font-bold">{report.passedClaims}/{report.totalClaims}</p>
                <p className="text-sm text-muted-foreground">Claims Validated</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">{report.executionSummary.totalTimeMs.toFixed(0)}ms</p>
                <p className="text-sm text-muted-foreground">Total Execution Time</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <FileText className="w-5 h-5 text-purple-600" />
              <div>
                <p className="text-2xl font-bold">{successRate.toFixed(1)}%</p>
                <p className="text-sm text-muted-foreground">Success Rate</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="w-6 h-6" />
            <span>VFP-Graph Patent Validation Suite</span>
            <Badge variant="outline">US Provisional Ready</Badge>
          </CardTitle>
          <p className="text-muted-foreground">
            Comprehensive testing suite validating all 6 patent claims with real-time data and evidence collection.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex space-x-3">
            <Button
              onClick={runFullPatentSuite}
              disabled={isRunning}
              className="flex items-center space-x-2"
            >
              {isRunning ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Running Patent Tests...</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  <span>Run Full Patent Validation</span>
                </>
              )}
            </Button>
            
            {currentReport && (
              <Button
                variant="outline"
                onClick={downloadPatentEvidence}
                className="flex items-center space-x-2"
              >
                <Download className="w-4 h-4" />
                <span>Download Evidence Package</span>
              </Button>
            )}
          </div>

          {isRunning && (
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Running patent validation tests...</p>
              <Progress value={undefined} className="w-full" />
            </div>
          )}
        </CardContent>
      </Card>

      {currentReport && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Patent Validation Results</span>
              <Badge variant={currentReport.overallSuccess ? "default" : "destructive"}>
                {currentReport.overallSuccess ? 'ALL CLAIMS VALIDATED' : 'VALIDATION INCOMPLETE'}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="summary" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="summary">Summary</TabsTrigger>
                <TabsTrigger value="claims">Claims</TabsTrigger>
                <TabsTrigger value="evidence">Evidence</TabsTrigger>
                <TabsTrigger value="technical">Technical</TabsTrigger>
              </TabsList>
              
              <TabsContent value="summary" className="space-y-4">
                {renderExecutionSummary(currentReport)}
                
                <Card>
                  <CardContent className="p-4">
                    <h3 className="font-medium mb-3">Test Run Information</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Test Run ID:</span>
                        <span className="ml-2 font-mono text-xs">{currentReport.testRunId}</span>
                      </div>
                      <div>
                        <span className="font-medium">Timestamp:</span>
                        <span className="ml-2">{new Date(currentReport.timestamp).toLocaleString()}</span>
                      </div>
                      <div>
                        <span className="font-medium">Average Time per Claim:</span>
                        <span className="ml-2">{currentReport.executionSummary.averageTimePerClaim.toFixed(2)}ms</span>
                      </div>
                      <div>
                        <span className="font-medium">Memory Usage:</span>
                        <span className="ml-2">{(currentReport.executionSummary.memoryUsage / 1024 / 1024).toFixed(2)}MB</span>
                      </div>
                    </div>
                  </Card>
                </Card>
              </TabsContent>
              
              <TabsContent value="claims">
                <ScrollArea className="h-96">
                  <div className="space-y-4">
                    {currentReport.claimResults.map(renderClaimResult)}
                  </div>
                </ScrollArea>
              </TabsContent>
              
              <TabsContent value="evidence">
                <ScrollArea className="h-96">
                  <div className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Real-Time Data Evidence</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <pre className="text-xs overflow-x-auto bg-gray-50 p-3 rounded">
                          {JSON.stringify(currentReport.evidence.realTimeData, null, 2)}
                        </pre>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">User Interactions Evidence</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <pre className="text-xs overflow-x-auto bg-gray-50 p-3 rounded">
                          {JSON.stringify(currentReport.evidence.userInteractions, null, 2)}
                        </pre>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Vector Operations Evidence</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <pre className="text-xs overflow-x-auto bg-gray-50 p-3 rounded">
                          {JSON.stringify(currentReport.evidence.vectorOperations, null, 2)}
                        </pre>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Conflict Resolution Evidence</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <pre className="text-xs overflow-x-auto bg-gray-50 p-3 rounded">
                          {JSON.stringify(currentReport.evidence.conflictResolutions, null, 2)}
                        </pre>
                      </CardContent>
                    </Card>
                  </div>
                </ScrollArea>
              </TabsContent>
              
              <TabsContent value="technical">
                <ScrollArea className="h-96">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Complete Technical Report</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <pre className="text-xs overflow-x-auto bg-gray-50 p-3 rounded">
                        {JSON.stringify(currentReport, null, 2)}
                      </pre>
                    </CardContent>
                  </Card>
                </ScrollArea>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}

      {testHistory.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Test History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {testHistory.map((report, index) => (
                <div key={report.testRunId} 
                     className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100"
                     onClick={() => setCurrentReport(report)}>
                  <div>
                    <p className="font-medium text-sm">Test Run #{testHistory.length - index}</p>
                    <p className="text-xs text-muted-foreground">{new Date(report.timestamp).toLocaleString()}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant={report.overallSuccess ? "default" : "destructive"}>
                      {report.passedClaims}/{report.totalClaims}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {report.executionSummary.totalTimeMs.toFixed(0)}ms
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
