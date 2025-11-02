export default function MiddlewareTestPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full space-y-4">
        <h1 className="text-2xl font-bold text-center">Middleware Test</h1>
        <p className="text-center text-muted-foreground">
          If you can see this page, the middleware is not blocking it.
        </p>
        <p className="text-center text-sm text-muted-foreground">
          This page should not be accessible if you are not logged in as an admin.
        </p>
      </div>
    </div>
  );
}