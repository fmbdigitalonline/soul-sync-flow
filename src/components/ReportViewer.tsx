import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';

const ReportViewer: React.FC = () => {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto">
        <Button
          variant="ghost"
          onClick={() => navigate('/blueprint')}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Blueprint
        </Button>

        <Card>
          <CardHeader>
            <CardTitle>Hermetic Report</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Report viewer for job: {jobId}
            </p>
            <p className="mt-4">
              This is a placeholder for the completed hermetic report viewer.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ReportViewer;