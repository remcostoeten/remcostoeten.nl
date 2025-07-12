import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl text-red-600">Access Denied</CardTitle>
          <CardDescription>
            Your account is not authorized to access the CMS.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-center">
          <div className="text-sm text-muted-foreground">
            Only authorized users can access the content management system.
            If you believe this is an error, please contact the administrator.
          </div>
          <div className="space-y-2">
            <Button asChild className="w-full">
              <Link href="/">Return to Home</Link>
            </Button>
            <Button variant="outline" asChild className="w-full">
              <Link href="/auth/signin">Try Different Account</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
