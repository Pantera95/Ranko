export function GET() {
  return Response.json({
    ok: true,
    service: "ranko-parts-platform",
    version: "0.1.0",
  });
}
