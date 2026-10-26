
const ALLOWED_ORIGINS = new Set([
  "https://radhakrishnataxiservice.com",
  "https://www.radhakrishnataxiservice.com"
]);

const VEHICLES = {
  dzire: {
    name: "Swift Dzire",
    rate: 13,
    local4: 1600,
    local8: 2500,
    fullLocal: 3300,
    fullOutstation: 3600,
    extraHour: 275
  },
  etios: {
    name: "Toyota Etios",
    rate: 13,
    local4: 1600,
    local8: 2500,
    fullLocal: 3300,
    fullOutstation: 3600,
    extraHour: 275
  },
  ertiga: {
    name: "Maruti Ertiga",
    rate: 16,
    local4: 3200,
    local8: 4000,
    fullLocal: 4500,
    fullOutstation: 5000,
    extraHour: 350
  },
  innova: {
    name: "Toyota Innova",
    rate: 18,
    local4: null,
    local8: 4500,
    fullLocal: 5000,
    fullOutstation: 5500,
    extraHour: 350
  },
  crysta: {
    name: "Toyota Innova Crysta",
    rate: 20,
    local4: null,
    local8: 5000,
    fullLocal: 6000,
    fullOutstation: 6500,
    extraHour: 500
  },
  tempo: {
    name: "Tempo Traveller",
    rate: null
  }
};

function corsHeaders(origin) {
  const headers = {
    "Vary": "Origin",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
    "X-Content-Type-Options": "nosniff"
  };

  if (ALLOWED_ORIGINS.has(origin)) {
    headers["Access-Control-Allow-Origin"] = origin;
  }

  return headers;
}

function jsonResponse(data, status, origin) {
  return new Response(JSON.stringify(data), {
    status,
    headers: corsHeaders(origin)
  });
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function validText(value, maxLength = 150) {
  return typeof value === "string" &&
    value.trim().length > 0 &&
    value.trim().length <= maxLength;
}

function validMoney(value) {
  return value === undefined ||
    value === null ||
    (Number.isFinite(Number(value)) &&
      Number(value) >= 0 &&
      Number(value) <= 1000000);
}

function validHours(value) {
  return value === undefined ||
    value === null ||
    (Number.isFinite(Number(value)) &&
      Number(value) >= 0 &&
      Number(value) <= 24);
}

async function geocode(place) {
  const url = new URL(
    "https://nominatim.openstreetmap.org/search"
  );

  url.searchParams.set("q", place);
  url.searchParams.set("format", "jsonv2");
  url.searchParams.set("limit", "1");
  url.searchParams.set("countrycodes", "in");

  const response = await fetch(url.toString(), {
    headers: {
      "User-Agent": "RadhakrishnaFareCalculator/1.0 (radhakrishnataxiservice.com)",
      "Accept": "application/json"
    }
  });

  if (!response.ok) {
    throw new Error("Location lookup is temporarily unavailable.");
  }

  const results = await response.json();

  if (!Array.isArray(results) || results.length === 0) {
    throw new Error("We couldn't find one of the locations. Please enter a clearer pickup or destination.");
  }

  return {
    lat: Number(results[0].lat),
    lon: Number(results[0].lon)
  };
}

async function getRoadDistanceKm(pickup, destination) {
  const start = await geocode(pickup);

  // Avoid sending consecutive requests too quickly to Nominatim.
  await sleep(1100);

  const end = await geocode(destination);

  const routeUrl =
    `https://router.project-osrm.org/route/v1/driving/` +
    `${start.lon},${start.lat};${end.lon},${end.lat}` +
    `?overview=false&alternatives=false&steps=false`;

  const response = await fetch(routeUrl);

  if (!response.ok) {
    throw new Error("Road-distance service is temporarily unavailable.");
  }

  const data = await response.json();

  if (
    data.code !== "Ok" ||
    !Array.isArray(data.routes) ||
    !data.routes.length
  ) {
    throw new Error("We couldn't calculate a road route for these locations.");
  }

  return data.routes[0].distance / 1000;
}

function calculateFare(input, vehicle, distanceKm) {
  const isOneWay = input.tripType === "oneway";
  const isOutstation = input.category === "outstation";

  const extraHours = Number(input.extraHours || 0);
  const toll = Number(input.toll || 0);
  const parking = Number(input.parking || 0);

  let fare;
  let totalKm = distanceKm;

  if (isOneWay) {
    // One-way fare is 200% of the base per-kilometre rate.
    fare = distanceKm * vehicle.rate * 2;
  } else {
    // Estimate the return journey as twice the onward distance.
    totalKm = distanceKm * 2;

    if (totalKm > 200) {
      // Above 200 km, charge the rate for all estimated kilometres.
      fare = totalKm * vehicle.rate;
    } else if (totalKm >= 100) {
      // Full-day package for round trips of 100–200 km.
      fare = isOutstation
        ? vehicle.fullOutstation
        : vehicle.fullLocal;
    } else {
      const duration = String(input.duration || "full");

      if (duration === "4") {
        if (vehicle.local4 === null) {
          throw new Error(
            `${vehicle.name} is not available for the 4-hour package. Please select another duration or vehicle.`
          );
        }

        fare = vehicle.local4;
        fare += Math.max(0, totalKm - 40) * vehicle.rate;
      } else if (duration === "8") {
        fare = vehicle.local8;
        fare += Math.max(0, totalKm - 80) * vehicle.rate;
      } else {
        fare = isOutstation
          ? vehicle.fullOutstation
          : vehicle.fullLocal;
      }
    }

    // Extra-hour charges apply when extra hours are requested.
    fare += extraHours * vehicle.extraHour;
  }

  fare += toll + parking;

  const totalFare = Math.ceil(fare);
  const advance = Math.ceil(totalFare * 0.10);
  const balance = totalFare - advance;

  return {
    totalFare,
    advance,
    balance,
    distanceKm: Math.round(totalKm * 10) / 10,
    vehicleName: vehicle.name,
    quotationRequired: false,
    waitingChargeNotice:
      "Waiting charges, if applicable, are not included. Please confirm them with our team.",
    routeNotice: isOneWay
      ? "Distance is an estimate for the onward journey."
      : "Round-trip distance is estimated as twice the onward road distance. Actual routing may differ."
  };
}

export default {
  async fetch(request) {
    const origin = request.headers.get("Origin") || "";

    if (request.method === "OPTIONS") {
      if (origin && !ALLOWED_ORIGINS.has(origin)) {
        return new Response(null, { status: 403 });
      }

      return new Response(null, {
        status: 204,
        headers: corsHeaders(origin)
      });
    }

    if (request.method !== "POST") {
      return jsonResponse(
        { error: "Use POST to request a fare estimate." },
        405,
        origin
      );
    }

    if (origin && !ALLOWED_ORIGINS.has(origin)) {
      return jsonResponse(
        { error: "This website is not allowed to use this service." },
        403,
        origin
      );
    }

    const contentType = request.headers.get("Content-Type") || "";

    if (!contentType.toLowerCase().includes("application/json")) {
      return jsonResponse(
        { error: "Please send the request as JSON." },
        415,
        origin
      );
    }

    try {
      const input = await request.json();

      if (
        !validText(input.pickup, 200) ||
        !validText(input.destination, 200)
      ) {
        return jsonResponse(
          { error: "Enter a valid pickup location and destination." },
          400,
          origin
        );
      }

      if (!["oneway", "roundtrip"].includes(input.tripType)) {
        return jsonResponse(
          { error: "Please select a valid trip type." },
          400,
          origin
        );
      }

      if (!["local", "outstation"].includes(input.category)) {
        return jsonResponse(
          { error: "Please select local or outstation service." },
          400,
          origin
        );
      }

      if (!Object.hasOwn(VEHICLES, input.vehicle)) {
        return jsonResponse(
          { error: "Please select a valid vehicle." },
          400,
          origin
        );
      }

      if (
        !validMoney(input.toll) ||
        !validMoney(input.parking) ||
        !validHours(input.extraHours)
      ) {
        return jsonResponse(
          { error: "Check your toll, parking and extra-hour values." },
          400,
          origin
        );
      }

      const vehicle = VEHICLES[input.vehicle];

      if (input.vehicle === "tempo") {
        return jsonResponse({
          quotationRequired: true,
          vehicleName: vehicle.name,
          message: "Please contact Radhakrishna Taxi Service for a Tempo Traveller quotation."
        }, 200, origin);
      }

      const distanceKm = await getRoadDistanceKm(
        input.pickup.trim(),
        input.destination.trim()
      );

      const result = calculateFare(input, vehicle, distanceKm);

      return jsonResponse(result, 200, origin);

    } catch (error) {
      return jsonResponse(
        {
          error: error instanceof Error
            ? error.message
            : "Unable to calculate the fare right now. Please contact us."
        },
        400,
        origin
      );
    }
  }
};
