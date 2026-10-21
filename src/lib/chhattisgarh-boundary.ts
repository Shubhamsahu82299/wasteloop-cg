import boundary from "./data/chhattisgarh-boundary.json" with { type: "json" };

type Position = number[];
type LinearRing = Position[];

const polygon: LinearRing[] = boundary.coordinates;

function isOnSegment(point: Position, start: Position, end: Position): boolean {
  const [longitude, latitude] = point;
  const [startLongitude, startLatitude] = start;
  const [endLongitude, endLatitude] = end;
  const cross =
    (latitude - startLatitude) * (endLongitude - startLongitude) -
    (longitude - startLongitude) * (endLatitude - startLatitude);
  if (Math.abs(cross) > 1e-10) return false;

  return (
    longitude >= Math.min(startLongitude, endLongitude) - 1e-10 &&
    longitude <= Math.max(startLongitude, endLongitude) + 1e-10 &&
    latitude >= Math.min(startLatitude, endLatitude) - 1e-10 &&
    latitude <= Math.max(startLatitude, endLatitude) + 1e-10
  );
}

function ringContains(point: Position, ring: LinearRing): boolean {
  let inside = false;
  for (let index = 0, previous = ring.length - 1; index < ring.length; previous = index++) {
    const currentPosition = ring[index];
    const previousPosition = ring[previous];
    if (isOnSegment(point, previousPosition, currentPosition)) return true;

    const intersects =
      currentPosition[1] > point[1] !== previousPosition[1] > point[1] &&
      point[0] <
        ((previousPosition[0] - currentPosition[0]) * (point[1] - currentPosition[1])) /
          (previousPosition[1] - currentPosition[1]) +
          currentPosition[0];
    if (intersects) inside = !inside;
  }
  return inside;
}

export function isWithinChhattisgarh(latitude: number, longitude: number): boolean {
  if (
    !Number.isFinite(latitude) ||
    !Number.isFinite(longitude) ||
    latitude < -90 ||
    latitude > 90 ||
    longitude < -180 ||
    longitude > 180 ||
    polygon.length === 0 ||
    !ringContains([longitude, latitude], polygon[0])
  ) {
    return false;
  }

  return !polygon.slice(1).some((hole) => ringContains([longitude, latitude], hole));
}

type ReportLocationValidation =
  | { ok: true; latitude: number; longitude: number }
  | { ok: false; status: 400 | 422; error: string };

export function validateCitizenReportLocation(
  issueLatitude: unknown,
  issueLongitude: unknown,
  citizenLatitude: unknown,
  citizenLongitude: unknown,
): ReportLocationValidation {
  const values = [issueLatitude, issueLongitude, citizenLatitude, citizenLongitude];
  if (
    !values.every(
      (value) => typeof value === "number" && Number.isFinite(value),
    ) ||
    typeof issueLatitude !== "number" ||
    typeof issueLongitude !== "number" ||
    typeof citizenLatitude !== "number" ||
    typeof citizenLongitude !== "number" ||
    issueLatitude < -90 ||
    issueLatitude > 90 ||
    citizenLatitude < -90 ||
    citizenLatitude > 90 ||
    issueLongitude < -180 ||
    issueLongitude > 180 ||
    citizenLongitude < -180 ||
    citizenLongitude > 180
  ) {
    return {
      ok: false,
      status: 400,
      error: "Allow GPS access and capture your location at the complaint site to submit a report.",
    };
  }

  if (issueLatitude !== citizenLatitude || issueLongitude !== citizenLongitude) {
    return {
      ok: false,
      status: 400,
      error: "The citizen and complaint-site locations must use the same fresh GPS fix.",
    };
  }
  if (!isWithinChhattisgarh(citizenLatitude, citizenLongitude)) {
    return {
      ok: false,
      status: 422,
      error: "Reports can only be submitted from a GPS location inside Chhattisgarh.",
    };
  }

  return { ok: true, latitude: issueLatitude, longitude: issueLongitude };
}
