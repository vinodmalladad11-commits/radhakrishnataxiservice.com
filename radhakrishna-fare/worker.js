
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
    (
      Number.isFinite(Number(value)) &&
      Number(value) >= 0 &&
      Number(value) <= 1000000
    );
}

function validHours(value) {
  return value === undefined ||
    value === null ||
    (
      Number.isFinite(Number(value)) &&
      Number(value) >= 0 &&
      Number(value) <= 24
    );
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
      "User-Agent":
        "RadhakrishnaFareCalculator/1.0 (radhakrishnataxiservice.com)",
      "Accept": "application/json"
    }
  });

  if (!response.ok) {
    console.error("Geocoding request failed:", {
      place,
      status: response.status,
      statusText: response.statusText
    });

    throw new Error(
      `Location lookup is temporarily unavailable (HTTP ${response.status}).`
    );
  }

  const results = await response.json();

  if (!Array.isArray(results) || results.length === 0) {
    throw new Error(
      "We couldn't find one of the locations. Please enter a clearer pickup or destination."
    );
  }

  const lat = Number(results[0].lat);
  const lon = Number(results[0].lon);

  if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
    throw new Error(
      "The location service returned invalid coordinates. Please try another location name."
    );
  }

  return { lat, lon };
}


async function getRoadDistanceKm(pickup, destination, apiKey) {
  if (!apiKey) {
    throw new Error(
      "Routing API key is missing. Please configure GEOAPIFY_API_KEY in Cloudflare."
    );
  }

  const start = await geocode(pickup);
  await sleep(1100);
  const end = await geocode(destination);

  const url = new URL("https://api.geoapify.com/v1/routing");

  url.searchParams.set(
    "waypoints",
    `${start.lat},${start.lon}|${end.lat},${end.lon}`
  );
  url.searchParams.set("mode", "drive");
  url.searchParams.set("format", "json");
  url.searchParams.set("units", "metric");
  url.searchParams.set("apiKey", apiKey);

  let response;

  try {
    response = await fetch(url.toString(), {
      headers: { "Accept": "application/json" }
    });
  } catch (error) {
    console.error("Geoapify network error:", String(error));
    throw new Error(
      "Unable to connect to the road-distance service. Please try again."
    );
  }

  if (!response.ok) {
    const details = (await response.text()).slice(0, 400);
    console.error("Geoapify request failed:", {
      status: response.status,
      details
    });

    if (response.status === 401 || response.status === 403) {
      throw new Error(
        "The routing service rejected its API key or request. Please check the Geoapify API key and project settings."
      );
    }

    if (response.status === 429) {
      throw new Error(
        "The routing service has reached its request limit. Please try again later."
      );
    }

    throw new Error(
      `Road-distance service unavailable (HTTP ${response.status}). Please try again.`
    );
  }

  const data = await response.json();
  const route = data.results?.[0];
  const distanceKm = Number(route?.distance) / 1000;

  if (!Number.isFinite(distanceKm) || distanceKm <= 0) {
    console.error("Invalid Geoapify route response:", data);
    throw new Error(
      "No valid driving route was found. Please check your pickup and destination."
    );
  }

  return distanceKm;
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
    // Preserve the existing fare calculation rule.
    fare = distanceKm * vehicle.rate * 2;
  } else {
    // Estimate the return journey as twice the outward distance.
    totalKm = distanceKm * 2;

    if (totalKm > 200) {
      fare = totalKm * vehicle.rate;
    } else if (totalKm >= 100) {
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
  async fetch(request, env) {
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
          message:
            "Please contact Radhakrishna Taxi Service for a Tempo Traveller quotation."
        }, 200, origin);
      }

      const distanceKm = await getRoadDistanceKm(
        input.pickup.trim(),
        input.destination.trim(),
        env.GEOAPIFY_API_KEY
        );

      const result = calculateFare(input, vehicle, distanceKm);

      return jsonResponse(result, 200, origin);

    } catch (error) {
      console.error("Fare estimate failed:", {
        message: error instanceof Error
          ? error.message
          : String(error)
      });

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
