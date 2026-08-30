import test from "node:test";
import assert from "node:assert/strict";

test("agent service exposes a listAgents function for reading agent profiles", async () => {
  const agentService = await import("../src/services/agent.service.js");

  assert.equal(typeof agentService.listAgents, "function");
  assert.equal(typeof agentService.getAgentById, "function");
});

test("agent payload normalizes uploaded profile image and documents without blowing up JSON size", async () => {
  const { buildAgentApplicationPayload } = await import("../src/services/agent.service.js");

  const payload = buildAgentApplicationPayload({
    fullName: "Jane Agent",
    email: "jane@example.com",
    password: "secret123",
    profileImage: { originalname: "avatar.png", buffer: Buffer.from("x") },
    documents: [{ originalname: "id.pdf", buffer: Buffer.from("y") }, "proof.pdf"],
  });

  assert.equal(payload.fullName, "Jane Agent");
  assert.equal(payload.profileImage, "avatar.png");
  assert.deepEqual(payload.documents, ["id.pdf", "proof.pdf"]);
});
