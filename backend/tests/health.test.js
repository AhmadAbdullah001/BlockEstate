import test from "node:test";
import assert from "node:assert/strict";
import app from "../src/app.js";

test("health endpoint returns the BlockEstate API status", async () => {
  const server = app.listen(0);
  const { port } = server.address();
  const response = await fetch(`http://127.0.0.1:${port}/api/v1/health`);
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), {
    success: true,
    message: "BlockEstate API is running",
  });
  server.close();
});

test("blank numeric fields are treated as unset instead of zeroes", async () => {
  const { propertySchema } = await import("../src/validators/property.validator.js");
  const result = propertySchema.safeParse({
    title: "Modern 3 bedroom villa",
    description: "Great property",
    propertyType: "House",
    price: 1000,
    currency: "USD",
    address: "61/b new mehdauri Badri awas",
    city: "Prayagraj",
    state: "Uttar Pradesh",
    country: "India",
    pincode: "211004",
    latitude: "",
    longitude: "",
    area: "",
    bedrooms: "",
    bathrooms: "",
    parking: "",
    amenities: [],
    images: ["https://example.com/property.jpg"],
  });

  assert.equal(result.success, true);
  assert.equal(result.data.latitude, undefined);
  assert.equal(result.data.longitude, undefined);
  assert.equal(result.data.area, undefined);
  assert.equal(result.data.bedrooms, undefined);
  assert.equal(result.data.bathrooms, undefined);
  assert.equal(result.data.parking, undefined);
});

test("user and property models support location metadata and geo-aware storage", async () => {
  const User = (await import("../src/models/User.js")).default;
  const Property = (await import("../src/models/Property.js")).default;

  assert.ok(User.schema.path("latitude"));
  assert.ok(User.schema.path("longitude"));
  assert.ok(User.schema.path("location.type"));
  assert.ok(User.schema.path("location.coordinates"));
  assert.ok(Property.schema.path("location.type"));
  assert.ok(Property.schema.path("location.coordinates"));
  assert.equal(Property.schema.path("location.type").enumValues[0], "Point");
});

test("property search builds a valid top-level geo query without nesting $near under $or", async () => {
  const { buildPropertyListFilter, buildLegacyNearbyFilter } = await import("../src/services/property.service.js");
  const filter = buildPropertyListFilter({
    lat: 25.497944,
    lng: 81.8585747,
    radiusKm: 50,
  });
  const legacyFilter = buildLegacyNearbyFilter({
    lat: 25.497944,
    lng: 81.8585747,
    radiusKm: 50,
  });

  assert.equal(filter.listingStatus, "ACTIVE");
  assert.equal(filter.verificationStatus, "VERIFIED");
  assert.ok(filter.location);
  assert.ok(filter.location.$near);
  assert.equal(filter.location.$near.$geometry.coordinates[0], 81.8585747);
  assert.equal(filter.location.$near.$geometry.coordinates[1], 25.497944);
  assert.equal(filter.location.$near.$maxDistance, 50000);
  assert.ok(legacyFilter.latitude.$gte < 25.497944);
  assert.ok(legacyFilter.longitude.$gte < 81.8585747);
});

test("admin properties endpoint exposes all listings with their current status", async () => {
  const { getAdminProperties } = await import("../src/controllers/admin.controller.js");

  assert.equal(typeof getAdminProperties, "function");
  const statusLabel = getAdminProperties.statusLabel;

  assert.equal(statusLabel("ACTIVE"), "Active");
  assert.equal(statusLabel("PENDING_VERIFICATION"), "Pending verification");
  assert.equal(statusLabel("VERIFIED"), "Verified");
  assert.equal(statusLabel("DRAFT"), "Draft");
});

test("admin pending applications route resolves to pending application listing", async () => {
  const adminRouter = (await import("../src/routes/admin.routes.js")).default;
  const applicationsLayer = adminRouter.stack.find((layer) => layer.route && layer.route.path === "/agents/applications");

  assert.ok(applicationsLayer, "pending applications route should exist");
  const handlerNames = applicationsLayer.route.stack.map((entry) => entry.handle?.name).filter(Boolean);
  assert.ok(handlerNames.includes("listPendingAgentApplications"), `Expected pending handler in stack, got ${handlerNames.join(", ")}`);
});

test("property submission moves directly into verification pending instead of lingering on submitted", async () => {
  const { submitProperty } = await import("../src/services/property.service.js");
  const source = Function.prototype.toString.call(submitProperty);

  assert.match(source, /verificationStatus:\s*"VERIFICATION_PENDING"/);
  assert.doesNotMatch(source, /verificationStatus:\s*"SUBMITTED"/);
});

test("agent profiles store submitted details and supporting documents for admin review", async () => {
  const AgentProfile = (await import("../src/models/AgentProfile.js")).default;

  assert.ok(AgentProfile.schema.path("passwordHash"));
  assert.ok(AgentProfile.schema.path("documents"));
  assert.ok(AgentProfile.schema.path("currentProfession"));
  assert.ok(AgentProfile.schema.path("professionalExperience"));
  assert.ok(AgentProfile.schema.path("qualifications"));
  assert.ok(AgentProfile.schema.path("dateOfBirth"));
  assert.ok(AgentProfile.schema.path("postalCode"));
});

test("admin credentials are configured for same-portal admin login", async () => {
  const { isAdminLoginCredentials } = await import("../src/services/auth.service.js");
  const { env } = await import("../src/config/env.js");

  assert.ok(env.adminId);
  assert.ok(env.adminPassword);
  assert.equal(isAdminLoginCredentials(env.adminId, env.adminPassword), true);
  assert.equal(isAdminLoginCredentials(env.adminId, "wrong-password"), false);
});

test("agent dashboard route exists for authenticated agents", async () => {
  const agentRouter = (await import("../src/routes/agent.routes.js")).default;
  const dashboardLayer = agentRouter.stack.find((layer) => layer.route && layer.route.path === "/dashboard");

  assert.ok(dashboardLayer, "dashboard route should exist");
  const handlerNames = dashboardLayer.route.stack.map((entry) => entry.handle?.name).filter(Boolean);
  assert.ok(handlerNames.includes("getAgentDashboard"), `Expected dashboard handler in stack, got ${handlerNames.join(", ")}`);
});

test("agent dashboard creates a profile when an approved agent user exists without one", async () => {
  const { getAgentDashboard } = await import("../src/services/agent.service.js");
  const AgentProfile = (await import("../src/models/AgentProfile.js")).default;
  const User = (await import("../src/models/User.js")).default;
  const Verification = (await import("../src/models/Verification.js")).default;

  const originalFindOne = AgentProfile.findOne;
  const originalUserFindById = User.findById;
  const originalCreate = AgentProfile.create;
  const originalVerificationFind = Verification.find;

  try {
    AgentProfile.findOne = () => ({
      populate: () => ({
        lean: async () => null,
      }),
    });
    User.findById = () => ({
      lean: async () => ({
        _id: "507f1f77bcf86cd799439014",
        name: "Aisha Agent",
        email: "agent@example.com",
        phone: "9999999999",
        passwordHash: "hashed",
        roles: ["AGENT"],
      }),
    });
    AgentProfile.create = async (payload) => ({ ...payload, _id: "507f1f77bcf86cd799439015" });
    Verification.find = () => ({
      sort: () => ({
        limit: () => ({
          lean: async () => [],
        }),
      }),
    });

    const result = await getAgentDashboard("507f1f77bcf86cd799439014");

    assert.ok(result.agent);
    assert.equal(result.agent.fullName, "Aisha Agent");
    assert.equal(result.stats.totalAssignments, 0);
  } finally {
    AgentProfile.findOne = originalFindOne;
    User.findById = originalUserFindById;
    AgentProfile.create = originalCreate;
    Verification.find = originalVerificationFind;
  }
});

test("admin assignment starts the verification pipeline and updates property status", async () => {
  const { assignAdminAgent } = await import("../src/controllers/admin.controller.js");
  const Property = (await import("../src/models/Property.js")).default;
  const AgentProfile = (await import("../src/models/AgentProfile.js")).default;
  const Verification = (await import("../src/models/Verification.js")).default;

  const originalPropertyFindById = Property.findById;
  const originalAgentFindOne = AgentProfile.findOne;
  const originalVerificationFindOneAndUpdate = Verification.findOneAndUpdate;

  let savedProperty = null;
  let verificationPayload = null;

  try {
    Property.findById = async () => ({
      _id: "507f1f77bcf86cd799439011",
      verificationStatus: "VERIFICATION_PENDING",
      listingStatus: "PENDING_VERIFICATION",
      async save() {
        savedProperty = { ...this, saved: true };
        return savedProperty;
      },
    });

    AgentProfile.findOne = async () => ({
      _id: "507f1f77bcf86cd799439012",
      fullName: "Aisha Kumar",
      status: "ACTIVE",
      verificationStatus: "APPROVED",
    });

    Verification.findOneAndUpdate = async (_filter, update, _options) => {
      verificationPayload = update;
      return { _id: "507f1f77bcf86cd799439013", assignedAgent: "507f1f77bcf86cd799439012", overallStatus: "IN_PROGRESS" };
    };

    const req = {
      params: { propertyId: "507f1f77bcf86cd799439011" },
      body: { agentId: "507f1f77bcf86cd799439012" },
    };

    const res = {
      json: (payload) => payload,
    };

    const result = await assignAdminAgent(req, res);

    assert.equal(result.data.verification.overallStatus, "IN_PROGRESS");
    assert.equal(verificationPayload.$set.assignedAgent.toString(), "507f1f77bcf86cd799439012");
    assert.equal(verificationPayload.$set.documentVerification.status, "IN_PROGRESS");
    assert.equal(verificationPayload.$set.physicalInspection.status, "PENDING");
    assert.equal(verificationPayload.$set.overallStatus, "IN_PROGRESS");
  } finally {
    Property.findById = originalPropertyFindById;
    AgentProfile.findOne = originalAgentFindOne;
    Verification.findOneAndUpdate = originalVerificationFindOneAndUpdate;
  }
});
