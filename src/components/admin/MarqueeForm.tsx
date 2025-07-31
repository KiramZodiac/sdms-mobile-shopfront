import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from '@/integrations/supabase/client';

export const MarqueeForm = () => {
  const [marqueeText, setMarqueeText] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchMarqueeSettings();
  }, []);

  const fetchMarqueeSettings = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('site_settings')
        .select('setting_value, is_active')
        .eq('setting_key', 'marquee_text')
        .single();

      if (error) {
        if (import.meta.env.DEV) {
          console.log('Error fetching marquee settings:', error);
        }
        return;
      }

      if (data) {
        setMarqueeText(data.setting_value || '');
        setIsActive(data.is_active || false);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load marquee settings",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('site_settings')
        .upsert({
          setting_key: 'marquee_text',
          setting_value: marqueeText,
          is_active: isActive
        }, {
          onConflict: 'setting_key'
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Marquee settings updated successfully!",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update marquee settings",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Marquee Settings</CardTitle>
        <CardDescription>
          Manage the scrolling text that appears at the top of your website
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="marquee-text">Marquee Text</Label>
          <Input
            id="marquee-text"
            placeholder="🔥 Enter your marquee text with emojis... 📱💻"
            value={marqueeText}
            onChange={(e) => setMarqueeText(e.target.value)}
            disabled={loading || saving}
          />
        </div>
        
        <div className="flex items-center space-x-2">
          <Switch
            id="marquee-active"
            checked={isActive}
            onCheckedChange={setIsActive}
            disabled={loading || saving}
          />
          <Label htmlFor="marquee-active">Show marquee on website</Label>
        </div>

        <Button 
          onClick={handleSave} 
          disabled={loading || saving || !marqueeText.trim()}
          className="w-full"
        >
          {saving ? "Saving..." : "Save Marquee Settings"}
        </Button>
      </CardContent>
    </Card>
  );
}; 