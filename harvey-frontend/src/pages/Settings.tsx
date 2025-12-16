import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Bell, MapPin, Shield, Sliders, Save } from 'lucide-react';
import { toast } from 'sonner';

const Settings = () => {
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    sound: false,
    highPriority: true,
  });

  const [thresholds, setThresholds] = useState({
    highRisk: 70,
    mediumRisk: 40,
  });

  const [mapSettings, setMapSettings] = useState({
    defaultZoom: 12,
    autoCenter: true,
    showLabels: true,
  });

  const handleSave = () => {
    toast.success('Settings saved successfully');
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-4xl">
        {/* Page Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">Settings</h1>
          <p className="text-muted-foreground">Configure your dashboard preferences and alert thresholds</p>
        </div>

        {/* Notification Settings */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">Notifications</CardTitle>
            </div>
            <CardDescription>Manage how you receive alerts and updates</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Email Notifications</Label>
                <p className="text-sm text-muted-foreground">Receive alerts via email</p>
              </div>
              <Switch
                checked={notifications.email}
                onCheckedChange={(checked) => setNotifications({ ...notifications, email: checked })}
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Push Notifications</Label>
                <p className="text-sm text-muted-foreground">Browser push notifications</p>
              </div>
              <Switch
                checked={notifications.push}
                onCheckedChange={(checked) => setNotifications({ ...notifications, push: checked })}
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Sound Alerts</Label>
                <p className="text-sm text-muted-foreground">Play sound for new alerts</p>
              </div>
              <Switch
                checked={notifications.sound}
                onCheckedChange={(checked) => setNotifications({ ...notifications, sound: checked })}
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>High Priority Only</Label>
                <p className="text-sm text-muted-foreground">Only notify for high-risk alerts</p>
              </div>
              <Switch
                checked={notifications.highPriority}
                onCheckedChange={(checked) => setNotifications({ ...notifications, highPriority: checked })}
              />
            </div>
          </CardContent>
        </Card>

        {/* Risk Thresholds */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Sliders className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">Risk Thresholds</CardTitle>
            </div>
            <CardDescription>Set the risk score boundaries for alert levels</CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>High Risk Threshold</Label>
                <Badge variant="destructive">{thresholds.highRisk}%+</Badge>
              </div>
              <Slider
                value={[thresholds.highRisk]}
                onValueChange={(value) => setThresholds({ ...thresholds, highRisk: value[0] })}
                max={100}
                min={50}
                step={5}
                className="w-full"
              />
              <p className="text-sm text-muted-foreground">
                Alerts with risk score of {thresholds.highRisk}% or higher will be marked as high priority
              </p>
            </div>
            <Separator />
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Medium Risk Threshold</Label>
                <Badge className="bg-alert-medium text-alert-medium-foreground">{thresholds.mediumRisk}%+</Badge>
              </div>
              <Slider
                value={[thresholds.mediumRisk]}
                onValueChange={(value) => setThresholds({ ...thresholds, mediumRisk: value[0] })}
                max={thresholds.highRisk - 5}
                min={20}
                step={5}
                className="w-full"
              />
              <p className="text-sm text-muted-foreground">
                Alerts between {thresholds.mediumRisk}% and {thresholds.highRisk - 1}% will be marked as medium priority
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Map Settings */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">Map Settings</CardTitle>
            </div>
            <CardDescription>Configure the alert map display options</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Default Zoom Level</Label>
                <span className="text-sm text-muted-foreground">{mapSettings.defaultZoom}x</span>
              </div>
              <Slider
                value={[mapSettings.defaultZoom]}
                onValueChange={(value) => setMapSettings({ ...mapSettings, defaultZoom: value[0] })}
                max={18}
                min={8}
                step={1}
                className="w-full"
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Auto-center on Alerts</Label>
                <p className="text-sm text-muted-foreground">Automatically pan to new alerts</p>
              </div>
              <Switch
                checked={mapSettings.autoCenter}
                onCheckedChange={(checked) => setMapSettings({ ...mapSettings, autoCenter: checked })}
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Show Location Labels</Label>
                <p className="text-sm text-muted-foreground">Display location names on markers</p>
              </div>
              <Switch
                checked={mapSettings.showLabels}
                onCheckedChange={(checked) => setMapSettings({ ...mapSettings, showLabels: checked })}
              />
            </div>
          </CardContent>
        </Card>

        {/* Agent Configuration */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">Agent Configuration</CardTitle>
            </div>
            <CardDescription>Configure AI agent parameters (Mock for demo)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="fraudEndpoint">Fraud Agent Endpoint</Label>
                <Input
                  id="fraudEndpoint"
                  placeholder="https://api.example.com/fraud"
                  defaultValue="https://api.agentwatch.dev/fraud"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="envEndpoint">Environmental Agent Endpoint</Label>
                <Input
                  id="envEndpoint"
                  placeholder="https://api.example.com/env"
                  defaultValue="https://api.agentwatch.dev/environmental"
                />
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              Configure the API endpoints for your AI agents. These will be used to fetch real-time alert data.
            </p>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button onClick={handleSave} size="lg">
            <Save className="h-4 w-4 mr-2" />
            Save Settings
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Settings;
