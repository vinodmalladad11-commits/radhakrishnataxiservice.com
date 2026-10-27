
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

    const response = await fetch(url.toString(), {
      headers: { Accept: "application/json" }
    });

    if (response.status === 401 || response.status === 403) {
      throw new Error(
        "Geoapify rejected the API key. Check GEOAPIFY_API_KEY."
      );
    }

    if (response.status === 429) {
      throw new Error(
        "The Geoapify request limit was reached. Please try again later."
      );
    }

    if (!response.ok) continue;

    const data = await response.json();
    const results = Array.isArray(data.results) ? data.results : [];

    if (results.length === 0) continue;

    const chosen =
      results.find(result => /karnataka/i.test(result.state || "")) ||
      results[0];

    const lat = Number(chosen.lat);
    const lon = Number(chosen.lon);

    if (!Number.isFinite(lat) || !Number.isFinite(lon)) continue;

    return {
      lat,
      lon,
      displayName: chosen.name || chosen.formatted || original,
      fullAddress: chosen.formatted || original
    };
  }

  throw new Error(
    `Could not find "${original}". Try the correct spelling or add the nearby town or district.`
  );
}


async function getRoadDistanceBetween(start, end, apiKey) {
  if (!apiKey) {
    throw new Error("GEOAPIFY_API_KEY is missing.");
  }

  const coords = [start?.lat, start?.lon, end?.lat, end?.lon];

  if (!coords.every(value => Number.isFinite(Number(value)))) {
    throw new Error("Invalid coordinates received for road-distance calculation.");
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
    headers: { Accept: "application/json" }
  });

  const responseText = await response.text();
  let data;

  try {
    data = JSON.parse(responseText);
  } catch {
    console.error("Geoapify returned non-JSON:", response.status);
    throw new Error("Geoapify returned an invalid response.");
  }

  if (!response.ok) {
    console.error(
      "Geoapify HTTP error:",
      response.status,
      JSON.stringify(data)
    );

    throw new Error(
      `Geoapify routing failed with HTTP ${response.status}.`
    );
  }

  const route = data.results?.[0] || data.features?.[0] || null;

  if (!route) {
    console.error("Geoapify route missing:", JSON.stringify(data));
    throw new Error("Geoapify did not return a driving route.");
  }

  // JSON responses put route fields directly on results[0].
  // GeoJSON responses put them under features[0].properties.
  const properties = route.properties || route;

  let distanceMetres = Number(properties.distance);

  // If the overall route distance is unavailable, total its legs.
  if (!Number.isFinite(distanceMetres) || distanceMetres <= 0) {
    const legs = properties.legs || route.legs;

    if (Array.isArray(legs) && legs.length > 0) {
      const legDistances = legs.map(leg => Number(leg.distance));

      if (
        legDistances.every(
          distance => Number.isFinite(distance) && distance > 0
        )
      ) {
        distanceMetres = legDistances.reduce(
          (total, distance) => total + distance,
          0
        );
      }
    }
  }

  if (!Number.isFinite(distanceMetres) || distanceMetres <= 0) {
    console.error(
      "Geoapify route has no usable distance:",
      JSON.stringify(data)
    );

    throw new Error(
      "Geoapify returned no valid road distance. Check Worker logs."
    );
  }

  // Correctly return kilometres for the fare calculator.
  return distanceMetres / 1000;
}


async function distanceFromMangaloreCentre(place, apiKey) {
  const centre = await geocode(
    "Mangalore, Karnataka, India",
    apiKey
  );

  const point = await geocode(String(place).trim(), apiKey);

  const distance = await getRoadDistanceBetween(
    centre,
    point,
    apiKey
  );

  if (!Number.isFinite(distance) || distance < 0) {
    throw new Error(
      `Could not calculate the road distance from Mangalore to "${place}".`
    );
  }

  return distance;
}

async function isWithinMangaloreLocalLimit(place, apiKey) {
  const distance = await distanceFromMangaloreCentre(place, apiKey);
  return distance <= LOCAL_MAX_DISTANCE_KM;
}

async function validateLocalArea(locations, apiKey) {
  if (!Array.isArray(locations) || locations.length === 0) {
    throw new Error("Please enter a pickup location and destination.");
  }

  const checked = [];

  for (const place of locations) {
    const distance = await distanceFromMangaloreCentre(place, apiKey);

    checked.push({
      location: place,
      distanceFromMangaloreCentreKm: Math.round(distance * 10) / 10
    });

    if (distance > LOCAL_MAX_DISTANCE_KM) {
      throw new Error(
        `"${place}" is approximately ${Math.round(distance * 10) / 10} km by road from Mangalore city centre, outside the ${LOCAL_MAX_DISTANCE_KM} km local limit. Please choose Outstation for this journey.`
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
  const earlyMorningSurcharge = Number(time.split(":")[0]) < 6;
  const dailyBata = chargeableDays * DRIVER_BATA;
  const earlyMorningBata = earlyMorningSurcharge ? DRIVER_BATA : 0;

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
    earlyMorningSurcharge: Boolean(advanceBase.earlyMorningSurcharge),
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
        `${vehicle.name} is not available for the 8-hour package. Please choose another duration or vehicle.`
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
  totalKm,
  destinationWithinLocalLimit
) {
  if (!vehicle.rate || vehicle.rate <= 0) {
    throw new Error(
      "Please select a vehicle with a published per-kilometre rate."
    );
  }

  const isRoundTrip = input.tripType === "roundtrip";

  if (!validDate(input.date) || !validDate(input.dropDate)) {
    throw new Error("Please enter valid pickup and drop dates.");
  }

  if (dateDifferenceDays(input.date, input.dropDate) < 0) {
    throw new Error("Drop date cannot be earlier than pickup date.");
  }

  const days = Math.max(
    1,
    dateDifferenceDays(input.date, input.dropDate) + 1
  );

  const bata = calculateOutstationBata(
    input.date,
    input.dropDate,
    input.time
  );

  let baseFare;
  let roundTripExtra = 0;
  let displayDistanceKm;

  if (isRoundTrip) {
    // Round trip: daily outstation fare + excess kilometres.
    const dailyFare = vehicle.fullOutstation;

    if (!dailyFare || dailyFare <= 0) {
      throw new Error(
        "The selected vehicle does not have a valid daily outstation rate."
      );
    }

    const includedKm = 200 * days;
    const excessKm = Math.max(0, totalKm - includedKm);

    baseFare = dailyFare * days + excessKm * vehicle.rate;

    // Apply 5% once to base fare + driver bata.
    // Toll and parking remain separate.
    roundTripExtra =
      (baseFare + bata.driverBata) * ROUND_TRIP_EXTRA_PERCENT;

    displayDistanceKm = totalKm;
  } else {
    /*
      ONE-WAY PRICING RULES

      Use outward distance x 2 ONLY to choose the fare category.

      Pricing distance 100–200 km:
        Mangalore Local Full Day package.

      Pricing distance under 100 km:
        If destination is within Mangalore's 20 km limit,
        use Local Full Day; otherwise use outward km x rate.

      Pricing distance over 200 km:
        Use actual outward km x rate.
        Do NOT double the chargeable distance.
    */

    const pricingDistanceKm = onwardKm * 2;

    if (
      pricingDistanceKm >= 100 &&
      pricingDistanceKm <= 200
    ) {
      if (!vehicle.fullLocal || vehicle.fullLocal <= 0) {
        throw new Error(
          "The selected vehicle does not have a valid Mangalore Local Full Day rate."
        );
      }

      baseFare = vehicle.fullLocal;
    } else if (
      pricingDistanceKm < 100 &&
      destinationWithinLocalLimit
    ) {
      if (!vehicle.fullLocal || vehicle.fullLocal <= 0) {
        throw new Error(
          "The selected vehicle does not have a valid Mangalore Local Full Day rate."
        );
      }

      baseFare = vehicle.fullLocal;
    } else {
      // Charge actual one-way distance, never doubled distance.
      baseFare = onwardKm * vehicle.rate;
    }

    displayDistanceKm = onwardKm;
  }

  return makeFareResult({
    baseFare,
    driverBata: bata.driverBata,
    toll: Number(input.toll || 0),
    parking: Number(input.parking || 0),
    distanceKm: displayDistanceKm,
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

      if (!["local", "outstation", "airport", "railway"].includes(mode)) {
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

      // Preserve existing airport and railway transfer prices.
      if (mode === "airport" || mode === "railway") {
        return jsonResponse(
          calculateTransfer(input, vehicle, mode),
          200,
          origin
        );
      }

      const locations = validateLocations(input);

      // Local packages retain their existing 20 km validation and prices.
      if (mode === "local") {
        if (!["4", "8", "full"].includes(String(input.duration))) {
          throw new Error("Please select a valid local package duration.");
        }

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

      let routeLocations = [...locations];

      // For one-way journeys where pickup and destination are both
      // outside Mangalore's local limit, route via Mangalore.
      if (input.tripType === "oneway") {
        const pickupWithinLocalLimit =
          await isWithinMangaloreLocalLimit(
            input.pickup,
            env.GEOAPIFY_API_KEY
          );

        const destinationWithinLocalLimit =
          await isWithinMangaloreLocalLimit(
            input.destination,
            env.GEOAPIFY_API_KEY
          );

        if (
          !pickupWithinLocalLimit &&
          !destinationWithinLocalLimit
        ) {
          routeLocations = [
            locations[0],
            ...locations.slice(1, -1),
            "Mangalore, Karnataka, India",
            locations[locations.length - 1]
          ];
        }
      }

      const outwardRoute = await getRoute(
        routeLocations,
        env.GEOAPIFY_API_KEY
      );

      const onwardKm = outwardRoute.onwardKm;

      let returnKm = 0;
      let totalKm = onwardKm;
      let allRouteLegs = [...outwardRoute.legs];

      if (input.tripType === "roundtrip") {
        // Return through the same stops in reverse order.
        const returnRoute = await getRoute(
          [...locations].reverse(),
          env.GEOAPIFY_API_KEY
        );

        returnKm = returnRoute.onwardKm;
        totalKm = onwardKm + returnKm;

        allRouteLegs = [
          ...outwardRoute.legs,
          ...returnRoute.legs
        ];
      }

      const destinationWithinLocalLimit =
        await isWithinMangaloreLocalLimit(
          input.destination,
          env.GEOAPIFY_API_KEY
        );

      const result = calculateOutstationFare(
        input,
        vehicle,
        onwardKm,
        totalKm,
        destinationWithinLocalLimit
      );

      result.returnDistanceKm = Math.round(returnKm * 10) / 10;
      result.stops = locations.slice(1, -1);
      result.routeLegs = allRouteLegs;

      if (input.tripType === "roundtrip") {
        result.routeNotice =
          "Round-trip distance includes the outward and return routes through all stops. The daily outstation rate includes 200 km per chargeable day; excess kilometres are charged at the selected vehicle's per-kilometre rate. A 5% round-trip extra is included. Toll and parking are separate.";
      } else {
        const pricingDistanceKm = onwardKm * 2;

        if (
          pricingDistanceKm >= 100 &&
          pricingDistanceKm <= 200
        ) {
          result.routeNotice =
            `One-way outward distance: ${onwardKm.toFixed(1)} km. Pricing category distance: ${pricingDistanceKm.toFixed(1)} km (outward distance x 2). The Mangalore Local Full Day package applies. Toll and parking are separate.`;
        } else if (pricingDistanceKm < 100 && destinationWithinLocalLimit) {
          result.routeNotice =
            "The destination is within Mangalore's 20 km local limit. The local Full Day price applies. Toll and parking are separate.";
        } else if (pricingDistanceKm > 200) {
          result.routeNotice =
            `One-way outward distance: ${onwardKm.toFixed(1)} km. Pricing category distance: ${pricingDistanceKm.toFixed(1)} km. The fare uses the actual outward distance multiplied by the selected vehicle's per-kilometre rate; the distance is not doubled for charging. Toll and parking are separate.`;
        } else {
          result.routeNotice =
            "The displayed distance is the outward road distance. The fare uses the selected vehicle's per-kilometre rate. Toll and parking are separate.";
        }
      }

      return jsonResponse(result, 200, origin);

    } catch (error) {
      console.error("Fare estimate failed:", {
        message: error instanceof Error ? error.message : String(error)
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
