import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Copy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function Settings() {
  const { toast } = useToast();

  const settings = {
    pnid: 'PNID-12345-67890',
    s3_bucket: 'dressbot-images',
    max_per_message: 10,
    free_per_phone: 100,
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: 'Copied!',
      description: `${label} copied to clipboard`,
    });
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* HEADER */}
      <div className="bg-gradient-to-r from-purple-600 via-pink-500 to-pink-400 text-white rounded-2xl p-6 shadow-md">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight">Settings</h1>
          <p className="text-sm text-white/80 mt-1">
            View and copy key system configuration details (read-only)
          </p>
        </div>
      </div>

      {/* SETTINGS GRID */}
      <div className="grid gap-8 md:grid-cols-2">
        {/* PNID */}
        <Card className="shadow-xl border-none bg-gradient-to-br from-white via-purple-50 to-pink-50 rounded-2xl hover:shadow-2xl hover:scale-[1.02] transition-all">
          <CardHeader>
            <CardTitle className="text-purple-700 font-semibold">
              Phone Number ID (PNID)
            </CardTitle>
            <CardDescription className="text-purple-400 font-medium">
              WhatsApp Business API Phone Number ID
            </CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-between">
            <code className="text-sm bg-purple-100/60 px-3 py-1 rounded text-purple-700">
              {settings.pnid}
            </code>
            <Button
              variant="ghost"
              size="sm"
              className="hover:bg-purple-100 text-purple-600 transition-all hover:scale-105"
              onClick={() => copyToClipboard(settings.pnid, 'PNID')}
            >
              <Copy className="h-4 w-4" />
            </Button>
          </CardContent>
        </Card>

        {/* S3 Bucket */}
        <Card className="shadow-xl border-none bg-gradient-to-br from-white via-purple-50 to-pink-50 rounded-2xl hover:shadow-2xl hover:scale-[1.02] transition-all">
          <CardHeader>
            <CardTitle className="text-purple-700 font-semibold">S3 Bucket</CardTitle>
            <CardDescription className="text-purple-400 font-medium">
              Storage bucket for images and files
            </CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-between">
            <code className="text-sm bg-purple-100/60 px-3 py-1 rounded text-purple-700">
              {settings.s3_bucket}
            </code>
            <Button
              variant="ghost"
              size="sm"
              className="hover:bg-purple-100 text-purple-600 transition-all hover:scale-105"
              onClick={() => copyToClipboard(settings.s3_bucket, 'Bucket name')}
            >
              <Copy className="h-4 w-4" />
            </Button>
          </CardContent>
        </Card>

        {/* Max Per Message */}
        <Card className="shadow-xl border-none bg-gradient-to-br from-white via-purple-50 to-pink-50 rounded-2xl hover:shadow-2xl hover:scale-[1.02] transition-all">
          <CardHeader>
            <CardTitle className="text-purple-700 font-semibold">Max Per Message</CardTitle>
            <CardDescription className="text-purple-400 font-medium">
              Maximum images allowed per WhatsApp message
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-extrabold text-purple-700">
              {settings.max_per_message}
            </div>
          </CardContent>
        </Card>

        {/* Free Per Phone */}
        <Card className="shadow-xl border-none bg-gradient-to-br from-white via-purple-50 to-pink-50 rounded-2xl hover:shadow-2xl hover:scale-[1.02] transition-all">
          <CardHeader>
            <CardTitle className="text-purple-700 font-semibold">Free Per Phone</CardTitle>
            <CardDescription className="text-purple-400 font-medium">
              Free quota limit per phone number
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-extrabold text-purple-700">
              {settings.free_per_phone}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
