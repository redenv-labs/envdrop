import { ORIGIN_HEADER } from "@/config";
import { headers } from "next/headers";

/**
 * Returns the origin of the request.
 * @serverOnly
 */
export const getOrigin = async () => {
  const headersList = await headers();
  let origin = headersList.get(ORIGIN_HEADER);
  if (!origin) {
    const hostHeader =
      headersList.get("x-forwarded-host") ?? headersList.get("host");
    const proto = headersList.get("x-forwarded-proto") ?? "http";
    origin = `${proto}://${hostHeader}`;
  }
  return origin;
};