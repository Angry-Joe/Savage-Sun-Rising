import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function DbError({ message }: { message: string }) {
  return (
    <Card className="border-destructive/50">
      <CardHeader>
        <CardTitle className="text-destructive">Database unavailable</CardTitle>
      </CardHeader>
      <CardContent>
        <p>{message}</p>
      </CardContent>
    </Card>
  );
}
