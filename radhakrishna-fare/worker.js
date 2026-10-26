
const ALLOWED_ORIGINS = new Set([
  "https://radhakrishnataxiservice.com",
  "https://www.radhakrishnataxiservice.com"
]);

const LOCAL_MAX_DISTANCE_KM = 20;
const DRIVER_BATA = 300;
const EARLY_MORNING_END = 6 * 60;
const ROUND_TRIP_EXTRA_PERCENT = 0.05;

const VEHICLES = {
  dzire: {
    name: "Swift Dzire",
    rate: 16.25,
    local4: 1600,
    local8: 2500,
    fullLocal: 3300,
    fullOutstation: 3600,
    extraHour: 275
  },
  etios: {
    name: "Toyota Etios",
    rate: 16.25,
    local4: 1600,
    local8: 2500,
    fullLocal: 3300,
    fullOutstation: 3600,
    extraHour: 275
  },
  ertiga: {
    name: "Maruti Ertiga",
    rate: 20,
    local4: 3200,
    local8: 4000,
    fullLocal: 4500,
    fullOutstation: 5000,
    extraHour: 350
  },
  innova: {
    name: "Toyota Innova",
    rate: 22.5,
    local4: null,
    local8: 4500,
    fullLocal: 5000,
    fullOutstation: 5500,
    extraHour: 350
  },
  crysta: {
    name: "Toyota Innova Crysta",
    rate: 25,
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

const TRANSFER_FARES = {
  airport: {
    dzire: 600,
    etios: 600,
    ertiga: 1000,
    innova: 1200,
    crysta: 1500,
    tempo: null
  },
  railway: {
    dzire: 500,
    etios: 500,
    ertiga: 700,
    innova: 800,
    crysta: 1000,
    tempo: null
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

function validText(value, maxLength = 180) {
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
  return Number.isFinite(Number(value)) &&
    Number(value) >= 0 &&
    Number(value) <= 24;
}

function validDate(value) {
  return /^\d{4}-\d{2}-\d{2}$/.test(String(value || "")) &&
    !Number.isNaN(Date.parse(value + "T00:00:00Z")) &&
    new Date(value + "T00:00:00Z").toISOString().slice(0, 10) === value;
}

function dateDifferenceDays(startDate, endDate) {
  const start = Date.parse(startDate + "T00:00:00Z");
  const end = Date.parse(endDate + "T00:00:00Z");

  return Math.round((end - start) / 86400000);
}

function validTime(value) {
  return /^([01]\d|2[0-3]):[0-5]\d$/.test(String(value || ""));
}

function validateLocations(input) {
  const stops = Array.isArray(input.stops) ? input.stops : [];

  if (stops.length > 10) {
    throw new Error("You can add a maximum of 10 additional stops.");
  }

  const locations = [
    input.pickup.trim(),
    ...stops.map(stop => {
      if (!validText(stop, 180)) {
        throw new Error("Please enter a valid location for every stop.");
      }

      return stop.trim();
    }),
    input.destination.trim()
  ];

  if (
    new Set(locations.map(location => location.toLowerCase())).size !==
    locations.length
  ) {
    throw new Error(
      "Please remove duplicate locations from your pickup, stops and destination."
    );
  }

  return locations;
}


async function geocode(place, apiKey) {
  if (typeof place !== "string" || !place.trim()) {
    throw new Error("Please enter a valid place name.");
  }

  if (!apiKey) {
    throw new Error(
      "GEOAPIFY_API_KEY is missing from your Cloudflare Worker."
    );
  }

  const original = place.trim().replace(/\s+/g, " ");

  // Try the customer's spelling and then add Karnataka/India context.
  const queries = [
    original,
    `${original}, Karnataka, India`,
    `${original}, India`
  ];

  for (const query of queries) {
    const url = new URL(
      "https://api.geoapify.com/v1/geocode/search"
    );

    url.searchParams.set("text", query);
    url.searchParams.set("format", "json");
    url.searchParams.set("limit", "5");
    url.searchParams.set("filter", "countrycode:in");
    url.searchParams.set("lang", "en");
    url.searchParams.set("apiKey", apiKey);

    try {
      const response = await fetch(url.toString(), {
        headers: { "Accept": "application/json" }
      });

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          throw new Error(
            "Geoapify rejected the API key. Check GEOAPIFY_API_KEY and its API permissions."
          );
        }

        if (response.status === 429) {
          throw new Error(
            "The place-search request limit was reached. Please try again later."
          );
        }

        continue;
      }

      const data = await response.json();
      const results = Array.isArray(data.results)
        ? data.results
        : [];

      if (results.length === 0) continue;

      // Prefer Karnataka when several Indian results match.
      const chosen =
        results.find(result =>
          /karnataka/i.test(result.state || "")
        ) || results[0];

      const lat = Number(chosen.lat);
      const lon = Number(chosen.lon);

      if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
        continue;
      }

      return {
        lat,
        lon,
        displayName: chosen.name || chosen.formatted || original,
        fullAddress: chosen.formatted || original
      };
    } catch (error) {
      if (
        error instanceof Error &&
        (
          error.message.includes("rejected the API key") ||
          error.message.includes("request limit was reached")
        )
      ) {
        throw error;
      }

      // Try the next query variation.
    }
  }

  throw new Error(
    `Could not find "${original}". Try the correct spelling or add the nearby town or district.`
  );
}


async function getRoadDistanceBetween(start, end, apiKey) {
  if (!apiKey) {
    throw new Error(
      "Routing API key is missing. Configure GEOAPIFY_API_KEY in Cloudflare."
    );
  }

  const url = new URL("https://api.geoapify.com/v1/routing");

  url.searchParams.set(
    "waypoints",
    `${start.lat},${start.lon}|${end.lat},${end.lon}`
  );
  url.searchParams.set("mode", "drive");
  url.searchParams.set("format", "json");
  url.searchParams.set("units", "metric");
  url.searchParams.set("apiKey", apiKey);

  const response = await fetch(url.toString(), {
    headers: { "Accept": "application/json" }
  });

  if (!response.ok) {
    if (response.status === 401 || response.status === 403) {
      throw new Error("The routing API rejected the configured API key.");
    }

    if (response.status === 429) {
      throw new Error(
        "The routing service request limit was reached. Try again later."
      );
    }

    throw new Error("The road-distance service is temporarily unavailable.");
  }

  const data = await response.json();
  const distanceKm = Number(data.results?.[0]?.distance) / 1000;

  if (!Number.isFinite(distanceKm) || distanceKm <= 0) {
    throw new Error(
      "No valid driving route was found between two locations."
    );
  }

  return distanceKm;
}

async function getRoute(locations, apiKey) {
  const coordinates = [];

  for (const place of locations) {
    coordinates.push(await geocode(place, apiKey));
  }

  let totalKm = 0;
  const legs = [];

  for (let i = 0; i < coordinates.length - 1; i++) {
    const km = await getRoadDistanceBetween(
      coordinates[i],
      coordinates[i + 1],
      apiKey
    );

    legs.push({
      from: locations[i],
      to: locations[i + 1],
      distanceKm: Math.round(km * 10) / 10
    });

    totalKm += km;
  }

  return {
    coordinates,
    legs,
    onwardKm: totalKm
  };
}

async function validateLocalArea(locations, apiKey) {
  const centre = await geocode(
    "Mangalore, Karnataka, India",
    apiKey
  );
  const checked = [];

  for (const place of locations) {
    const point = await geocode(place, apiKey);
    const distance = await getRoadDistanceBetween(
      centre,
      point,
      apiKey
    );

    checked.push({
      location: place,
      distanceFromMangaloreCentreKm: Math.round(distance * 10) / 10
    });

    if (distance > LOCAL_MAX_DISTANCE_KM) {
      throw new Error(
        `"${place}" is outside the 20 km Mangalore local limit. Please choose Outstation for this journey.`
      );
    }
  }

  return checked;
}

function calculateLocalBata(time, duration, extraHours, waitingHours) {
  const [hours, minutes] = time.split(":").map(Number);

  const packageHours =
    duration === "4" ? 4 :
    duration === "8" ? 8 :
    duration === "full" ? 14 :
    null;

  if (packageHours === null) {
    throw new Error("Please select a valid local package duration.");
  }

  const totalMinutes = Math.ceil(
    (packageHours + extraHours + waitingHours) * 60
  );

  const start = hours * 60 + minutes;
  const end = start + totalMinutes;
  const dayMinutes = 1440;

  let earlyMorningPeriods = 0;
  let lateNightPeriods = 0;

  for (
    let day = Math.floor(start / dayMinutes);
    day <= Math.floor(Math.max(start, end - 1) / dayMinutes);
    day++
  ) {
    const dayStart = day * dayMinutes;

    if (
      Math.max(start, dayStart) <
      Math.min(end, dayStart + EARLY_MORNING_END)
    ) {
      earlyMorningPeriods++;
    }

    if (
      Math.max(start, dayStart + 1260) <
      Math.min(end, dayStart + dayMinutes)
    ) {
      lateNightPeriods++;
    }
  }

  return {
    earlyMorningPeriods,
    lateNightPeriods,
    driverBata:
      (earlyMorningPeriods + lateNightPeriods) * DRIVER_BATA
  };
}

function calculateOutstationBata(date, dropDate, time) {
  const daysApart = dateDifferenceDays(date, dropDate);

  if (daysApart < 0) {
    throw new Error("Drop date cannot be earlier than pickup date.");
  }

  const chargeableDays = daysApart + 1;
  const earlyMorningSurcharge =
    Number(time.split(":")[0]) < 6;

  const dailyBata = chargeableDays * DRIVER_BATA;
  const earlyMorningBata =
    earlyMorningSurcharge ? DRIVER_BATA : 0;

  return {
    chargeableDays,
    earlyMorningSurcharge,
    earlyMorningPeriods: earlyMorningSurcharge ? 1 : 0,
    lateNightPeriods: 0,
    dailyBata,
    earlyMorningBata,
    driverBata: dailyBata + earlyMorningBata
  };
}

function makeFareResult({
  baseFare,
  driverBata,
  toll,
  parking,
  distanceKm,
  onwardDistanceKm,
  vehicle,
  mode,
  advanceBase,
  roundTripExtra = 0
}) {
  const totalFare = Math.ceil(
    baseFare + driverBata + roundTripExtra + toll + parking
  );

  const advance = Math.ceil(totalFare * 0.10);

  return {
    quotationRequired: false,
    mode,
    vehicleName: vehicle.name,
    baseFare: Math.ceil(baseFare),
    roundTripExtra: Math.round(roundTripExtra * 100) / 100,
    driverBata,
    toll,
    parking,
    totalFare,
    advance,
    balance: totalFare - advance,
    distanceKm: Math.round(distanceKm * 10) / 10,
    onwardDistanceKm: Math.round(onwardDistanceKm * 10) / 10,
    earlyMorningPeriods: advanceBase.earlyMorningPeriods || 0,
    lateNightPeriods: advanceBase.lateNightPeriods || 0,
    chargeableDays: advanceBase.chargeableDays || 0,
    earlyMorningSurcharge: Boolean(
      advanceBase.earlyMorningSurcharge
    ),
    routeNotice:
      "This is an estimate. Confirm route, availability and final charges with Radhakrishna Taxi Service."
  };
}

function calculateLocalFare(input, vehicle, routeKm) {
  const duration = String(input.duration);
  let baseFare;

  if (duration === "4") {
    if (vehicle.local4 === null) {
      throw new Error(
        `${vehicle.name} is not available for the 4-hour package. Please choose another duration or vehicle.`
      );
    }

    baseFare = vehicle.local4;
  } else if (duration === "8") {
    if (vehicle.local8 === null) {
      throw new Error(
        `${vehicle.name} is not available for the 8-hour package. Please choose another vehicle.`
      );
    }

    baseFare = vehicle.local8;
  } else if (duration === "full") {
    baseFare = vehicle.fullLocal;
  } else {
    throw new Error("Select a valid local package.");
  }

  baseFare += Number(input.extraHours || 0) * vehicle.extraHour;

  const bata = calculateLocalBata(
    input.time,
    duration,
    Number(input.extraHours || 0),
    Number(input.waitingHours || 0)
  );

  return makeFareResult({
    baseFare,
    driverBata: bata.driverBata,
    toll: Number(input.toll || 0),
    parking: Number(input.parking || 0),
    distanceKm: routeKm,
    onwardDistanceKm: routeKm,
    vehicle,
    mode: "local",
    advanceBase: bata
  });
}

function calculateOutstationFare(
  input,
  vehicle,
  onwardKm,
  totalKm
) {
  if (!vehicle.rate) {
    throw new Error(
      "Please select a vehicle with a published per-kilometre rate."
    );
  }

  if (!vehicle.fullOutstation || vehicle.fullOutstation <= 0) {
    throw new Error(
      "The selected vehicle does not have a valid daily outstation rate."
    );
  }

  const isRoundTrip = input.tripType === "roundtrip";

  const pickupDate = Date.parse(input.date + "T00:00:00Z");
  const dropDate = Date.parse(input.dropDate + "T00:00:00Z");

  if (
    !Number.isFinite(pickupDate) ||
    !Number.isFinite(dropDate) ||
    dropDate < pickupDate
  ) {
    throw new Error("Please enter valid pickup and drop dates.");
  }

  // Count both pickup and drop dates as chargeable days.
  const days = Math.max(
    1,
    Math.round((dropDate - pickupDate) / 86400000) + 1
  );

  // Preserve the existing daily outstation package rate.
  const dailyFare = vehicle.fullOutstation * days;

  // Each chargeable day includes 200 km.
  const includedKm = 200 * days;

  // Use the COMPLETE trip distance, not just the outward distance.
  const excessKm = Math.max(0, totalKm - includedKm);
  const excessKmFare = excessKm * vehicle.rate;

  const baseFare = dailyFare + excessKmFare;

  const bata = calculateOutstationBata(
    input.date,
    input.dropDate,
    input.time
  );

  // Apply the 5% round-trip extra exactly once.
  // As agreed, it applies to the base fare plus driver bata.
  // Tolls and parking are added separately.
  const roundTripExtra = isRoundTrip
    ? (baseFare + bata.driverBata) * ROUND_TRIP_EXTRA_PERCENT
    : 0;

  return makeFareResult({
    baseFare,
    driverBata: bata.driverBata,
    toll: Number(input.toll || 0),
    parking: Number(input.parking || 0),
    distanceKm: totalKm,
    onwardDistanceKm: onwardKm,
    vehicle,
    mode: "outstation",
    advanceBase: bata,
    roundTripExtra
  });
}

function calculateTransfer(input, vehicle, mode) {
  const fare = TRANSFER_FARES[mode]?.[input.vehicle];

  if (fare === null || fare === undefined) {
    return {
      quotationRequired: true,
      mode,
      vehicleName: vehicle.name,
      message:
        "Please contact Radhakrishna Taxi Service for a Tempo Traveller quotation."
    };
  }

  return makeFareResult({
    baseFare: fare,
    driverBata: 0,
    toll: mode === "airport" ? 0 : Number(input.toll || 0),
    parking: Number(input.parking || 0),
    distanceKm: 0,
    onwardDistanceKm: 0,
    vehicle,
    mode,
    advanceBase: {}
  });
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

    if (
      !(request.headers.get("Content-Type") || "")
        .toLowerCase()
        .includes("application/json")
    ) {
      return jsonResponse(
        { error: "Please send the request as JSON." },
        415,
        origin
      );
    }

    try {
      const input = await request.json();
      const mode = input.mode || input.category;

      if (
        !["local", "outstation", "airport", "railway"].includes(mode)
      ) {
        throw new Error(
          "Please select Local, Outstation, Airport or Railway Station service."
        );
      }

      if (
        !validText(input.pickup, 180) ||
        !validText(input.destination, 180)
      ) {
        throw new Error(
          "Enter a valid pickup location and destination."
        );
      }

      if (!Object.hasOwn(VEHICLES, input.vehicle)) {
        throw new Error("Please select a valid vehicle.");
      }

      if (!validDate(input.date) || !validTime(input.time)) {
        throw new Error("Please enter a valid pickup date and time.");
      }

      if (!validMoney(input.toll) || !validMoney(input.parking)) {
        throw new Error(
          "Toll and parking must be valid non-negative amounts."
        );
      }

      if (
        !validHours(input.extraHours || 0) ||
        !validHours(input.waitingHours || 0)
      ) {
        throw new Error(
          "Additional and waiting hours must be between 0 and 24."
        );
      }

      const vehicle = VEHICLES[input.vehicle];

      if (mode === "airport" || mode === "railway") {
        return jsonResponse(
          calculateTransfer(input, vehicle, mode),
          200,
          origin
        );
      }

      if (!["4", "8", "full"].includes(String(input.duration))) {
        throw new Error("Please select a valid package duration.");
      }

      const locations = validateLocations(input);

      if (mode === "local") {
        const areaCheck = await validateLocalArea(
          locations,
          env.GEOAPIFY_API_KEY
        );

        const route = await getRoute(
          locations,
          env.GEOAPIFY_API_KEY
        );

        const result = calculateLocalFare(
          input,
          vehicle,
          route.onwardKm
        );

        result.localAreaCheck = areaCheck;
        result.stops = locations.slice(1, -1);
        result.routeLegs = route.legs;

        return jsonResponse(result, 200, origin);
      }

      if (!["oneway", "roundtrip"].includes(input.tripType)) {
        throw new Error(
          "Please select a valid outstation trip type."
        );
      }

      if (!validDate(input.dropDate)) {
        throw new Error(
          "Please select a valid outstation drop date."
        );
      }

      if (input.dropDate < input.date) {
        throw new Error(
          "Drop date cannot be earlier than pickup date."
        );
      }

      // First calculate the complete outward journey:
      // pickup -> all stops in order -> destination.
      const outwardRoute = await getRoute(
        locations,
        env.GEOAPIFY_API_KEY
      );

      const onwardKm = outwardRoute.onwardKm;
      let returnKm = 0;
      let totalKm = onwardKm;
      let allRouteLegs = [...outwardRoute.legs];

      if (input.tripType === "roundtrip") {
        // Reverse the entire location sequence so return travel
        // includes every stop in reverse order:
        // destination -> last stop -> ... -> first stop -> pickup.
        const returnLocations = [...locations].reverse();

        const returnRoute = await getRoute(
          returnLocations,
          env.GEOAPIFY_API_KEY
        );

        returnKm = returnRoute.onwardKm;

        // Add outward and return distances once each.
        totalKm = onwardKm + returnKm;

        allRouteLegs = [
          ...outwardRoute.legs,
          ...returnRoute.legs
        ];
      }

      // Calculate the fare only AFTER the full distance is known.
      const result = calculateOutstationFare(
        input,
        vehicle,
        onwardKm,
        totalKm
      );

      result.returnDistanceKm =
        Math.round(returnKm * 10) / 10;

      result.stops = locations.slice(1, -1);
      result.routeLegs = allRouteLegs;

      result.routeNotice =
        input.tripType === "roundtrip"
          ? "Round-trip distance includes the complete outward route and the return route through all stops. A 5% round-trip extra is included in the fare."
          : "One-way distance includes the complete outward route through all stops. No return distance or round-trip extra is included.";

      return jsonResponse(result, 200, origin);

    } catch (error) {
      console.error("Fare estimate failed:", {
        message:
          error instanceof Error
            ? error.message
            : String(error)
      });

      return jsonResponse(
        {
          error:
            error instanceof Error
              ? error.message
              : "Unable to calculate the fare right now. Please contact us."
        },
        400,
        origin
      );
    }
  }
};
