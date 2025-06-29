// import { NextResponse } from "next/server";

// export function middleware(req) {
//   const BASIC_AUTH_USER = "test"; // hardcoded for testing
//   const BASIC_AUTH_PASS = "owais";

//   const auth = req.headers.get("authorization");

//   if (auth) {
//     const [scheme, encoded] = auth.split(" ");
//     if (scheme === "Basic") {
//       const buff = Buffer.from(encoded, "base64");
//       const [user, pass] = buff.toString().split(":");

//       if (user === BASIC_AUTH_USER && pass === BASIC_AUTH_PASS) {
//         return NextResponse.next();
//       }
//     }
//   }

//   return new NextResponse("Authentication required", {
//     status: 401,
//     headers: {
//       "WWW-Authenticate": 'Basic realm="Secure Area"',
//     },
//   });
// }

// export const config = {
//   matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
// };
