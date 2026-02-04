import { $ } from "bun";

const ociConfig = await Bun.file("oci-config.json").json();
const { compartmentId } = ociConfig;

const result = await $`oci container-instances container-instance list --auth security_token --compartment-id ${compartmentId} --display-name satisfactory-server --output json`.json() as { data: Array<{ id: string }> };

const INSTANCE_ID = result.data[0]?.id;

if (!INSTANCE_ID) {
  console.error("No container instance found with name 'satisfactory-server'");
  process.exit(1);
}

console.log("Following logs (Ctrl+C to stop)...");
await $`oci container-instances container-instance logs --auth security_token --container-instance-id ${INSTANCE_ID} --follow`;
