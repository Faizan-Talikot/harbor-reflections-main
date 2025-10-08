import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  User, 
  Calendar, 
  TrendingUp, 
  Heart, 
  Shield, 
  Activity,
  Plus,
  ChevronRight,
  AlertTriangle,
  CheckCircle
} from "lucide-react";

interface CheckInHistory {
  id: string;
  completedAt: string;
  assessment: {
    riskLevel: string;
    score: number;
    recommendations: string[];
  };
  demographics: {
    age: string;
  };
  lifeCircumstances: {
    stressLevel: string;
  };
}

const Dashboard = () => {
  const { user, logout } = useAuth();
  const [checkIns, setCheckIns] = useState<CheckInHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalCheckIns: 0,
    averageScore: 0,
    lastCheckIn: null as string | null,
    improvementTrend: 0
  });

  useEffect(() => {
    fetchCheckInHistory();
    fetchUserStats();
  }, []);

  const fetchCheckInHistory = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/checkins/history', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setCheckIns(data.data.checkIns);
      }
    } catch (error) {
      console.error('Error fetching check-in history:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUserStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/auth/stats', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data.data.stats);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const getRiskLevelColor = (riskLevel: string) => {
    switch (riskLevel.toLowerCase()) {
      case 'low risk':
      case 'minimal':
        return 'text-green-600 bg-green-100 border-green-200';
      case 'moderate':
      case 'mild':
        return 'text-yellow-600 bg-yellow-100 border-yellow-200';
      case 'high':
      case 'severe':
        return 'text-orange-600 bg-orange-100 border-orange-200';
      case 'crisis':
      case 'very high':
        return 'text-red-600 bg-red-100 border-red-200';
      default:
        return 'text-gray-600 bg-gray-100 border-gray-200';
    }
  };

  const getRiskIcon = (riskLevel: string) => {
    switch (riskLevel.toLowerCase()) {
      case 'low risk':
      case 'minimal':
        return <CheckCircle className="h-4 w-4" />;
      case 'moderate':
      case 'mild':
        return <Activity className="h-4 w-4" />;
      case 'high':
      case 'severe':
      case 'crisis':
      case 'very high':
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <Heart className="h-4 w-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-heading font-bold text-foreground">
                Welcome back, {user?.name}
              </h1>
              <p className="text-muted-foreground mt-2">
                Here's your mental wellness journey overview
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Link to="/check-in">
                <Button className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  New Check-in
                </Button>
              </Link>
              <Button variant="outline" onClick={logout}>
                Sign Out
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Check-ins</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalCheckIns}</div>
              <p className="text-xs text-muted-foreground">
                Your wellness journey entries
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Score</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.averageScore}/100</div>
              <p className="text-xs text-muted-foreground">
                Wellness assessment average
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Progress Trend</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${
                stats.improvementTrend > 0 ? 'text-green-600' : 
                stats.improvementTrend < 0 ? 'text-red-600' : 'text-gray-600'
              }`}>
                {stats.improvementTrend > 0 ? '+' : ''}{stats.improvementTrend}%
              </div>
              <p className="text-xs text-muted-foreground">
                Since last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Last Check-in</CardTitle>
              <Heart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-sm font-bold">
                {stats.lastCheckIn ? formatDate(stats.lastCheckIn) : 'No check-ins yet'}
              </div>
              <p className="text-xs text-muted-foreground">
                Most recent assessment
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="history" className="space-y-6">
          <TabsList>
            <TabsTrigger value="history">Assessment History</TabsTrigger>
            <TabsTrigger value="profile">Profile</TabsTrigger>
          </TabsList>

          <TabsContent value="history" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Your Check-in History</CardTitle>
                <CardDescription>
                  Review your past mental wellness assessments and track your progress
                </CardDescription>
              </CardHeader>
              <CardContent>
                {checkIns.length === 0 ? (
                  <div className="text-center py-8">
                    <Heart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-foreground mb-2">No check-ins yet</h3>
                    <p className="text-muted-foreground mb-4">
                      Start your mental wellness journey with your first assessment
                    </p>
                    <Link to="/check-in">
                      <Button>Take Your First Check-in</Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {checkIns.map((checkIn) => (
                      <div
                        key={checkIn.id}
                        className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-accent/50 transition-colors"
                      >
                        <div className="flex items-center space-x-4">
                          <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium border ${
                            getRiskLevelColor(checkIn.assessment.riskLevel)
                          }`}>
                            {getRiskIcon(checkIn.assessment.riskLevel)}
                            {checkIn.assessment.riskLevel}
                          </div>
                          <div>
                            <p className="font-medium text-foreground">
                              {formatDate(checkIn.completedAt)}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Score: {checkIn.assessment.score}/100 • Stress: {checkIn.lifeCircumstances.stressLevel}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Progress 
                            value={checkIn.assessment.score} 
                            className="w-20"
                          />
                          <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Profile Information
                </CardTitle>
                <CardDescription>
                  Your account details and preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Name</label>
                    <p className="text-foreground font-medium">{user?.name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Email</label>
                    <p className="text-foreground font-medium">{user?.email}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Member Since</label>
                    <p className="text-foreground font-medium">
                      {user?.createdAt ? formatDate(user.createdAt) : 'Unknown'}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Role</label>
                    <Badge variant="outline">{user?.role}</Badge>
                  </div>
                </div>
                
                <div className="pt-4 border-t">
                  <Button variant="outline">
                    Edit Profile
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Dashboard;